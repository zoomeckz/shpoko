import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MatchingPair {
  left: string;
  right: string;
}

interface MatchingPairsQuestionProps {
  pairs: MatchingPair[];
  onAnswer: (isCorrect: boolean) => void;
}

export function MatchingPairsQuestion({
  pairs,
  onAnswer,
}: MatchingPairsQuestionProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  
  // Shuffle right side for display
  const [shuffledRight] = useState(() => 
    [...pairs].sort(() => Math.random() - 0.5).map(p => p.right)
  );

  const handleLeftSelect = (left: string) => {
    if (matchedPairs.has(left)) return;
    setSelectedLeft(left);
    setWrongPair(null);
  };

  const handleRightSelect = (right: string) => {
    if (!selectedLeft || matchedPairs.has(selectedLeft)) return;
    
    const correctPair = pairs.find(p => p.left === selectedLeft);
    
    if (correctPair?.right === right) {
      // Correct match
      setMatchedPairs(prev => new Set([...prev, selectedLeft]));
      setSelectedLeft(null);
      
      // Check if all matched
      if (matchedPairs.size + 1 === pairs.length) {
        onAnswer(true);
      }
    } else {
      // Wrong match
      setWrongPair({ left: selectedLeft, right });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Tap the matching pairs
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Match the words with their translations
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-3">
          {pairs.map((pair) => (
            <motion.button
              key={pair.left}
              onClick={() => handleLeftSelect(pair.left)}
              disabled={matchedPairs.has(pair.left)}
              className={cn(
                "w-full p-4 rounded-xl border-2 font-semibold text-left transition-all",
                "shadow-[0_2px_0_0_hsl(var(--border))]",
                matchedPairs.has(pair.left) && "border-success bg-success/10 text-success opacity-60",
                selectedLeft === pair.left && !matchedPairs.has(pair.left) && "border-primary bg-primary/10 ring-2 ring-primary",
                wrongPair?.left === pair.left && "border-error bg-error/10 animate-shake",
                !matchedPairs.has(pair.left) && selectedLeft !== pair.left && "border-border hover:border-muted-foreground"
              )}
            >
              {pair.left}
            </motion.button>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          {shuffledRight.map((right) => {
            const isMatched = pairs.some(p => p.right === right && matchedPairs.has(p.left));
            
            return (
              <motion.button
                key={right}
                onClick={() => handleRightSelect(right)}
                disabled={isMatched}
                className={cn(
                  "w-full p-4 rounded-xl border-2 font-semibold text-left transition-all",
                  "shadow-[0_2px_0_0_hsl(var(--border))]",
                  isMatched && "border-success bg-success/10 text-success opacity-60",
                  wrongPair?.right === right && "border-error bg-error/10 animate-shake",
                  !isMatched && "border-border hover:border-muted-foreground"
                )}
              >
                {right}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
