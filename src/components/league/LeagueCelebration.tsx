import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronUp, Trophy, Crown, Star, Zap, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { Confetti } from "@/components/lesson/Confetti";

const LEAGUE_DATA: Record<string, { icon: string; color: string; gradient: string }> = {
  "Bronze": { icon: "🥉", color: "text-amber-700", gradient: "from-amber-600 to-amber-800" },
  "Silver": { icon: "🥈", color: "text-slate-400", gradient: "from-slate-400 to-slate-600" },
  "Gold": { icon: "🥇", color: "text-yellow-500", gradient: "from-yellow-400 to-yellow-600" },
  "Platinum": { icon: "💎", color: "text-cyan-400", gradient: "from-cyan-400 to-cyan-600" },
  "Diamond": { icon: "💠", color: "text-blue-400", gradient: "from-blue-400 to-blue-600" },
  "Master": { icon: "👑", color: "text-purple-500", gradient: "from-purple-500 to-purple-700" },
  "Champion": { icon: "🏆", color: "text-rose-500", gradient: "from-rose-500 to-rose-700" },
};

interface LeagueCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  previousLeague: string;
  newLeague: string;
  finalPosition: number;
  weeklyXP: number;
}

export const LeagueCelebration = ({
  isOpen,
  onClose,
  previousLeague,
  newLeague,
  finalPosition,
  weeklyXP,
}: LeagueCelebrationProps) => {
  const { playPromotion, playComplete, playLevelUp } = useDuolingoSounds();
  const [stage, setStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const previousData = LEAGUE_DATA[previousLeague] || LEAGUE_DATA["Bronze"];
  const newData = LEAGUE_DATA[newLeague] || LEAGUE_DATA["Bronze"];

  useEffect(() => {
    if (isOpen) {
      setStage(0);
      setShowConfetti(false);

      // Animation sequence
      const timer1 = setTimeout(() => {
        setStage(1);
        playComplete();
      }, 500);

      const timer2 = setTimeout(() => {
        setStage(2);
        playLevelUp();
      }, 1500);

      const timer3 = setTimeout(() => {
        setStage(3);
        playPromotion();
        setShowConfetti(true);
      }, 2500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen, playComplete, playLevelUp, playPromotion]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        {showConfetti && <Confetti />}

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/50"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
              }}
              animate={{
                y: -50,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="relative w-full max-w-md mx-4 p-8 rounded-3xl bg-gradient-to-br from-background via-background to-muted border shadow-2xl"
        >
          {/* Glow effects */}
          <div className={cn(
            "absolute inset-0 rounded-3xl opacity-20 blur-3xl -z-10",
            `bg-gradient-to-br ${newData.gradient}`
          )} />

          {/* Header with sparkles */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              PROMOTED!
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>

          <div className="text-center space-y-6 mt-4">
            {/* Stage 1: Show previous league */}
            <AnimatePresence mode="wait">
              {stage >= 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: stage === 0 ? 1 : 0.5, y: 0, scale: stage > 0 ? 0.8 : 1 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-muted-foreground">Week finished at</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-5xl">{previousData.icon}</span>
                    <div className="text-left">
                      <h3 className={cn("text-2xl font-bold", previousData.color)}>
                        {previousLeague} League
                      </h3>
                      <p className="text-muted-foreground">Position #{finalPosition}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stage 2: Arrow animation */}
            {stage >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="bg-green-500/20 p-3 rounded-full"
                >
                  <ChevronUp className="w-8 h-8 text-green-500" />
                </motion.div>
              </motion.div>
            )}

            {/* Stage 3: New league reveal */}
            {stage >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl"
                >
                  {newData.icon}
                </motion.div>
                
                <div>
                  <h2 className={cn("text-4xl font-black", newData.color)}>
                    {newLeague} League
                  </h2>
                  <p className="text-muted-foreground mt-1">Welcome to your new league!</p>
                </div>

                {/* Stats summary */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center gap-6 mt-4"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <Zap className="w-5 h-5" />
                      <span className="text-2xl font-bold">{weeklyXP}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Weekly XP</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-500">
                      <Trophy className="w-5 h-5" />
                      <span className="text-2xl font-bold">#{finalPosition}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Final Rank</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Continue button */}
            {stage >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  onClick={onClose} 
                  size="lg" 
                  className={cn(
                    "w-full gap-2 text-lg font-bold shadow-lg",
                    `bg-gradient-to-r ${newData.gradient} hover:opacity-90`
                  )}
                >
                  <PartyPopper className="w-5 h-5" />
                  Let's Go!
                </Button>
              </motion.div>
            )}
          </div>

          {/* Decorative corner sparkles */}
          <motion.div
            className="absolute top-4 left-4 text-yellow-400"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-6 h-6" fill="currentColor" />
          </motion.div>
          <motion.div
            className="absolute top-4 right-4 text-yellow-400"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-4 text-primary"
            animate={{ opacity: [0, 1, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
          >
            <Crown className="w-5 h-5" />
          </motion.div>
          <motion.div
            className="absolute bottom-4 right-4 text-primary"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
          >
            <Trophy className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Demotion notification (less celebratory)
interface LeagueDemotionProps {
  isOpen: boolean;
  onClose: () => void;
  previousLeague: string;
  newLeague: string;
  finalPosition: number;
}

export const LeagueDemotion = ({
  isOpen,
  onClose,
  previousLeague,
  newLeague,
  finalPosition,
}: LeagueDemotionProps) => {
  const { playDemotion } = useDuolingoSounds();

  useEffect(() => {
    if (isOpen) {
      playDemotion();
    }
  }, [isOpen, playDemotion]);

  const previousData = LEAGUE_DATA[previousLeague] || LEAGUE_DATA["Bronze"];
  const newData = LEAGUE_DATA[newLeague] || LEAGUE_DATA["Bronze"];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-md mx-4 p-8 rounded-3xl bg-gradient-to-br from-background via-background to-red-500/5 border border-red-500/20 shadow-2xl"
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-7xl"
            >
              😔
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">League Demotion</h2>
              <p className="text-muted-foreground">
                You finished in position #{finalPosition} in {previousLeague} League
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="text-4xl">{previousData.icon}</span>
                <p className={cn("text-sm font-medium", previousData.color)}>{previousLeague}</p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="text-center">
                <span className="text-4xl">{newData.icon}</span>
                <p className={cn("text-sm font-medium", newData.color)}>{newLeague}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Don't give up! Keep learning and you'll climb back up! 💪
            </p>

            <Button onClick={onClose} size="lg" className="w-full">
              Keep Going
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
