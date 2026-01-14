import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import shpokoGuide from "@/assets/shpoko-guide.png";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for the target element
  position: "top" | "bottom" | "left" | "right" | "center";
  mobilePosition?: "top" | "bottom" | "center"; // Position for mobile
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to SHPOKO! 🦝",
    description: "I'm your Bulgarian learning buddy! Let me show you around.",
    position: "center",
  },
  {
    id: "lessons",
    title: "Lessons",
    description: "Start here! Complete lessons to earn XP and level up.",
    targetSelector: '[data-onboarding="lessons"]',
    position: "right",
    mobilePosition: "bottom",
  },
  {
    id: "stories",
    title: "Stories",
    description: "Read Bulgarian stories to improve your reading skills!",
    targetSelector: '[data-onboarding="stories"]',
    position: "right",
    mobilePosition: "bottom",
  },
  {
    id: "games",
    title: "Games",
    description: "Practice what you've learned with fun mini-games!",
    targetSelector: '[data-onboarding="games"]',
    position: "right",
    mobilePosition: "bottom",
  },
  {
    id: "profile",
    title: "Your Profile",
    description: "Track your progress, streaks, and achievements!",
    targetSelector: '[data-onboarding="profile"]',
    position: "right",
    mobilePosition: "bottom",
  },
  {
    id: "shpoko-image",
    title: "Shpoko Image Analyzer",
    description: "Take photos and I'll help you learn Bulgarian words!",
    targetSelector: '[data-onboarding="image-analyzer"]',
    position: "right",
    mobilePosition: "bottom",
  },
  {
    id: "ready",
    title: "You're Ready! 🎉",
    description: "Start your first lesson. Complete 3 to unlock all features!",
    position: "center",
  },
];

interface OnboardingGuideProps {
  onComplete: () => void;
}

