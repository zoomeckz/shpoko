import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Lock, Check, Flame, RotateCcw, GraduationCap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { lessons, Lesson } from "@/data/lessons";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useStreakUnlocks } from "@/hooks/useStreakUnlocks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "premium";

const difficulties: { id: DifficultyLevel; label: string; color: string; icon: string }[] = [
  { id: "beginner", label: "Beginner", color: "bg-green-500", icon: "🌱" },
  { id: "intermediate", label: "Intermediate", color: "bg-blue-500", icon: "📚" },
  { id: "advanced", label: "Advanced", color: "bg-purple-500", icon: "🎓" },
  { id: "premium", label: "Premium", color: "bg-yellow-500", icon: "👑" },
];

const getLessonsByDifficulty = (difficulty: string) => {
  if (difficulty === "premium") {
    return lessons.filter(l => l.isPremium);
  }
  return lessons.filter(l => l.difficulty === difficulty && !l.isPremium);
};

// Group lessons by category within a difficulty
const groupLessonsByCategory = (lessons: Lesson[]) => {
  const groups: Record<string, Lesson[]> = {};
  lessons.forEach(lesson => {
    const cat = lesson.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(lesson);
  });
  return groups;
};

interface LessonItemProps {
  lesson: Lesson;
  isCompleted: boolean;
  onClick: () => void;
  premiumIndex?: number;
}

const LessonItem = ({ lesson, isCompleted, onClick, premiumIndex }: LessonItemProps) => {
  const { profile } = useAuth();
  const { isPremiumLessonUnlocked } = useStreakUnlocks();
  const { canEarnXP } = useUserProgress();
  
  const isPremium = lesson.isPremium;
  const hasFullPremium = profile?.is_premium;
  const isRevisionOnly = isCompleted && !canEarnXP(lesson.id);
  
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

const useTierCompletion = (tier: string) => {
  const { isLessonCompleted } = useUserProgress();
  const tierLessons = getLessonsByDifficulty(tier);
  const completedCount = tierLessons.filter(l => isLessonCompleted(l.id)).length;
  const totalCount = tierLessons.length;
  const isComplete = totalCount > 0 && completedCount === totalCount;
  
  return { isComplete, completedCount, totalCount };
};

export const LessonTopicSelector = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const { isLessonCompleted } = useUserProgress();
  const { unlockedPremiumLessons, daysUntilNextUnlock } = useStreakUnlocks();
  const navigate = useNavigate();

  const beginnerCompletion = useTierCompletion("beginner");
  const intermediateCompletion = useTierCompletion("intermediate");
  const advancedCompletion = useTierCompletion("advanced");

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.route) {
      navigate(lesson.route, { state: { returnCategory: "lessons" } });
    }
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Difficulty selection view
  if (!selectedDifficulty) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center mb-6">Choose Your Level</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {difficulties.map((diff) => {
            const completion = diff.id === "beginner" ? beginnerCompletion :
                              diff.id === "intermediate" ? intermediateCompletion :
                              diff.id === "advanced" ? advancedCompletion : null;
            const lessonCount = getLessonsByDifficulty(diff.id).length;
            
            return (
              <Card 
                key={diff.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
                  "border-2 hover:border-primary",
                  diff.id === "premium" && "bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/30"
                )}
                onClick={() => setSelectedDifficulty(diff.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{diff.icon}</div>
                  <h3 className="font-bold text-lg mb-1">{diff.label}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {lessonCount} lessons
                  </p>
                  {completion && (
                    <Badge variant={completion.isComplete ? "default" : "secondary"} className="text-xs">
                      {completion.completedCount}/{completion.totalCount} completed
                    </Badge>
                  )}
                  {diff.id === "premium" && unlockedPremiumLessons > 0 && (
                    <Badge variant="outline" className="text-xs border-warning text-warning ml-2">
                      <Flame className="w-3 h-3 mr-1" />
                      {unlockedPremiumLessons} unlocked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Lessons view for selected difficulty
  const diffInfo = difficulties.find(d => d.id === selectedDifficulty)!;
  const diffLessons = getLessonsByDifficulty(selectedDifficulty);
  const groupedLessons = groupLessonsByCategory(diffLessons);
  const categories = Object.keys(groupedLessons).sort();
  
  const tierCompletion = selectedDifficulty === "beginner" ? beginnerCompletion :
                         selectedDifficulty === "intermediate" ? intermediateCompletion :
                         selectedDifficulty === "advanced" ? advancedCompletion : null;

  return (
    <div className="space-y-4">
      {/* Back button and header */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedDifficulty(null)}>
          ← Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{diffInfo.icon}</span>
          <h2 className="text-xl font-bold">{diffInfo.label} Lessons</h2>
        </div>
        {unlockedPremiumLessons > 0 && selectedDifficulty === "premium" && (
          <Badge variant="outline" className="text-warning border-warning ml-auto">
            <Flame className="w-3 h-3 mr-1" />
            {unlockedPremiumLessons} Unlocked
          </Badge>
        )}
      </div>

      {/* Tier Assessment */}
      {tierCompletion && selectedDifficulty !== "premium" && (
        <Card className={cn(
          "border-2 border-dashed transition-all",
          tierCompletion.isComplete 
            ? "border-primary bg-primary/5 cursor-pointer hover:bg-primary/10" 
            : "border-muted bg-muted/30 opacity-60"
        )}
        onClick={tierCompletion.isComplete ? () => navigate(`/assessment/${selectedDifficulty}`, { state: { returnCategory: "lessons" } }) : undefined}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                tierCompletion.isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {tierCompletion.isComplete ? <GraduationCap className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="font-bold capitalize">{selectedDifficulty} Assessment</div>
                <p className="text-sm text-muted-foreground">
                  {tierCompletion.isComplete 
                    ? "Test your knowledge of all lessons!" 
                    : `Complete ${tierCompletion.totalCount - tierCompletion.completedCount} more lessons to unlock`}
                </p>
              </div>
              {tierCompletion.isComplete && (
                <Badge className="bg-primary">Take Test</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons grouped by category */}
      {categories.map((category) => {
        const categoryLessons = groupedLessons[category];
        const completedInCategory = categoryLessons.filter(l => isLessonCompleted(l.id)).length;
        const isOpen = openCategories[category] ?? true; // Default open
        
        return (
          <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ChevronRight className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
                      {category}
                    </CardTitle>
                    <Badge variant="outline">
                      {completedInCategory}/{categoryLessons.length}
                    </Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2">
                  {categoryLessons.map((lesson, index) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      isCompleted={isLessonCompleted(lesson.id)}
                      onClick={() => handleLessonClick(lesson)}
                      premiumIndex={selectedDifficulty === "premium" ? 
                        lessons.filter(l => l.isPremium).indexOf(lesson) : undefined}
                    />
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      {selectedDifficulty === "premium" && (
        <p className="text-xs text-muted-foreground text-center py-2">
          <Flame className="w-3 h-3 inline mr-1" />
          Every 5 streak days unlocks 1 premium lesson!
          {daysUntilNextUnlock > 0 && ` (${daysUntilNextUnlock} days to next)`}
        </p>
      )}

      {diffLessons.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No lessons available in this category yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
