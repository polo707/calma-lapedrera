"use client";

import { useLang } from "@/i18n/LangProvider";
import { LANGS } from "@/i18n/dict";

export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, d } = useLang();
  return (
    <div className={`lang ${className}`} role="group" aria-label={d.nav.lang}>
      {LANGS.map((l) => (
        <button key={l} type="button" className="lang__btn" aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { d } = useLang();
  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#top" className="wordmark" aria-label="Calma La Pedrera">
          <span className="wordmark__name">Calma</span>
          <span className="wordmark__place">La Pedrera</span>
        </a>
        <nav className="nav__links" aria-label={d.nav.menu}>
          <a href="#sedes">{d.nav.sedes}</a>
          <a href="#cabanas">{d.nav.cabins}</a>
          <a href="#disponibilidad">{d.nav.availability}</a>
          <a href="#mascotas">{d.nav.pet}</a>
          <a href="#preguntas">{d.nav.faq}</a>
        </nav>
        <div className="nav__end">
          <LangSwitch />
          <a href="#reservar" className="btn btn--sm">{d.nav.book}</a>
        </div>
      </div>
    </header>
  );
}
