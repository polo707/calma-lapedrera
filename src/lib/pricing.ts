import { diffNights, eachNight, todayISO } from "./dates";
import type { Cabin, Data, Settings } from "./types";

export function isHighSeason(iso: string, s: Settings): boolean {
  const md = iso.slice(5);
  if (s.highStart <= s.highEnd) return md >= s.highStart && md <= s.highEnd;
  return md >= s.highStart || md <= s.highEnd;
}

export function nightlyRate(cabin: Cabin, iso: string, s: Settings): number {
  return isHighSeason(iso, s) ? cabin.rateHigh : cabin.rateLow;
}

/** Tarifa vigente hoy (para mostrar "por noche" en listados). */
export function currentRate(cabin: Cabin, s: Settings): number {
  return nightlyRate(cabin, todayISO(), s);
}

export type Quote = {
  nights: number;
  lodging: number;
  petFee: number;
  total: number;
  deposit: number;
  balance: number;
};

export function quote(cabin: Cabin, checkIn: string, checkOut: string, pet: boolean, s: Settings): Quote {
  const nights = diffNights(checkIn, checkOut);
  const lodging = eachNight(checkIn, checkOut).reduce((sum, n) => sum + nightlyRate(cabin, n, s), 0);
  const petFee = pet ? s.petFee : 0;
  const total = lodging + petFee;
  const deposit = Math.round((total * s.depositPct) / 100);
  return { nights, lodging, petFee, total, deposit, balance: total - deposit };
}

/** Noches ocupadas (bloqueos + reservas activas) de una cabaña. */
export function busyNights(data: Data, cabinId: string): Set<string> {
  const set = new Set<string>(data.blocks[cabinId] ?? []);
  for (const b of data.bookings) {
    if (b.cabinId !== cabinId || b.status === "cancelled") continue;
    for (const n of eachNight(b.checkIn, b.checkOut)) set.add(n);
  }
  return set;
}

export type NightState = "free" | "booked" | "blocked" | "past";

export function nightState(data: Data, cabinId: string, iso: string): NightState {
  if (iso < todayISO()) return "past";
  if ((data.blocks[cabinId] ?? []).includes(iso)) return "blocked";
  for (const b of data.bookings) {
    if (b.cabinId === cabinId && b.status !== "cancelled" && iso >= b.checkIn && iso < b.checkOut) return "booked";
  }
  return "free";
}

export function isRangeFree(busy: Set<string>, checkIn: string, checkOut: string): boolean {
  return eachNight(checkIn, checkOut).every((n) => !busy.has(n));
}

export const money = (n: number) => `USD ${n.toLocaleString("en-US")}`;
