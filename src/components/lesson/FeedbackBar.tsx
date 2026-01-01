import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface FeedbackBarProps {
  isCorrect: boolean;
  correctAnswer?: string;
  onContinue: () => void;
}

export function FeedbackBar({ isCorrect, correctAnswer, onContinue }: FeedbackBarProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", bounce: 0.3 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 p-4 border-t-2",
        isCorrect 
          ? "bg-success/10 border-success" 
          : "bg-error/10 border-error"
      )}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
            isCorrect ? "bg-success" : "bg-error"
          )}>
            {isCorrect ? "✓" : "✗"}
          </div>
          <div>
            <p className={cn(
              "font-bold text-lg",
              isCorrect ? "text-success" : "text-error"
            )}>
              {isCorrect ? "Great!" : "Oops!"}
            </p>
            {!isCorrect && correctAnswer && (
              <p className="text-sm text-error">
                Correct answer: <strong>{correctAnswer}</strong>
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={onContinue}
          className={cn(
            "px-8 py-6 text-lg font-bold rounded-2xl transition-all",
            "shadow-[0_4px_0_0] active:translate-y-1 active:shadow-none",
            isCorrect 
              ? "bg-success hover:bg-success/90 text-success-foreground shadow-success-dark" 
              : "bg-error hover:bg-error/90 text-error-foreground shadow-[0_4px_0_0_hsl(4,90%,48%)]"
          )}
        >
          CONTINUE
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
}
