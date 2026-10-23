import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type MessageKey } from "./locales/en";
import { sv } from "./locales/sv";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { nl } from "./locales/nl";
import { arTN } from "./locales/ar-TN";

/** Interface languages. Lesson content stays English for now. */
export const LANGUAGES = [
  { code: "en", name: "English", dict: en },
  { code: "sv", name: "Svenska", dict: sv },
  { code: "es", name: "Español", dict: es },
  { code: "fr", name: "Français", dict: fr },
  { code: "de", name: "Deutsch", dict: de },
  { code: "nl", name: "Nederlands", dict: nl },
  { code: "ar-TN", name: "تونسي", dict: arTN, rtl: true },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

// t("key") takes plain keys, and plural keys without their _one/_other ending.
type PluralBase<K> = K extends `${infer B}_other` ? B : never;
export type TKey = Exclude<MessageKey, `${string}_one` | `${string}_other`> | PluralBase<MessageKey>;
export type Vars = Record<string, string | number>;
export type TFunction = (key: TKey, vars?: Vars) => string;

const STORAGE_KEY = "shpoko-language";

/** The saved choice, or the browser's language if we have it, or English. */
function initialLanguage(): LanguageCode {
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
  const dict = LANGUAGES.find((l) => l.code === code)!.dict as Record<string, string>;
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

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
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
