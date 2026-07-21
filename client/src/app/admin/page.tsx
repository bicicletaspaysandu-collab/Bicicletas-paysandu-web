"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Product, Reservation } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import ProductForm, { type ProductFormData } from "@/components/ProductForm";
import ReservationsList from "@/components/ReservationsList";

type Pestania = "catalogo" | "reservas";

export default function AdminPage() {
  const { user, role, token, loading } = useAuth();
  const router = useRouter();

  const [pestania, setPestania] = useState<Pestania>("catalogo");
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
          Reservas
        </button>
      </div>

      {aviso && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {aviso}
          <button
            onClick={() => setAviso(null)}
            className="font-bold"
            aria-label="Cerrar aviso"
          >
            ✕
          </button>
        </div>
      )}
      {error && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="font-bold"
            aria-label="Cerrar error"
          >
            ✕
          </button>
        </div>
      )}

      {pestania === "catalogo" && (
        <section className="mt-8">
          {editando !== null ? (
            <ProductForm
              producto={editando === "nuevo" ? null : editando}
              onSubmit={guardarProducto}
              onCancel={() => setEditando(null)}
            />
          ) : (
            <button
              onClick={() => setEditando("nuevo")}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-blue-500/10 cursor-pointer"
            >
              + Nuevo producto
            </button>
          )}

          <div className="mt-6 space-y-3 min-h-[300px]">
            {productos === null ? (
              // Match exact height of administrative product rows (h-[98px])
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`admin-prod-pulse-${i}`}
                  className="h-[98px] animate-pulse rounded-2xl bg-stone-200/60"
                />
              ))
            ) : productos.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-500">
                No hay productos en el catálogo. Creá el primero.
              </div>
            ) : (
              productos.map((p) => (
                <div
                  key={p.id}
                  className="animate-page-fade flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-stone-900">
                      {p.title}
                    </p>
                    <p className="text-sm font-bold text-stone-700">
                      {formatUSD(p.price)}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
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

      {pestania === "reservas" && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-stone-900">
              Todas las reservas del taller
            </h2>
            <button
              onClick={cargarReservas}
              className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Actualizar ↻
            </button>
          </div>
          <div className="space-y-3 min-h-[400px]">
            {reservas === null ? (
              // Match average height of detailed reservations (h-[260px])
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`admin-res-pulse-${i}`}
                  className="h-[260px] animate-pulse rounded-3xl bg-stone-200/60"
                />
              ))
            ) : (
              <ReservationsList reservations={reservas} mostrarCliente onUpdate={cargarReservas} />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
