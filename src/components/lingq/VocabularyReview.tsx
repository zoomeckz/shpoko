import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, X, Volume2, RotateCcw, Trophy, Brain, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VocabularyWord } from "@/hooks/useLingqVocabulary";

interface VocabularyReviewProps {
  words: VocabularyWord[];
  onComplete: (results: { word: string; correct: boolean }[]) => void;
  onUpdateWord: (word: string, newStatus: number, correct: boolean) => Promise<boolean | void>;
  onPlayAudio?: (word: string) => void;
}

export const VocabularyReview = ({
  words,
  onComplete,
  onUpdateWord,
  onPlayAudio,
}: VocabularyReviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);
  const [reviewComplete, setReviewComplete] = useState(false);

  // Shuffle words for review
  const shuffledWords = useMemo(() => {
    return [...words].sort(() => Math.random() - 0.5);
  }, [words]);

  const currentWord = shuffledWords[currentIndex];
  const progress = ((currentIndex) / shuffledWords.length) * 100;

  // Generate options for multiple choice
  const options = useMemo(() => {
    if (!currentWord) return [];
    
    const correctAnswer = currentWord.translation || "Unknown";
    const otherWords = shuffledWords
      .filter(w => w.id !== currentWord.id && w.translation)
      .map(w => w.translation!)
      .slice(0, 3);
    
    // Pad with placeholder translations if not enough words
    const placeholders = ["house", "water", "friend", "food", "happy", "go"];
    while (otherWords.length < 3) {
      const placeholder = placeholders.find(p => !otherWords.includes(p) && p !== correctAnswer);
      if (placeholder) otherWords.push(placeholder);
      else break;
    }

    const allOptions = [correctAnswer, ...otherWords.slice(0, 3)];
    return allOptions.sort(() => Math.random() - 0.5);
  }, [currentWord, shuffledWords]);

  const handleAnswer = async (selectedAnswer: string) => {
    if (showAnswer) return;
    
    const isCorrect = selectedAnswer === currentWord.translation;
    setShowAnswer(true);
    
    setResults(prev => [...prev, { word: currentWord.word, correct: isCorrect }]);
    
    // Update word status based on SRS
    let newStatus = currentWord.status;
    if (isCorrect) {
      newStatus = Math.min(5, currentWord.status + 1);
    } else {
      newStatus = Math.max(1, currentWord.status - 1);
    }
    
    await onUpdateWord(currentWord.word, newStatus, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex >= shuffledWords.length - 1) {
      setReviewComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePlayAudio = () => {
    if (onPlayAudio && currentWord) {
      onPlayAudio(currentWord.word);
    }
  };

  if (shuffledWords.length === 0) {
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Words to Review</h2>
        <p className="text-muted-foreground mb-4">
          Save some vocabulary words while reading stories to review them later!
        </p>
        <Button onClick={() => onComplete([])} variant="outline">
          Go Back
        </Button>
      </Card>
    );
  }

  if (reviewComplete) {
    const correctCount = results.filter(r => r.correct).length;
    const percentage = Math.round((correctCount / results.length) * 100);
    const isPerfect = correctCount === results.length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto"
      >
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">
            {isPerfect ? "🏆" : percentage >= 70 ? "🎉" : "📚"}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isPerfect ? "Perfect!" : percentage >= 70 ? "Great Job!" : "Keep Practicing!"}
          </h2>
          <p className="text-muted-foreground mb-4">
            You got {correctCount} out of {results.length} words correct
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  "h-full rounded-full",
                  isPerfect ? "bg-green-500" : percentage >= 70 ? "bg-yellow-500" : "bg-red-500"
                )}
              />
            </div>
            <span className="font-bold">{percentage}%</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary mb-6">
            <Trophy className="w-5 h-5" />
            +{correctCount * 3} XP
          </div>

          {/* Show missed words */}
          {results.filter(r => !r.correct).length > 0 && (
            <div className="text-left mb-4">
              <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Words to Review:</h3>
              <div className="flex flex-wrap gap-2">
                {results.filter(r => !r.correct).map((r, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-500/10 text-red-600 rounded text-sm">
                    {r.word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button onClick={() => onComplete(results)} className="w-full" size="lg">
            Finish Review
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Vocabulary Review
          </span>
          <span>{currentIndex + 1} of {shuffledWords.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="p-8">
            {/* Word display */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-4xl font-bold">{currentWord.word}</h2>
                {onPlayAudio && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePlayAudio}
                    className="rounded-full"
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
              {currentWord.romanization && (
                <p className="text-lg text-muted-foreground italic">
                  {currentWord.romanization}
                </p>
              )}
            </div>

            {/* Question */}
            <p className="text-center text-muted-foreground mb-4">
              What does this word mean?
            </p>

            {/* Options */}
            <div className="grid gap-3">
              {options.map((option, idx) => {
                const isCorrectOption = option === currentWord.translation;
                const isSelected = showAnswer && option === currentWord.translation;
                
                let optionClass = "border-2 hover:border-primary/50 hover:bg-muted/50";
                if (showAnswer) {
                  if (isCorrectOption) {
                    optionClass = "border-2 border-green-500 bg-green-500/10";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={showAnswer}
                    className={cn(
                      "p-4 rounded-xl text-left transition-all flex items-center gap-3",
                      optionClass,
                      !showAnswer && "cursor-pointer"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold",
                      showAnswer && isCorrectOption ? "bg-green-500 text-white" : "bg-muted"
                    )}>
                      {showAnswer && isCorrectOption ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Button onClick={handleNext} className="w-full" size="lg">
                  {currentIndex >= shuffledWords.length - 1 ? "See Results" : "Next Word"}
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
