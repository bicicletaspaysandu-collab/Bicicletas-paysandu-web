import type { ReservationStatus } from "@/lib/types";

const BADGE_CONFIGS: Record<ReservationStatus, { bg: string; dot: string; label: string }> = {
  confirmed: {
    bg: "bg-blue-50 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
    label: "Confirmada",
  },
  cancelled: {
    bg: "bg-stone-100 text-stone-600 border-stone-200",
    dot: "bg-stone-400",
    label: "Cancelada",
  },
  ingresada: {
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    label: "Ingresada",
  },
  en_diagnostico: {
    bg: "bg-purple-50 text-purple-800 border-purple-200",
    dot: "bg-purple-500",
    label: "En Diagnóstico",
  },
  en_trabajo: {
    bg: "bg-indigo-50 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
    label: "En Reparación",
  },
  lista_para_retirar: {
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Lista para Retirar",
  },
  entregada: {
    bg: "bg-teal-50 text-teal-800 border-teal-200",
    dot: "bg-teal-500",
    label: "Entregada",
  },
};

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  const config = BADGE_CONFIGS[status] || BADGE_CONFIGS.confirmed;
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.bg}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />
      {config.label}
    </span>
  );
}
