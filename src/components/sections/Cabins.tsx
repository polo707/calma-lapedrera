"use client";

import Image from "next/image";
import { useLang } from "@/i18n/LangProvider";
import { sectionsExtra } from "@/i18n/sections-extra";
import { useData } from "@/lib/store";
import { Reveal } from "@/components/motion/Reveal";
import { cabinPhoto, pad2, useRovingTabs } from "./shared";
import { InteriorStrip } from "./InteriorStrip";

/**
 * Cabañas: una vitrina. La lista de las cinco cabañas (datos en vivo de /admin) y una sola
 * imagen grande que cambia con la cabaña elegida, con su ficha (tipo, huéspedes, tarifas).
 * Debajo, lo que incluyen todas y el recorrido interior en una tira horizontal.
 */
export function Cabins() {
  const { d, lang } = useLang();
  const x = sectionsExtra[lang].cabins;
  const data = useData();
  const cabins = data.cabins;
  const { active, setActive, refs, onKeyDown } = useRovingTabs(cabins.length);
  const cur = cabins[active];

  return (
    <section className="section section--tint sx-cabins" id="cabanas" aria-labelledby="cabanas-title">
      <div className="container">
        <div className="section__head">
          <Reveal>
            <h2 id="cabanas-title">{d.cabins.title}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lead muted">{d.cabins.lead}</p>
          </Reveal>
        </div>

        <div className="sx-show">
          <div className="sx-show__list" role="tablist" aria-label={x.pickLabel} aria-orientation="vertical" onKeyDown={onKeyDown}>
            {cabins.map((c, i) => (
              <Reveal key={c.id} variant="fade" delay={i * 70} className="sx-show__item">
                <button
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  id={`cabin-tab-${c.id}`}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-controls="cabin-stage"
                  tabIndex={i === active ? 0 : -1}
                  className="sx-show__tab"
                  onClick={() => setActive(i)}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setActive(i);
                  }}
                >
                  <span className="num sx-show__n">{pad2(i + 1)}</span>
                  <span className="sx-show__name">{c.name}</span>
                  <span className="sx-show__meta">
                    <span className="sx-show__sede">{d.sedes[c.sedeId].name}</span>
                    <span className="sx-show__from">
                      <span className="muted">{x.from}</span> <span className="num">USD {c.rateLow}</span>
                    </span>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>

          {cur ? (
            <div className="sx-show__stage" id="cabin-stage" role="tabpanel" aria-labelledby={`cabin-tab-${cur.id}`}>
              <Reveal variant="mask" className="sx-show__frame">
                {cabins.map((c, i) => (
                  <div key={c.id} className={`sx-xfade${i === active ? " is-active" : ""}`}>
                    <Image
                      src={cabinPhoto(c.photo)}
                      alt={i === active ? x.stageAlt(c.name, d.cabins.kind[c.kind], d.sedes[c.sedeId].name) : ""}
                      aria-hidden={i === active ? undefined : true}
                      placeholder={typeof cabinPhoto(c.photo) === "string" ? "empty" : "blur"}
                      fill
                      sizes="(max-width: 60rem) 100vw, 55vw"
                    />
                  </div>
                ))}
                <p className="sx-show__badge num" aria-hidden="true">
                  {pad2(active + 1)} / {pad2(cabins.length)}
                </p>
              </Reveal>

              <div className="sx-spec" key={cur.id}>
                <p className="sx-spec__title">
                  <span className="sx-spec__name">{d.cabinWord} {cur.name}</span>
                  <span className="sx-spec__sede">{d.sedes[cur.sedeId].name}</span>
                </p>
                <dl className="sx-spec__grid">
                  <div className="sx-spec__cell">
                    <dt>{d.cabins.type}</dt>
                    <dd>{d.cabins.kind[cur.kind]}</dd>
                  </div>
                  <div className="sx-spec__cell">
                    <dt>{d.cabins.guests}</dt>
                    <dd>{d.cabins.capacity(cur.capacity)}</dd>
                  </div>
                  <div className="sx-spec__cell">
                    <dt>{d.cabins.low}</dt>
                    <dd>
                      <span className="num sx-spec__price">USD {cur.rateLow}</span> <span className="muted">{d.cabins.perNight}</span>
                    </dd>
                  </div>
                  <div className="sx-spec__cell">
                    <dt>{d.cabins.high}</dt>
                    <dd>
                      <span className="num sx-spec__price">USD {cur.rateHigh}</span> <span className="muted">{d.cabins.perNight}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}
        </div>

        <div className="sx-incl">
          <Reveal className="sx-incl__head">
            <h3 className="sx-incl__title">{d.cabins.includedTitle}</h3>
            <p className="sx-incl__note">{d.cabins.onlyLodging}</p>
          </Reveal>
          <ul className="sx-incl__list">
            {d.cabins.amenities.map((a, i) => (
              <Reveal as="li" key={a} delay={i * 60} className="sx-incl__item">
                <span className="num sx-incl__n" aria-hidden="true">{pad2(i + 1)}</span>
                <span>{a}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      <InteriorStrip />
    </section>
  );
}
