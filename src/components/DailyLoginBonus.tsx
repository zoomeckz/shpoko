import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyLoginBonus, BONUS_TIERS_INFO } from "@/hooks/useDailyLoginBonus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gift, Flame, Heart, Sparkles, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const DailyLoginBonus = () => {
  const { consecutiveDays, todaysClaimed, bonusXP, bonusHearts, claimBonus, loading } = useDailyLoginBonus();
  const [showModal, setShowModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    // Show modal on mount if bonus is available
    if (!loading && !todaysClaimed) {
      const timer = setTimeout(() => setShowModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, todaysClaimed]);

  const handleClaim = async () => {
    setClaiming(true);
    await claimBonus();
    setTimeout(() => {
      setClaiming(false);
      setShowModal(false);
    }, 1500);
  };

  if (loading) return null;

  return (
    <AnimatePresence>
      {showModal && !todaysClaimed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md p-6 bg-card border-2 border-primary/20 relative overflow-hidden">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="inline-block"
                >
                  <Gift className="w-16 h-16 text-primary mx-auto mb-3" />
                </motion.div>
                <h2 className="text-2xl font-bold font-nunito">Daily Login Bonus!</h2>
                <p className="text-muted-foreground">
                  Day {consecutiveDays + 1} streak bonus
                </p>
              </div>

              {/* Weekly progress */}
              <div className="flex justify-between mb-6 px-2">
                {BONUS_TIERS_INFO.map((tier, idx) => {
                  const dayNumber = idx + 1;
                  const cycleDay = ((consecutiveDays) % 7) + 1;
                  const isCompleted = dayNumber < cycleDay;
                  const isCurrent = dayNumber === cycleDay;
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                          isCompleted && "bg-primary border-primary text-primary-foreground",
                          isCurrent && "border-primary bg-primary/20 text-primary animate-pulse",
                          !isCompleted && !isCurrent && "border-muted bg-muted/50 text-muted-foreground"
                        )}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : dayNumber}
                      </div>
                      <span className="text-xs text-muted-foreground">{tier.xp}xp</span>
                      {tier.hearts > 0 && (
                        <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Today's reward */}
              <div className="bg-primary/10 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Today's Reward</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold">+{bonusXP} XP</span>
                  </div>
                  {bonusHearts > 0 && (
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      <span className="text-2xl font-bold">+{bonusHearts}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Streak info */}
              <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
                <Flame className="w-5 h-5 text-orange-500" />
                <span>{consecutiveDays} day streak</span>
              </div>

              <Button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full h-12 text-lg font-bold"
                size="lg"
              >
                {claiming ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Claimed!
                  </motion.div>
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Claim Bonus
                  </>
                )}
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
