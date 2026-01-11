import { cn } from "@/lib/utils";
import { Check, Lock, Star, Crown, Gift, ChevronLeft, ChevronRight, Zap, Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { DeepDiveLesson } from "@/data/lessons";

interface LessonNodeProps {
  status: "locked" | "available" | "current" | "completed" | "perfect";
  position: "left" | "center" | "right";
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  isChest?: boolean;
  progress?: number;
  deepDives?: {
    left?: DeepDiveLesson;
    right?: DeepDiveLesson;
  };
  onDeepDiveClick?: (deepDive: DeepDiveLesson) => void;
  isDeepDiveCompleted?: (deepDiveId: string) => boolean;
}

export const LessonNode = ({
  status,
  position,
  onClick,
  icon,
  label,
  isChest = false,
  progress = 0,
  deepDives,
  onDeepDiveClick,
  isDeepDiveCompleted,
}: LessonNodeProps) => {
  const [showDeepDives, setShowDeepDives] = useState(false);

  const positionOffset = {
    left: "-translate-x-16",
    center: "translate-x-0",
    right: "translate-x-16"
  };

  const statusStyles = {
    locked: "bg-muted border-muted-foreground/30 text-muted-foreground cursor-not-allowed",
    available: "bg-card border-border text-foreground cursor-pointer hover:scale-105 hover:border-primary/50",
    current: "bg-primary border-primary text-primary-foreground cursor-pointer hover:scale-105 ring-4 ring-primary/30",
    completed: "bg-success border-success text-success-foreground cursor-pointer hover:scale-105",
    perfect: "bg-warning border-warning text-warning-foreground cursor-pointer hover:scale-105"
  };

  const shadowStyles = {
    locked: "shadow-[0_4px_0_0_hsl(var(--muted-foreground)/0.3)]",
    available: "shadow-[0_4px_0_0_hsl(var(--border))]",
    current: "shadow-[0_4px_0_0_hsl(var(--primary-dark))]",
    completed: "shadow-[0_4px_0_0_hsl(var(--success-dark))]",
    perfect: "shadow-[0_4px_0_0_hsl(45,100%,41%)]"
  };

  const canShowDeepDives = (status === "completed" || status === "perfect") && deepDives && (deepDives.left || deepDives.right);

  const renderIcon = () => {
    if (isChest) {
      return <Gift className="w-8 h-8" />;
    }
    if (status === "locked") {
      return <Lock className="w-6 h-6" />;
    }
    if (status === "completed") {
      return <Check className="w-8 h-8" strokeWidth={3} />;
    }
    if (status === "perfect") {
      return <Crown className="w-8 h-8" />;
    }
    if (icon) {
      return icon;
    }
    return <Star className="w-8 h-8" />;
  };

  const getDeepDiveIcon = (type: DeepDiveLesson['type']) => {
    switch (type) {
      case 'practice':
        return <Zap className="w-4 h-4" />;
      case 'challenge':
        return <Trophy className="w-4 h-4" />;
      case 'mastery':
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getDeepDiveStyle = (type: DeepDiveLesson['type'], completed: boolean) => {
    if (completed) {
      return "bg-success/20 border-success text-success";
    }
    switch (type) {
      case 'practice':
        return "bg-blue-500/20 border-blue-500 text-blue-400 hover:bg-blue-500/30";
      case 'challenge':
        return "bg-orange-500/20 border-orange-500 text-orange-400 hover:bg-orange-500/30";
      case 'mastery':
        return "bg-purple-500/20 border-purple-500 text-purple-400 hover:bg-purple-500/30";
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("flex flex-col items-center relative", positionOffset[position])}
      onMouseEnter={() => canShowDeepDives && setShowDeepDives(true)}
      onMouseLeave={() => setShowDeepDives(false)}
    >
      {/* Deep Dive Branches */}
      <AnimatePresence>
        {showDeepDives && canShowDeepDives && (
          <>
            {/* Left Deep Dive */}
            {deepDives?.left && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full flex items-center"
              >
                {/* Connection line */}
                <div className="w-4 h-0.5 bg-muted-foreground/30" />
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDeepDiveClick?.(deepDives.left!)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-colors min-w-[70px]",
                    getDeepDiveStyle(deepDives.left.type, isDeepDiveCompleted?.(deepDives.left.id) || false)
                  )}
                >
                  <div className="flex items-center gap-1">
                    <ChevronLeft className="w-3 h-3" />
                    {getDeepDiveIcon(deepDives.left.type)}
                  </div>
                  <span className="text-[10px] font-bold leading-tight text-center">
                    {deepDives.left.title}
                  </span>
                  <span className="text-[9px] opacity-75">+{deepDives.left.xpReward} XP</span>
                  {deepDives.left.skinReward && (
                    <span className="text-[8px] text-warning">🎭 Skin</span>
                  )}
                  {deepDives.left.badgeReward && (
                    <span className="text-[8px] text-warning">🏆 Badge</span>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* Right Deep Dive */}
            {deepDives?.right && (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full flex items-center"
              >
                {/* Connection line */}
                <div className="w-4 h-0.5 bg-muted-foreground/30" />
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDeepDiveClick?.(deepDives.right!)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-colors min-w-[70px]",
                    getDeepDiveStyle(deepDives.right.type, isDeepDiveCompleted?.(deepDives.right.id) || false)
                  )}
                >
                  <div className="flex items-center gap-1">
                    {getDeepDiveIcon(deepDives.right.type)}
                    <ChevronRight className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold leading-tight text-center">
                    {deepDives.right.title}
                  </span>
                  <span className="text-[9px] opacity-75">+{deepDives.right.xpReward} XP</span>
                  {deepDives.right.skinReward && (
                    <span className="text-[8px] text-warning">🎭 Skin</span>
                  )}
                  {deepDives.right.badgeReward && (
                    <span className="text-[8px] text-warning">🏆 Badge</span>
                  )}
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Deep dive indicator arrows */}
      {canShowDeepDives && !showDeepDives && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {deepDives?.left && (
            <motion.div
              animate={{ x: [-2, 2, -2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -left-8 text-muted-foreground/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.div>
          )}
          {deepDives?.right && (
            <motion.div
              animate={{ x: [2, -2, 2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -right-8 text-muted-foreground/50"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          )}
        </div>
      )}

      <motion.button
        onClick={status !== "locked" ? onClick : undefined}
        whileHover={status !== "locked" ? { scale: 1.05 } : {}}
        whileTap={status !== "locked" ? { scale: 0.98, y: 2 } : {}}
        className={cn(
          "relative w-16 h-16 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center transition-all duration-200",
          statusStyles[status],
          shadowStyles[status],
          "active:shadow-none active:translate-y-1"
        )}
        disabled={status === "locked"}
      >
        {/* Progress ring for current lesson */}
        {status === "current" && progress > 0 && progress < 100 && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={`${progress * 2.89} 289`}
              className="text-primary-foreground/50"
            />
          </svg>
        )}
        
        {/* Pulsing animation for current */}
        {status === "current" && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {renderIcon()}
      </motion.button>
      
      {label && (
        <span className={cn(
          "mt-2 text-xs font-bold text-center max-w-[80px] leading-tight",
          status === "locked" ? "text-muted-foreground" : "text-foreground"
        )}>
          {label}
        </span>
      )}
    </motion.div>
  );
};
