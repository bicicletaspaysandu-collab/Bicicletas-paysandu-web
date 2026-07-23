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

      // Parse date and times in Uruguay timezone (America/Montevideo)
      const startDate = new Date(startTime);
      const optionsDate = { timeZone: 'America/Montevideo', year: 'numeric', month: '2-digit', day: '2-digit' };
      const optionsTime = { timeZone: 'America/Montevideo', hour: '2-digit', minute: '2-digit', hour12: false };

      const formatterDate = new Intl.DateTimeFormat('fr-CA', optionsDate); // outputs YYYY-MM-DD
      const formatterTime = new Intl.DateTimeFormat('en-US', optionsTime);

      const reservationDate = formatterDate.format(startDate);
      const timeSlot = formatterTime.format(startDate);

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
    // 1. Link any reservations that match the user's email but don't have user_id set yet
    if (req.user.email) {
      await supabase
        .from('reservations')
        .update({ user_id: req.user.id })
        .eq('client_email', req.user.email)
        .is('user_id', null);
    }

    // 2. Query reservations that belong to this user (either by user_id or client_email)
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .or(`user_id.eq.${req.user.id},client_email.eq.${req.user.email}`)
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
 * Get all active reservations (Admin only)
 * Filter out delivered/entregada and cancelled reservations so they auto-clear from admin panel.
 */
export const getAllReservations = async (req, res) => {
  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .neq('status', 'entregada')
      .neq('status', 'cancelled')
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
 * Update or Cancel a reservation (Client or Admin)
 * Handles extra repair costs, mechanic notes, completion reasons, and Cal.com synchronization.
 */
export const cancelReservation = async (req, res) => {
  const { id } = req.params;
  const { status, mechanic_notes, extra_charges, extra_charges_reason, completion_note } = req.body;

  try {
    // 1. Fetch current reservation
    const { data: reservation, error: fetchErr } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // 2. Intercept as admin update if admin role or extra fields supplied
    if (req.user.role === 'admin' && (status !== undefined || mechanic_notes !== undefined || extra_charges !== undefined || completion_note !== undefined)) {
      const validStatuses = ['confirmed', 'cancelled', 'ingresada', 'en_diagnostico', 'en_trabajo', 'lista_para_retirar', 'entregada'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Estado de reserva no válido' });
      }

      const updates = {};
      if (status !== undefined) updates.status = status;

      // Update bike_details JSON with extra charges & completion notes
      const existingDetails = reservation.bike_details || {};
      const updatedDetails = {
        ...existingDetails,
        extra_charges: extra_charges !== undefined ? Number(extra_charges) : existingDetails.extra_charges,
        extra_charges_reason: extra_charges_reason !== undefined ? extra_charges_reason : existingDetails.extra_charges_reason,
        completion_note: completion_note !== undefined ? completion_note : existingDetails.completion_note,
      };
      updates.bike_details = updatedDetails;

      if (mechanic_notes !== undefined) {
        updates.mechanic_notes = mechanic_notes;
      } else if (completion_note) {
        updates.mechanic_notes = completion_note;
      }

      // If extra charges added, update total price
      if (extra_charges !== undefined && Number(extra_charges) > 0) {
        const basePrice = Number(reservation.price) || 0;
        const currentExtra = Number(existingDetails.extra_charges) || 0;
        updates.price = basePrice - currentExtra + Number(extra_charges);
      }

      // Sync cancellation/completion to Cal.com API if status is 'entregada' or 'cancelled'
      if ((status === 'entregada' || status === 'cancelled') && reservation.cal_booking_uid) {
        const calApiKey = process.env.CAL_API_KEY;
        if (calApiKey) {
          try {
            await fetch(`https://api.cal.com/v2/bookings/${reservation.cal_booking_uid}/decline`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${calApiKey}`,
                'Content-Type': 'application/json',
                'cal-api-version': '2024-08-13'
              },
              body: JSON.stringify({
                reason: completion_note || (status === 'entregada' ? 'Servicio completado y entregado' : 'Cancelado por administrador')
              })
            });
          } catch (calErr) {
            console.warn('Cal.com sync error:', calErr);
          }
        }
      }

      const { data: updatedReservation, error: updateError } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({ error: 'Error al actualizar la reserva', details: updateError.message });
      }

      return res.json({ message: 'Reserva actualizada exitosamente por el administrador', reservation: updatedReservation });
    }

    // 3. Client Cancellation Check
    if (req.user.role !== 'admin' && req.user.id !== reservation.user_id) {
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta reserva' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'La reserva ya se encuentra cancelada' });
    }

    const reservationTime = new Date(`${reservation.reservation_date}T${reservation.time_slot}`);
    const hoursDiff = (reservationTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return res.status(400).json({ error: 'Las reservas solo se pueden cancelar con al menos 24 horas de anticipación' });
    }

    // Cancel on Cal.com via API
    const calApiKey = process.env.CAL_API_KEY;
    if (calApiKey && reservation.cal_booking_uid) {
      try {
        await fetch(`https://api.cal.com/v2/bookings/${reservation.cal_booking_uid}/decline`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${calApiKey}`,
            'Content-Type': 'application/json',
            'cal-api-version': '2024-08-13'
          },
          body: JSON.stringify({
            reason: 'Cancelado por el cliente desde el panel web'
          })
        });
      } catch (calError) {
        console.error('Network error calling Cal.com cancel API:', calError);
      }
    }

    const { error: updateError } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) {
      return res.status(400).json({ error: 'Error al actualizar el estado de la reserva', details: updateError.message });
    }

    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al procesar la reserva' });
  }
};

