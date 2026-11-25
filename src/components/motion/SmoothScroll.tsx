"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Scroll suave (Lenis) para rueda/trackpad + enlaces internos (#reservar, #cabanas…)
 * con el desfase de la cabecera fija.
 * - Apagado con prefers-reduced-motion (scroll nativo, saltos instantáneos).
 * - En táctil el scroll es nativo (Lenis solo suaviza la rueda).
 * - No toca el scroll interno del chat, el tablero de disponibilidad ni el menú:
 *   ahí la rueda pasa directo al elemento.
 */

let lenis: Lenis | null = null;

/** Instancia activa (null si reduced motion o aún no montado). */
export function getLenis(): Lenis | null {
  return lenis;
}

const NATIVE_SCROLL = ".chat, .chat__body, .chat__backdrop, .board, .menu, .bpanel, .gallery-track, [role='dialog'], [data-lenis-prevent]";

function navHeight(): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"));
  return Number.isFinite(v) ? v : 64;
}

/** Posición de destino respetando scroll-margin-top (o la altura de la cabecera). */
function targetY(el: HTMLElement): number {
  if (el.id === "top") return 0;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop);
  const offset = Number.isFinite(margin) && margin > 0 ? margin : navHeight();
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
}

/** Desplaza hasta un elemento; usa Lenis si está activo. */
export function scrollToElement(el: HTMLElement) {
  const y = targetY(el);
  if (lenis) {
    lenis.start();
    lenis.scrollTo(y, { force: true, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
  // foco al destino para teclado/lectores, sin provocar otro salto
  if (el.id === "top") return;
  if (!el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1");
    el.setAttribute("data-scroll-target", "");
  }
  el.focus({ preventScroll: true });
}

/** Maneja un hash ("#reservar"). Devuelve false si no hay destino. */
export function scrollToHash(hash: string): boolean {
  if (!hash || hash === "#") return false;
  let el: HTMLElement | null = null;
  try {
    el = document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    el = null;
  }
  if (!el) return false;
  scrollToElement(el);
  if (window.location.hash !== hash) window.history.pushState(null, "", hash);
  return true;
}

export function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const start = () => {
      if (lenis || mq.matches) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.085,
        smoothWheel: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        prevent: (node) => node.matches(NATIVE_SCROLL),
      });
    };
    const stop = () => {
      lenis?.destroy();
      lenis = null;
    };
    const onMotionPref = () => (mq.matches ? stop() : start());

    // Enlaces internos de toda la página (también los de las otras secciones).
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (!(a instanceof HTMLAnchorElement)) return;
      if (scrollToHash(a.getAttribute("href") ?? "")) e.preventDefault();
    };

    start();
    mq.addEventListener("change", onMotionPref);
    document.addEventListener("click", onClick);
    return () => {
      mq.removeEventListener("change", onMotionPref);
      document.removeEventListener("click", onClick);
      stop();
    };
  }, []);

  return null;
}
