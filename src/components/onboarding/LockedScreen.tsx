import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Unlock } from "lucide-react";
import shpokoGuide from "@/assets/shpoko-guide.webp";
import { useGuest } from "@/contexts/GuestContext";

export const LockedScreen = () => {
  const navigate = useNavigate();
  const { lessonsCompleted, level, xp } = useGuest();

  const handleRegister = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border-2 border-destructive/50 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
      >
        {/* Lock icon with animation */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Lock className="w-10 h-10 text-destructive" />
        </motion.div>

        {/* Sad Shpoko */}
        <div className="flex justify-center mb-4">
          <motion.img
            src={shpokoGuide}
            alt="Shpoko"
            className="w-24 h-24 object-contain opacity-50 grayscale"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Account Locked 🔒
        </h2>

        <p className="text-muted-foreground mb-6">
          You chose not to create an account. To continue learning Bulgarian and access all features, please register.
        </p>

        {/* Progress reminder */}
        <div className="bg-accent/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">Your progress so far:</p>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{lessonsCompleted}</p>
              <p className="text-xs text-muted-foreground">Lessons</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{level}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{xp}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Create a free account to unlock everything and save your progress!
        </p>

        {/* Register button */}
        <Button
          onClick={handleRegister}
          className="w-full font-bold text-lg h-12"
          size="lg"
        >
          <Unlock className="w-5 h-5 mr-2" />
          Create Free Account
        </Button>
      </motion.div>
    </div>
  );
};
