"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatUSD } from "@/lib/format";

const CATEGORY_LABELS: Record<string, string> = {
  bicicleta: "Bicicleta",
  accesorio: "Accesorio",
  repuesto: "Repuesto",
  indumentaria: "Indumentaria",
};

const STOCK_CONFIGS = {
  in_stock: { label: "En Stock", dot: "bg-emerald-500", text: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  low_stock: { label: "Pocas Unidades", dot: "bg-amber-500", text: "text-amber-700 bg-amber-50 border-amber-200" },
  out_of_stock: { label: "Agotado", dot: "bg-rose-500", text: "text-rose-700 bg-rose-50 border-rose-200" },
  on_demand: { label: "Bajo Pedido", dot: "bg-blue-500", text: "text-blue-700 bg-blue-50 border-blue-200" },
};

export default function ProductCard({ product }: { product: Product }) {
  const [expandido, setExpandido] = useState(false);

  const categoryLabel = CATEGORY_LABELS[product.category] || "Producto";
  const stockConfig = STOCK_CONFIGS[product.stock_status] || STOCK_CONFIGS.in_stock;

  // WhatsApp query message preparation
  const textMsg = encodeURIComponent(
    `Hola, estoy interesado en el producto "${product.title}" (${formatUSD(product.price)}). ¿Tienen disponibilidad?`
  );
  const whatsappUrl = `https://wa.me/59847212345?text=${textMsg}`;

  return (
    <article className="animate-page-fade flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-md hover:scale-[1.01] hover:border-stone-300">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {/* Floating Category Tag */}
        <span className="absolute top-3 left-3 rounded-full bg-stone-900/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {categoryLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold leading-tight text-stone-900 text-base line-clamp-1">
            {product.title}
          </h3>
          {/* Stock Availability Tag */}
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${stockConfig.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${stockConfig.dot}`} />
            {stockConfig.label}
          </span>
        </div>

        <p className="text-xl font-black text-stone-900">
          {formatUSD(product.price)}
        </p>

        {expandido && (
          <p className="text-xs leading-relaxed text-stone-600 animate-fade-in">
            {product.description || "Este producto no tiene descripción."}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 gap-2">
          <button
            onClick={() => setExpandido((v) => !v)}
            className="text-xs font-semibold text-stone-500 hover:text-stone-700 transition-colors"
            aria-expanded={expandido}
          >
            {expandido ? "Ocultar detalles ▲" : "Ver detalles ▼"}
          </button>
          
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-95 shadow-sm shadow-emerald-500/10"
          >
            💬 Consultar WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
