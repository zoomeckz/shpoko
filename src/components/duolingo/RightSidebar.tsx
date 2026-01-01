import { cn } from "@/lib/utils";
import { Flame, Trophy, Target, Zap, Crown, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ShpokoLottie } from "./ShpokoLottie";
import { useState, useEffect } from "react";

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

// Greeting messages based on time of day and streak
const getGreeting = (streak: number, username?: string) => {
  const hour = new Date().getHours();
  const name = username ? `, ${username}` : "";
  
  if (streak >= 7) {
    return { text: `Amazing${name}! ${streak} day streak! 🔥`, mood: "celebrating" as const };
  }
  if (streak >= 3) {
    return { text: `Great job${name}! Keep it up!`, mood: "excited" as const };
  }
  if (hour < 12) {
    return { text: `Good morning${name}! Ready to learn?`, mood: "happy" as const };
  }
  if (hour < 18) {
    return { text: `Good afternoon${name}! Let's practice!`, mood: "encouraging" as const };
  }
  return { text: `Good evening${name}! Time for a lesson?`, mood: "happy" as const };
};

export const RightSidebar = ({
  className,
  quests = [],
  leaguePosition = 1,
  leagueName = "Bronze",
  leagueIcon = "🥉"
}: RightSidebarProps) => {
  const { profile } = useAuth();
  const [showSpeech, setShowSpeech] = useState(true);
  
  const greeting = getGreeting(profile?.streak || 0, profile?.username);

  // Hide speech bubble after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSpeech(false), 5000);
    return () => clearTimeout(timer);
  }, []);

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
      {/* Animated Mascot greeting */}
      <div className="bg-card rounded-2xl border-2 border-border p-4">
        <div className="flex items-center gap-4">
          <ShpokoLottie 
            mood={greeting.mood}
            size="md"
            showSpeechBubble={showSpeech}
            speechText={greeting.text}
            onClick={() => setShowSpeech(true)}
          />
          <div className="flex-1">
            <p className="font-medium text-sm">{greeting.text}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tap me for encouragement!
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
