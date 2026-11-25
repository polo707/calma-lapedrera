"use client";

import { useEffect, useRef } from "react";

export const BOOK_OPEN = "calma:book-open";

export function openBooking() {
  window.dispatchEvent(new Event(BOOK_OPEN));
}

/**
 * Botón principal: borde con degradé cónico animado (--angle), orbe con flecha que gira 45°
 * al hover y un leve desplazamiento magnético según la cercanía del puntero.
 */
export function ReserveButton({ children, tone = "light", className = "" }: { children: React.ReactNode; tone?: "light" | "dark"; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const reach = Math.max(r.width, r.height) * 0.9;
        if (dist < reach) {
          const f = (1 - dist / reach) * 0.22;
          el.style.translate = `${(dx * f).toFixed(1)}px ${(dy * f).toFixed(1)}px`;
        } else if (el.style.translate) {
          el.style.translate = "";
        }
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <button ref={ref} type="button" className={`reserve-button reserve-button--${tone} ${className}`} onClick={openBooking}>
      <span className="reserve-button__label">{children}</span>
      <span className="button-orb" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 11 11 3M5 3h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
      </span>
    </button>
  );
}
