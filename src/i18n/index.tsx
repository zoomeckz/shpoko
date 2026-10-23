import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type MessageKey } from "./locales/en";

/** Interface languages. Lesson content stays English for now. */
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "sv", name: "Svenska" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "nl", name: "Nederlands" },
  { code: "ar-TN", name: "تونسي", rtl: true },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

type Dictionary = Record<string, string>;

/** English is built in; the others are downloaded only by people who use them. */
const LOADERS: Record<Exclude<LanguageCode, "en">, () => Promise<Dictionary>> = {
  sv: () => import("./locales/sv").then((m) => m.sv),
  es: () => import("./locales/es").then((m) => m.es),
  fr: () => import("./locales/fr").then((m) => m.fr),
  de: () => import("./locales/de").then((m) => m.de),
  nl: () => import("./locales/nl").then((m) => m.nl),
  "ar-TN": () => import("./locales/ar-TN").then((m) => m.arTN),
};

const dictionaries: Partial<Record<LanguageCode, Dictionary>> = { en };

/** Makes sure a language's words are here. Falls back to English if the download fails. */
export async function loadLanguage(code: LanguageCode) {
  if (dictionaries[code]) return;
  try {
    dictionaries[code] = await LOADERS[code as Exclude<LanguageCode, "en">]();
  } catch {
    // Offline or a stale page: English it is, for now.
  }
}

// t("key") takes plain keys, and plural keys without their _one/_other ending.
type PluralBase<K> = K extends `${infer B}_other` ? B : never;
export type TKey = Exclude<MessageKey, `${string}_one` | `${string}_other`> | PluralBase<MessageKey>;
export type Vars = Record<string, string | number>;
export type TFunction = (key: TKey, vars?: Vars) => string;

const STORAGE_KEY = "shpoko-language";

/** The saved choice, or the browser's language if we have it, or English. */
export function initialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved as LanguageCode;
  } catch {
    // No saved choice.
  }
  for (const wanted of navigator.languages ?? [navigator.language]) {
    const lower = wanted.toLowerCase();
    if (lower === "ar-tn") return "ar-TN";
    const match = LANGUAGES.find((l) => l.code !== "ar-TN" && lower.split("-")[0] === l.code);
    if (match) return match.code;
  }
  return "en";
}

function translate(code: LanguageCode, key: TKey, vars?: Vars): string {
  const dict = dictionaries[code] ?? en;
  let text: string | undefined;
  if (vars && typeof vars.n === "number" && (`${key}_other` in en)) {
    const rule = new Intl.PluralRules(code).select(vars.n);
    text = dict[`${key}_${rule}`] ?? dict[`${key}_other`] ?? (en as Record<string, string>)[`${key}_other`];
  } else {
    text = dict[key] ?? (en as Record<string, string>)[key];
  }
  if (text === undefined) return key;
  return vars ? text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m)) : text;
}

interface I18nValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: TFunction;
  /** For dates and numbers, e.g. toLocaleDateString(locale). */
  locale: string;
  rtl: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage);
  const info = LANGUAGES.find((l) => l.code === language)!;
  const rtl = "rtl" in info && info.rtl;

  // Switches once the new language has arrived, so nothing flashes in English.
  const setLanguage = useCallback((code: LanguageCode) => {
    loadLanguage(code).then(() => setLanguageState(code));
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Remembered for this visit only.
    }
  }, []);

  // The page's language and reading direction follow the choice.
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [language, rtl]);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage,
      t: (key, vars) => translate(language, key, vars),
      locale: language === "en" ? "en-GB" : language,
      rtl,
    }),
    [language, setLanguage, rtl]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}

/** The translate function: t("nav.learn"), t("path.practiseCount", { n: 3 }). */
export const useT = () => useI18n().t;
