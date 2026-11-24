"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLang } from "@/i18n/LangProvider";
import { sectionsExtra } from "@/i18n/sections-extra";
import { useData } from "@/lib/store";
import { Reveal } from "@/components/motion/Reveal";
import { IconArrow, pad2 } from "./shared";

import fotoPerro from "../../../public/photos/aframe-noche-perro.jpg";

/**
 * Mascotas: retrato del perro (recorte cerrado de la foto del hero: la imagen va a 2x dentro
 * del marco y centrada en el perro; al hacer scroll se abre apenas, escalando sobre él),
 * dos cifras en vivo (máximo de mascotas y cargo) y las reglas numeradas.
 */
export function Pets() {
  const { d, lang } = useLang();
  const x = sectionsExtra[lang].pets;
  const { settings } = useData();
  const rules = d.pet.rules(settings.maxPets, settings.petFee);

  const frame = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.16, 1]);

  return (
    <section className="section section--tint sx-pets" id="mascotas" aria-labelledby="pet-title">
      <div className="container sx-pets__grid">
        <div className="sx-pets__head">
          <Reveal>
            <h2 id="pet-title" className="sx-pets__title">{d.pet.title}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lead muted sx-pets__lead">{d.pet.body}</p>
          </Reveal>
        </div>

        <div ref={frame} className="sx-pets__media">
          <Reveal as="figure" variant="mask" className="sx-pets__frame">
            <motion.div className="sx-pets__zoom plx" style={{ scale }}>
              <Image src={fotoPerro} alt={x.alt} placeholder="blur" fill sizes="(max-width: 60rem) 200vw, 90vw" />
            </motion.div>
          </Reveal>
        </div>

        <div className="sx-pets__body">
          <dl className="sx-pets__figs">
            <Reveal className="sx-pets__fig">
              <dt className="sx-pets__label">{x.maxLabel}</dt>
              <dd className="num sx-pets__value">{settings.maxPets}</dd>
            </Reveal>
            <Reveal className="sx-pets__fig" delay={100}>
              <dt className="sx-pets__label">
                {x.feeLabel} <span className="muted">{x.perStay}</span>
              </dt>
              <dd className="num sx-pets__value">
                <span className="sx-pets__cur">USD</span>
                {settings.petFee}
              </dd>
            </Reveal>
          </dl>

          <ol className="sx-pets__rules">
            {rules.map((r, i) => (
              <Reveal as="li" key={i} delay={i * 80} className="sx-pets__rule">
                <span className="num sx-pets__n" aria-hidden="true">{pad2(i + 1)}</span>
                <span>{r}</span>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={200}>
            <a href="#reservar" className="btn sx-pets__cta">
              {x.cta}
              <IconArrow />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
