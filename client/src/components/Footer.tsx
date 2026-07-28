import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 bg-stone-900 text-stone-400">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <Link href="/" className="mb-3 flex items-center gap-3 font-semibold text-white group">
            <div className="relative h-10 w-10 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo-white.png"
                alt="Logo Bicicletas Paysandú"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-lg font-bold">Bicicletas Paysandú</span>
          </Link>
          <p className="text-sm leading-relaxed mb-4">
            Tienda y taller de bicicletas. Venta de productos y servicio
            mecánico profesional en el corazón de Paysandú.
          </p>
          {/* Social Media Link */}
          <a
            href="https://www.instagram.com/bicicletaspaysandu/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            @bicicletaspaysandu
          </a>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Horario</p>
          <p className="text-sm leading-relaxed">
            Lunes a viernes: 8:00 – 12:00 / 15:00 – 19:00
            <br />
            Sábados: 8:30 – 12:30
            <br />
            Domingos: cerrado
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Contacto Directo</p>
          <ul className="text-sm leading-relaxed space-y-2">
            <li>
              <span className="text-stone-500 block text-xs">Ubicación:</span>
              Av. España 1644, 60000 Paysandú, Uruguay
            </li>
            <li>
              <span className="text-stone-500 block text-xs">Teléfono / WhatsApp:</span>
              <a
                href="tel:098824860"
                className="font-medium text-white hover:text-blue-400 transition-colors"
              >
                098 824 860
              </a>
            </li>
            <li>
              <span className="text-stone-500 block text-xs">Correo Electrónico:</span>
              <a
                href="mailto:bicicletaspaysandu@gmail.com"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                bicicletaspaysandu@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800 py-6 text-center text-xs text-stone-400 space-y-2">
        <p>
          © {new Date().getFullYear()} Bicicletas Paysandú. Todos los derechos reservados.
        </p>
        <p className="text-[11px] text-stone-400">
          💻 Sitio web diseñado y desarrollado por <strong className="text-stone-200">Rodrigo Navarro</strong> · 
          <a href="tel:099223838" className="ml-1.5 text-blue-400 hover:underline">📞 099 223 838</a> · 
          <a href="mailto:rodrigonavarroa0@gmail.com" className="ml-1.5 text-blue-400 hover:underline">✉️ rodrigonavarroa0@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}
