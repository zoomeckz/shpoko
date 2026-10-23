import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

/** "12 / 20 XP" progress toward today's goal. */
export function DailyGoalCard({
  today,
  goal,
  showLink = false,
  showTitle = true,
  className,
}: {
  today: number;
  goal: number;
  /** Adds a link to the profile, where the goal can be changed. */
  showLink?: boolean;
  /** Off when the page already has a "Daily goal" heading above the card. */
  showTitle?: boolean;
  className?: string;
}) {
  const reached = today >= goal;
  const pct = Math.min(100, Math.round((today / Math.max(1, goal)) * 100));

  return (
    <div className={cn("duo-card p-5", className)}>
      {showTitle && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-lg font-extrabold text-foreground">Daily goal</p>
          {showLink && (
            <Link to="/profile" className="text-sm font-extrabold uppercase tracking-wide text-primary hover:brightness-110">
              Edit goal
            </Link>
          )}
        </div>
      )}
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl",
            reached ? "bg-warning/20" : "bg-primary/15"
          )}
          aria-hidden="true"
        >
          {reached ? "🎉" : <Target className="w-6 h-6 text-primary" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground">
            {reached ? "Goal reached today!" : `Earn ${goal} XP today`}
          </p>
          <div
            className="mt-2 relative h-4 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={today}
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-label="XP earned today"
          >
            <motion.div
              className={cn("h-full rounded-full", reached ? "bg-warning" : "bg-primary")}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(pct, today > 0 ? 6 : 0)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-foreground/80">
              {today} / {goal} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
