"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEY } from "@/config/site";
import { seedData } from "./seed";
import type { Booking, BookingStatus, Cabin, Data, Settings } from "./types";

/**
 * Fuente de datos única para la web, el asistente de chat y /admin.
 *
 * Hoy persiste en localStorage (demo). Para producción, implementar la misma interfaz
 * `Repository` contra una base de datos (Supabase, Postgres, etc.) y cambiar `repo`.
 */
export interface Repository {
  read(): Data;
  write(data: Data): void;
  subscribe(cb: () => void): () => void;
}

const EVENT = "calma:data";
let cache: Data | null = null;
let serverSnapshot: Data | null = null;

const localRepo: Repository = {
  read() {
    if (cache) return cache;
    if (typeof window === "undefined") return getServerSnapshot();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Data;
        if (parsed && parsed.version === 1 && Array.isArray(parsed.cabins)) {
          cache = parsed;
          return cache;
        }
      }
    } catch {
      /* localStorage no disponible: seguimos en memoria */
    }
    cache = seedData();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
      /* sin persistencia */
    }
    return cache;
  },
  write(data) {
    cache = data;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* sin persistencia */
    }
    window.dispatchEvent(new Event(EVENT));
  },
  subscribe(cb) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        cache = null;
        cb();
      }
    };
    window.addEventListener(EVENT, cb);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, cb);
      window.removeEventListener("storage", onStorage);
    };
  },
};

function getServerSnapshot(): Data {
  if (!serverSnapshot) serverSnapshot = seedData();
  return serverSnapshot;
}

const repo: Repository = localRepo;

export function useData(): Data {
  return useSyncExternalStore(repo.subscribe, repo.read, getServerSnapshot);
}

export function getData(): Data {
  return repo.read();
}

function update(fn: (d: Data) => Data) {
  repo.write(fn(repo.read()));
}

export const actions = {
  addBooking(b: Booking) {
    update((d) => ({ ...d, bookings: [b, ...d.bookings] }));
  },
  setBookingStatus(id: string, status: BookingStatus) {
    update((d) => ({ ...d, bookings: d.bookings.map((b) => (b.id === id ? { ...b, status } : b)) }));
  },
  deleteBooking(id: string) {
    update((d) => ({ ...d, bookings: d.bookings.filter((b) => b.id !== id) }));
  },
  updateCabin(id: string, patch: Partial<Cabin>) {
    update((d) => ({ ...d, cabins: d.cabins.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  },
  updateSettings(patch: Partial<Settings>) {
    update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  },
  toggleBlock(cabinId: string, iso: string) {
    update((d) => {
      const cur = d.blocks[cabinId] ?? [];
      const next = cur.includes(iso) ? cur.filter((x) => x !== iso) : [...cur, iso].sort();
      return { ...d, blocks: { ...d.blocks, [cabinId]: next } };
    });
  },
  reset() {
    repo.write(seedData());
  },
};
