import { cn } from "@/lib/utils";
import { Check, Lock, Star, Crown, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface LessonNodeProps {
  status: "locked" | "available" | "current" | "completed" | "perfect";
  position: "left" | "center" | "right";
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  isChest?: boolean;
  progress?: number; // 0-100 for ring progress
}

export const LessonNode = ({
  status,
  position,
  onClick,
  icon,
  label,
  isChest = false,
  progress = 0
}: LessonNodeProps) => {
  const positionOffset = {
    left: "-translate-x-16",
    center: "translate-x-0",
    right: "translate-x-16"
  };

  const statusStyles = {
    locked: "bg-muted border-muted-foreground/30 text-muted-foreground cursor-not-allowed",
    available: "bg-secondary border-border text-foreground cursor-pointer hover:scale-105",
    current: "bg-primary border-primary text-primary-foreground cursor-pointer hover:scale-105 ring-4 ring-primary/30 animate-pulse",
    completed: "bg-success border-success text-success-foreground cursor-pointer hover:scale-105",
    perfect: "bg-warning border-warning text-warning-foreground cursor-pointer hover:scale-105"
  };

  const renderIcon = () => {
    if (isChest) {
      return <Trash2 className="w-8 h-8" />;
    }
    if (status === "locked") {
      return <Lock className="w-6 h-6" />;
    }
    if (status === "completed") {
      return <Check className="w-8 h-8" />;
    }
    if (status === "perfect") {
      return <Crown className="w-8 h-8" />;
    }
    if (icon) {
      return icon;
    }
    return <Star className="w-8 h-8" />;
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("flex flex-col items-center", positionOffset[position])}
    >
      <button
        onClick={status !== "locked" ? onClick : undefined}
        className={cn(
          "relative w-16 h-16 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center transition-all duration-200",
          "shadow-[0_4px_0_0_rgba(0,0,0,0.2)]",
          "active:translate-y-1 active:shadow-none",
          statusStyles[status]
        )}
        disabled={status === "locked"}
      >
        {/* Progress ring */}
        {progress > 0 && progress < 100 && (
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
              strokeWidth="8"
              strokeDasharray={`${progress * 2.89} 289`}
              className="text-primary/30"
            />
          </svg>
        )}
        {renderIcon()}
      </button>
      {label && (
        <span className={cn(
          "mt-2 text-xs font-medium text-center max-w-[80px]",
          status === "locked" ? "text-muted-foreground" : "text-foreground"
        )}>
          {label}
        </span>
      )}
    </motion.div>
  );
};
