"use client";

import { useState } from "react";
import type { Reservation, ReservationStatus, Role } from "@/lib/types";
import { formatFecha, formatHora, formatUYU } from "@/lib/format";
import StatusBadge from "./StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { getGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar-helper";

interface Props {
  reservations: Reservation[];
  /** Muestra los datos del cliente (vista de administración) */
  mostrarCliente?: boolean;
  /** Si se provee, habilita la cancelación de reservas */
  onCancel?: (id: string) => Promise<void>;
  /** Callback opcional cuando se actualiza el estado (admin) */
  onUpdate?: () => void;
  role?: Role;
  token?: string | null;
}

const TIMELINE_STEPS: { status: ReservationStatus; label: string; icon: string }[] = [
  { status: "confirmed", label: "Confirmada", icon: "📅" },
  { status: "ingresada", label: "En Taller", icon: "🚲" },
  { status: "en_trabajo", label: "En Reparación", icon: "🛠️" },
  { status: "lista_para_retirar", label: "Lista para Retirar", icon: "🎉" }
];

function getTimelineIndex(status: ReservationStatus): number {
  if (status === "cancelled") return -1;
  if (status === "confirmed") return 0;
  if (status === "ingresada" || status === "en_diagnostico") return 1;
  if (status === "en_trabajo") return 2;
  if (status === "lista_para_retirar" || status === "entregada") return 3;
  return 0;
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
  onUpdate,
  role: propRole,
  token: propToken,
}: Props) {
  const { token: authToken, role: authRole } = useAuth();
  const token = propToken ?? authToken;
  const role = propRole ?? authRole;
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<string | null>(null);

  const ejecutarEliminacionAdmin = async (id: string) => {
    setEliminandoId(id);
    setConfirmandoEliminarId(null);
    setErrores((prev) => ({ ...prev, [id]: "" }));
    try {
      await apiFetch(`/api/reservations/${id}`, {
        method: "DELETE",
        token,
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      setErrores((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : "Error al eliminar la reserva",
      }));
    } finally {
      setEliminandoId(null);
    }
  };

  // Admin edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<ReservationStatus>("confirmed");
  const [editNotes, setEditNotes] = useState("");
  const [editBikeBrand, setEditBikeBrand] = useState("");
  const [editModelColor, setEditModelColor] = useState("");
  const [editSerialNumber, setEditSerialNumber] = useState("");
  const [editIssues, setEditIssues] = useState("");

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
        [id]: err instanceof Error ? err.message : "Error al cancelar la reserva",
      }));
    } finally {
      setCancelando(null);
    }
  };

  const iniciarEdicion = (r: Reservation) => {
    setEditingId(r.id);
    setEditStatus(r.status);
    setEditNotes(r.mechanic_notes || "");
    setEditBikeBrand(r.bike_brand || "");
    setEditModelColor(r.bike_details?.model_color || "");
    setEditSerialNumber(r.bike_details?.serial_number || "");
    setEditIssues(r.bike_details?.issues || "");
  };

  const guardarEdicionAdmin = async (id: string) => {
    setGuardandoId(id);
    setErrores((prev) => ({ ...prev, [id]: "" }));
    try {
      await apiFetch(`/api/reservations/${id}/cancel`, {
        method: "PUT",
        token,
        body: JSON.stringify({
          status: editStatus,
          mechanic_notes: editNotes,
          bike_brand: editBikeBrand,
          model_color: editModelColor,
          serial_number: editSerialNumber,
          issues: editIssues,
        }),
      });
      setEditingId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      setErrores((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : "Error al actualizar reserva",
      }));
    } finally {
      setGuardandoId(null);
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
    <div className="space-y-4">
      {reservations.map((r) => {
        const esAdmin = role === "admin" || mostrarCliente;
        const cancelable = esAdmin || esCancelable(r);
        const activa = r.status !== "cancelled" && r.status !== "entregada";
        const currentStepIdx = getTimelineIndex(r.status);
        const isEditing = editingId === r.id;

        const extraCharges = r.bike_details?.extra_charges ?? r.extra_charges ?? 0;
        const extraReason = r.bike_details?.extra_charges_reason ?? r.extra_charges_reason ?? "";
        const completionNote = r.bike_details?.completion_note ?? r.completion_note ?? r.mechanic_notes ?? "";

        return (
          <div
            key={r.id}
            className={`animate-page-fade rounded-2xl border bg-white p-5 shadow-sm space-y-4 transition-all ${
              activa ? "border-stone-200" : "border-stone-200 opacity-80 bg-stone-50/50"
            }`}
          >
            {/* 1. Header Information */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-stone-900">
                    {r.service_type}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-stone-500">
                  {formatFecha(r.reservation_date)} · {formatHora(r.time_slot)}
                </p>
                <p className="text-xs text-stone-600">
                  Bicicleta: <span className="font-semibold text-stone-800">{r.bike_brand}</span>
                </p>
                {(() => {
                  const phoneVal = r.bike_details?.phone_number || r.phone_number;
                  const hasValidPhone = Boolean(phoneVal && phoneVal.trim() !== "" && phoneVal !== "No especificado");
                  return (
                    <>
                      {!mostrarCliente && hasValidPhone && (
                        <p className="text-xs text-stone-600">
                          Teléfono: <span className="font-semibold text-stone-800">{phoneVal}</span>
                        </p>
                      )}
                      {mostrarCliente && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 pt-0.5">
                          <span>
                            Cliente: <span className="font-semibold text-stone-800">{r.client_name || "Sin nombre"}</span> ({r.client_email})
                          </span>
                          {hasValidPhone && (
                            <a
                              href={`https://wa.me/${(phoneVal || "").replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                            >
                              📞 {phoneVal}
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                  A cotizar en taller
                </span>
              </div>
            </div>

            {/* Notification Badge for Delivered/Cancelled Status */}
            {r.status === "entregada" && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>🎉</span> Servicio Finalizado y Entregado
                </p>
                {completionNote && (
                  <p className="text-green-700">Nota del Taller: {completionNote}</p>
                )}
              </div>
            )}

            {r.status === "cancelled" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>❌</span> Reserva Cancelada
                </p>
                {completionNote && (
                  <p className="text-red-700">Motivo: {completionNote}</p>
                )}
              </div>
            )}

            {/* 2. Technical Intake File details */}
            {r.bike_details && (
              <div className="rounded-xl bg-stone-50 p-3.5 text-xs text-stone-700 border border-stone-100 grid gap-2 sm:grid-cols-3">
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Modelo / Color</span>
                  <span className="font-medium text-stone-800">{r.bike_details.model_color || "No especificado"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Nº Serie Cuadro</span>
                  <span className="font-medium text-stone-800">{r.bike_details.serial_number || "No especificado"}</span>
                </div>
                <div className="sm:col-span-3 border-t border-stone-200/60 pt-2 mt-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Problemas Declarados</span>
                  <span className="italic text-stone-600">{r.bike_details.issues || "Ninguno"}</span>
                </div>
              </div>
            )}

            {/* 3. Mechanic diagnostic observations */}
            {r.mechanic_notes && !isEditing && (
              <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3 text-xs animate-fade-in">
                <p className="font-bold text-blue-900">👨‍🔧 Observaciones del Mecánico:</p>
                <p className="mt-1 text-stone-700 leading-relaxed">{r.mechanic_notes}</p>
              </div>
            )}

            {/* Calendar Buttons for Active Reservation */}
            {activa && !mostrarCliente && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                <span className="text-[11px] font-bold text-stone-500 mr-1">Recordatorio:</span>
                <a
                  href={getGoogleCalendarUrl({
                    title: `Turno Taller Bicicletas Paysandú - ${r.service_type}`,
                    description: `Servicio: ${r.service_type}\nBicicleta: ${r.bike_brand}\nUbicación: Av. España 1644, Paysandú`,
                    location: "Av. España 1644, 60000 Paysandú, Uruguay",
                    date: r.reservation_date,
                    timeSlot: r.time_slot,
                    durationMinutes: 60,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  🔵 Google Calendar
                </a>
                <button
                  type="button"
                  onClick={() =>
                    downloadIcsFile({
                      title: `Turno Taller Bicicletas Paysandú - ${r.service_type}`,
                      description: `Servicio: ${r.service_type}\nBicicleta: ${r.bike_brand}\nUbicación: Av. España 1644, Paysandú`,
                      location: "Av. España 1644, 60000 Paysandú, Uruguay",
                      date: r.reservation_date,
                      timeSlot: r.time_slot,
                      durationMinutes: 60,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-700 hover:bg-stone-200 transition-colors border border-stone-200 cursor-pointer"
                >
                  🍏 Apple / Outlook (.ics)
                </button>
              </div>
            )}

            {/* 4. Interactive Progress Timeline Tracker */}
            {activa && (
              <div className="pt-2">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-3">Progreso de Reparación</span>
                <div className="relative flex justify-between items-center max-w-lg mx-auto px-4">
                  {/* Timeline connecting line */}
                  <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-stone-200 -translate-y-1/2 z-0" />
                  <div 
                    className="absolute top-1/2 left-6 h-0.5 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-500" 
                    style={{ width: `${(currentStepIdx / (TIMELINE_STEPS.length - 1)) * 90}%` }}
                  />

                  {/* Steps */}
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isPassed = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;
                    return (
                      <div key={step.status} className="relative z-10 flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm transition-all duration-300 ${
                          isCurrent 
                            ? "border-blue-500 bg-white ring-4 ring-blue-100 scale-110" 
                            : isPassed 
                              ? "border-blue-500 bg-blue-500 text-white" 
                              : "border-stone-200 bg-white text-stone-400"
                        }`}>
                          {step.icon}
                        </div>
                        <span className={`mt-1.5 text-[9px] font-bold tracking-tight uppercase ${
                          isCurrent ? "text-blue-600 font-extrabold" : isPassed ? "text-stone-800" : "text-stone-400"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Admin edit form controls */}
            {esAdmin && (
              <div className="pt-3 border-t border-stone-100">
                {isEditing ? (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                    <p className="text-xs font-bold text-stone-800">🛠️ Editar Ficha Técnica y Estado del Trabajo</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-1">Estado de Reparación</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as ReservationStatus)}
                          className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="confirmed">Confirmada</option>
                          <option value="ingresada">Ingresada al Taller</option>
                          <option value="en_diagnostico">En Diagnóstico</option>
                          <option value="en_trabajo">En Reparación</option>
                          <option value="lista_para_retirar">Lista para Retirar</option>
                          <option value="entregada">Entregada (Finalizar y Archivar)</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-1">Marca de la Bicicleta</label>
                        <input
                          type="text"
                          value={editBikeBrand}
                          onChange={(e) => setEditBikeBrand(e.target.value)}
                          placeholder="Ej: Specialized, Trek..."
                          className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-1">Modelo y Color</label>
                        <input
                          type="text"
                          value={editModelColor}
                          onChange={(e) => setEditModelColor(e.target.value)}
                          placeholder="Ej: Rockhopper 29 - Negro"
                          className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-1">Número de Serie del Cuadro</label>
                        <input
                          type="text"
                          value={editSerialNumber}
                          onChange={(e) => setEditSerialNumber(e.target.value)}
                          placeholder="Ej: WSBC601049..."
                          className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-stone-500 mb-1">Fallas o Problemas Observados</label>
                        <input
                          type="text"
                          value={editIssues}
                          onChange={(e) => setEditIssues(e.target.value)}
                          placeholder="Ej: Ruido en caja de centro, freno descalibrado"
                          className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-stone-500 mb-1">Observaciones / Notas para el Cliente</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Notas visibles para el cliente sobre el trabajo realizado..."
                          rows={2}
                          className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 active:scale-95 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => guardarEdicionAdmin(r.id)}
                        disabled={guardandoId === r.id}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-60"
                      >
                        {guardandoId === r.id ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => iniciarEdicion(r)}
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      🛠️ Gestionar Estado y Notas del Trabajo
                    </button>
                    {confirmandoEliminarId === r.id ? (
                      <div className="flex items-center gap-2 animate-fadeIn">
                        <span className="text-xs font-bold text-red-600">¿Borrar esta reserva del sistema?</span>
                        <button
                          onClick={() => ejecutarEliminacionAdmin(r.id)}
                          disabled={eliminandoId === r.id}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                        >
                          {eliminandoId === r.id ? "Eliminando..." : "Sí, Eliminar"}
                        </button>
                        <button
                          onClick={() => setConfirmandoEliminarId(null)}
                          className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmandoEliminarId(r.id)}
                        disabled={eliminandoId === r.id}
                        className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100/70 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {eliminandoId === r.id ? "Eliminando..." : "🗑️ Eliminar Reserva"}
                      </button>
                    )}
                    {errores[r.id] && (
                      <p className="w-full text-xs font-semibold text-red-600 mt-1">{errores[r.id]}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6. Client deletion button */}
            {onCancel && activa && !isEditing && !esAdmin && (
              <div className="mt-3 border-t border-stone-100 pt-3">
                {cancelable ? (
                  confirmandoEliminarId === r.id ? (
                    <div className="flex items-center gap-2 animate-fadeIn">
                      <span className="text-xs font-bold text-red-600">¿Borrar esta reserva del sistema?</span>
                      <button
                        onClick={() => cancelar(r.id)}
                        disabled={cancelando === r.id}
                        className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-500 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {cancelando === r.id ? "Eliminando..." : "Sí, Eliminar"}
                      </button>
                      <button
                        onClick={() => setConfirmandoEliminarId(null)}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmandoEliminarId(r.id)}
                      disabled={cancelando === r.id}
                      className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100/70 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {cancelando === r.id ? "Eliminando…" : "🗑️ Eliminar Reserva"}
                    </button>
                  )
                ) : (
                  <p className="text-xs text-stone-400">
                    No eliminable: Faltan menos de 24 horas para la cita.
                  </p>
                )}
                {errores[r.id] && (
                  <p className="mt-2 text-xs text-red-600">{errores[r.id]}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
