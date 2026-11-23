"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** true solo en el cliente después de hidratar (evita desajustes con fechas y localStorage). */
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
