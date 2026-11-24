"use client";

import { useLang } from "@/i18n/LangProvider";
import { sectionsExtra } from "@/i18n/sections-extra";
import type { SedeId } from "@/lib/types";
import { INSTAGRAM_FOLLOWERS, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/config/site";
import { waLink } from "@/lib/booking";
import { Reveal } from "@/components/motion/Reveal";
import { IconArrow, IconInstagram, IconWhatsApp, pad2 } from "./shared";

const SEDES: SedeId[] = ["pedrera", "sansebastian"];

/** Footer: frase de la casa, sedes, contacto, índice y la marca en grande. */
export function Footer() {
  const { d, lang } = useLang();
  const x = sectionsExtra[lang].footer;
  const links = [
    { href: "#sedes", label: d.nav.sedes },
    { href: "#cabanas", label: d.nav.cabins },
    { href: "#disponibilidad", label: d.nav.availability },
    { href: "#mascotas", label: d.nav.pet },
    { href: "#preguntas", label: d.nav.faq },
    { href: "#reservar", label: d.nav.book },
  ];

  return (
    <footer className="sx-ft">
      <div className="container">
        <div className="sx-ft__top">
          <Reveal className="sx-ft__lead">
            <p className="sx-ft__line">{d.footer.line}</p>
          </Reveal>

          <div className="sx-ft__cols">
            <div className="sx-ft__col">
              <h2 className="sx-ft__h">{x.sedes}</h2>
              <ul className="sx-ft__list">
                {SEDES.map((id, i) => (
                  <li key={id} className="sx-ft__sede">
                    <span className="num sx-ft__n" aria-hidden="true">{pad2(i + 1)}</span>
                    <span>
                      <span className="sx-ft__name">{d.sedes[id].name}</span>
                      <span className="sx-ft__small">{d.sedes[id].distance}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sx-ft__col">
              <h2 className="sx-ft__h">{x.contact}</h2>
              <ul className="sx-ft__list">
                <li>
                  <a className="sx-ft__a sx-ft__social" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                    <IconInstagram />
                    <span>@{INSTAGRAM_HANDLE}</span>
                    <span className="visually-hidden"> {x.newTab}</span>
                  </a>
                  <span className="sx-ft__small">{d.footer.followers(INSTAGRAM_FOLLOWERS)}</span>
                </li>
                <li>
                  <a className="sx-ft__a sx-ft__social" href={waLink(d.wa.hello)} target="_blank" rel="noopener noreferrer">
                    <IconWhatsApp />
                    <span>{d.footer.whatsapp}</span>
                    <span className="visually-hidden"> {x.newTab}</span>
                  </a>
                </li>
              </ul>
            </div>

            <nav className="sx-ft__col" aria-labelledby="ft-explore">
              <h2 id="ft-explore" className="sx-ft__h">{x.explore}</h2>
              <ul className="sx-ft__list sx-ft__list--tight">
                {links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="sx-ft__a">{l.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <Reveal variant="mask" className="sx-ft__markwrap">
          <p className="sx-ft__mark" aria-hidden="true">
            Calma
          </p>
        </Reveal>

        <div className="sx-ft__bottom">
          <p className="sx-ft__rights">{d.footer.rights}</p>
          <a href="#top" className="sx-ft__a sx-ft__top-link">
            {x.top}
            <IconArrow dir="up" />
          </a>
        </div>
      </div>
    </footer>
  );
}
