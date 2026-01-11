import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Zap, Timer, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useDailyGameXP } from "@/hooks/useDailyGameXP";
import { useLeague } from "@/hooks/useLeague";


interface WordPair {
  bulgarian: string;
  english: string;
  romanized: string;
}

const wordBank: WordPair[] = [
  { bulgarian: "куче", english: "Dog", romanized: "kuche" },
  { bulgarian: "котка", english: "Cat", romanized: "kotka" },
  { bulgarian: "вода", english: "Water", romanized: "voda" },
  { bulgarian: "хляб", english: "Bread", romanized: "hlyab" },
  { bulgarian: "къща", english: "House", romanized: "kashta" },
  { bulgarian: "дърво", english: "Tree", romanized: "darvo" },
  { bulgarian: "слънце", english: "Sun", romanized: "slantse" },
  { bulgarian: "луна", english: "Moon", romanized: "luna" },
  { bulgarian: "звезда", english: "Star", romanized: "zvezda" },
  { bulgarian: "река", english: "River", romanized: "reka" },
  { bulgarian: "планина", english: "Mountain", romanized: "planina" },
  { bulgarian: "море", english: "Sea", romanized: "more" },
  { bulgarian: "книга", english: "Book", romanized: "kniga" },
  { bulgarian: "маса", english: "Table", romanized: "masa" },
  { bulgarian: "стол", english: "Chair", romanized: "stol" },
  { bulgarian: "прозорец", english: "Window", romanized: "prozorets" },
  { bulgarian: "врата", english: "Door", romanized: "vrata" },
  { bulgarian: "ден", english: "Day", romanized: "den" },
  { bulgarian: "нощ", english: "Night", romanized: "nosht" },
  { bulgarian: "сутрин", english: "Morning", romanized: "sutrin" },
  { bulgarian: "вечер", english: "Evening", romanized: "vecher" },
  { bulgarian: "ябълка", english: "Apple", romanized: "yabalka" },
  { bulgarian: "портокал", english: "Orange", romanized: "portokal" },
  { bulgarian: "банан", english: "Banana", romanized: "banan" },
  { bulgarian: "месо", english: "Meat", romanized: "meso" },
  { bulgarian: "риба", english: "Fish", romanized: "riba" },
  { bulgarian: "пиле", english: "Chicken", romanized: "pile" },
  { bulgarian: "яйце", english: "Egg", romanized: "yaytse" },
  { bulgarian: "мляко", english: "Milk", romanized: "mlyako" },
  { bulgarian: "кафе", english: "Coffee", romanized: "kafe" },
];

const ROUND_TIME = 7;
const QUESTIONS_PER_ROUND = 15;

const RapidFireGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, updateXP } = useAuth();
  const { playCorrect, playIncorrect } = useSoundEffects();
  const { hasEarnedToday, markAsEarned, canEarnXP } = useDailyGameXP("rapid-fire");
  const { addWeeklyXP } = useLeague();
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [xpAwarded, setXpAwarded] = useState(0);

  // Generate questions with shuffled wrong answers
  const questions = useMemo(() => {
    const shuffled = [...wordBank].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, QUESTIONS_PER_ROUND).map(word => {
      const wrongAnswers = wordBank
        .filter(w => w.english !== word.english)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map(w => w.english);
      
      const options = [word.english, ...wrongAnswers].sort(() => Math.random() - 0.5);
      return { ...word, options };
    });
  }, [gameState]);

  const current = questions[currentQuestion];

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return ROUND_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentQuestion]);

  const handleTimeout = useCallback(() => {
    playIncorrect();
    setStreak(0);
    setShowFeedback("wrong");
    setTimeout(() => {
      setShowFeedback(null);
      if (currentQuestion < QUESTIONS_PER_ROUND - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(ROUND_TIME);
      } else {
        endGame();
      }
    }, 500);
  }, [currentQuestion]);

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    
    const isCorrect = answer === current.english;
    
    if (isCorrect) {
      playCorrect();
      const timeBonus = Math.floor(timeLeft / 3);
      const streakBonus = streak >= 3 ? 5 : 0;
      setScore(prev => prev + 10 + timeBonus + streakBonus);
      setStreak(prev => prev + 1);
      setShowFeedback("correct");
    } else {
      playIncorrect();
      setStreak(0);
      setShowFeedback("wrong");
    }

    setTimeout(() => {
      setShowFeedback(null);
      if (currentQuestion < QUESTIONS_PER_ROUND - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(ROUND_TIME);
      } else {
        endGame();
      }
    }, 500);
  };

  const endGame = async () => {
    setGameState("finished");
    if (user?.id && score > 0 && canEarnXP) {
      const xpEarned = Math.floor(score / 2);
      await updateXP(xpEarned);
      await addWeeklyXP(xpEarned);
      markAsEarned();
      setXpAwarded(xpEarned);
      toast({
        title: "Game Complete!",
        description: `You earned ${xpEarned} XP!`,
      });
    } else if (hasEarnedToday) {
      toast({
        title: "Game Complete!",
        description: "Practice mode - XP already earned today!",
      });
    }
  };

  const startGame = () => {
    setGameState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(ROUND_TIME);
    setStreak(0);
  };

  const handleBack = () => {
    const returnTo = location.state?.returnCategory;
    if (returnTo) {
      navigate("/", { state: { selectedCategory: returnTo } });
    } else {
      navigate("/");
    }
  };

  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" size="sm" onClick={handleBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Card className="p-8 text-center">
            <Zap className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Rapid-Fire Translation</h1>
            <p className="text-muted-foreground mb-6">
              You have 7 seconds per word. Choose the correct translation from 3 options.
              Build streaks for bonus points!
            </p>
            {hasEarnedToday && (
              <div className="p-3 bg-muted rounded-lg mb-4 text-sm text-muted-foreground">
                ✓ XP already earned today - playing for practice!
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-bold text-lg">15</div>
                <div className="text-muted-foreground">Questions</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-bold text-lg">7s</div>
                <div className="text-muted-foreground">Per Word</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-bold text-lg">3x</div>
                <div className="text-muted-foreground">Streak Bonus</div>
              </div>
            </div>
            <Button onClick={startGame} size="lg" className="gap-2">
              <Zap className="w-5 h-5" />
              {hasEarnedToday ? "Play Again (Practice)" : "Start Game"}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === "finished") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Game Complete!</h1>
            <div className="text-6xl font-bold text-primary mb-4">{score}</div>
            <p className="text-xl text-muted-foreground mb-2">Total Points</p>
            {xpAwarded > 0 ? (
              <p className="text-lg text-green-500 mb-4">+{xpAwarded} XP earned!</p>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">Practice mode - no XP</p>
            )}
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleBack}>
                Back to Home
              </Button>
              <Button onClick={() => { setGameState("ready"); setXpAwarded(0); }}>
                Play Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1}/{QUESTIONS_PER_ROUND}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {streak >= 3 && (
              <div className="text-sm font-bold text-orange-500 animate-pulse">
                🔥 {streak}x Streak!
              </div>
            )}
            <div className="font-bold text-lg">Score: {score}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer className={cn("w-5 h-5", timeLeft <= 5 && "text-red-500 animate-pulse")} />
            <span className={cn("font-bold", timeLeft <= 5 && "text-red-500")}>{timeLeft}s</span>
          </div>
          <Progress value={(timeLeft / ROUND_TIME) * 100} className="h-3" />
        </div>

        <Card className={cn(
          "p-8 transition-all duration-200",
          showFeedback === "correct" && "border-green-500 bg-green-500/10",
          showFeedback === "wrong" && "border-red-500 bg-red-500/10"
        )}>
          <div className="text-center mb-8">
            <div className="text-5xl font-bold mb-2">{current.bulgarian}</div>
            <div className="text-lg text-muted-foreground">{current.romanized}</div>
          </div>

          <div className="grid gap-3">
            {current.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={!!showFeedback}
                className={cn(
                  "p-4 rounded-lg border-2 text-lg font-medium transition-all",
                  "hover:border-primary hover:bg-primary/10",
                  showFeedback && option === current.english && "border-green-500 bg-green-500/20",
                  showFeedback === "wrong" && option !== current.english && "opacity-50"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RapidFireGame;