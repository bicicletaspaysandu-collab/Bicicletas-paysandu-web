import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-stone-900 text-stone-400">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="mb-2 flex items-center gap-2 font-semibold text-white">
            <span aria-hidden className="text-amber-400">
              🚲
            </span>
            Bicicletas Paysandú
          </p>
          <p className="text-sm leading-relaxed">
            Tienda y taller de bicicletas. Venta de productos y servicio
            mecánico profesional en el corazón de Paysandú.
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Horario</p>
          <p className="text-sm leading-relaxed">
            Lunes a viernes: 9:00 – 19:00
            <br />
            Sábados: 9:00 – 13:00
            <br />
            Domingos: cerrado
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Contacto</p>
          <p className="text-sm leading-relaxed">
            18 de Julio 1234, Paysandú, Uruguay
            <br />
            Tel: (+598) 472 12345
          </p>
          <Link
            href="/catalogo"
            className="mt-3 inline-block text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            Ver catálogo →
          </Link>
        </div>
      </div>
      <div className="border-t border-stone-800 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Bicicletas Paysandú. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
