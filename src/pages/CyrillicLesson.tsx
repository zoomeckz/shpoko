import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Volume2, ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAuth } from "@/contexts/AuthContext";
import { LessonComplete } from "@/components/LessonComplete";
import { getLessonNavigation } from "@/lib/lessonNavigation";
import { useUserProgress } from "@/hooks/useUserProgress";

interface CyrillicLetter {
  cyrillic: string;
  latin: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}

const cyrillicAlphabet: CyrillicLetter[] = [
  { cyrillic: "А", latin: "A", pronunciation: "ah", example: "автобус", exampleTranslation: "bus" },
  { cyrillic: "Б", latin: "B", pronunciation: "beh", example: "банан", exampleTranslation: "banana" },
  { cyrillic: "В", latin: "V", pronunciation: "veh", example: "вода", exampleTranslation: "water" },
  { cyrillic: "Г", latin: "G", pronunciation: "geh", example: "гора", exampleTranslation: "forest" },
  { cyrillic: "Д", latin: "D", pronunciation: "deh", example: "дом", exampleTranslation: "house" },
  { cyrillic: "Е", latin: "E", pronunciation: "eh", example: "елха", exampleTranslation: "fir tree" },
  { cyrillic: "Ж", latin: "Zh", pronunciation: "zheh", example: "жаба", exampleTranslation: "frog" },
  { cyrillic: "З", latin: "Z", pronunciation: "zeh", example: "заек", exampleTranslation: "rabbit" },
  { cyrillic: "И", latin: "I", pronunciation: "ee", example: "игра", exampleTranslation: "game" },
  { cyrillic: "Й", latin: "Y", pronunciation: "ee kratko", example: "май", exampleTranslation: "May" },
  { cyrillic: "К", latin: "K", pronunciation: "kah", example: "кот", exampleTranslation: "cat" },
  { cyrillic: "Л", latin: "L", pronunciation: "leh", example: "лимон", exampleTranslation: "lemon" },
];

const LESSON_ID = "cyrillic-alphabet";
const XP_REWARD = 50;

export const CyrillicLesson = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { isPlaying, playPronunciation } = useTextToSpeech();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
  const { saveProgress, isLessonCompleted } = useUserProgress();

  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);

  const isRevision = isLessonCompleted(LESSON_ID);

  // Generate 10 random typing questions from alphabet
  const testQuestions = useMemo(() => {
    const shuffled = [...cyrillicAlphabet].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, []);

  const currentQuestion = testQuestions[currentStep];
  const totalSteps = testQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const nav = getLessonNavigation("cyrillic-alphabet");

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === currentQuestion.latin.toLowerCase();
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const nextQuestion = async () => {
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
        description: isRevision ? "Great practice!" : `You've mastered the Cyrillic alphabet! +${xpEarned} XP`,
      });
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey="cyrillic"
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
            <h1 className="text-3xl font-bold">Cyrillic Alphabet</h1>
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
          <h2 className="text-2xl font-bold text-center mb-6">Type the Latin Equivalent</h2>
          
          <div className="text-center mb-6">
            <div 
              className={cn(
                "text-9xl font-bold mb-4 transition-all duration-300",
                isPlaying && "animate-bounce-gentle text-primary"
              )}
            >
              {currentQuestion.cyrillic}
            </div>
            <p className="text-lg text-muted-foreground mb-2">
              Pronounced: "{currentQuestion.pronunciation}"
            </p>
            <Button
              onClick={() => playPronunciation(currentQuestion.cyrillic)}
              disabled={isPlaying}
              variant="outline"
              size="sm"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              {isPlaying ? "Playing..." : "Hear Letter"}
            </Button>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Type the Latin letter..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isCorrect !== null}
              maxLength={2}
              className={cn(
                "text-center text-xl py-6 uppercase",
                isCorrect === true && "border-green-500 bg-green-500/10",
                isCorrect === false && "border-red-500 bg-red-500/10"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (isCorrect !== null) nextQuestion();
                  else if (userAnswer.trim()) checkAnswer();
                }
              }}
              autoFocus
            />

            {isCorrect !== null && (
              <div className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
              )}>
                {isCorrect ? (
                  <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
                ) : (
                  <><X className="w-6 h-6" /><span className="font-bold">The answer is: {currentQuestion.latin}</span></>
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