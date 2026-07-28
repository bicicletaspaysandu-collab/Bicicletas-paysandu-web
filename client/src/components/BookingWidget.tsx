"use client";

import { useEffect, useState, useCallback } from "react";
import { MARCAS_REPRESENTADAS, SERVICIOS } from "@/lib/types";
import { formatUYU } from "@/lib/format";
import { apiFetch } from "@/lib/api";
import { getGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar-helper";
import { useAuth } from "@/lib/auth-context";

interface BookingWidgetProps {
  email?: string;
  token?: string | null;
  onBookingSuccess?: () => void;
}

const SERVICIO_DETALLES: Record<string, { icono: string; descripcion: string; tareas: string[] }> = {
  "Ajuste y Regulación": {
    icono: "🔧",
    descripcion: "Mantenimiento preventivo rápido para mantener tu bici segura.",
    tareas: ["Ajuste de frenos delanteros y traseros", "Regulación y calibración de cambios", "Lubricación de transmisión"]
  },
  "Servicio Básico": {
    icono: "🧼",
    descripcion: "Limpieza profunda y puesta a punto general para el uso diario.",
    tareas: ["Limpieza de transmisión y cuadro", "Ajuste de frenos y cambios", "Ajuste de tornillería general"]
  },
  "Engrase General": {
    icono: "⚙️",
    descripcion: "Revisión completa con desarmado total. Ideal para rendimiento óptimo.",
    tareas: ["Desarmado y engrasado de piezas clave", "Limpieza a fondo de componentes", "Ajuste de dirección, caja y masas"]
  }
};

/**
 * Generar fecha predeterminada en formato YYYY-MM-DD (mañana o próximo día hábil)
 */
function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (tomorrow.getDay() === 0) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  return tomorrow.toISOString().split("T")[0];
}

/**
 * Obtener turnos disponibles según el horario oficial del taller:
 * Lunes a viernes: 8:00 – 12:00 / 15:00 – 19:00
 * Sábados: 8:30 – 12:30
 * Domingos: Cerrado
 */
function getSlotsForDate(dateStr: string): { slot: string; label: string; turno: "mañana" | "tarde" }[] {
  if (!dateStr) return [];
  const dt = new Date(`${dateStr}T00:00:00`);
  const day = dt.getDay();

  if (day === 0) {
    return []; // Domingos cerrado
  }

  if (day === 6) {
    // Sábados (8:30 - 12:30)
    return [
      { slot: "08:30:00", label: "08:30 hs", turno: "mañana" },
      { slot: "09:30:00", label: "09:30 hs", turno: "mañana" },
      { slot: "10:30:00", label: "10:30 hs", turno: "mañana" },
      { slot: "11:30:00", label: "11:30 hs", turno: "mañana" }
    ];
  }

  // Lunes a Viernes (8:00 - 12:00 / 15:00 - 19:00)
  return [
    { slot: "08:00:00", label: "08:00 hs", turno: "mañana" },
    { slot: "09:00:00", label: "09:00 hs", turno: "mañana" },
    { slot: "10:00:00", label: "10:00 hs", turno: "mañana" },
    { slot: "11:00:00", label: "11:00 hs", turno: "mañana" },
    { slot: "15:00:00", label: "15:00 hs", turno: "tarde" },
    { slot: "16:00:00", label: "16:00 hs", turno: "tarde" },
    { slot: "17:00:00", label: "17:00 hs", turno: "tarde" },
    { slot: "18:00:00", label: "18:00 hs", turno: "tarde" }
  ];
}

