import type { Data } from "./types";
import { addDays, todayISO } from "./dates";

/**
 * Datos de ejemplo de la demo. Nombres de cabañas, tarifas y reservas son editables
 * desde /admin y deben confirmarse con Calma antes de salir a producción.
 */
export function seedData(): Data {
  const t = todayISO();
  return {
    version: 3,
    cabins: [
      { id: "agua", sedeId: "sansebastian", name: "Agua", capacity: 2, rateLow: 95, rateHigh: 130, photo: "/photos/puerta-agua.jpg", kind: "aframe" },
      { id: "tierra", sedeId: "sansebastian", name: "Tierra", capacity: 2, rateLow: 95, rateHigh: 130, photo: "/photos/aframe-dia-deck.jpg", kind: "aframe" },
      { id: "aire", sedeId: "sansebastian", name: "Aire", capacity: 2, rateLow: 95, rateHigh: 130, photo: "/photos/aframe-luces.jpg", kind: "aframe" },
      { id: "fuego", sedeId: "pedrera", name: "Fuego", capacity: 2, rateLow: 90, rateHigh: 125, photo: "/photos/aframe-entre-arboles.jpg", kind: "aframe" },
      { id: "bosque", sedeId: "pedrera", name: "Bosque", capacity: 4, rateLow: 110, rateHigh: 150, photo: "/photos/cabana-bosque.jpg", kind: "box" },
    ],
    settings: {
      depositPct: 30,
      highStart: "12-15",
      highEnd: "03-15",
      checkIn: "15:00",
      checkOut: "11:00",
      minNights: 2,
      petFee: 15,
      maxPets: 2,
    },
    blocks: {
      agua: [addDays(t, 9), addDays(t, 10)],
      fuego: [addDays(t, 4), addDays(t, 5), addDays(t, 6)],
      bosque: [addDays(t, 15)],
    },
    bookings: [
      {
        id: "demo-1", code: "CLM-7QXR", cabinId: "tierra", checkIn: addDays(t, 2), checkOut: addDays(t, 5),
        guests: 2, pet: true, name: "Lucía (ejemplo)", phone: "59899111222", total: 300, deposit: 90,
        status: "confirmed", source: "web", lang: "es", createdAt: new Date().toISOString(), demo: true,
      },
      {
        id: "demo-2", code: "CLM-4F7K", cabinId: "aire", checkIn: addDays(t, 6), checkOut: addDays(t, 8),
        guests: 2, pet: false, name: "Mariana (exemplo)", phone: "5511988887777", total: 210, deposit: 63,
        status: "pending", source: "chat", lang: "pt", createdAt: new Date().toISOString(), demo: true,
      },
      {
        id: "demo-3", code: "CLM-9HMT", cabinId: "bosque", checkIn: addDays(t, 1), checkOut: addDays(t, 3),
        guests: 4, pet: false, name: "Tom (example)", phone: "14155550123", total: 220, deposit: 66,
        status: "pending", source: "web", lang: "en", createdAt: new Date().toISOString(), demo: true,
      },
    ],
  };
}
