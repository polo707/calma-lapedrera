"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { cine } from "@/i18n/cine";
import { useData } from "@/lib/store";
import { currentRate } from "@/lib/pricing";
import { useMounted } from "@/lib/useMounted";
import { openBooking } from "./ReserveButton";

import puerta from "../../public/photos/puerta-agua.jpg";
import bano from "../../public/photos/bano.jpg";
import deck from "../../public/photos/aframe-dia-deck.jpg";
import livingDia from "../../public/photos/living-dia.jpg";
import entreArboles from "../../public/photos/aframe-entre-arboles.jpg";
import salamandra from "../../public/photos/salamandra-noche.jpg";
import luces from "../../public/photos/aframe-luces.jpg";
import altillo from "../../public/photos/altillo-cama.jpg";
import bosque from "../../public/photos/cabana-bosque.jpg";
import picada from "../../public/photos/picada-salamandra.jpg";

const PAIRS: Record<string, [StaticImageData, StaticImageData]> = {
  agua: [puerta, bano],
  tierra: [deck, livingDia],
  fuego: [entreArboles, salamandra],
  aire: [luces, altillo],
  bosque: [bosque, picada],
};
const FALLBACK: [StaticImageData, StaticImageData] = [deck, livingDia];

/** Galería "crónica": columnas que se expanden al hover y tarjetas que giran (3D) para ver el interior. */
export function Chronicle() {
  const { lang, d } = useLang();
  const c = cine(lang);
  const data = useData();
  const mounted = useMounted();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  return (
    <section id="cronica" className="chapter-deep chronicle" data-chapter="5" aria-labelledby="ch5-title">
      <svg className="gallery-mist gallery-mist--left" viewBox="0 0 600 400" aria-hidden="true" preserveAspectRatio="none">
        <path d="M0 260 C80 200 160 230 220 190 C300 140 380 180 450 150 C520 120 560 150 600 140 L600 400 L0 400 Z" />
        <path d="M0 320 C120 270 200 300 300 260 C400 220 500 260 600 230 L600 400 L0 400 Z" opacity=".6" />
      </svg>
      <svg className="gallery-mist gallery-mist--right" viewBox="0 0 600 400" aria-hidden="true" preserveAspectRatio="none">
        <path d="M0 150 C60 160 120 120 200 150 C280 180 360 130 440 180 C520 220 560 200 600 250 L600 400 L0 400 Z" />
        <path d="M0 230 C100 260 200 220 300 260 C400 300 480 270 600 320 L600 400 L0 400 Z" opacity=".6" />
      </svg>

      <div className="deep-head">
        <p className="chapter__kicker"><span>{c.chronicle.n}</span>{c.chronicle.label}</p>
        <h2 id="ch5-title" className="chapter__title">{c.chronicle.title}</h2>
        <p className="chapter__body">{c.chronicle.hint}</p>
      </div>

      <div className="gallery-track" role="list">
        {data.cabins.map((cb, i) => {
          const [front, back] = PAIRS[cb.id] ?? FALLBACK;
          const isFlipped = !!flipped[cb.id];
          return (
            <div key={cb.id} className={`gallery-item${isFlipped ? " is-flipped" : ""}`} role="listitem" style={{ "--i": i } as React.CSSProperties}>
              <div className="gallery-card">
                <div className="gallery-face gallery-face--front" aria-hidden={isFlipped}>
                  <Image src={front} alt={`${d.cabinWord} ${cb.name}`} fill sizes="(max-width: 820px) 80vw, 40vw" placeholder="blur" />
                  <div className="gallery-face__shade" />
                  <div className="gallery-face__copy">
                    <span className="gallery-face__n">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="gallery-face__name">{cb.name}</h3>
                    <p className="gallery-face__meta">
                      {d.sedes[cb.sedeId].name} · USD {mounted ? currentRate(cb, data.settings) : cb.rateLow} {c.cabins.night}
                    </p>
                  </div>
                </div>
                <div className="gallery-face gallery-face--back" aria-hidden={!isFlipped}>
                  <Image src={back} alt={`${d.cabinWord} ${cb.name}: ${c.chronicle.flipFront}`} fill sizes="(max-width: 820px) 80vw, 40vw" placeholder="blur" />
                  <div className="gallery-face__shade gallery-face__shade--strong" />
                  <div className="gallery-face__copy">
                    <h3 className="gallery-face__name">{cb.name}</h3>
                    <dl className="gallery-face__specs">
                      <div><dt>{d.cabins.type}</dt><dd>{d.cabins.kind[cb.kind]}</dd></div>
                      <div><dt>{d.cabins.guests}</dt><dd>{c.chronicle.guests(cb.capacity)}</dd></div>
                      <div><dt>{d.cabins.low}</dt><dd>USD {cb.rateLow}</dd></div>
                      <div><dt>{d.cabins.high}</dt><dd>USD {cb.rateHigh}</dd></div>
                    </dl>
                    <button type="button" className="gallery-face__book" onClick={openBooking} tabIndex={isFlipped ? 0 : -1}>
                      {c.chronicle.book}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="gallery-flip"
                aria-pressed={isFlipped}
                onClick={() => setFlipped((f) => ({ ...f, [cb.id]: !f[cb.id] }))}
              >
                <span>{isFlipped ? c.chronicle.flipBack : c.chronicle.flipFront}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7a5 5 0 0 1 9-3M12 7a5 5 0 0 1-9 3M11 1v3H8M3 13v-3h3" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
