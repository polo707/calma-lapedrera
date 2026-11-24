"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { sectionsExtra } from "@/i18n/sections-extra";
import { Reveal } from "@/components/motion/Reveal";
import { IconArrow, pad2 } from "./shared";

import fotoLiving from "../../../public/photos/living-ventanal.jpg";
import fotoAltillo from "../../../public/photos/altillo-cama.jpg";
import fotoBano from "../../../public/photos/bano.jpg";
import fotoPicada from "../../../public/photos/picada-salamandra.jpg";
import fotoSalamandra from "../../../public/photos/salamandra-noche.jpg";
import fotoLivingDia from "../../../public/photos/living-dia.jpg";

const SLIDES = [fotoLiving, fotoAltillo, fotoBano, fotoPicada, fotoSalamandra, fotoLivingDia];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Recorrido interior: una sola tira horizontal con scroll-snap. Se desliza con el dedo,
 * se arrastra con el mouse, y tiene flechas y contador (01 / 06). El scroller es enfocable
 * y se mueve con las flechas del teclado de forma nativa.
 */
export function InteriorStrip() {
  const { lang } = useLang();
  const x = sectionsExtra[lang].cabins;
  const scroller = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [index, setIndex] = useState(0);

  const slides = useCallback(() => Array.from(scroller.current?.querySelectorAll<HTMLElement>(".sx-strip__slide") ?? []), []);

  /** Posición de scroll que alinea la diapositiva i con el borde de inicio. */
  const leftFor = useCallback(
    (i: number) => {
      const el = scroller.current;
      const list = slides();
      const s = list[i];
      if (!el || !s || !list[0]) return 0;
      // El scroller es position: relative, así que offsetLeft es relativo a su contenido.
      return Math.max(0, Math.min(s.offsetLeft - list[0].offsetLeft, el.scrollWidth - el.clientWidth));
    },
    [slides],
  );

  const nearest = useCallback(() => {
    const el = scroller.current;
    if (!el) return 0;
    const list = slides();
    if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) return list.length - 1;
    let best = 0;
    let dist = Infinity;
    list.forEach((_, i) => {
      const dd = Math.abs(leftFor(i) - el.scrollLeft);
      if (dd < dist) {
        dist = dd;
        best = i;
      }
    });
    return best;
  }, [slides, leftFor]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      const p = max > 0 ? el.scrollLeft / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${Math.max(0.04, p)})`;
      setIndex(nearest());
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [nearest]);

  const go = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const n = slides().length;
    const target = Math.max(0, Math.min(n - 1, i));
    el.scrollTo({ left: leftFor(target), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  /* Arrastre con mouse (en táctil el scroll nativo ya funciona). */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scroller.current;
    if (!el) return;
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = drag.current;
    const el = scroller.current;
    if (!st || !el) return;
    const dx = e.clientX - st.x;
    if (!st.moved && Math.abs(dx) > 4) {
      st.moved = true;
      el.classList.add("is-dragging");
      el.setPointerCapture(e.pointerId);
    }
    if (st.moved) el.scrollLeft = st.left - dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = drag.current;
    const el = scroller.current;
    drag.current = null;
    if (!st || !el || !st.moved) return;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    const target = nearest();
    el.classList.remove("is-dragging");
    el.scrollTo({ left: leftFor(target), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const total = SLIDES.length;

  return (
    <div className="sx-strip">
      <div className="container sx-strip__head">
        <Reveal>
          <h3 className="sx-strip__title">{x.insideTitle}</h3>
        </Reveal>
        <div className="sx-strip__controls">
          <p className="sx-strip__count num" aria-hidden="true">
            <span className="sx-strip__cur">{pad2(index + 1)}</span> / {pad2(total)}
          </p>
          <button
            type="button"
            className="icon-btn sx-strip__btn"
            onClick={() => go(index - 1)}
            aria-disabled={index === 0}
            aria-controls="interior-strip"
            aria-label={x.prev}
          >
            <IconArrow dir="left" />
          </button>
          <button
            type="button"
            className="icon-btn sx-strip__btn"
            onClick={() => go(index + 1)}
            aria-disabled={index === total - 1}
            aria-controls="interior-strip"
            aria-label={x.next}
          >
            <IconArrow dir="right" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        id="interior-strip"
        className="sx-strip__scroller"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={x.insideScroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <ol className="sx-strip__track">
          {SLIDES.map((src, i) => (
            <li key={i} className={`sx-strip__slide${src.width === src.height ? " is-square" : ""}`}>
              <figure className="sx-strip__fig">
                <div className="sx-strip__img">
                  <Image src={src} alt={x.inside[i]} placeholder="blur" draggable={false} sizes="(max-width: 40rem) 80vw, 40vw" />
                </div>
                <figcaption className="sx-strip__cap">
                  <span className="num">{pad2(i + 1)}</span>
                  <span>{x.inside[i]}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>

      <div className="container sx-strip__foot" aria-hidden="true">
        <span className="sx-strip__rail">
          <span ref={bar} className="sx-strip__progress" />
        </span>
        <span className="sx-strip__hint">{x.insideLead}</span>
      </div>
    </div>
  );
}
