"use client";

import Image from "next/image";
import { useLang } from "@/i18n/LangProvider";
import { sectionsExtra } from "@/i18n/sections-extra";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax, pad2 } from "./shared";

import fotoPlaya from "../../../public/photos/playa-atardecer.jpg";
import fotoCielo from "../../../public/photos/cielo-estrellado.jpg";
import fotoHojas from "../../../public/photos/hojas.jpg";

/**
 * Entorno: un collage editorial de tres piezas superpuestas (playa, cielo, hoja) que se
 * mueven a distinta velocidad. Nunca más de tres imágenes a la vez.
 */
export function Entorno() {
  const { lang } = useLang();
  const x = sectionsExtra[lang].entorno;

  return (
    <section className="section sx-env" id="entorno" aria-labelledby="entorno-title">
      <div className="container sx-env__grid">
        <div className="sx-env__text">
          <Reveal>
            <h2 id="entorno-title">{x.title}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lead muted sx-env__lead">{x.lead}</p>
          </Reveal>
          <ol className="sx-env__caps">
            {x.items.map((t, i) => (
              <Reveal as="li" key={i} delay={200 + i * 80} className="sx-env__cap">
                <span className="num">{pad2(i + 1)}</span>
                <span>{t}</span>
              </Reveal>
            ))}
          </ol>
        </div>

        <div className="sx-env__collage">
          <Parallax className="sx-env__a" distance={18}>
            <Reveal as="figure" variant="mask" className="sx-env__fig">
              <Image src={fotoPlaya} alt={x.items[0]} placeholder="blur" sizes="(max-width: 60rem) 80vw, 40vw" />
              <span className="sx-env__tag num" aria-hidden="true">01</span>
            </Reveal>
          </Parallax>
          <Parallax className="sx-env__b" distance={-36}>
            <Reveal as="figure" variant="mask" delay={160} className="sx-env__fig">
              <Image src={fotoCielo} alt={x.items[1]} placeholder="blur" sizes="(max-width: 60rem) 60vw, 28vw" />
              <span className="sx-env__tag num" aria-hidden="true">02</span>
            </Reveal>
          </Parallax>
          <Parallax className="sx-env__c" distance={44}>
            <Reveal as="figure" variant="mask" delay={320} className="sx-env__fig">
              <Image src={fotoHojas} alt={x.items[2]} placeholder="blur" sizes="(max-width: 60rem) 40vw, 16vw" />
              <span className="sx-env__tag num" aria-hidden="true">03</span>
            </Reveal>
          </Parallax>
        </div>
      </div>
    </section>
  );
}
