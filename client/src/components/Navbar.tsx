"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

const enlacesPublicos = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
];

export default function Navbar() {
  const { user, role, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);

  const enlaces = [...enlacesPublicos];
  if (user) {
    enlaces.push({ href: "/dashboard", label: "Mi Panel" });
    if (role === "admin") {
      enlaces.push({ href: "/admin", label: "Administración" });
    }
  }

  const cerrarSesion = () => {
    logout();
    setAbierto(false);
    router.push("/");
  };

  const linkClase = (href: string) =>
    `relative rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition-all duration-300 ${
      pathname === href
        ? "bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm"
        : "text-stone-300 hover:bg-stone-800/80 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-stone-950/85 backdrop-blur-md border-b border-stone-800/80 transition-all duration-300">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-black tracking-tight text-white group"
          onClick={() => setAbierto(false)}
        >
          <div className="relative h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/logo-white.png"
              alt="Logo Bicicletas Paysandú"
              width={36}
              height={36}
              className="h-full w-full object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              priority
            />
          </div>
          <span className="font-heading font-extrabold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
            BICICLETAS <span className="text-blue-500 font-black">PAYSANDÚ</span>
          </span>
        </Link>

        {/* Navegación de escritorio */}
        <div className="hidden items-center gap-1.5 md:flex">
          {enlaces.map((e) => (
            <Link key={e.href} href={e.href} className={linkClase(e.href)}>
              {e.label}
            </Link>
          ))}
          {!loading &&
            (user ? (
              <button
                onClick={cerrarSesion}
                className="ml-3 rounded-xl border border-stone-700/80 bg-stone-900/60 px-3.5 py-2 text-xs font-bold text-stone-300 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 active:scale-95 cursor-pointer"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/login"
                className="ml-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-blue-600/25"
              >
                Ingresar →
              </Link>
            ))}
        </div>

        {/* Botón de menú móvil */}
        <button
          className="rounded-xl p-2 text-stone-300 hover:bg-stone-800/80 md:hidden active:scale-95"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {abierto ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Menú móvil */}
      {abierto && (
        <div className="border-t border-stone-800/80 bg-stone-950/95 backdrop-blur-xl px-4 pb-4 pt-3 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1.5">
            {enlaces.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className={linkClase(e.href)}
                onClick={() => setAbierto(false)}
              >
                {e.label}
              </Link>
            ))}
            {!loading &&
              (user ? (
                <button
                  onClick={cerrarSesion}
                  className="mt-2 rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2.5 text-left text-xs font-bold text-red-400 active:scale-[0.98]"
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  className="mt-2 rounded-xl bg-blue-600 px-3 py-2.5 text-center text-xs font-bold text-white transition-all hover:bg-blue-500 active:scale-[0.98]"
                  onClick={() => setAbierto(false)}
                >
                  Ingresar →
                </Link>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
