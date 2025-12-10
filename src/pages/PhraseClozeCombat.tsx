import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Target, Trophy, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useDailyGameXP } from "@/hooks/useDailyGameXP";

interface ClozeSentence {
  sentence: string[];  // Array of words
  wrongWordIndex: number;
  correctWord: string;
  translation: string;
}

const sentences: ClozeSentence[] = [
  { 
    sentence: ["Аз", "съм", "учител", "добър"], 
    wrongWordIndex: 3, 
    correctWord: "добре",
    translation: "I am a teacher (good)" 
  },
  { 
    sentence: ["Той", "ходи", "на", "работа", "вчера"], 
    wrongWordIndex: 1, 
    correctWord: "отиде",
    translation: "He went to work yesterday" 
  },
  { 
    sentence: ["Ние", "имам", "много", "приятели"], 
    wrongWordIndex: 1, 
    correctWord: "имаме",
    translation: "We have many friends" 
  },
  { 
    sentence: ["Тя", "е", "красива", "момче"], 
    wrongWordIndex: 3, 
    correctWord: "момиче",
    translation: "She is a beautiful girl" 
  },
  { 
    sentence: ["Те", "говорят", "английски", "добре"], 
    wrongWordIndex: 2, 
    correctWord: "български",
    translation: "They speak Bulgarian well" 
  },
  { 
    sentence: ["Искам", "да", "ям", "вода"], 
    wrongWordIndex: 3, 
    correctWord: "храна",
    translation: "I want to eat food" 
  },
  { 
    sentence: ["Котката", "е", "на", "масата", "под"], 
    wrongWordIndex: 4, 
    correctWord: "върху",
    translation: "The cat is on the table" 
  },
  { 
    sentence: ["Днес", "е", "студено", "ден"], 
    wrongWordIndex: 3, 
    correctWord: "време",
    translation: "Today the weather is cold" 
  },
  { 
    sentence: ["Моят", "брат", "е", "млад", "сестра"], 
    wrongWordIndex: 4, 
    correctWord: "момче",
    translation: "My brother is a young boy" 
  },
  { 
    sentence: ["Къде", "е", "най-близката", "ресторант", "?"], 
    wrongWordIndex: 3, 
    correctWord: "ресторантът",
    translation: "Where is the nearest restaurant?" 
  },
  { 
    sentence: ["Вие", "сте", "много", "умен", "хора"], 
    wrongWordIndex: 3, 
    correctWord: "умни",
    translation: "You are very smart people" 
  },
  { 
    sentence: ["Това", "е", "моята", "книга", "нов"], 
    wrongWordIndex: 4, 
    correctWord: "нова",
    translation: "This is my new book" 
  },
  { 
    sentence: ["Аз", "чета", "интересна", "филм"], 
    wrongWordIndex: 3, 
    correctWord: "книга",
    translation: "I am reading an interesting book" 
  },
  { 
    sentence: ["Те", "живеят", "в", "голям", "село"], 
    wrongWordIndex: 3, 
    correctWord: "голямо",
    translation: "They live in a big village" 
  },
  { 
    sentence: ["Времето", "е", "хубав", "днес"], 
    wrongWordIndex: 2, 
    correctWord: "хубаво",
    translation: "The weather is nice today" 
  },
];

const TOTAL_ROUNDS = 10;

const PhraseClozeCombat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, updateXP } = useAuth();
  const { playCorrect, playIncorrect } = useSoundEffects();
  const { hasEarnedToday, markAsEarned, canEarnXP } = useDailyGameXP("phrase-cloze");
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean | null>(null);
  const [xpAwarded, setXpAwarded] = useState(0);

  const shuffledSentences = useMemo(() => {
    return [...sentences].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
  }, [gameState]);

  const current = shuffledSentences[currentRound];
  const progress = ((currentRound + 1) / TOTAL_ROUNDS) * 100;

  const handleWordClick = (index: number) => {
    if (showFeedback !== null) return;
    
    setSelectedWord(index);
    const isCorrect = index === current.wrongWordIndex;
    
    if (isCorrect) {
      playCorrect();
      setScore(prev => prev + 10);
      setShowFeedback(true);
    } else {
      playIncorrect();
      setShowFeedback(false);
    }

    setTimeout(() => {
      setShowFeedback(null);
      setSelectedWord(null);
      if (currentRound < TOTAL_ROUNDS - 1) {
        setCurrentRound(prev => prev + 1);
      } else {
        endGame();
      }
    }, 1500);
  };

  const endGame = async () => {
    setGameState("finished");
    if (user?.id && score > 0 && canEarnXP) {
      const xpEarned = Math.floor(score / 2);
      await updateXP(xpEarned);
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
    setCurrentRound(0);
    setScore(0);
    setSelectedWord(null);
    setShowFeedback(null);
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
            <Target className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Phrase Cloze Combat</h1>
            <p className="text-muted-foreground mb-6">
              Each sentence has ONE incorrect word. Find it and strike it out!
              The wrong word doesn't fit grammatically or contextually.
            </p>
            {hasEarnedToday && (
              <div className="p-3 bg-muted rounded-lg mb-4 text-sm text-muted-foreground">
                ✓ XP already earned today - playing for practice!
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-bold text-lg">{TOTAL_ROUNDS}</div>
                <div className="text-muted-foreground">Sentences</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-bold text-lg">10</div>
                <div className="text-muted-foreground">Points Each</div>
              </div>
            </div>
            <Button onClick={startGame} size="lg" className="gap-2">
              <Target className="w-5 h-5" />
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
              <p className="text-lg text-green-500 mb-2">+{xpAwarded} XP earned!</p>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">Practice mode - no XP</p>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              {score / 10}/{TOTAL_ROUNDS} correct
            </p>
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
          <span className="text-sm text-muted-foreground">
            Sentence {currentRound + 1}/{TOTAL_ROUNDS}
          </span>
          <div className="font-bold text-lg">Score: {score}</div>
        </div>

        <Progress value={progress} className="h-2 mb-6" />

        <Card className="p-8">
          <h2 className="text-xl font-bold text-center mb-2">Find the Wrong Word</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Tap the word that doesn't belong
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {current.sentence.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleWordClick(idx)}
                disabled={showFeedback !== null}
                className={cn(
                  "px-4 py-3 rounded-lg text-xl font-medium border-2 transition-all",
                  "hover:border-primary hover:bg-primary/10",
                  selectedWord === idx && showFeedback === true && "border-green-500 bg-green-500/20 line-through",
                  selectedWord === idx && showFeedback === false && "border-red-500 bg-red-500/20",
                  showFeedback !== null && idx === current.wrongWordIndex && "border-green-500 bg-green-500/20 line-through",
                  showFeedback === null && "border-border"
                )}
              >
                {word}
              </button>
            ))}
          </div>

          {showFeedback !== null && (
            <div className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg animate-fade-in",
              showFeedback ? "bg-green-500/20" : "bg-red-500/20"
            )}>
              <div className="flex items-center gap-2">
                {showFeedback ? (
                  <><Check className="w-6 h-6 text-green-500" /><span className="font-bold text-green-500">Correct!</span></>
                ) : (
                  <><X className="w-6 h-6 text-red-500" /><span className="font-bold text-red-500">Wrong!</span></>
                )}
              </div>
              <p className="text-sm text-center">
                <span className="line-through text-red-500">{current.sentence[current.wrongWordIndex]}</span>
                {" → "}
                <span className="text-green-500 font-bold">{current.correctWord}</span>
              </p>
              <p className="text-xs text-muted-foreground">{current.translation}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PhraseClozeCombat;