"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="flex flex-col items-center text-center mb-2">
        <div className="h-20 w-20 rounded-2xl bg-stone-900 border border-stone-800 p-2.5 shadow-xl mb-3 flex items-center justify-center transition-transform hover:scale-105">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-white.png"
            alt="Logo Bicicletas Paysandú"
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Iniciar sesión
        </h1>
        <p className="mt-1 text-stone-600 text-sm">
          Accedé a tu panel para agendar turnos de taller.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-stone-700"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-300"
            placeholder="tu@correo.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-stone-700"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-300"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        ¿No tenés cuenta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}
