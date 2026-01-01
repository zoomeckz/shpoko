import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Confetti } from "./Confetti";
import { Trophy, Zap, Target, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface LessonCompleteProps {
  xpEarned: number;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  onContinue: () => void;
}

export function LessonComplete({
  xpEarned,
  accuracy,
  totalQuestions,
  correctAnswers,
  onContinue,
}: LessonCompleteProps) {
  const [displayXP, setDisplayXP] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  // Animate XP counter
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = xpEarned / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= xpEarned) {
        setDisplayXP(xpEarned);
        clearInterval(timer);
      } else {
        setDisplayXP(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [xpEarned]);

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const getMessage = () => {
    if (accuracy >= 100) return "Perfect! 🎯";
    if (accuracy >= 80) return "Amazing work! 🌟";
    if (accuracy >= 60) return "Great job! 💪";
    return "Keep practicing! 📚";
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {showConfetti && <Confetti count={60} />}
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="bg-card rounded-3xl border-2 border-border p-8 max-w-md w-full text-center shadow-xl"
      >
        {/* Raccoon celebration */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [-5, 5, -5, 0]
          }}
          transition={{ duration: 0.8, repeat: 2 }}
          className="text-[100px] mb-4"
        >
          🦝
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-extrabold text-foreground mb-2"
        >
          Lesson Complete!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-bold text-primary mb-8"
        >
          {getMessage()}
        </motion.p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="bg-primary/10 rounded-2xl p-4"
          >
            <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
            <motion.p 
              key={displayXP}
              className="text-2xl font-bold text-primary"
            >
              +{displayXP}
            </motion.p>
            <p className="text-xs text-muted-foreground font-semibold">XP</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="bg-success/10 rounded-2xl p-4"
          >
            <Target className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-success">{Math.round(accuracy)}%</p>
            <p className="text-xs text-muted-foreground font-semibold">Accuracy</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="bg-warning/10 rounded-2xl p-4"
          >
            <Trophy className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-warning">{correctAnswers}/{totalQuestions}</p>
            <p className="text-xs text-muted-foreground font-semibold">Correct</p>
          </motion.div>
        </div>

        {/* Continue button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={onContinue}
            className="w-full py-6 text-lg font-bold rounded-2xl bg-primary hover:bg-primary-light shadow-[0_4px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none transition-all"
          >
            CONTINUE
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
