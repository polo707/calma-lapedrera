"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { LANGS } from "@/i18n/dict";
import { SmoothScroll, getLenis, scrollToHash } from "@/components/motion/SmoothScroll";

export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, d } = useLang();
  return (
    <div className={`lang ${className}`.trim()} role="group" aria-label={d.nav.lang}>
      {LANGS.map((l) => (
        <button key={l} type="button" className="lang__btn" aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")).filter(
    (el) => el.getClientRects().length > 0 && !el.closest("[inert]"),
  );
}

/**
 * Cabecera fija: transparente (texto claro) sobre el hero y barra ecru con filete de tinta
 * al pasar el hero. Sin JS queda siempre sólida (el estado transparente vive bajo html.js).
 * En pantallas < 64rem suma un menú a pantalla completa con enlaces grandes en Caslon.
 * Monta además el scroll suave (Lenis) y el manejo de enlaces internos.
 */
export function Header() {
  const { d } = useLang();
  const [overHero, setOverHero] = useState(true);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const links = [
    { id: "sedes", label: d.nav.sedes },
    { id: "cabanas", label: d.nav.cabins },
    { id: "disponibilidad", label: d.nav.availability },
    { id: "mascotas", label: d.nav.pet },
    { id: "preguntas", label: d.nav.faq },
  ];
  const menuLinks = [...links, { id: "reservar", label: d.nav.book }];

  // Transparente mientras el hero está debajo de la barra.
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || typeof IntersectionObserver === "undefined") {
      setOverHero(false);
      return;
    }
    const navH = headerRef.current?.offsetHeight ?? 64;
    const io = new IntersectionObserver(([e]) => setOverHero(e.isIntersecting), {
      rootMargin: `-${navH}px 0px 0px 0px`,
      threshold: 0,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Sección actual (subrayado fijo en el enlace de escritorio).
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("main section[id], #preguntas"));
    if (!els.length) return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // el último en orden de documento gana (#preguntas está dentro de #como-llegar)
        const current = [...els].reverse().find((el) => visible.has(el.id));
        setActive(current?.id ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Menú abierto: bloquea el scroll, Escape cierra, Tab queda dentro de la cabecera.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    getLenis()?.stop();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !headerRef.current) return;
      const items = focusables(headerRef.current);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const wide = window.matchMedia("(min-width: 64rem)");
    const onWide = () => {
      if (wide.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    const raf = requestAnimationFrame(() => headerRef.current?.querySelector<HTMLElement>(".menu__link")?.focus({ preventScroll: true }));

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      html.style.overflow = prevOverflow;
      getLenis()?.start();
    };
  }, [open]);

  const onMenuLink = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const hash = e.currentTarget.getAttribute("href") ?? "";
    setOpen(false);
    // se libera el scroll ya (sin esperar al efecto) para poder desplazarse al destino
    document.documentElement.style.overflow = "";
    scrollToHash(hash);
  }, []);

  const closeIfOpen = useCallback(() => {
    if (!open) return;
    setOpen(false);
    document.documentElement.style.overflow = "";
  }, [open]);

  return (
    <>
      <SmoothScroll />
      <header
        ref={headerRef}
        className="nav"
        data-tone={overHero && !open ? "over" : "solid"}
        data-open={open ? "true" : "false"}
      >
        <div className="container nav__inner">
          <a href="#top" className="wordmark" aria-label="Calma La Pedrera" onClick={closeIfOpen}>
            <span className="wordmark__name">Calma</span>
            <span className="wordmark__place">La Pedrera</span>
          </a>
          <nav className="nav__links" aria-label={d.nav.menu}>
            {links.map((l) => (
              <a key={l.id} href={`#${l.id}`} aria-current={active === l.id ? "true" : undefined}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav__end">
            <LangSwitch />
            <a href="#reservar" className="btn btn--sm nav__cta" onClick={closeIfOpen}>
              {d.nav.book}
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="nav__toggle"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={d.nav.menu}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="nav__burger" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div id="site-menu" className="menu" data-open={open ? "true" : "false"} inert={!open} data-lenis-prevent="">
          <nav className="menu__nav" aria-label={d.nav.menu}>
            <ol className="menu__list">
              {menuLinks.map((l, i) => (
                <li key={l.id} className="menu__item" style={{ "--i": i } as React.CSSProperties}>
                  <a href={`#${l.id}`} className={`menu__link${l.id === "reservar" ? " menu__link--book" : ""}`} onClick={onMenuLink}>
                    <span className="menu__num" aria-hidden="true">
                      {pad2(i + 1)}
                    </span>
                    <span className="menu__mask">
                      <span className="menu__text">{l.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="menu__foot" style={{ "--i": menuLinks.length } as React.CSSProperties}>
            <LangSwitch className="lang--menu" />
            <p className="menu__note">{d.hero.sub}</p>
          </div>
        </div>
      </header>
    </>
  );
}
