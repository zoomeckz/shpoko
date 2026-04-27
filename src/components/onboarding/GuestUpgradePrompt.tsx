import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Lock, Sparkles, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuestUpgradePromptProps {
  open: boolean;
  onClose: () => void;
  /** What the guest tried to access — used in the headline. */
  contentLabel?: string;
}

/**
 * Shown when a guest tries to access content that's beyond the free
 * "basic lessons" tier. Encourages registration without locking them out
 * of the lessons they CAN play.
 */
export const GuestUpgradePrompt = ({
  open,
  onClose,
  contentLabel = "this lesson",
}: GuestUpgradePromptProps) => {
  const navigate = useNavigate();

  if (typeof document === "undefined") return null;

  const handleRegister = () => {
    onClose();
    navigate("/auth");
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="guest-upgrade-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[150] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-upgrade-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border-2 border-primary rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary" />
              </div>
            </div>

            <h2
              id="guest-upgrade-title"
              className="text-xl font-bold text-center text-foreground mb-1"
            >
              Register to unlock {contentLabel}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-5">
              Guests can play the basic lessons. Create a free account to keep
              going beyond that.
            </p>

            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-3 bg-accent/50 p-2.5 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs">
                  <span className="font-semibold">All intermediate & advanced lessons</span>
                  <span className="text-muted-foreground"> — full path unlocked</span>
                </p>
              </div>
              <div className="flex items-center gap-3 bg-accent/50 p-2.5 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-warning" />
                </div>
                <p className="text-xs">
                  <span className="font-semibold">Streaks, XP & progress saved</span>
                  <span className="text-muted-foreground"> across devices</span>
                </p>
              </div>
              <div className="flex items-center gap-3 bg-accent/50 p-2.5 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-success" />
                </div>
                <p className="text-xs">
                  <span className="font-semibold">Leaderboards & leagues</span>
                  <span className="text-muted-foreground"> — compete with others</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleRegister}
                className="w-full h-11 font-bold rounded-xl"
              >
                Create free account
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                Keep playing basics
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
