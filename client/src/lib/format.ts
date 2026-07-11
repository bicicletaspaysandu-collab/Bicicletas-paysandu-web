const usdFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "code",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const uyuFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "UYU",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatUSD(monto: number): string {
  return usdFormatter.format(monto);
}

export function formatUYU(monto: number): string {
  return uyuFormatter.format(monto);
}

export function formatFecha(fecha: string): string {
  // fecha: YYYY-MM-DD — se interpreta como fecha local para evitar
  // desplazamientos de zona horaria.
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-UY", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatHora(hora: string): string {
  // hora: HH:MM o HH:MM:SS
  return hora.slice(0, 5) + " hs";
}
