"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/i18n/LangProvider";
import { actions, getData, useData } from "@/lib/store";
import { busyNights, currentRate, isRangeFree, quote } from "@/lib/pricing";
import { bookingMessage, makeCode, makeId, onlyDigits, waLink } from "@/lib/booking";
import { formatDate } from "@/lib/dates";
import type { Booking, SedeId } from "@/lib/types";
import { RangeCalendar } from "@/components/RangeCalendar";
import { detectIntent, type Intent } from "./engine";

/** Los mensajes se guardan como claves + parámetros, nunca como texto: así se re-traducen al cambiar idioma. */
type Msg = {
  id: number;
  from: "bot" | "user";
  kind: string;
  p?: Record<string, string | number | boolean>;
};

type Step = null | "cabin" | "guests" | "dates" | "name" | "phone" | "summary" | "done";

type Draft = {
  cabinId: string | null;
  guests: number;
  pet: boolean;
  checkIn: string | null;
  checkOut: string | null;
  name: string;
  phone: string;
};

const EMPTY_DRAFT: Draft = { cabinId: null, guests: 2, pet: false, checkIn: null, checkOut: null, name: "", phone: "" };
const CHIPS = ["sedes", "pet", "precios", "incluye", "whatsapp", "reservar"] as const;

let seq = 1;
const nextId = () => seq++;

