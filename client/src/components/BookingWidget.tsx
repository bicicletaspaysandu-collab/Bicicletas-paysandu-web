"use client";

import Cal from "@calcom/embed-react";
import { useState } from "react";
import { MARCAS_REPRESENTADAS, SERVICIOS } from "@/lib/types";
import { formatUYU } from "@/lib/format";

const CAL_LINK =
  process.env.NEXT_PUBLIC_CAL_LINK ?? "bicicletas-paysandu/taller";

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
 * Widget de agendamiento del taller.
 * Cuenta con un selector interactivo de tarjetas de servicios, detección
 * en tiempo real de marcas representadas para descuentos con micro-animaciones,
 * y pre-relleno de campos y ficha técnica de ingreso en Cal.com.
 */
export default function BookingWidget({ email }: { email: string }) {
  const [servicio, setServicio] = useState<string>(SERVICIOS[1].nombre); // Default to Servicio Básico
  const [marca, setMarca] = useState("");
  const [modeloColor, setModeloColor] = useState("");
  const [numeroCuadro, setNumeroCuadro] = useState("");
  const [detallesProblema, setDetallesProblema] = useState("");
  const [mostrarWidget, setMostrarWidget] = useState(false);

  const servicioInfo = SERVICIOS.find((s) => s.nombre === servicio);
  const esRepresentada = MARCAS_REPRESENTADAS.some(
    (m) => m.toLowerCase() === marca.trim().toLowerCase()
  );

  const precioEstimado = servicioInfo
    ? esRepresentada
      ? servicioInfo.precio * 0.9
      : servicioInfo.precio
    : 0;

  if (mostrarWidget) {
    return (
      <div className="animate-fade-in space-y-4">
        {/* Active configuration status banner */}
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
                Precio: <span className="font-bold text-blue-600">{formatUYU(precioEstimado)}</span>
                {esRepresentada && (
                  <span className="ml-1.5 inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                    -10% Marca Oficial
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMostrarWidget(false)}
            className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          >
            ← Cambiar Ficha
          </button>
        </div>

        {/* Embedded Cal.com scheduler */}
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all">
          <Cal
            calLink={CAL_LINK}
            style={{ width: "100%", height: "100%", minHeight: "680px" }}
            config={{
              email,
              theme: "light",
              // Pre-fill answers to match Cal.com slugs in webhook
              responses: {
                "service-type": servicio,
                "service_type": servicio,
                "servicio": servicio,
                "bike-brand": marca || "Genérica",
                "bike_brand": marca || "Genérica",
                "marca": marca || "Genérica",
                "modelo-color": modeloColor || "No especificado",
                "modelo_color": modeloColor || "No especificado",
                "modelo": modeloColor || "No especificado",
                "color": modeloColor || "No especificado",
                "numero-cuadro": numeroCuadro || "No especificado",
                "numero_cuadro": numeroCuadro || "No especificado",
                "cuadro": numeroCuadro || "No especificado",
                "serie": numeroCuadro || "No especificado",
                "frame-number": numeroCuadro || "No especificado",
                "frame_number": numeroCuadro || "No especificado",
                "serial": numeroCuadro || "No especificado",
                "detalles-problema": detallesProblema || "Ninguno",
                "detalles_problema": detallesProblema || "Ninguno",
                "problema": detallesProblema || "Ninguno",
                "falla": detallesProblema || "Ninguno",
                "issues": detallesProblema || "Ninguno",
                "comentario": detallesProblema || "Ninguno",
                "detalles": detallesProblema || "Ninguno"
              }
            }}
          />
        </div>
        <p className="text-center text-xs text-stone-400">
          Al agendar el turno en el calendario, la reserva se registrará en tu historial.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Service Selection Cards */}
      <div>
        <label className="mb-3 block text-sm font-semibold uppercase tracking-wider text-stone-500">
          1. Selecciona el Tipo de Servicio
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          {SERVICIOS.map((s) => {
            const detail = SERVICIO_DETALLES[s.nombre];
            const isSelected = servicio === s.nombre;
            return (
              <button
                key={s.nombre}
                type="button"
                onClick={() => setServicio(s.nombre)}
                className={`group relative flex flex-col rounded-2xl border p-5 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.99] cursor-pointer ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-stone-200 bg-white hover:border-blue-200/60"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{detail?.icono || "⚙️"}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
                    isSelected 
                      ? "bg-blue-100 text-blue-800 animate-pulse" 
                      : "bg-stone-100 text-stone-600 group-hover:bg-stone-200"
                  }`}>
                    {formatUYU(s.precio)}
                  </span>
                </div>
                <h3 className="font-bold text-stone-900 group-hover:text-blue-600 transition-colors duration-300">
                  {s.nombre}
                </h3>
                <p className="mt-1 text-xs text-stone-500 line-clamp-2">
                  {detail?.descripcion}
                </p>
                <ul className="mt-4 space-y-1.5 border-t border-stone-100 pt-3">
                  {detail?.tareas.map((tarea) => (
                    <li key={tarea} className="flex items-start gap-1.5 text-xs text-stone-600">
                      <span className="text-blue-500 mt-0.5 transition-transform duration-300 group-hover:scale-125">•</span>
                      <span>{tarea}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Bike Details and real-time banner */}
      <div className="grid gap-4 md:grid-cols-2 items-start">
        {/* Technical Intake Form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
          <label className="block text-sm font-semibold uppercase tracking-wider text-stone-500">
            2. Ficha Técnica de Ingreso
          </label>
          
          <div>
            <label htmlFor="marca" className="mb-1 block text-xs font-semibold text-stone-600">
              Marca
            </label>
            <input
              id="marca"
              type="text"
              list="marcas"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ej: Trek, Specialized, GT..."
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-stone-900 text-sm outline-none transition-all placeholder:text-stone-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            <datalist id="marcas">
              {MARCAS_REPRESENTADAS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          <div className="grid gap-3 grid-cols-2">
            <div>
              <label htmlFor="modeloColor" className="mb-1 block text-xs font-semibold text-stone-600">
                Modelo / Color
              </label>
              <input
                id="modeloColor"
                type="text"
                value={modeloColor}
                onChange={(e) => setModeloColor(e.target.value)}
                placeholder="Ej. Marlin Azul"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-stone-900 text-sm outline-none transition-all placeholder:text-stone-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <div>
              <label htmlFor="numeroCuadro" className="mb-1 block text-xs font-semibold text-stone-600">
                Nº Serie / Cuadro (Opcional)
              </label>
              <input
                id="numeroCuadro"
                type="text"
                value={numeroCuadro}
                onChange={(e) => setNumeroCuadro(e.target.value)}
                placeholder="Ej. SN12345"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-stone-900 text-sm outline-none transition-all placeholder:text-stone-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="detallesProblema" className="mb-1 block text-xs font-semibold text-stone-600">
              ¿Qué falla o detalle técnico tiene?
            </label>
            <textarea
              id="detallesProblema"
              value={detallesProblema}
              onChange={(e) => setDetallesProblema(e.target.value)}
              placeholder="Ej. Cambios saltan en piñón alto, chirrido en frenos traseros..."
              rows={2}
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-stone-900 text-sm outline-none transition-all placeholder:text-stone-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
            />
          </div>
        </div>

        {/* Dynamic Price Output Panel */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
          <label className="block text-sm font-semibold uppercase tracking-wider text-stone-500">
            Resumen de Presupuesto
          </label>
          <div className="flex items-baseline justify-between">
            <span className="text-stone-600 text-sm">Servicio:</span>
            <span className="font-semibold text-stone-800 text-sm">{servicio}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-stone-600 text-sm">Bicicleta:</span>
            <span className="font-semibold text-stone-800 text-sm">
              {marca.trim() || "Genérica"} {modeloColor.trim() && `(${modeloColor.trim()})`}
            </span>
          </div>
          <div className="flex items-baseline justify-between border-b border-stone-100 pb-3">
            <span className="text-stone-600 text-sm">Ficha Técnica:</span>
            <span className="font-semibold text-stone-800 text-xs truncate max-w-[180px]">
              {numeroCuadro.trim() ? `Nº ${numeroCuadro.trim()}` : "Sin Nº de Serie"}
            </span>
          </div>
          
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-stone-800 font-bold text-base">Precio Estimado:</span>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-600 transition-all duration-300">{formatUYU(precioEstimado)}</span>
              <span className="block text-[10px] text-stone-400">Mano de obra (excluye repuestos)</span>
            </div>
          </div>

          {/* Animated discount banner using clean Tailwind states */}
          <div className={`overflow-hidden rounded-xl transition-all duration-300 ${
            esRepresentada 
              ? "max-h-20 bg-emerald-50 border border-emerald-100 p-3" 
              : "max-h-0 opacity-0"
          }`}>
            <div className="flex gap-2 items-start text-xs text-emerald-800">
              <span className="text-base leading-none">🎉</span>
              <div>
                <p className="font-bold">¡Descuento de Marca Representada!</p>
                <p className="text-[11px] text-emerald-700">Se aplica un 10% de descuento automático en tu servicio.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
        <a
          href={`https://wa.me/59898824860?text=${encodeURIComponent(
            `Hola Bicicletas Paysandú, quisiera consultar turno en el taller:\n- Servicio: ${servicio}\n- Bicicleta: ${marca || "Genérica"} ${modeloColor ? `(${modeloColor})` : ""}\n- Falla/Detalles: ${detallesProblema || "Mantenimiento general"}\n- Presupuesto Estimado: ${formatUYU(precioEstimado)}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto text-center rounded-2xl bg-emerald-600 px-6 py-3.5 font-bold text-white shadow-md transition-all duration-300 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] text-sm"
        >
          💬 Consultar por WhatsApp
        </a>
        <button
          onClick={() => setMostrarWidget(true)}
          className="w-full sm:w-auto rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-md transition-all duration-300 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/25 text-sm cursor-pointer"
        >
          Elegir Fecha y Hora →
        </button>
      </div>
    </div>
  );
}
