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
  low_stock: { label: "Pocas Unidades", dot: "bg-sky-500", text: "text-sky-700 bg-sky-50 border-sky-200" },
  out_of_stock: { label: "Agotado", dot: "bg-rose-500", text: "text-rose-700 bg-rose-50 border-rose-200" },
  on_demand: { label: "Bajo Pedido", dot: "bg-blue-500", text: "text-blue-700 bg-blue-50 border-blue-200" },
};

export default function ProductCard({ product }: { product: Product }) {
  const [expandido, setExpandido] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Gallery images list (supports multiple images or single fallback)
  const imageList = product.images && product.images.length > 0
    ? product.images
    : [product.image_url];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const categoryLabel = CATEGORY_LABELS[product.category] || "Producto";
  const stockConfig = STOCK_CONFIGS[product.stock_status] || STOCK_CONFIGS.in_stock;

  // WhatsApp query message preparation
  const textMsg = encodeURIComponent(
    `Hola, estoy interesado en el producto "${product.title}" (${formatUSD(product.price)}). ¿Tienen disponibilidad?`
  );
  const whatsappUrl = `https://wa.me/59898824860?text=${textMsg}`;

  return (
    <>
      <article className="group animate-page-fade flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200/60">
        <div 
          onClick={() => setModalAbierto(true)}
          className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageList[activeImageIndex] || product.image_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
          />
          
          {/* Floating Category Tag */}
          <span className="absolute top-3 left-3 rounded-full bg-stone-900/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {categoryLabel}
          </span>

          {/* Photo Count Tag for Multi-Image items */}
          {imageList.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-stone-900/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1">
              📷 {imageList.length} fotos
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 
              onClick={() => setModalAbierto(true)}
              className="font-bold leading-tight text-stone-900 text-base line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
            >
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
              onClick={() => setModalAbierto(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Ver fotos y detalles 🔍
            </button>
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-95 shadow-sm shadow-emerald-500/10"
            >
              💬 Consultar
            </a>
          </div>
        </div>
      </article>

      {/* Mercado Libre Style Modal Gallery */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200 grid lg:grid-cols-12 gap-0 max-h-[90vh]">
            
            {/* Left Thumbnails & Main Photo Container (Mercado Libre Layout) */}
            <div className="lg:col-span-8 bg-stone-100 p-6 flex flex-col items-center justify-between relative">
              <button
                onClick={() => setModalAbierto(false)}
                className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all text-sm font-bold"
              >
                ✕
              </button>

              {/* Featured Main Image */}
              <div className="relative flex-1 w-full flex items-center justify-center min-h-[320px] max-h-[420px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageList[activeImageIndex]}
                  alt={product.title}
                  className="max-h-[400px] w-auto max-w-full object-contain rounded-2xl shadow-sm transition-all duration-300"
                />
              </div>

              {/* Thumbnails Carousel Bar */}
              {imageList.length > 1 && (
                <div className="mt-4 flex gap-2.5 overflow-x-auto p-1 max-w-full">
                  {imageList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      onMouseEnter={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-blue-600 ring-4 ring-blue-500/20 scale-105"
                          : "border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-400"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Thumb ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Details Panel */}
            <div className="lg:col-span-4 p-6 flex flex-col justify-between space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <span className="inline-block rounded-lg bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  {categoryLabel}
                </span>

                <h2 className="text-xl font-bold text-stone-900 leading-snug">
                  {product.title}
                </h2>

                <p className="text-3xl font-black text-stone-900">
                  {formatUSD(product.price)}
                </p>

                <div className="border-t border-b border-stone-100 py-3 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Descripción del producto
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {product.description || "Sin descripción adicional provista."}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95"
                >
                  💬 Consultar por WhatsApp
                </a>

                <button
                  onClick={() => setModalAbierto(false)}
                  className="w-full rounded-2xl border border-stone-300 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cerrar vista previa
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
