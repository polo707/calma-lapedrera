"use client";

import { useLang } from "@/i18n/LangProvider";
import { LANGS } from "@/i18n/dict";
import { cine } from "@/i18n/cine";
import { SmoothScroll, scrollToHash } from "@/components/motion/SmoothScroll";
import { useCine } from "./scroll";
import { ReserveButton } from "./ReserveButton";

export const CHAPTER_IDS = ["top", "sedes", "cabanas", "adentro", "noche", "cronica", "tres-noches", "espacio", "galeria", "disponibilidad", "mascotas", "como-llegar"];

export function SiteHeader() {
  const { lang, setLang, d } = useLang();
  const c = cine(lang);
  const { active, scrolled, tone } = useCine();

  return (
    <>
      <SmoothScroll />
      <header className={`site-header${scrolled ? " is-scrolled" : ""} site-header--${tone}`}>
        <a href="#top" className="site-header__mark" aria-label="Calma La Pedrera">
          <span className="site-header__seal" aria-hidden="true">C</span>
          <span className="site-header__name">Calma</span>
          <span className="site-header__place">La Pedrera</span>
        </a>
        <nav className="site-header__nav" aria-label={d.nav.menu}>
          <a href="#sedes">{d.nav.sedes}</a>
          <a href="#cronica">{d.nav.cabins}</a>
          <a href="#disponibilidad">{d.nav.availability}</a>
          <a href="#mascotas">{d.nav.pet}</a>
          <a href="#galeria">{c.gallery.label}</a>
          <a href="#como-llegar">{c.rail[c.rail.length - 1]}</a>
        </nav>
        <div className="site-header__end">
          <div className="site-header__lang" role="group" aria-label={d.nav.lang}>
            {LANGS.map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <ReserveButton tone={tone === "light" ? "dark" : "light"} className="reserve-button--sm">
            {d.nav.book}
          </ReserveButton>
        </div>
      </header>

      <nav className={`chapter-rail chapter-rail--${tone}`} aria-label={d.nav.menu}>
        <ol>
          {c.rail.map((label, i) => (
            <li key={label}>
              <a
                href={`#${CHAPTER_IDS[i]}`}
                aria-current={active === i ? "true" : undefined}
                onClick={(e) => {
                  if (scrollToHash(`#${CHAPTER_IDS[i]}`)) e.preventDefault();
                }}
              >
                <span className="chapter-rail__label">{label}</span>
                <span className="chapter-rail__dot" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className={`scroll-cue${scrolled ? " is-hidden" : ""}`} aria-hidden="true">
        <span>{c.cue}</span>
        <i />
      </div>
    </>
  );
}
