import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Panel de Cliente",
  description:
    "Panel personal del cliente en Bicicletas Paysandú: Agendamiento de turnos de taller, ficha técnica de bicicleta y seguimiento en tiempo real.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
