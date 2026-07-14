import crypto from 'crypto';
import { supabase } from '../supabaseClient.js';

// Configuration for workshop services and prices (in UYU)
const SERVICES = {
  REGULATION: { name: 'Ajuste y Regulación', price: 900 },
  BASIC: { name: 'Servicio Básico', price: 2000 },
  ENGRASE: { name: 'Engrase General', price: 2600 }
};

// Represented brands that qualify for a 10% discount
const REPRESENTED_BRANDS = ['specialized', 'trek', 'giant', 'scott'];

/**
 * Helper to extract fields from Cal.com webhook response questions
 */
const extractBookingField = (responses, searchTerms) => {
  if (!responses) return '';
  for (const key of Object.keys(responses)) {
    const lowerKey = key.toLowerCase();
    const match = searchTerms.some(term => lowerKey.includes(term));
    if (match) {
      const responseVal = responses[key];
      if (typeof responseVal === 'object' && responseVal !== null) {
        return responseVal.value || responseVal.label || '';
      }
      return responseVal || '';
    }
  }
  return '';
};

/**
 * Helper to calculate final service price in UYU
 */
const calculatePrice = (serviceType, bikeBrand) => {
  const service = (serviceType || '').toLowerCase();
  const brand = (bikeBrand || '').toLowerCase().trim();

  let basePrice = SERVICES.REGULATION.price; // Fallback default
  if (service.includes('basico') || service.includes('básico')) {
    basePrice = SERVICES.BASIC.price;
  } else if (service.includes('engrase')) {
    basePrice = SERVICES.ENGRASE.price;
  } else if (service.includes('ajuste') || service.includes('regulacion') || service.includes('regulación')) {
    basePrice = SERVICES.REGULATION.price;
  }

  const isRepresented = REPRESENTED_BRANDS.includes(brand);
  return isRepresented ? basePrice * 0.9 : basePrice;
};

/**
 * Cal.com Webhook Handler (Public Endpoint)
 * Synchronizes bookings from Cal.com to the local Supabase database.
 */
export const handleCalWebhook = async (req, res) => {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  const signature = req.headers['x-cal-signature-256'];

  // Optional signature verification (skipped if CAL_WEBHOOK_SECRET is not configured)
  if (secret && signature) {
    const hmac = crypto.createHmac('sha256', secret);
    const computedSignature = hmac.update(JSON.stringify(req.body)).digest('hex');
    if (computedSignature !== signature) {
      console.warn('Webhook signature mismatch');
      return res.status(401).json({ error: 'Firma de webhook inválida' });
    }
  }

  const { type, payload } = req.body;

  if (!payload) {
    return res.status(400).json({ error: 'Payload del webhook vacío' });
  }

  const bookingId = payload.id;
  const bookingUid = payload.uid;

  try {
    if (type === 'BOOKING_CREATED') {
      const startTime = payload.startTime; // ISO 8601 string
      const attendees = payload.attendees || [];
      const clientEmail = attendees[0]?.email || '';
      const clientName = attendees[0]?.name || '';

      // Extract custom fields from responses
      const responses = payload.responses || {};
      const serviceType = extractBookingField(responses, ['service', 'servicio', 'tipo']) || 'Ajuste y Regulación';
      const bikeBrand = extractBookingField(responses, ['brand', 'marca', 'bicicleta']) || 'Genérica';
      
      const bikeModelColor = extractBookingField(responses, ['modelo', 'color', 'model']);
      const bikeSerial = extractBookingField(responses, ['cuadro', 'serie', 'frame', 'serial']);
      const issues = extractBookingField(responses, ['problema', 'falla', 'issues', 'detalles', 'comentario']);

      const bikeDetails = {
        model_color: bikeModelColor || 'No especificado',
        serial_number: bikeSerial || 'No especificado',
        issues: issues || 'Ninguno'
      };

      // Parse date and time slot
      const reservationDate = startTime.split('T')[0];
      const timeSlot = startTime.split('T')[1].substring(0, 5); // e.g., '09:30'

      // Calculate final price (incorporating represented brand discount)
      const finalPrice = calculatePrice(serviceType, bikeBrand);

      // Attempt to link to a registered client profile by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', clientEmail)
        .maybeSingle();

      const userId = profile ? profile.id : null;

      // Upsert the reservation in database
      const { error } = await supabase
        .from('reservations')
        .upsert({
          user_id: userId,
          cal_booking_id: bookingId,
          cal_booking_uid: bookingUid,
          client_email: clientEmail,
          client_name: clientName,
          service_type: serviceType,
          bike_brand: bikeBrand,
          bike_details: bikeDetails,
          reservation_date: reservationDate,
          time_slot: timeSlot,
          price: finalPrice,
          status: 'confirmed'
        }, { onConflict: 'cal_booking_id' });

      if (error) {
        console.error('Database sync error:', error);
        return res.status(500).json({ error: 'Error al sincronizar la reserva en la base de datos', details: error.message });
      }

      console.log(`Booking ${bookingId} synchronized successfully.`);
      return res.status(200).json({ message: 'Reserva sincronizada exitosamente' });
    }

    if (type === 'BOOKING_CANCELLED') {
      // Find booking and mark as cancelled
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('cal_booking_id', bookingId);

      if (error) {
        console.error('Database cancellation sync error:', error);
        return res.status(500).json({ error: 'Error al cancelar la reserva en la base de datos', details: error.message });
      }

      console.log(`Booking ${bookingId} cancelled successfully in DB.`);
      return res.status(200).json({ message: 'Cancelación sincronizada exitosamente' });
    }

    return res.status(200).json({ message: 'Tipo de evento no procesado' });
  } catch (error) {
    console.error('Webhook process error:', error);
    res.status(500).json({ error: 'Error interno al procesar el webhook' });
  }
};

