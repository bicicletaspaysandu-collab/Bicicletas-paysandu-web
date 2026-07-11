"use client";

import Cal from "@calcom/embed-react";
import { useState } from "react";
import { MARCAS_REPRESENTADAS, SERVICIOS } from "@/lib/types";
import { formatUYU } from "@/lib/format";

const CAL_LINK =
  process.env.NEXT_PUBLIC_CAL_LINK ?? "bicicletas-paysandu/taller";

/**
 * Widget de agendamiento del taller.
 * El cliente elige el servicio y la marca de su bicicleta, y luego se
 * incrusta el widget de Cal.com pre-rellenando esas respuestas (junto con
 * el correo del cliente) mediante parámetros de consulta.
 */
export default function BookingWidget({ email }: { email: string }) {
  const [servicio, setServicio] = useState<string>(SERVICIOS[0].nombre);
  const [marca, setMarca] = useState("");
  const [mostrarWidget, setMostrarWidget] = useState(false);

  const servicioInfo = SERVICIOS.find((s) => s.nombre === servicio);
  const esRepresentada = MARCAS_REPRESENTADAS.some(
    (m) => m.toLowerCase() === marca.trim().toLowerCase()
  );
  const precioEstimado = servicioInfo
    ? esRepresentada
      ? servicioInfo.precio * 0.9
      : servicioInfo.precio
    : 0;

  if (mostrarWidget) {
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
          <p className="text-sm text-stone-700">
            <span className="font-semibold">{servicio}</span> · Marca:{" "}
            <span className="font-semibold">{marca || "Genérica"}</span> ·
            Precio estimado:{" "}
            <span className="font-semibold">{formatUYU(precioEstimado)}</span>
            {esRepresentada && (
              <span className="ml-1 text-green-700">
                (10% de descuento aplicado)
              </span>
            )}
          </p>
          <button
            onClick={() => setMostrarWidget(false)}
            className="text-sm font-semibold text-amber-600 hover:text-amber-500"
          >
            ← Cambiar servicio o marca
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <Cal
            calLink={CAL_LINK}
            style={{ width: "100%", height: "100%", minHeight: "620px" }}
            config={{
              email,
              servicio,
              marca: marca || "Genérica",
              theme: "light",
            }}
          />
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Al confirmar el turno en el calendario, la reserva se registrará
          automáticamente y aparecerá en tu historial con el precio final en
          pesos uruguayos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="servicio"
            className="mb-1 block text-sm font-medium text-stone-700"
          >
            Tipo de servicio
          </label>
          <select
            id="servicio"
            value={servicio}
            onChange={(e) => setServicio(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          >
            {SERVICIOS.map((s) => (
              <option key={s.nombre} value={s.nombre}>
                {s.nombre} — {formatUYU(s.precio)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="marca"
            className="mb-1 block text-sm font-medium text-stone-700"
          >
            Marca de tu bicicleta
          </label>
          <input
            id="marca"
            type="text"
            list="marcas"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder="Ej: Trek, Specialized, GT…"
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <datalist id="marcas">
            {MARCAS_REPRESENTADAS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
        Precio estimado de mano de obra:{" "}
        <span className="font-bold">{formatUYU(precioEstimado)}</span>
        {esRepresentada ? (
          <span className="ml-1 font-medium text-green-700">
            — ¡{marca.trim()} es una marca representada! Se aplica un 10% de
            descuento.
          </span>
        ) : (
          <span className="ml-1 text-stone-500">
            — Las marcas {MARCAS_REPRESENTADAS.join(", ")} tienen 10% de
            descuento.
          </span>
        )}
      </div>

      <button
        onClick={() => setMostrarWidget(true)}
        className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-stone-900 transition-colors hover:bg-amber-400 sm:w-auto sm:px-8"
      >
        Elegir fecha y hora →
      </button>
    </div>
  );
}
