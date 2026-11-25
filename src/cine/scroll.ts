"use client";

import { useSyncExternalStore } from "react";

/**
 * Motor de scroll de la experiencia cinemática.
 * - Detecta el capítulo activo (elementos con [data-chapter]).
 * - Aplica el parallax directamente al DOM, sin re-render de React por frame.
 * - Rendimiento: primero LEE todas las medidas y después ESCRIBE (sin layout thrashing),
 *   solo anima las capas cercanas a la vista y deja de trabajar en las secciones de papel.
 */

type State = { active: number; scrolled: boolean; tone: "dark" | "light" };

let state: State = { active: 0, scrolled: false, tone: "dark" };
const listeners = new Set<() => void>();
let started = false;
let raf = 0;
let reduce = false;
let lite = false; // táctil / pantallas chicas: menos trabajo por frame
/** Alto de pantalla fijo (igual que --vh): no cambia cuando las barras del navegador se esconden. */
let fixedVh = 0;
let lastW = 0;

let chapters: HTMLElement[] = [];
let layers: { scene: number; base: HTMLElement | null; depth: HTMLElement | null }[] = [];
let frames: { el: HTMLElement; chapter: HTMLElement }[] = [];

function collect() {
  chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
  layers = Array.from(document.querySelectorAll<HTMLElement>(".scene-layer")).map((el) => ({
    scene: Number(el.dataset.scene),
    base: el.querySelector<HTMLElement>(".base"),
    depth: el.querySelector<HTMLElement>(".depth"),
  }));
  frames = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter] .copy-frame__inner")).map((el) => ({
    el,
    chapter: el.closest<HTMLElement>("[data-chapter]")!,
  }));
}

function emit(next: State) {
  if (next.active === state.active && next.scrolled === state.scrolled && next.tone === state.tone) return;
  state = next;
  listeners.forEach((l) => l());
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function frame() {
  raf = 0;
  if (!chapters.length || !chapters[0].isConnected) collect();
  const y = window.scrollY;
  if (!fixedVh) {
    fixedVh = window.innerHeight;
    lastW = window.innerWidth;
  }
  const vh = fixedVh;

  // ---- LECTURA (una sola pasada de medidas) ----
  const tops = chapters.map((el) => el.getBoundingClientRect());

  let active = 0;
  let tone: "dark" | "light" = "dark";
  chapters.forEach((el, i) => {
    if (tops[i].top <= vh * 0.5) {
      active = Number(el.dataset.chapter);
      tone = el.dataset.tone === "light" ? "light" : "dark";
    }
  });
  const rectOf = (ch: HTMLElement) => tops[chapters.indexOf(ch)];

  // ---- ESCRITURA ----
  if (!reduce) {
    for (const l of layers) {
      if (Math.abs(l.scene - active) > 1) continue; // solo la escena activa y sus vecinas
      const idx = chapters.findIndex((c) => Number(c.dataset.chapter) === l.scene);
      if (idx < 0) continue;
      const r = tops[idx];
      const local = clamp(-r.top / Math.max(1, r.height - vh), -0.6, 1.4);
      if (l.base) l.base.style.transform = `translate3d(0, ${(-local * 4).toFixed(2)}vh, 0) scale(${(1.08 - local * 0.05).toFixed(4)})`;
      if (l.depth && !lite) l.depth.style.transform = `translate3d(${(-local * 1.6).toFixed(2)}vw, ${(-local * 11).toFixed(2)}vh, 0) scale(${(1.14 - local * 0.07).toFixed(4)})`;
    }
    for (const f of frames) {
      const r = rectOf(f.chapter);
      if (!r || r.bottom < -vh || r.top > vh * 2) continue;
      const out = clamp((-r.top - (r.height - vh) * 0.72) / (vh * 0.5), 0, 1);
      f.el.style.opacity = String(1 - out);
      f.el.style.transform = out > 0 ? `translate3d(0, ${(-out * 6).toFixed(2)}vh, 0)` : "";
    }
  }

  // clases de estado: solo cuando cambia el capítulo
  if (active !== state.active || !chapters.some((el) => el.classList.contains("is-active"))) {
    for (const el of chapters) {
      const on = Number(el.dataset.chapter) === active;
      el.classList.toggle("is-active", on);
      if (on) el.classList.add("was-active");
    }
  }
  emit({ active, scrolled: y > 24, tone });
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(frame);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const lq = window.matchMedia("(pointer: coarse), (max-width: 820px)");
  reduce = mq.matches;
  lite = lq.matches;
  mq.addEventListener("change", () => {
    reduce = mq.matches;
    schedule();
  });
  lq.addEventListener("change", () => {
    lite = lq.matches;
    schedule();
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => {
    // solo recalculamos el alto si cambió el ancho (rotación), no por las barras del navegador
    if (Math.abs(window.innerWidth - lastW) > 40) {
      lastW = window.innerWidth;
      fixedVh = window.innerHeight;
      collect();
    }
    schedule();
  });
  collect();
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
  collect();
  schedule();
}
