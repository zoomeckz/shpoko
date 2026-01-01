import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MultipleChoiceQuestionProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswer: (isCorrect: boolean, answer: string) => void;
  audioText?: string;
  questionImage?: string;
}

export function MultipleChoiceQuestion({
  question,
  options,
  correctAnswer,
  onAnswer,
  audioText,
}: MultipleChoiceQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

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

  const getOptionStyles = (option: string) => {
    if (!hasChecked) {
      return option === selectedAnswer 
        ? "border-primary bg-primary/10 ring-2 ring-primary"
        : "border-border hover:border-muted-foreground";
    }
    
    if (option === correctAnswer) {
      return "border-success bg-success/10 text-success";
    }
    
    if (option === selectedAnswer && option !== correctAnswer) {
      return "border-error bg-error/10 text-error animate-shake";
    }
    
    return "border-border opacity-50";
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="space-y-4">
        {audioText && (
          <button className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors">
            <Volume2 className="w-6 h-6" />
            <span className="text-sm font-semibold">Play audio</span>
          </button>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {question}
        </h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, index) => (
          <motion.button
            key={option}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(option)}
            disabled={hasChecked}
            className={cn(
              "p-4 rounded-xl border-2 text-left font-semibold transition-all duration-200",
              "shadow-[0_2px_0_0_hsl(var(--border))] active:translate-y-0.5 active:shadow-none",
              getOptionStyles(option)
            )}
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-muted-foreground text-sm font-bold mr-3">
              {index + 1}
            </span>
            {option}
          </motion.button>
        ))}
      </div>

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
