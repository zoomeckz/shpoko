import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Crown, Lock, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Question {
  bulgarian: string;
  options: string[];
  correctIndex: number;
}

const questions: Question[] = [
  {
    bulgarian: "Вода",
    options: ["Water", "Fire", "Air", "Earth"],
    correctIndex: 0,
  },
  {
    bulgarian: "Хляб",
    options: ["Meat", "Cheese", "Bread", "Milk"],
    correctIndex: 2,
  },
  {
    bulgarian: "Къща",
    options: ["Car", "House", "Tree", "Book"],
    correctIndex: 1,
  },
  {
    bulgarian: "Слънце",
    options: ["Moon", "Star", "Cloud", "Sun"],
    correctIndex: 3,
  },
  {
    bulgarian: "Приятел",
    options: ["Enemy", "Friend", "Stranger", "Family"],
    correctIndex: 1,
  },
  {
    bulgarian: "Любов",
    options: ["Hate", "Fear", "Joy", "Love"],
    correctIndex: 3,
  },
  {
    bulgarian: "Книга",
    options: ["Book", "Pen", "Paper", "Desk"],
    correctIndex: 0,
  },
  {
    bulgarian: "Време",
    options: ["Space", "Time", "Place", "Way"],
    correctIndex: 1,
  },
];

export const ChooseWordLesson = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, updateXP } = useAuth();

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  
  // Check if user has premium access
  const hasPremiumAccess = profile?.is_premium;

  const playPronunciation = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text, voice: "alloy" },
      });
      
      if (error) throw error;
      
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.play();
    } catch (error) {
      console.error("Error playing pronunciation:", error);
    }
  };

  const selectAnswer = (index: number) => {
    if (isCorrect !== null) return;
    
    setSelectedAnswer(index);
    const correct = index === currentQuestion.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 10);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setScore(score + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Lesson complete
      if (user) {
        await updateXP(score);
        
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_id: "choose-word-premium",
          completed: true,
          score: score,
          correct_answers: correctAnswers,
          total_answers: questions.length,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' });
      }
      
      toast({
        title: "Lesson Complete! 🎉",
        description: `You scored ${score} XP with ${correctAnswers}/${questions.length} correct answers!`,
      });
      navigate("/");
    }
  };

  if (!hasPremiumAccess) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Premium Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This lesson is available for premium subscribers only.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
                Go Back
              </Button>
              <Button onClick={() => navigate("/premium")} className="flex-1">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <Progress value={progress} className="h-3" />
          </div>
          <div className="flex items-center gap-1">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Premium</span>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Choose the correct translation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <p className="text-5xl font-bold">{currentQuestion.bulgarian}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => playPronunciation(currentQuestion.bulgarian)}
                >
                  <Volume2 className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => selectAnswer(index)}
                  disabled={isCorrect !== null}
                  className={cn(
                    "py-6 text-lg transition-all",
                    selectedAnswer === index && isCorrect && "bg-green-500 text-white border-green-500",
                    selectedAnswer === index && !isCorrect && "bg-red-500 text-white border-red-500",
                    isCorrect !== null && index === currentQuestion.correctIndex && selectedAnswer !== index && "border-green-500 border-2"
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>

            {isCorrect !== null && (
              <div className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
              )}>
                {isCorrect ? (
                  <>
                    <Check className="w-6 h-6" />
                    <span className="font-bold">Correct! +10 XP</span>
                  </>
                ) : (
                  <>
                    <X className="w-6 h-6" />
                    <span className="font-bold">
                      The answer is: {currentQuestion.options[currentQuestion.correctIndex]}
                    </span>
                  </>
                )}
              </div>
            )}

            {isCorrect !== null && (
              <Button onClick={nextQuestion} className="w-full">
                {currentStep < questions.length - 1 ? "Next" : "Complete Lesson"}
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>Score: {score} XP | Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default ChooseWordLesson;
