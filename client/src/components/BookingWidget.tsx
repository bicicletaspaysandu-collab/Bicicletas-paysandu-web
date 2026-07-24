"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useState, useRef } from "react";
import { MARCAS_REPRESENTADAS, SERVICIOS } from "@/lib/types";
import { formatUYU } from "@/lib/format";
import { apiFetch } from "@/lib/api";

const CAL_LINK =
  process.env.NEXT_PUBLIC_CAL_LINK ?? "rodrigo-navarro-tu5qfn/30min";

interface BookingWidgetProps {
  email: string;
  token?: string | null;
  onBookingSuccess?: () => void;
}

// Detailed descriptions for each service to populate card items
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
 * Widget de agendamiento con Cal.com + Embudo Invisible de Guardado en Base de Datos.
 */
export default function BookingWidget({ email, token, onBookingSuccess }: BookingWidgetProps) {
  const [servicio, setServicio] = useState<string>(SERVICIOS[1].nombre); // Default to Servicio Básico
  const [marca, setMarca] = useState("");
  const [modeloColor, setModeloColor] = useState("");
  const [numeroCuadro, setNumeroCuadro] = useState("");
  const [detallesProblema, setDetallesProblema] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errorTelefono, setErrorTelefono] = useState<string | null>(null);
  const [mostrarWidget, setMostrarWidget] = useState(false);
  const [reservaExitosa, setReservaExitosa] = useState(false);
  const [errorSincronizacion, setErrorSincronizacion] = useState<string | null>(null);

  // Lock ref to prevent double execution from concurrent event listeners
  const procesandoReservaRef = useRef(false);

  // Keep a ref to the latest step 1 form data to prevent stale closure inside event listeners
  const formDataRef = useRef({
    servicio,
    marca,
    modeloColor,
    numeroCuadro,
    detallesProblema,
    telefono,
  });

  useEffect(() => {
    formDataRef.current = {
      servicio,
      marca,
      modeloColor,
      numeroCuadro,
      detallesProblema,
      telefono,
    };
  }, [servicio, marca, modeloColor, numeroCuadro, detallesProblema, telefono]);

  const servicioInfo = SERVICIOS.find((s) => s.nombre === servicio);
  const esRepresentada = MARCAS_REPRESENTADAS.some(
    (m) => m.toLowerCase() === marca.trim().toLowerCase()
  );

  const precioEstimado = servicioInfo
    ? esRepresentada
      ? servicioInfo.precio * 0.9
      : servicioInfo.precio
    : 0;

  // Embudo Invisible: Escuchar el evento de reserva completada en Cal.com
  useEffect(() => {
    let cancelado = false;

    const guardarReservaEnBaseDeDatos = async (details: any) => {
      if (cancelado || procesandoReservaRef.current) return;
      procesandoReservaRef.current = true;
      console.log("🔥 Embudo Invisible Cal.com - Evento capturado:", details);

      try {
        const currentData = formDataRef.current;

        // Extraer fecha y hora del payload de Cal.com
        let fecha = "";
        let hora = "";
        let bookingId = details?.bookingId || details?.id || details?.data?.bookingId || details?.data?.id || Math.floor(Date.now() % 2000000000);
        let bookingUid = details?.uid || details?.data?.uid || `cal_${Date.now()}`;

        const rawDate = details?.startTime || details?.start || details?.date || details?.data?.startTime || details?.data?.start || details?.data?.date;

        if (rawDate) {
          try {
            const dt = new Date(rawDate);
            if (!isNaN(dt.getTime())) {
              fecha = dt.toISOString().split("T")[0];
              const h = String(dt.getHours()).padStart(2, "0");
              const m = String(dt.getMinutes()).padStart(2, "0");
              hora = `${h}:${m}:00`;
            }
          } catch {
            // parsing error fallback
          }
        }

        if (!fecha) {
          const hoy = new Date();
          fecha = hoy.toISOString().split("T")[0];
        }

        if (!hora || hora === "00:00:00") {
          const rawTime = details?.time || details?.time_slot || details?.data?.time;
          if (rawTime) {
            hora = `${String(rawTime).substring(0, 5)}:00`;
          } else {
            hora = "10:00:00";
          }
        }

        const calPhone = details?.responses?.phone || details?.data?.responses?.phone || details?.phone || details?.data?.phone || details?.attendees?.[0]?.phone;
        const phoneToSave = currentData.telefono || calPhone || "";

        const payload = {
          service_type: currentData.servicio || "Servicio Básico",
          bike_brand: currentData.marca || "Genérica",
          bike_details: {
            model_color: currentData.modeloColor || "No especificado",
            serial_number: currentData.numeroCuadro || "No especificado",
            issues: currentData.detallesProblema || "Ninguno",
            phone_number: phoneToSave,
          },
          reservation_date: fecha,
          time_slot: hora,
          client_name: details?.attendees?.[0]?.name || details?.data?.attendees?.[0]?.name || (email ? email.split("@")[0] : "Cliente Taller"),
          cal_booking_id: Number(bookingId) || Math.floor(Date.now() % 2000000000),
          cal_booking_uid: String(bookingUid),
        };

        // Guardar directamente en la base de datos vía Express / Supabase
        await apiFetch("/api/reservations", {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        });

        setReservaExitosa(true);
        if (onBookingSuccess) onBookingSuccess();
      } catch (err: any) {
        console.warn("Aviso en Embudo Invisible:", err);
        const errorMsg = err?.message || "Ocurrió un error al procesar tu reserva.";
        setErrorSincronizacion(errorMsg);
      }
    };

    // 1. Configurar listener oficial mediante la API de Cal.com
    (async () => {
      try {
        const cal = await getCalApi();
        cal("on", {
          action: "bookingSuccessful",
          callback: (e: any) => {
            guardarReservaEnBaseDeDatos(e.detail?.data || e.detail);
          },
        });
      } catch {
        // Ignorar si el script de Cal API tarda en inicializar
      }
    })();

    // 2. Listener secundario de respaldo por window.postMessage (por si el iframe usa postMessage directo)
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (
        data?.type === "CAL:bookingSuccessful" ||
        data?.action === "bookingSuccessful" ||
        data?.type === "bookingSuccessful"
      ) {
        guardarReservaEnBaseDeDatos(data?.data || data);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      cancelado = true;
      window.removeEventListener("message", handleMessage);
    };
  }, [servicio, marca, modeloColor, numeroCuadro, detallesProblema, email, token, onBookingSuccess]);

  if (reservaExitosa) {
    return (
      <div className="rounded-3xl border border-green-200 bg-white p-8 text-center shadow-md animate-fade-in space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          🎉
        </div>
        <h3 className="text-2xl font-bold text-stone-900">¡Reserva Guardada en la Base de Datos!</h3>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Tu agendamiento en Cal.com ha sido capturado por el embudo e ingresado a tu historial de reparaciones y al panel del taller.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              procesandoReservaRef.current = false;
              setReservaExitosa(false);
              setMostrarWidget(false);
            }}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-sm"
          >
            Agendar otro turno
          </button>
        </div>
      </div>
    );
  }

  if (mostrarWidget) {
    return (
      <div className="animate-fade-in space-y-4">
        {/* Banner de estado de la ficha técnica */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-xl">
              {SERVICIO_DETALLES[servicio]?.icono || "🚲"}
            </span>
            <div>
              <p className="text-sm font-semibold text-stone-800">
                {servicio}
              </p>
              <p className="text-xs text-stone-500">
                Bici: <span className="font-medium text-stone-700">{marca || "Genérica"}</span> {modeloColor && `(${modeloColor})`} ·
                Precio estimado: <span className="font-bold text-blue-600">{formatUYU(precioEstimado)}</span>
                {esRepresentada && (
                  <span className="ml-1.5 inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                    -10% Marca Oficial
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              procesandoReservaRef.current = false;
              setMostrarWidget(false);
            }}
            className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          >
            ← Editar Ficha
          </button>
        </div>

        {errorSincronizacion && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {errorSincronizacion}
          </div>
        )}

        {/* Iframe oficial de Cal.com */}
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all">
          <Cal
            calLink={CAL_LINK}
            style={{ width: "100%", height: "100%", minHeight: "680px" }}
            config={{
              email,
              theme: "light",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Paso 1: Ficha de Bicicleta y Servicio */}
      <div className="space-y-6 animate-fade-in">
        <div>
          <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-stone-400">
            1. Seleccioná el tipo de servicio
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {SERVICIOS.map((s) => {
              const seleccionado = servicio === s.nombre;
              const info = SERVICIO_DETALLES[s.nombre];
              return (
                <div
                  key={s.nombre}
                  onClick={() => setServicio(s.nombre)}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all duration-300 ${
                    seleccionado
                      ? "border-blue-500 bg-white ring-4 ring-blue-500/10 shadow-md scale-[1.02]"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div>
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

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-400">Precio base</span>
                    <span className="text-base font-black text-blue-600">
                      {formatUYU(s.precio)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            2. Datos e Historial Técnico de la Bicicleta
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Marca de la bicicleta *
              </label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej: Specialized, Trek, Giant, Scott..."
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              {esRepresentada && (
                <p className="mt-1 text-[11px] font-semibold text-emerald-600 animate-fade-in">
                  ✨ ¡Descuento oficial del 10% aplicado automáticamente!
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
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
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
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

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
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              {errorTelefono && (
                <p className="mt-1 text-[11px] font-semibold text-red-600 animate-fade-in">
                  ⚠️ {errorTelefono}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Fallas o Problemas Observados
              </label>
              <input
                type="text"
                value={detallesProblema}
                onChange={(e) => setDetallesProblema(e.target.value)}
                placeholder="Ej: Ruido en la caja de centro, cambio salta"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!telefono.trim()) {
                  setErrorTelefono("El número de teléfono / WhatsApp es obligatorio para agendar.");
                  return;
                }
                setErrorTelefono(null);
                setMostrarWidget(true);
              }}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/10"
            >
              Continuar al Calendario de Cal.com →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
