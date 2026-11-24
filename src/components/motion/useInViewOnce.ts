"use client";

import { useEffect, type RefObject } from "react";

/**
 * Agrega la clase `is-in` al elemento la primera vez que entra en pantalla.
 * Sin IntersectionObserver (navegadores viejos) lo muestra de inmediato.
 */
export function useInViewOnce(
  ref: RefObject<HTMLElement | null>,
  { rootMargin = "0px 0px -12% 0px", threshold = 0.12, observeParent = false }: { rootMargin?: string; threshold?: number; observeParent?: boolean } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { rootMargin, threshold },
    );
    // Chromium no cuenta como visible a un elemento recortado por su propio clip-path:
    // para las variantes con máscara observamos al padre.
    io.observe(observeParent && el.parentElement ? el.parentElement : el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, observeParent]);
}
