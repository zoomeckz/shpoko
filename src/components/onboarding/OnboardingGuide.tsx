import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import shpokoGuide from "@/assets/shpoko-guide.png";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to SHPOKO! 🦝",
    description: "I'm your Bulgarian learning buddy! Learn through lessons, stories, and games. Complete 3 lessons to unlock all features!",
  },
  {
    id: "start",
    title: "Ready to Learn? 🚀",
    description: "Tap 'Start Learning' to begin your first lesson. You can find a full tour in the Help menu anytime!",
  },
];

interface OnboardingGuideProps {
  onComplete: () => void;
}

export const OnboardingGuide = ({ onComplete }: OnboardingGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const portalTarget = useMemo(() => {
    if (typeof document === "undefined") return null;
    return document.body;
  }, []);

  const handleNext = () => {
    if (isLastStep) onComplete();
    else setCurrentStep((prev) => prev + 1);
  };

  const handleClose = () => {
    navigate("/auth");
  };

  const handleAlreadyHaveAccount = () => {
    navigate("/auth");
  };

  const content = (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/10 backdrop-blur-sm backdrop-brightness-50"
      />

      {/* Centered modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ type: "spring", duration: 0.45 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
          className="relative w-full max-w-sm rounded-2xl border-2 border-primary bg-card p-5 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 rounded-full p-1 transition-colors hover:bg-muted"
            aria-label="Close and login"
            type="button"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Progress dots */}
          <div className="mb-3 flex justify-center gap-1.5">
            {ONBOARDING_STEPS.map((_, index) => (
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
              src={shpokoGuide}
              alt="Shpoko guide"
              className="h-20 w-20 object-contain"
              loading="lazy"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 id="onboarding-title" className="mb-1 text-lg font-bold text-foreground">
              {step.title}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">{step.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button onClick={handleNext} className="flex-1 font-bold">
              {isLastStep ? "Start Learning! 🚀" : "Next"}
            </Button>
          </div>

          {/* Skip tour */}
          <button
            onClick={onComplete}
            className="mt-3 w-full text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
            type="button"
          >
            Skip tour
          </button>

          {/* Already have account link */}
          {isFirstStep && (
            <button
              onClick={handleAlreadyHaveAccount}
              className="mt-1 w-full text-sm font-medium text-primary hover:underline"
              type="button"
            >
              Already have an account? Log in
            </button>
          )}

          {/* Step counter */}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {currentStep + 1} of {ONBOARDING_STEPS.length}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (!portalTarget) return null;
  return createPortal(content, portalTarget);
};

