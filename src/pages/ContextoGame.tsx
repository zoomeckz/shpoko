import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

interface WordData {
  word: string;
  romanized: string;
  english: string;
  rank: number;
}

interface Guess {
  word: string;
  rank: number;
  isCorrect: boolean;
}

const BEGINNER_WORDS: WordData[] = [
  { word: "котка", romanized: "kotka", english: "cat", rank: 1 },
  { word: "куче", romanized: "kuche", english: "dog", rank: 2 },
  { word: "птица", romanized: "ptitsa", english: "bird", rank: 3 },
  { word: "риба", romanized: "riba", english: "fish", rank: 4 },
  { word: "кон", romanized: "kon", english: "horse", rank: 5 },
  { word: "вода", romanized: "voda", english: "water", rank: 6 },
  { word: "хляб", romanized: "hlyab", english: "bread", rank: 7 },
  { word: "къща", romanized: "kashta", english: "house", rank: 8 },
  { word: "слънце", romanized: "slantse", english: "sun", rank: 9 },
  { word: "луна", romanized: "luna", english: "moon", rank: 10 },
  { word: "звезда", romanized: "zvezda", english: "star", rank: 11 },
  { word: "дърво", romanized: "darvo", english: "tree", rank: 12 },
  { word: "цвете", romanized: "tsvete", english: "flower", rank: 13 },
  { word: "книга", romanized: "kniga", english: "book", rank: 14 },
  { word: "маса", romanized: "masa", english: "table", rank: 15 },
];

const INTERMEDIATE_WORDS: WordData[] = [
  { word: "приятел", romanized: "priyatel", english: "friend", rank: 1 },
  { word: "семейство", romanized: "semeystvo", english: "family", rank: 2 },
  { word: "работа", romanized: "rabota", english: "work", rank: 3 },
  { word: "училище", romanized: "uchilishte", english: "school", rank: 4 },
  { word: "време", romanized: "vreme", english: "time/weather", rank: 5 },
  { word: "пътуване", romanized: "patuvane", english: "travel", rank: 6 },
  { word: "храна", romanized: "hrana", english: "food", rank: 7 },
  { word: "здраве", romanized: "zdrave", english: "health", rank: 8 },
  { word: "щастие", romanized: "shtastie", english: "happiness", rank: 9 },
  { word: "любов", romanized: "lyubov", english: "love", rank: 10 },
];

const ADVANCED_WORDS: WordData[] = [
  { word: "въображение", romanized: "vaobrazhenie", english: "imagination", rank: 1 },
  { word: "съзнание", romanized: "saznanie", english: "consciousness", rank: 2 },
  { word: "развитие", romanized: "razvitie", english: "development", rank: 3 },
  { word: "постижение", romanized: "postizhenie", english: "achievement", rank: 4 },
  { word: "възможност", romanized: "vazmozhnost", english: "opportunity", rank: 5 },
  { word: "отговорност", romanized: "otgovornost", english: "responsibility", rank: 6 },
  { word: "независимост", romanized: "nezavisimost", english: "independence", rank: 7 },
  { word: "справедливост", romanized: "spravedlivost", english: "justice", rank: 8 },
];

type Tier = "beginner" | "intermediate" | "advanced";
type InputMode = "romanized" | "bulgarian";

const getTodayKey = () => new Date().toISOString().split('T')[0];

const getPlayedTiers = (): Record<string, boolean> => {
  const stored = localStorage.getItem(`contexto-played-${getTodayKey()}`);
  return stored ? JSON.parse(stored) : {};
};

const markTierPlayed = (tier: Tier) => {
  const played = getPlayedTiers();
  played[tier] = true;
  localStorage.setItem(`contexto-played-${getTodayKey()}`, JSON.stringify(played));
};

// Calculate semantic similarity rank for any word
const calculateGuessRank = (guess: string, targetWord: WordData, allWords: WordData[]): number => {
  const normalized = guess.toLowerCase().trim();
  
  // Check if it's the exact target word
  if (normalized === targetWord.romanized.toLowerCase() || 
      normalized === targetWord.word.toLowerCase() || 
      normalized === targetWord.english.toLowerCase()) {
    return 1;
  }
  
  // Check if it's in our word list
  const matchedWord = allWords.find(w => 
    w.romanized.toLowerCase() === normalized || 
    w.word.toLowerCase() === normalized ||
    w.english.toLowerCase() === normalized
  );
  
  if (matchedWord) {
    return matchedWord.rank;
  }
  
  // For words not in the list, generate a random rank between 50-500
  // This simulates semantic distance for unknown words
  const hashCode = normalized.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return 50 + Math.abs(hashCode % 450);
};

const ContextoGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateXP } = useAuth();
  const { playCorrect, playComplete, playIncorrect } = useSoundEffects();
  
  const [gameState, setGameState] = useState<"setup" | "playing" | "won">("setup");
  const [tier, setTier] = useState<Tier>("beginner");
  const [inputMode, setInputMode] = useState<InputMode>("romanized");
  const [targetWord, setTargetWord] = useState<WordData | null>(null);
  const [allWords, setAllWords] = useState<WordData[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [error, setError] = useState("");
  const [playedTiers, setPlayedTiers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPlayedTiers(getPlayedTiers());
  }, []);

  const getWordList = (t: Tier) => {
    switch (t) {
      case "beginner": return BEGINNER_WORDS;
      case "intermediate": return INTERMEDIATE_WORDS;
      case "advanced": return ADVANCED_WORDS;
    }
  };

  const isTierAvailable = (t: Tier) => !playedTiers[t];

  const startGame = () => {
    if (!isTierAvailable(tier)) return;
    
    const words = getWordList(tier);
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    
    setAllWords(shuffled);
    setTargetWord(target);
    setGuesses([]);
    setCurrentGuess("");
    setError("");
    setGameState("playing");
  };

  const submitGuess = () => {
    if (!currentGuess.trim() || !targetWord) return;
    
    const normalized = currentGuess.toLowerCase().trim();
    
    // Check if already guessed
    if (guesses.some(g => g.word.toLowerCase() === normalized)) {
      setError("You already guessed that word!");
      return;
    }

    // Calculate rank for this guess
    const rank = calculateGuessRank(normalized, targetWord, allWords);
    const isCorrect = rank === 1;
    
    const newGuess: Guess = {
      word: currentGuess.trim(),
      rank,
      isCorrect,
    };

    setGuesses(prev => [...prev, newGuess].sort((a, b) => a.rank - b.rank));
    setCurrentGuess("");
    setError("");

    if (isCorrect) {
      playComplete();
      setGameState("won");
      markTierPlayed(tier);
      setPlayedTiers(getPlayedTiers());
      
      const guessCount = guesses.length + 1;
      let xpReward = 100;
      if (guessCount <= 3) xpReward = 150;
      else if (guessCount <= 5) xpReward = 100;
      else if (guessCount <= 10) xpReward = 75;
      else xpReward = 50;
      
      if (tier === "intermediate") xpReward = Math.floor(xpReward * 1.25);
      if (tier === "advanced") xpReward = Math.floor(xpReward * 1.5);
      
      updateXP(xpReward);
    } else {
      if (rank <= 5) {
        playCorrect();
      } else {
        playIncorrect();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitGuess();
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-green-500 text-white";
    if (rank <= 5) return "bg-green-400 text-white";
    if (rank <= 15) return "bg-yellow-400 text-yellow-900";
    if (rank <= 50) return "bg-orange-400 text-white";
    if (rank <= 100) return "bg-orange-500 text-white";
    return "bg-red-400 text-white";
  };

  const handleBack = () => {
    const returnTo = location.state?.returnCategory;
    if (returnTo) {
      navigate("/", { state: { selectedCategory: returnTo } });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold">Contexto - Bulgarian Edition</h1>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            {gameState === "setup" && (
              <div className="space-y-6">
                <p className="text-muted-foreground text-center">
                  Find the secret Bulgarian word! Guess any word and see how close you are.
                  <br />
                  <span className="text-sm">Lower rank = closer to the answer. You can play each tier once per day.</span>
                </p>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Tier:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["beginner", "intermediate", "advanced"] as Tier[]).map((t) => (
                      <Button
                        key={t}
                        variant={tier === t ? "default" : "outline"}
                        onClick={() => isTierAvailable(t) && setTier(t)}
                        className={cn("capitalize relative", !isTierAvailable(t) && "opacity-50")}
                        disabled={!isTierAvailable(t)}
                      >
                        {!isTierAvailable(t) && <Lock className="w-3 h-3 absolute top-1 right-1" />}
                        {t}
                      </Button>
                    ))}
                  </div>
                  {!isTierAvailable(tier) && (
                    <p className="text-sm text-muted-foreground text-center">
                      You've already played this tier today. Come back tomorrow!
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Input Mode:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={inputMode === "romanized" ? "default" : "outline"}
                      onClick={() => setInputMode("romanized")}
                    >
                      Romanized
                    </Button>
                    <Button
                      variant={inputMode === "bulgarian" ? "default" : "outline"}
                      onClick={() => setInputMode("bulgarian")}
                    >
                      Bulgarian
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={startGame} 
                  className="w-full" 
                  size="lg"
                  disabled={!isTierAvailable(tier)}
                >
                  Start Game
                </Button>
              </div>
            )}

            {gameState === "playing" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type any word to guess..."
                    autoFocus
                  />
                  <Button onClick={submitGuess}>Guess</Button>
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  Guesses: {guesses.length} | Tier: <span className="capitalize">{tier}</span>
                </div>

                {guesses.length > 0 && (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {guesses.map((guess, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg",
                          getRankColor(guess.rank)
                        )}
                      >
                        <span className="font-medium">{guess.word}</span>
                        <Badge variant="secondary" className="bg-white/20">
                          #{guess.rank}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setGameState("setup");
                    setGuesses([]);
                  }}
                  className="w-full"
                >
                  Give Up
                </Button>
              </div>
            )}

            {gameState === "won" && (
              <div className="space-y-4 text-center">
                <div className="text-6xl">🎉</div>
                <h3 className="text-2xl font-bold">You Found It!</h3>
                <p className="text-lg">
                  The word was: <span className="font-bold text-primary">{targetWord?.romanized}</span>
                </p>
                <p className="text-muted-foreground">
                  ({targetWord?.word} - {targetWord?.english})
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Solved in {guesses.length} guesses</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="flex-1"
                  >
                    Back to Home
                  </Button>
                  <Button
                    onClick={() => {
                      setGameState("setup");
                      setGuesses([]);
                    }}
                    className="flex-1"
                  >
                    Play Another Tier
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContextoGame;