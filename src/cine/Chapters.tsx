"use client";

import { Fragment } from "react";
import { useLang } from "@/i18n/LangProvider";
import { cine } from "@/i18n/cine";
import { useData } from "@/lib/store";
import { currentRate } from "@/lib/pricing";
import { useMounted } from "@/lib/useMounted";
import { ReserveButton } from "./ReserveButton";

/** Capítulos cinemáticos 0–4: cada uno es alto (scroll) con un marco de texto sticky sobre el escenario. */
export function Chapters() {
  const { lang, d } = useLang();
  const c = cine(lang);
  const data = useData();
  const mounted = useMounted();
  const glyphs = Array.from(c.hero.script);

  return (
    <>
      {/* 01 Llegada */}
      <section id="top" className="chapter chapter--hero" data-chapter="0" aria-labelledby="hero-title">
        <div className="copy-frame">
          <div className="copy-frame__inner hero-copy" key={lang}>
            <h1 id="hero-title" className="hero-title">
              <span className="hero-title__line">{c.hero.a}</span>
              <span className="visually-hidden"> {c.hero.script} </span>
              <svg className="calligraphy" viewBox="0 0 650 158" role="presentation" aria-hidden="true">
                <text x="6" y="112" className="calligraphy__text">
                  {glyphs.map((g, i) => (
                    <tspan key={i} style={{ "--glyph": i } as React.CSSProperties}>
                      {g}
                    </tspan>
                  ))}
                </text>
                <path className="calligraphy__swash" d="M318 136 C384 150 450 144 486 126 C514 112 500 98 482 110 C464 123 500 146 552 135 C590 127 618 119 646 117" />
              </svg>
              <span className="hero-title__line hero-title__line--b">{c.hero.b}</span>
            </h1>
            <p className="hero-copy__sub">{c.hero.sub}</p>
            <div className="hero-copy__actions">
              <ReserveButton>{c.reserve}</ReserveButton>
              <a href="#sedes" className="ghost-link">{c.discover}</a>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Sedes */}
      <section id="sedes" className="chapter" data-chapter="1" aria-labelledby="ch1-title">
        <div className="copy-frame">
          <div className="copy-frame__inner">
            <p className="chapter__kicker"><span>{c.sedes.n}</span>{c.sedes.label}</p>
            <h2 id="ch1-title" className="chapter__title">{c.sedes.title}</h2>
            <p className="chapter__body">{c.sedes.body}</p>
            <figure className="altitude">
              <svg viewBox="0 0 430 100" aria-hidden="true">
                <path className="altitude__path" d="M8 88 C72 80 112 92 168 68 C214 48 250 52 290 34 C330 16 370 20 420 12" />
                <circle cx="8" cy="88" r="4.5" />
                <circle cx="168" cy="68" r="3" className="altitude__mid" />
                <circle cx="290" cy="34" r="3" className="altitude__mid" />
                <circle cx="420" cy="12" r="4.5" />
              </svg>
              <figcaption>
                <span>{c.sedes.path[0]}</span>
                <span className="altitude__km">{c.sedes.path[1]}</span>
                <span>{c.sedes.path[2]}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 03 Cabañas */}
      <section id="cabanas" className="chapter" data-chapter="2" aria-labelledby="ch2-title">
        <div className="copy-frame">
          <div className="copy-frame__inner">
            <p className="chapter__kicker"><span>{c.cabins.n}</span>{c.cabins.label}</p>
            <h2 id="ch2-title" className="chapter__title">{c.cabins.title}</h2>
            <p className="chapter__body">{c.cabins.body}</p>
            <ul className="chapter__list">
              {data.cabins.map((cb) => (
                <li key={cb.id}>
                  <span className="chapter__list-name">{cb.name}</span>
                  <span className="chapter__list-meta">{d.sedes[cb.sedeId].name}</span>
                  <span className="chapter__list-price">
                    {c.cabins.from} USD {mounted ? currentRate(cb, data.settings) : cb.rateLow} <small>{c.cabins.night}</small>
                  </span>
                </li>
              ))}
            </ul>
            <a href="#cronica" className="ghost-link">{c.cabins.more}</a>
          </div>
        </div>
      </section>

      {/* 04 Adentro */}
      <section id="adentro" className="chapter" data-chapter="3" aria-labelledby="ch3-title">
        <div className="copy-frame">
          <div className="copy-frame__inner">
            <p className="chapter__kicker"><span>{c.inside.n}</span>{c.inside.label}</p>
            <h2 id="ch3-title" className="chapter__title">{c.inside.title}</h2>
            <p className="chapter__body">{c.inside.body}</p>
            <ul className="chapter__tags">
              {d.cabins.amenities.map((a, i) => (
                <Fragment key={a}>
                  <li style={{ "--i": i } as React.CSSProperties}>{a}</li>
                </Fragment>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 05 Noche */}
      <section id="noche" className="chapter" data-chapter="4" aria-labelledby="ch4-title">
        <div className="copy-frame copy-frame--center">
          <div className="copy-frame__inner">
            <p className="chapter__kicker"><span>{c.night.n}</span>{c.night.label}</p>
            <h2 id="ch4-title" className="chapter__title chapter__title--xl">{c.night.title}</h2>
            <p className="chapter__body">{c.night.body}</p>
            <ReserveButton>{c.reserve}</ReserveButton>
          </div>
        </div>
      </section>
    </>
  );
}
