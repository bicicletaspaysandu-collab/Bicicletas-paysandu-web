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
  const [busqueda, setBusqueda] = useState<string>("");
  const [orden, setOrden] = useState<"destacado" | "menor_precio" | "mayor_precio">("destacado");

  useEffect(() => {
    apiFetch<Product[]>("/api/catalog")
      .then(setProductos)
      .catch((e: ApiError) => setError(e.message));
  }, []);

  // Filter products locally based on category, search query, and price order
  const productosFiltrados = productos
    ? productos
        .filter((p) => {
          // Category filter
          if (categoria !== "todos" && p.category !== categoria) return false;
          // Search query filter
          if (busqueda.trim() !== "") {
            const query = busqueda.toLowerCase().trim();
            const matchTitle = p.title.toLowerCase().includes(query);
            const matchDesc = p.description ? p.description.toLowerCase().includes(query) : false;
            if (!matchTitle && !matchDesc) return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (orden === "menor_precio") return a.price - b.price;
          if (orden === "mayor_precio") return b.price - a.price;
          return 0;
        })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Catálogo de Productos
        </h1>
        <p className="mt-1 text-stone-600 text-sm">
          Precios expresados en dólares estadounidenses (USD). Consultá stock y disponibilidad directa por WhatsApp.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}

      {/* Filter and Search Controls Bar */}
      {!error && productos !== null && (
        <div className="space-y-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-stone-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar bicicletas, cascos, repuestos..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 pl-10 pr-10 py-2.5 text-xs text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Price Sorting Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="priceOrder" className="text-xs font-semibold text-stone-500">
                Ordenar por:
              </label>
              <select
                id="priceOrder"
                value={orden}
                onChange={(e) => setOrden(e.target.value as typeof orden)}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-semibold text-stone-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
              >
                <option value="destacado">Destacados</option>
                <option value="menor_precio">Precio: Menor a Mayor</option>
                <option value="mayor_precio">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-100">
            {CATEGORIAS.map((cat) => {
              const isSelected = categoria === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoria(cat.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                      : "bg-stone-100 text-stone-600 border border-stone-200/80 hover:bg-stone-200/60 hover:text-stone-900"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!error && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 min-h-[400px]">
          {productos === null ? (
            // Skeleton pulses matching card height
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`pulse-${i}`}
                className="h-[390px] animate-pulse rounded-3xl bg-stone-200/60"
              />
            ))
          ) : productosFiltrados.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-stone-200 bg-white p-12 text-center text-stone-500 space-y-2">
              <span className="text-3xl block">🚲</span>
              <p className="font-bold text-stone-800">No se encontraron resultados</p>
              <p className="text-xs text-stone-500">
                Probá cambiando los términos de búsqueda o seleccionando otra categoría.
              </p>
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="mt-3 inline-block rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            // Render filtered product cards
            productosFiltrados.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
