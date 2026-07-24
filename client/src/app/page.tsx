"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SERVICIOS, MARCAS_REPRESENTADAS } from "@/lib/types";
import { formatUYU } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";

// Hero background slideshow images
const HERO_IMAGES = [
  "/hero_cycling_1.png",
  "/hero_cycling_2.png",
  "/hero_cycling_3.png",
];

// Detailed descriptions for services on the landing page
const SERVICIO_CARACTERISTICAS: Record<string, string[]> = {
  "Ajuste y Regulación": ["Ajuste de frenos delanteros/traseros", "Regulación precisa de cambios", "Lubricación de transmisión"],
  "Servicio Básico": ["Limpieza completa de cuadro y transmisión", "Ajuste de frenos y cambios", "Alineación de llantas y tornillería"],
  "Engrase General": ["Desarmado completo de componentes clave", "Limpieza química a fondo de piezas", "Engrase de masas, dirección y caja pedalera"]
};

export default function HomePage() {
  const { user } = useAuth();
  // Cursor coordinate tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Hero slideshow state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Price simulator state
  const [selectedService, setSelectedService] = useState<string>(SERVICIOS[1].nombre);
  const [simulatedBrand, setSimulatedBrand] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
          background: `radial-gradient(circle 500px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.08), transparent)`
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-950 text-white py-20 sm:py-28">
        {/* Animated Hero Image Slideshow Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {HERO_IMAGES.map((img, index) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={img}
              src={img}
              alt="Ciclismo hero"
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex
                  ? "opacity-100 animate-hero-kenburns"
                  : "opacity-0 pointer-events-none"
              }`}
            />
          ))}
          {/* Lightened, semi-transparent dark gradient overlay so photos are vibrant and clear */}
          <div className="absolute inset-0 bg-stone-950/30 bg-gradient-to-r from-stone-950/70 via-stone-950/40 to-stone-950/20" />
        </div>

        {/* Hero glow overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-25"
          style={{
            background: `radial-gradient(circle 600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.3), transparent)`
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-white.png"
                alt="Logo Bicicletas Paysandú"
                className="h-16 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
              />
              <p className="inline-flex items-center rounded-full bg-blue-600/30 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-300 border border-blue-400/30 backdrop-blur-md shadow-md">
                📍 Tienda y taller en Paysandú
              </p>
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl text-white [text-shadow:_0_2px_12px_rgb(0_0_0_/_80%)]">
              Bicicletas Paysandú — Tu bicicleta, en las <span className="text-blue-400">mejores manos</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-stone-100 max-w-lg [text-shadow:_0_1px_8px_rgb(0_0_0_/_90%)] font-medium">
              Venta de bicicletas de primeras marcas y taller mecánico especializado en Paysandú, Uruguay. Reservá tu turno de service en línea, obtené descuentos exclusivos y pagá al retirar.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:bg-blue-500 hover:scale-105 active:scale-95"
              >
                Explorar Catálogo
              </Link>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/30 bg-stone-950/40 backdrop-blur-md px-8 py-4 font-bold text-white transition-all duration-300 hover:border-blue-400 hover:bg-blue-600/30 hover:scale-105 active:scale-95 shadow-lg"
              >
                Agendar Turno
              </Link>
            </div>
          </div>

          {/* Quick Info Badges in Hero */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
            <div className="rounded-3xl border border-white/20 bg-stone-950/50 p-6 backdrop-blur-md shadow-2xl hover:border-blue-400/50 transition-all duration-300">
              <span className="text-3xl">⏱️</span>
              <p className="mt-3 text-sm font-bold text-white">Turno Rápido</p>
              <p className="text-xs text-stone-200">Reserva online en 2 minutos</p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-stone-950/50 p-6 backdrop-blur-md shadow-2xl hover:border-blue-400/50 transition-all duration-300">
              <span className="text-3xl">🛡️</span>
              <p className="mt-3 text-sm font-bold text-white">Garantía Oficial</p>
              <p className="text-xs text-stone-200">Taller certificado multi-marca</p>
            </div>
          </div>
        </div>

        {/* Slideshow Navigation Indicator Pills */}
        <div className="absolute bottom-4 right-6 z-20 flex gap-2">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer shadow-md ${
                idx === currentImageIndex
                  ? "w-8 bg-blue-500"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ver imagen ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 
        Taller en Números (Statistics Section)
      */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 -mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200/60 transition-all duration-300">
            <p className="text-3xl sm:text-4xl font-black text-blue-600 transition-colors duration-300 group-hover:text-blue-500">+10.000</p>
            <p className="text-sm font-bold text-stone-800 mt-1">Bicicletas Reparadas</p>
            <p className="text-xs text-stone-500 mt-0.5">Confianza garantizada por ciclistas locales.</p>
          </div>
          <div className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200/60 transition-all duration-300">
            <p className="text-3xl sm:text-4xl font-black text-blue-600 transition-colors duration-300 group-hover:text-blue-500">20+ Años</p>
            <p className="text-sm font-bold text-stone-800 mt-1">De Trayectoria</p>
            <p className="text-xs text-stone-500 mt-0.5">El taller de referencia en Paysandú.</p>
          </div>
          <div className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200/60 transition-all duration-300">
            <p className="text-3xl sm:text-4xl font-black text-blue-600 transition-colors duration-300 group-hover:text-blue-500">4 Marcas</p>
            <p className="text-sm font-bold text-stone-800 mt-1">Representadas</p>
            <p className="text-xs text-stone-500 mt-0.5">Specialized, Trek, Giant y Scott.</p>
          </div>
          <div className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200/60 transition-all duration-300">
            <p className="text-3xl sm:text-4xl font-black text-blue-600 transition-colors duration-300 group-hover:text-blue-500">99.8%</p>
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
                className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm hover:border-blue-500/80 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default"
              >
                <span className="text-2xl mb-2 block transition-transform duration-300 group-hover:scale-110">
                  {s.nombre.includes("Ajuste") ? "🔧" : s.nombre.includes("Básico") ? "🧼" : "⚙️"}
                </span>
                <p className="font-bold text-stone-900 group-hover:text-blue-600 transition-colors duration-300">
                  {s.nombre}
                </p>
                <p className="mt-3 text-2xl font-black text-stone-900">
                  {formatUYU(s.precio)}
                </p>

                <ul className="mt-4 space-y-1 border-t border-stone-100 pt-3 text-[11px] text-stone-500">
                  {(SERVICIO_CARACTERISTICAS[s.nombre] || []).map((t) => (
                    <li key={t} className="flex items-center gap-1">
                      <span className="text-blue-500 group-hover:translate-x-0.5 transition-transform">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-5 backdrop-blur-sm">
            <p className="text-sm text-stone-800 leading-relaxed">
              💡 <span className="font-bold text-blue-900">Descuento oficial del 10%:</span> Si traes una bicicleta de marca **Specialized**, **Trek**, **Giant** o **Scott**, reducimos automáticamente el precio final de tu servicio en el taller.
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
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 hover:translate-x-0.5 cursor-pointer ${selectedService === s.nombre
                        ? "border-blue-500 bg-blue-50 text-blue-950 font-bold"
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
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 text-xs outline-none transition-all placeholder:text-stone-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-stone-700">Precio Estimado:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-600 transition-all duration-300">
                  {formatUYU(simulatedPrice)}
                </span>
                {isBrandRepresented && (
                  <span className="block text-[10px] text-green-700 font-bold animate-pulse">10% Descuento Aplicado</span>
                )}
              </div>
            </div>

            <Link
              href="/dashboard"
              className="block w-full text-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-3 text-xs font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Reservar este turno →
            </Link>
          </div>
        </div>
      </section>

      {/* Hour, Location, Storefront and Contact Cards */}
      <section className="relative z-10 bg-stone-950 text-stone-300 py-20 border-t border-stone-800/80">
        <div className="mx-auto max-w-6xl px-4 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
              📍 Visitanos en Paysandú
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Horario Comercial y Ubicación
            </h2>
            <p className="text-stone-400 text-sm">
              Te esperamos en nuestro local céntrico con atención personalizada y estacionamiento exclusivo para bicicletas.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-stretch">
            {/* 1. Horario Comercial Card */}
            <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900 via-stone-900/90 to-stone-950 p-7 shadow-2xl flex flex-col justify-between space-y-6 hover:border-blue-500/30 transition-all duration-300">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 text-2xl border border-blue-500/30">
                      📅
                    </span>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white">
                        Horario Comercial
                      </h3>
                      <p className="text-xs text-stone-400">Atención en tienda y recepción de taller</p>
                    </div>
                  </div>

                  {/* Live Open Status Indicator */}
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Abierto Hoy
                  </span>
                </div>

                {/* Structured Timetable List */}
                <div className="space-y-3">
                  <div className="rounded-2xl bg-stone-950/60 p-3.5 border border-stone-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Lunes a Viernes</span>
                      <span className="text-[11px] text-stone-400">Jornada partida</span>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
                        08:00 – 12:00
                      </span>
                      <span className="ml-1.5 inline-block rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
                        15:00 – 19:00
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-stone-950/60 p-3.5 border border-stone-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Sábados</span>
                      <span className="text-[11px] text-stone-400">Mañana rápida</span>
                    </div>
                    <span className="rounded-lg bg-stone-800 px-3 py-1 text-xs font-bold text-stone-200 border border-stone-700">
                      08:30 – 12:30
                    </span>
                  </div>

                  <div className="rounded-2xl bg-stone-950/60 p-3.5 border border-stone-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-400 block">Domingos</span>
                      <span className="text-[11px] text-stone-500">Descanso del equipo</span>
                    </div>
                    <span className="rounded-lg bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/20">
                      Cerrado
                    </span>
                  </div>
                </div>

                {/* Rich Value-Add Badges inside Card */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-2xl bg-stone-900/80 p-3 border border-stone-800 text-xs">
                    <span className="text-base mb-1 block">⚡ Atencion Express</span>
                    <p className="text-[11px] text-stone-400 leading-tight">Pinchaduras y pequeños ajustes al instante sin turno previo.</p>
                  </div>
                  <div className="rounded-2xl bg-stone-900/80 p-3 border border-stone-800 text-xs">
                    <span className="text-base mb-1 block">🅿️ Biciestacionamiento</span>
                    <p className="text-[11px] text-stone-400 leading-tight">Espacio monitoreado y seguro para dejar tu bici en la puerta.</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods Footer */}
              <div className="border-t border-stone-800 pt-4 flex items-center justify-between text-xs text-stone-400">
                <span>Aceptamos:</span>
                <span className="font-semibold text-stone-200">Efectivo · Tarjetas · Transferencia BROU · MercadoPago</span>
              </div>
            </div>

            {/* 2. Location & Interactive Storefront Card */}
            <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900 via-stone-900/90 to-stone-950 p-7 shadow-2xl flex flex-col justify-between space-y-6 hover:border-blue-500/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 text-2xl border border-blue-500/30">
                      📍
                    </span>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white">
                        Dónde Encontrarnos
                      </h3>
                      <p className="text-xs text-stone-400">Av. España 1644, 60000 Paysandú, Uruguay</p>
                    </div>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Bicicletas+Paysand%C3%BA,+Av.+Espa%C3%B1a+1644,+Paysand%C3%BA,+Uruguay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all hover:scale-105 active:scale-95"
                  >
                    Cómo Llegar ↗
                  </a>
                </div>

                {/* Brand Identity & Location Feature Card */}
                <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-4 border-b border-stone-800/80 pb-4">
                    <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-stone-900/90 border border-stone-700/60 p-2 shadow-lg flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/logo-white.png"
                        alt="Logo Bicicletas Paysandú"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-wide text-white">
                        Bicicletas Paysandú — Local Oficial
                      </p>
                      <p className="text-xs text-blue-400 font-semibold mt-0.5">
                        📍 Av. España 1644, 60000 Paysandú, Uruguay
                      </p>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300">
                    <div className="rounded-xl bg-stone-950/70 p-2.5 border border-stone-800 flex items-center gap-2">
                      <span>🛠️</span>
                      <span>Taller Multimarca Certificado</span>
                    </div>
                    <div className="rounded-xl bg-stone-950/70 p-2.5 border border-stone-800 flex items-center gap-2">
                      <span>🅿️</span>
                      <span>Estacionamiento Seguro</span>
                    </div>
                    <div className="rounded-xl bg-stone-950/70 p-2.5 border border-stone-800 flex items-center gap-2">
                      <span>⚡</span>
                      <span>Atención Express Sin Turno</span>
                    </div>
                    <div className="rounded-xl bg-stone-950/70 p-2.5 border border-stone-800 flex items-center gap-2">
                      <span>🚲</span>
                      <span>Venta e Indumentaria</span>
                    </div>
                  </div>

                  {/* Navigation Shortcuts */}
                  <div className="flex gap-2 pt-1">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Bicicletas+Paysand%C3%BA,+Av.+Espa%C3%B1a+1644,+Paysand%C3%BA,+Uruguay"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-2 text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      🗺️ Abrir Google Maps
                    </a>
                    <a
                      href="https://waze.com/ul?q=Bicicletas%20Paysandu%20Av.%20Espa%C3%B1a%201644%20Paysand%C3%BA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-xl bg-sky-600 hover:bg-sky-500 text-white py-2 text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      🚗 Abrir en Waze
                    </a>
                  </div>
                </div>

                {/* Embedded Map */}
                <div className="overflow-hidden rounded-2xl border border-stone-800 h-36 w-full relative group">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: "contrast(1.05) saturate(1.1)" }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://maps.google.com/maps?q=Bicicletas%20Paysandu,%20Av.%20Espana%201644,%20Paysandu,%20Uruguay&t=&z=17&ie=UTF8&iwloc=&output=embed"
                  />
                </div>
              </div>

              {/* Direct Contact Bar */}
              <div className="border-t border-stone-800 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400">Tel / WhatsApp:</span>
                    <a href="tel:098824860" className="font-bold text-white hover:text-blue-400 transition-colors">
                      098 824 860
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400">Email:</span>
                    <a href="mailto:bicicletaspaysandu@gmail.com" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
                      bicicletaspaysandu@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.instagram.com/bicicletaspaysandu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    📷 Instagram
                  </a>
                  <a
                    href="https://wa.me/59898824860"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-500 transition-all active:scale-95 shadow-sm"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials & Reviews Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-700 border border-amber-500/20">
            ⭐ 4.9/5 Opiniones en Google
          </span>
          <h2 className="text-3xl font-black tracking-tight text-stone-900">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-stone-600 text-sm">
            La opinión de los ciclistas de Paysandú es nuestra mejor carta de presentación.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex text-amber-400 text-sm">★★★★★</div>
            <p className="text-xs leading-relaxed text-stone-700 font-medium">
              “Excelente servicio técnico. Dejé mi Trek Marlin para service básico y regulado de cambios, y me la entregaron impecable al día siguiente. Muy recomendados en Paysandú.”
            </p>
            <div className="border-t border-stone-100 pt-3 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Martín G.</span>
              <span className="text-stone-400 text-[10px]">Ciclista de Montaña</span>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex text-amber-400 text-sm">★★★★★</div>
            <p className="text-xs leading-relaxed text-stone-700 font-medium">
              “Atención super transparente y rápida. El descuento por traer una bicicleta Specialized se aplicó automáticamente en el taller. Da gusto atenderse acá.”
            </p>
            <div className="border-t border-stone-100 pt-3 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Valentina R.</span>
              <span className="text-stone-400 text-[10px]">Cliente Frecuente</span>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex text-amber-400 text-sm">★★★★★</div>
            <p className="text-xs leading-relaxed text-stone-700 font-medium">
              “Compré mi primera bici acá y la atención fue de diez. Me explicaron todo sobre el mantenimiento preventivo y el talle del cuadro antes de llevarla.”
            </p>
            <div className="border-t border-stone-100 pt-3 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Gonzalo S.</span>
              <span className="text-stone-400 text-[10px]">Ciclismo Urbano</span>
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
          {user ? (
            <Link
              href="/dashboard"
              className="inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg hover:shadow-blue-500/20"
            >
              Ir a Mi Panel de Reservas
            </Link>
          ) : (
            <Link
              href="/registro"
              className="inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg hover:shadow-blue-500/20"
            >
              Registrar mi Cuenta
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
