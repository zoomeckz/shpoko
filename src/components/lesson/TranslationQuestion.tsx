import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TranslationQuestionProps {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctAnswers: string[]; // Allow multiple correct answers
  onAnswer: (isCorrect: boolean, answer: string) => void;
}

export function TranslationQuestion({
  sourceText,
  sourceLanguage,
  targetLanguage,
  correctAnswers,
  onAnswer,
}: TranslationQuestionProps) {
  const [answer, setAnswer] = useState("");
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCheck = () => {
    if (!answer.trim() || hasChecked) return;
    setHasChecked(true);
    
    const normalizedAnswer = answer.trim().toLowerCase();
    const correct = correctAnswers.some(
      ca => ca.toLowerCase() === normalizedAnswer
    );
    
    setIsCorrect(correct);
    onAnswer(correct, answer);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && answer.trim() && !hasChecked) {
      handleCheck();
    }
  };

  return (
    <div className="space-y-6">
      {/* Question header */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Translate this sentence
        </p>
        <div className="flex items-start gap-3">
          <button className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
            <Volume2 className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {sourceText}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {sourceLanguage} → {targetLanguage}
            </p>
          </div>
        </div>
      </div>

      {/* Answer input */}
      <div className="relative">
        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={hasChecked}
          placeholder="Type your translation..."
          className={cn(
            "text-lg py-6 px-4 rounded-xl border-2 transition-all",
            hasChecked && isCorrect && "border-success bg-success/5",
            hasChecked && !isCorrect && "border-error bg-error/5 animate-shake"
          )}
        />
        
        {hasChecked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-3 p-3 rounded-xl text-sm font-medium",
              isCorrect ? "bg-success/10 text-success" : "bg-error/10 text-error"
            )}
          >
            {isCorrect ? (
              <span>Great job! 🎉</span>
            ) : (
              <span>
                Correct answer: <strong>{correctAnswers[0]}</strong>
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Check button */}
      {!hasChecked && (
        <Button
          onClick={handleCheck}
          disabled={!answer.trim()}
          className={cn(
            "w-full py-6 text-lg font-bold rounded-2xl transition-all",
            answer.trim()
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
