import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description:
    "Ingresá a tu cuenta de Bicicletas Paysandú para gestionar tus reservas de taller mecánico, ver el estado de tu bicicleta y revisar tu historial.",
  alternates: {
    canonical: "https://bicicletaspaysandu.com.uy/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
