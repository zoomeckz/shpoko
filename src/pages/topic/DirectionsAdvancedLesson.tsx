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
  hint: string;
}

const LESSON_ID = "directions-advanced";
const XP_REWARD = 100;

const sentenceData: Question[] = [
  { emoji: "⬅️", bulgarian: "Това е отляво", answer: "tova e otlyavo", hint: "It is on the left" },
  { emoji: "➡️", bulgarian: "Това е отдясно", answer: "tova e otdyasno", hint: "It is on the right" },
  { emoji: "⬆️", bulgarian: "Продължете напред", answer: "prodalzhete napred", hint: "Continue forward" },
  { emoji: "⬇️", bulgarian: "Върнете се назад", answer: "varnete se nazad", hint: "Go back" },
  { emoji: "🔄", bulgarian: "Обърнете се", answer: "obarnete se", hint: "Turn around" },
  { emoji: "📍", bulgarian: "Вие сте тук", answer: "vie ste tuk", hint: "You are here" },
  { emoji: "🎯", bulgarian: "Целта е там", answer: "tselta e tam", hint: "The destination is there" },
  { emoji: "🚶", bulgarian: "Вървете право", answer: "varvete pravo", hint: "Walk straight" },
  { emoji: "↖️", bulgarian: "Завийте наляво", answer: "zaviyte nalyavo", hint: "Turn left" },
  { emoji: "↗️", bulgarian: "Завийте надясно", answer: "zaviyte nadyasno", hint: "Turn right" },
  { emoji: "🏠", bulgarian: "Къщата е близо", answer: "kashtata e blizo", hint: "The house is nearby" },
  { emoji: "🏢", bulgarian: "Сградата е далеч", answer: "sgradata e dalech", hint: "The building is far" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const DirectionsAdvancedLesson = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isRevision, setIsRevision] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateXP } = useAuth();
  const { canEarnXP, isLessonCompleted, refetch } = useUserProgress();

  useEffect(() => {
    setQuestions(shuffleArray(sentenceData).slice(0, 10));
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
    const userNormalized = userAnswer.toLowerCase().trim().replace(/\s+/g, ' ');
    const answerNormalized = currentQuestion.answer.toLowerCase().trim();
    const correct = userNormalized === answerNormalized;
    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserAnswer("");
      setIsCorrect(null);
      setShowHint(false);
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
              Type the full sentence in romanized Bulgarian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-5xl mb-4">{currentQuestion.emoji}</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-2xl font-bold">{currentQuestion.bulgarian}</p>
                <Button variant="ghost" size="icon" onClick={() => playPronunciation(currentQuestion.bulgarian)}>
                  <Volume2 className="w-6 h-6" />
                </Button>
              </div>
              {showHint && (
                <p className="text-muted-foreground animate-fade-in">
                  Hint: {currentQuestion.hint}
                </p>
              )}
            </div>

            <Input
              ref={inputRef}
              type="text"
              placeholder="Type the full sentence..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isCorrect !== null}
              className={cn(
                "text-center text-lg py-6",
                isCorrect === true && "border-green-500 bg-green-500/10",
                isCorrect === false && "border-red-500 bg-red-500/10"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isCorrect === null && userAnswer.trim()) checkAnswer();
              }}
            />

            {isCorrect !== null && (
              <div className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
              )}>
                {isCorrect ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-6 h-6" /><span className="font-bold">Correct!</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <X className="w-6 h-6" /><span className="font-bold">Not quite!</span>
                    </div>
                    <p className="text-sm">Correct answer: {currentQuestion.answer}</p>
                  </>
                )}
              </div>
            )}

            {isCorrect === null ? (
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShowHint(true)} disabled={showHint} className="flex-1">
                  Show Hint
                </Button>
                <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="flex-1">
                  Check
                </Button>
              </div>
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

export default DirectionsAdvancedLesson;
