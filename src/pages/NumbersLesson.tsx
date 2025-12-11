import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useLessonKeyboardNavigation } from "@/hooks/useLessonKeyboardNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Volume2, ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLessonNavigation } from "@/hooks/useLessonNavigation";
import { useTextToSpeechCached } from "@/hooks/useTextToSpeechCached";
import { useAuth } from "@/contexts/AuthContext";
import { LessonComplete } from "@/components/LessonComplete";
import { getLessonNavigation } from "@/lib/lessonNavigation";
import { useUserProgress } from "@/hooks/useUserProgress";

interface BulgarianNumber {
  number: number;
  bulgarian: string;
  pronunciation: string;
}

const numbers: BulgarianNumber[] = [
  { number: 1, bulgarian: "едно", pronunciation: "edno" },
  { number: 2, bulgarian: "две", pronunciation: "dve" },
  { number: 3, bulgarian: "три", pronunciation: "tri" },
  { number: 4, bulgarian: "четири", pronunciation: "chetiri" },
  { number: 5, bulgarian: "пет", pronunciation: "pet" },
  { number: 6, bulgarian: "шест", pronunciation: "shest" },
  { number: 7, bulgarian: "седем", pronunciation: "sedem" },
  { number: 8, bulgarian: "осем", pronunciation: "osem" },
  { number: 9, bulgarian: "девет", pronunciation: "devet" },
  { number: 10, bulgarian: "десет", pronunciation: "deset" },
  { number: 11, bulgarian: "единадесет", pronunciation: "edinadeset" },
  { number: 12, bulgarian: "дванадесет", pronunciation: "dvanadeset" },
  { number: 13, bulgarian: "тринадесет", pronunciation: "trinadeset" },
  { number: 14, bulgarian: "четиринадесет", pronunciation: "chetirinadeset" },
  { number: 15, bulgarian: "петнадесет", pronunciation: "petnadeset" },
  { number: 16, bulgarian: "шестнадесет", pronunciation: "shestnadeset" },
  { number: 17, bulgarian: "седемнадесет", pronunciation: "sedemnadeset" },
  { number: 18, bulgarian: "осемнадесет", pronunciation: "osemnadeset" },
  { number: 19, bulgarian: "деветнадесет", pronunciation: "devetnadeset" },
  { number: 20, bulgarian: "двадесет", pronunciation: "dvadeset" },
];

const LESSON_ID = "numbers-1-20";
const XP_REWARD = 60;

export const NumbersLesson = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { isPlaying, playPronunciation } = useTextToSpeechCached();
  const { toast } = useToast();
  const { handleBack, navigate } = useLessonNavigation();
  const { user, updateXP } = useAuth();
  const { saveProgress, isLessonCompleted } = useUserProgress();
  const inputRef = useRef<HTMLInputElement>(null);

  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);

  const isRevision = isLessonCompleted(LESSON_ID);

  // Generate 10 random typing questions from numbers
  const testQuestions = useMemo(() => {
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, []);

  const currentQuestion = testQuestions[currentStep];
  const totalSteps = testQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const nav = getLessonNavigation("numbers-1-20");

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === currentQuestion.pronunciation.toLowerCase();
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const nextQuestion = useCallback(async () => {
    if (currentStep < testQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUserAnswer("");
      setIsCorrect(null);
    } else {
      let xpEarned = 0;
      
      if (!isRevision && user?.id) {
        const baseXP = Math.round((correctAnswers / testQuestions.length) * XP_REWARD);
        xpEarned = baseXP > 0 ? baseXP : XP_REWARD;
        await updateXP(xpEarned);
        await saveProgress(LESSON_ID, xpEarned, correctAnswers, testQuestions.length);
      }
      
      setEarnedXP(xpEarned);
      toast({
        title: isRevision ? "Revision Complete!" : "Lesson Complete!",
        description: isRevision ? "Great practice!" : `You've learned to count in Bulgarian! +${xpEarned} XP`,
      });
      setIsComplete(true);
    }
  }, [currentStep, testQuestions.length, isRevision, user?.id, correctAnswers, updateXP, saveProgress, toast]);

  // Focus input on step change
  useEffect(() => {
    if (!isComplete && isCorrect === null) {
      inputRef.current?.focus();
    }
  }, [currentStep, isComplete, isCorrect]);

  useLessonKeyboardNavigation({
    isAnswered: isCorrect !== null,
    onNext: nextQuestion,
  });

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey="numbers"
        score={earnedXP}
        xpEarned={earnedXP}
        correctAnswers={correctAnswers}
        totalQuestions={testQuestions.length}
        isRevision={isRevision}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
            <h1 className="text-3xl font-bold">Numbers 1-20</h1>
            {isRevision && (
              <span className="text-xs bg-muted px-2 py-1 rounded">Revision</span>
            )}
          </div>

          <div className="flex justify-between mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => nav.prevRoute && navigate(nav.prevRoute)}
              disabled={!nav.hasPrev}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {nav.prevTitle || "Previous Lesson"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => nav.nextRoute && navigate(nav.nextRoute)}
              disabled={!nav.hasNext}
            >
              {nav.nextTitle || "Next Lesson"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Type the Transliteration</h2>
          
          <div className="text-center mb-6">
            <div className="text-8xl font-bold mb-4 text-primary">
              {currentQuestion.number}
            </div>
            <div 
              className={cn(
                "text-5xl font-bold mb-4 transition-all duration-300",
                isPlaying && "animate-bounce-gentle text-primary"
              )}
            >
              {currentQuestion.bulgarian}
            </div>
            <Button
              onClick={() => playPronunciation(currentQuestion.bulgarian)}
              disabled={isPlaying}
              variant="outline"
              size="sm"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              {isPlaying ? "Playing..." : "Hear Number"}
            </Button>
          </div>

          <div className="space-y-4">
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
                if (e.key === "Enter") {
                  if (isCorrect !== null) nextQuestion();
                  else if (userAnswer.trim()) checkAnswer();
                }
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
                  <><X className="w-6 h-6" /><span className="font-bold">The answer is: {currentQuestion.pronunciation}</span></>
                )}
              </div>
            )}

            <div className="flex gap-4">
              {isCorrect === null ? (
                <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="w-full">
                  Check Answer
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="w-full">
                  {currentStep < testQuestions.length - 1 ? "Next" : "Complete Lesson"}
                </Button>
              )}
            </div>
          </div>

          <div className="text-center text-muted-foreground mt-6">
            Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}
          </div>
        </Card>
      </div>
    </div>
  );
};