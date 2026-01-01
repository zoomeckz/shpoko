import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import shpokoHappy from "@/assets/shpoko-happy.png";
import shpokoExcited from "@/assets/shpoko-excited.png";
import shpokoSad from "@/assets/shpoko-sad.png";
import shpokoThinking from "@/assets/shpoko-thinking.png";
import shpokoWriting from "@/assets/shpoko-writing.png";
import shpokoSmug from "@/assets/shpoko-smug.png";
import shpokoReading from "@/assets/shpoko-reading.png";
import shpokoSleeping from "@/assets/shpoko-sleeping.png";

export type ShpokoMood = 
  | "idle" 
  | "happy" 
  | "excited" 
  | "sad" 
  | "thinking" 
  | "writing" 
  | "smug" 
  | "celebrating" 
  | "waving"
  | "reading"
  | "sleeping"
  | "surprised"
  | "encouraging";

interface ShpokoLottieProps {
  mood?: ShpokoMood;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  onClick?: () => void;
  showSpeechBubble?: boolean;
  speechText?: string;
}

const moodImages: Record<ShpokoMood, string> = {
  idle: shpokoHappy,
  happy: shpokoHappy,
  excited: shpokoExcited,
  sad: shpokoSad,
  thinking: shpokoThinking,
  writing: shpokoWriting,
  smug: shpokoSmug,
  celebrating: shpokoExcited,
  waving: shpokoHappy,
  reading: shpokoReading,
  sleeping: shpokoSleeping,
  surprised: shpokoExcited,
  encouraging: shpokoSmug,
};

const sizes = {
  xs: { container: "w-8 h-8", image: 32 },
  sm: { container: "w-12 h-12", image: 48 },
  md: { container: "w-24 h-24", image: 96 },
  lg: { container: "w-32 h-32", image: 128 },
  xl: { container: "w-48 h-48", image: 192 },
  "2xl": { container: "w-64 h-64", image: 256 },
};