/**
 * Get occupied slots for a given date
 */
export const getOccupiedSlots = async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'La fecha es requerida' });
  }

  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('time_slot')
      .eq('reservation_date', date)
      .neq('status', 'cancelled');

    if (error) {
      return res.status(400).json({ error: 'Error al obtener los horarios ocupados', details: error.message });
    }

    const occupied = (reservations || []).map(r => r.time_slot);
    res.json(occupied);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Create or Sync a direct reservation (From Invisible Cal.com Funnel Listener)
 */
export const createDirectReservation = async (req, res) => {
  const {
    service_type,
    bike_brand,
    bike_details,
    reservation_date,
    time_slot,
    client_name,
    cal_booking_id,
    cal_booking_uid
  } = req.body;

  const finalServiceType = service_type || 'Servicio Básico';
  const finalBikeBrand = bike_brand || 'Genérica';
  const finalReservationDate = reservation_date || new Date().toISOString().split('T')[0];
  const finalTimeSlot = time_slot || '10:00:00';
  const clientEmail = req.user ? req.user.email : 'cliente@taller.com';

  const finalPrice = calculatePrice(finalServiceType, finalBikeBrand);
  const numericBookingId = cal_booking_id ? Number(cal_booking_id) : Math.floor(Date.now() % 2000000000);
  const uid = cal_booking_uid || `cal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    // 1. Check if a reservation for this client on the exact same date & time slot already exists
    const { data: existingSlot } = await supabase
      .from('reservations')
      .select('id')
      .eq('reservation_date', finalReservationDate)
      .eq('time_slot', finalTimeSlot)
      .eq('client_email', clientEmail)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (existingSlot) {
      const { data: updatedReservation, error: updateErr } = await supabase
        .from('reservations')
        .update({
          service_type: finalServiceType,
          bike_brand: finalBikeBrand,
          bike_details: bike_details || {},
          price: finalPrice,
          status: 'confirmed'
        })
        .eq('id', existingSlot.id)
        .select()
        .single();

      if (!updateErr && updatedReservation) {
        return res.status(200).json(updatedReservation);
      }
    }

    // 2. Insert or upsert new reservation
    const { data: newReservation, error } = await supabase
      .from('reservations')
      .upsert({
        user_id: req.user ? req.user.id : null,
        cal_booking_id: numericBookingId,
        cal_booking_uid: uid,
        client_email: clientEmail,
        client_name: client_name || (req.user ? req.user.email.split('@')[0] : 'Cliente Taller'),
        service_type: finalServiceType,
        bike_brand: finalBikeBrand,
        bike_details: bike_details || {},
        reservation_date: finalReservationDate,
        time_slot: finalTimeSlot,
        price: finalPrice,
        status: 'confirmed'
      }, { onConflict: 'cal_booking_id' })
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      return res.status(400).json({ error: 'Error al crear la reserva', details: error.message });
    }

    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Internal server error in createDirectReservation:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear la reserva', details: error.message });
  }
};

/**
 * Delete / Cancel a reservation permanently (Admin only)
 * Cancels the booking on Cal.com API and removes/cancels it in Supabase DB.
 */
export const deleteReservation = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch target reservation
    const { data: reservation, error: fetchErr } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // 2. Sync cancellation to Cal.com API if cal_booking_uid exists and CAL_API_KEY is configured
    const calApiKey = process.env.CAL_API_KEY;
    if (calApiKey && reservation.cal_booking_uid) {
      try {
        await fetch(`https://api.cal.com/v2/bookings/${reservation.cal_booking_uid}/decline`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${calApiKey}`,
            'Content-Type': 'application/json',
            'cal-api-version': '2024-08-13'
          },
          body: JSON.stringify({
            reason: 'Eliminado por el administrador del sistema'
          })
        });
        console.log(`Cal.com booking ${reservation.cal_booking_uid} cancelled via API before DB deletion.`);
      } catch (calErr) {
        console.warn('Error cancelando en la API de Cal.com:', calErr);
      }
    }

    // 3. Delete reservation from Supabase DB (or mark status as cancelled)
    const { error: deleteErr } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (deleteErr) {
      console.error('Error borrando reserva de Supabase:', deleteErr);
      await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id);
    }

    return res.json({ message: 'Reserva eliminada exitosamente y cancelada en Cal.com' });
  } catch (error) {
    console.error('Error en deleteReservation:', error);
    res.status(500).json({ error: 'Error interno al eliminar la reserva' });
  }
};


