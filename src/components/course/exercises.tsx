import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/data/course";
import { useSfx } from "@/hooks/useSfx";
import { SoundButton } from "./SoundButton";

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

/* ---------- Letters you already know ---------- */

export function FamiliarExercise({
  exercise,
  onChange,
}: BaseProps & { exercise: Extract<Exercise, { type: "familiar" }> }) {
  const sfx = useSfx();

  useEffect(() => {
    onChange({ ready: true, correct: true, solution: "" });
    sfx.reveal();
  }, [onChange, sfx]);

  return (
    <div>
      <span className="rounded-full bg-primary/15 px-4 py-1.5 text-sm font-extrabold uppercase tracking-widest text-primary">
        Good news
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
            <SoundButton src={l.audio} size="sm" className="ml-auto shrink-0" />
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

  useEffect(() => {
    onChange({ ready: true, correct: true, solution: "" });
    sfx.reveal();
  }, [onChange, sfx]);

  return (
    <div className="flex flex-col items-center text-center">
      <span className="rounded-full bg-accent-strong/15 px-4 py-1.5 text-sm font-extrabold uppercase tracking-widest text-accent-strong">
        New letter
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
            Not “{exercise.looksLike}”!
          </motion.span>
        )}
        <p className="text-[96px] leading-none font-black text-foreground">
          {exercise.letter}
          <span className="ml-3 text-muted-foreground/60">{exercise.lower}</span>
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <SoundButton src={exercise.audio} />
          <p className="text-2xl font-extrabold text-primary">sounds like “{exercise.sound}”</p>
        </div>
      </motion.div>
      {exercise.looksLike && (
        <p className="mt-6 text-lg font-extrabold text-foreground">
          Looks like an English {exercise.looksLike}, but it isn't one.
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
  const sfx = useSfx();

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
        <div className="mt-8 flex items-center justify-center gap-4">
          <SoundButton src={exercise.displayAudio} />
          <p className="text-6xl sm:text-7xl font-black tracking-wide text-foreground">{exercise.display}</p>
        </div>
      )}

      <div
        className={cn(
          "mt-8 grid gap-3",
          letters ? (exercise.options.length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3") : "grid-cols-1"
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
              letters ? "h-28 text-5xl flex flex-col items-center justify-center gap-2" : "h-16 px-4 text-xl flex items-center gap-4"
            )}
          >
            {!letters && (
              <span className="w-8 h-8 shrink-0 rounded-lg border-2 border-current text-sm flex items-center justify-center opacity-60">
                {i + 1}
              </span>
            )}
            <span>{option.label}</span>
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
    if (ok) sfx.match(matched.length);
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
    if (matched.length === exercise.pairs.length) {
      const t = setTimeout(onComplete, 300);
      return () => clearTimeout(t);
    }
  }, [matched, exercise.pairs.length, onComplete]);

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
              className={cn(tileClass(leftState(l)), "w-full h-16 text-2xl")}
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
  const sfx = useSfx();

  useEffect(() => {
    const built = placed.map((i) => exercise.tiles[i]).join("");
    onChange({
      ready: placed.length > 0,
      correct: built === exercise.answer.join(""),
      solution: exercise.answer.join(""),
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
        <SoundButton src={exercise.audio} size="sm" />
        <p className="rounded-2xl border-2 border-border px-4 py-2 text-lg font-bold text-foreground">{exercise.target}</p>
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
            className={cn(tileClass("idle"), "w-14 h-16 text-3xl")}
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
            <span key={i} className="w-14 h-16 rounded-2xl bg-muted border-2 border-transparent" />
          ) : (
            <motion.button
              key={i}
              layout
              type="button"
              onClick={() => add(i)}
              disabled={checked}
              className={cn(tileClass("idle"), "w-14 h-16 text-3xl")}
            >
              {tile}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
