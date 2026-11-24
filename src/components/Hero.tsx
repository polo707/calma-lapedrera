"use client";

import Image, { type StaticImageData } from "next/image";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLang } from "@/i18n/LangProvider";
import { heroExtra } from "@/i18n/hero-extra";
import { usePrefersReducedMotion } from "@/components/motion/usePrefersReducedMotion";
import photoNight from "../../public/photos/aframe-noche-perro.jpg";
import photoLights from "../../public/photos/aframe-luces.jpg";
import photoLiving from "../../public/photos/living-ventanal.jpg";

type Slide = {
  src: StaticImageData;
  /** object-position en móvil / escritorio */
  posM: string;
  posD: string;
  /** Ken Burns: escala inicial, deriva y origen */
  kb: { from: number; x: string; y: string; origin: string };
};

const SLIDES: Slide[] = [
  { src: photoNight, posM: "50% 62%", posD: "50% 70%", kb: { from: 1.14, x: "0%", y: "1.5%", origin: "50% 78%" } },
  { src: photoLights, posM: "58% 55%", posD: "50% 62%", kb: { from: 1.12, x: "-1.6%", y: "0%", origin: "60% 60%" } },
  { src: photoLiving, posM: "50% 52%", posD: "50% 56%", kb: { from: 1.1, x: "1.2%", y: "-1%", origin: "45% 55%" } },
];

/** Línea de tiempo de la entrada (ms) */
const T0 = 450;
const WORD_STEP = 85;

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Hero cinematográfico:
 * - presentación lenta de 3 fotos (fundido cruzado + Ken Burns), con barras de progreso,
 *   botones por foto y pausa; se pausa sola fuera de pantalla, con la pestaña oculta
 *   y con prefers-reduced-motion (ahí queda la primera foto quieta);
 * - entrada del titular palabra por palabra detrás de una máscara;
 * - parallax + leve zoom de la imagen y desvanecido del texto al hacer scroll.
 * Sin JavaScript se ve la primera foto y todo el texto, sin animaciones de ocultamiento.
 */