// Duolingo-style animation variants
const idleVariants: Variants = {
  animate: {
    y: [0, -4, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const happyVariants: Variants = {
  animate: {
    y: [0, -6, 0],
    rotate: [0, -2, 0, 2, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const excitedVariants: Variants = {
  animate: {
    y: [0, -12, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeOut",
    },
  },
};

const sadVariants: Variants = {
  animate: {
    y: [0, 2, 0],
    rotate: [-2, 0, -2],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const thinkingVariants: Variants = {
  animate: {
    rotate: [0, -5, 5, 0],
    y: [0, -2, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const writingVariants: Variants = {
  animate: {
    rotate: [-2, 2, -2],
    x: [-1, 1, -1],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

const smugVariants: Variants = {
  animate: {
    y: [0, -3, 0],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const celebratingVariants: Variants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, -10, 10, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeOut",
    },
  },
};

const wavingVariants: Variants = {
  animate: {
    rotate: [0, -15, 15, -15, 0],
    y: [0, -5, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatDelay: 1,
      ease: "easeInOut",
    },
  },
};

const readingVariants: Variants = {
  animate: {
    y: [0, -2, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const sleepingVariants: Variants = {
  animate: {
    scale: [1, 1.02, 1],
    y: [0, 1, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const surprisedVariants: Variants = {
  animate: {
    scale: [1, 1.15, 1.05],
    y: [0, -10, -5],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      repeatDelay: 2,
      ease: "easeOut",
    },
  },
};

const encouragingVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const moodVariants: Record<ShpokoMood, Variants> = {
  idle: idleVariants,
  happy: happyVariants,
  excited: excitedVariants,
  sad: sadVariants,
  thinking: thinkingVariants,
  writing: writingVariants,
  smug: smugVariants,
  celebrating: celebratingVariants,
  waving: wavingVariants,
  reading: readingVariants,
  sleeping: sleepingVariants,
  surprised: surprisedVariants,
  encouraging: encouragingVariants,
};

// Eye blink animation overlay
const BlinkOverlay = ({ size }: { size: number }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };

    // Random blink interval between 2-5 seconds
    const scheduleNextBlink = () => {
      const delay = 2000 + Math.random() * 3000;
      return setTimeout(() => {
        blink();
        scheduleNextBlink();
      }, delay);
    };

    const timeoutId = scheduleNextBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  if (!isBlinking) return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.05 }}
    >
      {/* Simple blink effect - slightly darken eyes area */}
      <div
        className="absolute bg-foreground/10 rounded-full"
        style={{
          width: size * 0.15,
          height: size * 0.04,
          top: "35%",
          left: "30%",
        }}
      />
      <div
        className="absolute bg-foreground/10 rounded-full"
        style={{
          width: size * 0.15,
          height: size * 0.04,
          top: "35%",
          right: "30%",
        }}
      />
    </motion.div>
  );
};

// Sparkle particles for celebration
const CelebrationParticles = () => {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    color: ["#FFD700", "#FF6B9D", "#58CC02", "#1CB0F6", "#FF9600", "#CE82FF"][i % 6],
    delay: i * 0.1,
    x: (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 30),
    y: -(30 + Math.random() * 40),
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: "50%",
            top: "30%",
          }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: [0, particle.x],
            y: [0, particle.y],
            scale: [0, 1.5, 1, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Z letters for sleeping
const SleepingZs = () => {
  return (
    <div className="absolute -right-2 top-0 pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute text-muted-foreground font-bold"
          style={{
            fontSize: 12 + i * 4,
            right: i * 8,
          }}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [0, -20 - i * 10],
            x: [0, 10 + i * 5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        >
          Z
        </motion.span>
      ))}
    </div>
  );
};

// Speech bubble
const SpeechBubble = ({ text }: { text: string }) => {
  return (
    <motion.div
      className="absolute -top-16 left-1/2 -translate-x-1/2 bg-card border-2 border-border rounded-xl px-4 py-2 shadow-lg whitespace-nowrap"
      initial={{ opacity: 0, y: 10, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <span className="text-sm font-medium text-foreground">{text}</span>
      {/* Speech bubble tail */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-r-2 border-b-2 border-border rotate-45" />
    </motion.div>
  );
};

// Thinking dots
const ThinkingDots = () => {
  return (
    <div className="absolute -right-8 top-1/4 flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground"
          animate={{
            y: [0, -8, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const ShpokoLottie = ({
  mood = "idle",
  size = "md",
  className,
  autoplay = true,
  loop = true,
  onClick,
  showSpeechBubble = false,
  speechText = "",
}: ShpokoLottieProps) => {
  const imageSrc = moodImages[mood];
  const sizeConfig = sizes[size];
  const variants = moodVariants[mood];

  return (
    <motion.div
      className={cn(
        "relative inline-flex items-center justify-center cursor-pointer",
        sizeConfig.container,
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {showSpeechBubble && speechText && <SpeechBubble text={speechText} />}
      </AnimatePresence>

      {/* Main character */}
      <motion.div
        className="relative"
        variants={variants}
        animate={autoplay ? "animate" : undefined}
      >
        <motion.img
          src={imageSrc}
          alt={`Shpoko ${mood}`}
          className="object-contain drop-shadow-lg"
          style={{
            width: sizeConfig.image,
            height: sizeConfig.image,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        />

        {/* Blink overlay */}
        <BlinkOverlay size={sizeConfig.image} />
      </motion.div>

      {/* Mood-specific effects */}
      {mood === "celebrating" && <CelebrationParticles />}
      {mood === "sleeping" && <SleepingZs />}
      {mood === "thinking" && <ThinkingDots />}

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/10 -z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1.2 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

// Helper hook for dynamic mood based on context
export const useShpokoMood = (context: {
  isCorrect?: boolean;
  isWrong?: boolean;
  isLoading?: boolean;
  isComplete?: boolean;
  streak?: number;
}): ShpokoMood => {
  const { isCorrect, isWrong, isLoading, isComplete, streak } = context;

  if (isComplete) return "celebrating";
  if (isCorrect) return "excited";
  if (isWrong) return "sad";
  if (isLoading) return "thinking";
  if (streak && streak >= 5) return "smug";

  return "idle";
};

export default ShpokoLottie;
