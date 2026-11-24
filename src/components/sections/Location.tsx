"use client";

import { useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { sectionsExtra } from "@/i18n/sections-extra";
import { useData } from "@/lib/store";
import type { SedeId } from "@/lib/types";
import { MAPS_EMBED, MAPS_URL } from "@/config/site";
import { Reveal } from "@/components/motion/Reveal";
import { IconArrow, pad2 } from "./shared";

const SEDES: SedeId[] = ["pedrera", "sansebastian"];

/**
 * Cómo llegar: mapa de Google embebido (perezoso, sin API key) con botón para abrir la app,
 * las dos sedes, cómo llegar en auto/ómnibus/entre sedes y las preguntas frecuentes
 * en un acordeón animado y accesible (botón + región).
 */
export function Location() {
  const { d, lang } = useLang();
  const x = sectionsExtra[lang].location;
  const newTab = sectionsExtra[lang].footer.newTab;
  const data = useData();
  const faqs = d.faq.items(data.settings);
  const [open, setOpen] = useState<number | null>(null);

  const ways = [
    { t: d.location.car, b: d.location.carBody },
    { t: d.location.bus, b: d.location.busBody },
    { t: d.location.between, b: d.location.betweenBody },
  ];

  return (
    <section className="section sx-loc" id="como-llegar" aria-labelledby="llegar-title">
      <div className="container">
        <div className="section__head">
          <Reveal>
            <h2 id="llegar-title">{d.location.title}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lead muted">{d.location.body}</p>
          </Reveal>
        </div>

        <div className="sx-loc__grid">
          <div className="sx-loc__mapcol">
            <Reveal variant="mask" className="sx-map">
              <iframe
                className="sx-map__frame"
                src={MAPS_EMBED}
                title={x.mapTitle}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </Reveal>
            <div className="sx-map__bar">
              <p className="sx-map__note">{x.mapNote}</p>
              <a className="btn sx-map__btn" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                {x.open}
                <span className="visually-hidden"> {newTab}</span>
                <IconArrow dir="out" />
              </a>
            </div>
          </div>

          <div className="sx-loc__aside">
            <h3 className="sx-loc__h">{x.sedesTitle}</h3>
            <ol className="sx-loc__sedes">
              {SEDES.map((id, i) => (
                <Reveal as="li" key={id} delay={i * 90} className="sx-loc__sede">
                  <span className="num sx-loc__n" aria-hidden="true">{pad2(i + 1)}</span>
                  <span className="sx-loc__sedetext">
                    <span className="sx-loc__sedename">{d.sedes[id].name}</span>
                    <span className="muted">
                      {d.sedes[id].tag} · {d.sedes[id].distance}
                    </span>
                  </span>
                </Reveal>
              ))}
            </ol>

            <dl className="sx-loc__ways">
              {ways.map((w, i) => (
                <Reveal key={i} delay={i * 90} className="sx-loc__way">
                  <dt>{w.t}</dt>
                  <dd>{w.b}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>

        <div className="sx-faq" id="preguntas">
          <Reveal className="sx-faq__head">
            <h2 id="faq-title">{d.faq.title}</h2>
          </Reveal>
          <div className="sx-faq__list">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className={`sx-faq__item${isOpen ? " is-open" : ""}`}>
                  <h3 className="sx-faq__q">
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      className="sx-faq__btn"
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span className="num sx-faq__n" aria-hidden="true">{pad2(i + 1)}</span>
                      <span className="sx-faq__text">{f.q}</span>
                      <span className="sx-faq__icon" aria-hidden="true" />
                    </button>
                  </h3>
                  <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="sx-faq__a">
                    <div className="sx-faq__inner">
                      <p>{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
