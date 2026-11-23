"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { actions, getData, useData } from "@/lib/store";
import { busyNights, isRangeFree, quote } from "@/lib/pricing";
import { bookingMessage, makeCode, makeId, onlyDigits, waLink } from "@/lib/booking";
import { formatDate } from "@/lib/dates";
import { useMounted } from "@/lib/useMounted";
import type { Booking, SedeId } from "@/lib/types";
import { RangeCalendar } from "./RangeCalendar";
import { PREFILL_EVENT, type Prefill } from "./Availability";

export function BookingSection() {
  const { d, lang } = useLang();
  const data = useData();
  const mounted = useMounted();
  const s = data.settings;

  const [sede, setSede] = useState<SedeId>("pedrera");
  const [cabinId, setCabinId] = useState("agua");
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [pet, setPet] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Booking | null>(null);

  const cabin = data.cabins.find((c) => c.id === cabinId) ?? data.cabins[0];
  const busy = useMemo(() => busyNights(data, cabin.id), [data, cabin.id]);
  const q = checkIn && checkOut ? quote(cabin, checkIn, checkOut, pet, s) : null;

  useEffect(() => {
    const onPrefill = (e: Event) => {
      const { cabinId: id, checkIn: ci } = (e as CustomEvent<Prefill>).detail;
      const c = getData().cabins.find((x) => x.id === id);
      if (!c) return;
      setSede(c.sedeId);
      setCabinId(c.id);
      setCheckIn(ci);
      setCheckOut(null);
      setGuests((g) => Math.min(g, c.capacity));
      setDone(null);
      setError(null);
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  function chooseSede(id: SedeId) {
    setSede(id);
    const first = data.cabins.find((c) => c.sedeId === id);
    if (first) chooseCabin(first.id);
  }

  function chooseCabin(id: string) {
    setCabinId(id);
    setCheckIn(null);
    setCheckOut(null);
    const c = data.cabins.find((x) => x.id === id);
    if (c) setGuests((g) => Math.min(g, c.capacity));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!checkIn || !checkOut || !q) return setError(d.book.errDates);
    if (q.nights < s.minNights) return setError(d.book.errMin(s.minNights));
    if (guests > cabin.capacity) return setError(d.book.errCapacity(cabin.capacity));
    if (name.trim().length < 2) return setError(d.book.errName);
    if (onlyDigits(phone).length < 7) return setError(d.book.errPhone);
    const fresh = getData();
    if (!isRangeFree(busyNights(fresh, cabin.id), checkIn, checkOut)) return setError(d.book.errBusy);

    const booking: Booking = {
      id: makeId(),
      code: makeCode(fresh.bookings.map((b) => b.code)),
      cabinId: cabin.id,
      checkIn,
      checkOut,
      guests,
      pet,
      name: name.trim(),
      phone: onlyDigits(phone),
      total: q.total,
      deposit: q.deposit,
      status: "pending",
      source: "web",
      lang,
      createdAt: new Date().toISOString(),
    };
    actions.addBooking(booking);
    setDone(booking);
    window.open(waLink(bookingMessage(booking, cabin, lang)), "_blank", "noopener,noreferrer");
  }

  function reset() {
    setDone(null);
    setCheckIn(null);
    setCheckOut(null);
    setName("");
    setPhone("");
    setPet(false);
  }

  const fmt = (iso: string) => formatDate(iso, lang, { weekday: "short", day: "numeric", month: "short" });

  return (
    <section className="section band" id="reservar" aria-labelledby="book-title">
      <div className="container">
        <div className="section__head">
          <h2 id="book-title">{d.book.title}</h2>
          <p className="lead">{d.book.lead}</p>
        </div>

        {done ? (
          <div className="done" role="status">
            <p className="done__code num">{done.code}</p>
            <h3>{d.book.doneTitle}</h3>
            <p>{d.book.doneBody(done.code)}</p>
            <div className="done__actions">
              <a className="btn btn--light" href={waLink(bookingMessage(done, cabin, lang))} target="_blank" rel="noopener noreferrer">
                {d.book.doneWa}
              </a>
              <button type="button" className="link link--light" onClick={reset}>{d.book.doneAgain}</button>
            </div>
          </div>
        ) : (
          <form className="book" onSubmit={submit} noValidate>
            <div className="book__fields">
              <fieldset className="field">
                <legend className="field__label">{d.book.sede}</legend>
                <div className="seg">
                  {(["pedrera", "sansebastian"] as SedeId[]).map((id) => (
                    <button key={id} type="button" className="seg__btn" aria-pressed={sede === id} onClick={() => chooseSede(id)}>
                      {d.sedes[id].name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="field">
                <legend className="field__label">{d.book.cabin}</legend>
                <div className="choices">
                  {data.cabins.filter((c) => c.sedeId === sede).map((c) => (
                    <label key={c.id} className="choice">
                      <input type="radio" name="cabin" value={c.id} checked={cabinId === c.id} onChange={() => chooseCabin(c.id)} />
                      <span className="choice__name">{c.name}</span>
                      <span className="choice__meta">{d.cabins.capacity(c.capacity)}</span>
                      <span className="choice__price num">USD {c.rateLow}–{c.rateHigh}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="field">
                <p className="field__label" id="dates-label">
                  {d.book.dates}
                  <span className="field__hint">
                    {checkIn && !checkOut ? d.book.pickOut : !checkIn ? d.book.pickIn : `${fmt(checkIn)} → ${fmt(checkOut!)}`}
                  </span>
                </p>
                {mounted ? (
                  <RangeCalendar
                    key={`${cabin.id}-${checkIn ?? "x"}`}
                    lang={lang}
                    busy={busy}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    minNights={s.minNights}
                    onChange={(a, b) => {
                      setCheckIn(a);
                      setCheckOut(b);
                    }}
                  />
                ) : (
                  <p className="muted">{d.availability.loading}</p>
                )}
              </div>

              <div className="field field--row">
                <span className="field__label" id="guests-label">{d.book.guests}</span>
                <div className="stepper" role="group" aria-labelledby="guests-label">
                  <button type="button" className="stepper__btn" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label={d.book.less}>−</button>
                  <output className="stepper__val num" aria-live="polite">{guests}</output>
                  <button type="button" className="stepper__btn" onClick={() => setGuests((g) => Math.min(cabin.capacity, g + 1))} disabled={guests >= cabin.capacity} aria-label={d.book.more}>+</button>
                </div>
              </div>

              <label className="check">
                <input type="checkbox" checked={pet} onChange={(e) => setPet(e.target.checked)} />
                <span>
                  {d.book.pet}
                  <span className="check__note">{d.book.petNote(s.petFee)}</span>
                </span>
              </label>

              <div className="field-pair">
                <label className="field">
                  <span className="field__label">{d.book.name}</span>
                  <input className="input" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="field">
                  <span className="field__label">{d.book.phone}</span>
                  <input className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="598 99 123 456" value={phone} onChange={(e) => setPhone(e.target.value)} aria-describedby="phone-hint" />
                  <span className="field__hint" id="phone-hint">{d.book.phoneHint}</span>
                </label>
              </div>
            </div>

            <aside className="sum" aria-live="polite">
              <p className="sum__cabin">{d.sedes[cabin.sedeId].name}, {d.cabinWord} {cabin.name}</p>
              {q ? (
                <>
                  <p className="sum__figure">USD {q.total}</p>
                  <dl className="sum__rows">
                    <div><dt>{d.book.lodging}, {d.book.nights(q.nights)}</dt><dd className="num">USD {q.lodging}</dd></div>
                    {q.petFee > 0 && <div><dt>{d.book.petFee}</dt><dd className="num">USD {q.petFee}</dd></div>}
                    <div className="sum__strong"><dt>{d.book.deposit(s.depositPct)}</dt><dd className="num">USD {q.deposit}</dd></div>
                    <div><dt>{d.book.balance}</dt><dd className="num">USD {q.balance}</dd></div>
                  </dl>
                </>
              ) : (
                <p className="sum__empty">{d.book.summaryEmpty}</p>
              )}
              <p className="sum__fees">{d.book.noFees}</p>
              {error && <p className="sum__error" role="alert">{error}</p>}
              <button type="submit" className="btn btn--light btn--block">{d.book.submit}</button>
            </aside>
          </form>
        )}
      </div>
    </section>
  );
}
