import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Lock, Sparkles, Star, BookOpen, MessageCircle, Mic, Headphones, PenTool } from "lucide-react";
import { lessons, Lesson } from "@/data/lessons";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGuest } from "@/contexts/GuestContext";
import { useAuth } from "@/contexts/AuthContext";
import { GuestUpgradePrompt } from "@/components/onboarding/GuestUpgradePrompt";
import { cn } from "@/lib/utils";
import { useState } from "react";

const categoryIcon: Record<string, React.ReactNode> = {
  vocabulary: <BookOpen className="w-4 h-4" />,
  grammar: <PenTool className="w-4 h-4" />,
  speaking: <Mic className="w-4 h-4" />,
  listening: <Headphones className="w-4 h-4" />,
  conversation: <MessageCircle className="w-4 h-4" />,
  default: <Star className="w-4 h-4" />,
};

const tiers: { id: Lesson["difficulty"]; label: string; emoji: string; tagline: string; tone: string }[] = [
  { id: "beginner", label: "Beginner", emoji: "🌱", tagline: "Start here — basics & first words", tone: "from-success/20 to-success/5 border-success/40" },
  { id: "intermediate", label: "Intermediate", emoji: "🔥", tagline: "Grammar, longer phrases, more vocab", tone: "from-warning/20 to-warning/5 border-warning/40" },
  { id: "advanced", label: "Advanced", emoji: "👑", tagline: "Complex grammar & native-style speech", tone: "from-primary/20 to-primary/5 border-primary/40" },
];

interface LessonBrowseProps {
  className?: string;
}

export const LessonBrowse = ({ className }: LessonBrowseProps) => {
  const navigate = useNavigate();
  const { isLessonCompleted, getLessonProgress } = useUserProgress();
  const { isGuest } = useGuest();
  const { user } = useAuth();
  const [upgradePrompt, setUpgradePrompt] = useState<{ open: boolean; label: string }>({
    open: false,
    label: "this lesson",
  });

  const isLockedForGuest = (lesson: Pick<Lesson, "difficulty">) =>
    !user && isGuest && lesson.difficulty !== "beginner";

  const grouped = tiers.map((tier) => ({
    ...tier,
    items: lessons.filter((l) => l.difficulty === tier.id),
  }));

  return (
    <div className={cn("flex flex-col gap-8 py-6 w-full max-w-2xl mx-auto px-4", className)}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-xl font-extrabold uppercase tracking-wide">Pick any lesson</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Free-form learning — jump into whatever you want by difficulty.
        </p>
      </motion.div>

      {grouped.map((tier, tierIdx) => (
        <motion.section
          key={tier.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: tierIdx * 0.08 }}
          className={cn(
            "rounded-2xl border-2 bg-gradient-to-b p-4 shadow-[0_4px_0_0_hsl(var(--border))]",
            tier.tone
          )}
        >
          <header className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tier.emoji}</span>
              <div>
                <h3 className="font-extrabold uppercase tracking-wide text-sm">{tier.label}</h3>
                <p className="text-xs text-muted-foreground">{tier.tagline}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              {tier.items.filter((l) => isLessonCompleted(l.id)).length}/{tier.items.length}
            </span>
          </header>

          {tier.items.length === 0 ? (
            <p className="text-sm text-muted-foreground italic px-2 py-3">No lessons in this tier yet.</p>
          ) : (
            <ul className="grid gap-2">
              {tier.items.map((lesson) => {
                const completed = isLessonCompleted(lesson.id);
                const progress = getLessonProgress(lesson.id);
                const guestLocked = isLockedForGuest(lesson);
                const icon = categoryIcon[lesson.category?.toLowerCase() || "default"] || categoryIcon.default;

                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (guestLocked) {
                          setUpgradePrompt({ open: true, label: lesson.title });
                          return;
                        }
                        navigate(lesson.route || "/learn");
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl border-2 bg-card px-3 py-3 text-left transition-all",
                        "hover:bg-accent hover:-translate-y-0.5 active:translate-y-0",
                        completed && "border-success/50",
                        !completed && "border-border",
                        guestLocked && "opacity-80"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          completed ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {completed ? <Check className="w-5 h-5" /> : icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm truncate">{lesson.title}</span>
                          {progress === 100 && (
                            <Sparkles className="w-3.5 h-3.5 text-warning shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {lesson.category}
                          {progress > 0 && progress < 100 && ` • ${progress}%`}
                        </p>
                      </div>

                      {guestLocked ? (
                        <span className="flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                          <Lock className="w-2.5 h-2.5" />
                          Register
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">
                          {completed ? "✓" : "→"}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.section>
      ))}

      <GuestUpgradePrompt
        open={upgradePrompt.open}
        onClose={() => setUpgradePrompt({ open: false, label: "this lesson" })}
        contentLabel={upgradePrompt.label}
      />
    </div>
  );
};
