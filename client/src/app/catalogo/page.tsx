"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

const CATEGORIAS: { id: string; label: string }[] = [
  { id: "todos", label: "Todo" },
  { id: "bicicleta", label: "Bicicletas" },
  { id: "accesorio", label: "Accesorios" },
  { id: "repuesto", label: "Repuestos" },
  { id: "indumentaria", label: "Indumentaria" },
];

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<string>("todos");

  useEffect(() => {
    apiFetch<Product[]>("/api/catalog")
      .then(setProductos)
      .catch((e: ApiError) => setError(e.message));
  }, []);

  // Filter products locally based on category select
  const productosFiltrados = productos
    ? productos.filter((p) => {
        if (categoria === "todos") return true;
        return p.category === categoria;
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Catálogo de Productos
        </h1>
        <p className="mt-1 text-stone-600 text-sm">
          Precios expresados en dólares estadounidenses (USD). Consultá stock y disponibilidad por WhatsApp.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}

      {/* Category filters strip */}
      {!error && productos !== null && (
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-4">
          {CATEGORIAS.map((cat) => {
            const isSelected = categoria === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoria(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-stone-900 text-white shadow-sm"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 
        Persistent grid container to prevent page reflows/layout shifts.
        Height matches the real ProductCard components exactly (h-[390px]).
      */}
      {!error && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 min-h-[400px]">
          {productos === null ? (
            // Loading skeleton pulses matching exact card height
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`pulse-${i}`}
                className="h-[390px] animate-pulse rounded-3xl bg-stone-200/60"
              />
            ))
          ) : productosFiltrados.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-stone-200 bg-white p-10 text-center text-stone-500">
              No se encontraron productos en esta categoría en este momento.
            </div>
          ) : (
            // Render actual product cards
            productosFiltrados.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
