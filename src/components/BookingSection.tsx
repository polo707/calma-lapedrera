"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLang } from "@/i18n/LangProvider";
import { bx } from "@/i18n/booking-extra";
import { actions, getData, useData } from "@/lib/store";
import { busyNights, isRangeFree, nightlyRate, quote } from "@/lib/pricing";
import { bookingMessage, makeCode, makeId, onlyDigits, waLink } from "@/lib/booking";
import { formatDate, todayISO } from "@/lib/dates";
import { useMounted } from "@/lib/useMounted";
import type { Booking, SedeId } from "@/lib/types";
import { RangeCalendar } from "./RangeCalendar";
import { PREFILL_EVENT, type Prefill } from "./Availability";

type Phase = "idle" | "saving" | "saved";

const SAVING_MS = 560;
const SAVED_MS = 1300;

export function BookingSection() {
  const { d, lang } = useLang();
  const x = bx(lang);
  const data = useData();
  const mounted = useMounted();
  const reduce = useReducedMotion();
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
  const [phase, setPhase] = useState<Phase>("idle");
  const [prefillSeq, setPrefillSeq] = useState(0);
  const [copied, setCopied] = useState(false);
  const timers = useRef<number[]>([]);
  const ticketTitleRef = useRef<HTMLHeadingElement>(null);
  const focusTicket = useRef(false);

  const cabin = data.cabins.find((c) => c.id === cabinId) ?? data.cabins[0];
  const busy = useMemo(() => busyNights(data, cabin.id), [data, cabin.id]);
  const q = checkIn && checkOut ? quote(cabin, checkIn, checkOut, pet, s) : null;

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => {
    const onPrefill = (e: Event) => {
      const { cabinId: id, checkIn: ci } = (e as CustomEvent<Prefill>).detail;
      const c = getData().cabins.find((x) => x.id === id);
      if (!c) return;
      clearTimers();
      setPhase("idle");
      setSede(c.sedeId);
      setCabinId(c.id);
      setCheckIn(ci);
      setCheckOut(null);
      setGuests((g) => Math.min(g, c.capacity));
      setDone(null);
      setError(null);
      setPrefillSeq((n) => n + 1);
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => {
      window.removeEventListener(PREFILL_EVENT, onPrefill);
      clearTimers();
    };
  }, []);

  // Al mostrar el ticket: llevar la vista y el foco al resultado.
  useEffect(() => {
    if (!done || !focusTicket.current) return;
    focusTicket.current = false;
    document.getElementById("reservar")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    ticketTitleRef.current?.focus({ preventScroll: true });
  }, [done, reduce]);

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
    if (phase !== "idle") return;
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
    // Se abre dentro del gesto del usuario (si no, el navegador lo bloquea).
    window.open(waLink(bookingMessage(booking, cabin, lang)), "_blank", "noopener,noreferrer");

    if (reduce) {
      focusTicket.current = true;
      setDone(booking);
      return;
    }
    // Micro-estados del botón: registrando → registrada → ticket.
    setPhase("saving");
    timers.current.push(window.setTimeout(() => setPhase("saved"), SAVING_MS));
    timers.current.push(
      window.setTimeout(() => {
        focusTicket.current = true;
        setDone(booking);
        setPhase("idle");
      }, SAVED_MS),
    );
  }

  function reset() {
    clearTimers();
    setPhase("idle");
    setCopied(false);
    setDone(null);
    setCheckIn(null);
    setCheckOut(null);
    setName("");
    setPhone("");
    setPet(false);
  }

  function copyCode(code: string) {
    navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true);
        timers.current.push(window.setTimeout(() => setCopied(false), 2000));
      },
      () => {},
    );
  }

  const fmt = (iso: string) => formatDate(iso, lang, { weekday: "short", day: "numeric", month: "short" });

  // Progreso: la cabaña siempre está elegida; huéspedes tiene valores válidos por defecto.
  const datesOk = !!q && q.nights >= s.minNights;
  const detailsOk = name.trim().length >= 2 && onlyDigits(phone).length >= 7;
  const complete = [true, datesOk, datesOk && guests <= cabin.capacity, detailsOk];
  const firstOpen = complete.findIndex((c) => !c);
  const active = firstOpen === -1 ? 3 : firstOpen;
  const progress = complete.filter(Boolean).length / complete.length;

  function goStep(i: number) {
    document.getElementById(`bstep-${i + 1}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  const priceFor = (c: (typeof data.cabins)[number]) =>
    mounted ? nightlyRate(c, checkIn ?? todayISO(), s) : null;

  const [feeHead, ...feeRest] = d.book.noFees.split(": ");
  const doneCabin = done ? data.cabins.find((c) => c.id === done.cabinId) ?? cabin : cabin;

  return (
    <section className="section band" id="reservar" aria-labelledby="book-title">
      <div className="container">
        <div className="section__head">
          <h2 id="book-title">{d.book.title}</h2>
          <p className="lead">{d.book.lead}</p>
        </div>

        {done ? (
          <div className="ticket">
            <div className="ticket__main">
              <p className="ticket__eyebrow">{x.ticket.eyebrow}</p>
              <p className="ticket__code num">{done.code}</p>
              <p className="ticket__status"><span className="ticket__dot" aria-hidden="true" />{x.ticket.status}</p>
              <dl className="ticket__grid">
                <div><dt>{d.chat.sum.sede}</dt><dd>{d.sedes[doneCabin.sedeId].name}</dd></div>
                <div><dt>{d.chat.sum.cabin}</dt><dd>{doneCabin.name}</dd></div>
                <div><dt>{d.book.checkIn}</dt><dd className="num">{fmt(done.checkIn)}</dd></div>
                <div><dt>{d.book.checkOut}</dt><dd className="num">{fmt(done.checkOut)}</dd></div>
                <div><dt>{d.chat.sum.guests}</dt><dd className="num">{done.guests}</dd></div>
                <div><dt>{d.chat.sum.pet}</dt><dd>{done.pet ? d.chat.sum.yes : d.chat.sum.no}</dd></div>
                <div><dt>{d.chat.sum.total}</dt><dd className="num">USD {done.total}</dd></div>
                <div className="ticket__strong"><dt>{d.book.deposit(s.depositPct)}</dt><dd className="num">USD {done.deposit}</dd></div>
              </dl>
            </div>
            <div className="ticket__stub">
              <h3 ref={ticketTitleRef} tabIndex={-1} className="ticket__title">{d.book.doneTitle}</h3>
              <p className="ticket__body">{d.book.doneBody(done.code)}</p>
              <div className="ticket__actions">
                <a className="btn btn--block ticket__wa" href={waLink(bookingMessage(done, doneCabin, lang))} target="_blank" rel="noopener noreferrer">
                  <WaIcon />
                  {d.book.doneWa}
                </a>
                <div className="ticket__links">
                  {typeof navigator !== "undefined" && navigator.clipboard && (
                    <button type="button" className="link ticket__copy" onClick={() => copyCode(done.code)} aria-live="polite">
                      {copied ? x.ticket.copied : x.ticket.copy}
                    </button>
                  )}
                  <button type="button" className="link" onClick={reset}>{d.book.doneAgain}</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="book bk" onSubmit={submit} noValidate>
            <nav className="bsteps" aria-label={x.steps.label}>
              <div className="bsteps__rail" aria-hidden="true">
                <span className="bsteps__fill" style={{ transform: `scaleX(${progress})` }} />
              </div>
              <ol className="bsteps__list">
                {x.steps.names.map((label, i) => (
                  <li key={label} className={`bsteps__item${complete[i] ? " is-done" : ""}${i === active ? " is-current" : ""}`}>
                    <button type="button" className="bsteps__btn" onClick={() => goStep(i)} aria-current={i === active ? "step" : undefined}>
                      <span className="bsteps__num num" aria-hidden="true">
                        {complete[i] && i !== active ? <CheckIcon /> : String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="bsteps__name">
                        <span className="visually-hidden">{x.steps.of(i + 1, 4)}: </span>
                        {label}
                        {complete[i] && <span className="visually-hidden">, {x.steps.done}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="bsteps__now" aria-hidden="true">
                <span className="num">{x.steps.of(active + 1, 4)}</span> · {x.steps.names[active]}
              </p>
            </nav>

            <div className="book__fields bk__fields">
              {/* 1 · Sede y cabaña */}
              <fieldset className="bstep" id="bstep-1">
                <legend className="bstep__head">
                  <span className="bstep__num num" aria-hidden="true">01</span>
                  <span className="bstep__title">{x.steps.names[0]}</span>
                </legend>
                <div className="bstep__body">
                  <div className="field">
                    <span className="field__label" id="sede-label">{d.book.sede}</span>
                    <div className="seg bk__seg" role="group" aria-labelledby="sede-label">
                      {(["pedrera", "sansebastian"] as SedeId[]).map((id) => (
                        <button key={id} type="button" className="seg__btn" aria-pressed={sede === id} onClick={() => chooseSede(id)}>
                          {d.sedes[id].name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <fieldset className="field">
                    <legend className="field__label">{d.book.cabin}</legend>
                    <div className="ccards">
                      {data.cabins.filter((c) => c.sedeId === sede).map((c) => {
                        const selected = cabinId === c.id;
                        const price = priceFor(c);
                        return (
                          <label key={c.id} className={`ccard${selected ? " is-selected" : ""}`}>
                            <input className="ccard__radio" type="radio" name="cabin" value={c.id} checked={selected} onChange={() => chooseCabin(c.id)} />
                            <span className="ccard__thumb" aria-hidden="true">
                              <Image src={c.photo} alt="" width={96} height={96} sizes="96px" />
                            </span>
                            <span className="ccard__body">
                              <span className="ccard__name">{c.name}</span>
                              <span className="ccard__meta">{d.cabins.kind[c.kind]} · {d.cabins.capacity(c.capacity)}</span>
                            </span>
                            <span className="ccard__price">
                              {price !== null ? (
                                <>
                                  <span className="ccard__amount num">USD {price}</span>
                                  <span className="ccard__per">{d.cabins.perNight}</span>
                                </>
                              ) : (
                                <span className="ccard__amount num">USD {c.rateLow}–{c.rateHigh}</span>
                              )}
                            </span>
                            <span className="ccard__mark" aria-hidden="true"><CheckIcon /></span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </div>
              </fieldset>

              {/* 2 · Fechas */}
              <fieldset className="bstep" id="bstep-2">
                <legend className="bstep__head">
                  <span className="bstep__num num" aria-hidden="true">02</span>
                  <span className="bstep__title">{x.steps.names[1]}</span>
                </legend>
                <div className="bstep__body">
                  <div className="bdates" aria-live="polite">
                    <div className={`bdates__tile${checkIn ? " is-set" : ""}${!checkIn ? " is-next" : ""}`}>
                      <span className="bdates__k">{d.book.checkIn}</span>
                      <span className="bdates__v num">{checkIn ? fmt(checkIn) : "—"}</span>
                    </div>
                    <span className="bdates__arrow" aria-hidden="true">
                      <svg width="20" height="12" viewBox="0 0 20 12"><path d="M0 6h18M13 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
                    </span>
                    <div className={`bdates__tile${checkOut ? " is-set" : ""}${checkIn && !checkOut ? " is-next" : ""}`}>
                      <span className="bdates__k">{d.book.checkOut}</span>
                      <span className="bdates__v num">{checkOut ? fmt(checkOut) : "—"}</span>
                    </div>
                    <p className="bdates__hint">
                      {checkIn && !checkOut ? d.book.pickOut : !checkIn ? d.book.pickIn : q ? d.book.nights(q.nights) : ""}
                    </p>
                  </div>
                  {mounted ? (
                    <RangeCalendar
                      key={`${cabin.id}-${prefillSeq}`}
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
                    <p className="bk__loading">{d.availability.loading}</p>
                  )}
                </div>
              </fieldset>

              {/* 3 · Huéspedes */}
              <fieldset className="bstep" id="bstep-3">
                <legend className="bstep__head">
                  <span className="bstep__num num" aria-hidden="true">03</span>
                  <span className="bstep__title">{x.steps.names[2]}</span>
                </legend>
                <div className="bstep__body">
                  <div className="bguests">
                    <div className="bguests__text">
                      <span className="field__label" id="guests-label">{d.book.guests}</span>
                      <span className="field__hint">{d.cabins.capacity(cabin.capacity)}</span>
                    </div>
                    <div className="stepper bk__stepper" role="group" aria-labelledby="guests-label">
                      <button type="button" className="stepper__btn" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label={d.book.less}>−</button>
                      <output className="stepper__val num" aria-live="polite">
                        <span key={guests} className="bk__tick">{guests}</span>
                      </output>
                      <button type="button" className="stepper__btn" onClick={() => setGuests((g) => Math.min(cabin.capacity, g + 1))} disabled={guests >= cabin.capacity} aria-label={d.book.more}>+</button>
                    </div>
                  </div>

                  <label className={`check bk__pet${pet ? " is-on" : ""}`}>
                    <input type="checkbox" checked={pet} onChange={(e) => setPet(e.target.checked)} />
                    <span>
                      {d.book.pet}
                      <span className="check__note">{d.book.petNote(s.petFee)}</span>
                    </span>
                  </label>
                </div>
              </fieldset>

              {/* 4 · Tus datos */}
              <fieldset className="bstep" id="bstep-4">
                <legend className="bstep__head">
                  <span className="bstep__num num" aria-hidden="true">04</span>
                  <span className="bstep__title">{x.steps.names[3]}</span>
                </legend>
                <div className="bstep__body">
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
              </fieldset>
            </div>

            <aside className="sum bsum" aria-labelledby="bsum-title">
              <p className="bsum__eyebrow" id="bsum-title">{x.stay}</p>
              <div className="bsum__cabin">
                <span className="bsum__thumb" aria-hidden="true">
                  <Image key={cabin.id} src={cabin.photo} alt="" width={112} height={112} sizes="56px" />
                </span>
                <span className="bsum__who">
                  <span className="bsum__sede">{d.sedes[cabin.sedeId].name}</span>
                  <span className="bsum__name">{d.cabinWord} {cabin.name}</span>
                </span>
              </div>
              <p className="bsum__dates num">
                {checkIn ? fmt(checkIn) : x.datesPending}
                {checkIn && <> → {checkOut ? fmt(checkOut) : "…"}</>}
              </p>

              {q ? (
                <>
                  <div className="bsum__total">
                    <span className="bsum__label">{x.totalLabel}</span>
                    <p className="bsum__figure" aria-hidden="true">
                      <span className="bsum__cur">USD</span>
                      <Tween value={q.total} reduce={!!reduce} />
                    </p>
                  </div>
                  <dl className="sum__rows bsum__rows">
                    <div><dt>{d.chat.sum.nights}</dt><dd className="num">{q.nights}</dd></div>
                    <div><dt>{d.book.lodging}</dt><dd className="num">USD {q.lodging}</dd></div>
                    {q.petFee > 0 && <div><dt>{d.book.petFee}</dt><dd className="num">USD {q.petFee}</dd></div>}
                    <div className="sum__strong"><dt>{d.book.deposit(s.depositPct)}</dt><dd className="num">USD {q.deposit}</dd></div>
                    <div><dt>{d.book.balance}</dt><dd className="num">USD {q.balance}</dd></div>
                  </dl>
                </>
              ) : (
                <p className="sum__empty">{d.book.summaryEmpty}</p>
              )}

              <div className="bsum__fee">
                <span className="bsum__fee-k">{x.direct}</span>
                <p className="bsum__fee-t">
                  {feeRest.length ? (
                    <>
                      <strong className="bsum__fee-h">{feeHead}</strong>: {feeRest.join(": ")}
                    </>
                  ) : (
                    d.book.noFees
                  )}
                </p>
              </div>

              {error && <p className="sum__error bsum__error" role="alert" key={error}>{error}</p>}

              <button
                type="submit"
                className={`btn btn--block bsubmit is-${phase}`}
                aria-disabled={phase !== "idle" || undefined}
                aria-busy={phase === "saving" || undefined}
              >
                <span key={phase} className="bsubmit__label">
                  {phase === "saved" && <CheckIcon />}
                  {phase === "idle" ? (
                    <>
                      <WaIcon />
                      {d.book.submit}
                    </>
                  ) : phase === "saving" ? x.saving : x.saved}
                </span>
                <span className="bsubmit__bar" aria-hidden="true" />
              </button>

              <p className="visually-hidden" aria-live="polite">
                {q ? `${x.totalLabel}: USD ${q.total}. ` : ""}
                {phase === "saving" ? x.saving : phase === "saved" ? x.saved : ""}
              </p>
            </aside>
          </form>
        )}
      </div>
    </section>
  );
}

/** Cifra que se desliza suavemente hasta el nuevo valor (instantánea con movimiento reducido). */
function Tween({ value, reduce }: { value: number; reduce: boolean }) {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);

  useEffect(() => {
    const from = shownRef.current;
    if (from === value) return;
    if (reduce) {
      shownRef.current = value;
      setShown(value);
      return;
    }
    const dur = 620;
    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      const v = Math.round(from + (value - from) * eased);
      shownRef.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return <span className="bsum__amount">{shown}</span>;
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="m2.5 7.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

function WaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.8l5.1-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.2 3.6 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.7-.4Z"
      />
    </svg>
  );
}
