import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Bicicletas, Repuestos y Accesorios",
  description:
    "Explorá nuestro catálogo de bicicletas de montaña, ruta, urbanas, accesorios de ciclismo e indumentaria en Paysandú, Uruguay. Marcas oficiales: Specialized, Trek, Giant y Scott.",
  alternates: {
    canonical: "https://bicicletaspaysandu.com.uy/catalogo",
  },
  openGraph: {
    title: "Catálogo de Bicicletas y Accesorios — Bicicletas Paysandú",
    description:
      "Descubrí las mejores bicicletas, repuestos y accesorios con stock garantizado y servicio técnico en Paysandú, Uruguay.",
    url: "https://bicicletaspaysandu.com.uy/catalogo",
  },
};

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
