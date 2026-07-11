"use client";

import { useState } from "react";
import type { Reservation } from "@/lib/types";
import { formatFecha, formatHora, formatUYU } from "@/lib/format";
import StatusBadge from "./StatusBadge";

interface Props {
  reservations: Reservation[];
  /** Muestra los datos del cliente (vista de administración) */
  mostrarCliente?: boolean;
  /** Si se provee, habilita la cancelación de reservas */
  onCancel?: (id: string) => Promise<void>;
}

/** Una reserva puede cancelarse solo con 24 horas o más de anticipación. */
function esCancelable(r: Reservation): boolean {
  if (r.status !== "confirmed") return false;
  const inicio = new Date(`${r.reservation_date}T${r.time_slot}`);
  return inicio.getTime() - Date.now() >= 24 * 60 * 60 * 1000;
}

export default function ReservationsList({
  reservations,
  mostrarCliente = false,
  onCancel,
}: Props) {
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const cancelar = async (id: string) => {
    if (!onCancel) return;
    if (!window.confirm("¿Seguro que querés cancelar esta reserva?")) return;
    setCancelando(id);
    setErrores((prev) => ({ ...prev, [id]: "" }));
    try {
      await onCancel(id);
    } catch (err) {
      setErrores((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : "Error al cancelar",
      }));
    } finally {
      setCancelando(null);
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-500">
        Todavía no hay reservas registradas.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((r) => {
        const cancelable = esCancelable(r);
        const activa = r.status === "confirmed";
        return (
          <div
            key={r.id}
            className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
              activa ? "border-stone-200" : "border-stone-200 opacity-70"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-stone-900">
                    {r.service_type}
                  </p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-sm text-stone-600">
                  {formatFecha(r.reservation_date)} · {formatHora(r.time_slot)}
                </p>
                <p className="mt-0.5 text-sm text-stone-600">
                  Bicicleta: <span className="font-medium">{r.bike_brand}</span>
                </p>
                {mostrarCliente && (
                  <p className="mt-0.5 text-sm text-stone-600">
                    Cliente:{" "}
                    <span className="font-medium">
                      {r.client_name || "Sin nombre"}
                    </span>{" "}
                    ({r.client_email})
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-stone-900">
                  {formatUYU(r.price)}
                </p>
                <p className="text-xs text-stone-500">Precio final (UYU)</p>
              </div>
            </div>

            {onCancel && activa && (
              <div className="mt-4 border-t border-stone-100 pt-3">
                {cancelable ? (
                  <button
                    onClick={() => cancelar(r.id)}
                    disabled={cancelando === r.id}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cancelando === r.id
                      ? "Cancelando…"
                      : "Cancelar reserva"}
                  </button>
                ) : (
                  <p className="text-sm text-stone-500">
                    Esta reserva ya no puede cancelarse: faltan menos de 24
                    horas para el turno.
                  </p>
                )}
                {errores[r.id] && (
                  <p className="mt-2 text-sm text-red-600">{errores[r.id]}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
