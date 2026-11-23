"use client";

import Image from "next/image";
import { useLang } from "@/i18n/LangProvider";
import { useData } from "@/lib/store";
import { currentRate } from "@/lib/pricing";
import { useMounted } from "@/lib/useMounted";
import type { SedeId } from "@/lib/types";
import { INSTAGRAM_FOLLOWERS, INSTAGRAM_URL } from "@/config/site";
import { waLink } from "@/lib/booking";

import fotoPedrera from "../../public/photos/aframe-dia-deck.jpg";
import fotoSanSe from "../../public/photos/camino-eucaliptos.jpg";
import fotoLiving from "../../public/photos/living-ventanal.jpg";
import fotoAltillo from "../../public/photos/altillo-cama.jpg";
import fotoBano from "../../public/photos/bano.jpg";
import fotoPicada from "../../public/photos/picada-salamandra.jpg";
import fotoPlaya from "../../public/photos/playa-atardecer.jpg";
import fotoCielo from "../../public/photos/cielo-estrellado.jpg";
import fotoCartel from "../../public/photos/cartel-elementos.jpg";
import fotoAerea from "../../public/photos/vista-aerea.jpg";

const SEDE_PHOTO = { pedrera: fotoPedrera, sansebastian: fotoSanSe } as const;

/** Precio "desde": en el servidor se muestra la tarifa baja; en el cliente, la vigente hoy. */
function useRate() {
  const data = useData();
  const mounted = useMounted();
  return (id: string) => {
    const c = data.cabins.find((x) => x.id === id);
    if (!c) return 0;
    return mounted ? currentRate(c, data.settings) : c.rateLow;
  };
}

