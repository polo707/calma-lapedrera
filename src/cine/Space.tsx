"use client";

import Image, { type StaticImageData } from "next/image";
import { useLang } from "@/i18n/LangProvider";
import { space } from "@/i18n/space";
import { INSTAGRAM_URL } from "@/config/site";

import dormitorio from "../../public/photos/altillo-cama.jpg";
import cocina from "../../public/photos/cocina-completa.jpg";
import bano from "../../public/photos/bano-ducha.jpg";
import living from "../../public/photos/int-living-escalera.jpg";
import deck from "../../public/photos/ext-deck-mesa.jpg";
import wifi from "../../public/photos/int-altillo-escritorio.jpg";

const THUMBS: Record<string, StaticImageData> = { dormitorio, cocina, bano, living, deck, wifi };

/** "El espacio": el predio en cifras y cada ambiente de la cabaña, con lo incluido y los espacios comunes. */
export function Space() {
  const { lang } = useLang();
  const s = space(lang);

  return (
    <section id="espacio" className="chapter-deep space" data-chapter="7" aria-labelledby="sp-title">
      <div className="space__grid">
        <div className="space__aside">
          <div className="deep-head">
            <p className="chapter__kicker"><span>{s.n}</span>{s.label}</p>
            <h2 id="sp-title" className="chapter__title">{s.title}</h2>
            <p className="chapter__body">{s.intro}</p>
          </div>
          <dl className="space__facts">
            {s.facts.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ol className="space__rooms">
          {s.rooms.map((r, i) => (
            <li key={r.id} className="space__room" style={{ "--i": i } as React.CSSProperties}>
              <span className="space__thumb">
                <Image src={THUMBS[r.id]} alt="" fill sizes="120px" placeholder="blur" />
              </span>
              <div>
                <p className="space__n">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="space__t">{r.t}</h3>
                <p className="space__d">{r.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="space__bottom">
        <div className="space__block">
          <h3 className="space__h">{s.commonsTitle}</h3>
          <p>{s.commons}</p>
          <p className="space__beach">{s.beach}</p>
        </div>
        <div className="space__block">
          <h3 className="space__h">{s.includedTitle}</h3>
          <ul className="space__chips">
            {s.included.map((x) => <li key={x}>{x}</li>)}
          </ul>
          <p className="space__note">{s.includedNote}</p>
          <a className="ghost-link" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">{s.follow}</a>
        </div>
      </div>
    </section>
  );
}
