import { cn } from "@/lib/utils";
import { Flame, Trophy, Target, Zap, Crown, TrendingUp, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface RightSidebarProps {
  className?: string;
}

export function RightSidebar({ className }: RightSidebarProps) {
  const { profile } = useAuth();

  // Sample daily quests
  const quests = [
    { id: 1, title: "Earn 50 XP", current: Math.min(profile?.xp || 0, 50), target: 50, icon: Zap, color: "text-primary" },
    { id: 2, title: "Complete 3 lessons", current: 1, target: 3, icon: Target, color: "text-success" },
    { id: 3, title: "Get a 3-day streak", current: Math.min(profile?.streak || 0, 3), target: 3, icon: Flame, color: "text-warning" },
  ];

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
          {quests.map((quest) => {
            const Icon = quest.icon;
            const progress = (quest.current / quest.target) * 100;
            const isComplete = quest.current >= quest.target;
            
            return (
              <div key={quest.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isComplete ? "bg-success/20" : "bg-card"
                  )}>
                    <Icon className={cn("w-5 h-5", isComplete ? "text-success" : quest.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{quest.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {quest.current} / {quest.target}
                    </p>
                  </div>
                  {isComplete && <span className="text-success text-lg">✓</span>}
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })}
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
