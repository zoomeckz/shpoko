import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gamepad2, Clock, Trophy, Star, Lock } from "lucide-react";
import { toast } from "sonner";

interface Animal {
  emoji: string;
  english: string;
  bulgarian: string; // Romanized Bulgarian
}

const ANIMALS: Animal[] = [
  { emoji: "🐕", english: "Dog", bulgarian: "kuche" },
  { emoji: "🐈", english: "Cat", bulgarian: "kotka" },
  { emoji: "🐦", english: "Bird", bulgarian: "ptica" },
  { emoji: "🐟", english: "Fish", bulgarian: "riba" },
  { emoji: "🐎", english: "Horse", bulgarian: "kon" },
  { emoji: "🐄", english: "Cow", bulgarian: "krava" },
  { emoji: "🐖", english: "Pig", bulgarian: "prase" },
  { emoji: "🐑", english: "Sheep", bulgarian: "ovtsa" },
  { emoji: "🐐", english: "Goat", bulgarian: "koza" },
  { emoji: "🐓", english: "Rooster", bulgarian: "petel" },
  { emoji: "🦆", english: "Duck", bulgarian: "patitsa" },
  { emoji: "🐇", english: "Rabbit", bulgarian: "zaek" },
  { emoji: "🐻", english: "Bear", bulgarian: "mechka" },
  { emoji: "🦊", english: "Fox", bulgarian: "lisitsa" },
  { emoji: "🐺", english: "Wolf", bulgarian: "valk" },
  { emoji: "🦁", english: "Lion", bulgarian: "lav" },
  { emoji: "🐯", english: "Tiger", bulgarian: "tigar" },
  { emoji: "🐘", english: "Elephant", bulgarian: "slon" },
  { emoji: "🦒", english: "Giraffe", bulgarian: "zhiraf" },
  { emoji: "🐒", english: "Monkey", bulgarian: "maimuna" },
];

const GAME_DURATION = 60; // 60 seconds
const MAX_SPEED_BONUS = 50; // Maximum points for speed

// Calculate Levenshtein distance for accuracy scoring
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

