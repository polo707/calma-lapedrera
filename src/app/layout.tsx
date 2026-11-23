import type { Metadata, Viewport } from "next";
import "@fontsource/libre-caslon-display/400.css";
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/500.css";
import "@fontsource/dm-mono/400.css";
import "./globals.css";
import { LangProvider } from "@/i18n/LangProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://calma-lapedrera.vercel.app"),
  title: "Calma La Pedrera — Cabañas entre el bosque y el mar",
  description:
    "Cabañas equipadas en La Pedrera y San Sebastián de La Pedrera, Rocha, Uruguay. Pet friendly. Reservá directo, sin comisiones.",
  openGraph: {
    title: "Calma La Pedrera",
    description: "Cabañas entre el bosque y el mar. Reservá directo, sin comisiones.",
    images: ["/photos/aframe-noche-perro.jpg"],
    locale: "es_UY",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3eee4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
