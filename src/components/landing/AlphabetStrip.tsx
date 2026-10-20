const ALPHABET = "А Б В Г Д Е Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ь Ю Я".split(" ");

// A slow, endless ribbon of the 30 Bulgarian letters.
export function AlphabetStrip() {
  return (
    <div className="border-y-2 border-border overflow-hidden py-5" aria-hidden="true">
      <div className="flex w-max animate-marquee">
        {[...ALPHABET, ...ALPHABET].map((letter, i) => (
          <span
            key={i}
            className="mx-5 text-3xl font-black text-muted-foreground/40 select-none"
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
