import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, X, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

interface WordData {
  word: string;
  romanized: string;
  english: string;
  rank: number; // 1 = closest to target, higher = further
}

interface Guess {
  word: string;
  rank: number;
  isCorrect: boolean;
}

// Word lists by tier
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

export const ContextoGame = () => {
  const { updateXP } = useAuth();
  const { playCorrect, playComplete, playIncorrect } = useSoundEffects();
  
  const [isOpen, setIsOpen] = useState(false);
  const [gameState, setGameState] = useState<"setup" | "playing" | "won">("setup");
  const [tier, setTier] = useState<Tier>("beginner");
  const [inputMode, setInputMode] = useState<InputMode>("romanized");
  const [targetWord, setTargetWord] = useState<WordData | null>(null);
  const [allWords, setAllWords] = useState<WordData[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [error, setError] = useState("");

  const getWordList = (t: Tier) => {
    switch (t) {
      case "beginner": return BEGINNER_WORDS;
      case "intermediate": return INTERMEDIATE_WORDS;
      case "advanced": return ADVANCED_WORDS;
    }
  };

  const startGame = () => {
    const words = getWordList(tier);
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    
    // Re-rank based on semantic distance (simplified - just use existing ranks)
    setAllWords(shuffled);
    setTargetWord(target);
    setGuesses([]);
    setCurrentGuess("");
    setError("");
    setGameState("playing");
  };

  const findWordMatch = (input: string): WordData | null => {
    const normalized = input.toLowerCase().trim();
    return allWords.find(w => 
      w.romanized.toLowerCase() === normalized || 
      w.word.toLowerCase() === normalized ||
      w.english.toLowerCase() === normalized
    ) || null;
  };

  const submitGuess = () => {
    if (!currentGuess.trim() || !targetWord) return;
    
    const matchedWord = findWordMatch(currentGuess);
    
    if (!matchedWord) {
      setError("Word not in the list. Try another word!");
      playIncorrect();
      return;
    }

    // Check if already guessed
    if (guesses.some(g => g.word === matchedWord.romanized)) {
      setError("You already guessed that word!");
      return;
    }

    const isCorrect = matchedWord.romanized === targetWord.romanized;
    const newGuess: Guess = {
      word: inputMode === "bulgarian" ? matchedWord.word : matchedWord.romanized,
      rank: matchedWord.rank,
      isCorrect,
    };

    setGuesses(prev => [...prev, newGuess].sort((a, b) => a.rank - b.rank));
    setCurrentGuess("");
    setError("");

    if (isCorrect) {
      playComplete();
      setGameState("won");
      
      // Calculate XP based on number of guesses
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
      if (matchedWord.rank <= 3) {
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
    if (rank <= 3) return "bg-green-400 text-white";
    if (rank <= 5) return "bg-yellow-400 text-yellow-900";
    if (rank <= 10) return "bg-orange-400 text-white";
    return "bg-red-400 text-white";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-400 bg-gradient-to-br from-purple-500/10 to-purple-400/5">
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-bold text-lg">Contexto</h3>
            <p className="text-sm text-muted-foreground">Guess the word!</p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Contexto - Bulgarian Edition
          </DialogTitle>
        </DialogHeader>

        {gameState === "setup" && (
          <div className="space-y-6 py-4">
            <p className="text-muted-foreground text-center">
              Find the secret word! Guesses are ranked by how close they are to the answer.
            </p>

            <div className="space-y-3">
              <label className="text-sm font-medium">Select Tier:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["beginner", "intermediate", "advanced"] as Tier[]).map((t) => (
                  <Button
                    key={t}
                    variant={tier === t ? "default" : "outline"}
                    onClick={() => setTier(t)}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
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

            <Button onClick={startGame} className="w-full" size="lg">
              Start Game
            </Button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={inputMode === "bulgarian" ? "Type in Bulgarian..." : "Type romanized..."}
                autoFocus
              />
              <Button onClick={submitGuess}>Guess</Button>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <div className="text-center text-sm text-muted-foreground">
              Guesses: {guesses.length}
            </div>

            {guesses.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
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
          <div className="space-y-4 text-center py-4">
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
            <Button
              onClick={() => {
                setGameState("setup");
                setGuesses([]);
              }}
              className="w-full"
            >
              Play Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
