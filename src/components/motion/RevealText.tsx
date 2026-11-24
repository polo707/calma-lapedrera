"use client";

import { Fragment, useRef } from "react";
import { useInViewOnce } from "./useInViewOnce";

type Props = {
  /** texto plano (p. ej. d.sedesTitle) */
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  id?: string;
  className?: string;
  /** retraso inicial en ms */
  delay?: number;
  /** ms entre palabras (default 70) */
  step?: number;
};

const HEADINGS = new Set(["h1", "h2", "h3"]);

/**
 * Titular que se descubre palabra por palabra detrás de una máscara (como el hero).
 * Las palabras que caen en la misma línea suben juntas en cascada, así se lee como
 * una entrada por líneas sin medir el layout (no se rompe al cambiar idioma o tamaño).
 * Sin JS o con reduced motion se ve el texto quieto.
 * Uso: <RevealText as="h2" id="sedes-title" text={d.sedesTitle} />
 */
export function RevealText({ text, as = "h2", id, className = "", delay = 0, step = 70 }: Props) {
  const ref = useRef<HTMLElement>(null);
  useInViewOnce(ref, { threshold: 0.3 });
  const Tag = as as React.ElementType;
  const words = text.split(/\s+/).filter(Boolean);
  // En títulos el nombre accesible es el texto entero (los spans se ocultan al lector).
  const a11y = HEADINGS.has(as) ? { "aria-label": text } : {};
  return (
    <Tag
      ref={ref}
      id={id}
      className={`rv-text ${className}`.trim()}
      style={{ "--rv-delay": `${delay}ms`, "--rv-step": `${step}ms` } as React.CSSProperties}
      {...a11y}
    >
      {words.map((w, i) => (
        <Fragment key={`${i}-${w}`}>
          <span className="rv-text__w" aria-hidden={HEADINGS.has(as) || undefined}>
            <span className="rv-text__i" style={{ "--i": i } as React.CSSProperties}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
