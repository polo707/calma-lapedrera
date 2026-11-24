import type { Lang } from "@/lib/types";

/**
 * Textos extra del módulo de reserva, el tablero, el calendario y el chat.
 * Complementan dict.ts (no lo reemplazan). Todo lo demás sigue saliendo de dict.ts.
 */
const es = {
  steps: {
    label: "Pasos de la reserva",
    of: (n: number, total: number) => `Paso ${n} de ${total}`,
    names: ["Sede y cabaña", "Fechas", "Huéspedes", "Tus datos"],
    done: "completo",
  },
  stay: "Tu estadía",
  perNightShort: "/ noche",
  selected: "Elegida",
  datesPending: "Sin fechas",
  totalLabel: "Total de la estadía",
  direct: "Reserva directa",
  saving: "Registrando tu reserva…",
  saved: "Reserva registrada",
  ticket: {
    eyebrow: "Código de reserva",
    status: "Pendiente de seña",
    copy: "Copiar código",
    copied: "Código copiado",
  },
  board: {
    today: "Hoy",
    tapToBook: "Tocá para empezar la reserva",
  },
  cal: {
    checkIn: "Llegada",
    checkOut: "Salida",
    keys: "Usá las flechas para moverte entre los días.",
  },
  chat: {
    online: "En línea",
    typing: "El asistente está escribiendo",
  },
};

export type BookingExtra = typeof es;

const en: BookingExtra = {
  steps: {
    label: "Booking steps",
    of: (n: number, total: number) => `Step ${n} of ${total}`,
    names: ["Location and cabin", "Dates", "Guests", "Your details"],
    done: "complete",
  },
  stay: "Your stay",
  perNightShort: "/ night",
  selected: "Selected",
  datesPending: "No dates yet",
  totalLabel: "Total for your stay",
  direct: "Direct booking",
  saving: "Registering your booking…",
  saved: "Booking registered",
  ticket: {
    eyebrow: "Booking code",
    status: "Deposit pending",
    copy: "Copy code",
    copied: "Code copied",
  },
  board: {
    today: "Today",
    tapToBook: "Tap to start your booking",
  },
  cal: {
    checkIn: "Check-in",
    checkOut: "Check-out",
    keys: "Use the arrow keys to move between days.",
  },
  chat: {
    online: "Online",
    typing: "The assistant is typing",
  },
};

const pt: BookingExtra = {
  steps: {
    label: "Etapas da reserva",
    of: (n: number, total: number) => `Etapa ${n} de ${total}`,
    names: ["Sede e cabana", "Datas", "Hóspedes", "Seus dados"],
    done: "concluída",
  },
  stay: "Sua estadia",
  perNightShort: "/ noite",
  selected: "Escolhida",
  datesPending: "Sem datas",
  totalLabel: "Total da estadia",
  direct: "Reserva direta",
  saving: "Registrando sua reserva…",
  saved: "Reserva registrada",
  ticket: {
    eyebrow: "Código da reserva",
    status: "Sinal pendente",
    copy: "Copiar código",
    copied: "Código copiado",
  },
  board: {
    today: "Hoje",
    tapToBook: "Toque para começar a reserva",
  },
  cal: {
    checkIn: "Chegada",
    checkOut: "Saída",
    keys: "Use as setas para se mover entre os dias.",
  },
  chat: {
    online: "Online",
    typing: "O assistente está digitando",
  },
};

export const BOOKING_EXTRA: Record<Lang, BookingExtra> = { es, en, pt };

export function bx(lang: Lang): BookingExtra {
  return BOOKING_EXTRA[lang];
}