export const AnimalGame = () => {
  const { user, profile, updateXP } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [canPlay, setCanPlay] = useState(true);
  const [nextPlayTime, setNextPlayTime] = useState<Date | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check if user can play
  useEffect(() => {
    if (user) {
      checkPlayEligibility();
    }
  }, [user]);

  const checkPlayEligibility = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("game_attempts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking game eligibility:", error);
      setLoading(false);
      return;
    }
    
    if (data) {
      setHighScore(data.high_score);
      const lastPlayed = new Date(data.last_played_at);
      const now = new Date();
      const hoursSinceLastPlay = (now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastPlay < 24) {
        setCanPlay(false);
        const nextPlay = new Date(lastPlayed.getTime() + 24 * 60 * 60 * 1000);
        setNextPlayTime(nextPlay);
      } else {
        setCanPlay(true);
        setNextPlayTime(null);
      }
    }
    
    setLoading(false);
  };

  const getRandomAnimal = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * ANIMALS.length);
    return ANIMALS[randomIndex];
  }, []);

  const startGame = () => {
    if (!canPlay) {
      toast.error("You can only play once every 24 hours!");
      return;
    }
    
    setGameState("playing");
    setScore(0);
    setAnsweredCount(0);
    setTimeLeft(GAME_DURATION);
    setCurrentAnimal(getRandomAnimal());
    setQuestionStartTime(Date.now());
    setUserInput("");
  };

  // Timer countdown
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
    
    // Calculate accuracy score (0-100 based on similarity)
    const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
    const maxLength = Math.max(normalizedUser.length, normalizedCorrect.length);
    const accuracy = maxLength > 0 ? Math.max(0, 1 - distance / maxLength) : 0;
    const accuracyScore = Math.round(accuracy * 100);
    
    // Calculate speed bonus (faster = more points, max 5 seconds for full bonus)
    const maxTimeForBonus = 5000; // 5 seconds
    const speedFactor = Math.max(0, 1 - responseTimeMs / maxTimeForBonus);
    const speedBonus = Math.round(speedFactor * MAX_SPEED_BONUS);
    
    // Total score: accuracy + speed bonus
    return accuracyScore + speedBonus;
  };

  const submitAnswer = () => {
    if (!currentAnimal || gameState !== "playing") return;
    
    const responseTime = Date.now() - questionStartTime;
    const pointsEarned = calculateScore(userInput, currentAnimal.bulgarian, responseTime);
    
    setScore((prev) => prev + pointsEarned);
    setAnsweredCount((prev) => prev + 1);
    
    // Show feedback
    if (pointsEarned >= 100) {
      toast.success(`Perfect! +${pointsEarned} points`);
    } else if (pointsEarned >= 50) {
      toast.success(`Good! +${pointsEarned} points (Correct: ${currentAnimal.bulgarian})`);
    } else {
      toast.info(`+${pointsEarned} points (Correct: ${currentAnimal.bulgarian})`);
    }
    
    // Next question
    setUserInput("");
    setCurrentAnimal(getRandomAnimal());
    setQuestionStartTime(Date.now());
  };

  const endGame = async () => {
    setGameState("finished");
    
    if (!user) return;
    
    // Save game attempt
    const { data: existing } = await supabase
      .from("game_attempts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    const newHighScore = Math.max(score, existing?.high_score || 0);
    
    if (existing) {
      await supabase
        .from("game_attempts")
        .update({
          last_played_at: new Date().toISOString(),
          high_score: newHighScore,
          total_games: existing.total_games + 1,
        })
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("game_attempts")
        .insert({
          user_id: user.id,
          high_score: score,
          total_games: 1,
        });
    }
    
    // Award XP based on score (1 XP per 10 points)
    const xpEarned = Math.floor(score / 10);
    if (xpEarned > 0) {
      await updateXP(xpEarned);
      toast.success(`Game over! You earned ${xpEarned} XP!`);
    }
    
    setHighScore(newHighScore);
    setCanPlay(false);
    setNextPlayTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-full">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Daily Animal Game</h3>
              <p className="text-sm text-muted-foreground">
                {canPlay ? "Play now!" : `Next game in: ${formatTimeRemaining()}`}
              </p>
            </div>
            {!canPlay && <Lock className="w-5 h-5 text-muted-foreground" />}
            {highScore > 0 && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Trophy className="w-4 h-4" />
                <span className="font-bold">{highScore}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Animal Name Game
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : gameState === "idle" ? (
          <div className="space-y-4 text-center py-4">
            <p className="text-muted-foreground">
              Type the Bulgarian name (romanized) for each animal as fast as you can!
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <Star className="w-6 h-6 text-yellow-500 mx-auto" />
                <p className="text-sm">Accuracy</p>
                <p className="text-xs text-muted-foreground">Up to 100 pts</p>
              </div>
              <div className="text-center">
                <Clock className="w-6 h-6 text-primary mx-auto" />
                <p className="text-sm">Speed</p>
                <p className="text-xs text-muted-foreground">Up to 50 pts</p>
              </div>
            </div>
            {highScore > 0 && (
              <p className="text-sm">
                Your high score: <span className="font-bold text-yellow-500">{highScore}</span>
              </p>
            )}
            {canPlay ? (
              <Button onClick={startGame} size="lg" className="w-full">
                Start Game (60s)
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-error">Come back in {formatTimeRemaining()}</p>
                <Button disabled className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Game Locked
                </Button>
              </div>
            )}
          </div>
        ) : gameState === "playing" ? (
          <div className="space-y-6 py-4">
            {/* Timer and Score */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                <span className={timeLeft <= 10 ? "text-error font-bold" : ""}>
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold">{score}</span>
              </div>
            </div>
            
            {/* Current Animal */}
            {currentAnimal && (
              <div className="text-center space-y-4">
                <div className="text-8xl">{currentAnimal.emoji}</div>
                <p className="text-2xl font-bold">{currentAnimal.english}</p>
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type Bulgarian name..."
                  className="text-center text-lg"
                  autoFocus
                />
                <Button onClick={submitAnswer} className="w-full">
                  Submit
                </Button>
              </div>
            )}
            
            <p className="text-center text-sm text-muted-foreground">
              Answered: {answeredCount}
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-bold">Game Over!</h3>
            <div className="space-y-2">
              <p className="text-lg">
                Final Score: <span className="font-bold text-primary">{score}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Animals answered: {answeredCount}
              </p>
              {score > highScore - score && score > 0 && (
                <p className="text-yellow-500 font-bold">🏆 New High Score!</p>
              )}
              <p className="text-sm">
                XP Earned: <span className="font-bold text-primary">+{Math.floor(score / 10)}</span>
              </p>
            </div>
            <Button onClick={() => setIsOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
