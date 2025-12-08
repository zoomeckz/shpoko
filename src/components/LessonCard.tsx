import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Lock, Check, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  title: string;
  description: string;
  level: number;
  xpReward: number;
  progress: number; // 0-100
  status: "locked" | "available" | "completed";
  difficulty: "beginner" | "intermediate" | "advanced";
  isPremium?: boolean;
  onClick?: () => void;
}

export const LessonCard = ({
  title,
  description,
  level,
  xpReward,
  progress,
  status,
  difficulty,
  isPremium,
  onClick
}: LessonCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-success text-success-foreground";
      case "intermediate": return "bg-warning text-warning-foreground";
      case "advanced": return "bg-error text-error-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "locked": return <Lock className="w-5 h-5" />;
      case "completed": return <Check className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  return (
    <Card
      className={cn(
        "p-6 cursor-pointer transition-all duration-200 hover:shadow-soft border-2",
        status === "locked" && "opacity-60 cursor-not-allowed",
        status === "completed" && "border-green-500 bg-green-500/5 ring-2 ring-green-500/30",
        status === "available" && "hover:border-primary hover:shadow-glow"
      )}
      onClick={status !== "locked" ? onClick : undefined}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            status === "completed" ? "bg-green-500 text-white" :
            status === "locked" ? "bg-muted text-muted-foreground" :
            "bg-primary text-primary-foreground"
          )}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">Level {level}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      {status !== "locked" && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                status === "completed" ? "bg-green-500" : "bg-gradient-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-warning fill-warning" />
          <span className="text-sm font-medium">{xpReward} XP</span>
        </div>
        
        <Button 
          variant={status === "completed" ? "secondary" : "default"}
          size="sm"
          disabled={status === "locked"}
          className={cn(
            status === "available" && "bg-gradient-primary hover:opacity-90",
            status === "completed" && "bg-green-500 hover:bg-green-600 text-white"
          )}
        >
          {status === "completed" ? "Review" : 
           status === "locked" ? "Locked" : "Start"}
        </Button>
      </div>
    </Card>
  );
};
