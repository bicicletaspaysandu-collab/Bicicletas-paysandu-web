"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Product, Reservation } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import ProductForm, { type ProductFormData } from "@/components/ProductForm";
import ReservationsList from "@/components/ReservationsList";
import RefreshButton from "@/components/RefreshButton";
import { formatFecha, formatHora } from "@/lib/format";

type Pestania = "catalogo" | "reservas";
type VistaReservas = "lista" | "calendario";

export default function AdminPage() {
  const { user, role, token, loading } = useAuth();
  const router = useRouter();

  const [pestania, setPestania] = useState<Pestania>("catalogo");
  const [vistaReservas, setVistaReservas] = useState<VistaReservas>("lista");
  const [productos, setProductos] = useState<Product[] | null>(null);
  const [reservas, setReservas] = useState<Reservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // null = sin formulario; "nuevo" = crear; Product = editar
  const [editando, setEditando] = useState<Product | "nuevo" | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, user, role, router]);

  const cargarProductos = useCallback(() => {
    apiFetch<Product[]>("/api/catalog")
      .then(setProductos)
      .catch((e: Error) => setError(e.message));
  }, []);

  const cargarReservas = useCallback(() => {
    if (!token) return;
    apiFetch<Reservation[]>("/api/reservations", { token })
      .then(setReservas)
      .catch((e: Error) => setError(e.message));
  }, [token]);

  useEffect(() => {
    if (role === "admin") {
      cargarProductos();
      cargarReservas();
    }
  }, [role, cargarProductos, cargarReservas]);

  const guardarProducto = async (data: ProductFormData) => {
    setError(null);
    setAviso(null);
    try {
      if (editando === "nuevo") {
        await apiFetch("/api/catalog", {
          method: "POST",
          token,
          body: JSON.stringify(data),
        });
        setAviso("Producto creado exitosamente");
      } else if (editando) {
        await apiFetch(`/api/catalog/${editando.id}`, {
          method: "PUT",
          token,
          body: JSON.stringify(data),
        });
        setAviso("Producto actualizado exitosamente");
      }
      setEditando(null);
      cargarProductos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el producto"
      );
    }
  };

  const eliminarProducto = async (p: Product) => {
    if (
      !window.confirm(
        `¿Eliminar "${p.title}" del catálogo? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setEliminando(p.id);
    setError(null);
    try {
      await apiFetch(`/api/catalog/${p.id}`, { method: "DELETE", token });
      setAviso("Producto eliminado exitosamente");
      cargarProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setEliminando(null);
    }
  };

  if (loading || !user || role !== "admin") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-stone-500">
        Cargando…
      </div>
    );
  }

  const tabClase = (t: Pestania) =>
    `rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
      pestania === t
        ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
        : "bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 hover:border-blue-300"
    }`;

  // Group active reservations by date for the Admin Calendar view
  const reservasPorFecha: Record<string, Reservation[]> = {};
  if (reservas) {
    reservas.forEach((r) => {
      if (!reservasPorFecha[r.reservation_date]) {
        reservasPorFecha[r.reservation_date] = [];
      }
      reservasPorFecha[r.reservation_date].push(r);
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Administración
      </h1>
      <p className="mt-1 text-stone-600">
        Gestión del catálogo y agenda del taller.
      </p>

      <div className="mt-6 flex gap-2">
        <button
          className={tabClase("catalogo")}
          onClick={() => setPestania("catalogo")}
        >
          Catálogo
        </button>
        <button
          className={tabClase("reservas")}
          onClick={() => setPestania("reservas")}
        >
          Reservas de Taller
        </button>
      </div>

      {aviso && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {aviso}
          <button
            onClick={() => setAviso(null)}
            className="font-bold text-green-800 hover:text-green-900"
            aria-label="Cerrar aviso"
          >
            ✕
          </button>
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Pestania Catalogo */}
      {pestania === "catalogo" && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-stone-900">
              Productos en catálogo
            </h2>
            <div className="flex gap-2">
              <RefreshButton onRefresh={cargarProductos} />
              <button
                onClick={() => setEditando("nuevo")}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-md hover:shadow-blue-600/10 active:scale-95 cursor-pointer"
              >
                + Nuevo producto
              </button>
            </div>
          </div>

          {editando && (
            <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-bold text-stone-900">
                {editando === "nuevo" ? "Crear producto" : "Editar producto"}
              </h3>
              <ProductForm
                initialData={
                  editando === "nuevo"
                    ? undefined
                    : {
                        title: editando.title,
                        description: editando.description || "",
                        price: editando.price,
                        image_url: editando.image_url,
                        category: editando.category,
                        stock_status: editando.stock_status,
                      }
                }
                onSubmit={guardarProducto}
                onCancel={() => setEditando(null)}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productos === null ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`admin-cat-pulse-${i}`}
                  className="h-64 animate-pulse rounded-2xl bg-stone-200/60"
                />
              ))
            ) : productos.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-500">
                No hay productos en el catálogo.
              </div>
            ) : (
              productos.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <span className="inline-block rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600 capitalize mb-2">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-stone-900">{p.title}</h3>
                    <p className="mt-1 text-xs text-stone-500 line-clamp-2">
                      {p.description}
                    </p>
                    <p className="mt-2 text-lg font-black text-blue-600">
                      {formatUSD(p.price)}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-shrink-0 gap-2">
                    <button
                      onClick={() => setEditando(p)}
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarProducto(p)}
                      disabled={eliminando === p.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                    >
                      {eliminando === p.id ? "…" : "Eliminar"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Pestania Reservas */}
      {pestania === "reservas" && (
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-stone-900">
                Agenda General del Taller
              </h2>
              <p className="text-xs text-stone-500">
                Viendo todas las reservas activas de clientes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl border border-stone-200 bg-stone-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setVistaReservas("lista")}
                  className={`rounded-lg px-3 py-1 transition-all ${
                    vistaReservas === "lista"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  📋 Lista
                </button>
                <button
                  type="button"
                  onClick={() => setVistaReservas("calendario")}
                  className={`rounded-lg px-3 py-1 transition-all ${
                    vistaReservas === "calendario"
                      ? "bg-white text-blue-600 shadow-sm font-bold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  📅 Calendario por Día
                </button>
              </div>

              <RefreshButton onRefresh={cargarReservas} />
            </div>
          </div>

          {vistaReservas === "lista" ? (
            <div className="space-y-3 min-h-[400px]">
              {reservas === null ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`admin-res-pulse-${i}`}
                    className="h-[260px] animate-pulse rounded-3xl bg-stone-200/60"
                  />
                ))
              ) : (
                <ReservationsList reservations={reservas} mostrarCliente role={role} token={token} onUpdate={cargarReservas} />
              )}
            </div>
          ) : (
            <div className="space-y-6 min-h-[400px]">
              {reservas === null ? (
                <div className="h-64 animate-pulse rounded-3xl bg-stone-200/60" />
              ) : Object.keys(reservasPorFecha).length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-500">
                  No hay turnos agendados en el calendario actualmente.
                </div>
              ) : (
                Object.entries(reservasPorFecha).map(([fechaStr, listaRes]) => (
                  <div key={fechaStr} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                        <span>📅</span> {formatFecha(fechaStr)}
                      </h3>
                      <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700">
                        {listaRes.length} {listaRes.length === 1 ? "turno" : "turnos"}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {listaRes.map((r) => (
                        <div key={r.id} className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 space-y-1.5">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-xs text-blue-600">{formatHora(r.time_slot)} hs</span>
                            <span className="text-[11px] font-semibold text-stone-700 capitalize">{r.status}</span>
                          </div>
                          <p className="text-xs font-bold text-stone-900">{r.service_type}</p>
                          <p className="text-xs text-stone-600">Cliente: <span className="font-medium text-stone-800">{r.client_name || r.client_email}</span></p>
                          <p className="text-xs text-stone-500">Bici: {r.bike_brand} ({r.bike_details?.model_color || "No esp."})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
