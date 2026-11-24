"use client";

import { useRef } from "react";
import { useInViewOnce } from "./useInViewOnce";

type Props = {
  children: React.ReactNode;
  as?: "div" | "section" | "li" | "figure" | "article" | "span" | "p" | "ul" | "ol" | "dl" | "header" | "footer" | "aside" | "h2" | "h3";
  className?: string;
  /** retraso en ms */
  delay?: number;
  /**
   * tipo de entrada:
   * - up (default): sube y aparece
   * - fade: solo aparece
   * - mask: se descubre de abajo hacia arriba (clip-path)
   * - scale: crece apenas y aparece
   * - image: se descubre con clip-path y la imagen de adentro (hijo directo) se asienta desde un zoom
   * - stagger: los hijos directos suben uno tras otro (listas, filas, grillas)
   */
  variant?: "up" | "fade" | "mask" | "scale" | "image" | "stagger";
  /** ms entre hijos para variant="stagger" (default 80) */
  step?: number;
};

/**
 * Aparición al entrar en pantalla. Sin JS el contenido se ve igual (el estado oculto
 * solo aplica bajo html.js). Respeta prefers-reduced-motion vía CSS.
 * API estable: usar <Reveal variant="up" delay={120}>…</Reveal>.
 * Animaciones con las propiedades individuales translate/scale (no `transform`),
 * así no pisan transforms propios de cada sección.
 */
export function Reveal({ children, as = "div", className = "", delay = 0, variant = "up", step }: Props) {
  const ref = useRef<HTMLElement>(null);
  useInViewOnce(ref, { observeParent: variant === "mask" || variant === "image", threshold: variant === "mask" || variant === "image" ? 0.05 : 0.12 });
  const Tag = as as React.ElementType;
  const style = { "--rv-delay": `${delay}ms`, ...(step != null ? { "--rv-step": `${step}ms` } : null) } as React.CSSProperties;
  return (
    <Tag ref={ref} className={`rv rv--${variant} ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
