import type { StaticImageData } from "next/image";
import noche from "../../public/photos/aframe-noche-perro.jpg";
import camino from "../../public/photos/camino-eucaliptos.jpg";
import deck from "../../public/photos/aframe-dia-deck.jpg";
import living from "../../public/photos/living-ventanal.jpg";
import cielo from "../../public/photos/cielo-estrellado.jpg";

export type Scene = {
  img: StaticImageData;
  /** object-position en escritorio / ≤820px / ≤480px */
  pos: [string, string, string];
  /** capa de profundidad (misma foto con máscara) */
  depth: boolean;
  /** opacidad del lavado de color pino */
  wash: number;
};

/** Una escena del escenario fijo por capítulo cinemático (0–4). Los capítulos 5+ usan el lavado pino. */
export const SCENES: Scene[] = [
  { img: noche, pos: ["50% 64%", "50% 60%", "48% 62%"], depth: true, wash: 0 },
  { img: camino, pos: ["50% 70%", "50% 60%", "50% 55%"], depth: true, wash: 0.08 },
  { img: deck, pos: ["50% 40%", "50% 45%", "48% 50%"], depth: false, wash: 0.05 },
  { img: living, pos: ["50% 58%", "50% 55%", "45% 55%"], depth: true, wash: 0.1 },
  { img: cielo, pos: ["50% 40%", "50% 45%", "50% 50%"], depth: true, wash: 0.12 },
];

/** Opacidad del lavado pino para los capítulos de galería y tres noches. */
export const DEEP_WASH = 0.9;
export const CINE_CHAPTERS = 7; // 0..6 sobre el escenario; 7+ son secciones de papel
