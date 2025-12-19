import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, X, Volume2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LessonComplete } from "@/components/LessonComplete";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useLessonKeyboardNavigation } from "@/hooks/useLessonKeyboardNavigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DirectionWord {
  emoji: string;
  bulgarian: string;
  romanized: string;
  english: string;
  story: { bulgarian: string; romanized: string; english: string };
}

interface QuizQuestion {
  emoji: string;
  bulgarian: string;
  romanized: string;
  english: string;
  options: { bulgarian: string; romanized: string }[];
}

const LESSON_ID = "directions-beginner";
const XP_REWARD = 60;

const directionWords: DirectionWord[] = [
  { 
    emoji: "⬅️", 
    bulgarian: "Ляво", 
    romanized: "lyavo", 
    english: "Left",
    story: { bulgarian: "Завий на ляво.", romanized: "Zaviy na lyavo.", english: "Turn left." }
  },
  { 
    emoji: "➡️", 
    bulgarian: "Дясно", 
    romanized: "dyasno", 
    english: "Right",
    story: { bulgarian: "Магазинът е на дясно.", romanized: "Magazinat e na dyasno.", english: "The store is on the right." }
  },
  { 
    emoji: "⬆️", 
    bulgarian: "Напред", 
    romanized: "napred", 
    english: "Forward",
    story: { bulgarian: "Върви напред.", romanized: "Varvi napred.", english: "Go forward." }
  },
  { 
    emoji: "⬇️", 
    bulgarian: "Назад", 
    romanized: "nazad", 
    english: "Back/Backward",
    story: { bulgarian: "Стъпи назад.", romanized: "Stapi nazad.", english: "Step back." }
  },
  { 
    emoji: "🔄", 
    bulgarian: "Обратно", 
    romanized: "obratno", 
    english: "Back (return)",
    story: { bulgarian: "Върни се обратно.", romanized: "Varni se obratno.", english: "Come back." }
  },
  { 
    emoji: "📍", 
    bulgarian: "Тук", 
    romanized: "tuk", 
    english: "Here",
    story: { bulgarian: "Аз съм тук.", romanized: "Az sam tuk.", english: "I am here." }
  },
  { 
    emoji: "🎯", 
    bulgarian: "Там", 
    romanized: "tam", 
    english: "There",
    story: { bulgarian: "Отиди там.", romanized: "Otidi tam.", english: "Go there." }
  },
  { 
    emoji: "🚶", 
    bulgarian: "Право", 
    romanized: "pravo", 
    english: "Straight",
    story: { bulgarian: "Продължи право.", romanized: "Prodalzhi pravo.", english: "Continue straight." }
  },
  { 
    emoji: "⬆️➡️", 
    bulgarian: "Горе", 
    romanized: "gore", 
    english: "Up/Above",
    story: { bulgarian: "Погледни горе.", romanized: "Pogledni gore.", english: "Look up." }
  },
  { 
    emoji: "⬇️➡️", 
    bulgarian: "Долу", 
    romanized: "dolu", 
    english: "Down/Below",
    story: { bulgarian: "Слез долу.", romanized: "Slez dolu.", english: "Go down." }
  },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const DirectionsBeginnerLesson = () => {
  const [phase, setPhase] = useState<'learn' | 'practice' | 'quiz'>('learn');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [practiceQuestions, setPracticeQuestions] = useState<DirectionWord[]>([]);
  const [practiceStep, setPracticeStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizStep, setQuizStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isRevision, setIsRevision] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateXP } = useAuth();
  const { canEarnXP, isLessonCompleted, refetch } = useUserProgress();

  useEffect(() => {
    setIsRevision(isLessonCompleted(LESSON_ID));
  }, []);

  useEffect(() => {
    if (phase === 'practice' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, practiceStep]);

  const currentWord = directionWords[currentWordIndex];
  const currentPractice = practiceQuestions[practiceStep];
  const currentQuiz = quizQuestions[quizStep];

  const progress = phase === 'learn' 
    ? ((currentWordIndex + 1) / directionWords.length) * 100 
    : phase === 'practice'
    ? ((practiceStep + 1) / practiceQuestions.length) * 100
    : ((quizStep + 1) / quizQuestions.length) * 100;

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

  const startPractice = () => {
    setPracticeQuestions(shuffleArray([...directionWords]));
    setPhase('practice');
  };

  const checkPracticeAnswer = () => {
    if (!currentPractice) return;
    const correct = userInput.toLowerCase().trim() === currentPractice.romanized.toLowerCase();
    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const nextPractice = () => {
    if (practiceStep < practiceQuestions.length - 1) {
      setPracticeStep(practiceStep + 1);
      setUserInput("");
      setIsCorrect(null);
    } else {
      // Start quiz phase
      const shuffled = shuffleArray([...directionWords]);
      const quizQs = shuffled.slice(0, 8).map(word => {
        const wrongOptions = shuffleArray(directionWords.filter(d => d.romanized !== word.romanized))
          .slice(0, 3)
          .map(d => ({ bulgarian: d.bulgarian, romanized: d.romanized }));
        return {
          emoji: word.emoji,
          bulgarian: word.bulgarian,
          romanized: word.romanized,
          english: word.english,
          options: shuffleArray([{ bulgarian: word.bulgarian, romanized: word.romanized }, ...wrongOptions]),
        };
      });
      setQuizQuestions(quizQs);
      setPhase('quiz');
    }
  };

  const handleQuizSelect = (romanized: string) => {
    if (quizCorrect !== null) return;
    setSelectedAnswer(romanized);
    const correct = romanized === currentQuiz.romanized;
    setQuizCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const nextQuiz = async () => {
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
      setSelectedAnswer(null);
      setQuizCorrect(null);
    } else {
      const canEarn = canEarnXP(LESSON_ID);
      let xpEarned = 0;
      const totalQuestions = practiceQuestions.length + quizQuestions.length;
      
      if (canEarn && !isRevision && user?.id) {
        const baseXP = Math.round((correctAnswers / totalQuestions) * XP_REWARD);
        xpEarned = baseXP;
        await updateXP(xpEarned);
        
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_id: LESSON_ID,
          completed: true,
          score: xpEarned,
          correct_answers: correctAnswers,
          total_answers: totalQuestions,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
        
        refetch();
      }
      
      setEarnedXP(xpEarned);
      setIsComplete(true);
    }
  };

  useLessonKeyboardNavigation({
    isAnswered: phase === 'practice' ? isCorrect !== null : quizCorrect !== null,
    onNext: phase === 'practice' ? nextPractice : nextQuiz,
    disabled: isComplete || phase === 'learn',
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
        totalQuestions={practiceQuestions.length + quizQuestions.length}
        isRevision={isRevision}
      />
    );
  }

  // Learning phase - show words with stories
  if (phase === 'learn') {
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
            <span className="text-sm font-medium">{currentWordIndex + 1}/{directionWords.length}</span>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                Learn Direction Words
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-5 h-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Hover over the story to see the translation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-6xl mb-4">{currentWord.emoji}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-4xl font-bold">{currentWord.bulgarian}</p>
                  <Button variant="ghost" size="icon" onClick={() => playPronunciation(currentWord.bulgarian)}>
                    <Volume2 className="w-6 h-6" />
                  </Button>
                </div>
                <p className="text-xl text-muted-foreground mb-1">{currentWord.romanized}</p>
                <p className="text-2xl font-semibold text-primary">{currentWord.english}</p>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-accent/50 p-4 rounded-lg cursor-help hover:bg-accent/70 transition-colors">
                      <p className="text-sm font-medium mb-2">Example (hover for translation):</p>
                      <p className="text-lg font-medium">{currentWord.story.bulgarian}</p>
                      <p className="text-sm text-muted-foreground">{currentWord.story.romanized}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-base">{currentWord.story.english}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex gap-4">
                {currentWordIndex > 0 && (
                  <Button variant="outline" onClick={() => setCurrentWordIndex(currentWordIndex - 1)} className="flex-1">
                    Previous
                  </Button>
                )}
                {currentWordIndex < directionWords.length - 1 ? (
                  <Button onClick={() => setCurrentWordIndex(currentWordIndex + 1)} className="flex-1">
                    Next Word
                  </Button>
                ) : (
                  <Button onClick={startPractice} className="flex-1">
                    Start Practice
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Practice phase - type the romanized word
  if (phase === 'practice' && currentPractice) {
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
            <span className="text-sm font-medium">{practiceStep + 1}/{practiceQuestions.length}</span>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">Type the romanized word</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-6xl mb-4">{currentPractice.emoji}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-3xl font-bold">{currentPractice.bulgarian}</p>
                  <Button variant="ghost" size="icon" onClick={() => playPronunciation(currentPractice.bulgarian)}>
                    <Volume2 className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-lg text-primary">{currentPractice.english}</p>
              </div>

              <div className="space-y-4">
                <Input
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type the romanized word..."
                  className="text-center text-xl"
                  disabled={isCorrect !== null}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isCorrect === null) {
                      checkPracticeAnswer();
                    }
                  }}
                />

                {isCorrect === null && (
                  <Button onClick={checkPracticeAnswer} className="w-full" disabled={!userInput.trim()}>
                    Check Answer
                  </Button>
                )}

                {isCorrect !== null && (
                  <div className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg animate-fade-in",
                    isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                  )}>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
                      ) : (
                        <><X className="w-6 h-6" /><span className="font-bold">Not quite!</span></>
                      )}
                    </div>
                    {!isCorrect && (
                      <p className="text-foreground">The correct answer is: <span className="font-bold">{currentPractice.romanized}</span></p>
                    )}
                  </div>
                )}

                {isCorrect !== null && (
                  <Button onClick={nextPractice} className="w-full">
                    {practiceStep < practiceQuestions.length - 1 ? "Next" : "Start Quiz"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="text-center text-muted-foreground">
            <p>Correct: {correctAnswers}/{practiceStep + (isCorrect !== null ? 1 : 0)}</p>
          </div>
        </div>
      </div>
    );
  }

  // Quiz phase - choose the correct Bulgarian word for the emoji
  if (phase === 'quiz' && currentQuiz) {
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
            <span className="text-sm font-medium">{quizStep + 1}/{quizQuestions.length}</span>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">Choose the correct direction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-7xl mb-4">{currentQuiz.emoji}</p>
                <p className="text-lg text-muted-foreground">{currentQuiz.english}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {currentQuiz.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={cn(
                      "h-20 flex flex-col gap-1",
                      quizCorrect !== null && option.romanized === currentQuiz.romanized && "bg-green-500 text-white border-green-500",
                      quizCorrect === false && selectedAnswer === option.romanized && "bg-red-500 text-white border-red-500"
                    )}
                    onClick={() => handleQuizSelect(option.romanized)}
                    disabled={quizCorrect !== null}
                  >
                    <span className="text-xl font-bold">{option.bulgarian}</span>
                    <span className="text-sm opacity-80">{option.romanized}</span>
                  </Button>
                ))}
              </div>

              {quizCorrect !== null && (
                <div className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg animate-fade-in",
                  quizCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                )}>
                  <div className="flex items-center gap-2">
                    {quizCorrect ? (
                      <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
                    ) : (
                      <><X className="w-6 h-6" /><span className="font-bold">Not quite!</span></>
                    )}
                  </div>
                  {!quizCorrect && (
                    <p className="text-foreground">
                      The correct answer is: <span className="font-bold">{currentQuiz.bulgarian}</span> ({currentQuiz.romanized})
                    </p>
                  )}
                </div>
              )}

              {quizCorrect !== null && (
                <Button onClick={nextQuiz} className="w-full">
                  {quizStep < quizQuestions.length - 1 ? "Next" : "Complete Lesson"}
                </Button>
              )}
            </CardContent>
          </Card>
          <div className="text-center text-muted-foreground">
            <p>Correct: {correctAnswers}/{practiceQuestions.length + quizStep + (quizCorrect !== null ? 1 : 0)}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DirectionsBeginnerLesson;
