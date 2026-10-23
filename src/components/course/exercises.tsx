import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Exercise, SignColor, TextFont } from "@/data/course";
import { useSfx } from "@/hooks/useSfx";
import { SoundButton } from "./SoundButton";
import { useAutoSpeech } from "@/hooks/useAutoSpeech";
import { playSpeech } from "@/lib/speech";
import { useT } from "@/i18n";

export interface AnswerState {
  ready: boolean;
  correct: boolean;
  /** Shown in the red feedback bar when the answer is wrong. */
  solution: string;
}

interface BaseProps {
  checked: boolean;
  onChange: (state: AnswerState) => void;
  /** For exercises that finish on their own (matching pairs). */
  onComplete: () => void;
}

type TileState = "idle" | "selected" | "correct" | "wrong" | "done";

export const tileClass = (state: TileState) =>
  cn(
    "rounded-2xl border-2 font-extrabold transition-all duration-100 select-none",
    "active:translate-y-1 active:shadow-none disabled:active:translate-y-0",
    state === "idle" && "border-border bg-card text-foreground shadow-[0_4px_0_0_hsl(var(--border))] hover:bg-muted",
    state === "selected" && "border-primary bg-primary/10 text-primary shadow-[0_4px_0_0_hsl(var(--primary))]",
    state === "correct" && "border-success bg-success-light text-success shadow-[0_4px_0_0_hsl(var(--success))]",
    state === "wrong" && "border-error bg-error-light text-error shadow-[0_4px_0_0_hsl(var(--error))] animate-shake",
    state === "done" && "border-border bg-card text-muted-foreground/30 shadow-none cursor-default"
  );

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

function Prompt({ children }: { children: React.ReactNode }) {
  return <h1 className="text-2xl sm:text-[28px] font-extrabold text-foreground">{children}</h1>;
}

/** CSS class for drawing Cyrillic in italics or handwriting. */
export const fontClass = (font?: TextFont) =>
  font === "italic" ? "font-cyr-italic" : font === "handwriting" ? "font-cyr-hand" : "";

/** Big display text: bold print, or a styled font that keeps its own weight. */
const displayClass = (text: string, font?: TextFont) =>
  cn(
    font && font !== "print"
      ? cn(fontClass(font), text.length > 8 ? "text-5xl sm:text-6xl" : "text-6xl sm:text-7xl")
      : cn("font-black tracking-wide", text.length > 6 ? "text-4xl sm:text-6xl" : "text-6xl sm:text-7xl"),
    "text-foreground"
  );

const SIGN_STYLES: Record<SignColor, { outer: string; inner: string }> = {
  green: { outer: "bg-[#15803d] text-white", inner: "border-white/60" },
  blue: { outer: "bg-[#1d4ed8] text-white", inner: "border-white/60" },
  red: { outer: "bg-[#dc2626] text-white", inner: "border-white/60" },
  yellow: { outer: "bg-[#facc15] text-[#1a1a1a]", inner: "border-black/25" },
  white: { outer: "bg-white text-[#1a1a1a] ring-2 ring-black/10", inner: "border-black/20" },
};

/** Text drawn as a real-world sign. */
export function Sign({ text, color, size = "lg" }: { text: string; color: SignColor; size?: "sm" | "lg" }) {
  const s = SIGN_STYLES[color];
  return (
    <span className={cn("inline-flex rounded-xl p-1.5 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.45)]", s.outer)}>
      <span
        className={cn(
          "rounded-lg border-2 font-black uppercase tracking-[0.12em] whitespace-nowrap",
          s.inner,
          size === "lg" ? (text.length > 7 ? "px-5 py-3 text-2xl sm:text-4xl" : "px-6 py-3 text-3xl sm:text-4xl") : "px-3 py-1.5 text-base sm:text-lg"
        )}
      >
        {text}
      </span>
    </span>
  );
}

