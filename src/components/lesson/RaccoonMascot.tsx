import { motion, AnimatePresence } from "framer-motion";

interface RaccoonMascotProps {
  mood: "neutral" | "happy" | "sad" | "celebrating";
  size?: "sm" | "md" | "lg";
  showBubble?: boolean;
  bubbleText?: string;
}

export function RaccoonMascot({ 
  mood, 
  size = "md", 
  showBubble = false, 
  bubbleText = "" 
}: RaccoonMascotProps) {
  const sizeClasses = {
    sm: "text-[60px]",
    md: "text-[100px]",
    lg: "text-[150px]"
  };

  const animations = {
    neutral: {
      animate: { scale: [1, 1.02, 1] },
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
    },
    happy: {
      animate: { y: [0, -8, 0], rotate: [-2, 2, -2] },
      transition: { duration: 0.5, repeat: 2, ease: "easeOut" as const }
    },
    sad: {
      animate: { x: [-3, 3, -3, 0], rotate: [-3, 3, -3, 0] },
      transition: { duration: 0.4, ease: "easeInOut" as const }
    },
    celebrating: {
      animate: { 
        y: [0, -15, 0, -10, 0], 
        rotate: [-5, 5, -5, 5, 0],
        scale: [1, 1.1, 1, 1.05, 1] 
      },
      transition: { duration: 0.8, ease: "easeOut" as const }
    }
  };

  return (
    <div className="relative inline-block">
      <motion.div
        key={mood}
        className={`${sizeClasses[size]} select-none leading-none`}
        {...animations[mood]}
      >
        🦝
      </motion.div>

      <AnimatePresence>
        {showBubble && bubbleText && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute -top-2 -right-2 bg-card rounded-xl px-3 py-1.5 shadow-lg border-2 border-border whitespace-nowrap z-10"
          >
            <p className="font-bold text-sm text-foreground">{bubbleText}</p>
            <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-card border-r-2 border-b-2 border-border transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
