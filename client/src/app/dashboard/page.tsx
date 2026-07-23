"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Reservation } from "@/lib/types";
import BookingWidget from "@/components/BookingWidget";
import ReservationsList from "@/components/ReservationsList";
import RefreshButton from "@/components/RefreshButton";

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [reservas, setReservas] = useState<Reservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const cargarReservas = useCallback(() => {
    if (!token) return;
    apiFetch<Reservation[]>("/api/reservations/my-reservations", { token })
      .then(setReservas)
      .catch((e: Error) => setError(e.message));
  }, [token]);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  const cancelarReserva = async (id: string) => {
    await apiFetch(`/api/reservations/${id}/cancel`, {
      method: "PUT",
      token,
    });
    cargarReservas();
  };

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-stone-500">
        Cargando…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Mi panel
      </h1>
      <p className="mt-1 text-stone-600">
        Sesión iniciada como <span className="font-medium">{user.email}</span>
      </p>

      {/* Agendar turno */}
      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight text-stone-900">
          Agendar turno de taller
        </h2>
        <p className="mb-4 mt-1 text-sm text-stone-600">
          Elegí el servicio y contanos la marca de tu bicicleta. Después
          seleccioná fecha y hora en el calendario.
        </p>
        <BookingWidget email={user.email} token={token} onBookingSuccess={cargarReservas} />
      </section>

      {/* Historial */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            Historial de reservas
          </h2>
          <RefreshButton
            onRefresh={() => {
              setError(null);
              cargarReservas();
            }}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {reservas === null && !error ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-stone-200"
              />
            ))}
          </div>
        ) : (
          <ReservationsList
            reservations={reservas ?? []}
            onCancel={cancelarReserva}
          />
        )}
      </section>
    </div>
  );
}
