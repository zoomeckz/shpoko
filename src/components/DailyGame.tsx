import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gamepad2, Clock, Trophy, Star, Lock, SkipForward, Check } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

interface GameItem {
  emoji: string;
  english: string;
  bulgarian: string;
}

interface DailyGameProps {
  title: string;
  gameType: "animal" | "color" | "number";
  items: GameItem[];
  icon?: React.ReactNode;
}

const GAME_DURATION = 60;
const MAX_SPEED_BONUS = 50;

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return matrix[b.length][a.length];
}

export const DailyGame = ({ title, gameType, items, icon }: DailyGameProps) => {
  const { user, profile, updateXP } = useAuth();
  const { languageMode } = useLanguageMode();
  const isSpanish = languageMode === "spanish";
  const { playCorrect, playIncorrect, playComplete, playSkip } = useSoundEffects();
  const [isOpen, setIsOpen] = useState(false);
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [currentItem, setCurrentItem] = useState<GameItem | null>(null);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [canPlay, setCanPlay] = useState(true);
  const [nextPlayTime, setNextPlayTime] = useState<Date | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ correct: string; points: number; type: "success" | "info" } | null>(null);

  const storageKey = `game_${gameType}_last_played`;

  useEffect(() => {
    if (user) {
      checkPlayEligibility();
    }
  }, [user]);

  const checkPlayEligibility = async () => {
    if (!user) return;
    setLoading(true);

    // Check local storage for last played time
    const lastPlayedStr = localStorage.getItem(`${storageKey}_${user.id}`);
    const highScoreStr = localStorage.getItem(`${storageKey}_highscore_${user.id}`);
    
    if (highScoreStr) {
      setHighScore(parseInt(highScoreStr, 10));
    }

    if (lastPlayedStr) {
      const lastPlayed = new Date(lastPlayedStr);
      const now = new Date();
      const hoursSinceLastPlay = (now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastPlay < 24) {
        setCanPlay(false);
        setNextPlayTime(new Date(lastPlayed.getTime() + 24 * 60 * 60 * 1000));
      } else {
        setCanPlay(true);
        setNextPlayTime(null);
      }
    }

    setLoading(false);
  };

  const getRandomItem = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }, [items]);

  const startGame = () => {
    if (!canPlay) return;
    setGameState("playing");
    setScore(0);
    setAnsweredCount(0);
    setTimeLeft(GAME_DURATION);
    setCurrentItem(getRandomItem());
    setQuestionStartTime(Date.now());
    setUserInput("");
    setFeedback(null);
  };

  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const calculateScore = (userAnswer: string, correctAnswer: string, responseTimeMs: number): number => {
    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase();
    const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
    const maxLength = Math.max(normalizedUser.length, normalizedCorrect.length);
    const accuracy = maxLength > 0 ? Math.max(0, 1 - distance / maxLength) : 0;
    const accuracyScore = Math.round(accuracy * 100);
    const maxTimeForBonus = 5000;
    const speedFactor = Math.max(0, 1 - responseTimeMs / maxTimeForBonus);
    const speedBonus = Math.round(speedFactor * MAX_SPEED_BONUS);
    return accuracyScore + speedBonus;
  };

  const submitAnswer = () => {
    if (!currentItem || gameState !== "playing") return;
    const responseTime = Date.now() - questionStartTime;
    const pointsEarned = calculateScore(userInput, currentItem.bulgarian, responseTime);

    setScore((prev) => prev + pointsEarned);
    setAnsweredCount((prev) => prev + 1);

    // Play sound based on score
    if (pointsEarned >= 50) {
      playCorrect();
    } else if (pointsEarned > 0) {
      playCorrect();
    } else {
      playIncorrect();
    }

    setFeedback({
      correct: currentItem.bulgarian,
      points: pointsEarned,
      type: pointsEarned >= 50 ? "success" : "info",
    });

    setUserInput("");
    setCurrentItem(getRandomItem());
    setQuestionStartTime(Date.now());
  };

  const skipQuestion = () => {
    if (!currentItem || gameState !== "playing") return;
    
    playSkip();
    
    setFeedback({
      correct: currentItem.bulgarian,
      points: 0,
      type: "info",
    });

    setUserInput("");
    setCurrentItem(getRandomItem());
    setQuestionStartTime(Date.now());
  };

  const endGame = async () => {
    setGameState("finished");
    playComplete();
    if (!user) return;

    const currentHighScore = parseInt(localStorage.getItem(`${storageKey}_highscore_${user.id}`) || "0", 10);
    const newHighScore = Math.max(score, currentHighScore);

    localStorage.setItem(`${storageKey}_${user.id}`, new Date().toISOString());
    localStorage.setItem(`${storageKey}_highscore_${user.id}`, newHighScore.toString());

    const xpEarned = Math.floor(score / 10);
    if (xpEarned > 0) {
      await updateXP(xpEarned);
    }

    setHighScore(newHighScore);
    setCanPlay(false);
    setNextPlayTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submitAnswer();
  };

  const formatTimeRemaining = () => {
    if (!nextPlayTime) return "";
    const now = new Date();
    const diff = nextPlayTime.getTime() - now.getTime();
    if (diff <= 0) return "Now!";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!user || !profile) return null;

  const isPlayed = !canPlay;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className={cn(
          "cursor-pointer hover:shadow-lg transition-all",
          isPlayed 
            ? "border-2 border-green-500 bg-gradient-to-br from-green-500/10 to-green-400/5 scale-90" 
            : "border-2 border-yellow-400 bg-gradient-to-br from-yellow-500/10 to-yellow-400/5"
        )}>
          <CardContent className={cn("flex flex-col items-center text-center gap-1", isPlayed ? "p-2" : "p-4")}>
            <div className={cn("rounded-full", isPlayed ? "p-1.5 bg-green-500/20" : "p-3 bg-yellow-500/20")}>
              {isPlayed ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                icon || <Gamepad2 className="w-6 h-6 text-yellow-500" />
              )}
            </div>
            <h3 className={cn("font-bold", isPlayed ? "text-sm" : "text-lg")}>{title}</h3>
            <p className="text-xs text-muted-foreground">
              {canPlay ? (isSpanish ? "Играй сега!" : "Play now!") : `${formatTimeRemaining()}`}
            </p>
            {highScore > 0 && (
              <div className={cn("flex items-center gap-1", isPlayed ? "text-green-500" : "text-yellow-500")}>
                <Trophy className="w-3 h-3" />
                <span className="text-xs font-bold">{highScore}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon || <Gamepad2 className="w-5 h-5" />}
            {title}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : gameState === "idle" ? (
          <div className="space-y-4 text-center py-4">
            <p className="text-muted-foreground">
              {isSpanish 
                ? "Напиши испанското име възможно най-бързо!" 
                : "Type the Bulgarian name (romanized) as fast as you can!"}
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <Star className="w-6 h-6 text-yellow-500 mx-auto" />
                <p className="text-sm">{isSpanish ? "Точност" : "Accuracy"}</p>
                <p className="text-xs text-muted-foreground">{isSpanish ? "До 100 точки" : "Up to 100 pts"}</p>
              </div>
              <div className="text-center">
                <Clock className="w-6 h-6 text-primary mx-auto" />
                <p className="text-sm">{isSpanish ? "Скорост" : "Speed"}</p>
                <p className="text-xs text-muted-foreground">{isSpanish ? "До 50 точки" : "Up to 50 pts"}</p>
              </div>
            </div>
            {highScore > 0 && (
              <p className="text-sm">
                {isSpanish ? "Твой рекорд: " : "Your high score: "}<span className="font-bold text-yellow-500">{highScore}</span>
              </p>
            )}
            {canPlay ? (
              <Button onClick={startGame} size="lg" className="w-full">
                {isSpanish ? "Започни игра (60с)" : "Start Game (60s)"}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-error">{isSpanish ? "Върни се след " : "Come back in "}{formatTimeRemaining()}</p>
                <Button disabled className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  {isSpanish ? "Играта е заключена" : "Game Locked"}
                </Button>
              </div>
            )}
          </div>
        ) : gameState === "playing" ? (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                <span className={timeLeft <= 10 ? "text-error font-bold" : ""}>{timeLeft}s</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold">{score}</span>
              </div>
            </div>

            {currentItem && (
              <div className="text-center space-y-3">
                <div className="text-8xl">{currentItem.emoji}</div>
                <p className="text-2xl font-bold">{currentItem.english}</p>
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isSpanish ? "Напиши испанското име..." : "Type Bulgarian name..."}
                  className="text-center text-lg"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button onClick={skipQuestion} variant="outline" className="flex-1">
                    <SkipForward className="w-4 h-4 mr-2" />
                    {isSpanish ? "Пропусни" : "Skip"}
                  </Button>
                  <Button onClick={submitAnswer} className="flex-1">
                    {isSpanish ? "Изпрати" : "Submit"}
                  </Button>
                </div>
              </div>
            )}

            {/* Inline feedback below the game */}
            {feedback && (
              <div className={`p-3 rounded-lg text-center ${feedback.type === "success" ? "bg-green-500/20 text-green-600" : "bg-blue-500/20 text-blue-600"}`}>
                <p className="font-medium">
                  +{feedback.points} {isSpanish ? "точки" : "points"} {feedback.points === 0 && (isSpanish ? "(Пропуснато)" : "(Skipped)")}
                </p>
                <p className="text-sm">{isSpanish ? "Отговор: " : "Correct: "}<span className="font-bold">{feedback.correct}</span></p>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">{isSpanish ? "Отговорено" : "Answered"}: {answeredCount}</p>
          </div>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-bold">{isSpanish ? "Край на играта!" : "Game Over!"}</h3>
            <div className="space-y-2">
              <p className="text-lg">
                {isSpanish ? "Краен резултат: " : "Final Score: "}<span className="font-bold text-primary">{score}</span>
              </p>
              <p className="text-sm text-muted-foreground">{isSpanish ? "Отговорено" : "Answered"}: {answeredCount}</p>
              {score > 0 && score >= highScore && <p className="text-yellow-500 font-bold">🏆 {isSpanish ? "Нов рекорд!" : "New High Score!"}</p>}
              <p className="text-sm">
                {isSpanish ? "Спечелен опит: " : "XP Earned: "}<span className="font-bold text-primary">+{Math.floor(score / 10)}</span>
              </p>
            </div>
            <Button onClick={() => setIsOpen(false)} className="w-full">
              {isSpanish ? "Затвори" : "Close"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};