export default function BookingWidget({ email: propEmail, token: propToken, onBookingSuccess }: BookingWidgetProps) {
  const { user, token: authTok, loading: authLoading } = useAuth();
  const token = propToken ?? authTok;
  const email = propEmail ?? user?.email ?? "";

  const [servicio, setServicio] = useState<string>(SERVICIOS[1].nombre); // Default to Servicio Básico
  const [marca, setMarca] = useState("");
  const [modeloColor, setModeloColor] = useState("");
  const [numeroCuadro, setNumeroCuadro] = useState("");
  const [detallesProblema, setDetallesProblema] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errorTelefono, setErrorTelefono] = useState<string | null>(null);

  // Fecha y Horario
  const [fechaReserva, setFechaReserva] = useState<string>(getTomorrowDateString());
  const [horaReserva, setHoraReserva] = useState<string>("");
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState<boolean>(false);

  const [enviandoReserva, setEnviandoReserva] = useState(false);
  const [reservaExitosaData, setReservaExitosaData] = useState<any | null>(null);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

  const [reservaActivaExistente, setReservaActivaExistente] = useState<any | null>(null);
  const [cargandoVerificacion, setCargandoVerificacion] = useState(true);

  // 1. Pre-verificar si el cliente ya tiene una reserva activa ANTES de agendar
  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setCargandoVerificacion(false);
      return;
    }

    apiFetch<any[]>("/api/reservations/my", { token })
      .then((reservas) => {
        if (Array.isArray(reservas)) {
          const activa = reservas.find(
            (r) => r.status !== "cancelled" && r.status !== "entregada"
          );
          if (activa) {
            setReservaActivaExistente(activa);
          } else {
            setReservaActivaExistente(null);
          }
        }
      })
      .catch((err) => {
        console.warn("No se pudo verificar la reserva activa previa:", err);
      })
      .finally(() => setCargandoVerificacion(false));
  }, [token, authLoading]);

  // 2. Cargar turnos ocupados en tiempo real para la fecha seleccionada
  const cargarTurnosOcupados = useCallback((fechaStr: string) => {
    if (!fechaStr) return;
    setCargandoHorarios(true);
    apiFetch<string[]>(`/api/reservations/occupied-slots?date=${fechaStr}`)
      .then((slots) => {
        setOccupiedSlots(Array.isArray(slots) ? slots : []);
      })
      .catch((err) => {
        console.warn("Error al cargar horarios ocupados:", err);
        setOccupiedSlots([]);
      })
      .finally(() => setCargandoHorarios(false));
  }, []);

  useEffect(() => {
    if (fechaReserva) {
      cargarTurnosOcupados(fechaReserva);
    }
  }, [fechaReserva, cargarTurnosOcupados]);

  const esRepresentada = MARCAS_REPRESENTADAS.some(
    (m) => m.toLowerCase() === marca.trim().toLowerCase()
  );

  const handleConfirmarReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSubmit(null);
    setErrorTelefono(null);

    if (!telefono.trim()) {
      setErrorTelefono("El número de teléfono / WhatsApp es obligatorio para agendar.");
      return;
    }

    if (!fechaReserva) {
      setErrorSubmit("Por favor, seleccioná una fecha para tu turno.");
      return;
    }
    if (!horaReserva) {
      setErrorSubmit("Por favor, seleccioná un horario disponible de la lista.");
      return;
    }

    setEnviandoReserva(true);

    try {
      const payload = {
        service_type: servicio,
        bike_brand: marca.trim() || "Genérica",
        bike_details: {
          model_color: modeloColor.trim() || "No especificado",
          serial_number: numeroCuadro.trim() || "No especificado",
          issues: detallesProblema.trim() || "Ninguno",
          phone_number: telefono.trim(),
        },
        reservation_date: fechaReserva,
        time_slot: horaReserva,
        client_name: email ? email.split("@")[0] : "Cliente Taller",
      };

      const nuevaReserva = await apiFetch<any>("/api/reservations", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      });

      setReservaExitosaData(nuevaReserva || payload);
      if (onBookingSuccess) onBookingSuccess();
    } catch (err: any) {
      setErrorSubmit(err?.message || "Ocurrió un error al agendar tu turno.");
    } finally {
      setEnviandoReserva(false);
    }
  };

  // Pantalla de carga al verificar estado
  if (cargandoVerificacion) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold text-stone-500 animate-pulse">
          Verificando disponibilidad de turnos…
        </p>
      </div>
    );
  }

  // Pantalla de bloqueo si ya posee una reserva activa
  if (reservaActivaExistente) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50/90 p-8 text-center shadow-md animate-fade-in space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          🛑
        </div>
        <h3 className="text-2xl font-bold text-stone-900">
          Ya tienes un turno activo en el taller
        </h3>
        <p className="text-sm text-stone-700 max-w-lg mx-auto leading-relaxed">
          Tienes una reserva agendada para el <strong className="text-stone-900">{reservaActivaExistente.reservation_date}</strong> a las <strong className="text-stone-900">{reservaActivaExistente.time_slot?.substring(0, 5)} hs</strong> ({reservaActivaExistente.service_type}).
          <br />
          Cada cliente puede solicitar <strong className="text-amber-900">1 sola reserva activa a la vez</strong>. Debes esperar a que tu bicicleta sea entregada o eliminar la reserva actual antes de agendar un nuevo turno.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <a
            href="/dashboard"
            className="rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-all shadow-md hover:scale-105"
          >
            Ver Mi Reserva Activa en el Panel →
          </a>
        </div>
      </div>
    );
  }

  // Pantalla de Confirmación Exitosa + Botones 1-Click a Calendarios
  if (reservaExitosaData) {
    const calendarEventData = {
      title: `Turno Taller Bicicletas Paysandú - ${reservaExitosaData.service_type || servicio}`,
      description: `Servicio: ${reservaExitosaData.service_type || servicio}\nBicicleta: ${reservaExitosaData.bike_brand || marca}\nContacto: ${telefono}\nUbicación: Av. España 1644, Paysandú`,
      location: "Av. España 1644, 60000 Paysandú, Uruguay",
      date: reservaExitosaData.reservation_date || fechaReserva,
      timeSlot: reservaExitosaData.time_slot || horaReserva,
      durationMinutes: 60,
    };

    const googleUrl = getGoogleCalendarUrl(calendarEventData);

    return (
      <div className="rounded-3xl border border-green-200 bg-white p-8 text-center shadow-md animate-fade-in space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          🎉
        </div>
        <div>
          <h3 className="text-2xl font-bold text-stone-900">¡Turno Agendado Exitosamente!</h3>
          <p className="mt-1 text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Tu reserva fue confirmada para el <strong className="text-stone-900">{reservaExitosaData.reservation_date || fechaReserva}</strong> a las <strong className="text-stone-900">{(reservaExitosaData.time_slot || horaReserva).substring(0, 5)} hs</strong>.
          </p>
        </div>

        {/* Sección de Vincular a mi Calendario (Google / Apple / Outlook) */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 max-w-md mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
            📅 Añadir recordatorio a tu calendario
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-sm cursor-pointer hover:scale-105"
            >
              🔵 Añadir a Google Calendar
            </a>
            <button
              type="button"
              onClick={() => downloadIcsFile(calendarEventData)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 transition-all shadow-sm cursor-pointer hover:scale-105"
            >
              🍏 Apple / Outlook (.ics)
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (onBookingSuccess) onBookingSuccess();
              window.location.reload();
            }}
            className="rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-all shadow-sm cursor-pointer hover:scale-105"
          >
            Ver Mi Reserva en el Panel →
          </button>
        </div>
      </div>
    );
  }

  const slotsInfo = getSlotsForDate(fechaReserva);
  const esDomingo = slotsInfo.length === 0;

  // Formulario Unificado en una sola vista
  return (
    <form onSubmit={handleConfirmarReserva} className="space-y-6 animate-fade-in">
      {errorSubmit && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          ⚠️ {errorSubmit}
        </div>
      )}

      {/* 1. Seleccioná el tipo de servicio */}
      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-stone-400">
          1. Seleccioná el tipo de servicio
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {SERVICIOS.map((s) => {
            const seleccionado = servicio === s.nombre;
            const info = SERVICIO_DETALLES[s.nombre];
            return (
              <button
                type="button"
                key={s.nombre}
                onClick={() => setServicio(s.nombre)}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left cursor-pointer touch-manipulation transition-all duration-300 ${
                  seleccionado
                    ? "border-blue-500 bg-white ring-4 ring-blue-500/10 shadow-md scale-[1.02]"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{info?.icono || "⚙️"}</span>
                    {s.nombre === "Servicio Básico" && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-extrabold text-blue-700 uppercase">
                        Más Popular
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">{s.nombre}</h4>
                  <p className="mt-1 text-[11px] text-stone-500 leading-relaxed">
                    {info?.descripcion}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-stone-400">Presupuesto</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                    A cotizar en taller
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Datos e Historial Técnico de la Bicicleta */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
          2. Datos de Contacto y de la Bicicleta
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Teléfono Obligatorio */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Teléfono / WhatsApp de contacto *
            </label>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => {
                setTelefono(e.target.value);
                if (e.target.value.trim()) setErrorTelefono(null);
              }}
              placeholder="Ej: 099 123 456"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-base sm:text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            {errorTelefono && (
              <p className="mt-1 text-[11px] font-semibold text-red-600 animate-fade-in">
                ⚠️ {errorTelefono}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Marca de la bicicleta
            </label>
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ej: Specialized, Trek, Giant, Scott..."
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-base sm:text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            {esRepresentada && (
              <p className="mt-1 text-[11px] font-semibold text-emerald-600 animate-fade-in">
                ⭐ Marca Oficial: Service con repuestos originales y garantía de taller.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Modelo y Color
            </label>
            <input
              type="text"
              value={modeloColor}
              onChange={(e) => setModeloColor(e.target.value)}
              placeholder="Ej: Rockhopper 29 - Negro Mate"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-base sm:text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Número de Serie del Cuadro
            </label>
            <input
              type="text"
              value={numeroCuadro}
              onChange={(e) => setNumeroCuadro(e.target.value)}
              placeholder="Ej: WSBC601049..."
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-base sm:text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Fallas o Problemas Observados
            </label>
            <input
              type="text"
              value={detallesProblema}
              onChange={(e) => setDetallesProblema(e.target.value)}
              placeholder="Ej: Ruido en la caja de centro, cambio salta"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-base sm:text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. Selección de Fecha y Horario del Turno */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
          3. Fecha y Horario del Turno
        </h3>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Selector de Fecha */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Fecha del turno *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={fechaReserva}
              onChange={(e) => {
                setFechaReserva(e.target.value);
                setHoraReserva("");
              }}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-base sm:text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
            />
            <p className="mt-1 text-[11px] text-stone-500">
              Horario oficial: Lun-Vie (8-12 / 15-19) · Sáb (8:30-12:30)
            </p>
          </div>

          {/* Selector de Horario */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Horario disponible *
            </label>

            {cargandoHorarios ? (
              <div className="p-4 text-center rounded-xl bg-stone-50 border border-stone-200">
                <p className="text-xs text-stone-500 animate-pulse">Verificando turnos libres…</p>
              </div>
            ) : esDomingo ? (
              <div className="p-4 text-center rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                🔒 El taller se encuentra cerrado los domingos. Por favor seleccioná otra fecha.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {slotsInfo.map(({ slot, label }) => {
                  const isOccupied = occupiedSlots.some(
                    (occ) => occ.substring(0, 5) === slot.substring(0, 5)
                  );
                  const isSelected = horaReserva === slot;

                  return (
                    <button
                      type="button"
                      key={slot}
                      disabled={isOccupied}
                      onClick={() => setHoraReserva(slot)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 cursor-pointer touch-manipulation ${
                        isOccupied
                          ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600/30 scale-[1.03]"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:scale-[1.02]"
                      }`}
                    >
                      {label} {isOccupied ? "(Ocupado)" : ""}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Botón único de confirmación */}
        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={enviandoReserva || !horaReserva || esDomingo}
            className="rounded-xl bg-blue-600 px-7 py-3 text-xs font-bold text-white hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {enviandoReserva ? "Confirmando Turno en el Taller…" : "🚀 Confirmar y Agendar Turno en el Taller →"}
          </button>
        </div>
      </div>
    </form>
  );
}
