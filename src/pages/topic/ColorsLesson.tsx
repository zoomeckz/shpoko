import { useState, useRef, useEffect } from "react";
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
import { useLessonKeyboardNavigation } from "@/hooks/useLessonKeyboardNavigation";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { getTranslations } from "@/lib/translations";

interface TypeInQuestion {
  bulgarian: string;
  answer: string;
  hintKey: keyof ReturnType<typeof getTranslations>;
  color: string;
}

interface FillBlankQuestion {
  sentence: string;
  blank: string;
  options: string[];
  correctIndex: number;
  translationKey: keyof ReturnType<typeof getTranslations>;
  color: string;
}

type Question = { type: "typeIn"; data: TypeInQuestion } | { type: "fillBlank"; data: FillBlankQuestion };

const LESSON_ID = "colors-topic";
const XP_REWARD = 65;

const typeInQuestions: TypeInQuestion[] = [
  { bulgarian: "Червено", answer: "cherveno", hintKey: "hintRed", color: "#ef4444" },
  { bulgarian: "Синьо", answer: "sinyo", hintKey: "hintBlue", color: "#3b82f6" },
  { bulgarian: "Зелено", answer: "zeleno", hintKey: "hintGreen", color: "#22c55e" },
  { bulgarian: "Жълто", answer: "zhalto", hintKey: "hintYellow", color: "#eab308" },
  { bulgarian: "Оранжево", answer: "oranzhevo", hintKey: "hintOrange", color: "#f97316" },
];

const fillBlankQuestions: FillBlankQuestion[] = [
  { sentence: "Небето е ____", blank: "синьо", options: ["червено", "синьо", "зелено", "жълто"], correctIndex: 1, translationKey: "theSkyIsBlue", color: "#3b82f6" },
  { sentence: "Тревата е ____", blank: "зелена", options: ["зелена", "синя", "червена", "бяла"], correctIndex: 0, translationKey: "theGrassIsGreen", color: "#22c55e" },
  { sentence: "Слънцето е ____", blank: "жълто", options: ["синьо", "зелено", "жълто", "черно"], correctIndex: 2, translationKey: "theSunIsYellow", color: "#eab308" },
];

const generateMixedQuestions = (): Question[] => {
  const typeIn: Question[] = typeInQuestions.map(q => ({ type: "typeIn" as const, data: q }));
  const fillBlank: Question[] = fillBlankQuestions.map(q => ({ type: "fillBlank" as const, data: q }));
  const allQuestions = [...typeIn, ...fillBlank];
  return allQuestions.sort(() => Math.random() - 0.5);
};

export const ColorsLesson = () => {
  const [questions] = useState<Question[]>(() => generateMixedQuestions());
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
  const { canEarnXP, saveProgress, refetch } = useUserProgress();
  const inputRef = useRef<HTMLInputElement>(null);
  const { uiLanguage } = useLanguageMode();
  const t = getTranslations(uiLanguage);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isRevision = !canEarnXP(LESSON_ID);

  useEffect(() => {
    if (!isComplete && isCorrect === null && currentQuestion?.type === "typeIn") {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isComplete, isCorrect, currentQuestion?.type]);

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

  const checkTypeInAnswer = () => {
    if (currentQuestion.type !== "typeIn") return;
    const q = currentQuestion.data as TypeInQuestion;
    const isAnswerCorrect = userAnswer.toLowerCase().trim() === q.answer.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    if (isAnswerCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }
  };

  const selectFillBlankAnswer = (index: number) => {
    if (currentQuestion.type !== "fillBlank" || isCorrect !== null) return;
    const q = currentQuestion.data as FillBlankQuestion;
    setSelectedAnswer(index);
    const correct = index === q.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserAnswer("");
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      let xpEarned = 0;
      
      if (!isRevision && user?.id) {
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

  const getCurrentColor = () => {
    if (currentQuestion.type === "typeIn") {
      return (currentQuestion.data as TypeInQuestion).color;
    }
    return (currentQuestion.data as FillBlankQuestion).color;
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
          {isRevision && (
            <span className="text-xs bg-muted px-2 py-1 rounded">{t.revision}</span>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              {t.colorsLesson} - {currentQuestion.type === "typeIn" ? t.typeTransliteration : t.fillInBlank}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div 
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-border"
              style={{ backgroundColor: getCurrentColor() }}
            />

            {currentQuestion.type === "typeIn" ? (
              <>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <p className="text-5xl font-bold">{(currentQuestion.data as TypeInQuestion).bulgarian}</p>
                    <Button variant="ghost" size="icon" onClick={() => playPronunciation((currentQuestion.data as TypeInQuestion).bulgarian)}>
                      <Volume2 className="w-6 h-6" />
                    </Button>
                  </div>
                  {showHint && (
                    <p className="text-muted-foreground animate-fade-in">
                      {t.showHint}: {t[(currentQuestion.data as TypeInQuestion).hintKey]}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={t.typeTransliteration + "..."}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={isCorrect !== null}
                    className={cn(
                      "text-center text-xl py-6",
                      isCorrect === true && "border-green-500 bg-green-500/10",
                      isCorrect === false && "border-red-500 bg-red-500/10"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (isCorrect !== null) nextQuestion();
                        else if (userAnswer.trim()) checkTypeInAnswer();
                      }
                    }}
                  />

                  {isCorrect !== null && (
                    <div className={cn(
                      "flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                      isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    )}>
                      {isCorrect ? (
                        <><Check className="w-6 h-6" /><span className="font-bold">{t.correct}</span></>
                      ) : (
                        <><X className="w-6 h-6" /><span className="font-bold">{t.theAnswerIs} {(currentQuestion.data as TypeInQuestion).answer}</span></>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  {isCorrect === null ? (
                    <>
                      <Button variant="outline" onClick={() => setShowHint(true)} disabled={showHint} className="flex-1">{t.showHint}</Button>
                      <Button onClick={checkTypeInAnswer} disabled={!userAnswer.trim()} className="flex-1">{t.check}</Button>
                    </>
                  ) : (
                    <Button onClick={nextQuestion} className="w-full">
                      {currentStep < questions.length - 1 ? t.next : t.complete}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-3xl font-bold mb-2">{(currentQuestion.data as FillBlankQuestion).sentence}</p>
                  <p className="text-lg font-bold text-primary">{t[(currentQuestion.data as FillBlankQuestion).translationKey]}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(currentQuestion.data as FillBlankQuestion).options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => selectFillBlankAnswer(index)}
                      disabled={isCorrect !== null}
                      className={cn(
                        "py-6 text-lg transition-all",
                        selectedAnswer === index && isCorrect && "bg-green-500 text-white border-green-500",
                        selectedAnswer === index && !isCorrect && "bg-red-500 text-white border-red-500",
                        isCorrect !== null && index === (currentQuestion.data as FillBlankQuestion).correctIndex && selectedAnswer !== index && "border-green-500 border-2"
                      )}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {isCorrect !== null && (
                  <>
                    <div className={cn(
                      "flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                      isCorrect ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                    )}>
                      {isCorrect ? (
                        <><Check className="w-6 h-6" /><span className="font-bold">{t.correct}</span></>
                      ) : (
                        <><X className="w-6 h-6" /><span className="font-bold">{t.theAnswerIs} {(currentQuestion.data as FillBlankQuestion).options[(currentQuestion.data as FillBlankQuestion).correctIndex]}</span></>
                      )}
                    </div>
                    <Button onClick={nextQuestion} className="w-full">
                      {currentStep < questions.length - 1 ? t.next : t.complete}
                    </Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>{isRevision ? t.revisionMode : ""} {t.correct}: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default ColorsLesson;