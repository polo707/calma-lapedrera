"use client";

import { useEffect, useId, useRef, useState } from "react";
import { addDays, diffNights, fromISO, monthGrid, monthLabel, toISO, todayISO, weekdayInitials, formatDate } from "@/lib/dates";
import type { Lang } from "@/lib/types";
import { t } from "@/i18n/dict";
import { bx } from "@/i18n/booking-extra";

type Props = {
  lang: Lang;
  busy: Set<string>;
  checkIn: string | null;
  checkOut: string | null;
  minNights: number;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
  compact?: boolean;
};

const KEY_STEP: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

/** Calendario de rango compartido por el formulario web y el asistente de chat. */
export function RangeCalendar({ lang, busy, checkIn, checkOut, minNights, onChange, compact }: Props) {
  const today = todayISO();
  const start = fromISO(checkIn ?? today);
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const [dir, setDir] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [focusISO, setFocusISO] = useState<string | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const daysRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const d = t(lang);
  const x = bx(lang);

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
    setHover(null);
    setFocusISO(iso);
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
    setDir(delta < 0 ? -1 : 1);
    setView({ y: nd.getFullYear(), m: nd.getMonth() });
  };

  const cells = monthGrid(view.y, view.m);

  // Vista previa del rango mientras se elige la salida (mouse o foco de teclado).
  const preview = pickingOut && checkIn && hover && hover > checkIn && !state(hover).disabled ? hover : null;

  // Foco itinerante: un solo día tabulable dentro del mes visible.
  const enabledInView = cells.filter((iso): iso is string => !!iso && !state(iso).disabled);
  const roving =
    [focusISO, checkOut, checkIn, today].find((c) => c && enabledInView.includes(c)) ?? enabledInView[0] ?? null;

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    daysRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${target}"]`)?.focus();
  });

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const from = (e.target as HTMLElement).dataset.iso;
    if (!from) return;
    let target: string | null = null;
    if (e.key in KEY_STEP) {
      const step = KEY_STEP[e.key];
      let cur = addDays(from, step);
      for (let i = 0; i < 120; i++) {
        if (cur < today && step < 0) break;
        if (!state(cur).disabled) {
          target = cur;
          break;
        }
        cur = addDays(cur, step);
      }
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      const f = fromISO(from);
      const delta = e.key === "PageUp" ? -1 : 1;
      const nd = new Date(f.getFullYear(), f.getMonth() + delta, 1);
      const last = new Date(nd.getFullYear(), nd.getMonth() + 1, 0).getDate();
      nd.setDate(Math.min(f.getDate(), last));
      const iso = toISO(nd);
      if (iso >= today && !state(iso).disabled) target = iso;
    } else {
      return;
    }
    e.preventDefault();
    if (!target) return;
    const td = fromISO(target);
    if (td.getFullYear() !== view.y || td.getMonth() !== view.m) {
      setDir(target > from ? 1 : -1);
      setView({ y: td.getFullYear(), m: td.getMonth() });
    }
    pendingFocus.current = target;
    setFocusISO(target);
    if (pickingOut) setHover(target);
  }

  let hint: React.ReactNode;
  if (checkIn && checkOut) hint = <span className="num">{d.book.nights(diffNights(checkIn, checkOut))}</span>;
  else if (preview && checkIn) hint = <span className="num">{d.book.nights(diffNights(checkIn, preview))}</span>;
  else if (pickingOut) hint = d.chat.flow.minNights(minNights);
  else hint = d.book.pickIn;

  return (
    <div className={`cal rcal${compact ? " cal--compact" : ""}${pickingOut ? " is-picking" : ""}`}>
      <div className="cal__head">
        <button type="button" className="cal__nav" onClick={() => move(-1)} disabled={!canPrev} aria-label={d.cal.prevMonth}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
        <span className="cal__month" id={`${uid}-month`} aria-live="polite">{monthLabel(view.y, view.m, lang)}</span>
        <button type="button" className="cal__nav" onClick={() => move(1)} aria-label={d.cal.nextMonth}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
      </div>
      <div className="cal__grid rcal__wds" aria-hidden="true">
        {weekdayInitials(lang).map((w, i) => (
          <span key={`w${i}`} className="cal__wd">{w}</span>
        ))}
      </div>
      <div
        key={`${view.y}-${view.m}`}
        ref={daysRef}
        className={`cal__grid rcal__days${dir !== 0 ? " is-sliding" : ""}`}
        style={{ "--rcal-dir": dir } as React.CSSProperties}
        role="group"
        aria-labelledby={`${uid}-month`}
        aria-describedby={`${uid}-keys`}
        onKeyDown={onKeyDown}
        onPointerLeave={() => setHover(null)}
      >
        {cells.map((iso, i) => {
          if (!iso) return <span key={`e${i}`} className="cal__empty" />;
          const s = state(iso);
          const inPreview = preview !== null && checkIn !== null && iso > checkIn && iso < preview;
          const cls = [
            "cal__day",
            s.isBusy && !s.past ? "is-busy" : "",
            s.inRange ? "is-range" : "",
            s.isStart ? "is-start" : "",
            s.isEnd ? "is-end" : "",
            s.isStart && (checkOut || preview) ? "has-band" : "",
            inPreview ? "is-preview" : "",
            iso === preview ? "is-preview-end" : "",
            iso === today ? "is-today" : "",
          ].filter(Boolean).join(" ");
          const role = s.isStart ? `, ${x.cal.checkIn}` : s.isEnd ? `, ${x.cal.checkOut}` : "";
          const label = `${formatDate(iso, lang, { weekday: "long", day: "numeric", month: "long" })}${role}${s.isBusy && !s.past ? `, ${d.cal.unavailable}` : ""}`;
          return (
            <button
              key={iso}
              type="button"
              className={cls}
              data-iso={iso}
              disabled={s.disabled}
              tabIndex={iso === roving ? 0 : -1}
              onClick={() => click(iso)}
              onFocus={() => {
                setFocusISO(iso);
                if (pickingOut) setHover(iso);
              }}
              onPointerEnter={(e) => {
                if (e.pointerType !== "touch") setHover(iso);
              }}
              aria-label={label}
              aria-pressed={s.isStart || s.isEnd}
            >
              <span className="rcal__n">{Number(iso.slice(8))}</span>
            </button>
          );
        })}
      </div>
      <p className="rcal__hint" aria-live="polite">{hint}</p>
      <span className="visually-hidden" id={`${uid}-keys`}>{x.cal.keys}</span>
    </div>
  );
}
