"use client";

import { useState } from "react";
import { addDays, fromISO, monthGrid, monthLabel, todayISO, weekdayInitials, formatDate } from "@/lib/dates";
import type { Lang } from "@/lib/types";
import { t } from "@/i18n/dict";

type Props = {
  lang: Lang;
  busy: Set<string>;
  checkIn: string | null;
  checkOut: string | null;
  minNights: number;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
  compact?: boolean;
};

/** Calendario de rango compartido por el formulario web y el asistente de chat. */
export function RangeCalendar({ lang, busy, checkIn, checkOut, minNights, onChange, compact }: Props) {
  const today = todayISO();
  const start = fromISO(checkIn ?? today);
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const d = t(lang);

  const pickingOut = checkIn !== null && checkOut === null;

  // Última salida posible: la primera noche ocupada después de la llegada.
  let maxOut: string | null = null;
  if (pickingOut && checkIn) {
    let cur = addDays(checkIn, 1);
    for (let i = 0; i < 60; i++) {
      if (busy.has(cur)) {
        maxOut = cur;
        break;
      }
      cur = addDays(cur, 1);
    }
    if (!maxOut) maxOut = addDays(checkIn, 60);
  }
  const minOut = checkIn ? addDays(checkIn, minNights) : null;

  function state(iso: string) {
    const past = iso < today;
    const isBusy = busy.has(iso);
    const inRange = checkIn && checkOut ? iso > checkIn && iso < checkOut : false;
    const isStart = iso === checkIn;
    const isEnd = iso === checkOut;
    let disabled = past;
    if (pickingOut && checkIn) {
      if (iso > checkIn) disabled = past || (minOut !== null && iso < minOut) || (maxOut !== null && iso > maxOut);
      else disabled = past || isBusy;
      if (iso === checkIn) disabled = false;
    } else {
      disabled = past || isBusy;
    }
    return { past, isBusy, inRange, isStart, isEnd, disabled };
  }

  function click(iso: string) {
    if (pickingOut && checkIn) {
      if (iso > checkIn) onChange(checkIn, iso);
      else if (iso === checkIn) onChange(null, null);
      else onChange(iso, null);
    } else {
      onChange(iso, null);
    }
  }

  const minView = fromISO(today);
  const canPrev = view.y > minView.getFullYear() || (view.y === minView.getFullYear() && view.m > minView.getMonth());
  const move = (delta: number) => {
    const nd = new Date(view.y, view.m + delta, 1);
    setView({ y: nd.getFullYear(), m: nd.getMonth() });
  };

  const cells = monthGrid(view.y, view.m);

  return (
    <div className={`cal${compact ? " cal--compact" : ""}`}>
      <div className="cal__head">
        <button type="button" className="cal__nav" onClick={() => move(-1)} disabled={!canPrev} aria-label={d.cal.prevMonth}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
        <span className="cal__month" aria-live="polite">{monthLabel(view.y, view.m, lang)}</span>
        <button type="button" className="cal__nav" onClick={() => move(1)} aria-label={d.cal.nextMonth}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
      </div>
      <div className="cal__grid" role="grid">
        {weekdayInitials(lang).map((w, i) => (
          <span key={`w${i}`} className="cal__wd" aria-hidden="true">{w}</span>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <span key={`e${i}`} className="cal__empty" />;
          const s = state(iso);
          const cls = [
            "cal__day",
            s.isBusy && !s.past ? "is-busy" : "",
            s.inRange ? "is-range" : "",
            s.isStart ? "is-start" : "",
            s.isEnd ? "is-end" : "",
          ].filter(Boolean).join(" ");
          const label = `${formatDate(iso, lang, { weekday: "long", day: "numeric", month: "long" })}${s.isBusy && !s.past ? `, ${d.cal.unavailable}` : ""}`;
          return (
            <button
              key={iso}
              type="button"
              className={cls}
              disabled={s.disabled}
              onClick={() => click(iso)}
              aria-label={label}
              aria-pressed={s.isStart || s.isEnd}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
