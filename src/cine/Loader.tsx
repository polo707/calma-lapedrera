"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { cine } from "@/i18n/cine";
import { refreshCine } from "./scroll";

/**
 * Pantalla de carga: sello "C", barra y contador 00–100 atados a la carga real
 * de las imágenes del escenario y las fuentes. Sin JS no se muestra (solo bajo html.js).
 * Tope de seguridad: 5 s.
 */
export function Loader() {
  const { lang } = useLang();
  const c = cine(lang);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".stage img"));
    const total = imgs.length + 1; // + fuentes
    let loaded = 0;
    let finished = false;
    const bump = () => {
      loaded += 1;
      setPct(Math.min(100, Math.round((loaded / total) * 100)));
      if (loaded >= total) finish();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      setPct(100);
      window.setTimeout(() => setDone(true), 350);
      window.setTimeout(() => {
        setGone(true);
        refreshCine();
      }, 1400);
    };
    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth > 0) bump();
      else {
        img.addEventListener("load", bump, { once: true });
        img.addEventListener("error", bump, { once: true });
      }
    });
    document.fonts?.ready.then(bump).catch(bump);
    const safety = window.setTimeout(finish, 5000);
    return () => window.clearTimeout(safety);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-loading", !done);
    return () => document.documentElement.classList.remove("is-loading");
  }, [done]);

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
