import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LessonComplete } from "@/components/LessonComplete";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useLessonKeyboardNavigation } from "@/hooks/useLessonKeyboardNavigation";

interface Question {
  emoji: string;
  bulgarian: string;
  answer: string;
}

const LESSON_ID = "directions-intermediate";
const XP_REWARD = 80;

const directionData = [
  { emoji: "⬅️", bulgarian: "Ляво", answer: "lyavo" },
  { emoji: "➡️", bulgarian: "Дясно", answer: "dyasno" },
  { emoji: "⬆️", bulgarian: "Напред", answer: "napred" },
  { emoji: "⬇️", bulgarian: "Назад", answer: "nazad" },
  { emoji: "↖️", bulgarian: "Горе вляво", answer: "gore vlyavo" },
  { emoji: "↗️", bulgarian: "Горе вдясно", answer: "gore vdyasno" },
  { emoji: "↙️", bulgarian: "Долу вляво", answer: "dolu vlyavo" },
  { emoji: "↘️", bulgarian: "Долу вдясно", answer: "dolu vdyasno" },
  { emoji: "🔄", bulgarian: "Обратно", answer: "obratno" },
  { emoji: "📍", bulgarian: "Тук", answer: "tuk" },
  { emoji: "🎯", bulgarian: "Там", answer: "tam" },
  { emoji: "🚶", bulgarian: "Право", answer: "pravo" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const DirectionsIntermediateLesson = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isRevision, setIsRevision] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateXP } = useAuth();
  const { canEarnXP, isLessonCompleted, refetch } = useUserProgress();

  useEffect(() => {
    setQuestions(shuffleArray(directionData).slice(0, 10));
    setIsRevision(isLessonCompleted(LESSON_ID));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const currentQuestion = questions[currentStep];
  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

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

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase();
    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserAnswer("");
      setIsCorrect(null);
    } else {
      const canEarn = canEarnXP(LESSON_ID);
      let xpEarned = 0;
      
      if (canEarn && !isRevision && user?.id) {
        const baseXP = Math.round((correctAnswers / questions.length) * XP_REWARD);
        xpEarned = baseXP;
        await updateXP(xpEarned);
        
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_id: LESSON_ID,
          completed: true,
          score: xpEarned,
          correct_answers: correctAnswers,
          total_answers: questions.length,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
        
        refetch();
      }
      
      setEarnedXP(xpEarned);
      setIsComplete(true);
    }
  };

  useLessonKeyboardNavigation({
    isAnswered: isCorrect !== null,
    onNext: nextQuestion,
    disabled: isComplete,
  });

  const handleBack = () => {
    navigate("/", { state: { selectedCategory: location.state?.selectedCategory || "lessons" } });
  };

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey={LESSON_ID}
        score={earnedXP}
        xpEarned={earnedXP}
        correctAnswers={correctAnswers}
        totalQuestions={questions.length}
        isRevision={isRevision}
      />
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <Progress value={progress} className="h-3" />
          </div>
          <span className="text-sm font-medium">{currentStep + 1}/{questions.length}</span>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              Type the direction in romanized Bulgarian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-6xl mb-4">{currentQuestion.emoji}</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-3xl font-bold">{currentQuestion.bulgarian}</p>
                <Button variant="ghost" size="icon" onClick={() => playPronunciation(currentQuestion.bulgarian)}>
                  <Volume2 className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <Input
              ref={inputRef}
              type="text"
              placeholder="Type the transliteration..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isCorrect !== null}
              className={cn(
                "text-center text-xl py-6",
                isCorrect === true && "border-green-500 bg-green-500/10",
                isCorrect === false && "border-red-500 bg-red-500/10"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isCorrect === null && userAnswer.trim()) checkAnswer();
              }}
            />

            {isCorrect !== null && (
              <div className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
              )}>
                {isCorrect ? (
                  <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
                ) : (
                  <><X className="w-6 h-6" /><span className="font-bold">The answer is: {currentQuestion.answer}</span></>
                )}
              </div>
            )}

            {isCorrect === null ? (
              <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="w-full">
                Check
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="w-full">
                {currentStep < questions.length - 1 ? "Next" : "Complete Lesson"}
              </Button>
            )}
          </CardContent>
        </Card>
        <div className="text-center text-muted-foreground">
          <p>Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default DirectionsIntermediateLesson;
