"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANG_KEY } from "@/config/site";
import type { Lang } from "@/lib/types";
import { t, type Dict, LANGS } from "./dict";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; d: Dict };

const LangContext = createContext<Ctx | null>(null);

function detect(): Lang {
  try {
    const saved = window.localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved && LANGS.includes(saved)) return saved;
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || "es").slice(0, 2);
  if (nav === "pt") return "pt";
  if (nav === "en") return "en";
  return "es";
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const l = detect();
    if (l !== "es") setLangState(l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t(lang).meta.title;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, d: t(lang) }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang fuera de LangProvider");
  return ctx;
}
