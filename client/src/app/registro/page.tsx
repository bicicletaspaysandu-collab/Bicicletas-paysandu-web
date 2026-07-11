"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function RegistroPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAviso(null);

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setEnviando(true);
    try {
      const { autoLogin } = await signup(email, password);
      if (autoLogin) {
        router.push("/dashboard");
      } else {
        setAviso(
          "Cuenta creada exitosamente. Revisá tu correo para confirmar la cuenta y luego iniciá sesión."
        );
        setEnviando(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Crear cuenta
      </h1>
      <p className="mt-1 text-stone-600">
        Registrate para reservar turnos en el taller y ver tu historial.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {aviso && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {aviso}{" "}
            <Link href="/login" className="font-semibold underline">
              Ir a iniciar sesión
            </Link>
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
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
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
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div>
          <label
            htmlFor="confirmar"
            className="mb-1 block text-sm font-medium text-stone-700"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirmar"
            type="password"
            required
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            placeholder="Repetí la contraseña"
          />
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-600 hover:text-amber-500"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
