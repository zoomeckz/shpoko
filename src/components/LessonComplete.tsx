import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ArrowRight, ArrowLeft, Home, RotateCcw } from "lucide-react";
import { getLessonNavigation, lessonRouteToId } from "@/lib/lessonNavigation";
import { useUserProgress } from "@/hooks/useUserProgress";

interface LessonCompleteProps {
  lessonKey: string;
  score: number;
  correctAnswers?: number;
  totalQuestions?: number;
  xpEarned: number;
  isRevision?: boolean;
}

export const LessonComplete = ({
  lessonKey,
  score,
  correctAnswers,
  totalQuestions,
  xpEarned,
  isRevision = false,
}: LessonCompleteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const lessonId = lessonRouteToId[lessonKey] || lessonKey;
  const nav = getLessonNavigation(lessonId);
  const { progress } = useUserProgress();
  
  // Check if lesson was already completed before this session
  const wasAlreadyCompleted = progress[lessonId]?.completed;

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="max-w-md w-full text-center animate-fade-in">
        <CardHeader>
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isRevision || wasAlreadyCompleted ? "Revision Complete!" : "Lesson Complete!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            {isRevision || wasAlreadyCompleted ? (
              <p className="text-lg text-muted-foreground">Great practice session!</p>
            ) : (
              <p className="text-3xl font-bold text-primary">+{xpEarned} XP</p>
            )}
            {correctAnswers !== undefined && totalQuestions !== undefined && (
              <p className="text-muted-foreground">
                {correctAnswers}/{totalQuestions} correct answers
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              variant="outline"
              size="lg" 
              className="w-full"
              onClick={() => navigate(location.pathname)}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Revise Again
            </Button>
            
            {nav.hasNext && nav.nextRoute ? (
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => navigate(nav.nextRoute!)}
              >
                Next: {nav.nextTitle}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : null}

            {nav.hasPrev && nav.prevRoute ? (
              <Button 
                variant="outline"
                size="lg" 
                className="w-full"
                onClick={() => navigate(nav.prevRoute!)}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous: {nav.prevTitle}
              </Button>
            ) : null}
            
            <Button 
              variant="ghost"
              size="lg" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Lessons
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
