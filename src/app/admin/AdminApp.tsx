"use client";

import { useEffect, useMemo, useState } from "react";
import { ADMIN_PIN } from "@/config/site";
import { actions, useData } from "@/lib/store";
import { busyNights, nightState } from "@/lib/pricing";
import { formatDate, monthGrid, monthLabel, todayISO, weekdayInitials, fromISO } from "@/lib/dates";
import { waLink } from "@/lib/booking";
import { useMounted } from "@/lib/useMounted";
import type { Booking, BookingStatus } from "@/lib/types";

const SESSION_KEY = "calma.admin";
type Tab = "reservas" | "calendario" | "tarifas" | "ajustes";

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pendiente de seña",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

const SEDE_NAME = { pedrera: "La Pedrera", sansebastian: "San Sebastián" } as const;

export function AdminApp() {
  const mounted = useMounted();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") setOk(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (!mounted) return <main className="admin admin--center"><p className="muted">Cargando…</p></main>;
  if (!ok) return <Login onOk={() => setOk(true)} />;
  return <Panel onLogout={() => { try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } setOk(false); }} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      try { window.sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
      onOk();
    } else {
      setErr(true);
      setPin("");
    }
  }
  return (
    <main className="admin admin--center">
      <form className="login" onSubmit={submit}>
        <p className="wordmark wordmark--admin"><span className="wordmark__name">Calma</span><span className="wordmark__place">Panel</span></p>
        <label className="field">
          <span className="field__label">PIN de acceso</span>
          <input className="input input--pin num" type="password" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={pin} onChange={(e) => { setPin(e.target.value); setErr(false); }} autoFocus />
        </label>
        {err && <p className="admin__error" role="alert">PIN incorrecto.</p>}
        <button type="submit" className="btn btn--block">Entrar</button>
        <p className="login__hint">Demo: PIN {ADMIN_PIN}</p>
      </form>
    </main>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("reservas");
  const data = useData();
  const pending = data.bookings.filter((b) => b.status === "pending").length;
  const tabs: { id: Tab; label: string }[] = [
    { id: "reservas", label: pending ? `Reservas (${pending})` : "Reservas" },
    { id: "calendario", label: "Calendario" },
    { id: "tarifas", label: "Tarifas" },
    { id: "ajustes", label: "Ajustes" },
  ];
  return (
    <main className="admin">
      <header className="admin__bar">
        <div className="admin__barin">
          <p className="wordmark wordmark--admin"><span className="wordmark__name">Calma</span><span className="wordmark__place">Panel</span></p>
          <div className="admin__baractions">
            <a className="link" href="/" target="_blank" rel="noopener noreferrer">Ver web</a>
            <button type="button" className="link" onClick={onLogout}>Salir</button>
          </div>
        </div>
        <nav className="admin__tabs" aria-label="Secciones del panel">
          {tabs.map((t) => (
            <button key={t.id} type="button" className="admin__tab" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
      </header>
      <div className="admin__body">
        {tab === "reservas" && <Reservas />}
        {tab === "calendario" && <Calendario />}
        {tab === "tarifas" && <Tarifas />}
        {tab === "ajustes" && <Ajustes />}
      </div>
    </main>
  );
}

function Reservas() {
  const data = useData();
  const [filter, setFilter] = useState<"todas" | BookingStatus>("todas");
  const list = useMemo(
    () =>
      [...data.bookings]
        .filter((b) => filter === "todas" || b.status === filter)
        .sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1)),
    [data.bookings, filter],
  );
  const cabinName = (id: string) => data.cabins.find((c) => c.id === id)?.name ?? id;
  const sedeName = (id: string) => {
    const c = data.cabins.find((x) => x.id === id);
    return c ? SEDE_NAME[c.sedeId] : "";
  };

  function contact(b: Booking) {
    const msg = `Hola ${b.name.replace(/\s*\(.*\)$/, "")}, te escribimos de Calma por tu reserva ${b.code}.`;
    return waLink(msg, b.phone);
  }

  return (
    <section aria-labelledby="res-title">
      <div className="admin__head">
        <h1 id="res-title" className="admin__h">Reservas</h1>
        <div className="seg seg--small" role="group" aria-label="Filtrar reservas">
          {(["todas", "pending", "confirmed", "cancelled"] as const).map((f) => (
            <button key={f} type="button" className="seg__btn" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "todas" ? "Todas" : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
      </div>
      {list.length === 0 && <p className="muted">No hay reservas con este filtro.</p>}
      <ul className="res">
        {list.map((b) => (
          <li key={b.id} className={`res__item res__item--${b.status}`}>
            <div className="res__top">
              <span className="res__code num">{b.code}</span>
              <span className={`status status--${b.status}`}>{STATUS_LABEL[b.status]}</span>
            </div>
            <p className="res__name">{b.name}</p>
            <p className="res__meta">
              {sedeName(b.cabinId)}, cabaña {cabinName(b.cabinId)}
            </p>
            <p className="res__meta">
              {formatDate(b.checkIn, "es", { weekday: "short", day: "numeric", month: "short" })} → {formatDate(b.checkOut, "es", { weekday: "short", day: "numeric", month: "short" })}
              {" "}({Math.round((fromISO(b.checkOut).getTime() - fromISO(b.checkIn).getTime()) / 86400000)} noches)
            </p>
            <p className="res__meta">
              {b.guests} {b.guests === 1 ? "huésped" : "huéspedes"}{b.pet ? ", con mascota" : ""}. Total <span className="num">USD {b.total}</span>, seña <span className="num">USD {b.deposit}</span>
            </p>
            <p className="res__src">Origen: {b.source === "chat" ? "asistente de chat" : "formulario web"}, idioma {b.lang.toUpperCase()}</p>
            <div className="res__actions">
              {b.status !== "confirmed" && (
                <button type="button" className="btn btn--sm" onClick={() => actions.setBookingStatus(b.id, "confirmed")}>Aprobar</button>
              )}
              {b.status !== "cancelled" && (
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => actions.setBookingStatus(b.id, "cancelled")}>Cancelar</button>
              )}
              {b.status === "cancelled" && (
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => actions.setBookingStatus(b.id, "pending")}>Reactivar</button>
              )}
              <a className="btn btn--sm btn--wa" href={contact(b)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Calendario() {
  const data = useData();
  const [cabinId, setCabinId] = useState(data.cabins[0]?.id ?? "");
  const t = fromISO(todayISO());
  const [view, setView] = useState({ y: t.getFullYear(), m: t.getMonth() });
  const cells = monthGrid(view.y, view.m);
  const busy = busyNights(data, cabinId);
  const move = (delta: number) => {
    const nd = new Date(view.y, view.m + delta, 1);
    setView({ y: nd.getFullYear(), m: nd.getMonth() });
  };
  const blockedCount = (data.blocks[cabinId] ?? []).filter((x) => x >= todayISO()).length;

  return (
    <section aria-labelledby="cal-title">
      <div className="admin__head">
        <h1 id="cal-title" className="admin__h">Bloqueos</h1>
        <p className="muted admin__sub">Tocá una noche para bloquearla o liberarla. Se actualiza al instante en la web y en el chat.</p>
      </div>
      <div className="admin__cabins" role="group" aria-label="Cabaña">
        {(["pedrera", "sansebastian"] as const).map((sid) => (
          <div key={sid} className="admin__cabgroup">
            <p className="label">{SEDE_NAME[sid]}</p>
            <div className="seg seg--small">
              {data.cabins.filter((c) => c.sedeId === sid).map((c) => (
                <button key={c.id} type="button" className="seg__btn" aria-pressed={cabinId === c.id} onClick={() => setCabinId(c.id)}>{c.name}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="cal cal--admin">
        <div className="cal__head">
          <button type="button" className="cal__nav" onClick={() => move(-1)} aria-label="Mes anterior">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
          <span className="cal__month">{monthLabel(view.y, view.m, "es")}</span>
          <button type="button" className="cal__nav" onClick={() => move(1)} aria-label="Mes siguiente">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
        </div>
        <div className="cal__grid">
          {weekdayInitials("es").map((w, i) => <span key={i} className="cal__wd" aria-hidden="true">{w}</span>)}
          {cells.map((iso, i) => {
            if (!iso) return <span key={`e${i}`} className="cal__empty" />;
            const st = nightState(data, cabinId, iso);
            const label = formatDate(iso, "es", { weekday: "long", day: "numeric", month: "long" });
            if (st === "booked") {
              return <span key={iso} className="cal__day is-booked" title="Reservada" aria-label={`${label}: reservada`}>{Number(iso.slice(8))}</span>;
            }
            return (
              <button
                key={iso}
                type="button"
                className={`cal__day${st === "blocked" ? " is-blocked" : ""}`}
                disabled={st === "past"}
                aria-pressed={st === "blocked"}
                aria-label={`${label}: ${st === "blocked" ? "bloqueada, tocar para liberar" : "libre, tocar para bloquear"}`}
                onClick={() => actions.toggleBlock(cabinId, iso)}
              >
                {Number(iso.slice(8))}
              </button>
            );
          })}
        </div>
      </div>
      <ul className="legend legend--admin">
        <li><span className="sw sw--free" aria-hidden="true" />Libre</li>
        <li><span className="sw sw--booked" aria-hidden="true" />Reservada</li>
        <li><span className="sw sw--blocked" aria-hidden="true" />Bloqueada</li>
      </ul>
      <p className="muted admin__sub">
        {blockedCount} noches bloqueadas y {[...busy].filter((n) => n >= todayISO() && !(data.blocks[cabinId] ?? []).includes(n)).length} noches reservadas de hoy en adelante.
      </p>
    </section>
  );
}

function NumberField({ label, value, onChange, prefix, suffix, min = 0, max = 99999 }: {
  label: string; value: number; onChange: (n: number) => void; prefix?: string; suffix?: string; min?: number; max?: number;
}) {
  const [txt, setTxt] = useState(String(value));
  useEffect(() => setTxt(String(value)), [value]);
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <span className="affix">
        {prefix && <span className="affix__part">{prefix}</span>}
        <input
          className="input num"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={txt}
          onChange={(e) => {
            setTxt(e.target.value);
            const n = Number(e.target.value);
            if (e.target.value !== "" && Number.isFinite(n) && n >= min && n <= max) onChange(Math.round(n));
          }}
        />
        {suffix && <span className="affix__part">{suffix}</span>}
      </span>
    </label>
  );
}

function Tarifas() {
  const data = useData();
  const s = data.settings;
  return (
    <section aria-labelledby="tar-title">
      <div className="admin__head">
        <h1 id="tar-title" className="admin__h">Tarifas por noche</h1>
        <p className="muted admin__sub">
          Temporada alta del {s.highStart.split("-").reverse().join("/")} al {s.highEnd.split("-").reverse().join("/")}. Los cambios se ven al instante en la web y en el chat.
        </p>
      </div>
      <div className="rates">
        {data.cabins.map((c) => (
          <div key={c.id} className="rate">
            <div className="rate__head">
              <p className="rate__name">{c.name}</p>
              <p className="muted">{SEDE_NAME[c.sedeId]}</p>
            </div>
            <div className="rate__fields">
              <NumberField label="Temporada baja" prefix="USD" value={c.rateLow} min={1} onChange={(n) => actions.updateCabin(c.id, { rateLow: n })} />
              <NumberField label="Temporada alta" prefix="USD" value={c.rateHigh} min={1} onChange={(n) => actions.updateCabin(c.id, { rateHigh: n })} />
              <NumberField label="Huéspedes máx." value={c.capacity} min={1} max={12} onChange={(n) => actions.updateCabin(c.id, { capacity: n })} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Ajustes() {
  const data = useData();
  const s = data.settings;
  const [confirmReset, setConfirmReset] = useState(false);
  const mdField = (label: string, key: "highStart" | "highEnd") => {
    const [m, d] = s[key].split("-");
    return (
      <label className="field">
        <span className="field__label">{label}</span>
        <input
          className="input"
          type="date"
          value={`2026-${m}-${d}`}
          onChange={(e) => {
            if (e.target.value) actions.updateSettings({ [key]: e.target.value.slice(5) });
          }}
        />
      </label>
    );
  };
  return (
    <section aria-labelledby="aj-title">
      <div className="admin__head">
        <h1 id="aj-title" className="admin__h">Ajustes</h1>
      </div>
      <div className="settings">
        <NumberField label="Seña" suffix="%" value={s.depositPct} min={0} max={100} onChange={(n) => actions.updateSettings({ depositPct: n })} />
        <NumberField label="Estadía mínima" suffix="noches" value={s.minNights} min={1} max={30} onChange={(n) => actions.updateSettings({ minNights: n })} />
        <NumberField label="Cargo por mascota" prefix="USD" value={s.petFee} min={0} onChange={(n) => actions.updateSettings({ petFee: n })} />
        <NumberField label="Mascotas máx. por cabaña" value={s.maxPets} min={0} max={6} onChange={(n) => actions.updateSettings({ maxPets: n })} />
        <label className="field">
          <span className="field__label">Check-in desde</span>
          <input className="input" type="time" value={s.checkIn} onChange={(e) => e.target.value && actions.updateSettings({ checkIn: e.target.value })} />
        </label>
        <label className="field">
          <span className="field__label">Check-out hasta</span>
          <input className="input" type="time" value={s.checkOut} onChange={(e) => e.target.value && actions.updateSettings({ checkOut: e.target.value })} />
        </label>
        {mdField("Temporada alta desde (día y mes)", "highStart")}
        {mdField("Temporada alta hasta (día y mes)", "highEnd")}
      </div>
      <div className="admin__danger">
        <p className="muted">Los datos de esta demo viven en este navegador. En producción se conectan a una base de datos compartida.</p>
        {confirmReset ? (
          <div className="res__actions">
            <button type="button" className="btn btn--sm" onClick={() => { actions.reset(); setConfirmReset(false); }}>Sí, restaurar</button>
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => setConfirmReset(false)}>No</button>
          </div>
        ) : (
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => setConfirmReset(true)}>Restaurar datos de ejemplo</button>
        )}
      </div>
    </section>
  );
}
