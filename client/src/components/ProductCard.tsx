"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatUSD } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug text-stone-900">
          {product.title}
        </h3>
        <p className="mt-1 text-lg font-bold text-stone-900">
          {formatUSD(product.price)}
        </p>
        {expandido && (
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            {product.description || "Este producto no tiene descripción."}
          </p>
        )}
        <button
          onClick={() => setExpandido((v) => !v)}
          className="mt-auto pt-4 text-left text-sm font-semibold text-amber-600 hover:text-amber-500"
          aria-expanded={expandido}
        >
          {expandido ? "Ocultar detalles ▲" : "Ver detalles ▼"}
        </button>
      </div>
    </article>
  );
}
