import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import shpokoGuide from "@/assets/shpoko-guide.png";

interface TourStep {
  id: string;
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to SHPOKO! 🦝",
    description: "I'm your Bulgarian learning buddy! Let me show you around.",
  },
  {
    id: "lessons",
    title: "Lessons",
    description: "Complete lessons to earn XP and level up. Follow the path to progress through topics!",
  },
  {
    id: "stories",
    title: "Stories",
    description: "Read Bulgarian stories to build reading confidence. Great for immersive learning!",
  },
  {
    id: "games",
    title: "Games",
    description: "Practice what you've learned with fun mini-games like Fruit Slicer and Rapid Fire.",
  },
  {
    id: "quizzes",
    title: "Quizzes",
    description: "Create your own quizzes or discover community quizzes to test your knowledge.",
  },
  {
    id: "profile",
    title: "Your Profile",
    description: "Track your streak, XP, badges, and unlockable skins. Keep your streak going!",
  },
  {
    id: "shpoko-image",
    title: "Shpoko Image Analyzer",
    description: "Snap a photo and learn Bulgarian words from what you see. AI-powered learning!",
  },
  {
    id: "done",
    title: "You're All Set! 🎉",
    description: "Explore SHPOKO and have fun learning Bulgarian!",
  },
];

interface HelpTourModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HelpTourModal = ({ open, onOpenChange }: HelpTourModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setCurrentStep(0);
      onOpenChange(false);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-2 border-primary">
        <div className="p-5">
          {/* Progress dots */}
          <div className="mb-3 flex justify-center gap-1.5">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                      ? "bg-primary/50"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Mascot */}
          <div className="mb-3 flex justify-center">
            <motion.img
              key={step.id}
              src={shpokoGuide}
              alt="Shpoko guide"
              className="h-20 w-20 object-contain"
              loading="lazy"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
              transition={{ 
                scale: { duration: 0.2 },
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <h3 className="mb-1 text-lg font-bold text-foreground">
                {step.title}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button onClick={handleNext} className="flex-1 font-bold">
              {isLastStep ? "Got It! ✓" : "Next"}
            </Button>
          </div>

          {/* Step counter */}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {currentStep + 1} of {TOUR_STEPS.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
