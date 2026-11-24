import type { Lang } from "@/lib/types";

/**
 * Textos nuevos del hero y la cabecera (no están en dict.ts).
 * Los pies de foto describen solo lo que se ve en cada foto.
 */
export type HeroExtra = {
  /** nombre del grupo de controles de la presentación */
  slides: string;
  /** etiqueta de cada botón de foto */
  slide: (n: number, total: number) => string;
  pause: string;
  play: string;
  /** indicador de scroll */
  cue: string;
  cueAria: string;
  /** pies de foto de las fotos 2 y 3 (la 1 usa d.hero.caption) */
  captions: [string, string];
};

export const heroExtra: Record<Lang, HeroExtra> = {
  es: {
    slides: "Fotos de las cabañas",
    slide: (n, t) => `Ver foto ${n} de ${t}`,
    pause: "Pausar las fotos",
    play: "Reproducir las fotos",
    cue: "Descubrir",
    cueAria: "Bajar al contenido",
    captions: ["La A-frame de noche, entre los árboles.", "El living, abierto al deck por el ventanal en A."],
  },
  en: {
    slides: "Cabin photos",
    slide: (n, t) => `Show photo ${n} of ${t}`,
    pause: "Pause slideshow",
    play: "Play slideshow",
    cue: "Discover",
    cueAria: "Scroll to content",
    captions: ["The A-frame at night, among the trees.", "The living room, open to the deck through the A-shaped window."],
  },
  pt: {
    slides: "Fotos das cabanas",
    slide: (n, t) => `Ver foto ${n} de ${t}`,
    pause: "Pausar as fotos",
    play: "Reproduzir as fotos",
    cue: "Descobrir",
    cueAria: "Ir para o conteúdo",
    captions: ["A A-frame à noite, entre as árvores.", "A sala, aberta para o deck pela janela em A."],
  },
};
