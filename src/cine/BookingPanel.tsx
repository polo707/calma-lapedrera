"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { cine } from "@/i18n/cine";
import { BookingSection } from "@/components/BookingSection";
import { getLenis } from "@/components/motion/SmoothScroll";
import { BOOK_OPEN } from "./ReserveButton";

/**
 * Panel de reserva lateral (diálogo fijo, z 60–61). Siempre montado (oculto con inert)
 * para que el formulario reciba el prellenado desde el tablero de disponibilidad.
 * Cualquier enlace a #reservar de la página lo abre.
 */
export function BookingPanel() {
  const { lang } = useLang();
  const c = cine(lang);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = () => {
      lastFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href='#reservar']");
      if (!a) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      onOpen();
    };
    window.addEventListener(BOOK_OPEN, onOpen);
    window.addEventListener("click", onClick, true);
    if (window.location.hash === "#reservar") onOpen();
    return () => {
      window.removeEventListener(BOOK_OPEN, onOpen);
      window.removeEventListener("click", onClick, true);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!open) {
      root.classList.remove("panel-open");
      getLenis()?.start();
      return;
    }
    root.classList.add("panel-open");
    getLenis()?.stop();
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    window.setTimeout(() => lastFocus.current?.focus?.(), 50);
  }

  return (
    <>
      <div className={`bpanel-backdrop${open ? " is-open" : ""}`} onClick={close} aria-hidden="true" />
      <div
        className={`bpanel${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={c.panel.title}
        inert={!open}
        data-lenis-prevent
      >
        <div className="bpanel__head">
          <p className="bpanel__title">{c.panel.title}</p>
          <button ref={closeRef} type="button" className="bpanel__close" onClick={close} aria-label={c.panel.close}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        </div>
        <div className="bpanel__body">
          <BookingSection />
        </div>
      </div>
    </>
  );
}
