import { cn } from "@/lib/utils";
import { Flame, Trophy, Target, Zap, Crown, Heart, BookOpen, Gift, Award, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuests } from "@/hooks/useQuests";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { LeagueCard } from "@/components/league/LeagueCard";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";
import { WordOfTheDay } from "@/components/WordOfTheDay";

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
  const { playStreak, playXP } = useDuolingoSounds();

  // Show first 3 daily quests
  const displayQuests = dailyQuests.slice(0, 3);

  return (
    <aside className={cn(
      "hidden xl:flex flex-col w-80 h-screen sticky top-0 bg-card border-l border-border p-4 gap-4 overflow-y-auto",
      className
    )}>
      {/* Word of the Day */}
      <WordOfTheDay />

      {/* Stats cards with SFX */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => playStreak()}
          className="bg-gradient-to-br from-warning/20 to-warning/5 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer border border-warning/20"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Flame className="w-8 h-8 text-warning" />
          </motion.div>
          <span className="text-2xl font-bold">{profile?.streak || 0}</span>
          <span className="text-xs text-muted-foreground font-semibold">Day streak</span>
          {(profile?.streak || 0) >= 7 && (
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4 text-warning" />
            </motion.div>
          )}
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => playXP()}
          className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer border border-primary/20"
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
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Heart className="w-6 h-6 text-error fill-error" />
            </motion.div>
          ))}
          {profile?.is_premium && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xl ml-1">∞</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* League Card - Compact Version */}
      <LeagueCard compact />

      {/* Daily Quests */}
      <div className="bg-accent rounded-xl p-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Daily Quests
          </h3>
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
            displayQuests.map((userQuest, index) => {
              const Icon = getQuestIcon(userQuest.quest.action_type);
              const colorClass = getQuestColor(userQuest.quest.action_type);
              const progress = Math.min(100, (userQuest.current_count / userQuest.quest.target_count) * 100);
              const isComplete = userQuest.completed;
              
              return (
                <motion.div 
                  key={userQuest.id} 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        isComplete ? "bg-success/20" : "bg-card"
                      )}
                      animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className={cn("w-5 h-5", isComplete ? "text-success" : colorClass)} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{userQuest.quest.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {userQuest.current_count} / {userQuest.quest.target_count}
                      </p>
                    </div>
                    {isComplete ? (
                      <motion.span 
                        className="text-success text-lg"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        ✓
                      </motion.span>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <Gift className="w-3 h-3" />
                        <span>+{userQuest.quest.xp_reward}</span>
                      </div>
                    )}
                  </div>
                  <Progress value={progress} className="h-2" />
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Achievements Quick View */}
      <Link to="/achievements">
        <motion.div 
          className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl p-4 border border-purple-500/20 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-500" />
            <div>
              <p className="font-bold text-sm">Achievements</p>
              <p className="text-xs text-muted-foreground">View your badges</p>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Premium upsell */}
      {!profile?.is_premium && (
        <Link to="/premium">
          <motion.div 
            className="bg-gradient-to-r from-warning/20 to-warning/10 rounded-xl p-4 border-2 border-warning/30"
            whileHover={{ scale: 1.02, borderColor: "hsl(var(--warning))" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Crown className="w-8 h-8 text-warning" />
              </motion.div>
              <div>
                <p className="font-bold text-sm">Try Super SHPOKO</p>
                <p className="text-xs text-muted-foreground">No ads & unlimited hearts</p>
              </div>
            </div>
          </motion.div>
        </Link>
      )}
    </aside>
  );
}
