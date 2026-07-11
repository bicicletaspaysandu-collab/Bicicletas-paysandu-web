"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

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
    enlaces.push({ href: "/dashboard", label: "Mi panel" });
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
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-stone-800 text-amber-400"
        : "text-stone-300 hover:bg-stone-800 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-stone-900 shadow-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-white"
          onClick={() => setAbierto(false)}
        >
          <span aria-hidden className="text-amber-400">
            🚲
          </span>
          Bicicletas Paysandú
        </Link>

        {/* Navegación de escritorio */}
        <div className="hidden items-center gap-1 md:flex">
          {enlaces.map((e) => (
            <Link key={e.href} href={e.href} className={linkClase(e.href)}>
              {e.label}
            </Link>
          ))}
          {!loading &&
            (user ? (
              <button
                onClick={cerrarSesion}
                className="ml-2 rounded-lg border border-stone-700 px-3 py-2 text-sm font-medium text-stone-300 transition-colors hover:border-stone-500 hover:text-white"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/login"
                className="ml-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-900 transition-colors hover:bg-amber-400"
              >
                Ingresar
              </Link>
            ))}
        </div>

        {/* Botón de menú móvil */}
        <button
          className="rounded-lg p-2 text-stone-300 hover:bg-stone-800 md:hidden"
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
        <div className="border-t border-stone-800 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
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
                  className="mt-1 rounded-lg border border-stone-700 px-3 py-2 text-left text-sm font-medium text-stone-300"
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  className="mt-1 rounded-lg bg-amber-500 px-3 py-2 text-center text-sm font-semibold text-stone-900"
                  onClick={() => setAbierto(false)}
                >
                  Ingresar
                </Link>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