export function ChatWidget() {
  const { d, lang } = useLang();
  const data = useData();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ id: nextId(), from: "bot", kind: "welcome" }]);
  const [step, setStep] = useState<Step>(null);
  const [flowMsgId, setFlowMsgId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [msgs, step, open, reduce]);

  // Escape cierra; bloqueo de scroll del body en celular
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => launcherRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    const mobile = window.matchMedia("(max-width: 40rem)").matches;
    const prev = document.body.style.overflow;
    if (mobile) document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }

  const push = (...m: Omit<Msg, "id">[]) => setMsgs((cur) => [...cur, ...m.map((x) => ({ ...x, id: nextId() }))]);

  function bot(kind: string, p?: Msg["p"]) {
    const id = nextId();
    setMsgs((cur) => [...cur, { id, from: "bot", kind, p }]);
    return id;
  }

  function startFlow() {
    setDraft(EMPTY_DRAFT);
    setStep("cabin");
    setFlowMsgId(bot("flow.cabin"));
  }

  function backToMenu() {
    setStep(null);
    setFlowMsgId(null);
    setDraft(EMPTY_DRAFT);
    push({ from: "bot", kind: "welcome" });
  }

  function answer(intent: Intent) {
    switch (intent) {
      case "reservar":
        startFlow();
        return;
      case "whatsapp":
        bot("whatsapp");
        return;
      default:
        bot(intent);
    }
  }

  function onChip(intent: Intent) {
    push({ from: "user", kind: `chip.${intent}` });
    if (intent === "whatsapp") window.open(waLink(d.wa.hello), "_blank", "noopener,noreferrer");
    answer(intent);
  }

  function onSubmitText(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (step === "name") {
      push({ from: "user", kind: "text", p: { text } });
      if (text.length < 2) return void bot("flow.nameInvalid");
      setDraft((dr) => ({ ...dr, name: text }));
      setStep("phone");
      setFlowMsgId(bot("flow.phone"));
      return;
    }
    if (step === "phone") {
      push({ from: "user", kind: "text", p: { text } });
      const digits = onlyDigits(text);
      if (digits.length < 7) return void bot("flow.phoneInvalid");
      const nd = { ...draft, phone: digits };
      setDraft(nd);
      setStep("summary");
      setFlowMsgId(bot("flow.summary", { ...nd } as Msg["p"]));
      return;
    }

    push({ from: "user", kind: "text", p: { text } });
    const intent = detectIntent(text);
    if (!intent) bot("fallback");
    else answer(intent);
  }

  function pickCabin(id: string) {
    const c = data.cabins.find((x) => x.id === id);
    if (!c) return;
    push({ from: "user", kind: "u.cabin", p: { cabinId: id } });
    setDraft((dr) => ({ ...dr, cabinId: id, guests: Math.min(dr.guests, c.capacity), checkIn: null, checkOut: null }));
    setStep("guests");
    setFlowMsgId(bot("flow.guests"));
  }

  function confirmGuests() {
    push({ from: "user", kind: "u.guests", p: { guests: draft.guests, pet: draft.pet } });
    setStep("dates");
    setFlowMsgId(bot("flow.dates"));
  }

  function confirmDates() {
    if (!draft.checkIn || !draft.checkOut) return;
    push({ from: "user", kind: "u.dates", p: { checkIn: draft.checkIn, checkOut: draft.checkOut } });
    setStep("name");
    setFlowMsgId(bot("flow.name"));
  }

  function confirmBooking() {
    const fresh = getData();
    const c = fresh.cabins.find((x) => x.id === draft.cabinId);
    if (!c || !draft.checkIn || !draft.checkOut) return;
    if (!isRangeFree(busyNights(fresh, c.id), draft.checkIn, draft.checkOut)) {
      bot("flow.busy");
      setDraft((dr) => ({ ...dr, checkIn: null, checkOut: null }));
      setStep("dates");
      setFlowMsgId(bot("flow.dates"));
      return;
    }
    const q = quote(c, draft.checkIn, draft.checkOut, draft.pet, fresh.settings);
    const b: Booking = {
      id: makeId(),
      code: makeCode(fresh.bookings.map((x) => x.code)),
      cabinId: c.id,
      checkIn: draft.checkIn,
      checkOut: draft.checkOut,
      guests: draft.guests,
      pet: draft.pet,
      name: draft.name,
      phone: draft.phone,
      total: q.total,
      deposit: q.deposit,
      status: "pending",
      source: "chat",
      lang,
      createdAt: new Date().toISOString(),
    };
    actions.addBooking(b);
    push({ from: "user", kind: "chip.confirm" });
    setStep("done");
    setFlowMsgId(bot("flow.done", { bookingId: b.id, code: b.code }));
  }

  const busy = useMemo(() => (draft.cabinId ? busyNights(data, draft.cabinId) : new Set<string>()), [data, draft.cabinId]);
  const draftCabin = data.cabins.find((c) => c.id === draft.cabinId) ?? null;
  const fmt = (iso: string) => formatDate(iso, lang, { weekday: "short", day: "numeric", month: "short" });
  const sedeOf = (id: string) => {
    const c = data.cabins.find((x) => x.id === id);
    return c ? d.sedes[c.sedeId].name : "";
  };

  function renderBot(m: Msg): React.ReactNode {
    const s = data.settings;
    switch (m.kind) {
      case "welcome":
        return d.chat.welcome;
      case "greet":
        return d.chat.greet;
      case "thanks":
        return d.chat.thanks;
      case "sedes":
        return d.chat.sedes;
      case "pet":
        return d.chat.pet(s.maxPets, s.petFee);
      case "precios":
        return (
          <>
            <p>{d.chat.preciosHead}</p>
            <ul className="chat__list">
              {data.cabins.map((c) => (
                <li key={c.id}>
                  <span>{c.name}, {d.sedes[c.sedeId].name}</span>
                  <span className="num">USD {c.rateLow} / {c.rateHigh}</span>
                </li>
              ))}
            </ul>
            <p>{d.chat.preciosFoot(s.depositPct)}</p>
          </>
        );
      case "incluye":
        return d.chat.incluye(s.checkIn, s.checkOut);
      case "comida":
        return d.chat.comida;
      case "comisiones":
        return d.chat.comisiones;
      case "checkin":
        return d.chat.checkin(s.checkIn, s.checkOut);
      case "llegar":
        return d.chat.llegar;
      case "whatsapp":
      case "fallback":
        return (
          <>
            <p>{m.kind === "whatsapp" ? d.chat.whatsapp : d.chat.fallback}</p>
            <a className="chat__wa-inline" href={waLink(d.wa.hello)} target="_blank" rel="noopener noreferrer">{d.chat.openWa}</a>
          </>
        );
      case "flow.cabin":
        return (
          <>
            <p>{d.chat.flow.cabin}</p>
            {step === "cabin" && flowMsgId === m.id && (
              <div className="chat__options">
                {(["pedrera", "sansebastian"] as SedeId[]).map((sid) => (
                  <div key={sid} className="chat__group">
                    <p className="chat__group-label">{d.sedes[sid].name}</p>
                    {data.cabins.filter((c) => c.sedeId === sid).map((c) => (
                      <button key={c.id} type="button" className="chat__option" onClick={() => pickCabin(c.id)}>
                        <span>{c.name}</span>
                        <span className="num">USD {currentRate(c, s)} {d.cabins.perNight}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case "flow.guests":
        return (
          <>
            <p>{d.chat.flow.guests}</p>
            {step === "guests" && flowMsgId === m.id && draftCabin && (
              <div className="chat__options">
                <div className="stepper stepper--chat" role="group" aria-label={d.book.guests}>
                  <button type="button" className="stepper__btn" onClick={() => setDraft((dr) => ({ ...dr, guests: Math.max(1, dr.guests - 1) }))} disabled={draft.guests <= 1} aria-label={d.book.less}>−</button>
                  <output className="stepper__val num" aria-live="polite">{draft.guests}</output>
                  <button type="button" className="stepper__btn" onClick={() => setDraft((dr) => ({ ...dr, guests: Math.min(draftCabin.capacity, dr.guests + 1) }))} disabled={draft.guests >= draftCabin.capacity} aria-label={d.book.more}>+</button>
                </div>
                <div className="chat__toggle" role="group" aria-label={d.chat.sum.pet}>
                  <button type="button" aria-pressed={!draft.pet} onClick={() => setDraft((dr) => ({ ...dr, pet: false }))}>{d.chat.flow.noPet}</button>
                  <button type="button" aria-pressed={draft.pet} onClick={() => setDraft((dr) => ({ ...dr, pet: true }))}>{d.chat.flow.withPet}</button>
                </div>
                <button type="button" className="chat__primary" onClick={confirmGuests}>{d.chat.flow.continue}</button>
              </div>
            )}
          </>
        );
      case "flow.dates":
        return (
          <>
            <p>{d.chat.flow.dates}</p>
            {step === "dates" && flowMsgId === m.id && (
              <div className="chat__options">
                <RangeCalendar
                  compact
                  lang={lang}
                  busy={busy}
                  checkIn={draft.checkIn}
                  checkOut={draft.checkOut}
                  minNights={s.minNights}
                  onChange={(a, b) => setDraft((dr) => ({ ...dr, checkIn: a, checkOut: b }))}
                />
                {draft.checkIn && draft.checkOut && (
                  <button type="button" className="chat__primary" onClick={confirmDates}>
                    {fmt(draft.checkIn)} → {fmt(draft.checkOut)}, {d.chat.flow.continue}
                  </button>
                )}
              </div>
            )}
          </>
        );
      case "flow.name":
        return d.chat.flow.name;
      case "flow.nameInvalid":
        return d.chat.flow.nameInvalid;
      case "flow.phone":
        return d.chat.flow.phone;
      case "flow.phoneInvalid":
        return d.chat.flow.phoneInvalid;
      case "flow.busy":
        return d.chat.flow.busy;
      case "flow.summary": {
        const p = m.p as unknown as Draft;
        const c = data.cabins.find((x) => x.id === p.cabinId);
        if (!c || !p.checkIn || !p.checkOut) return null;
        const q = quote(c, p.checkIn, p.checkOut, p.pet, s);
        const S = d.chat.sum;
        return (
          <>
            <p>{d.chat.flow.summary}</p>
            <dl className="chat__summary">
              <div><dt>{S.sede}</dt><dd>{d.sedes[c.sedeId].name}</dd></div>
              <div><dt>{S.cabin}</dt><dd>{c.name}</dd></div>
              <div><dt>{S.dates}</dt><dd>{fmt(p.checkIn)} → {fmt(p.checkOut)}</dd></div>
              <div><dt>{S.nights}</dt><dd className="num">{q.nights}</dd></div>
              <div><dt>{S.guests}</dt><dd className="num">{p.guests}</dd></div>
              <div><dt>{S.pet}</dt><dd>{p.pet ? S.yes : S.no}</dd></div>
              <div><dt>{S.total}</dt><dd className="num">USD {q.total}</dd></div>
              <div className="chat__summary-strong"><dt>{S.deposit} ({s.depositPct}%)</dt><dd className="num">USD {q.deposit}</dd></div>
            </dl>
            {step === "summary" && flowMsgId === m.id && (
              <button type="button" className="chat__primary" onClick={confirmBooking}>{d.chat.flow.confirm}</button>
            )}
          </>
        );
      }
      case "flow.done": {
        const b = data.bookings.find((x) => x.id === m.p?.bookingId);
        const c = b ? data.cabins.find((x) => x.id === b.cabinId) : null;
        return (
          <>
            <p>{d.chat.flow.done(String(m.p?.code ?? ""))}</p>
            {b && c && (
              <a className="chat__wa-big" href={waLink(bookingMessage(b, c, lang))} target="_blank" rel="noopener noreferrer">
                <WaIcon />
                {d.chat.flow.sendWa}
              </a>
            )}
          </>
        );
      }
      default:
        return null;
    }
  }

  function renderUser(m: Msg): React.ReactNode {
    if (m.kind === "text") return String(m.p?.text ?? "");
    if (m.kind === "chip.confirm") return d.chat.flow.confirm;
    if (m.kind.startsWith("chip.")) return d.chat.chips[m.kind.slice(5) as keyof typeof d.chat.chips];
    if (m.kind === "u.cabin") {
      const id = String(m.p?.cabinId);
      const c = data.cabins.find((x) => x.id === id);
      return c ? `${c.name}, ${sedeOf(id)}` : "";
    }
    if (m.kind === "u.guests") {
      const n = Number(m.p?.guests);
      return `${d.chat.flow.guestsN(n)}, ${m.p?.pet ? d.chat.flow.withPet.toLowerCase() : d.chat.flow.noPet.toLowerCase()}`;
    }
    if (m.kind === "u.dates") return `${fmt(String(m.p?.checkIn))} → ${fmt(String(m.p?.checkOut))}`;
    return null;
  }

  const textMode = step === "name" || step === "phone";
  const showChips = step === null || step === "done";

  const panelAnim = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 40 } };

  return (
    <>
      <div className={`fab${open ? " fab--hidden" : ""}`}>
        <a className="fab__btn fab__btn--wa" href={waLink(d.wa.hello)} target="_blank" rel="noopener noreferrer" aria-label={d.chat.wa}>
          <WaIcon />
        </a>
        <button ref={launcherRef} type="button" className="fab__btn fab__btn--chat" onClick={() => setOpen(true)} aria-label={d.chat.open} aria-expanded={open} aria-controls="calma-chat">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="chat__backdrop" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} aria-hidden="true" />
            <motion.div
              id="calma-chat"
              className="chat"
              role="dialog"
              aria-modal="true"
              aria-labelledby="chat-title"
              {...panelAnim}
              transition={{ duration: reduce ? 0.15 : 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="chat__head">
                <span className="chat__logo" aria-hidden="true">C</span>
                <div className="chat__titles">
                  <p className="chat__title" id="chat-title">{d.chat.title}</p>
                  <p className="chat__subtitle">{d.chat.subtitle}</p>
                </div>
                <button ref={closeRef} type="button" className="chat__close" onClick={close} aria-label={d.chat.close}>
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" /></svg>
                </button>
              </div>

              <div className="chat__body" ref={listRef} aria-live="polite">
                {msgs.map((m) => (
                  <div key={m.id} className={`bubble bubble--${m.from}`}>
                    {m.from === "bot" ? renderBot(m) : renderUser(m)}
                  </div>
                ))}
                {showChips && (
                  <div className="chips">
                    {CHIPS.map((c) => (
                      <button key={c} type="button" className="chip" onClick={() => onChip(c)}>{d.chat.chips[c]}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="chat__foot">
                {!showChips && (
                  <button type="button" className="chat__menu" onClick={backToMenu}>{d.chat.menu}</button>
                )}
                <form className="chat__form" onSubmit={onSubmitText}>
                  <label htmlFor="chat-input" className="visually-hidden">{d.chat.placeholder}</label>
                  <input
                    id="chat-input"
                    className="chat__input"
                    type={step === "phone" ? "tel" : "text"}
                    inputMode={step === "phone" ? "tel" : "text"}
                    autoComplete={step === "name" ? "name" : step === "phone" ? "tel" : "off"}
                    placeholder={step === "name" ? d.book.name : step === "phone" ? d.book.phone : d.chat.placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    enterKeyHint="send"
                    data-mode={textMode ? "flow" : "free"}
                  />
                  <button type="submit" className="chat__send" aria-label={d.chat.send} disabled={!input.trim()}>
                    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function WaIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.8l5.1-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.2 3.6 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.7-.4Z"
      />
    </svg>
  );
}
