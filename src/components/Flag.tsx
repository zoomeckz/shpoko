import { cn } from "@/lib/utils";
import type { LanguageCode } from "@/i18n";

/** Points of a five-pointed star, for the Tunisian flag. */
const star = (cx: number, cy: number, outer: number, inner: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    // Tunisia's star has one point towards the hoist, so start at 180°.
    const a = Math.PI + (i * Math.PI) / 5;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

const TN_STAR = star(33.6, 20, 4.1, 1.6);

/**
 * A small country flag for each interface language, drawn as SVG
 * (Windows doesn't show flag emoji).
 */
const FLAGS: Record<LanguageCode, JSX.Element> = {
  en: (
    <>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 60,40 M60,0 0,40" stroke="#fff" strokeWidth="8" />
      <path d="M0,0 60,40 M60,0 0,40" stroke="#C8102E" strokeWidth="3" />
      <path d="M30,0 v40 M0,20 h60" stroke="#fff" strokeWidth="12" />
      <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="7" />
    </>
  ),
  sv: (
    <>
      <rect width="60" height="40" fill="#006AA7" />
      <rect x="18" width="8" height="40" fill="#FECC00" />
      <rect y="16" width="60" height="8" fill="#FECC00" />
    </>
  ),
  es: (
    <>
      <rect width="60" height="40" fill="#AA151B" />
      <rect y="10" width="60" height="20" fill="#F1BF00" />
    </>
  ),
  fr: (
    <>
      <rect width="20" height="40" fill="#002654" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#CE1126" />
    </>
  ),
  de: (
    <>
      <rect width="60" height="14" fill="#000" />
      <rect y="13" width="60" height="14" fill="#DD0000" />
      <rect y="26" width="60" height="14" fill="#FFCE00" />
    </>
  ),
  nl: (
    <>
      <rect width="60" height="14" fill="#AE1C28" />
      <rect y="13" width="60" height="14" fill="#fff" />
      <rect y="26" width="60" height="14" fill="#21468B" />
    </>
  ),
  "ar-TN": (
    <>
      <rect width="60" height="40" fill="#E70013" />
      <circle cx="30" cy="20" r="10" fill="#fff" />
      <circle cx="30" cy="20" r="7.5" fill="#E70013" />
      <circle cx="32" cy="20" r="6" fill="#fff" />
      <polygon points={TN_STAR} fill="#E70013" />
    </>
  ),
};

export function Flag({ code, className }: { code: LanguageCode; className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      aria-hidden="true"
      className={cn("h-4 w-6 shrink-0 rounded-[3px] ring-1 ring-black/15", className)}
    >
      {FLAGS[code]}
    </svg>
  );
}
