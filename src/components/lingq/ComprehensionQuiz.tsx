import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, X, ChevronRight, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

interface ComprehensionQuizProps {
  questions: Question[];
  onComplete: (score: number, total: number) => void;
  storyTitle: string;
}

export const ComprehensionQuiz = ({
  questions,
  onComplete,
  storyTitle,
}: ComprehensionQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question?.correctIndex;
  const isLastQuestion = currentQuestion >= questions.length - 1;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === question.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  const handleFinish = () => {
    onComplete(score, questions.length);
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPerfect = score === questions.length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Card className="p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">
            {isPerfect ? "🏆" : percentage >= 50 ? "🎉" : "📚"}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isPerfect ? "Perfect Score!" : percentage >= 50 ? "Good Job!" : "Keep Learning!"}
          </h2>
          <p className="text-muted-foreground mb-4">
            You got {score} out of {questions.length} questions correct
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  "h-full rounded-full",
                  isPerfect ? "bg-green-500" : percentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                )}
              />
            </div>
            <span className="font-bold text-lg">{percentage}%</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary mb-6">
            <Trophy className="w-6 h-6" />
            +{score * 5} XP Bonus
          </div>

          <Button onClick={handleFinish} className="w-full" size="lg">
            Continue
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Comprehension Quiz: {storyTitle}</span>
          <span>Question {currentQuestion + 1} of {questions.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectOption = idx === question.correctIndex;
                
                let optionClass = "border-2 hover:border-primary/50";
                if (isAnswered) {
                  if (isCorrectOption) {
                    optionClass = "border-2 border-green-500 bg-green-500/10";
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = "border-2 border-red-500 bg-red-500/10";
                  }
                } else if (isSelected) {
                  optionClass = "border-2 border-primary bg-primary/10";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all flex items-center gap-3",
                      optionClass,
                      !isAnswered && "cursor-pointer hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold",
                      isAnswered && isCorrectOption && "bg-green-500 text-white",
                      isAnswered && isSelected && !isCorrectOption && "bg-red-500 text-white",
                      !isAnswered && "bg-muted"
                    )}>
                      {isAnswered && isCorrectOption ? (
                        <Check className="w-4 h-4" />
                      ) : isAnswered && isSelected && !isCorrectOption ? (
                        <X className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className={cn(
                  "p-4 rounded-lg mb-4",
                  isCorrect ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
                )}>
                  <div className="font-semibold flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <Check className="w-5 h-5" />
                        Correct!
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" />
                        Incorrect - The answer was: {question.options[question.correctIndex]}
                      </>
                    )}
                  </div>
                </div>

                <Button onClick={handleNext} className="w-full" size="lg">
                  {isLastQuestion ? "See Results" : "Next Question"}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
