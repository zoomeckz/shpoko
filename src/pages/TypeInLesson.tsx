import { useState } from "react";
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

interface Question {
  bulgarian: string;
  answer: string;
  hint: string;
}

const questions: Question[] = [
  { bulgarian: "Здравей", answer: "zdravey", hint: "Hello (informal)" },
  { bulgarian: "Добро утро", answer: "dobro utro", hint: "Good morning" },
  { bulgarian: "Благодаря", answer: "blagodarya", hint: "Thank you" },
  { bulgarian: "Моля", answer: "molya", hint: "Please / You're welcome" },
  { bulgarian: "Да", answer: "da", hint: "Yes" },
  { bulgarian: "Не", answer: "ne", hint: "No" },
  { bulgarian: "Извинете", answer: "izvinete", hint: "Excuse me" },
  { bulgarian: "Довиждане", answer: "dovizhdane", hint: "Goodbye" },
  { bulgarian: "Добър ден", answer: "dobar den", hint: "Good day/afternoon" },
  { bulgarian: "Лека нощ", answer: "leka nosht", hint: "Good night" },
  { bulgarian: "Как сте", answer: "kak ste", hint: "How are you? (formal)" },
  { bulgarian: "Добре съм", answer: "dobre sam", hint: "I am fine" },
];

export const TypeInLesson = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateXP } = useAuth();

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const nav = getLessonNavigation("type-in-basics");

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
      const points = showHint ? 5 : 10;
      setScore(score + points);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setScore(score + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserAnswer("");
      setIsCorrect(null);
      setShowHint(false);
    } else {
      if (user) {
        await updateXP(score);
        
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_id: "type-in-basics",
          completed: true,
          score: score,
          correct_answers: correctAnswers,
          total_answers: questions.length,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' });
      }
      
      toast({
        title: "Lesson Complete!",
        description: `You scored ${score} XP with ${correctAnswers}/${questions.length} correct answers!`,
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
        xpEarned={score}
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
            <CardTitle className="text-center">Type the transliteration</CardTitle>
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
              
              {showHint && (
                <p className="text-muted-foreground animate-fade-in">
                  Hint: {currentQuestion.hint}
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
                      <span className="font-bold">Correct! +{showHint ? 5 : 10} XP</span>
                    </>
                  ) : (
                    <>
                      <X className="w-6 h-6" />
                      <span className="font-bold">
                        The answer is: {currentQuestion.answer}
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
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim()}
                    className="flex-1"
                  >
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
          <p>Score: {score} XP | Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default TypeInLesson;
