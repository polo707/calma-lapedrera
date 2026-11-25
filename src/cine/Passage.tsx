"use client";

import Image from "next/image";
import { useLang } from "@/i18n/LangProvider";
import { cine } from "@/i18n/cine";
import { useData } from "@/lib/store";
import { ReserveButton } from "./ReserveButton";

import fuego from "../../public/photos/salamandra-noche.jpg";
import playa from "../../public/photos/playa-atardecer.jpg";
import cielo from "../../public/photos/aframe-luces.jpg";

const PHOTOS = [fuego, playa, cielo];

/** "Tres noches": grilla de 3 columnas, fotos en gris que toman color y un sello caligráfico animado. */
export function Passage() {
  const { lang } = useLang();
  const c = cine(lang);
  const data = useData();
  const items = c.passage.items(data.settings.checkIn);

  return (
    <section id="tres-noches" className="chapter-deep passage" data-chapter="6" aria-labelledby="ch6-title">
      <div className="deep-head">
        <p className="chapter__kicker"><span>{c.passage.n}</span>{c.passage.label}</p>
        <h2 id="ch6-title" className="chapter__title">{c.passage.title}</h2>
      </div>
      <span className="passage-seal" aria-hidden="true">{c.passage.seal}</span>
      <ol className="passage-list">
        {items.map((it, i) => (
          <li key={it.k} className="passage-item" style={{ "--i": i } as React.CSSProperties}>
            <figure className="passage-item__photo">
              <Image src={PHOTOS[i]} alt="" fill sizes="(max-width: 820px) 100vw, 33vw" placeholder="blur" />
            </figure>
            <p className="passage-item__k">{it.k}</p>
            <h3 className="passage-item__t">{it.t}</h3>
            <p className="passage-item__d">{it.d}</p>
          </li>
        ))}
      </ol>
      <div className="passage__cta">
        <ReserveButton>{c.passage.cta}</ReserveButton>
      </div>
    </section>
  );
}
