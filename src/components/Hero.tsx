"use client";

import Image from "next/image";
import { Fragment, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLang } from "@/i18n/LangProvider";
import heroPhoto from "../../public/photos/aframe-noche-perro.jpg";

/**
 * Hero con movimiento: zoom lento de la foto al cargar (CSS), titular palabra por palabra (CSS)
 * y parallax suave al hacer scroll (Framer Motion). Todo se apaga con prefers-reduced-motion
 * y el contenido es visible aunque JavaScript no cargue.
 */
export function Hero() {
  const { d, lang } = useLang();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);

  const words = d.hero.title.split(" ");

  return (
    <section ref={ref} className="hero" id="top" aria-labelledby="hero-title">
      <motion.div className="hero__media" style={{ y }}>
        <div className="hero__zoom">
          <Image src={heroPhoto} alt={d.hero.caption} priority placeholder="blur" sizes="100vw" className="hero__img" />
        </div>
      </motion.div>
      <div className="hero__scrim" aria-hidden="true" />
      <div className="container hero__content" key={lang}>
        <h1 id="hero-title" className="hero__title">
          {words.map((w, i) => (
            <Fragment key={`${w}-${i}`}>
              <span className="hero__word" style={{ "--i": i } as React.CSSProperties}>
                {w}
              </span>
              {i < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </h1>
        <p className="hero__sub reveal" style={{ "--i": words.length + 1 } as React.CSSProperties}>
          {d.hero.sub}
        </p>
        <div className="hero__actions reveal" style={{ "--i": words.length + 3 } as React.CSSProperties}>
          <a href="#reservar" className="btn btn--light">{d.hero.cta}</a>
          <a href="#cabanas" className="link link--light">{d.hero.link}</a>
        </div>
      </div>
    </section>
  );
}
