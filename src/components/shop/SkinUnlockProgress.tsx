import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Lock, Trophy, ArrowRight } from "lucide-react";
import { ACHIEVEMENTS, SKIN_UNLOCK_CONDITIONS } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SkinUnlockProgressProps {
  skinId: string;
  progress: Record<string, number>;
  compact?: boolean;
  showNavigation?: boolean;
}

export const SkinUnlockProgress = ({ 
  skinId, 
  progress, 
  compact = false,
  showNavigation = true 
}: SkinUnlockProgressProps) => {
  const navigate = useNavigate();
  const unlockCondition = SKIN_UNLOCK_CONDITIONS[skinId];
  
  if (!unlockCondition) return null;
  
  const achievement = ACHIEVEMENTS.find(a => a.id === unlockCondition.achievementId);
  
  if (!achievement) return null;
  
  const currentProgress = progress[achievement.id] || 0;
  const percentage = Math.min((currentProgress / achievement.requirement) * 100, 100);
  const isComplete = currentProgress >= achievement.requirement;
  
  const handleNavigateToAchievements = () => {
    navigate("/achievements");
  };
  
  if (compact) {
    return (
      <div className="w-full space-y-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span className="truncate">{unlockCondition.description}</span>
        </div>
        <Progress value={percentage} className="h-1.5" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentProgress}/{achievement.requirement}</span>
          {showNavigation && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToAchievements();
              }}
              className="text-primary hover:underline flex items-center gap-0.5"
            >
              Track <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full space-y-2 p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        {isComplete ? (
          <Trophy className="w-4 h-4 text-primary" />
        ) : (
          <Lock className="w-4 h-4 text-muted-foreground" />
        )}
        <span className={cn(
          "text-sm font-medium flex-1",
          isComplete ? "text-primary" : "text-muted-foreground"
        )}>
          {unlockCondition.description}
        </span>
      </div>
      
      <div className="space-y-1">
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currentProgress} / {achievement.requirement}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      </div>
      
      {isComplete ? (
        <Button 
          onClick={handleNavigateToAchievements}
          size="sm"
          className="w-full gap-2"
        >
          <Trophy className="w-4 h-4" />
          Claim in Achievements
        </Button>
      ) : showNavigation ? (
        <Button 
          onClick={handleNavigateToAchievements}
          variant="outline"
          size="sm"
          className="w-full gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          Track Progress
        </Button>
      ) : null}
    </div>
  );
};
