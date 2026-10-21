import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DuoButton } from "@/components/duolingo/DuoButton";

interface Question {
  prompt: string;
  options: string[];
  answer: string;
  explain: string;
}

const QUESTIONS: Question[] = [
  {
    prompt: "Which letter sounds like “zh” in pleasure?",
    options: ["З", "Ж", "Ш", "Х"],
    answer: "Ж",
    explain: "Ж says “zh”.",
  },
  {
    prompt: "How do you read КАФЕ?",
    options: ["rafe", "kame", "kafe", "kaye"],
    answer: "kafe",
    explain: "КАФЕ is “kafe”: coffee ☕",
  },
  {
    prompt: "Which letter sounds like “sht”?",
    options: ["Ш", "Щ", "Ц", "Ч"],
    answer: "Щ",
    explain: "Щ says “sht”.",
  },
];

type Phase = "choosing" | "checked" | "done";

interface TryItCardProps {
  onStart: () => void;
}

// A tiny playable lesson so visitors feel the format before signing up.
export function TryItCard({ onStart }: TryItCardProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("choosing");
  const [correctCount, setCorrectCount] = useState(0);

  const question = QUESTIONS[index];
  const isCorrect = selected === question.answer;
  const progress = ((index + (phase === "choosing" ? 0 : 1)) / QUESTIONS.length) * 100;

  const check = () => {
    if (!selected) return;
    if (selected === question.answer) setCorrectCount((c) => c + 1);
    setPhase("checked");
  };

  const next = () => {
    if (index === QUESTIONS.length - 1) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setPhase("choosing");
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setPhase("choosing");
  };

  return (
    <div className="duo-card w-full max-w-sm mx-auto overflow-hidden">
      <div className="px-5 pt-5">
        <div className="h-4 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${phase === "done" ? 100 : progress}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
      </div>

      {phase === "done" ? (
        <div className="px-5 pt-8 pb-6 text-center">
          <p className="text-5xl" aria-hidden="true">🎉</p>
          <p className="mt-3 text-xl font-extrabold text-foreground">
            {correctCount} of {QUESTIONS.length} right!
          </p>
          <p className="mt-1 text-muted-foreground font-semibold">
            You're already reading Bulgarian.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <DuoButton size="lg" fullWidth onClick={onStart}>
              Keep going
            </DuoButton>
            <DuoButton variant="ghost" size="sm" onClick={restart}>
              Play again
            </DuoButton>
          </div>
        </div>
      ) : (
        <>
          <div className="px-5 pt-5 pb-5">
            <p className="text-lg font-extrabold text-foreground min-h-[3.5rem]">{question.prompt}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {question.options.map((option) => {
                const isSelected = selected === option;
                const showCorrect = phase === "checked" && option === question.answer;
                const showWrong = phase === "checked" && isSelected && !isCorrect;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={phase === "checked"}
                    aria-pressed={isSelected}
                    onClick={() => setSelected(option)}
                    className={cn(
                      "h-16 rounded-2xl border-2 text-2xl font-extrabold transition-all duration-100",
                      "active:translate-y-1 active:shadow-none disabled:active:translate-y-0",
                      showCorrect
                        ? "border-success bg-success-light text-success shadow-[0_4px_0_0_hsl(var(--success))]"
                        : showWrong
                        ? "border-error bg-error-light text-error shadow-[0_4px_0_0_hsl(var(--error))]"
                        : isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-[0_4px_0_0_hsl(var(--primary))]"
                        : "border-border bg-card text-foreground shadow-[0_4px_0_0_hsl(var(--border))] hover:bg-muted"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              "px-5 py-4 border-t-2 transition-colors",
              phase === "checked"
                ? isCorrect
                  ? "bg-success-light border-transparent"
                  : "bg-error-light border-transparent"
                : "border-border"
            )}
          >
            <AnimatePresence mode="wait">
              {phase === "checked" && (
                <motion.div
                  key={`feedback-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-center gap-3 mb-3 font-extrabold",
                    isCorrect ? "text-success" : "text-error"
                  )}
                  role="status"
                >
                  <span className="w-8 h-8 shrink-0 rounded-full bg-card flex items-center justify-center">
                    {isCorrect ? <Check className="w-5 h-5" strokeWidth={4} /> : <X className="w-5 h-5" strokeWidth={4} />}
                  </span>
                  <span>
                    {isCorrect ? "Nice! " : "Not quite. "}
                    <span className="font-bold">{question.explain}</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {phase === "checked" ? (
              <DuoButton variant={isCorrect ? "success" : "danger"} size="lg" fullWidth onClick={next}>
                Continue
              </DuoButton>
            ) : (
              <DuoButton size="lg" fullWidth disabled={!selected} onClick={check}>
                Check
              </DuoButton>
            )}
          </div>
        </>
      )}
    </div>
  );
}
