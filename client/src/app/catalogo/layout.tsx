import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Bicicletas, Repuestos y Accesorios en Paysandú",
  description:
    "Explorá nuestro catálogo de bicicletas de montaña, ruta y urbanas en Paysandú, Uruguay. Accesorios, indumentaria y repuestos de marcas como Specialized, Trek, Giant y Scott.",
  keywords: [
    "Catálogo bicicletas Paysandú",
    "Comprar bicicleta Paysandú",
    "Repuestos bicicletas Paysandú",
    "Accesorios ciclismo Paysandú",
    "Indumentaria ciclismo Paysandú",
    "Bicicletas Specialized Paysandú",
    "Bicicletas Trek Paysandú",
  ],
  openGraph: {
    title: "Catálogo de Bicicletas y Accesorios — Bicicletas Paysandú",
    description:
      "Catálogo oficial de productos en Paysandú, Uruguay. Venta de bicicletas, repuestos y accesorios.",
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
