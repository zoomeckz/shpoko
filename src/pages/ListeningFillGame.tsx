import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, Lightbulb, Loader2 } from "lucide-react";
import { useTextToSpeechCached } from "@/hooks/useTextToSpeechCached";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { preloadAudio } from "@/lib/audioCache";
import { useInputMode } from "@/contexts/InputModeContext";

interface Sentence {
  full: string;
  display: string;
  blanks: string[];
  hint: string;
}

const sentences: Sentence[] = [
  { full: "Аз искам да ям ябълка", display: "Аз ___ да ям ___", blanks: ["искам", "ябълка"], hint: "I want to eat an apple" },
  { full: "Той обича да чете книги", display: "Той ___ да чете ___", blanks: ["обича", "книги"], hint: "He loves to read books" },
  { full: "Тя говори български език", display: "Тя ___ български ___", blanks: ["говори", "език"], hint: "She speaks Bulgarian language" },
  { full: "Ние живеем в голям град", display: "Ние ___ в голям ___", blanks: ["живеем", "град"], hint: "We live in a big city" },
  { full: "Децата играят в парка", display: "Децата ___ в ___", blanks: ["играят", "парка"], hint: "The children play in the park" },
  { full: "Аз пия кафе сутрин", display: "Аз ___ кафе ___", blanks: ["пия", "сутрин"], hint: "I drink coffee in the morning" },
  { full: "Той работи всеки ден", display: "Той ___ всеки ___", blanks: ["работи", "ден"], hint: "He works every day" },
  { full: "Тя учи нови думи", display: "Тя ___ нови ___", blanks: ["учи", "думи"], hint: "She learns new words" },
  { full: "Ние ядем вкусна храна", display: "Ние ___ вкусна ___", blanks: ["ядем", "храна"], hint: "We eat delicious food" },
  { full: "Кучето тича в двора", display: "Кучето ___ в ___", blanks: ["тича", "двора"], hint: "The dog runs in the yard" }
];

const romanizedMap: Record<string, string> = {
  "искам": "iskam", "ябълка": "yabalka", "обича": "obicha", "книги": "knigi",
  "говори": "govori", "език": "ezik", "живеем": "zhiveem", "град": "grad",
  "играят": "igrayat", "парка": "parka", "пия": "piya", "сутрин": "sutrin",
  "работи": "raboti", "ден": "den", "учи": "uchi", "думи": "dumi",
  "ядем": "yadem", "храна": "hrana", "тича": "ticha", "двора": "dvora"
};

const ListeningFillGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPlaying, isLoading, playPronunciation } = useTextToSpeechCached();
  const { playCorrect, playIncorrect } = useSoundEffects();
  const { inputMode } = useInputMode();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [hintsUsed, setHintsUsed] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const shuffledSentences = useMemo(() => [...sentences].sort(() => Math.random() - 0.5).slice(0, 5), []);
  const currentSentence = shuffledSentences[currentIndex];
  const isBulgarian = inputMode === "bulgarian";

  useEffect(() => {
    const textsToPreload = shuffledSentences.map(s => s.full);
    preloadAudio(textsToPreload, (loaded, total) => {
      setPreloadProgress(Math.round((loaded / total) * 100));
    }).then(() => setIsPreloading(false));
  }, [shuffledSentences]);

  const handleBack = useCallback(() => {
    const returnCategory = location.state?.returnCategory || "games";
    navigate("/", { state: { returnCategory } });
  }, [navigate, location.state]);

  const checkAnswer = (input: string, correctAnswer: string): boolean => {
    const normalized = input.toLowerCase().trim();
    const correctNormalized = correctAnswer.toLowerCase().trim();
    const romanized = romanizedMap[correctAnswer]?.toLowerCase();
    return isBulgarian ? normalized === correctNormalized : (normalized === romanized || normalized === correctNormalized);
  };

  const handleSubmit = () => {
    if (checkAnswer(input1, currentSentence.blanks[0]) && checkAnswer(input2, currentSentence.blanks[1])) {
      playCorrect();
      setFeedback("correct");
      setScore(prev => prev + (hintsUsed.includes(currentIndex) ? 5 : 10));
      setTimeout(() => {
        if (currentIndex < shuffledSentences.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setInput1(""); setInput2(""); setFeedback(null); setShowHint(false);
        } else setGameComplete(true);
      }, 1500);
    } else {
      playIncorrect();
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleHint = () => {
    if (!hintsUsed.includes(currentIndex)) setHintsUsed(prev => [...prev, currentIndex]);
    if (!input1) setInput1(isBulgarian ? currentSentence.blanks[0] : romanizedMap[currentSentence.blanks[0]]);
    else if (!input2) setInput2(isBulgarian ? currentSentence.blanks[1] : romanizedMap[currentSentence.blanks[1]]);
    setShowHint(true);
  };

  if (isPreloading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-2">Loading Audio...</h2>
            <p className="text-muted-foreground mb-4">Pre-rendering sentences</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${preloadProgress}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">🎉 Game Complete!</h2>
            <p className="text-xl mb-6">Score: {score} points</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleBack}>Back to Games</Button>
              <Button onClick={() => window.location.reload()}>Play Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-xl font-bold">Listening Fill-in</h1>
          <div className="text-sm font-medium">{currentIndex + 1}/{shuffledSentences.length}</div>
        </div>

        <div className="text-lg font-semibold mb-6">Score: {score}</div>

        <Card className={`mb-6 transition-colors ${feedback === "correct" ? "border-green-500 bg-green-500/10" : feedback === "incorrect" ? "border-red-500 bg-red-500/10" : ""}`}>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <Button size="lg" variant="outline" className="w-20 h-20 rounded-full" onClick={() => playPronunciation(currentSentence.full)} disabled={isPlaying || isLoading}>
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Volume2 className={`h-8 w-8 ${isPlaying ? "animate-pulse text-primary" : ""}`} />}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">{isPlaying ? "Playing..." : "Click to listen"}</p>
            </div>

            <div className="text-center text-xl font-medium mb-6">{currentSentence.display}</div>
            {showHint && <p className="text-center text-muted-foreground mb-4 italic">💡 {currentSentence.hint}</p>}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">First missing word ({isBulgarian ? "Cyrillic" : "Romanized"}):</label>
                <Input value={input1} onChange={(e) => setInput1(e.target.value)} onKeyDown={(e) => e.key === "Enter" && input1 && input2 && handleSubmit()} placeholder={isBulgarian ? "Въведете първата дума" : "Type first word"} className="text-center text-lg" autoFocus />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Second missing word:</label>
                <Input value={input2} onChange={(e) => setInput2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && input1 && input2 && handleSubmit()} placeholder={isBulgarian ? "Въведете втората дума" : "Type second word"} className="text-center text-lg" />
              </div>
            </div>
            {feedback === "incorrect" && <p className="text-center text-red-500 mt-4">Try again! Correct: {currentSentence.blanks.join(", ")}</p>}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleHint}><Lightbulb className="h-4 w-4 mr-2" />Hint {hintsUsed.includes(currentIndex) ? "(Used)" : "(-5 pts)"}</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!input1 || !input2 || feedback === "correct"}>Check Answer</Button>
        </div>
      </div>
    </div>
  );
};

export default ListeningFillGame;