export const OnboardingGuide = ({ onComplete }: OnboardingGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const isCentered = step.position === "center" || (isMobile && !step.targetSelector);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate position relative to target element
  useEffect(() => {
    if (!step.targetSelector || isCentered) return;

    const calculatePosition = () => {
      const target = document.querySelector(step.targetSelector!) as HTMLElement;
      const tooltip = tooltipRef.current;
      
      if (!target || !tooltip) {
        console.log("Target not found:", step.targetSelector);
        return;
      }

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const padding = 20;
      const arrowSize = 16;

      // If target is not visible (width/height is 0), skip
      if (targetRect.width === 0 || targetRect.height === 0) {
        console.log("Target has no dimensions:", step.targetSelector);
        return;
      }

      let top = 0;
      let left = 0;
      let arrowTop = 0;
      let arrowLeft = 0;

      const effectivePosition = isMobile ? (step.mobilePosition || "bottom") : step.position;

      switch (effectivePosition) {
        case "right":
          top = targetRect.top + targetRect.height / 2 - (tooltipRect.height || 200) / 2;
          left = targetRect.right + padding + arrowSize;
          arrowTop = targetRect.top + targetRect.height / 2 - arrowSize / 2;
          arrowLeft = targetRect.right + padding / 2;
          break;
        case "left":
          top = targetRect.top + targetRect.height / 2 - (tooltipRect.height || 200) / 2;
          left = targetRect.left - (tooltipRect.width || 300) - padding - arrowSize;
          arrowTop = targetRect.top + targetRect.height / 2 - arrowSize / 2;
          arrowLeft = targetRect.left - padding / 2 - arrowSize;
          break;
        case "top":
          top = targetRect.top - (tooltipRect.height || 200) - padding - arrowSize;
          left = targetRect.left + targetRect.width / 2 - (tooltipRect.width || 300) / 2;
          arrowTop = targetRect.top - padding / 2 - arrowSize;
          arrowLeft = targetRect.left + targetRect.width / 2 - arrowSize / 2;
          break;
        case "bottom":
          top = targetRect.bottom + padding + arrowSize;
          left = targetRect.left + targetRect.width / 2 - (tooltipRect.width || 300) / 2;
          arrowTop = targetRect.bottom + padding / 2;
          arrowLeft = targetRect.left + targetRect.width / 2 - arrowSize / 2;
          break;
      }

      // Keep tooltip on screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = tooltipRect.width || 300;
      const tooltipHeight = tooltipRect.height || 200;
      
      if (left < padding) left = padding;
      if (left + tooltipWidth > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipHeight > viewportHeight - padding) {
        top = viewportHeight - tooltipHeight - padding;
      }

      setTooltipPosition({ top, left });
      setArrowPosition({ top: arrowTop, left: arrowLeft });

      // Highlight target with a spotlight effect
      target.style.position = "relative";
      target.style.zIndex = "101";
      target.classList.add("ring-4", "ring-primary", "ring-offset-2", "rounded-xl", "bg-card");
    };

    // Give time for DOM to render, then recalculate after tooltip renders
    const timer1 = setTimeout(calculatePosition, 150);
    const timer2 = setTimeout(calculatePosition, 400);
    window.addEventListener("resize", calculatePosition);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", calculatePosition);
      // Clean up highlight
      const target = document.querySelector(step.targetSelector!) as HTMLElement;
      if (target) {
        target.style.position = "";
        target.style.zIndex = "";
        target.classList.remove("ring-4", "ring-primary", "ring-offset-2", "rounded-xl", "bg-card");
      }
    };
  }, [currentStep, step.targetSelector, step.position, step.mobilePosition, isCentered, isMobile]);

  const cleanupTarget = (selector: string) => {
    const target = document.querySelector(selector) as HTMLElement;
    if (target) {
      target.style.position = "";
      target.style.zIndex = "";
      target.classList.remove("ring-4", "ring-primary", "ring-offset-2", "rounded-xl", "bg-card");
    }
  };

  const handleNext = () => {
    // Clean up current highlight
    if (step.targetSelector) {
      cleanupTarget(step.targetSelector);
    }

    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleClose = () => {
    // Clean up any highlights
    ONBOARDING_STEPS.forEach(s => {
      if (s.targetSelector) {
        cleanupTarget(s.targetSelector);
      }
    });
    navigate("/auth");
  };

  const handleAlreadyHaveAccount = () => {
    // Clean up any highlights
    ONBOARDING_STEPS.forEach(s => {
      if (s.targetSelector) {
        cleanupTarget(s.targetSelector);
      }
    });
    navigate("/auth");
  };

  const getArrowIcon = () => {
    const effectivePosition = isMobile ? (step.mobilePosition || step.position) : step.position;
    switch (effectivePosition) {
      case "right":
        return <ArrowLeft className="w-6 h-6 text-primary" />;
      case "left":
        return <ArrowRight className="w-6 h-6 text-primary" />;
      case "top":
        return <ArrowDown className="w-6 h-6 text-primary" />;
      case "bottom":
        return <ArrowUp className="w-6 h-6 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
      />

      {/* Arrow pointing to target */}
      {!isCentered && step.targetSelector && (
        <motion.div
          key={`arrow-${step.id}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed z-[102] animate-pulse"
          style={{
            top: arrowPosition.top,
            left: arrowPosition.left,
          }}
        >
          {getArrowIcon()}
        </motion.div>
      )}

      {/* Tooltip */}
      <motion.div
        ref={tooltipRef}
        key={step.id}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={`fixed z-[102] bg-card border-2 border-primary rounded-2xl p-5 shadow-2xl max-w-xs w-full ${
          isCentered ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""
        }`}
        style={!isCentered ? { top: tooltipPosition.top, left: tooltipPosition.left } : undefined}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Close and login"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-3">
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

        {/* Shpoko mascot - smaller for non-center positions */}
        <div className="flex justify-center mb-3">
          <motion.img
            src={shpokoGuide}
            alt="Shpoko Guide"
            className={`object-contain ${isCentered ? "w-20 h-20" : "w-14 h-14"}`}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground mb-1">{step.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            onClick={handleNext}
            className="flex-1 font-bold"
            size="default"
          >
            {isLastStep ? "Let's Go! 🚀" : "Next"}
          </Button>
        </div>

        {/* Already have account link */}
        {isFirstStep && (
          <button
            onClick={handleAlreadyHaveAccount}
            className="w-full mt-3 text-sm text-primary hover:underline font-medium"
          >
            Already have an account? Log in
          </button>
        )}

        {/* Step counter */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          {currentStep + 1} of {ONBOARDING_STEPS.length}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};
