import { cn } from "@/lib/utils";
import { Flame, Trophy, Target, Zap, Crown, Heart, BookOpen, Gift } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuests } from "@/hooks/useQuests";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface RightSidebarProps {
  className?: string;
}

const getQuestIcon = (actionType: string) => {
  switch (actionType) {
    case "earn_xp":
      return Zap;
    case "complete_lesson":
      return BookOpen;
    case "maintain_streak":
      return Flame;
    case "complete_quiz":
      return Trophy;
    default:
      return Target;
  }
};

const getQuestColor = (actionType: string) => {
  switch (actionType) {
    case "earn_xp":
      return "text-primary";
    case "complete_lesson":
      return "text-success";
    case "maintain_streak":
      return "text-warning";
    case "complete_quiz":
      return "text-purple-500";
    default:
      return "text-muted-foreground";
  }
};

export function RightSidebar({ className }: RightSidebarProps) {
  const { profile } = useAuth();
  const { dailyQuests, loading: questsLoading } = useQuests();

  // Show first 3 daily quests
  const displayQuests = dailyQuests.slice(0, 3);

  return (
    <aside className={cn(
      "hidden xl:flex flex-col w-80 h-screen sticky top-0 bg-card border-l border-border p-4 gap-4",
      className
    )}>
      {/* Mascot greeting */}
      <div className="bg-accent rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl"
          >
            🦝
          </motion.span>
          <div>
            <p className="font-bold text-sm">Keep it up!</p>
            <p className="text-xs text-muted-foreground">You're doing great today</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-accent rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer"
        >
          <Flame className="w-8 h-8 text-warning" />
          <span className="text-2xl font-bold">{profile?.streak || 0}</span>
          <span className="text-xs text-muted-foreground font-semibold">Day streak</span>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-accent rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer"
        >
          <Zap className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold">{profile?.xp || 0}</span>
          <span className="text-xs text-muted-foreground font-semibold">Total XP</span>
        </motion.div>
      </div>

      {/* Hearts */}
      <div className="bg-accent rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">Hearts</span>
          <span className="text-xs text-muted-foreground">{profile?.is_premium ? "UNLIMITED" : "5/5"}</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Heart key={i} className="w-6 h-6 text-error fill-error" />
          ))}
        </div>
      </div>

      {/* Daily Quests */}
      <div className="bg-accent rounded-xl p-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Daily Quests</h3>
          <Link to="/quests" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="space-y-4">
          {questsLoading ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              Loading quests...
            </div>
          ) : displayQuests.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              No quests available
            </div>
          ) : (
            displayQuests.map((userQuest) => {
              const Icon = getQuestIcon(userQuest.quest.action_type);
              const colorClass = getQuestColor(userQuest.quest.action_type);
              const progress = Math.min(100, (userQuest.current_count / userQuest.quest.target_count) * 100);
              const isComplete = userQuest.completed;
              
              return (
                <div key={userQuest.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isComplete ? "bg-success/20" : "bg-card"
                    )}>
                      <Icon className={cn("w-5 h-5", isComplete ? "text-success" : colorClass)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{userQuest.quest.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {userQuest.current_count} / {userQuest.quest.target_count}
                      </p>
                    </div>
                    {isComplete ? (
                      <span className="text-success text-lg">✓</span>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <Gift className="w-3 h-3" />
                        <span>+{userQuest.quest.xp_reward}</span>
                      </div>
                    )}
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Premium upsell */}
      {!profile?.is_premium && (
        <Link to="/premium">
          <div className="bg-gradient-to-r from-warning/20 to-warning/10 rounded-xl p-4 border-2 border-warning/30 hover:border-warning transition-colors">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-warning" />
              <div>
                <p className="font-bold text-sm">Try Super SHPOKO</p>
                <p className="text-xs text-muted-foreground">No ads & unlimited hearts</p>
              </div>
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
}
