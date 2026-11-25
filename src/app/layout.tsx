import type { Metadata, Viewport } from "next";
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

const F = (family: string, file: string, weight: number, style = "normal") =>
  `@font-face{font-family:"${family}";src:url(/fonts/${file}.woff2) format("woff2");font-weight:${weight};font-style:${style};font-display:swap}`;
/** Fuentes propias con rutas absolutas (compatibles con el CSS en línea). */
const FONT_CSS = [
  F("Manrope", "manrope-latin-400-normal", 400),
  F("Manrope", "manrope-latin-500-normal", 500),
  F("Manrope", "manrope-latin-600-normal", 600),
  F("Newsreader", "newsreader-latin-300-normal", 300),
  F("Newsreader", "newsreader-latin-400-normal", 400),
  F("Newsreader", "newsreader-latin-400-italic", 400, "italic"),
  F("WindSong", "windsong-latin-400-normal", 400),
].join("");

/** Clase "js" + alto de pantalla fijo en px (--vh), recalculado solo si cambia el ancho (rotación). */
const VH_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');var w=innerWidth;function set(){d.style.setProperty('--vh',(innerHeight/100)+'px')}set();addEventListener('resize',function(){if(Math.abs(innerWidth-w)>40){w=innerWidth;set()}});addEventListener('orientationchange',function(){setTimeout(function(){w=innerWidth;set()},300)})})();`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#13201d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: VH_SCRIPT }} />
        <link rel="preload" href="/fonts/manrope-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/newsreader-latin-300-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <style dangerouslySetInnerHTML={{ __html: FONT_CSS }} />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
