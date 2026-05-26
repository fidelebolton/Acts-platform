import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import en from './en.json';
import rw from './rw.json';

// ─── Dictionaries ─────────────────────────────────────────────────────
// Add a new language by importing its JSON file and adding it here.
// Keep the shape identical to `en.json` so the `Dict` type stays accurate.

export const DICTIONARIES = { en, rw } as const;
export type LangCode = keyof typeof DICTIONARIES;
export type Dict = typeof en;

const STORAGE_KEY = 'acts-platform.lang';
const DEFAULT_LANG: LangCode = 'en';
const SUPPORTED: LangCode[] = ['en', 'rw'];

// ─── Helpers ──────────────────────────────────────────────────────────

/** Pick an initial language: localStorage > browser preference > default. */
function detectLang(): LangCode {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  const stored = window.localStorage.getItem(STORAGE_KEY) as LangCode | null;
  if (stored && SUPPORTED.includes(stored)) return stored;
  const nav = window.navigator.language?.toLowerCase() ?? '';
  if (nav.startsWith('rw')) return 'rw';
  return DEFAULT_LANG;
}

/** Replace `{name}` placeholders inside a string with values from `vars`. */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}

// ─── Context ──────────────────────────────────────────────────────────

interface LanguageContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  /** Active dictionary — typed against en.json so autocomplete works. */
  t: Dict;
  /** Convenience: format a template with `{placeholder}` substitutions. */
  fmt: (template: string, vars?: Record<string, string | number>) => string;
  /** Look up a journey name by its `journey_id` (e.g. `movement-jerusalem`). */
  journeyName: (id: string, fallback?: string) => string;
  /** Look up a panel name by its 1–6 id. */
  panelName: (id: 1 | 2 | 3 | 4 | 5 | 6, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: en,
  fmt: format,
  journeyName: (_id, fallback) => fallback ?? _id,
  panelName: (_id, fallback) => fallback ?? String(_id),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => detectLang());
  const dict = DICTIONARIES[lang];

  // Persist and reflect to <html lang="…"> whenever the language changes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value: LanguageContextValue = {
    lang,
    setLang: setLangState,
    t: dict,
    fmt: format,
    journeyName: (id, fallback) => {
      const journeys = dict.journeys as Record<string, string>;
      return journeys[id] ?? fallback ?? id;
    },
    panelName: (id, fallback) => {
      const panels = dict.panels as Record<string, string>;
      return panels[String(id)] ?? fallback ?? String(id);
    },
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Hook: returns the active dictionary, the language code, and the setter. */
export function useT(): LanguageContextValue {
  return useContext(LanguageContext);
}
