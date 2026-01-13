import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import shpokoGuide from "@/assets/shpoko-guide.png";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or description
  position: "top" | "bottom" | "left" | "right" | "center";
  arrowDirection?: "up" | "down" | "left" | "right";
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to SHPOKO! 🦝",
    description: "I'm your Bulgarian learning buddy! Let me show you around.",
    target: "center",
    position: "center",
  },
  {
    id: "lessons",
    title: "Lessons",
    description: "Start your learning journey here! Complete lessons to earn XP and level up.",
    target: "lessons",
    position: "center",
    arrowDirection: "down",
  },
  {
    id: "games",
    title: "Games",
    description: "Practice what you've learned with fun mini-games!",
    target: "games",
    position: "center",
    arrowDirection: "down",
  },
  {
    id: "stories",
    title: "Stories",
    description: "Read Bulgarian stories to improve your reading skills!",
    target: "stories",
    position: "center",
    arrowDirection: "down",
  },
  {
    id: "profile",
    title: "Your Profile",
    description: "Track your progress, streaks, and achievements here!",
    target: "profile",
    position: "center",
    arrowDirection: "down",
  },
  {
    id: "shpoko",
    title: "Shpoko Image Analyzer",
    description: "Take photos and I'll help you learn Bulgarian words from them!",
    target: "shpoko-image",
    position: "center",
    arrowDirection: "down",
  },
  {
    id: "ready",
    title: "You're Ready! 🎉",
    description: "Start with your first lesson. Complete 3 lessons to unlock all features!",
    target: "center",
    position: "center",
  },
];

interface OnboardingGuideProps {
  onComplete: () => void;
}

export const OnboardingGuide = ({ onComplete }: OnboardingGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const getArrowIcon = () => {
    switch (step.arrowDirection) {
      case "up":
        return <ArrowUp className="w-8 h-8 text-primary animate-bounce" />;
      case "down":
        return <ArrowDown className="w-8 h-8 text-primary animate-bounce" />;
      case "left":
        return <ArrowRight className="w-8 h-8 text-primary animate-bounce rotate-180" />;
      case "right":
        return <ArrowRight className="w-8 h-8 text-primary animate-bounce" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-card border-2 border-primary rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
        >
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-4">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Arrow indicator */}
          {step.arrowDirection && (
            <div className="flex justify-center mb-4">
              {getArrowIcon()}
            </div>
          )}

          {/* Shpoko mascot */}
          <div className="flex justify-center mb-4">
            <motion.img
              src={shpokoGuide}
              alt="Shpoko Guide"
              className="w-24 h-24 object-contain"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
            <p className="text-muted-foreground mb-6">{step.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              onClick={handleNext}
              className="flex-1 font-bold"
              size="lg"
            >
              {isLastStep ? "Let's Go! 🚀" : "Next"}
            </Button>
          </div>

          {/* Step counter */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {currentStep + 1} of {ONBOARDING_STEPS.length}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
