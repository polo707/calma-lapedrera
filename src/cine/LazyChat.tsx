"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ChatWidget = dynamic(() => import("@/chat/ChatWidget").then((m) => m.ChatWidget), { ssr: false });

/** El asistente se carga cuando el navegador está libre, para no competir con la carga inicial. */
export function LazyChat() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => setReady(true);
    const onFirst = () => go();
    window.addEventListener("pointerdown", onFirst, { once: true });
    window.addEventListener("keydown", onFirst, { once: true });
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 4000 });
    else window.setTimeout(go, 2500);
    return () => {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
  }, []);
  return ready ? <ChatWidget /> : null;
}
