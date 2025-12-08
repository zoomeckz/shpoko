import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { lessons, Lesson } from "@/data/lessons";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAuth } from "@/contexts/AuthContext";

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
}

const LessonItem = ({ lesson, isCompleted, onClick }: LessonItemProps) => {
  const { profile } = useAuth();
  const isPremiumLocked = lesson.isPremium && !profile?.is_premium;

  return (
    <div
      onClick={isPremiumLocked ? undefined : onClick}
      className={cn(
        "p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3",
        isCompleted && "border-green-500 bg-green-500/10",
        !isCompleted && !isPremiumLocked && "hover:border-primary hover:bg-accent/50",
        isPremiumLocked && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isCompleted ? "bg-green-500 text-white" : 
        isPremiumLocked ? "bg-muted text-muted-foreground" : 
        "bg-primary/10 text-primary"
      )}>
        {isCompleted ? <Check className="w-4 h-4" /> : 
         isPremiumLocked ? <Lock className="w-4 h-4" /> : 
         <Star className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{lesson.title}</span>
          {lesson.isPremium && (
            <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{lesson.description}</p>
      </div>
      <Badge variant="secondary" className="flex-shrink-0">
        {lesson.xpReward} XP
      </Badge>
    </div>
  );
};

export const LessonTopicSelector = () => {
  const [selectedTab, setSelectedTab] = useState("beginner");
  const { isLessonCompleted } = useUserProgress();
  const navigate = useNavigate();

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.route) {
      navigate(lesson.route);
    }
  };

  // Get max count to set consistent height
  const maxLessons = Math.max(...categories.map(cat => getLessonsByDifficulty(cat.id).length));

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-3">Lessons</h2>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div style={{ minHeight: `${maxLessons * 72 + 16}px` }}>
          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="space-y-2 mt-0">
              {getLessonsByDifficulty(cat.id).map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  isCompleted={isLessonCompleted(lesson.id)}
                  onClick={() => handleLessonClick(lesson)}
                />
              ))}
              {getLessonsByDifficulty(cat.id).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No lessons available in this category yet.
                </p>
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </Card>
  );
};
