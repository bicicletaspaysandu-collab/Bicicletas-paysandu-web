export default function StatusBadge({
  status,
}: {
  status: "confirmed" | "cancelled";
}) {
  const confirmada = status === "confirmed";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        confirmada
          ? "bg-green-100 text-green-800"
          : "bg-stone-200 text-stone-600"
      }`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${
          confirmada ? "bg-green-500" : "bg-stone-400"
        }`}
      />
      {confirmada ? "Confirmada" : "Cancelada"}
    </span>
  );
}
