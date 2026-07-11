import Link from "next/link";
import { SERVICIOS, MARCAS_REPRESENTADAS } from "@/lib/types";
import { formatUYU } from "@/lib/format";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-stone-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">
            Tienda y taller en Paysandú
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Tu bicicleta, en las mejores manos
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-300">
            Vendemos bicicletas y accesorios de primeras marcas, y contamos con
            un taller mecánico profesional. Reservá tu turno en línea y pagá en
            pesos al retirar.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/catalogo"
              className="rounded-xl bg-amber-500 px-6 py-3 text-center font-semibold text-stone-900 transition-colors hover:bg-amber-400"
            >
              Ver catálogo
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-stone-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:border-stone-400"
            >
              Agendar turno de taller
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios del taller */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
          Servicios del taller
        </h2>
        <p className="mt-1 text-stone-600">
          Tarifas de mano de obra en pesos uruguayos (UYU).
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {SERVICIOS.map((s) => (
            <div
              key={s.nombre}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <p className="font-semibold text-stone-900">{s.nombre}</p>
              <p className="mt-2 text-2xl font-bold text-stone-900">
                {formatUYU(s.precio)}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Precio de mano de obra
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-stone-800">
            <span className="font-semibold">10% de descuento</span> en mano de
            obra para bicicletas de nuestras marcas representadas:{" "}
            {MARCAS_REPRESENTADAS.join(", ")}.
          </p>
        </div>
      </section>

      {/* Horario y ubicación */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 p-6">
            <h2 className="text-xl font-bold tracking-tight text-stone-900">
              Horario de atención
            </h2>
            <ul className="mt-4 space-y-2 text-stone-700">
              <li className="flex justify-between border-b border-stone-100 pb-2">
                <span>Lunes a viernes</span>
                <span className="font-medium">9:00 – 19:00</span>
              </li>
              <li className="flex justify-between border-b border-stone-100 pb-2">
                <span>Sábados</span>
                <span className="font-medium">9:00 – 13:00</span>
              </li>
              <li className="flex justify-between">
                <span>Domingos</span>
                <span className="font-medium">Cerrado</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-stone-200 p-6">
            <h2 className="text-xl font-bold tracking-tight text-stone-900">
              Dónde estamos
            </h2>
            <p className="mt-4 leading-relaxed text-stone-700">
              18 de Julio 1234, Paysandú, Uruguay.
              <br />
              A dos cuadras de la plaza Constitución.
            </p>
            <p className="mt-3 leading-relaxed text-stone-700">
              Tel: (+598) 472 12345
            </p>
          </div>
        </div>
      </section>

      {/* Sobre nosotros */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
          Sobre nosotros
        </h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-stone-700">
          Somos un emprendimiento familiar sanducero con más de 20 años de
          experiencia en el mundo de la bicicleta. Empezamos como un pequeño
          taller de barrio y hoy somos representantes oficiales de marcas
          internacionales como Specialized, Trek, Giant y Scott. Nos apasiona
          que cada cliente salga rodando seguro: por eso cada servicio de
          taller incluye una revisión general sin costo.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed text-stone-700">
          Registrate en nuestra plataforma para agendar turnos de taller en
          línea, consultar tu historial de servicios y enterarte de las
          novedades del catálogo.
        </p>
        <Link
          href="/registro"
          className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-stone-700"
        >
          Crear mi cuenta
        </Link>
      </section>
    </div>
  );
}