/**
 * Get reservations for the logged-in client (Client only)
 */
export const getMyReservations = async (req, res) => {
  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', req.user.id)
      .order('reservation_date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: 'No se pudieron obtener las reservas', details: error.message });
    }

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Get all reservations (Admin only)
 */
export const getAllReservations = async (req, res) => {
  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .order('reservation_date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: 'No se pudieron obtener las reservas', details: error.message });
    }

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Cancel a reservation (Client or Admin)
 * Checks for the 24-hour advance policy.
 */
export const cancelReservation = async (req, res) => {
  const { id } = req.params;
  const { status, mechanic_notes } = req.body;

  // Intercept as admin status/notes update if parameters are provided
  if (req.user.role === 'admin' && (status !== undefined || mechanic_notes !== undefined)) {
    const validStatuses = ['confirmed', 'cancelled', 'ingresada', 'en_diagnostico', 'en_trabajo', 'lista_para_retirar', 'entregada'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado de reserva no válido' });
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (mechanic_notes !== undefined) updates.mechanic_notes = mechanic_notes;

    try {
      const { data: updatedReservation, error: updateError } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({ error: 'Error al actualizar el estado de la reserva', details: updateError.message });
      }
      return res.json({ message: 'Reserva actualizada exitosamente por el administrador', reservation: updatedReservation });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno al actualizar la reserva', details: err.message });
    }
  }

  try {
    // 1. Fetch reservation
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(400).json({ error: 'Error al buscar la reserva', details: error.message });
    }
    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // 2. Authorization check: must own the booking or be admin
    if (req.user.role !== 'admin' && req.user.id !== reservation.user_id) {
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta reserva' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'La reserva ya se encuentra cancelada' });
    }

    // 3. Rule check: Cannot cancel if booking is within 24 hours
    const reservationTime = new Date(`${reservation.reservation_date}T${reservation.time_slot}`);
    const timeDiff = reservationTime.getTime() - Date.now();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return res.status(400).json({ error: 'Las reservas solo se pueden cancelar con al menos 24 horas de anticipación' });
    }

    // 4. Cancel on Cal.com via API if credentials exist
    const calApiKey = process.env.CAL_API_KEY;
    const bookingUid = reservation.cal_booking_uid;

    if (calApiKey && bookingUid) {
      try {
        const response = await fetch(`https://api.cal.com/v2/bookings/${bookingUid}/decline`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${calApiKey}`,
            'Content-Type': 'application/json',
            'cal-api-version': '2024-08-13'
          },
          body: JSON.stringify({
            reason: 'Cancelado por el cliente desde el panel web de Bicicletas Paysandú'
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          console.warn('Failed to cancel on Cal.com API:', errData);
        }
      } catch (calError) {
        console.error('Network error calling Cal.com cancel API:', calError);
      }
    }

    // 5. Update status in database
    const { error: updateError } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) {
      return res.status(400).json({ error: 'Error al actualizar el estado de la reserva', details: updateError.message });
    }

    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al cancelar la reserva' });
  }
};

/**
 * Update reservation status and mechanic notes (Admin only)
 */
export const updateReservationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, mechanic_notes } = req.body;

  // Validation
  const validStatuses = ['confirmed', 'cancelled', 'ingresada', 'en_diagnostico', 'en_trabajo', 'lista_para_retirar', 'entregada'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado de reserva no válido' });
  }

  const updates = {};
  if (status !== undefined) updates.status = status;
  if (mechanic_notes !== undefined) updates.mechanic_notes = mechanic_notes;

  try {
    const { data: reservation, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Error al actualizar el estado de la reserva', details: error.message });
    }
    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ message: 'Estado de reserva actualizado exitosamente', reservation });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al actualizar el estado de la reserva', details: error.message });
  }
};
