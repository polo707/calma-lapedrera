"use client";

import { useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { useData } from "@/lib/store";
import { nightState } from "@/lib/pricing";
import { addDays, formatDate, fromISO, todayISO } from "@/lib/dates";
import { useMounted } from "@/lib/useMounted";
import type { SedeId } from "@/lib/types";

export const PREFILL_EVENT = "calma:prefill";
export type Prefill = { cabinId: string; checkIn: string };

const DAYS = 14;

/** Tablero unificado: todas las cabañas de las dos sedes, noche por noche. */
export function Availability() {
  const { d, lang } = useLang();
  const data = useData();
  const mounted = useMounted();
  const [offset, setOffset] = useState(0);

  const sedes: SedeId[] = ["pedrera", "sansebastian"];

  function pick(cabinId: string, iso: string) {
    window.dispatchEvent(new CustomEvent<Prefill>(PREFILL_EVENT, { detail: { cabinId, checkIn: iso } }));
    document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const start = mounted ? addDays(todayISO(), offset) : null;
  const days = start ? Array.from({ length: DAYS }, (_, i) => addDays(start, i)) : [];

  return (
    <section className="section" id="disponibilidad" aria-labelledby="disp-title">
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
          </ul>
          <div className="board__nav">
            <button type="button" className="icon-btn" onClick={() => setOffset((o) => Math.max(0, o - 7))} disabled={offset === 0} aria-label={d.availability.prev}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
            <button type="button" className="icon-btn" onClick={() => setOffset((o) => Math.min(180, o + 7))} aria-label={d.availability.next}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
          </div>
        </div>

        {!mounted ? (
          <p className="muted board__loading">{d.availability.loading}</p>
        ) : (
          <div className="board" role="region" aria-label={d.availability.title} tabIndex={0}>
            <table className="board__table">
              <thead>
                <tr>
                  <th scope="col" className="board__corner">
                    <span className="visually-hidden">{d.cabinWord}</span>
                  </th>
                  {days.map((iso) => {
                    const dt = fromISO(iso);
                    const weekend = dt.getDay() === 0 || dt.getDay() === 6;
                    return (
                      <th key={iso} scope="col" className={`board__day${weekend ? " is-weekend" : ""}`}>
                        <span className="board__wd">{formatDate(iso, lang, { weekday: "short" }).replace(".", "")}</span>
                        <span className="board__dn num">{dt.getDate()}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              {sedes.map((sid) => (
                <tbody key={sid}>
                  <tr className="board__sede">
                    <th scope="rowgroup" colSpan={DAYS + 1}>{d.sedes[sid].name}</th>
                  </tr>
                  {data.cabins.filter((c) => c.sedeId === sid).map((c) => (
                    <tr key={c.id}>
                      <th scope="row" className="board__cabin">{c.name}</th>
                      {days.map((iso) => {
                        const st = nightState(data, c.id, iso);
                        const label = `${c.name}, ${formatDate(iso, lang, { weekday: "long", day: "numeric", month: "long" })}`;
                        if (st === "free") {
                          return (
                            <td key={iso} className="board__cell">
                              <button type="button" className="cell cell--free" onClick={() => pick(c.id, iso)} aria-label={`${label}: ${d.availability.free}`} />
                            </td>
                          );
                        }
                        return (
                          <td key={iso} className="board__cell">
                            <span className={`cell cell--${st}`} role="img" aria-label={`${label}: ${st === "booked" ? d.availability.booked : d.availability.blocked}`} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