export function Sedes() {
  const { d } = useLang();
  const data = useData();
  const rate = useRate();
  const ids: SedeId[] = ["pedrera", "sansebastian"];
  return (
    <section className="section" id="sedes" aria-labelledby="sedes-title">
      <div className="container">
        <div className="section__head">
          <h2 id="sedes-title">{d.sedesTitle}</h2>
          <p className="lead muted">{d.sedesLead}</p>
        </div>
        <div className="sedes">
          {ids.map((id) => {
            const s = d.sedes[id];
            const cabins = data.cabins.filter((c) => c.sedeId === id);
            return (
              <article key={id} className="sede">
                <figure className="photo sede__photo">
                  <Image src={SEDE_PHOTO[id]} alt={`${s.name}: ${s.tag}`} placeholder="blur" sizes="(max-width: 60rem) 100vw, 50vw" />
                </figure>
                <p className="label">{s.tag}</p>
                <h3 className="sede__name">{s.name}</h3>
                <p className="sede__body">{s.body}</p>
                <p className="sede__distance">{s.distance}</p>
                <ul className="rows" aria-label={d.cabins.title}>
                  {cabins.map((c) => (
                    <li key={c.id} className="row">
                      <span>{d.cabinWord} {c.name}</span>
                      <span className="num">USD {rate(c.id)} <span className="muted">{d.cabins.perNight}</span></span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Cabins() {
  const { d } = useLang();
  const data = useData();
  const gallery = [fotoLiving, fotoAltillo, fotoBano, fotoPicada];
  return (
    <section className="section section--tint" id="cabanas" aria-labelledby="cabanas-title">
      <div className="container">
        <div className="section__head">
          <h2 id="cabanas-title">{d.cabins.title}</h2>
          <p className="lead muted">{d.cabins.lead}</p>
        </div>

        <div className="spec" role="table" aria-label={d.cabins.title}>
          <div className="spec__head" role="row">
            <span role="columnheader">{d.cabinWord}</span>
            <span role="columnheader">{d.cabins.sede}</span>
            <span role="columnheader">{d.cabins.type}</span>
            <span role="columnheader">{d.cabins.guests}</span>
            <span role="columnheader" className="spec__r">{d.cabins.low}</span>
            <span role="columnheader" className="spec__r">{d.cabins.high}</span>
          </div>
          {data.cabins.map((c) => (
            <div key={c.id} className="spec__row" role="row">
              <span role="cell" className="spec__name">
                <span className="spec__thumb">
                  <Image src={c.photo} alt="" width={96} height={96} sizes="96px" />
                </span>
                <span className="spec__title">{c.name}</span>
              </span>
              <span role="cell" data-label={d.cabins.sede}>{d.sedes[c.sedeId].name}</span>
              <span role="cell" data-label={d.cabins.type}>{d.cabins.kind[c.kind]}</span>
              <span role="cell" data-label={d.cabins.guests}>{d.cabins.capacity(c.capacity)}</span>
              <span role="cell" data-label={d.cabins.low} className="spec__r num">USD {c.rateLow}</span>
              <span role="cell" data-label={d.cabins.high} className="spec__r num spec__price">USD {c.rateHigh}</span>
            </div>
          ))}
        </div>

        <div className="included">
          <div>
            <h3>{d.cabins.includedTitle}</h3>
            <p className="muted included__note">{d.cabins.onlyLodging}</p>
          </div>
          <ul className="included__list">
            {d.cabins.amenities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        <div className="gallery">
          {gallery.map((g, i) => (
            <figure key={i} className="photo">
              <Image src={g} alt={d.cabins.gallery[i]} placeholder="blur" sizes="(max-width: 40rem) 50vw, 25vw" />
              <figcaption>{d.cabins.gallery[i]}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Entorno() {
  const { lang } = useLang();
  const copy = {
    es: { title: "Bosque de día, cielo de noche", items: ["La playa, a la hora azul", "El cielo sin luces de ciudad", "Los senderos de Calma"] },
    en: { title: "Forest by day, sky by night", items: ["The beach at blue hour", "A sky without city lights", "The paths around Calma"] },
    pt: { title: "Mata de dia, céu de noite", items: ["A praia na hora azul", "O céu sem luzes da cidade", "As trilhas da Calma"] },
  }[lang];
  const photos = [fotoPlaya, fotoCielo, fotoCartel];
  return (
    <section className="section" id="entorno" aria-labelledby="entorno-title">
      <div className="container">
        <h2 id="entorno-title" className="section__solo">{copy.title}</h2>
        <div className="entorno">
          {photos.map((p, i) => (
            <figure key={i} className={`photo entorno__item entorno__item--${i}`}>
              <Image src={p} alt={copy.items[i]} placeholder="blur" sizes="(max-width: 60rem) 100vw, 33vw" />
              <figcaption>{copy.items[i]}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pets() {
  const { d } = useLang();
  const data = useData();
  const rules = d.pet.rules(data.settings.maxPets, data.settings.petFee);
  return (
    <section className="section section--tint" id="mascotas" aria-labelledby="pet-title">
      <div className="container pets">
        <div>
          <h2 id="pet-title">{d.pet.title}</h2>
          <p className="lead muted">{d.pet.body}</p>
        </div>
        <ol className="rows rows--ink pets__rules">
          {rules.map((r, i) => (
            <li key={i} className="row">
              <span className="num muted">{String(i + 1).padStart(2, "0")}</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Location() {
  const { d } = useLang();
  const data = useData();
  const faqs = d.faq.items(data.settings);
  return (
    <section className="section" id="como-llegar" aria-labelledby="llegar-title">
      <div className="container split">
        <div>
          <h2 id="llegar-title">{d.location.title}</h2>
          <p className="lead muted">{d.location.body}</p>
          <dl className="rows rows--ink">
            <div className="row row--stack">
              <dt>{d.location.car}</dt>
              <dd>{d.location.carBody}</dd>
            </div>
            <div className="row row--stack">
              <dt>{d.location.bus}</dt>
              <dd>{d.location.busBody}</dd>
            </div>
            <div className="row row--stack">
              <dt>{d.location.between}</dt>
              <dd>{d.location.betweenBody}</dd>
            </div>
          </dl>
          <figure className="photo llegar__photo">
            <Image src={fotoAerea} alt={d.sedes.sansebastian.name} placeholder="blur" sizes="(max-width: 60rem) 100vw, 40vw" />
          </figure>
        </div>
        <div id="preguntas">
          <h2>{d.faq.title}</h2>
          <div className="faq">
            {faqs.map((f, i) => (
              <details key={i} className="faq__item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { d } = useLang();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="footer__mark">Calma</p>
          <p className="footer__line">{d.footer.line}</p>
        </div>
        <ul className="footer__links">
          <li>
            <a className="link link--light" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">{d.footer.follow}</a>
            <p className="footer__small">{d.footer.followers(INSTAGRAM_FOLLOWERS)}</p>
          </li>
          <li>
            <a className="link link--light" href={waLink(d.wa.hello)} target="_blank" rel="noopener noreferrer">{d.footer.whatsapp}</a>
          </li>
        </ul>
        <p className="footer__small footer__rights">{d.footer.rights}</p>
      </div>
    </footer>
  );
}
