"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  image_url: string;
}

interface Props {
  /** Producto existente si se está editando; null para crear uno nuevo */
  producto?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ producto, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(producto?.title ?? "");
  const [description, setDescription] = useState(producto?.description ?? "");
  const [price, setPrice] = useState(
    producto ? String(producto.price) : ""
  );
  const [imageUrl, setImageUrl] = useState(producto?.image_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(price);
    if (isNaN(parsed) || parsed < 0) {
      setError("El precio debe ser un número válido mayor o igual a cero");
      return;
    }

    setEnviando(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        price: parsed,
        image_url: imageUrl.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setEnviando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-bold text-stone-900">
        {producto ? "Editar producto" : "Nuevo producto"}
      </h3>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="titulo"
          className="mb-1 block text-sm font-medium text-stone-700"
        >
          Título *
        </label>
        <input
          id="titulo"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
          placeholder="Ej: Bicicleta Trek Marlin 7"
        />
      </div>

      <div>
        <label
          htmlFor="descripcion"
          className="mb-1 block text-sm font-medium text-stone-700"
        >
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
          placeholder="Detalles del producto…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="precio"
            className="mb-1 block text-sm font-medium text-stone-700"
          >
            Precio (USD) *
          </label>
          <input
            id="precio"
            type="number"
            required
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
            placeholder="0.00"
          />
        </div>
        <div>
          <label
            htmlFor="imagen"
            className="mb-1 block text-sm font-medium text-stone-700"
          >
            URL de la imagen *
          </label>
          <input
            id="imagen"
            type="url"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
            placeholder="https://…"
          />
        </div>
      </div>

      {imageUrl.trim() && (
        <div className="overflow-hidden rounded-xl border border-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Vista previa de la imagen"
            className="h-40 w-full object-cover"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando
            ? "Guardando…"
            : producto
              ? "Guardar cambios"
              : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-stone-300 px-6 py-2.5 font-semibold text-stone-700 transition-all hover:bg-stone-50 active:scale-[0.98]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
