import { Heart, Flame, Trophy } from "lucide-react";
import { ProgressCircle } from "@/components/ui/progress-circle";
import raccoonMascot from "@/assets/raccoon-mascot.png";

interface HeaderProps {
  streak: number;
  hearts: number;
  xp: number;
  dailyGoalProgress: number;
}

export const Header = ({ streak, hearts, xp, dailyGoalProgress }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border">
      <div className="flex items-center gap-4">
        <img src={raccoonMascot} alt="Raccoon mascot" className="w-12 h-12" />
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Raccoonie
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Daily Goal Progress */}
        <div className="flex items-center gap-2">
          <ProgressCircle progress={dailyGoalProgress} size={40} strokeWidth={4} />
          <span className="text-sm font-medium text-muted-foreground">Daily Goal</span>
        </div>
        
        {/* Streak */}
        <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
          <Flame className="w-5 h-5 text-warning" />
          <span className="font-bold">{streak}</span>
        </div>
        
        {/* Hearts */}
        <div className="flex items-center gap-2 px-3 py-2 bg-error/10 rounded-lg">
          <Heart className="w-5 h-5 text-error fill-error" />
          <span className="font-bold text-error">{hearts}</span>
        </div>
        
        {/* XP */}
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-bold text-primary">{xp} XP</span>
        </div>
      </div>
    </header>
  );
};