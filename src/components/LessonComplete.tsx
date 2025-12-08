import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ArrowRight, Home } from "lucide-react";
import { getNextLesson, lessonRouteToId } from "@/lib/lessonNavigation";

interface LessonCompleteProps {
  lessonKey: string;
  score: number;
  correctAnswers?: number;
  totalQuestions?: number;
  xpEarned: number;
}

export const LessonComplete = ({
  lessonKey,
  score,
  correctAnswers,
  totalQuestions,
  xpEarned,
}: LessonCompleteProps) => {
  const navigate = useNavigate();
  const lessonId = lessonRouteToId[lessonKey] || lessonKey;
  const nextLesson = getNextLesson(lessonId);

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="max-w-md w-full text-center animate-fade-in">
        <CardHeader>
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Lesson Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-primary">+{xpEarned} XP</p>
            {correctAnswers !== undefined && totalQuestions !== undefined && (
              <p className="text-muted-foreground">
                {correctAnswers}/{totalQuestions} correct answers
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {nextLesson.hasNext && nextLesson.nextRoute ? (
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => navigate(nextLesson.nextRoute!)}
              >
                Next: {nextLesson.nextTitle}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : null}
            
            <Button 
              variant={nextLesson.hasNext ? "outline" : "default"}
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
