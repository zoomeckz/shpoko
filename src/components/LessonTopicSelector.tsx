import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Star, Lock, Check, Flame, RotateCcw, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { lessons, Lesson } from "@/data/lessons";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useStreakUnlocks } from "@/hooks/useStreakUnlocks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const categories = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "premium", label: "Premium" },
];

const getLessonsByDifficulty = (difficulty: string) => {
  if (difficulty === "premium") {
    return lessons.filter(l => l.isPremium);
  }
  return lessons.filter(l => l.difficulty === difficulty && !l.isPremium);
};

interface LessonItemProps {
  lesson: Lesson;
  isCompleted: boolean;
  onClick: () => void;
  premiumIndex?: number;
}

const LessonItem = ({ lesson, isCompleted, onClick, premiumIndex }: LessonItemProps) => {
  const { profile } = useAuth();
  const { isPremiumLessonUnlocked, daysUntilNextUnlock, unlockedPremiumLessons } = useStreakUnlocks();
  const { canEarnXP } = useUserProgress();
  
  const isPremium = lesson.isPremium;
  const hasFullPremium = profile?.is_premium;
  const isRevisionOnly = isCompleted && !canEarnXP(lesson.id);
  
  // Check if this premium lesson is unlocked via streak
  const isUnlockedByStreak = isPremium && premiumIndex !== undefined && isPremiumLessonUnlocked(premiumIndex);
  const isLocked = isPremium && !hasFullPremium && !isUnlockedByStreak;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={isLocked ? undefined : onClick}
          className={cn(
            "p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3",
            isCompleted && "border-green-500 bg-green-500/10",
            !isCompleted && !isLocked && "hover:border-primary hover:bg-accent/50",
            isLocked && "opacity-60 cursor-not-allowed",
            isUnlockedByStreak && !hasFullPremium && "border-warning/50 bg-warning/5"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            isCompleted ? "bg-green-500 text-white" : 
            isLocked ? "bg-muted text-muted-foreground" :
            isUnlockedByStreak && !hasFullPremium ? "bg-warning/20 text-warning" :
            "bg-primary/10 text-primary"
          )}>
            {isCompleted ? <Check className="w-4 h-4" /> : 
             isLocked ? <Lock className="w-4 h-4" /> : 
             isUnlockedByStreak && !hasFullPremium ? <Flame className="w-4 h-4" /> :
             <Star className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{lesson.title}</span>
              {lesson.isPremium && (
                <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              )}
              {isUnlockedByStreak && !hasFullPremium && (
                <Badge variant="outline" className="text-xs border-warning text-warning">
                  Streak
                </Badge>
              )}
              {isRevisionOnly && (
                <Badge variant="outline" className="text-xs border-muted-foreground text-muted-foreground">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Revise
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{lesson.description}</p>
          </div>
          <Badge variant="secondary" className="flex-shrink-0">
            {lesson.xpReward} XP
          </Badge>
        </div>
      </TooltipTrigger>
      {isLocked && (
        <TooltipContent>
          <p>Unlock with {(premiumIndex! + 1) * 5 - (profile?.streak || 0)} more streak days</p>
          <p className="text-xs text-muted-foreground">or upgrade to Premium</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

// Check if all lessons in a tier are completed
const useTierCompletion = (tier: string) => {
  const { isLessonCompleted } = useUserProgress();
  const tierLessons = getLessonsByDifficulty(tier);
  const completedCount = tierLessons.filter(l => isLessonCompleted(l.id)).length;
  const totalCount = tierLessons.length;
  const isComplete = totalCount > 0 && completedCount === totalCount;
  
  return { isComplete, completedCount, totalCount };
};

export const LessonTopicSelector = () => {
  const [selectedTab, setSelectedTab] = useState("beginner");
  const { isLessonCompleted } = useUserProgress();
  const { unlockedPremiumLessons, daysUntilNextUnlock } = useStreakUnlocks();
  const navigate = useNavigate();

  const beginnerCompletion = useTierCompletion("beginner");
  const intermediateCompletion = useTierCompletion("intermediate");
  const advancedCompletion = useTierCompletion("advanced");

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.route) {
      navigate(lesson.route);
    }
  };

  // Get max count to set consistent height
  const maxLessons = Math.max(...categories.map(cat => getLessonsByDifficulty(cat.id).length));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Lessons</h2>
        {unlockedPremiumLessons > 0 && (
          <Badge variant="outline" className="text-warning border-warning">
            <Flame className="w-3 h-3 mr-1" />
            {unlockedPremiumLessons} Premium Unlocked
          </Badge>
        )}
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div style={{ minHeight: `${maxLessons * 72 + 16}px` }}>
          {categories.map((cat) => {
            const tierCompletion = cat.id === "beginner" ? beginnerCompletion :
                                   cat.id === "intermediate" ? intermediateCompletion :
                                   cat.id === "advanced" ? advancedCompletion : null;
            
            return (
              <TabsContent key={cat.id} value={cat.id} className="space-y-2 mt-0">
                {/* Tier Assessment Link */}
                {tierCompletion && cat.id !== "premium" && (
                  <div className={cn(
                    "p-3 rounded-lg border-2 border-dashed transition-all",
                    tierCompletion.isComplete 
                      ? "border-primary bg-primary/5 cursor-pointer hover:bg-primary/10" 
                      : "border-muted bg-muted/30 opacity-60"
                  )}
                  onClick={tierCompletion.isComplete ? () => navigate(`/assessment/${cat.id}`) : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        tierCompletion.isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {tierCompletion.isComplete ? <GraduationCap className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium capitalize">{cat.id} Assessment</div>
                        <p className="text-xs text-muted-foreground">
                          {tierCompletion.isComplete 
                            ? "Test your knowledge of all lessons!" 
                            : `Complete ${tierCompletion.totalCount - tierCompletion.completedCount} more lessons to unlock`}
                        </p>
                      </div>
                      {tierCompletion.isComplete && (
                        <Badge className="bg-primary">Take Test</Badge>
                      )}
                    </div>
                  </div>
                )}

                {getLessonsByDifficulty(cat.id).map((lesson, index) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isCompleted={isLessonCompleted(lesson.id)}
                    onClick={() => handleLessonClick(lesson)}
                    premiumIndex={cat.id === "premium" ? index : undefined}
                  />
                ))}
                {cat.id === "premium" && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    <Flame className="w-3 h-3 inline mr-1" />
                    Every 5 streak days unlocks 1 premium lesson!
                    {daysUntilNextUnlock > 0 && ` (${daysUntilNextUnlock} days to next)`}
                  </p>
                )}
                {getLessonsByDifficulty(cat.id).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No lessons available in this category yet.
                  </p>
                )}
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </Card>
  );
};
