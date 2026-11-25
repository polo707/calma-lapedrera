"use client";

import { useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { bx } from "@/i18n/booking-extra";
import { useData } from "@/lib/store";
import { nightState, nightlyRate } from "@/lib/pricing";
import { addDays, formatDate, fromISO, todayISO } from "@/lib/dates";
import { useMounted } from "@/lib/useMounted";
import type { SedeId } from "@/lib/types";

export const PREFILL_EVENT = "calma:prefill";
export type Prefill = { cabinId: string; checkIn: string };

const DAYS = 14;
const TIP_HALF = 112;

type Tip = { x: number; y: number; arrow: number; date: string; price: number };

/** Tablero unificado: todas las cabañas de las dos sedes, noche por noche. */
export function Availability() {
  const { d, lang } = useLang();
  const x = bx(lang);
  const data = useData();
  const mounted = useMounted();
  const [offset, setOffset] = useState(0);
  const [dir, setDir] = useState(0);
  const [tip, setTip] = useState<Tip | null>(null);
  const [tipOn, setTipOn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const sedes: SedeId[] = ["pedrera", "sansebastian"];

  function pick(cabinId: string, iso: string) {
    setTipOn(false);
    window.dispatchEvent(new CustomEvent<Prefill>(PREFILL_EVENT, { detail: { cabinId, checkIn: iso } }));
    window.dispatchEvent(new Event("calma:book-open"));
  }

  function shift(delta: number) {
    setTipOn(false);
    setDir(delta < 0 ? -1 : 1);
    setOffset((o) => (delta < 0 ? Math.max(0, o + delta) : Math.min(180, o + delta)));
  }

  function showTip(el: HTMLElement, iso: string, price: number) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const w = wrap.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const cx = r.left - w.left + r.width / 2;
    const half = Math.min(TIP_HALF, w.width / 2);
    const clamped = Math.min(Math.max(cx, half), w.width - half);
    setTip({
      x: clamped,
      y: r.top - w.top,
      arrow: cx - clamped,
      date: formatDate(iso, lang, { weekday: "short", day: "numeric", month: "short" }),
      price,
    });
    setTipOn(true);
  }

  const today = mounted ? todayISO() : null;
  const start = today ? addDays(today, offset) : null;
  const days = start ? Array.from({ length: DAYS }, (_, i) => addDays(start, i)) : [];
  const weekend = (iso: string) => {
    const g = fromISO(iso).getDay();
    return g === 0 || g === 6;
  };

  return (
    <section className="section avail" id="disponibilidad" aria-labelledby="disp-title">
      <div className="container">
        <div className="section__head">
          <h2 id="disp-title">{d.availability.title}</h2>
          <p className="lead muted">{d.availability.lead}</p>
        </div>

        <div className="board__bar">
          <ul className="legend" aria-label="Leyenda">
            <li><span className="sw sw--free" aria-hidden="true" />{d.availability.free}</li>
            <li><span className="sw sw--booked" aria-hidden="true" />{d.availability.booked}</li>
            <li><span className="sw sw--blocked" aria-hidden="true" />{d.availability.blocked}</li>
            <li><span className="sw sw--today" aria-hidden="true" />{x.board.today}</li>
          </ul>
          <div className="board__nav">
            <button type="button" className="icon-btn" onClick={() => shift(-7)} disabled={offset === 0} aria-label={d.availability.prev}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
            <button type="button" className="icon-btn" onClick={() => shift(7)} aria-label={d.availability.next}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
          </div>
        </div>

        {!mounted ? (
          <p className="muted board__loading">{d.availability.loading}</p>
        ) : (
          <div className="board-wrap" ref={wrapRef}>
            <div
              className={`board${scrolled ? " is-scrolled" : ""}`}
              role="region"
              aria-label={d.availability.title}
              tabIndex={0}
              onScroll={(e) => {
                setTipOn(false);
                setScrolled(e.currentTarget.scrollLeft > 2);
              }}
            >
              <table
                key={offset}
                className={`board__table${dir !== 0 ? " is-shifting" : ""}`}
                style={{ "--board-dir": dir } as React.CSSProperties}
              >
                <thead>
                  <tr>
                    <th scope="col" className="board__corner">
                      <span className="visually-hidden">{d.cabinWord}</span>
                    </th>
                    {days.map((iso, i) => {
                      const dt = fromISO(iso);
                      const isToday = iso === today;
                      const cls = ["board__day", weekend(iso) ? "is-weekend" : "", isToday ? "is-today" : ""].filter(Boolean).join(" ");
                      return (
                        <th key={iso} scope="col" className={cls} style={{ "--c": i } as React.CSSProperties} aria-current={isToday ? "date" : undefined}>
                          <span className="board__wd">{isToday ? x.board.today : formatDate(iso, lang, { weekday: "short" }).replace(".", "")}</span>
                          <span className="board__dn num">{dt.getDate()}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                {sedes.map((sid) => (
                  <tbody key={sid}>
                    <tr className="board__sede">
                      <th scope="rowgroup" colSpan={DAYS + 1}><span>{d.sedes[sid].name}</span></th>
                    </tr>
                    {data.cabins.filter((c) => c.sedeId === sid).map((c) => (
                      <tr key={c.id}>
                        <th scope="row" className="board__cabin">{c.name}</th>
                        {days.map((iso, i) => {
                          const st = nightState(data, c.id, iso);
                          const label = `${c.name}, ${formatDate(iso, lang, { weekday: "long", day: "numeric", month: "long" })}`;
                          const tdCls = ["board__cell", weekend(iso) ? "is-weekend" : "", iso === today ? "is-today" : ""].filter(Boolean).join(" ");
                          const style = { "--c": i } as React.CSSProperties;
                          if (st === "free") {
                            const price = nightlyRate(c, iso, data.settings);
                            return (
                              <td key={iso} className={tdCls}>
                                <button
                                  type="button"
                                  className="cell cell--free"
                                  style={style}
                                  onClick={() => pick(c.id, iso)}
                                  onPointerEnter={(e) => {
                                    if (e.pointerType === "mouse" || e.pointerType === "pen") showTip(e.currentTarget, iso, price);
                                  }}
                                  onPointerLeave={() => setTipOn(false)}
                                  onFocus={(e) => {
                                    if (e.currentTarget.matches(":focus-visible")) showTip(e.currentTarget, iso, price);
                                  }}
                                  onBlur={() => setTipOn(false)}
                                  aria-label={`${label}: ${d.availability.free}, USD ${price} ${d.cabins.perNight}`}
                                />
                              </td>
                            );
                          }
                          return (
                            <td key={iso} className={tdCls}>
                              <span className={`cell cell--${st}`} style={style} role="img" aria-label={`${label}: ${st === "booked" ? d.availability.booked : d.availability.blocked}`} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
            <div
              className={`board__tip${tip && tipOn ? " is-on" : ""}`}
              aria-hidden="true"
              style={tip ? ({ "--tip-x": `${tip.x}px`, "--tip-y": `${tip.y}px`, "--tip-arrow": `${tip.arrow}px` } as React.CSSProperties) : undefined}
            >
              {tip && (
                <>
                  <span className="board__tip-date">{d.availability.free} · {tip.date}</span>
                  <span className="board__tip-price"><span className="num">USD {tip.price}</span> {d.cabins.perNight}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
