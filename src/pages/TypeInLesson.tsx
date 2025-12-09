import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, X, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { LessonComplete } from "@/components/LessonComplete";
import { getLessonNavigation } from "@/lib/lessonNavigation";
import { useUserProgress } from "@/hooks/useUserProgress";

interface TypeInQuestion {
  bulgarian: string;
  answer: string;
  hint: string;
}

interface FillBlankQuestion {
  sentence: string;
  blank: string;
  options: string[];
  correctIndex: number;
  translation: string;
}

type Question = { type: "typeIn"; data: TypeInQuestion } | { type: "fillBlank"; data: FillBlankQuestion };

const typeInQuestions: TypeInQuestion[] = [
  { bulgarian: "Здравей", answer: "zdravey", hint: "Hello (informal)" },
  { bulgarian: "Добро утро", answer: "dobro utro", hint: "Good morning" },
  { bulgarian: "Благодаря", answer: "blagodarya", hint: "Thank you" },
  { bulgarian: "Моля", answer: "molya", hint: "Please / You're welcome" },
  { bulgarian: "Да", answer: "da", hint: "Yes" },
];

const fillBlankQuestions: FillBlankQuestion[] = [
  { sentence: "Добро ____", blank: "утро", options: ["утро", "вечер", "ден", "нощ"], correctIndex: 0, translation: "Good morning" },
  { sentence: "Как сте? Аз съм ____", blank: "добре", options: ["зле", "добре", "гладен", "уморен"], correctIndex: 1, translation: "How are you? I am fine" },
  { sentence: "____ се казвам Иван", blank: "Аз", options: ["Той", "Тя", "Аз", "Ние"], correctIndex: 2, translation: "I am called Ivan" },
];

// Mix questions randomly
const generateMixedQuestions = (): Question[] => {
  const typeIn: Question[] = typeInQuestions.map(q => ({ type: "typeIn" as const, data: q }));
  const fillBlank: Question[] = fillBlankQuestions.map(q => ({ type: "fillBlank" as const, data: q }));
  const allQuestions = [...typeIn, ...fillBlank];
  return allQuestions.sort(() => Math.random() - 0.5);
};

export const TypeInLesson = () => {
  const [questions] = useState<Question[]>(() => generateMixedQuestions());
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateXP } = useAuth();
  const { canEarnXP, saveProgress } = useUserProgress();

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const nav = getLessonNavigation("type-in-basics");
  const isRevision = !canEarnXP("type-in-basics");

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
      const points = showHint ? 5 : 10;
      setScore(score + points);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setScore(score + 1);
    }
  };

  const selectFillBlankAnswer = (index: number) => {
    if (currentQuestion.type !== "fillBlank" || isCorrect !== null) return;
    const q = currentQuestion.data as FillBlankQuestion;
    setSelectedAnswer(index);
    const correct = index === q.correctIndex;
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
      setUserAnswer("");
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      const { xpAwarded } = await saveProgress(
        "type-in-basics",
        score,
        correctAnswers,
        questions.length,
        isRevision ? undefined : updateXP
      );
      
      toast({
        title: isRevision ? "Revision Complete!" : "Lesson Complete!",
        description: isRevision 
          ? `${correctAnswers}/${questions.length} correct answers!`
          : `You scored ${score} XP with ${correctAnswers}/${questions.length} correct answers!`,
      });
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey="type-in"
        score={score}
        correctAnswers={correctAnswers}
        totalQuestions={questions.length}
        xpEarned={isRevision ? 0 : score}
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
            <span className="text-xs bg-muted px-2 py-1 rounded">Revision</span>
          )}
        </div>

        {/* Lesson Navigation */}
        <div className="flex justify-between mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => nav.prevRoute && navigate(nav.prevRoute)}
            disabled={!nav.hasPrev}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {nav.prevTitle || "Previous"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => nav.nextRoute && navigate(nav.nextRoute)}
            disabled={!nav.hasNext}
          >
            {nav.nextTitle || "Next"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              {currentQuestion.type === "typeIn" ? "Type the transliteration" : "Fill in the blank"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion.type === "typeIn" ? (
              <>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <p className="text-5xl font-bold">{(currentQuestion.data as TypeInQuestion).bulgarian}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playPronunciation((currentQuestion.data as TypeInQuestion).bulgarian)}
                    >
                      <Volume2 className="w-6 h-6" />
                    </Button>
                  </div>
                  {showHint && (
                    <p className="text-muted-foreground animate-fade-in">
                      Hint: {(currentQuestion.data as TypeInQuestion).hint}
                    </p>
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
                      if (e.key === "Enter") {
                        if (isCorrect !== null) {
                          nextQuestion();
                        } else if (userAnswer.trim()) {
                          checkTypeInAnswer();
                        }
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
                          <span className="font-bold">Correct! {!isRevision && `+${showHint ? 5 : 10} XP`}</span>
                        </>
                      ) : (
                        <>
                          <X className="w-6 h-6" />
                          <span className="font-bold">
                            The answer is: {(currentQuestion.data as TypeInQuestion).answer}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  {isCorrect === null ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setShowHint(true)}
                        disabled={showHint}
                        className="flex-1"
                      >
                        Show Hint
                      </Button>
                      <Button
                        onClick={checkTypeInAnswer}
                        disabled={!userAnswer.trim()}
                        className="flex-1"
                      >
                        Check
                      </Button>
                    </>
                  ) : (
                    <Button onClick={nextQuestion} className="w-full">
                      {currentStep < questions.length - 1 ? "Next" : "Complete"}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <p className="text-3xl font-bold">{(currentQuestion.data as FillBlankQuestion).sentence}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playPronunciation((currentQuestion.data as FillBlankQuestion).sentence.replace("____", (currentQuestion.data as FillBlankQuestion).blank))}
                    >
                      <Volume2 className="w-6 h-6" />
                    </Button>
                  </div>
                  <p className="text-lg font-bold text-primary">{(currentQuestion.data as FillBlankQuestion).translation}</p>
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
                        <div className="flex items-center gap-2">
                          <Check className="w-6 h-6" />
                          <span className="font-bold">Correct! {!isRevision && "+10 XP"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <X className="w-6 h-6" />
                          <span className="font-bold">
                            The answer is: {(currentQuestion.data as FillBlankQuestion).options[(currentQuestion.data as FillBlankQuestion).correctIndex]}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button onClick={nextQuestion} className="w-full">
                      {currentStep < questions.length - 1 ? "Next" : "Complete"}
                    </Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>{isRevision ? "Revision Mode" : `Score: ${score} XP`} | Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default TypeInLesson;
