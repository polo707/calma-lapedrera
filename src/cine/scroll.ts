"use client";

import { useSyncExternalStore } from "react";

/**
 * Motor de scroll de la experiencia cinemática.
 * - Detecta el capítulo activo (elementos con [data-chapter]) y su progreso local.
 * - Aplica el parallax directamente al DOM (sin re-render de React por frame).
 * - Expone el capítulo activo a React para el riel, la cabecera y el escenario.
 */

type State = { active: number; scrolled: boolean; tone: "dark" | "light" };

let state: State = { active: 0, scrolled: false, tone: "dark" };
const listeners = new Set<() => void>();
let started = false;
let raf = 0;
let reduce = false;

function emit(next: State) {
  if (next.active === state.active && next.scrolled === state.scrolled && next.tone === state.tone) return;
  state = next;
  listeners.forEach((l) => l());
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function frame() {
  raf = 0;
  const y = window.scrollY;
  const vh = window.innerHeight;
  const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
  let active = 0;
  let tone: "dark" | "light" = "dark";
  for (const el of chapters) {
    const top = el.getBoundingClientRect().top;
    if (top <= vh * 0.5) {
      active = Number(el.dataset.chapter);
      tone = el.dataset.tone === "light" ? "light" : "dark";
    }
  }

  // Parallax de las capas del escenario (base y profundidad con multiplicadores distintos)
  if (!reduce) {
    const layers = document.querySelectorAll<HTMLElement>(".scene-layer");
    layers.forEach((layer) => {
      const i = Number(layer.dataset.scene);
      const ch = document.querySelector<HTMLElement>(`[data-chapter="${i}"]`);
      if (!ch) return;
      const r = ch.getBoundingClientRect();
      const local = clamp(-r.top / Math.max(1, r.height - vh), -0.6, 1.4);
      const base = layer.querySelector<HTMLElement>(".base");
      const depth = layer.querySelector<HTMLElement>(".depth");
      if (base) base.style.transform = `translate3d(0, ${(-local * 4).toFixed(3)}vh, 0) scale(${(1.08 - local * 0.05).toFixed(4)})`;
      if (depth) depth.style.transform = `translate3d(${(-local * 1.6).toFixed(3)}vw, ${(-local * 11).toFixed(3)}vh, 0) scale(${(1.14 - local * 0.07).toFixed(4)})`;
    });
    // copy frames: suave salida hacia arriba
    document.querySelectorAll<HTMLElement>("[data-chapter] .copy-frame__inner").forEach((el) => {
      const ch = el.closest<HTMLElement>("[data-chapter]")!;
      const r = ch.getBoundingClientRect();
      const out = clamp((-r.top - (r.height - vh) * 0.72) / (vh * 0.5), 0, 1);
      el.style.opacity = String(1 - out);
      el.style.transform = `translate3d(0, ${(-out * 6).toFixed(2)}vh, 0)`;
    });
  }

  // clases de estado
  chapters.forEach((el) => {
    const on = Number(el.dataset.chapter) === active;
    el.classList.toggle("is-active", on);
    if (on) el.classList.add("was-active");
  });
  document.documentElement.style.setProperty("--cine-active", String(active));
  emit({ active, scrolled: y > 24, tone });
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(frame);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduce = mq.matches;
  mq.addEventListener("change", () => {
    reduce = mq.matches;
    schedule();
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();
}

function subscribe(cb: () => void) {
  start();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const SERVER: State = { active: 0, scrolled: false, tone: "dark" };

export function useCine(): State {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}

/** Recalcula (p. ej. después de que el loader libera el scroll). */
export function refreshCine() {
  schedule();
}
