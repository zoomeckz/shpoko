import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Infinity, Skull, Trophy, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useDailyGameXP } from "@/hooks/useDailyGameXP";
import { useLeague } from "@/hooks/useLeague";

interface VerbConjugation {
  infinitive: string;
  english: string;
  conjugations: {
    az: string;      // аз (I)
    ti: string;      // ти (you)
    toy: string;     // той/тя (he/she)
    nie: string;     // ние (we)
    vie: string;     // вие (you pl.)
    te: string;      // те (they)
  };
}

const verbs: VerbConjugation[] = [
  {
    infinitive: "съм",
    english: "to be",
    conjugations: { az: "съм", ti: "си", toy: "е", nie: "сме", vie: "сте", te: "са" }
  },
  {
    infinitive: "имам",
    english: "to have",
    conjugations: { az: "имам", ti: "имаш", toy: "има", nie: "имаме", vie: "имате", te: "имат" }
  },
  {
    infinitive: "говоря",
    english: "to speak",
    conjugations: { az: "говоря", ti: "говориш", toy: "говори", nie: "говорим", vie: "говорите", te: "говорят" }
  },
  {
    infinitive: "чета",
    english: "to read",
    conjugations: { az: "чета", ti: "четеш", toy: "чете", nie: "четем", vie: "четете", te: "четат" }
  },
  {
    infinitive: "пиша",
    english: "to write",
    conjugations: { az: "пиша", ti: "пишеш", toy: "пише", nie: "пишем", vie: "пишете", te: "пишат" }
  },
  {
    infinitive: "ям",
    english: "to eat",
    conjugations: { az: "ям", ti: "ядеш", toy: "яде", nie: "ядем", vie: "ядете", te: "ядат" }
  },
  {
    infinitive: "пия",
    english: "to drink",
    conjugations: { az: "пия", ti: "пиеш", toy: "пие", nie: "пием", vie: "пиете", te: "пият" }
  },
  {
    infinitive: "отивам",
    english: "to go",
    conjugations: { az: "отивам", ti: "отиваш", toy: "отива", nie: "отиваме", vie: "отивате", te: "отиват" }
  },
  {
    infinitive: "идвам",
    english: "to come",
    conjugations: { az: "идвам", ti: "идваш", toy: "идва", nie: "идваме", vie: "идвате", te: "идват" }
  },
  {
    infinitive: "обичам",
    english: "to love",
    conjugations: { az: "обичам", ti: "обичаш", toy: "обича", nie: "обичаме", vie: "обичате", te: "обичат" }
  },
];

const pronouns = [
  { key: "az" as const, bulgarian: "аз", english: "I" },
  { key: "ti" as const, bulgarian: "ти", english: "you" },
  { key: "toy" as const, bulgarian: "той/тя", english: "he/she" },
  { key: "nie" as const, bulgarian: "ние", english: "we" },
  { key: "vie" as const, bulgarian: "вие", english: "you (pl.)" },
  { key: "te" as const, bulgarian: "те", english: "they" },
];

type GameMode = "timed" | "endless" | "sudden-death";

const ConjugationGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, updateXP } = useAuth();
  const { playCorrect, playIncorrect } = useSoundEffects();
  const { hasEarnedToday, markAsEarned, canEarnXP } = useDailyGameXP("conjugation");
  const { addWeeklyXP } = useLeague();
  
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "finished">("menu");
  const [currentVerbIndex, setCurrentVerbIndex] = useState(0);
  const [currentPronounIndex, setCurrentPronounIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [xpAwarded, setXpAwarded] = useState(0);

  // Shuffle verbs for variety
  const shuffledVerbs = useMemo(() => {
    return [...verbs].sort(() => Math.random() - 0.5);
  }, [gameState]);

  // Shuffle pronouns for each verb - randomize the order
  const shuffledPronouns = useMemo(() => {
    return [...pronouns].sort(() => Math.random() - 0.5);
  }, [currentVerbIndex, gameState]);

  const currentVerb = shuffledVerbs[currentVerbIndex % shuffledVerbs.length];
  const currentPronoun = shuffledPronouns[currentPronounIndex % shuffledPronouns.length];
  const correctAnswer = currentVerb.conjugations[currentPronoun.key];

  // Generate options (correct + 2 wrong from other verbs' conjugations for the same pronoun)
  const options = useMemo(() => {
    // Get wrong options from OTHER verbs for the same pronoun to ensure diversity
    const wrongOptions: string[] = [];
    const otherVerbs = shuffledVerbs.filter((_, idx) => idx !== currentVerbIndex % shuffledVerbs.length);
    
    for (const verb of otherVerbs) {
      const wrongConjugation = verb.conjugations[currentPronoun.key];
      if (wrongConjugation !== correctAnswer && !wrongOptions.includes(wrongConjugation)) {
        wrongOptions.push(wrongConjugation);
        if (wrongOptions.length >= 2) break;
      }
    }
    
    // Fallback: if we still need more options, get from current verb's other conjugations
    if (wrongOptions.length < 2) {
      const currentVerbOtherForms = Object.values(currentVerb.conjugations)
        .filter(c => c !== correctAnswer && !wrongOptions.includes(c));
      for (const form of currentVerbOtherForms) {
        if (!wrongOptions.includes(form)) {
          wrongOptions.push(form);
          if (wrongOptions.length >= 2) break;
        }
      }
    }
    
    return [correctAnswer, ...wrongOptions.slice(0, 2)].sort(() => Math.random() - 0.5);
  }, [currentVerbIndex, currentPronounIndex, shuffledVerbs, currentVerb, currentPronoun, correctAnswer]);

  // Timer for timed mode
  useEffect(() => {
    if (gameState !== "playing" || gameMode !== "timed") return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, gameMode]);

  const nextQuestion = () => {
    const nextPronoun = (currentPronounIndex + 1) % shuffledPronouns.length;
    if (nextPronoun === 0) {
      setCurrentVerbIndex(prev => prev + 1);
    }
    setCurrentPronounIndex(nextPronoun);
    setQuestionsAnswered(prev => prev + 1);
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    
    const isCorrect = answer === correctAnswer;
    
    if (isCorrect) {
      playCorrect();
      setScore(prev => prev + 10);
      setShowFeedback("correct");
    } else {
      playIncorrect();
      setShowFeedback("wrong");
      
      if (gameMode === "sudden-death") {
        setTimeout(() => endGame(), 500);
        return;
      }
      
      if (gameMode === "endless") {
        setLives(prev => {
          if (prev <= 1) {
            setTimeout(() => endGame(), 500);
            return 0;
          }
          return prev - 1;
        });
      }
    }

    setTimeout(() => {
      setShowFeedback(null);
      nextQuestion();
    }, 500);
  };

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameState("playing");
    setCurrentVerbIndex(0);
    setCurrentPronounIndex(0);
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setQuestionsAnswered(0);
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

  const handleBack = () => {
    const returnTo = location.state?.returnCategory;
    if (returnTo) {
      navigate("/", { state: { selectedCategory: returnTo } });
    } else {
      navigate("/");
    }
  };

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" size="sm" onClick={handleBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Card className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Speed Conjugation Arena</h1>
            <p className="text-muted-foreground mb-4">
              Master Bulgarian verb conjugations! Pick the correct form for each pronoun.
            </p>
            {hasEarnedToday && (
              <div className="p-3 bg-muted rounded-lg mb-4 text-sm text-muted-foreground">
                ✓ XP already earned today - playing for practice!
              </div>
            )}
            
            <div className="grid gap-4">
              <Button 
                onClick={() => startGame("timed")} 
                size="lg" 
                className="gap-2 h-auto py-4"
                variant="outline"
              >
                <Clock className="w-6 h-6 text-blue-500" />
                <div className="text-left">
                  <div className="font-bold">Timed Mode</div>
                  <div className="text-sm text-muted-foreground">60 seconds - Score as much as you can!</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => startGame("endless")} 
                size="lg" 
                className="gap-2 h-auto py-4"
                variant="outline"
              >
                <Infinity className="w-6 h-6 text-green-500" />
                <div className="text-left">
                  <div className="font-bold">Endless Mode</div>
                  <div className="text-sm text-muted-foreground">3 lives - Keep going until you run out!</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => startGame("sudden-death")} 
                size="lg" 
                className="gap-2 h-auto py-4"
                variant="outline"
              >
                <Skull className="w-6 h-6 text-red-500" />
                <div className="text-left">
                  <div className="font-bold">Sudden Death</div>
                  <div className="text-sm text-muted-foreground">One mistake = Game Over!</div>
                </div>
              </Button>
            </div>
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
            <h1 className="text-3xl font-bold mb-4">Game Over!</h1>
            <div className="text-6xl font-bold text-primary mb-2">{score}</div>
            <p className="text-muted-foreground mb-2">Points</p>
            {xpAwarded > 0 ? (
              <p className="text-lg text-green-500 mb-2">+{xpAwarded} XP earned!</p>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">Practice mode - no XP</p>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              {questionsAnswered} questions answered
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleBack}>
                Back to Home
              </Button>
              <Button onClick={() => { setGameState("menu"); setXpAwarded(0); }}>
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
          <div className="flex items-center gap-4">
            {gameMode === "timed" && (
              <div className={cn("flex items-center gap-1", timeLeft <= 10 && "text-red-500 animate-pulse")}>
                <Clock className="w-5 h-5" />
                <span className="font-bold">{timeLeft}s</span>
              </div>
            )}
            {gameMode === "endless" && (
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart key={i} className={cn("w-5 h-5", i < lives ? "text-red-500 fill-red-500" : "text-muted")} />
                ))}
              </div>
            )}
            {gameMode === "sudden-death" && (
              <div className="flex items-center gap-1 text-red-500">
                <Skull className="w-5 h-5" />
                <span className="text-sm font-bold">Sudden Death</span>
              </div>
            )}
          </div>
          <div className="font-bold text-lg">Score: {score}</div>
        </div>

        <Card className={cn(
          "p-8 transition-all duration-200",
          showFeedback === "correct" && "border-green-500 bg-green-500/10",
          showFeedback === "wrong" && "border-red-500 bg-red-500/10"
        )}>
          <div className="text-center mb-6">
            <div className="text-sm text-muted-foreground mb-2">Conjugate the verb</div>
            <div className="text-4xl font-bold mb-1">{currentVerb.infinitive}</div>
            <div className="text-lg text-muted-foreground">({currentVerb.english})</div>
          </div>
          
          <div className="text-center mb-8">
            <div className="text-sm text-muted-foreground mb-1">for the pronoun</div>
            <div className="text-3xl font-bold text-primary">{currentPronoun.bulgarian}</div>
            <div className="text-sm text-muted-foreground">({currentPronoun.english})</div>
          </div>

          <div className="grid gap-3">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={!!showFeedback}
                className={cn(
                  "p-4 rounded-lg border-2 text-xl font-medium transition-all flex items-center justify-center text-center",
                  "hover:border-primary hover:bg-primary/10",
                  showFeedback && option === correctAnswer && "border-green-500 bg-green-500/20",
                  showFeedback === "wrong" && option !== correctAnswer && "opacity-50"
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

export default ConjugationGame;