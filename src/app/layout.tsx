import type { Metadata, Viewport } from "next";
import "@fontsource/libre-caslon-display/400.css";
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/500.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/newsreader/300.css";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/windsong/400.css";
import "./globals.css";
import "./styles/hero.css";
import "./styles/sections.css";
import "./styles/booking.css";
import "./styles/theme.css";
import "./styles/cine.css";
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
  themeColor: "#13201d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
