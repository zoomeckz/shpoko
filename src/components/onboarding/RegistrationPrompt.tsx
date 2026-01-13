import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Sparkles, Trophy, Flame, Star } from "lucide-react";
import shpokoGuide from "@/assets/shpoko-guide.png";
import { useGuest } from "@/contexts/GuestContext";

interface RegistrationPromptProps {
  onClose: () => void;
}

export const RegistrationPrompt = ({ onClose }: RegistrationPromptProps) => {
  const navigate = useNavigate();
  const { declineRegistration, lessonsCompleted, level, xp } = useGuest();

  const handleRegister = () => {
    navigate("/auth");
    onClose();
  };

  const handleDecline = () => {
    declineRegistration();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border-2 border-primary rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        {/* Mascot */}
        <div className="flex justify-center mb-4">
          <motion.img
            src={shpokoGuide}
            alt="Shpoko"
            className="w-28 h-28 object-contain"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          You're Doing Great! 🎉
        </h2>

        {/* Progress summary */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">{lessonsCompleted} Lessons</span>
          </div>
          <div className="flex items-center gap-1 bg-warning/10 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 text-warning" />
            <span className="text-sm font-bold">Level {level}</span>
          </div>
        </div>

        <p className="text-center text-muted-foreground mb-6">
          Create a free account to save your progress and unlock all features!
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 bg-accent/50 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Save Your Progress</p>
              <p className="text-xs text-muted-foreground">Keep your XP, streaks & achievements</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-accent/50 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-semibold text-sm">Compete on Leaderboards</p>
              <p className="text-xs text-muted-foreground">Join leagues and climb the ranks</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-accent/50 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-sm">Unlock All Features</p>
              <p className="text-xs text-muted-foreground">Games, stories, quizzes & more!</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleRegister}
            className="w-full font-bold text-lg h-12"
            size="lg"
          >
            <Mail className="w-5 h-5 mr-2" />
            Create Free Account
          </Button>
          <Button
            onClick={handleDecline}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            <Lock className="w-4 h-4 mr-2" />
            No thanks, lock my account
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          ⚠️ Declining will lock all features until you register
        </p>
      </motion.div>
    </motion.div>
  );
};
