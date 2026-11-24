"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  as?: "div" | "section" | "li" | "figure" | "article" | "span" | "p";
  className?: string;
  /** retraso en ms */
  delay?: number;
  /** tipo de entrada: fade-up (default), fade, mask (revela con clip-path), scale */
  variant?: "up" | "fade" | "mask" | "scale";
};

/**
 * Aparición al entrar en pantalla. Sin JS el contenido se ve igual (el estado oculto
 * solo aplica bajo html.js). Respeta prefers-reduced-motion vía CSS.
 * API estable: usar <Reveal variant="up" delay={120}>…</Reveal>.
 */
export function Reveal({ children, as = "div", className = "", delay = 0, variant = "up" }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref} className={`rv rv--${variant} ${className}`} style={{ "--rv-delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}
