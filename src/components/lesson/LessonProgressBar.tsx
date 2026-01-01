import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonProgressBarProps {
  current: number;
  total: number;
  hearts: number;
  maxHearts?: number;
  onClose?: () => void;
}

export function LessonProgressBar({ 
  current, 
  total, 
  hearts, 
  maxHearts = 5,
  onClose 
}: LessonProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-1">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ 
                scale: i < hearts ? 1 : 0.8,
                opacity: i < hearts ? 1 : 0.3
              }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <Heart 
                className={cn(
                  "w-6 h-6 transition-colors",
                  i < hearts ? "text-error fill-error" : "text-muted-foreground"
                )} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
