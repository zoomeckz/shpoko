import { cn } from "@/lib/utils";
import { Flame, Trophy, Target, Zap, Crown, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import shpokoHappy from "@/assets/shpoko-happy.png";

interface RightSidebarProps {
  className?: string;
  quests?: Array<{
    id: string;
    title: string;
    current: number;
    target: number;
    xpReward: number;
    icon: React.ReactNode;
  }>;
  leaguePosition?: number;
  leagueName?: string;
  leagueIcon?: string;
}

export const RightSidebar = ({
  className,
  quests = [],
  leaguePosition = 1,
  leagueName = "Bronze",
  leagueIcon = "🥉"
}: RightSidebarProps) => {
  const { profile } = useAuth();

  // Default quests if none provided
  const displayQuests = quests.length > 0 ? quests : [
    { id: "1", title: "Complete 1 lesson", current: 0, target: 1, xpReward: 10, icon: <Target className="w-5 h-5 text-primary" /> },
    { id: "2", title: "Earn 50 XP", current: profile?.xp || 0, target: 50, xpReward: 15, icon: <Zap className="w-5 h-5 text-warning" /> },
    { id: "3", title: "3-day streak", current: profile?.streak || 0, target: 3, xpReward: 25, icon: <Flame className="w-5 h-5 text-orange-500" /> },
  ];

  return (
    <aside className={cn(
      "hidden xl:flex flex-col w-80 h-screen sticky top-0 p-4 space-y-4 overflow-y-auto",
      className
    )}>
      {/* Mascot greeting */}
      <div className="bg-card rounded-2xl border-2 border-border p-4">
        <div className="flex items-start gap-3">
          <img 
            src={shpokoHappy} 
            alt="Shpoko" 
            className="w-16 h-16 object-contain animate-float"
          />
          <div className="flex-1">
            <p className="font-medium text-sm">
              {profile?.streak && profile.streak > 0 
                ? `Great job! ${profile.streak} day streak!` 
                : "Ready to learn today?"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Keep up the good work!
            </p>
          </div>
        </div>
      </div>

      {/* League position */}
      <Link to="/leaderboard" className="block">
        <div className="bg-card rounded-2xl border-2 border-border p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              {leagueName} League
            </h3>
            <span className="text-2xl">{leagueIcon}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">#{leaguePosition}</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <span className="text-xs text-muted-foreground">View leaderboard →</span>
          </div>
        </div>
      </Link>

      {/* Daily Quests */}
      <div className="bg-card rounded-2xl border-2 border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Daily Quests
          </h3>
          <Link to="/quests" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        
        <div className="space-y-3">
          {displayQuests.slice(0, 3).map((quest) => {
            const progressPercent = Math.min((quest.current / quest.target) * 100, 100);
            const isComplete = quest.current >= quest.target;
            
            return (
              <div key={quest.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isComplete ? "bg-success/20" : "bg-accent"
                  )}>
                    {quest.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isComplete && "line-through text-muted-foreground"
                    )}>
                      {quest.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {quest.current}/{quest.target} • +{quest.xpReward} XP
                    </p>
                  </div>
                  {isComplete && (
                    <div className="text-success">✓</div>
                  )}
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak freeze / power-ups */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20 p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-full">
            <Flame className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="font-bold text-sm">{profile?.streak || 0} Day Streak</p>
            <p className="text-xs text-muted-foreground">Keep learning to build your streak!</p>
          </div>
        </div>
      </div>

      {/* Premium upsell */}
      {!profile?.is_premium && (
        <Link to="/premium" className="block">
          <div className="bg-gradient-to-r from-warning/20 to-orange-500/20 rounded-2xl border-2 border-warning/30 p-4 hover:border-warning transition-colors">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-warning" />
              <div>
                <p className="font-bold text-sm">Unlock Premium</p>
                <p className="text-xs text-muted-foreground">
                  Unlimited hearts, no ads, and more!
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
};
