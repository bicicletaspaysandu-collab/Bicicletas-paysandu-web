"use client";

import Link from "next/link";
import { useState } from "react";
import { SERVICIOS, MARCAS_REPRESENTADAS } from "@/lib/types";
import { formatUYU } from "@/lib/format";

// Detailed descriptions for services on the landing page
const SERVICIO_CARACTERISTICAS: Record<string, string[]> = {
  "Ajuste y Regulación": ["Ajuste de frenos delanteros/traseros", "Regulación precisa de cambios", "Lubricación de transmisión"],
  "Servicio Básico": ["Limpieza completa de cuadro y transmisión", "Ajuste de frenos y cambios", "Alineación de llantas y tornillería"],
  "Engrase General": ["Desarmado completo de componentes clave", "Limpieza química a fondo de piezas", "Engrase de masas, dirección y caja pedalera"]
};

export default function HomePage() {
  // Cursor coordinate tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Price simulator state
  const [selectedService, setSelectedService] = useState<string>(SERVICIOS[1].nombre);
  const [simulatedBrand, setSimulatedBrand] = useState("");

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Pricing calculator logic
  const activeService = SERVICIOS.find((s) => s.nombre === selectedService) || SERVICIOS[1];
  const isBrandRepresented = MARCAS_REPRESENTADAS.some(
    (m) => m.toLowerCase() === simulatedBrand.trim().toLowerCase()
  );
  const simulatedPrice = isBrandRepresented 
    ? activeService.precio * 0.9 
    : activeService.precio;

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-stone-50 overflow-hidden select-none"
    >
      {/* 
        Interactive mouse glow spotlight overlay.
        This radial gradient follows the cursor dynamically.
      */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-60"
        style={{
          background: `radial-gradient(circle 500px at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 158, 11, 0.08), transparent)`
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white py-20 sm:py-28">
        {/* Hero glow overlay */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-40"
          style={{
            background: `radial-gradient(circle 600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 158, 11, 0.18), transparent)`
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400 border border-amber-500/20">
              📍 Tienda y taller en Paysandú
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl text-white">
              Tu bicicleta, en las <span className="text-amber-500">mejores manos</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-stone-300 max-w-lg">
              Vendemos bicicletas de primeras marcas y contamos con un taller mecánico profesional. Reservá tu turno en línea, obtené descuentos exclusivos y pagá al retirar.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="rounded-2xl bg-amber-500 px-8 py-4 font-bold text-stone-900 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:scale-105 active:scale-95"
              >
                Explorar Catálogo
              </Link>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-stone-700 bg-stone-800/40 backdrop-blur-sm px-8 py-4 font-bold text-white transition-all hover:border-stone-500 hover:bg-stone-800/80 active:scale-95"
              >
                Agendar Turno
              </Link>
            </div>
          </div>
          
          {/* Quick Info Badges in Hero */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
            <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
              <span className="text-3xl">⏱️</span>
              <p className="mt-3 text-sm font-semibold text-white">Turno Rápido</p>
              <p className="text-xs text-stone-400">Reserva online en 2 minutos</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
              <span className="text-3xl">🛡️</span>
              <p className="mt-3 text-sm font-semibold text-white">Garantía Oficial</p>
              <p className="text-xs text-stone-400">Taller certificado multi-marca</p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        Taller en Números (Statistics Section)
      */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 -mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl sm:text-4xl font-black text-amber-500">+10.000</p>
            <p className="text-sm font-bold text-stone-800 mt-1">Bicicletas Reparadas</p>
            <p className="text-xs text-stone-500 mt-0.5">Confianza garantizada por ciclistas locales.</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl sm:text-4xl font-black text-amber-500">20+ Años</p>
            <p className="text-sm font-bold text-stone-800 mt-1">De Trayectoria</p>
            <p className="text-xs text-stone-500 mt-0.5">El taller de referencia en Paysandú.</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl sm:text-4xl font-black text-amber-500">4 Marcas</p>
            <p className="text-sm font-bold text-stone-800 mt-1">Representadas</p>
            <p className="text-xs text-stone-500 mt-0.5">Specialized, Trek, Giant y Scott.</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-3xl sm:text-4xl font-black text-amber-500">99.8%</p>
            <p className="text-sm font-bold text-stone-800 mt-1">Clientes Felices</p>
            <p className="text-xs text-stone-500 mt-0.5">Atención personalizada y transparente.</p>
          </div>
        </div>
      </section>

      {/* Services and Price Simulator Grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 grid gap-8 lg:grid-cols-3">
        {/* Services Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-stone-900">
              Nuestros Servicios Técnicos
            </h2>
            <p className="mt-1.5 text-stone-600 text-sm">
              Tarifas base transparentes de mano de obra. Garantía de reparación en cada turno.
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3">
            {SERVICIOS.map((s) => (
              <div
                key={s.nombre}
                className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm hover:border-amber-500 hover:shadow-md transition-all group cursor-default"
              >
                <span className="text-2xl mb-2 block">
                  {s.nombre.includes("Ajuste") ? "🔧" : s.nombre.includes("Básico") ? "🧼" : "⚙️"}
                </span>
                <p className="font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                  {s.nombre}
                </p>
                <p className="mt-3 text-2xl font-black text-stone-900">
                  {formatUYU(s.precio)}
                </p>
                
                <ul className="mt-4 space-y-1 border-t border-stone-100 pt-3 text-[11px] text-stone-500">
                  {(SERVICIO_CARACTERISTICAS[s.nombre] || []).map((t) => (
                    <li key={t} className="flex items-center gap-1">
                      <span className="text-amber-500">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 backdrop-blur-sm">
            <p className="text-sm text-stone-800 leading-relaxed">
              💡 <span className="font-bold text-amber-900">Descuento oficial del 10%:</span> Si traes una bicicleta de marca **Specialized**, **Trek**, **Giant** o **Scott**, reducimos automáticamente el precio final de tu servicio en el taller.
            </p>
          </div>
        </div>

        {/* Dynamic Simulator Widget on Landing Page */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              🧮 Simulador de Tarifas
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Calculá al instante el costo de tu mantenimiento antes de agendar.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                Paso 1: Elige el Servicio
              </label>
              <div className="flex flex-col gap-1.5">
                {SERVICIOS.map((s) => (
                  <button
                    key={s.nombre}
                    type="button"
                    onClick={() => setSelectedService(s.nombre)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedService === s.nombre
                        ? "border-amber-500 bg-amber-50 text-amber-950 font-bold"
                        : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {s.nombre} ({formatUYU(s.precio)})
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="simBrand" className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                Paso 2: Escribe la Marca
              </label>
              <input
                id="simBrand"
                type="text"
                value={simulatedBrand}
                onChange={(e) => setSimulatedBrand(e.target.value)}
                placeholder="Ej. Trek, Specialized, Caloi..."
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 text-xs outline-none transition-all placeholder:text-stone-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
              />
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-stone-700">Precio Estimado:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-600 transition-all">
                  {formatUYU(simulatedPrice)}
                </span>
                {isBrandRepresented && (
                  <span className="block text-[10px] text-green-700 font-bold">10% Descuento Aplicado</span>
                )}
              </div>
            </div>

            <Link
              href="/dashboard"
              className="block w-full text-center rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 py-3 text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              Reservar este turno →
            </Link>
          </div>
        </div>
      </section>

      {/* Hour, Location, and Contact Cards */}
      <section className="relative z-10 bg-stone-900 text-stone-300 py-16 border-t border-stone-800">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              📅 Horario Comercial
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex justify-between border-b border-stone-800 pb-2">
                <span>Lunes a viernes</span>
                <span className="font-semibold text-white">08:00 – 12:00 y 15:00 – 19:00</span>
              </li>
              <li className="flex justify-between border-b border-stone-800 pb-2">
                <span>Sábados</span>
                <span className="font-semibold text-white">08:30 – 12:30</span>
              </li>
              <li className="flex justify-between text-stone-500">
                <span>Domingos</span>
                <span className="font-semibold">Cerrado</span>
              </li>
            </ul>
          </div>
          
          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                📍 Dónde Encontrarnos
              </h3>
              <p className="mt-4 text-sm leading-relaxed">
                18 de Julio 1234, Paysandú, Uruguay.
                <br />
                <span className="text-stone-400">A dos cuadras de la plaza Constitución.</span>
              </p>
            </div>
            <div className="mt-6 border-t border-stone-800 pt-4 flex justify-between items-center text-sm">
              <span>Llamanos:</span>
              <span className="font-semibold text-amber-500">(+598) 472 12345</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Story Panel */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 text-center space-y-6">
        <h2 className="text-3xl font-black tracking-tight text-stone-900">
          Nuestra Historia
        </h2>
        <p className="max-w-3xl mx-auto leading-relaxed text-sm text-stone-600">
          Somos un emprendimiento familiar sanducero con más de **20 años de experiencia** en el mundo del ciclismo. Empezamos como un pequeño taller de barrio y hoy somos orgullosos representantes oficiales de marcas de prestigio como Specialized, Trek, Giant y Scott. Nos apasiona la seguridad y el rendimiento: por eso, cada bicicleta que sale de nuestro taller recibe una revisión de seguridad sin cargo adicional.
        </p>
        <div className="pt-4">
          <Link
            href="/registro"
            className="inline-block rounded-2xl bg-stone-900 px-8 py-4 font-bold text-white transition-all hover:bg-stone-700 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            Registrar mi Cuenta
          </Link>
        </div>
      </section>
    </div>
  );
}
