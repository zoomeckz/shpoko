import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGUAGES, useI18n, type LanguageCode } from "@/i18n";

/** A small dropdown for the interface language. */
export function LanguageSelect({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();
  return (
    <label className={cn("relative flex items-center gap-2 text-sm font-bold text-muted-foreground", className)}>
      <Globe className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t("common.language")}</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="min-w-0 flex-1 cursor-pointer appearance-none rounded-lg bg-transparent py-1 pe-6 font-bold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute end-1 text-xs" aria-hidden="true">
        ▾
      </span>
    </label>
  );
}
