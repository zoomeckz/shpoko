import { useState, useEffect, useMemo } from "react";
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

interface Greeting {
  bulgarian: string;
  pronunciation: string;
  english: string;
  usage: string;
}

const greetings: Greeting[] = [
  { bulgarian: "Здравей", pronunciation: "Zdravey", english: "Hello (informal)", usage: "Use with friends and people your age" },
  { bulgarian: "Здравейте", pronunciation: "Zdraveyte", english: "Hello (formal)", usage: "Use with strangers, elders, or in professional settings" },
  { bulgarian: "Добро утро", pronunciation: "Dobro utro", english: "Good morning", usage: "Use in the morning until around noon" },
  { bulgarian: "Добър ден", pronunciation: "Dobar den", english: "Good day/afternoon", usage: "Use from noon until evening" },
  { bulgarian: "Добър вечер", pronunciation: "Dobar vecher", english: "Good evening", usage: "Use in the evening" },
  { bulgarian: "Лека нощ", pronunciation: "Leka nosht", english: "Good night", usage: "Use when saying goodbye before sleep" },
  { bulgarian: "Довиждане", pronunciation: "Dovizhdane", english: "Goodbye", usage: "Formal way to say goodbye" },
  { bulgarian: "Чао", pronunciation: "Chao", english: "Bye", usage: "Informal, borrowed from Italian" },
  { bulgarian: "Благодаря", pronunciation: "Blagodarya", english: "Thank you", usage: "Express gratitude in any situation" },
  { bulgarian: "Моля", pronunciation: "Molya", english: "Please / You're welcome", usage: "Can mean both 'please' and 'you're welcome'" },
  { bulgarian: "Извинете", pronunciation: "Izvinete", english: "Excuse me / Sorry", usage: "Use to get attention or apologize" },
  { bulgarian: "Как сте?", pronunciation: "Kak ste?", english: "How are you? (formal)", usage: "Formal way to ask how someone is" },
];

interface TypeInQuestion {
  bulgarian: string;
  pronunciation: string;
  english: string;
}

const LESSON_ID = "basic-greetings";
const XP_REWARD = 75;

export const GreetingsLesson = () => {
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

  // Generate 5 random typing questions from greetings
  const testQuestions = useMemo(() => {
    const shuffled = [...greetings].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5).map(g => ({
      bulgarian: g.bulgarian,
      pronunciation: g.pronunciation,
      english: g.english,
    }));
  }, []);

  const currentGreeting = greetings[currentStep];
  const currentTestQuestion = testQuestions[currentStep];
  const totalSteps = phase === "learning" ? greetings.length : testQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const nav = getLessonNavigation("basic-greetings");

  const nextStep = () => {
    if (phase === "learning") {
      if (currentStep < greetings.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Move to test phase
        setPhase("testing");
        setCurrentStep(0);
        toast({
          title: "Time to test your knowledge!",
          description: "Type the transliteration for each greeting",
        });
      }
    }
  };

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === currentTestQuestion.pronunciation.toLowerCase().replace("?", "");
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
        description: isRevision ? "Great practice!" : `You've mastered basic greetings! +${xpEarned} XP`,
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
        lessonKey="greetings"
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
            <h1 className="text-3xl font-bold">Basic Greetings</h1>
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
                {phase === "learning" ? `Phrase ${currentStep + 1} of ${greetings.length}` : `Test ${currentStep + 1} of ${testQuestions.length}`}
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
                    "text-5xl font-bold mb-4 transition-all duration-300",
                    isPlaying && "animate-bounce-gentle text-primary"
                  )}>
                    {currentGreeting.bulgarian}
                  </div>
                  <div className="text-2xl text-muted-foreground mb-2">
                    {currentGreeting.pronunciation}
                  </div>
                  <div className="text-xl font-medium text-primary">
                    {currentGreeting.english}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => playPronunciation(currentGreeting.bulgarian)}
                    disabled={isPlaying}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {isPlaying ? "Playing..." : "Hear Phrase"}
                  </Button>
                  
                  <Button variant="outline" onClick={() => playPronunciation(currentGreeting.bulgarian)} disabled={isPlaying}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Repeat
                  </Button>
                </div>
              </Card>

              <Card className="p-8 animate-fade-in">
                <h3 className="text-2xl font-bold mb-6">When to Use</h3>
                
                <div className="p-6 bg-muted/50 rounded-lg mb-6">
                  <p className="text-lg">{currentGreeting.usage}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Bulgarian</p>
                    <p className="text-xl font-bold">{currentGreeting.bulgarian}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Pronunciation</p>
                    <p className="text-xl">{currentGreeting.pronunciation}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-between items-center mt-8">
              <Button onClick={prevStep} disabled={currentStep === 0} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                {currentGreeting.english}
              </div>

              <Button onClick={nextStep} className="bg-gradient-primary hover:opacity-90">
                {currentStep === greetings.length - 1 ? "Start Test" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <Card className="p-6 mt-8">
              <h3 className="text-lg font-bold mb-4">Phrases Progress</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {greetings.map((greeting, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "p-2 rounded-lg border-2 text-xs font-medium transition-all duration-200",
                      index === currentStep 
                        ? "border-primary bg-primary text-primary-foreground animate-glow" 
                        : index < currentStep
                        ? "border-success bg-success/10 text-success"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    {greeting.english.split(" ")[0]}
                  </button>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Type the Transliteration</h2>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-4">{currentTestQuestion.bulgarian}</div>
              <p className="text-lg text-muted-foreground">{currentTestQuestion.english}</p>
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