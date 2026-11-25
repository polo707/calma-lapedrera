"use client";

import { useEffect, useRef, useState } from "react";
import type { StaticImageData } from "next/image";
import { useData } from "@/lib/store";
import { currentRate } from "@/lib/pricing";
import { useMounted } from "@/lib/useMounted";

import puertaAgua from "../../../public/photos/puerta-agua.jpg";
import aframeDiaDeck from "../../../public/photos/aframe-dia-deck.jpg";
import aframeLuces from "../../../public/photos/aframe-luces.jpg";
import aframeEntreArboles from "../../../public/photos/aframe-entre-arboles.jpg";
import cabanaBosque from "../../../public/photos/cabana-bosque.jpg";

/** Fotos de cabaña por ruta pública (la ruta viene de los datos); así tienen blur y tamaño. */
const CABIN_PHOTOS: Record<string, StaticImageData> = {
  "/photos/puerta-agua.jpg": puertaAgua,
  "/photos/aframe-dia-deck.jpg": aframeDiaDeck,
  "/photos/aframe-luces.jpg": aframeLuces,
  "/photos/aframe-entre-arboles.jpg": aframeEntreArboles,
  "/photos/cabana-bosque.jpg": cabanaBosque,
};

export function cabinPhoto(path: string): StaticImageData | string {
  return CABIN_PHOTOS[path] ?? path;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Precio "desde": en el servidor se muestra la tarifa baja; en el cliente, la vigente hoy. */
export function useRate() {
  const data = useData();
  const mounted = useMounted();
  return (id: string) => {
    const c = data.cabins.find((x) => x.id === id);
    if (!c) return 0;
    return mounted ? currentRate(c, data.settings) : c.rateLow;
  };
}

/**
 * Pestañas accesibles con tabindex itinerante: flechas, Inicio y Fin.
 * La selección sigue al foco (patrón "automatic activation").
 */
export function useRovingTabs(count: number, initial = 0) {
  const [raw, setActive] = useState(initial);
  const active = Math.min(raw, Math.max(0, count - 1));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (active + 1) % count;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (active - 1 + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };
  return { active, setActive, refs, onKeyDown };
}

type ParallaxProps = {
  children: React.ReactNode;
  className?: string;
  /** desplazamiento máximo en px (positivo: baja más lento que el scroll) */
  distance?: number;
};

/**
 * Parallax suave ligado al scroll. Solo transforma (translateY).
 * Con prefers-reduced-motion el CSS anula la transformación (.plx).
 */
export function Parallax({ children, className = "", distance = 40 }: ParallaxProps) {
  // Parallax liviano sin librerías: una sola lectura por frame, solo mientras está en pantalla.
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const target = inner.current;
    if (!el || !target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let visible = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
      target.style.transform = `translate3d(0, ${(distance - p * distance * 2).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      onScroll();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [distance]);
  return (
    <div ref={ref} className={className}>
      <div ref={inner} className="plx">
        {children}
      </div>
    </div>
  );
}

export function IconArrow({ dir = "right" }: { dir?: "left" | "right" | "up" | "out" }) {
  const rot = { right: 0, left: 180, up: -90, out: -45 }[dir];
  return (
    <span className="sx-arrow" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transform: `rotate(${rot}deg)` }}>
        <path d="M2 9h13M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
    </span>
  );
}

export function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="15" height="15" rx="4.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="3.4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14.6" cy="5.4" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconWhatsApp() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5a7.5 7.5 0 0 0-6.5 11.2L2.5 17.5l3.9-1A7.5 7.5 0 1 0 10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7.4 6.6c.2-.4.4-.4.6-.4h.4c.1 0 .3 0 .4.3l.6 1.4c0 .1.1.3 0 .4l-.3.5-.3.3c-.1.1-.2.2-.1.4.4.7.9 1.2 1.4 1.6.5.4 1 .6 1.3.7.2.1.3 0 .4-.1l.6-.7c.1-.2.3-.2.4-.1l1.4.7c.2.1.3.1.3.3 0 .2 0 .8-.3 1.1-.3.4-1 .7-1.6.7-.6 0-1.5-.2-2.7-1-1.4-1-2.3-2.4-2.5-2.7-.2-.3-.6-1-.6-1.8 0-.8.4-1.3.6-1.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
