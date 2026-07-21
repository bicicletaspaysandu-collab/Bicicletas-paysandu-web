import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bicicletaspaysandu.com.uy"),
  title: {
    default: "Bicicletas Paysandú — Venta de Bicicletas y Taller Mecánico en Paysandú, Uruguay",
    template: "%s | Bicicletas Paysandú",
  },
  description:
    "Tienda y taller mecánico de bicicletas en Paysandú, Uruguay. Venta de bicicletas Specialized, Trek, Giant, Scott, accesorios, repuestos y servicio técnico especializado con agenda online.",
  keywords: [
    "Bicicletas Paysandú",
    "Bicicletas Paysandu",
    "Taller de bicicletas Paysandú",
    "Taller mecánico de bicicletas Paysandú",
    "Venta de bicicletas Paysandú Uruguay",
    "Bicicletería Paysandú",
    "Repuestos para bicicletas Paysandú",
    "Accesorios para bicicletas Paysandú",
    "Service de bicicletas Paysandú",
    "Mantenimiento de bicicletas Paysandú",
    "Bicicletas Specialized Paysandú",
    "Bicicletas Trek Paysandú",
    "Bicicletas Giant Paysandú",
    "Bicicletas Scott Paysandú",
    "Ciclismo Paysandú",
    "Bicicletas Uruguay",
    "Turnos taller de bicicletas Paysandú",
  ],
  authors: [{ name: "Bicicletas Paysandú" }],
  creator: "Bicicletas Paysandú",
  publisher: "Bicicletas Paysandú",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bicicletas Paysandú — Tienda y Taller Mecánico en Paysandú, Uruguay",
    description:
      "Venta de bicicletas de primeras marcas, repuestos, accesorios y taller mecánico especializado en Paysandú. Reservá tu turno en línea.",
    url: "https://bicicletaspaysandu.com.uy",
    siteName: "Bicicletas Paysandú",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 931,
        alt: "Bicicletas Paysandú Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bicicletas Paysandú — Tienda y Taller Mecánico",
    description:
      "Venta de bicicletas y service mecánico especializado en Paysandú, Uruguay.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  other: {
    "geo.region": "UY-PA",
    "geo.placename": "Paysandú",
    "geo.position": "-32.3214;-58.0756",
    "ICBM": "-32.3214, -58.0756",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org LocalBusiness JSON-LD for rich snippet indexing in Google Search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BikeStore",
    "name": "Bicicletas Paysandú",
    "image": "https://bicicletaspaysandu.com.uy/logo.png",
    "@id": "https://bicicletaspaysandu.com.uy",
    "url": "https://bicicletaspaysandu.com.uy",
    "telephone": "+59898824860",
    "email": "bicicletaspaysandu@gmail.com",
    "priceRange": "$$",
    "description": "Tienda de bicicletas y taller mecánico oficial en Paysandú, Uruguay. Venta de bicicletas Specialized, Trek, Giant, Scott, accesorios, repuestos y agenda online de turnos de taller.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. España 1644",
      "addressLocality": "Paysandú",
      "addressRegion": "Departamento de Paysandú",
      "postalCode": "60000",
      "addressCountry": "UY"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -32.3214,
      "longitude": -58.0756
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "12:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "15:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:30",
        "closes": "12:30"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/bicicletaspaysandu/"
    ]
  };

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
