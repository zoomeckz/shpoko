import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Volume2, RotateCcw, ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
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
  const [phase, setPhase] = useState<"learning" | "testing">("learning");
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { isPlaying, playPronunciation } = useTextToSpeech();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
  const { canEarnXP, saveProgress, isLessonCompleted } = useUserProgress();

  // Test phase state
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);

  const isRevision = isLessonCompleted(LESSON_ID);

  // Generate 5 random typing questions from numbers
  const testQuestions = useMemo(() => {
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, []);

  const currentNumber = numbers[currentStep];
  const currentTestQuestion = testQuestions[currentStep];
  const totalSteps = phase === "learning" ? numbers.length : testQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const nav = getLessonNavigation("numbers-1-20");

  const nextStep = () => {
    if (phase === "learning") {
      if (currentStep < numbers.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Move to test phase
        setPhase("testing");
        setCurrentStep(0);
        toast({
          title: "Time to test your knowledge!",
          description: "Type the transliteration for each number",
        });
      }
    }
  };

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === currentTestQuestion.pronunciation.toLowerCase();
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const nextTestQuestion = async () => {
    if (currentStep < testQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUserAnswer("");
      setIsCorrect(null);
    } else {
      // Lesson complete
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
        description: isRevision ? "Great practice!" : `You've learned to count to 20 in Bulgarian! +${xpEarned} XP`,
      });
      setIsComplete(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

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
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
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
                {phase === "learning" ? `Number ${currentStep + 1} of ${numbers.length}` : `Test ${currentStep + 1} of ${testQuestions.length}`}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {phase === "learning" ? (
          <>
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-8 text-center animate-fade-in">
                <div className="mb-6">
                  <div className={cn(
                    "text-8xl font-bold mb-4 transition-all duration-300 text-primary",
                    isPlaying && "animate-bounce-gentle"
                  )}>
                    {currentNumber.number}
                  </div>
                  <div className={cn(
                    "text-5xl font-bold mb-4 transition-all duration-300",
                    isPlaying && "animate-bounce-gentle text-primary"
                  )}>
                    {currentNumber.bulgarian}
                  </div>
                  <div className="text-2xl text-muted-foreground">
                    {currentNumber.pronunciation}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => playPronunciation(currentNumber.bulgarian)}
                    disabled={isPlaying}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {isPlaying ? "Playing..." : "Hear Number"}
                  </Button>
                  
                  <Button variant="outline" onClick={() => playPronunciation(currentNumber.bulgarian)} disabled={isPlaying}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Repeat
                  </Button>
                </div>
              </Card>

              <Card className="p-8 animate-fade-in">
                <h3 className="text-2xl font-bold mb-6">Number Pattern</h3>
                
                {currentNumber.number <= 10 ? (
                  <div className="p-6 bg-muted/50 rounded-lg mb-6">
                    <p className="text-lg">
                      Numbers 1-10 are base numbers. Memorize these to build larger numbers!
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-muted/50 rounded-lg mb-6">
                    <p className="text-lg mb-2">
                      Teen numbers (11-19) follow a pattern:
                    </p>
                    <p className="text-primary font-medium">
                      {numbers[currentNumber.number - 11].bulgarian} + надесет = {currentNumber.bulgarian}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-5 gap-2">
                  {[...Array(currentNumber.number)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      •
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="flex justify-between items-center mt-8">
              <Button onClick={prevStep} disabled={currentStep === 0} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                {currentNumber.number} = {currentNumber.bulgarian}
              </div>

              <Button onClick={nextStep} className="bg-gradient-primary hover:opacity-90">
                {currentStep === numbers.length - 1 ? "Start Test" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <Card className="p-6 mt-8">
              <h3 className="text-lg font-bold mb-4">Numbers Progress</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {numbers.map((num, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "w-12 h-12 rounded-lg border-2 font-bold transition-all duration-200",
                      index === currentStep 
                        ? "border-primary bg-primary text-primary-foreground animate-glow" 
                        : index < currentStep
                        ? "border-success bg-success/10 text-success"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    {num.number}
                  </button>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Type the Transliteration</h2>
            
            <div className="text-center mb-6">
              <div className="text-8xl font-bold mb-4 text-primary">{currentTestQuestion.number}</div>
              <div className="text-5xl font-bold mb-4">{currentTestQuestion.bulgarian}</div>
              <p className="text-lg text-muted-foreground">Type the romanized version</p>
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
                    if (isCorrect !== null) nextTestQuestion();
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
                    <><X className="w-6 h-6" /><span className="font-bold">The answer is: {currentTestQuestion.pronunciation}</span></>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                {isCorrect === null ? (
                  <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="w-full">
                    Check Answer
                  </Button>
                ) : (
                  <Button onClick={nextTestQuestion} className="w-full">
                    {currentStep < testQuestions.length - 1 ? "Next" : "Complete Lesson"}
                  </Button>
                )}
              </div>
            </div>

            <div className="text-center text-muted-foreground mt-6">
              Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};