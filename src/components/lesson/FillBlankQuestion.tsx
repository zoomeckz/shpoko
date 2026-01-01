import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FillBlankQuestionProps {
  sentence: string; // Use ___ for blank
  options: string[];
  correctAnswer: string;
  onAnswer: (isCorrect: boolean, answer: string) => void;
}

export function FillBlankQuestion({
  sentence,
  options,
  correctAnswer,
  onAnswer,
}: FillBlankQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const parts = sentence.split("___");

  const handleSelect = (option: string) => {
    if (hasChecked) return;
    setSelectedAnswer(option);
  };

  const handleCheck = () => {
    if (!selectedAnswer || hasChecked) return;
    setHasChecked(true);
    const isCorrect = selectedAnswer === correctAnswer;
    onAnswer(isCorrect, selectedAnswer);
  };

  const isCorrect = hasChecked && selectedAnswer === correctAnswer;
  const isWrong = hasChecked && selectedAnswer !== correctAnswer;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Fill in the blank
        </p>
      </div>

      {/* Sentence with blank */}
      <div className="text-xl sm:text-2xl font-bold text-foreground leading-relaxed">
        {parts[0]}
        <span
          className={cn(
            "inline-block min-w-[80px] mx-2 px-3 py-1 rounded-lg border-2 border-dashed text-center",
            !selectedAnswer && "border-muted-foreground text-muted-foreground",
            selectedAnswer && !hasChecked && "border-primary bg-primary/10 text-primary",
            isCorrect && "border-success bg-success/10 text-success",
            isWrong && "border-error bg-error/10 text-error animate-shake"
          )}
        >
          {selectedAnswer || "___"}
        </span>
        {parts[1]}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-3">
        {options.map((option, index) => (
          <motion.button
            key={option}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelect(option)}
            disabled={hasChecked}
            className={cn(
              "px-5 py-3 rounded-xl border-2 font-semibold transition-all",
              "shadow-[0_2px_0_0_hsl(var(--border))] active:translate-y-0.5 active:shadow-none",
              !hasChecked && option === selectedAnswer && "border-primary bg-primary/10",
              !hasChecked && option !== selectedAnswer && "border-border hover:border-muted-foreground",
              hasChecked && option === correctAnswer && "border-success bg-success/10 text-success",
              hasChecked && option === selectedAnswer && option !== correctAnswer && "border-error bg-error/10 text-error"
            )}
          >
            {option}
          </motion.button>
        ))}
      </div>

      {/* Feedback */}
      {hasChecked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl",
            isCorrect ? "bg-success/10" : "bg-error/10"
          )}
        >
          <p className={cn("font-bold", isCorrect ? "text-success" : "text-error")}>
            {isCorrect ? "Correct! 🎉" : `Oops! The answer was "${correctAnswer}"`}
          </p>
        </motion.div>
      )}

      {/* Check button */}
      {!hasChecked && (
        <Button
          onClick={handleCheck}
          disabled={!selectedAnswer}
          className={cn(
            "w-full py-6 text-lg font-bold rounded-2xl transition-all",
            selectedAnswer
              ? "bg-primary hover:bg-primary-light shadow-[0_4px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          CHECK
        </Button>
      )}
    </div>
  );
}
