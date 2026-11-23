export type Lang = "es" | "en" | "pt";

export type SedeId = "pedrera" | "sansebastian";

export type Cabin = {
  id: string;
  sedeId: SedeId;
  name: string;
  /** Huéspedes máximos */
  capacity: number;
  /** Tarifa por noche en temporada baja (USD) */
  rateLow: number;
  /** Tarifa por noche en temporada alta (USD) */
  rateHigh: number;
  /** Foto principal (ruta pública) */
  photo: string;
  kind: "aframe" | "box";
};

export type Settings = {
  /** Porcentaje de seña sobre el total */
  depositPct: number;
  /** Inicio de temporada alta, formato MM-DD */
  highStart: string;
  /** Fin de temporada alta (inclusive), formato MM-DD */
  highEnd: string;
  checkIn: string;
  checkOut: string;
  minNights: number;
  /** Cargo único por mascota por estadía (USD) */
  petFee: number;
  maxPets: number;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  code: string;
  cabinId: string;
  /** ISO YYYY-MM-DD */
  checkIn: string;
  checkOut: string;
  guests: number;
  pet: boolean;
  name: string;
  phone: string;
  total: number;
  deposit: number;
  status: BookingStatus;
  source: "web" | "chat";
  lang: Lang;
  createdAt: string;
  demo?: boolean;
};

export type Data = {
  version: number;
  cabins: Cabin[];
  settings: Settings;
  /** Noches bloqueadas por cabaña: cabinId -> lista de fechas ISO */
  blocks: Record<string, string[]>;
  bookings: Booking[];
};
