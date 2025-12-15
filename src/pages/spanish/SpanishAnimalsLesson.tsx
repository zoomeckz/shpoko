import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, X } from "lucide-react";
import { spanishAnimalsData } from "@/data/spanishLessons";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { LessonComplete } from "@/components/LessonComplete";
import { useLessonKeyboardNavigation } from "@/hooks/useLessonKeyboardNavigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const LESSON_ID = "spanish-animals";
const XP_REWARD = 65;

const SpanishAnimalsLesson = () => {
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
  const { canEarnXP, refetch } = useUserProgress();
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const totalSteps = spanishAnimalsData.length;
  const currentAnimal = spanishAnimalsData[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isRevision = !canEarnXP(LESSON_ID);

  useEffect(() => {
    if (!isComplete && isCorrect === null) {
      const timer = setTimeout(() => { inputRef.current?.focus(); }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isComplete, isCorrect]);

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    const correct = userAnswer.toLowerCase().trim() === currentAnimal.spanish.toLowerCase();
    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const nextStep = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      setUserAnswer("");
      setIsCorrect(null);
    } else {
      let xpEarned = 0;
      if (!isRevision && user?.id) {
        xpEarned = Math.round((correctAnswers / totalSteps) * XP_REWARD);
        await updateXP(xpEarned);
        await supabase.from("user_progress").upsert({
          user_id: user.id, lesson_id: LESSON_ID, completed: true, score: xpEarned,
          correct_answers: correctAnswers, total_answers: totalSteps, completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
        refetch();
      }
      setEarnedXP(xpEarned);
      setIsComplete(true);
    }
  };

  useLessonKeyboardNavigation({ isAnswered: isCorrect !== null, onNext: nextStep, disabled: isComplete });

  if (isComplete) {
    return <LessonComplete lessonKey={LESSON_ID} score={earnedXP} xpEarned={earnedXP} correctAnswers={correctAnswers} totalQuestions={totalSteps} isRevision={isRevision} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1"><Progress value={progress} className="h-3" /></div>
          <span className="text-sm font-medium">{currentStep + 1}/{totalSteps}</span>
          {isRevision && <span className="text-xs bg-muted px-2 py-1 rounded">Ревизия</span>}
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-center">Животни на испански</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">{currentAnimal.emoji}</div>
              <p className="text-xl text-muted-foreground mb-2">На български: <span className="font-semibold">{currentAnimal.bulgarian}</span></p>
              <p className="text-lg text-muted-foreground">Произношение: <span className="font-semibold">{currentAnimal.pronunciation}</span></p>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-center">Напиши животното на испански:</p>
              <Input ref={inputRef} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Напиши тук..."
                className={cn("text-center text-xl py-6", isCorrect === true && "border-green-500 bg-green-500/10", isCorrect === false && "border-red-500 bg-red-500/10")}
                disabled={isCorrect !== null}
                onKeyDown={(e) => { if (e.key === "Enter") { if (isCorrect !== null) nextStep(); else if (userAnswer.trim()) checkAnswer(); }}}
              />
              {isCorrect !== null && (
                <div className={cn("flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in", isCorrect ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600")}>
                  {isCorrect ? <><Check className="w-6 h-6" /><span className="font-bold">Правилно!</span></> : <><X className="w-6 h-6" /><span className="font-bold">Отговорът е: {currentAnimal.spanish}</span></>}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {isCorrect === null ? <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="w-full">Провери</Button>
                : <Button onClick={nextStep} className="w-full">{currentStep < totalSteps - 1 ? "Следващ" : "Завърши"}</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpanishAnimalsLesson;
