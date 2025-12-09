import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LessonComplete } from "@/components/LessonComplete";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useUserProgress } from "@/hooks/useUserProgress";
import { cn } from "@/lib/utils";

const LESSON_ID = "animals-topic";
const XP_REWARD = 70;

interface TypeInQuestion {
  emoji: string;
  english: string;
  bulgarian: string;
  answer: string;
}

interface FillBlankQuestion {
  sentence: string;
  options: string[];
  correctIndex: number;
  translation: string;
  emoji: string;
}

type Question = { type: "typeIn"; data: TypeInQuestion } | { type: "fillBlank"; data: FillBlankQuestion };

const typeInQuestions: TypeInQuestion[] = [
  { emoji: "🐕", english: "Dog", bulgarian: "куче", answer: "kuche" },
  { emoji: "🐈", english: "Cat", bulgarian: "котка", answer: "kotka" },
  { emoji: "🐦", english: "Bird", bulgarian: "птица", answer: "ptitsa" },
  { emoji: "🐟", english: "Fish", bulgarian: "риба", answer: "riba" },
  { emoji: "🐎", english: "Horse", bulgarian: "кон", answer: "kon" },
];

const fillBlankQuestions: FillBlankQuestion[] = [
  { emoji: "🐄", sentence: "Кравата дава ____", options: ["месо", "мляко", "яйца", "вода"], correctIndex: 1, translation: "The cow gives milk" },
  { emoji: "🐖", sentence: "____ живее във ферма", options: ["Прасето", "Рибата", "Птицата", "Котката"], correctIndex: 0, translation: "The pig lives on a farm" },
  { emoji: "🐇", sentence: "Заекът яде ____", options: ["месо", "риба", "моркови", "сирене"], correctIndex: 2, translation: "The rabbit eats carrots" },
];

const generateMixedQuestions = (): Question[] => {
  const typeIn: Question[] = typeInQuestions.map(q => ({ type: "typeIn" as const, data: q }));
  const fillBlank: Question[] = fillBlankQuestions.map(q => ({ type: "fillBlank" as const, data: q }));
  const allQuestions = [...typeIn, ...fillBlank];
  return allQuestions.sort(() => Math.random() - 0.5);
};

const AnimalsLesson = () => {
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
  const { toast } = useToast();
  const { playCorrect, playIncorrect, playComplete } = useSoundEffects();
  const { canEarnXP, refetch } = useUserProgress();
  
  const [questions] = useState<Question[]>(() => generateMixedQuestions());
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isRevision = !canEarnXP(LESSON_ID);

  const checkTypeInAnswer = () => {
    if (currentQuestion.type !== "typeIn") return;
    const q = currentQuestion.data as TypeInQuestion;
    const correct = userInput.toLowerCase().trim() === q.answer.toLowerCase();
    setIsCorrect(correct);
    
    if (correct) {
      playCorrect();
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
    } else {
      playIncorrect();
    }
  };

  const selectFillBlankAnswer = (index: number) => {
    if (currentQuestion.type !== "fillBlank" || isCorrect !== null) return;
    const q = currentQuestion.data as FillBlankQuestion;
    setSelectedAnswer(index);
    const correct = index === q.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      playCorrect();
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
    } else {
      playIncorrect();
    }
  };

  const nextStep = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUserInput("");
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      playComplete();
      
      let xpEarned = 0;
      if (!isRevision && user?.id) {
        xpEarned = Math.round((correctAnswers / questions.length) * XP_REWARD);
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
      
      toast({
        title: isRevision ? "Revision Complete!" : "Lesson Complete!",
        description: isRevision ? `${correctAnswers}/${questions.length} correct!` : `You earned ${xpEarned} XP!`,
      });
      setIsComplete(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isCorrect !== null) {
        nextStep();
      } else if (userInput.trim()) {
        checkTypeInAnswer();
      }
    }
  };

  if (isComplete) {
    return <LessonComplete lessonKey={LESSON_ID} score={score} xpEarned={isRevision ? 0 : score} isRevision={isRevision} correctAnswers={correctAnswers} totalQuestions={questions.length} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Animals 🐾</h1>
            {isRevision && <span className="text-xs bg-muted px-2 py-1 rounded">Revision</span>}
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">{currentStep + 1} of {questions.length}</span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              {currentQuestion.type === "typeIn" ? "Type the romanized Bulgarian" : "Fill in the blank"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion.type === "typeIn" ? (
              <>
                <div className="text-center">
                  <div className="text-9xl mb-4">{(currentQuestion.data as TypeInQuestion).emoji}</div>
                  <h2 className="text-3xl font-bold mb-2">{(currentQuestion.data as TypeInQuestion).english}</h2>
                  <p className="text-lg text-muted-foreground">{(currentQuestion.data as TypeInQuestion).bulgarian}</p>
                </div>
                
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type the romanized Bulgarian..."
                  className={cn(
                    "text-center text-lg",
                    isCorrect === true && "border-green-500 bg-green-500/10",
                    isCorrect === false && "border-red-500 bg-red-500/10"
                  )}
                  disabled={isCorrect !== null}
                  autoFocus
                />
                
                {isCorrect === false && (
                  <p className="text-sm text-destructive text-center">
                    The answer is: <span className="font-bold">{(currentQuestion.data as TypeInQuestion).answer}</span>
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-7xl mb-4">{(currentQuestion.data as FillBlankQuestion).emoji}</div>
                  <p className="text-2xl font-bold mb-2">{(currentQuestion.data as FillBlankQuestion).sentence}</p>
                  <p className="text-lg text-primary">{(currentQuestion.data as FillBlankQuestion).translation}</p>
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
              </>
            )}

            {isCorrect !== null && (
              <>
                <div className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                  isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                )}>
                  {isCorrect ? (
                    <><Check className="w-6 h-6" /><span className="font-bold">Correct! {!isRevision && "+10 XP"}</span></>
                  ) : (
                    <><X className="w-6 h-6" /><span className="font-bold">Incorrect</span></>
                  )}
                </div>
                <Button onClick={nextStep} className="w-full">
                  {currentStep === questions.length - 1 ? "Complete" : "Next"}
                </Button>
              </>
            )}

            {isCorrect === null && currentQuestion.type === "typeIn" && (
              <Button onClick={checkTypeInAnswer} className="w-full" disabled={!userInput.trim()}>
                <Check className="w-4 h-4 mr-2" />
                Check Answer
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          {isRevision ? "Revision Mode" : `Score: ${score} XP`} | Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}
        </div>
      </div>
    </div>
  );
};

export default AnimalsLesson;
