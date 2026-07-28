import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse",
  description:
    "Creá tu cuenta en Bicicletas Paysandú para agendar turnos de taller mecánico en línea, guardar la ficha de tu bicicleta y acceder a beneficios exclusivos.",
  alternates: {
    canonical: "https://bicicletaspaysandu.com.uy/registro",
  },
};

export default function RegistroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