function TeachingPill({ children, tone = "pink" }: { children: React.ReactNode; tone?: "pink" | "blue" }) {
  return (
    <span
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-extrabold uppercase tracking-widest",
        tone === "pink" ? "bg-accent-strong/15 text-accent-strong" : "bg-primary/15 text-primary"
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Tip ---------- */

export function TipExercise({ exercise, onChange }: BaseProps & { exercise: Extract<Exercise, { type: "tip" }> }) {
  const sfx = useSfx();
  const t = useT();
  useEffect(() => {
    onChange({ ready: true, correct: true, solution: "" });
    sfx.reveal();
  }, [onChange, sfx]);

  return (
    <div>
      <TeachingPill tone="blue">{t("ex.tip")}</TeachingPill>
      <h1 className="mt-4 text-2xl sm:text-[28px] font-extrabold text-foreground">{exercise.title}</h1>
      <p className="mt-2 text-lg font-bold text-muted-foreground">{exercise.text}</p>
      {exercise.items && (
        <div className="mt-6 space-y-3">
          {exercise.items.map((item, i) => (
            <motion.div
              key={item.big + i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className="duo-card flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4"
            >
              <span className={cn("text-3xl text-foreground", item.font && item.font !== "print" ? fontClass(item.font) : "font-black")}>
                {item.big}
              </span>
              <span className="font-bold text-muted-foreground">{item.small}</span>
              <SoundButton text={item.big} size="sm" className="ml-auto self-center" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- New word ---------- */

export function WordExercise({ exercise, onChange }: BaseProps & { exercise: Extract<Exercise, { type: "word" }> }) {
  const sfx = useSfx();
  const t = useT();
  useAutoSpeech(exercise.word);
  useEffect(() => {
    onChange({ ready: true, correct: true, solution: "" });
    sfx.reveal();
  }, [onChange, sfx]);

  return (
    <div className="flex flex-col items-center text-center">
      <TeachingPill>{t("ex.newWord")}</TeachingPill>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mt-8 w-full max-w-sm flex flex-col items-center"
      >
        {exercise.sign ? (
          <Sign text={exercise.word} color={exercise.sign} />
        ) : (
          <div className="duo-card w-full px-6 py-6">
            <p className={displayClass(exercise.word, exercise.font)}>{exercise.word}</p>
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <SoundButton text={exercise.word} />
          <p className="text-2xl font-extrabold text-primary">“{exercise.reading}”</p>
        </div>
        <p className="mt-3 text-2xl font-extrabold text-foreground">
          {exercise.emoji && <span className="mr-2" aria-hidden="true">{exercise.emoji}</span>}
          {exercise.meaning}
        </p>
      </motion.div>
    </div>
  );
}

/* ---------- New phrase (tap a word to see what it means) ---------- */

export function PhraseExercise({ exercise, onChange }: BaseProps & { exercise: Extract<Exercise, { type: "phrase" }> }) {
  const sfx = useSfx();
  const t = useT();
  useAutoSpeech(exercise.text);
  // Which word's meaning bubble is showing. New words start out explained.
  const [open, setOpen] = useState<number | null>(() => {
    const first = exercise.words.findIndex((w) => w.isNew);
    return first >= 0 ? first : null;
  });
  useEffect(() => {
    onChange({ ready: true, correct: true, solution: "" });
    sfx.reveal();
  }, [onChange, sfx]);

  return (
    <div className="flex flex-col items-center text-center">
      <TeachingPill>{t("ex.newPhrase")}</TeachingPill>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mt-8 w-full duo-card px-4 pt-14 pb-6"
      >
        <p className="flex flex-wrap justify-center gap-x-3 gap-y-10 text-4xl sm:text-5xl font-black text-foreground" aria-label={exercise.text}>
          {exercise.words.map((w, i) => (
            <span key={i} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (open !== i) playSpeech(w.bg);
                  sfx.tap();
                  setOpen(open === i ? null : i);
                }}
                aria-expanded={open === i}
                aria-label={`${w.bg}: ${w.en}`}
                className={cn(
                  "underline decoration-dotted decoration-[3px] underline-offset-[10px] transition-colors",
                  w.isNew ? "text-primary decoration-primary/60" : "decoration-muted-foreground/50 hover:text-primary"
                )}
              >
                {w.bg}
              </button>
              {open === i && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[10rem] text-center leading-tight rounded-xl bg-foreground px-3 py-1.5 text-base font-extrabold text-background shadow-lg"
                >
                  {w.en}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-foreground" aria-hidden="true" />
                </motion.span>
              )}
            </span>
          ))}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <SoundButton text={exercise.text} />
          <p className="text-xl font-extrabold text-primary">“{exercise.reading}”</p>
        </div>
        <p className="mt-2 text-2xl font-extrabold text-foreground">{exercise.meaning}</p>
      </motion.div>

      {/* Word by word */}
      <div className="mt-5 w-full flex flex-wrap justify-center gap-2">
        {exercise.words.map((w, i) => (
          <span
            key={i}
            className={cn(
              "rounded-xl border-2 px-3 py-1.5 text-base font-bold",
              w.isNew ? "border-primary/50 bg-primary/10 text-foreground" : "border-border text-muted-foreground"
            )}
          >
            <span className="font-black">{w.bg.replace(/[.,!?]+$/, "")}</span> = {w.en}
            {w.isNew && <span className="ml-2 text-[10px] font-extrabold uppercase tracking-wider text-primary">{t("ex.newBadge")}</span>}
          </span>
        ))}
      </div>
      {exercise.note && <p className="mt-4 text-lg font-bold text-muted-foreground">{exercise.note}</p>}
      {exercise.repeat && <SayItThreeTimes key={exercise.text} />}
    </div>
  );
}

/** "Say it out loud" with three taps, one after each time the learner says it. */
function SayItThreeTimes() {
  const [said, setSaid] = useState(0);
  const sfx = useSfx();
  const t = useT();
  const say = () => {
    if (said >= 3) return;
    const next = said + 1;
    setSaid(next);
    if (next === 3) sfx.correct(3);
    else sfx.tap();
  };
  return (
    <div className="mt-6 w-full rounded-2xl border-2 border-dashed border-warning/60 bg-warning/10 px-4 py-4">
      <p className="font-extrabold text-foreground">
        {said >= 3 ? t("ex.sayDone") : t("ex.sayTitle")}
      </p>
      <p className="text-sm font-bold text-muted-foreground">
        {said >= 3 ? t("ex.sayKeepGoing") : t("ex.sayHint")}
      </p>
      <div className="mt-3 flex justify-center gap-3">
        {[0, 1, 2].map((i) => (
          <motion.button
            key={i}
            type="button"
            onClick={say}
            disabled={said >= 3}
            animate={{ scale: i < said ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.25 }}
            aria-label={i < said ? t("ex.saidAria", { n: i + 1 }) : t("ex.iSaidIt")}
            className={cn(
              "w-12 h-12 rounded-full border-2 text-xl font-black flex items-center justify-center transition-colors",
              i < said
                ? "border-warning bg-warning text-warning-foreground shadow-[0_3px_0_0_hsl(var(--warning-dark))]"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {i < said ? "✓" : i + 1}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Fill the gap ---------- */

export function FillExercise({
  exercise,
  checked,
  onChange,
}: BaseProps & { exercise: Extract<Exercise, { type: "fill" }> }) {
  const [selected, setSelected] = useState<string | null>(null);
  const sfx = useSfx();
  const t = useT();
  const [before, after = ""] = exercise.sentence.split("___");
  // Punctuation right after the gap sticks to it ("съм," not "съм ,").
  const stuck = /^[.,!?]+/.exec(after)?.[0] ?? "";

  const choose = (word: string) => {
    if (checked) return;
    if (word !== selected) sfx.tap();
    setSelected(word);
    onChange({ ready: true, correct: word === exercise.answer, solution: `${before}${exercise.answer}${after}` });
  };

  // Number keys pick an option, like the other choices.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= exercise.options.length) choose(exercise.options[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const stateFor = (word: string): TileState => {
    if (checked && word === exercise.answer) return "correct";
    if (checked && word === selected) return "wrong";
    return word === selected ? "selected" : "idle";
  };

  return (
    <div>
      <Prompt>{t("ex.fillBlank")}</Prompt>
      <div className="mt-8 duo-card px-5 py-6 text-center">
        <p className="text-3xl sm:text-4xl font-black text-foreground leading-relaxed">
          {before}
          <span className="whitespace-nowrap">
            <span
              className={cn(
                "inline-block min-w-[3.5em] mx-1 border-b-4 px-1 align-baseline",
                stuck && "mr-0",
                selected ? "border-primary text-primary" : "border-muted-foreground/40 text-transparent"
              )}
            >
              {selected ?? "…"}
            </span>
            {stuck}
          </span>
          {after.slice(stuck.length)}
        </p>
        <p className="mt-3 text-lg font-bold text-muted-foreground">{exercise.meaning}</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {exercise.options.map((word, i) => (
          <button
            key={word}
            type="button"
            disabled={checked}
            aria-pressed={selected === word}
            aria-label={`${i + 1}: ${word}`}
            onClick={() => choose(word)}
            className={cn(tileClass(stateFor(word)), "h-14 px-5 text-2xl")}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Same letter, new look ---------- */

export function ShapeExercise({ exercise, onChange }: BaseProps & { exercise: Extract<Exercise, { type: "shape" }> }) {
  const sfx = useSfx();
  const t = useT();
  useEffect(() => {
    onChange({ ready: true, correct: true, solution: "" });
    sfx.reveal();
  }, [onChange, sfx]);

  const styleName = exercise.font === "italic" ? t("ex.inItalics") : t("ex.handwritten");
  const lead = exercise.font === "italic" ? t("ex.inItalics") : t("ex.whenHandwritten");

  return (
    <div className="flex flex-col items-center text-center">
      <TeachingPill>{t("ex.sameLetter")}</TeachingPill>
      <div className="mt-8 flex items-center gap-4">
        <div className="duo-card w-32 sm:w-36 py-5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">{t("ex.print")}</p>
          <p className="mt-1 text-7xl font-black text-foreground">{exercise.letter}</p>
        </div>
        <span className="text-3xl font-black text-muted-foreground" aria-hidden="true">→</span>
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -4 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 16 }}
          className="duo-card w-32 sm:w-36 py-5 border-primary/60 shadow-[0_4px_0_0_hsl(var(--primary)/0.6)]"
        >
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">{styleName}</p>
          <p className={cn("mt-1 text-7xl text-foreground", fontClass(exercise.font))}>{exercise.letter}</p>
        </motion.div>
      </div>
      <p className="mt-6 text-xl font-extrabold text-foreground">
        {lead}, {exercise.letter} looks like {exercise.looksLike}.
      </p>
      {exercise.note && <p className="mt-1 text-lg font-bold text-muted-foreground">{exercise.note}</p>}
    </div>
  );
}

/* ---------- Letters you already know ---------- */

export function FamiliarExercise({
  exercise,
  onChange,
}: BaseProps & { exercise: Extract<Exercise, { type: "familiar" }> }) {
  const sfx = useSfx();
  const t = useT();

  useEffect(() => {
    onChange({ ready: true, correct: true, solution: "" });
    sfx.reveal();
  }, [onChange, sfx]);

  return (
    <div>
      <span className="rounded-full bg-primary/15 px-4 py-1.5 text-sm font-extrabold uppercase tracking-widest text-primary">
        {t("ex.goodNews")}
      </span>
      <h1 className="mt-4 text-2xl sm:text-[28px] font-extrabold text-foreground">{exercise.title}</h1>
      <p className="mt-2 font-bold text-muted-foreground">{exercise.note}</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {exercise.letters.map((l, i) => (
          <motion.div
            key={l.upper}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={cn(
              "duo-card flex items-center gap-4 p-3",
              l.note && "sm:col-span-2 border-primary/60 shadow-[0_4px_0_0_hsl(var(--primary)/0.6)]"
            )}
          >
            <span className="w-16 shrink-0 text-center text-3xl font-black text-foreground">
              {l.upper}
              <span className="ml-1 text-muted-foreground/70">{l.lower}</span>
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-foreground">{l.sound}</span>
              {l.note && <span className="block text-sm font-extrabold text-primary">{l.note}</span>}
            </span>
            <SoundButton text={l.upper} size="sm" className="ml-auto shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------- New letter ---------- */

export function IntroExercise({
  exercise,
  onChange,
}: BaseProps & { exercise: Extract<Exercise, { type: "intro" }> }) {
  const sfx = useSfx();
  const t = useT();
  useAutoSpeech(exercise.letter);

  useEffect(() => {
    onChange({ ready: true, correct: true, solution: "" });
    sfx.reveal();
  }, [onChange, sfx]);

  return (
    <div className="flex flex-col items-center text-center">
      <span className="rounded-full bg-accent-strong/15 px-4 py-1.5 text-sm font-extrabold uppercase tracking-widest text-accent-strong">
        {t("ex.newLetter")}
      </span>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="duo-card relative mt-8 w-full max-w-xs px-6 py-8"
      >
        {exercise.looksLike && (
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 8 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 14 }}
            className="absolute -top-4 -right-3 rounded-xl bg-error px-3 py-1.5 text-sm font-extrabold text-error-foreground shadow-[0_3px_0_0_hsl(var(--error-dark))]"
          >
            {t("ex.notLike", { x: exercise.looksLike })}
          </motion.span>
        )}
        <p className="text-[96px] leading-none font-black text-foreground">
          {exercise.letter}
          <span className="ml-3 text-muted-foreground/60">{exercise.lower}</span>
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <SoundButton text={exercise.letter} />
          <p className="text-2xl font-extrabold text-primary">{t("ex.soundsLike", { sound: exercise.sound })}</p>
        </div>
      </motion.div>
      {exercise.looksLike && (
        <p className="mt-6 text-lg font-extrabold text-foreground">
          {t("ex.looksLikeBut", { name: exercise.looksLikeName ?? t("ex.anEnglish", { x: exercise.looksLike }) })}
        </p>
      )}
      <p className={cn("text-lg font-bold text-muted-foreground", exercise.looksLike ? "mt-1" : "mt-6")}>{exercise.hint}</p>
    </div>
  );
}

/* ---------- Multiple choice ---------- */

export function ChoiceExercise({
  exercise,
  checked,
  onChange,
}: BaseProps & { exercise: Extract<Exercise, { type: "choice" }> }) {
  const [selected, setSelected] = useState<string | null>(null);
  const letters = exercise.optionStyle === "letters";
  const signs = exercise.optionStyle === "signs";
  const sfx = useSfx();
  const t = useT();

  const choose = (label: string) => {
    if (checked) return;
    if (label !== selected) sfx.tap();
    setSelected(label);
    onChange({ ready: true, correct: label === exercise.answer, solution: exercise.answer });
  };

  // Number keys pick an option, like Duolingo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= exercise.options.length) choose(exercise.options[n - 1].label);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const stateFor = (label: string): TileState => {
    if (checked && label === exercise.answer) return "correct";
    if (checked && label === selected) return "wrong";
    return label === selected ? "selected" : "idle";
  };

  return (
    <div>
      <Prompt>{exercise.prompt}</Prompt>

      {exercise.display && (
        <div className="mt-8 flex items-center justify-center gap-4 text-center">
          {exercise.displaySign ? (
            <Sign text={exercise.display} color={exercise.displaySign} />
          ) : (
            // Long words shrink so they fit on a phone.
            <p className={displayClass(exercise.display, exercise.displayFont)}>{exercise.display}</p>
          )}
        </div>
      )}

      <div
        className={cn(
          "mt-8 grid gap-3",
          letters && (exercise.options.length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"),
          signs && "grid-cols-1 sm:grid-cols-3",
          !letters && !signs && "grid-cols-1"
        )}
      >
        {exercise.options.map((option, i) => (
          <button
            key={option.label}
            type="button"
            disabled={checked}
            aria-pressed={selected === option.label}
            onClick={() => choose(option.label)}
            className={cn(
              tileClass(stateFor(option.label)),
              letters && "h-28 text-5xl flex flex-col items-center justify-center gap-2",
              signs && "h-20 sm:h-24 px-3 flex items-center justify-center",
              !letters && !signs && "h-16 px-4 text-xl flex items-center gap-4"
            )}
          >
            {!letters && !signs && (
              <span className="w-8 h-8 shrink-0 rounded-lg border-2 border-current text-sm flex items-center justify-center opacity-60">
                {i + 1}
              </span>
            )}
            {signs ? (
              <Sign text={option.label} color={option.sign ?? "white"} size="sm" />
            ) : (
              <span className={fontClass(exercise.optionFont)}>{option.label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Match pairs ---------- */

export function MatchExercise({
  exercise,
  onComplete,
  onChange,
}: BaseProps & { exercise: Extract<Exercise, { type: "match" }> }) {
  const left = useMemo(() => shuffle(exercise.pairs.map((p) => p.left)), [exercise]);
  const right = useMemo(() => shuffle(exercise.pairs.map((p) => p.right)), [exercise]);
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [pickedRight, setPickedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [flash, setFlash] = useState<{ left: string; right: string; ok: boolean } | null>(null);
  const sfx = useSfx();
  const t = useT();
  const reported = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const partnerOf = (l: string) => exercise.pairs.find((p) => p.left === l)?.right;
  const pickLeft = (l: string) => {
    if (!pickedRight) sfx.tap();
    setPickedLeft(l);
  };
  const pickRight = (r: string) => {
    if (!pickedLeft) sfx.tap();
    setPickedRight(r);
  };

  useEffect(() => {
    onChange({ ready: false, correct: true, solution: "" });
  }, [onChange]);

  useEffect(() => {
    if (!pickedLeft || !pickedRight) return;
    const ok = partnerOf(pickedLeft) === pickedRight;
    if (ok) {
      sfx.match(matched.length);
      if (!playSpeech(pickedLeft)) playSpeech(pickedRight);
    }
    else sfx.miss();
    setFlash({ left: pickedLeft, right: pickedRight, ok });
    const t = setTimeout(() => {
      if (ok) setMatched((m) => [...m, pickedLeft]);
      setFlash(null);
      setPickedLeft(null);
      setPickedRight(null);
    }, ok ? 250 : 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedLeft, pickedRight]);

  useEffect(() => {
    // Report completion exactly once, even if the parent passes a new callback.
    if (matched.length === exercise.pairs.length && !reported.current) {
      reported.current = true;
      const t = setTimeout(() => onCompleteRef.current(), 300);
      return () => clearTimeout(t);
    }
  }, [matched, exercise.pairs.length]);

  const leftState = (l: string): TileState => {
    if (matched.includes(l)) return "done";
    if (flash?.left === l) return flash.ok ? "correct" : "wrong";
    return pickedLeft === l ? "selected" : "idle";
  };
  const rightState = (r: string): TileState => {
    if (matched.some((l) => partnerOf(l) === r)) return "done";
    if (flash?.right === r) return flash.ok ? "correct" : "wrong";
    return pickedRight === r ? "selected" : "idle";
  };

  return (
    <div>
      <Prompt>{exercise.prompt}</Prompt>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="space-y-3">
          {left.map((l) => (
            <button
              key={l}
              type="button"
              disabled={leftState(l) === "done" || !!flash}
              onClick={() => pickLeft(l)}
              className={cn(
                tileClass(leftState(l)),
                "w-full h-16",
                exercise.leftFont && exercise.leftFont !== "print" ? cn(fontClass(exercise.leftFont), "text-3xl") : "text-2xl"
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {right.map((r) => (
            <button
              key={r}
              type="button"
              disabled={rightState(r) === "done" || !!flash}
              onClick={() => pickRight(r)}
              className={cn(tileClass(rightState(r)), "w-full h-16 text-xl")}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Build a word from tiles ---------- */

export function BuildExercise({
  exercise,
  checked,
  onChange,
}: BaseProps & { exercise: Extract<Exercise, { type: "build" }> }) {
  // Indexes into exercise.tiles, in the order they were placed.
  const [placed, setPlaced] = useState<number[]>([]);
  // Letter tiles are square; word tiles are as wide as their word.
  const tileSize = exercise.words ? "h-14 px-4 text-xl" : "w-14 h-16 text-3xl";
  const sfx = useSfx();
  const t = useT();

  useEffect(() => {
    const sep = exercise.words ? " " : "";
    const built = placed.map((i) => exercise.tiles[i]).join(sep);
    onChange({
      ready: placed.length > 0,
      correct: built === exercise.answer.join(sep),
      solution: exercise.answer.join(sep),
    });
  }, [placed, exercise, onChange]);

  const add = (i: number) => {
    if (checked) return;
    sfx.tap();
    setPlaced((p) => [...p, i]);
  };
  const remove = (i: number) => {
    if (checked) return;
    sfx.untap();
    setPlaced((p) => p.filter((x) => x !== i));
  };

  return (
    <div>
      <Prompt>{exercise.prompt}</Prompt>

      <div className="mt-6 flex items-center gap-3">
        <p
          className={cn(
            "rounded-2xl border-2 border-border px-4 py-2 text-foreground",
            exercise.targetFont && exercise.targetFont !== "print"
              ? cn(fontClass(exercise.targetFont), "text-4xl px-5")
              : "text-lg font-bold"
          )}
        >
          {exercise.target}
        </p>
      </div>

      {/* Answer line */}
      <div className="mt-8 min-h-[84px] border-b-2 border-border pb-3 flex flex-wrap items-end gap-2">
        {placed.map((i) => (
          <motion.button
            key={i}
            layout
            type="button"
            onClick={() => remove(i)}
            disabled={checked}
            className={cn(tileClass("idle"), tileSize)}
          >
            {exercise.tiles[i]}
          </motion.button>
        ))}
      </div>

      {/* Tile bank */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {exercise.tiles.map((tile, i) => {
          const used = placed.includes(i);
          return used ? (
            <span key={i} className={cn(tileSize, "inline-flex items-center rounded-2xl bg-muted border-2 border-transparent font-extrabold text-transparent select-none")} aria-hidden="true">
              {exercise.words ? tile : ""}
            </span>
          ) : (
            <motion.button
              key={i}
              layout
              type="button"
              onClick={() => add(i)}
              disabled={checked}
              className={cn(tileClass("idle"), tileSize)}
            >
              {tile}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
