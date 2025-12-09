import { useState, useEffect } from "react";
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

interface BaseQuestion {
  bulgarian: string;
  answer: string;
  hint: string;
}

interface TypeInQuestion extends BaseQuestion {
  type: "typeIn";
}

interface FillBlankQuestion extends BaseQuestion {
  type: "fillBlank";
  options: string[];
}

type Question = TypeInQuestion | FillBlankQuestion;

const LESSON_ID = "directions";
const XP_REWARD = 100;

const allQuestions: BaseQuestion[] = [
  { bulgarian: "Ляво", answer: "lyavo", hint: "Left" },
  { bulgarian: "Дясно", answer: "dyasno", hint: "Right" },
  { bulgarian: "Право", answer: "pravo", hint: "Straight" },
  { bulgarian: "Назад", answer: "nazad", hint: "Back" },
  { bulgarian: "Напред", answer: "napred", hint: "Forward" },
  { bulgarian: "Тук", answer: "tuk", hint: "Here" },
  { bulgarian: "Там", answer: "tam", hint: "There" },
  { bulgarian: "Близо", answer: "blizo", hint: "Near/Close" },
  { bulgarian: "Далеч", answer: "dalech", hint: "Far" },
  { bulgarian: "Улица", answer: "ulitsa", hint: "Street" },
  { bulgarian: "Кръстовище", answer: "krastovishte", hint: "Intersection" },
  { bulgarian: "Светофар", answer: "svetofar", hint: "Traffic light" },
  { bulgarian: "Мост", answer: "most", hint: "Bridge" },
  { bulgarian: "Площад", answer: "ploshtad", hint: "Square" },
  { bulgarian: "Спирка", answer: "spirka", hint: "Stop/Station" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateQuestions = (): Question[] => {
  const shuffled = shuffleArray(allQuestions);
  const typeInQuestions = shuffled.slice(0, 5).map(q => ({ ...q, type: "typeIn" as const }));
  const fillBlankQuestions = shuffled.slice(5, 8).map(q => {
    const wrongAnswers = shuffleArray(allQuestions.filter(a => a.answer !== q.answer)).slice(0, 3).map(a => a.answer);
    const options = shuffleArray([q.answer, ...wrongAnswers]);
    return { ...q, type: "fillBlank" as const, options };
  });
  return shuffleArray([...typeInQuestions, ...fillBlankQuestions]);
};

export const DirectionsLesson = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isRevision, setIsRevision] = useState(false);
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
  const { canEarnXP, isLessonCompleted, refetch } = useUserProgress();

  useEffect(() => {
    setQuestions(generateQuestions());
    setIsRevision(isLessonCompleted(LESSON_ID));
  }, []);

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

  const checkAnswer = (answer?: string) => {
    const answerToCheck = answer || userAnswer;
    const isAnswerCorrect = answerToCheck.toLowerCase().trim() === currentQuestion.answer.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    if (isAnswerCorrect) setCorrectAnswers(correctAnswers + 1);
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
            <CardTitle className="text-center">
              Directions - {currentQuestion.type === "typeIn" ? "Type the transliteration" : "Choose the correct answer"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <p className="text-5xl font-bold">{currentQuestion.bulgarian}</p>
                <Button variant="ghost" size="icon" onClick={() => playPronunciation(currentQuestion.bulgarian)}>
                  <Volume2 className="w-6 h-6" />
                </Button>
              </div>
              {showHint && <p className="text-muted-foreground animate-fade-in">Hint: {currentQuestion.hint}</p>}
            </div>

            {currentQuestion.type === "typeIn" ? (
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
                    if (e.key === "Enter" && isCorrect === null && userAnswer.trim()) checkAnswer();
                  }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={cn(
                      "h-14 text-lg",
                      isCorrect !== null && option === currentQuestion.answer && "bg-green-500 text-white border-green-500",
                      isCorrect === false && userAnswer === option && "bg-red-500 text-white border-red-500"
                    )}
                    onClick={() => {
                      if (isCorrect === null) {
                        setUserAnswer(option);
                        checkAnswer(option);
                      }
                    }}
                    disabled={isCorrect !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}

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

            <div className="flex gap-4">
              {isCorrect === null && currentQuestion.type === "typeIn" ? (
                <>
                  <Button variant="outline" onClick={() => setShowHint(true)} disabled={showHint} className="flex-1">
                    Show Hint
                  </Button>
                  <Button onClick={() => checkAnswer()} disabled={!userAnswer.trim()} className="flex-1">
                    Check
                  </Button>
                </>
              ) : isCorrect !== null ? (
                <Button onClick={nextQuestion} className="w-full">
                  {currentStep < questions.length - 1 ? "Next" : "Complete Lesson"}
                </Button>
              ) : null}
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

export default DirectionsLesson;
