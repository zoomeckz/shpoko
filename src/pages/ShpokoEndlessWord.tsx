import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Zap, Trophy, Heart, Pencil, MousePointerClick, RefreshCw, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { emojiWords, wordsByLength, EmojiWord } from "@/data/emojiWords";

type Mode = "choice" | "type";
type LengthFilter = 4 | 5 | 6 | 7 | 8;
type Phase = "setup" | "playing" | "gameover";

const LENGTHS: LengthFilter[] = [4, 5, 6, 7, 8];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(pool: EmojiWord[], correct: EmojiWord, count: number): EmojiWord[] {
  const others = pool.filter((w) => w.bg !== correct.bg);
  return shuffle(others).slice(0, count);
}

// Lenient check: ignore case + spaces, allow either Cyrillic or Latin transliteration.
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

const ShpokoEndlessWord = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>("choice");
  const [selectedLengths, setSelectedLengths] = useState<Set<LengthFilter>>(new Set([4]));

  const [current, setCurrent] = useState<EmojiWord | null>(null);
  const [options, setOptions] = useState<EmojiWord[]>([]);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);

  const inputRef = useRef<HTMLInputElement>(null);

  // Build the active pool whenever filters change.
  const pool = useMemo<EmojiWord[]>(() => {
    if (selectedLengths.size === 0) return [];
    const lens = [...selectedLengths];
    return lens.flatMap((n) => wordsByLength(n));
  }, [selectedLengths]);

  // Pick the next word + (in choice mode) 3 distractors.
  const nextRound = (currentPool = pool) => {
    if (currentPool.length === 0) return;
    const correct = currentPool[Math.floor(Math.random() * currentPool.length)];
    setCurrent(correct);
    setTyped("");
    setFeedback("idle");
    if (mode === "choice") {
      const distractors = pickDistractors(emojiWords, correct, 3);
      setOptions(shuffle([correct, ...distractors]));
    } else {
      setOptions([]);
      // focus input shortly after render
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const startGame = () => {
    if (selectedLengths.size === 0) {
      toast({ title: "Pick at least one length", variant: "destructive" });
      return;
    }
    if (pool.length < 4 && mode === "choice") {
      toast({ title: "Not enough words for choice mode at that length", variant: "destructive" });
      return;
    }
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(3);
    setPhase("playing");
    nextRound(pool);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 10 + streak * 2);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setTimeout(() => nextRound(), 600);
    } else {
      setFeedback("wrong");
      setStreak(0);
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          setTimeout(() => setPhase("gameover"), 900);
        } else {
          setTimeout(() => nextRound(), 1100);
        }
        return next;
      });
    }
  };

  const onChoiceClick = (w: EmojiWord) => {
    if (feedback !== "idle" || !current) return;
    handleAnswer(w.bg === current.bg);
  };

  const onTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== "idle" || !current) return;
    const guess = normalize(typed);
    if (!guess) return;
    const ok = guess === normalize(current.bg) || guess === normalize(current.romanized);
    handleAnswer(ok);
  };

  const toggleLength = (n: LengthFilter) => {
    setSelectedLengths((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  // Re-focus input after each new round in type mode
  useEffect(() => {
    if (phase === "playing" && mode === "type" && feedback === "idle") {
      inputRef.current?.focus();
    }
  }, [current, phase, mode, feedback]);

  // ===== SETUP =====
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card className="p-6 space-y-6">
            <header className="text-center space-y-1">
              <div className="text-4xl">🔤</div>
              <h1 className="text-2xl font-extrabold">Endless Words</h1>
              <p className="text-sm text-muted-foreground">
                Match the romanized word to the right emoji — endlessly.
              </p>
            </header>

            {/* Mode */}
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Answer mode
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("choice")}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left transition-all",
                    mode === "choice"
                      ? "border-primary bg-primary/10 shadow-[0_2px_0_0_hsl(var(--primary-dark))]"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <MousePointerClick className="h-4 w-4" />
                    Choose
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Pick from 4 emojis.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("type")}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left transition-all",
                    mode === "type"
                      ? "border-primary bg-primary/10 shadow-[0_2px_0_0_hsl(var(--primary-dark))]"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <Pencil className="h-4 w-4" />
                    Type
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Type the answer yourself.</p>
                </button>
              </div>
            </section>

            {/* Length */}
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Word length (Cyrillic letters)
              </h2>
              <div className="flex flex-wrap gap-2">
                {LENGTHS.map((n) => {
                  const active = selectedLengths.has(n);
                  const count = wordsByLength(n).length;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleLength(n)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:bg-accent"
                      )}
                      aria-pressed={active}
                    >
                      <span>{n}</span>
                      <span className={cn("text-[10px]", active ? "opacity-80" : "text-muted-foreground")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Pick one or more lengths to mix together.
              </p>
            </section>

            <Button onClick={startGame} className="w-full" size="lg">
              <Zap className="mr-2 h-4 w-4" />
              Start endless run
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // ===== GAME OVER =====
  if (phase === "gameover") {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-md">
          <Card className="p-6 text-center space-y-4">
            <Trophy className="h-12 w-12 mx-auto text-warning" />
            <h2 className="text-2xl font-extrabold">Run over!</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted p-3">
                <div className="text-xs text-muted-foreground">Score</div>
                <div className="text-2xl font-extrabold">{score}</div>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <div className="text-xs text-muted-foreground">Best streak</div>
                <div className="text-2xl font-extrabold">{bestStreak}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPhase("setup")}>
                Change settings
              </Button>
              <Button className="flex-1" onClick={startGame}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Play again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ===== PLAYING =====
  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        {/* HUD */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setPhase("setup")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quit
          </Button>
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-primary" />
              {score}
            </span>
            <span className="flex items-center gap-1">
              🔥 {streak}
            </span>
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < lives ? "text-error fill-error" : "text-muted-foreground/40"
                  )}
                />
              ))}
            </span>
          </div>
        </div>

        {/* Word card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.bg}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "p-8 text-center space-y-1 transition-colors",
                feedback === "correct" && "border-success bg-success/10",
                feedback === "wrong" && "border-error bg-error/10"
              )}
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Romanized
              </div>
              <div className="text-4xl font-extrabold tracking-wide">
                {current?.romanized}
              </div>
              <div className="text-xs text-muted-foreground">
                {current ? [...current.bg].length : 0} letters
              </div>

              {/* Reveal Cyrillic on feedback */}
              {feedback !== "idle" && current && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-2 text-sm"
                >
                  <span className="font-bold">{current.bg}</span>{" "}
                  <span className="text-muted-foreground">— {current.english}</span>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Answer area */}
        {mode === "choice" ? (
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => {
              const isCorrect = current && opt.bg === current.bg;
              const showCorrect = feedback !== "idle" && isCorrect;
              const showWrong = feedback === "wrong" && !isCorrect && false;
              return (
                <button
                  key={opt.bg}
                  onClick={() => onChoiceClick(opt)}
                  disabled={feedback !== "idle"}
                  className={cn(
                    "aspect-square rounded-2xl border-2 bg-card flex items-center justify-center text-5xl transition-all",
                    "hover:bg-accent active:scale-95 disabled:cursor-not-allowed",
                    showCorrect && "border-success bg-success/15",
                    showWrong && "border-error bg-error/15",
                    !showCorrect && !showWrong && "border-border"
                  )}
                  aria-label={opt.english}
                >
                  {opt.emoji}
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={onTypeSubmit} className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {/* Render emoji hint as the prompt — since the user is TYPING the answer
                  given the romanized word, we also show a single emoji to confirm meaning.
                  But the actual challenge is: read romanized → type Cyrillic OR romanized. */}
              <div className="col-span-4 aspect-[2/1] rounded-2xl border-2 border-border bg-card flex items-center justify-center text-6xl">
                {current?.emoji}
              </div>
            </div>
            <Input
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type the word (Cyrillic or romanized)"
              disabled={feedback !== "idle"}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="text-center text-lg"
            />
            <Button type="submit" className="w-full" disabled={feedback !== "idle" || !typed.trim()}>
              {feedback === "correct" ? (
                <><Check className="mr-2 h-4 w-4" /> Correct!</>
              ) : feedback === "wrong" ? (
                <><X className="mr-2 h-4 w-4" /> Wrong</>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ShpokoEndlessWord;
