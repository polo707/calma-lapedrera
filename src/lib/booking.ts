import { WHATSAPP_NUMBER } from "@/config/site";
import { formatDate } from "./dates";
import { t } from "@/i18n/dict";
import type { Booking, Cabin, Lang } from "./types";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeCode(existing: string[]): string {
  for (;;) {
    let s = "";
    for (let i = 0; i < 4; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const code = `CLM-${s}`;
    if (!existing.includes(code)) return code;
  }
}

export function makeId(): string {
  return `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function waLink(text: string, phone: string = WHATSAPP_NUMBER): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

export function bookingMessage(b: Booking, cabin: Cabin, lang: Lang): string {
  const d = (iso: string) => formatDate(iso, lang, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const L = t(lang).wa;
  return [
    L.intro,
    `${L.code}: ${b.code}`,
    `${L.name}: ${b.name}`,
    `${L.place}: ${t(lang).sedes[cabin.sedeId].name}, ${t(lang).cabinWord} ${cabin.name}`,
    `${L.dates}: ${d(b.checkIn)} → ${d(b.checkOut)}`,
    `${L.guests}: ${b.guests}`,
    `${L.pet}: ${b.pet ? L.yes : L.no}`,
    `${L.total}: USD ${b.total}`,
    `${L.deposit}: USD ${b.deposit}`,
    "",
    L.outro,
  ].join("\n");
}
