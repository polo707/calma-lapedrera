"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { cine } from "@/i18n/cine";
import { refreshCine } from "./scroll";

const DESKTOP = "(min-width: 821px) and (pointer: fine)";

/**
 * Pantalla de carga (solo escritorio): sello "C", barra y contador 00–100 atados a la carga
 * de la primera escena y las fuentes. Tope de 1,4 s. En celulares no se muestra: el contenido
 * aparece directo, que es lo que más importa en conexiones móviles.
 */
export function Loader() {
  const { lang } = useLang();
  const c = cine(lang);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!window.matchMedia(DESKTOP).matches) {
      setDone(true);
      setGone(true);
      return;
    }
    document.documentElement.classList.add("is-loading");
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setPct(100);
      document.documentElement.classList.remove("is-loading");
      window.setTimeout(() => setDone(true), 200);
      window.setTimeout(() => {
        setGone(true);
        refreshCine();
      }, 1200);
    };
    const img = document.querySelector<HTMLImageElement>('.scene-layer[data-scene="0"] .base img');
    let loaded = 0;
    const bump = () => {
      loaded += 1;
      setPct(loaded === 1 ? 60 : 100);
      if (loaded >= 2) finish();
    };
    if (!img || (img.complete && img.naturalWidth > 0)) bump();
    else {
      img.addEventListener("load", bump, { once: true });
      img.addEventListener("error", bump, { once: true });
    }
    document.fonts?.ready.then(bump).catch(bump);
    const safety = window.setTimeout(finish, 1400);
    return () => {
      window.clearTimeout(safety);
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  if (gone) return null;
  return (
    <div className={`loader${done ? " is-done" : ""}`} role="status" aria-live="polite" aria-label={c.loader}>
      <div className="loader__seal" aria-hidden="true">
        <svg viewBox="0 0 120 120" className="loader__ring">
          <circle cx="60" cy="60" r="56" />
          <circle cx="60" cy="60" r="56" className="loader__ring-fill" style={{ strokeDashoffset: 352 - (352 * pct) / 100 }} />
        </svg>
        <span className="loader__glyph">C</span>
      </div>
      <p className="loader__text">{c.loader}</p>
      <div className="loader__bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <p className="loader__count" aria-hidden="true">{String(pct).padStart(2, "0")}</p>
    </div>
  );
}
