/** Utilidades de fechas en formato ISO local (YYYY-MM-DD), sin zonas horarias. */

const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function diffNights(checkIn: string, checkOut: string): number {
  const ms = fromISO(checkOut).getTime() - fromISO(checkIn).getTime();
  return Math.round(ms / 86_400_000);
}

/** Noches de una estadía: desde checkIn inclusive hasta checkOut exclusive. */
export function eachNight(checkIn: string, checkOut: string): string[] {
  const out: string[] = [];
  let cur = checkIn;
  while (cur < checkOut) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

const LOCALES = { es: "es-UY", en: "en-US", pt: "pt-BR" } as const;

export function formatDate(iso: string, lang: keyof typeof LOCALES, opts?: Intl.DateTimeFormatOptions): string {
  return fromISO(iso).toLocaleDateString(LOCALES[lang], opts ?? { day: "numeric", month: "short" });
}

export function monthLabel(year: number, month: number, lang: keyof typeof LOCALES): string {
  const s = new Date(year, month, 1).toLocaleDateString(LOCALES[lang], { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function weekdayInitials(lang: keyof typeof LOCALES): string[] {
  // Semana empezando en lunes
  const base = new Date(2024, 0, 1); // lunes
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toLocaleDateString(LOCALES[lang], { weekday: "narrow" });
  });
}

/** Celdas de un mes con lunes como primer día; null = hueco. */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toISO(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
