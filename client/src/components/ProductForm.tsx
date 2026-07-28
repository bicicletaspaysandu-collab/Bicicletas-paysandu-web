"use client";

import { useState } from "react";
import type { Product, ProductCategory, StockStatus } from "@/lib/types";

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  image_url: string;
  images?: string[];
  category?: ProductCategory;
  stock_status?: StockStatus;
}

interface Props {
  /** Producto existente si se está editando; null para crear uno nuevo */
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ initialData, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(
    initialData ? String(initialData.price) : ""
  );
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images || (initialData?.image_url ? [initialData.image_url] : []));
  const [category, setCategory] = useState<ProductCategory>(initialData?.category ?? "bicicleta");
  const [stockStatus, setStockStatus] = useState<StockStatus>(initialData?.stock_status ?? "in_stock");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Handle local file selection and conversion to base64 preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImages((prev) => {
            const next = [...prev, result];
            if (!imageUrl) setImageUrl(result);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = () => {
    if (!imageUrl.trim()) return;
    if (!images.includes(imageUrl.trim())) {
      setImages((prev) => [...prev, imageUrl.trim()]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0) setImageUrl(next[0]);
      else setImageUrl("");
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(price);
    if (isNaN(parsed) || parsed < 0) {
      setError("El precio debe ser un número válido mayor o igual a cero");
      return;
    }

    const mainImg = images.length > 0 ? images[0] : imageUrl.trim();
    if (!mainImg) {
      setError("Debes subir al menos una imagen para el producto");
      return;
    }

    setEnviando(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        price: parsed,
        image_url: mainImg,
        images: images.length > 0 ? images : [mainImg],
        category,
        stock_status: stockStatus,
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
        {initialData ? "Editar producto" : "Nuevo producto"}
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
          Título del producto *
        </label>
        <input
          id="titulo"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
          placeholder="Ej: Bicicleta Specialized Rockhopper 29"
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
          placeholder="Detalles técnicos y equipamiento…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="categoria"
            className="mb-1 block text-sm font-medium text-stone-700"
          >
            Categoría del producto *
          </label>
          <select
            id="categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 cursor-pointer"
          >
            <option value="bicicleta">Bicicletas</option>
            <option value="accesorio">Accesorios</option>
            <option value="repuesto">Repuestos</option>
            <option value="indumentaria">Indumentaria</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="stockStatus"
            className="mb-1 block text-sm font-medium text-stone-700"
          >
            Estado de Stock *
          </label>
          <select
            id="stockStatus"
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value as StockStatus)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 cursor-pointer"
          >
            <option value="in_stock">En Stock</option>
            <option value="low_stock">Poco Stock</option>
            <option value="out_of_stock">Agotado</option>
            <option value="on_demand">Bajo Pedido</option>
          </select>
        </div>
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
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Subir Imágenes del Producto *
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="w-full text-xs text-stone-600 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>
      </div>

      {/* URL Fallback option */}
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-500">
          O agregar por URL directa de imagen:
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900 outline-none focus:border-blue-500"
            placeholder="https://..."
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
          >
            + Agregar
          </button>
        </div>
      </div>

      {/* Mercado Libre Style Image Gallery Previews */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="block text-xs font-bold text-stone-700">
            Fotos del producto ({images.length}) · La primera es la foto principal
          </span>
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative group h-24 w-24 overflow-hidden rounded-xl border-2 transition-all ${
                  idx === 0 ? "border-blue-500 ring-2 ring-blue-100" : "border-stone-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Preview ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar foto"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando
            ? "Guardando…"
            : initialData
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
