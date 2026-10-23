import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGUAGES, useI18n, type LanguageCode } from "@/i18n";
import { Flag } from "@/components/Flag";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/** Each language's country, in that language. */
const COUNTRY: Record<LanguageCode, string> = {
  en: "United Kingdom",
  sv: "Sverige",
  es: "España",
  fr: "France",
  de: "Deutschland",
  nl: "Nederland",
  "ar-TN": "تونس",
};

/** The interface language: a flag and the language's own name, opening a list of the others. */
export function LanguageSelect({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();
  const current = LANGUAGES.find((l) => l.code === language)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t("common.language")}: ${current.name}`}
        className={cn(
          "group inline-flex min-w-0 items-center gap-2.5 rounded-lg py-1 text-sm font-bold text-foreground",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          className
        )}
      >
        <Flag code={current.code} />
        <span lang={current.code} className="min-w-0 flex-1 truncate text-start">
          {current.name}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 opacity-60 transition-transform group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-[60] w-64 rounded-2xl border-2 border-border p-1.5 shadow-xl">
        {LANGUAGES.map((l) => {
          const selected = l.code === language;
          return (
            <DropdownMenuItem
              key={l.code}
              onSelect={() => setLanguage(l.code)}
              className={cn(
                "cursor-pointer gap-3 rounded-xl px-3 py-2.5 focus:bg-muted",
                selected && "bg-primary/10 focus:bg-primary/15"
              )}
            >
              <Flag code={l.code} className="h-5 w-[30px]" />
              <span className="min-w-0 flex-1 text-start">
                <span lang={l.code} className={cn("block font-extrabold", selected ? "text-primary" : "text-foreground")}>
                  {l.name}
                </span>
                <span lang={l.code} className="block text-xs font-bold text-muted-foreground">
                  {COUNTRY[l.code]}
                </span>
              </span>
              {selected && <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={3} aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
