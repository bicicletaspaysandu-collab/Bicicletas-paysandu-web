"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Product[]>("/api/catalog")
      .then(setProductos)
      .catch((e: ApiError) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Catálogo
      </h1>
      <p className="mt-1 text-stone-600">
        Precios expresados en dólares estadounidenses (USD).
      </p>

      {error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}

      {!error && productos === null && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-stone-200"
            />
          ))}
        </div>
      )}

      {productos !== null && productos.length === 0 && (
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-500">
          Todavía no hay productos cargados en el catálogo.
        </div>
      )}

      {productos !== null && productos.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
