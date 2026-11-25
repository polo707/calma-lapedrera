"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/i18n/LangProvider";
import { cine } from "@/i18n/cine";
import { getLenis } from "@/components/motion/SmoothScroll";

import extDeck from "../../public/photos/ext-deck-mesa.jpg";
import extAgua from "../../public/photos/ext-agua-cielo.jpg";
import extNoche from "../../public/photos/ext-noche-deck.jpg";
import intVentanal from "../../public/photos/int-ventanal-mar.jpg";
import intEscalera from "../../public/photos/int-living-escalera.jpg";
import intCenital from "../../public/photos/int-living-cenital.jpg";
import intAngular from "../../public/photos/int-gran-angular.jpg";
import intEscritorio from "../../public/photos/int-altillo-escritorio.jpg";
import perroAlfombra from "../../public/photos/perro-alfombra.jpg";
import cocinaCompleta from "../../public/photos/cocina-completa.jpg";
import cocinaHeladera from "../../public/photos/cocina-heladera.jpg";
import cocinaDetalle from "../../public/photos/cocina-detalle.jpg";
import banoLavabo from "../../public/photos/bano-lavabo.jpg";
import banoEspejo from "../../public/photos/bano-espejo.jpg";
import banoLateral from "../../public/photos/bano-lavabo-lateral.jpg";
import banoDucha from "../../public/photos/bano-ducha.jpg";
import banoDuchaDet from "../../public/photos/bano-ducha-detalle.jpg";
import banoToalla from "../../public/photos/bano-toalla.jpg";

type Cat = "ext" | "living" | "cocina" | "bano";
type Photo = { id: string; img: StaticImageData; cat: Cat };

const PHOTOS: Photo[] = [
  { id: "int-ventanal-mar", img: intVentanal, cat: "living" },
  { id: "ext-deck-mesa", img: extDeck, cat: "ext" },
  { id: "int-living-escalera", img: intEscalera, cat: "living" },
  { id: "cocina-completa", img: cocinaCompleta, cat: "cocina" },
  { id: "ext-noche-deck", img: extNoche, cat: "ext" },
  { id: "bano-lavabo", img: banoLavabo, cat: "bano" },
  { id: "int-living-cenital", img: intCenital, cat: "living" },
  { id: "perro-alfombra", img: perroAlfombra, cat: "living" },
  { id: "cocina-heladera", img: cocinaHeladera, cat: "cocina" },
  { id: "ext-agua-cielo", img: extAgua, cat: "ext" },
  { id: "bano-ducha", img: banoDucha, cat: "bano" },
  { id: "int-gran-angular", img: intAngular, cat: "living" },
  { id: "cocina-detalle", img: cocinaDetalle, cat: "cocina" },
  { id: "bano-espejo", img: banoEspejo, cat: "bano" },
  { id: "int-altillo-escritorio", img: intEscritorio, cat: "living" },
  { id: "bano-lavabo-lateral", img: banoLateral, cat: "bano" },
  { id: "bano-ducha-detalle", img: banoDuchaDet, cat: "bano" },
  { id: "bano-toalla", img: banoToalla, cat: "bano" },
];

const TABS = ["all", "ext", "living", "cocina", "bano"] as const;
type Tab = (typeof TABS)[number];

/** Galería: filtros por ambiente, tira horizontal con deslizamiento y visor ampliado. */
export function Gallery() {
  const { lang } = useLang();
  const g = cine(lang).gallery;
  const [tab, setTab] = useState<Tab>("all");
  const [open, setOpen] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const list = tab === "all" ? PHOTOS : PHOTOS.filter((p) => p.cat === tab);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [tab]);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <section id="galeria" className="chapter-deep gal-sec" data-chapter="8" aria-labelledby="ch7-title">
      <div className="gallery__head">
        <div className="deep-head">
          <p className="chapter__kicker"><span>{g.n}</span>{g.label}</p>
          <h2 id="ch7-title" className="chapter__title">{g.title}</h2>
          <p className="chapter__body">{g.body}</p>
        </div>
        <div className="gallery__tabs" role="group" aria-label={g.label}>
          {TABS.map((t) => (
            <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}>
              {g.tabs[t]}
              <span className="gallery__count">{t === "all" ? PHOTOS.length : PHOTOS.filter((p) => p.cat === t).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="gallery__strip" ref={trackRef} role="list" aria-label={g.label} tabIndex={0} data-lenis-prevent>
        {list.map((p, i) => (
          <button
            key={`${tab}-${p.id}`}
            type="button"
            role="listitem"
            className={`gallery__tile${p.img.width > p.img.height ? " is-wide" : ""}`}
            style={{ "--i": i } as React.CSSProperties}
            onClick={() => setOpen(i)}
            aria-label={`${g.open}: ${g.caps[p.id] ?? ""}`}
          >
            <span className="gallery__img">
              <Image src={p.img} alt="" fill placeholder="blur" sizes="(max-width: 820px) 80vw, 34vw" />
            </span>
            <span className="gallery__cap">
              <span className="gallery__n">{String(i + 1).padStart(2, "0")}</span>
              {g.caps[p.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="gallery__bar">
        <div className="gallery__progress" aria-hidden="true"><span style={{ transform: `scaleX(${Math.max(0.06, progress)})` }} /></div>
        <div className="gallery__arrows">
          <button type="button" onClick={() => nudge(-1)} aria-label={g.prev}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label={g.next}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        </div>
      </div>

      {open !== null && createPortal(<Lightbox list={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />, document.body)}
    </section>
  );
}

function Lightbox({ list, index, onIndex, onClose }: { list: Photo[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { lang } = useLang();
  const g = cine(lang).gallery;
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const p = list[index];

  const go = useCallback((dir: 1 | -1) => onIndex((index + dir + list.length) % list.length), [index, list.length, onIndex]);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("panel-open");
    getLenis()?.stop();
    closeRef.current?.focus();
    return () => {
      document.documentElement.classList.remove("panel-open");
      getLenis()?.start();
      prevFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={g.caps[p.id] ?? g.label}
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const t = touch.current;
        touch.current = null;
        if (!t) return;
        const dx = e.changedTouches[0].clientX - t.x;
        const dy = e.changedTouches[0].clientY - t.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose();
      }}
    >
      <div className="lightbox__top">
        <span className="lightbox__count">{String(index + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</span>
        <button ref={closeRef} type="button" className="lightbox__btn" onClick={onClose} aria-label={g.close}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
      </div>
      <figure className="lightbox__fig" key={p.id}>
        <div className="lightbox__img">
          <Image src={p.img} alt={g.caps[p.id] ?? ""} fill placeholder="blur" sizes="100vw" quality={85} />
        </div>
        <figcaption>{g.caps[p.id]}</figcaption>
      </figure>
      <button type="button" className="lightbox__btn lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label={g.prev}>
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      </button>
      <button type="button" className="lightbox__btn lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label={g.next}>
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      </button>
    </div>
  );
}