export function Hero() {
  const { d, lang } = useLang();
  const x = heroExtra[lang];
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pending = useRef(-1);

  const [show, setShow] = useState({ cur: 0, prev: -1 });
  const [userPaused, setUserPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);

  const auto = !reduce;
  const paused = userPaused || !inView || tabHidden;

  // Scroll: la foto se queda atrás y crece apenas; el texto se aleja y se apaga.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, reduce ? 1 : 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.6], [0, reduce ? 0 : 48]);
  const chromeOpacity = useTransform(scrollYProgress, [0, 0.16], [1, reduce ? 1 : 0]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const go = useCallback((i: number) => {
    pending.current = -1;
    setShow((s) => (s.cur === i ? s : { cur: i, prev: s.cur }));
  }, []);

  /** Avanza cuando termina la barra de progreso; si la próxima foto no cargó, espera. */
  const advance = useCallback(() => {
    const next = (show.cur + 1) % SLIDES.length;
    const img = slideRefs.current[next]?.querySelector("img");
    if (img && img.complete && img.naturalWidth > 0) go(next);
    else pending.current = next;
  }, [show.cur, go]);

  const onFillEnd = useCallback(
    (e: React.AnimationEvent<HTMLSpanElement>) => {
      if (e.animationName === "hero-progress") advance();
    },
    [advance],
  );

  const onSlideLoad = useCallback(
    (i: number) => {
      if (pending.current === i) go(i);
    },
    [go],
  );

  const words = d.hero.title.split(" ");
  const tSub = T0 + words.length * WORD_STEP + 220;
  const captions = [d.hero.caption, ...x.captions];

  return (
    <section
      ref={ref}
      className="hero"
      id="top"
      aria-labelledby="hero-title"
      data-auto={auto ? "on" : "off"}
      data-paused={paused ? "true" : "false"}
    >
      <motion.div className="hero__media" style={{ y: mediaY, scale: mediaScale }}>
        {SLIDES.map((s, i) => (
          <div
            key={s.src.src}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="hero__slide"
            data-state={i === show.cur ? "current" : i === show.prev ? "prev" : "idle"}
            aria-hidden={i === 0 ? undefined : true}
            style={
              {
                "--pos-m": s.posM,
                "--pos-d": s.posD,
                "--kb-from": s.kb.from,
                "--kb-x": s.kb.x,
                "--kb-y": s.kb.y,
                "--kb-origin": s.kb.origin,
              } as React.CSSProperties
            }
          >
            <div className="hero__kb">
              <Image
                src={s.src}
                alt={i === 0 ? d.hero.caption : ""}
                priority={i === 0}
                fetchPriority={i === 0 ? undefined : "low"}
                placeholder="blur"
                sizes="100vw"
                className="hero__img"
                onLoad={i === 0 ? undefined : () => onSlideLoad(i)}
              />
            </div>
          </div>
        ))}
      </motion.div>
      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__veil" aria-hidden="true" />

      <motion.div className="container hero__content" style={{ opacity: copyOpacity, y: copyY }}>
        <div key={lang} className="hero__copy">
          <h1 id="hero-title" className="hero__title" aria-label={d.hero.title}>
            {words.map((w, i) => (
              <Fragment key={`${w}-${i}`}>
                <span className="hero__w" aria-hidden="true">
                  <span className="hero__wi" style={{ "--d": `${T0 + i * WORD_STEP}ms` } as React.CSSProperties}>
                    {w}
                  </span>
                </span>
                {i < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>
          <p className="hero__sub hero__in" style={{ "--d": `${tSub}ms` } as React.CSSProperties}>
            {d.hero.sub}
          </p>
          <div className="hero__actions hero__in" style={{ "--d": `${tSub + 160}ms` } as React.CSSProperties}>
            <a href="#reservar" className="btn btn--light hero__cta">
              {d.hero.cta}
            </a>
            <a href="#cabanas" className="link link--light hero__link">
              <span>{d.hero.link}</span>
              <svg className="hero__arrow" width="18" height="10" viewBox="0 0 18 10" aria-hidden="true" focusable="false">
                <path d="M0 5h16.5M12.5 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div className="hero__meta" style={{ opacity: chromeOpacity }}>
        <div className="hero__controls" role="group" aria-label={x.slides}>
          <span className="hero__count" aria-hidden="true">
            {pad2(show.cur + 1)}
            <span className="hero__count-sep">/</span>
            {pad2(SLIDES.length)}
          </span>
          <ol className="hero__dots">
            {SLIDES.map((s, i) => (
              <li key={s.src.src}>
                <button
                  type="button"
                  className="hero__dot"
                  aria-label={x.slide(i + 1, SLIDES.length)}
                  aria-current={i === show.cur ? "true" : undefined}
                  onClick={() => go(i)}
                >
                  <span className="hero__bar">
                    <span className="hero__fill" onAnimationEnd={i === show.cur ? onFillEnd : undefined} />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {auto ? (
            <button
              type="button"
              className="hero__toggle"
              aria-label={userPaused ? x.play : x.pause}
              onClick={() => setUserPaused((p) => !p)}
            >
              {userPaused ? (
                <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true" focusable="false">
                  <path d="M1 1l8 5-8 5z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true" focusable="false">
                  <path d="M2 1v10M8 1v10" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          ) : null}
        </div>
        <p className="hero__caption" aria-hidden="true">
          <span key={`${lang}-${show.cur}`} className="hero__caption-t">
            {captions[show.cur]}
          </span>
        </p>
      </motion.div>

      <motion.a href="#sedes" className="hero__cue" aria-label={x.cueAria} style={{ opacity: chromeOpacity }}>
        <span className="hero__cue-label" aria-hidden="true">
          {x.cue}
        </span>
        <span className="hero__cue-line" aria-hidden="true" />
      </motion.a>
    </section>
  );
}
