import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface Question {
  bulgarian: string;
  answer: string;
  hint: string;
  color: string;
}

const LESSON_ID = "colors-topic";
const XP_REWARD = 65;

const questions: Question[] = [
  { bulgarian: "Червено", answer: "cherveno", hint: "Red", color: "#ef4444" },
  { bulgarian: "Синьо", answer: "sinyo", hint: "Blue", color: "#3b82f6" },
  { bulgarian: "Зелено", answer: "zeleno", hint: "Green", color: "#22c55e" },
  { bulgarian: "Жълто", answer: "zhalto", hint: "Yellow", color: "#eab308" },
  { bulgarian: "Оранжево", answer: "oranzhevo", hint: "Orange", color: "#f97316" },
  { bulgarian: "Лилаво", answer: "lilavo", hint: "Purple", color: "#a855f7" },
  { bulgarian: "Розово", answer: "rozovo", hint: "Pink", color: "#ec4899" },
  { bulgarian: "Кафяво", answer: "kafyavo", hint: "Brown", color: "#92400e" },
  { bulgarian: "Черно", answer: "cherno", hint: "Black", color: "#171717" },
  { bulgarian: "Бяло", answer: "byalo", hint: "White", color: "#f5f5f5" },
];

export const ColorsLesson = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
  const { canEarnXP, refetch } = useUserProgress();

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

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
    const isAnswerCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    if (isAnswerCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserAnswer("");
      setIsCorrect(null);
      setShowHint(false);
      setUsedHint(false);
    } else {
      // Lesson complete - calculate and award XP
      const canEarn = canEarnXP(LESSON_ID);
      let xpEarned = 0;
      
      if (canEarn && user?.id) {
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

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey={LESSON_ID}
        score={earnedXP}
        xpEarned={earnedXP}
        correctAnswers={correctAnswers}
        totalQuestions={questions.length}
      />
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
          <span className="text-sm font-medium">{currentStep + 1}/{questions.length}</span>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Colors - Type the transliteration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-border"
                style={{ backgroundColor: currentQuestion.color }}
              />
              <div className="flex items-center justify-center gap-2 mb-4">
                <p className="text-5xl font-bold">{currentQuestion.bulgarian}</p>
                <Button variant="ghost" size="icon" onClick={() => playPronunciation(currentQuestion.bulgarian)}>
                  <Volume2 className="w-6 h-6" />
                </Button>
              </div>
              {showHint && (
                <p className="text-muted-foreground animate-fade-in">Hint: {currentQuestion.hint}</p>
              )}
            </div>

            <div className="space-y-4">
              <Input
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
                  if (e.key === "Enter" && isCorrect === null && userAnswer.trim()) {
                    checkAnswer();
                  }
                }}
              />

              {isCorrect !== null && (
                <div className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                  isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                )}>
                  {isCorrect ? (
                    <>
                      <Check className="w-6 h-6" />
                      <span className="font-bold">Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-6 h-6" />
                      <span className="font-bold">The answer is: {currentQuestion.answer}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {isCorrect === null ? (
                <>
                  <Button variant="outline" onClick={() => { setShowHint(true); setUsedHint(true); }} disabled={showHint} className="flex-1">
                    Show Hint
                  </Button>
                  <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="flex-1">
                    Check
                  </Button>
                </>
              ) : (
                <Button onClick={nextQuestion} className="w-full">
                  {currentStep < questions.length - 1 ? "Next" : "Complete Lesson"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default ColorsLesson;