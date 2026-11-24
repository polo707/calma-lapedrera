"use client";

import Image from "next/image";
import { useLang } from "@/i18n/LangProvider";
import { sectionsExtra } from "@/i18n/sections-extra";
import { useData } from "@/lib/store";
import type { SedeId } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax, pad2, useRate, useRovingTabs } from "./shared";

import fotoPedrera from "../../../public/photos/cartel-elementos.jpg";
import fotoSanSe from "../../../public/photos/camino-eucaliptos.jpg";

const IDS: SedeId[] = ["pedrera", "sansebastian"];
const PHOTO = { pedrera: fotoPedrera, sansebastian: fotoSanSe } as const;

/**
 * Sedes: una sola idea, dos lugares a 1 km. Pestañas (La Pedrera / San Sebastián):
 * una imagen que cruza a la otra y el texto de cada sede con sus cabañas y tarifa vigente.
 * Sin JS se ven las dos sedes una debajo de la otra.
 */
export function Sedes() {
  const { d, lang } = useLang();
  const x = sectionsExtra[lang].sedes;
  const data = useData();
  const rate = useRate();
  const { active, setActive, refs, onKeyDown } = useRovingTabs(IDS.length);

  return (
    <section className="section sx-sedes" id="sedes" aria-labelledby="sedes-title">
      <div className="container">
        <div className="section__head">
          <Reveal>
            <h2 id="sedes-title">{d.sedesTitle}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lead muted">{d.sedesLead}</p>
          </Reveal>
        </div>

        <div className="sx-sedes__grid">
          <Reveal variant="mask" className="sx-sedes__media">
            <Parallax className="sx-sedes__plx" distance={28}>
              {IDS.map((id, i) => (
                <div key={id} className={`sx-xfade${i === active ? " is-active" : ""}`}>
                  <Image
                    src={PHOTO[id]}
                    alt={i === active ? x.alt[id] : ""}
                    aria-hidden={i === active ? undefined : true}
                    placeholder="blur"
                    fill
                    sizes="(max-width: 60rem) 100vw, 55vw"
                  />
                </div>
              ))}
            </Parallax>
            <p className="sx-sedes__count num" aria-hidden="true">
              {pad2(active + 1)} / {pad2(IDS.length)}
            </p>
          </Reveal>

          <div className="sx-sedes__side">
            <div className="sx-tabs" role="tablist" aria-label={x.tabsLabel} onKeyDown={onKeyDown}>
              {IDS.map((id, i) => (
                <button
                  key={id}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  id={`sede-tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-controls={`sede-panel-${id}`}
                  tabIndex={i === active ? 0 : -1}
                  className="sx-tabs__tab"
                  onClick={() => setActive(i)}
                >
                  <span className="num sx-tabs__n">{pad2(i + 1)}</span>
                  <span className="sx-tabs__name">{d.sedes[id].name}</span>
                </button>
              ))}
              <span className="sx-tabs__bar" aria-hidden="true" style={{ "--i": active } as React.CSSProperties} />
            </div>
            <p className="sx-sedes__apart num" aria-hidden="true">
              <span className="sx-sedes__dot" />
              <span className="sx-sedes__line" />
              <span>{x.apart}</span>
              <span className="sx-sedes__line" />
              <span className="sx-sedes__dot" />
            </p>

            {IDS.map((id, i) => {
              const s = d.sedes[id];
              const cabins = data.cabins.filter((c) => c.sedeId === id);
              return (
                <div
                  key={id}
                  id={`sede-panel-${id}`}
                  role="tabpanel"
                  aria-labelledby={`sede-tab-${id}`}
                  className={`sx-sedes__panel${i === active ? " is-active" : ""}`}
                >
                  <h3 className="sx-sedes__name">{s.name}</h3>
                  <p className="sx-sedes__body">{s.body}</p>
                  <dl className="sx-meta">
                    <div className="sx-meta__row">
                      <dt>{x.landscape}</dt>
                      <dd>{s.tag}</dd>
                    </div>
                    <div className="sx-meta__row">
                      <dt>{x.where}</dt>
                      <dd>{s.distance}</dd>
                    </div>
                    <div className="sx-meta__row sx-meta__row--list">
                      <dt>{x.cabins}</dt>
                      <dd>
                        <ul className="sx-sedes__cabins">
                          {cabins.map((c) => (
                            <li key={c.id}>
                              <a href="#cabanas" className="sx-sedes__cabin">
                                <span>{c.name}</span>
                                <span className="sx-sedes__price">
                                  <span className="num">USD {rate(c.id)}</span> <span className="muted">{d.cabins.perNight}</span>
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
