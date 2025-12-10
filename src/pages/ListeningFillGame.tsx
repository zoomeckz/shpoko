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

type Difficulty = "beginner" | "intermediate" | "advanced";

interface Sentence {
  full: string;
  display: string;
  blanks: string[];
  hint: string;
}

const sentencesByTier: Record<Difficulty, Sentence[]> = {
  beginner: [
    { full: "Аз искам да ям ябълка", display: "Аз ___ да ям ___", blanks: ["искам", "ябълка"], hint: "I want to eat an apple" },
    { full: "Той обича да чете книги", display: "Той ___ да чете ___", blanks: ["обича", "книги"], hint: "He loves to read books" },
    { full: "Аз пия кафе сутрин", display: "Аз ___ кафе ___", blanks: ["пия", "сутрин"], hint: "I drink coffee in the morning" },
    { full: "Тя учи нови думи", display: "Тя ___ нови ___", blanks: ["учи", "думи"], hint: "She learns new words" },
    { full: "Кучето тича в двора", display: "Кучето ___ в ___", blanks: ["тича", "двора"], hint: "The dog runs in the yard" },
    { full: "Котката спи на леглото", display: "Котката ___ на ___", blanks: ["спи", "леглото"], hint: "The cat sleeps on the bed" },
    { full: "Аз обичам моя брат", display: "Аз ___ моя ___", blanks: ["обичам", "брат"], hint: "I love my brother" },
    { full: "Тя има синя рокля", display: "Тя ___ синя ___", blanks: ["има", "рокля"], hint: "She has a blue dress" },
  ],
  intermediate: [
    { full: "Тя говори български език", display: "Тя ___ български ___", blanks: ["говори", "език"], hint: "She speaks Bulgarian language" },
    { full: "Ние живеем в голям град", display: "Ние ___ в голям ___", blanks: ["живеем", "град"], hint: "We live in a big city" },
    { full: "Децата играят в парка", display: "Децата ___ в ___", blanks: ["играят", "парка"], hint: "The children play in the park" },
    { full: "Той работи всеки ден", display: "Той ___ всеки ___", blanks: ["работи", "ден"], hint: "He works every day" },
    { full: "Ние ядем вкусна храна", display: "Ние ___ вкусна ___", blanks: ["ядем", "храна"], hint: "We eat delicious food" },
    { full: "Моят баща готви вечеря", display: "Моят ___ готви ___", blanks: ["баща", "вечеря"], hint: "My father cooks dinner" },
    { full: "Учителят преподава математика", display: "Учителят ___ ___", blanks: ["преподава", "математика"], hint: "The teacher teaches mathematics" },
    { full: "Лекарят помага на болните", display: "Лекарят ___ на ___", blanks: ["помага", "болните"], hint: "The doctor helps the sick" },
  ],
  advanced: [
    { full: "Студентите подготвят изпитите си", display: "Студентите ___ ___ си", blanks: ["подготвят", "изпитите"], hint: "The students prepare their exams" },
    { full: "Журналистът пише статия", display: "Журналистът ___ ___", blanks: ["пише", "статия"], hint: "The journalist writes an article" },
    { full: "Художникът рисува красива картина", display: "Художникът ___ красива ___", blanks: ["рисува", "картина"], hint: "The artist paints a beautiful painting" },
    { full: "Времето утре ще бъде слънчево", display: "Времето ___ ще бъде ___", blanks: ["утре", "слънчево"], hint: "The weather tomorrow will be sunny" },
    { full: "Актьорът играе главната роля", display: "Актьорът ___ главната ___", blanks: ["играе", "роля"], hint: "The actor plays the main role" },
    { full: "Програмистът разработва приложение", display: "Програмистът ___ ___", blanks: ["разработва", "приложение"], hint: "The programmer develops an application" },
    { full: "Архитектът проектира сградата", display: "Архитектът ___ ___", blanks: ["проектира", "сградата"], hint: "The architect designs the building" },
    { full: "Шеф готвачът приготвя специалитета", display: "Шеф ___ приготвя ___", blanks: ["готвачът", "специалитета"], hint: "The chef prepares the specialty" },
  ],
};

const romanizedMapByTier: Record<Difficulty, Record<string, string>> = {
  beginner: {
    "искам": "iskam", "ябълка": "yabalka", "обича": "obicha", "книги": "knigi",
    "пия": "piya", "сутрин": "sutrin", "учи": "uchi", "думи": "dumi",
    "тича": "ticha", "двора": "dvora", "спи": "spi", "леглото": "legloto",
    "обичам": "obicham", "брат": "brat", "има": "ima", "рокля": "roklya"
  },
  intermediate: {
    "говори": "govori", "език": "ezik", "живеем": "zhiveem", "град": "grad",
    "играят": "igrayat", "парка": "parka", "работи": "raboti", "ден": "den",
    "ядем": "yadem", "храна": "hrana", "баща": "bashta", "вечеря": "vecherya",
    "преподава": "prepodava", "математика": "matematika", "помага": "pomaga", "болните": "bolnite"
  },
  advanced: {
    "подготвят": "podgotvyat", "изпитите": "izpitite", "пише": "pishe", "статия": "statiya",
    "рисува": "risuva", "картина": "kartina", "утре": "utre", "слънчево": "slanchevo",
    "играе": "igrae", "роля": "rolya", "разработва": "razrabotva", "приложение": "prilozhenie",
    "проектира": "proektira", "сградата": "sgradata", "готвачът": "gotvachat", "специалитета": "spetsialiteta"
  }
};

const tierConfig: Record<Difficulty, { title: string; color: string; points: number }> = {
  beginner: { title: "Beginner", color: "green", points: 10 },
  intermediate: { title: "Intermediate", color: "yellow", points: 15 },
  advanced: { title: "Advanced", color: "red", points: 20 },
};

const ListeningFillGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPlaying, isLoading, playPronunciation } = useTextToSpeechCached();
  const { playCorrect, playIncorrect } = useSoundEffects();
  const { inputMode } = useInputMode();
  
  const [selectedTier, setSelectedTier] = useState<Difficulty | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [hintsUsed, setHintsUsed] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const shuffledSentences = useMemo(() => {
    if (!selectedTier) return [];
    return [...sentencesByTier[selectedTier]].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [selectedTier]);

  const currentSentence = shuffledSentences[currentIndex];
  const isBulgarian = inputMode === "bulgarian";
  const romanizedMap = selectedTier ? romanizedMapByTier[selectedTier] : {};

  useEffect(() => {
    if (selectedTier && shuffledSentences.length > 0) {
      setIsPreloading(true);
      const textsToPreload = shuffledSentences.map(s => s.full);
      preloadAudio(textsToPreload, (loaded, total) => {
        setPreloadProgress(Math.round((loaded / total) * 100));
      }).then(() => setIsPreloading(false));
    }
  }, [selectedTier, shuffledSentences]);

  const handleBack = useCallback(() => {
    if (selectedTier && !gameComplete) {
      setSelectedTier(null);
      setCurrentIndex(0);
      setScore(0);
      setInput1("");
      setInput2("");
      setHintsUsed([]);
      setFeedback(null);
      setShowHint(false);
    } else {
      const returnCategory = location.state?.returnCategory || "games";
      navigate("/", { state: { returnCategory } });
    }
  }, [navigate, location.state, selectedTier, gameComplete]);

  const calculatePoints = (input: string, correct: string): number => {
    const normalized = input.toLowerCase().trim();
    const correctNormalized = correct.toLowerCase().trim();
    if (normalized === correctNormalized) return tierConfig[selectedTier!].points;
    
    // Calculate Levenshtein distance for partial credit
    const distance = levenshteinDistance(normalized, correctNormalized);
    const maxLen = Math.max(normalized.length, correctNormalized.length);
    const similarity = 1 - (distance / maxLen);
    return Math.floor(similarity * tierConfig[selectedTier!].points * 0.5);
  };

  const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  };

  const checkAnswer = (input: string, correctAnswer: string): boolean => {
    const normalized = input.toLowerCase().trim();
    const correctNormalized = correctAnswer.toLowerCase().trim();
    const romanized = romanizedMap[correctAnswer]?.toLowerCase();
    return isBulgarian ? normalized === correctNormalized : (normalized === romanized || normalized === correctNormalized);
  };

  const handleSubmit = () => {
    const correct1 = checkAnswer(input1, currentSentence.blanks[0]);
    const correct2 = checkAnswer(input2, currentSentence.blanks[1]);
    
    if (correct1 && correct2) {
      playCorrect();
      setFeedback("correct");
      const pts = hintsUsed.includes(currentIndex) 
        ? Math.floor(tierConfig[selectedTier!].points / 2) 
        : tierConfig[selectedTier!].points;
      setScore(prev => prev + pts);
      setTimeout(() => {
        if (currentIndex < shuffledSentences.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setInput1(""); setInput2(""); setFeedback(null); setShowHint(false);
        } else setGameComplete(true);
      }, 1500);
    } else {
      playIncorrect();
      setFeedback("incorrect");
      // Award partial points based on closeness
      const partial1 = calculatePoints(input1, isBulgarian ? currentSentence.blanks[0] : (romanizedMap[currentSentence.blanks[0]] || currentSentence.blanks[0]));
      const partial2 = calculatePoints(input2, isBulgarian ? currentSentence.blanks[1] : (romanizedMap[currentSentence.blanks[1]] || currentSentence.blanks[1]));
      if (partial1 + partial2 > 0) {
        setScore(prev => prev + Math.floor((partial1 + partial2) / 4));
      }
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleHint = () => {
    if (!hintsUsed.includes(currentIndex)) setHintsUsed(prev => [...prev, currentIndex]);
    if (!input1) setInput1(isBulgarian ? currentSentence.blanks[0] : (romanizedMap[currentSentence.blanks[0]] || currentSentence.blanks[0]));
    else if (!input2) setInput2(isBulgarian ? currentSentence.blanks[1] : (romanizedMap[currentSentence.blanks[1]] || currentSentence.blanks[1]));
    setShowHint(true);
  };

  // Tier Selection Screen
  if (!selectedTier) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/", { state: { returnCategory: "games" } })}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold ml-4">Listening Fill-in</h1>
          </div>

          <p className="text-muted-foreground mb-6 text-center">
            Listen to Bulgarian sentences and fill in the missing words. Choose your difficulty level:
          </p>

          <div className="grid gap-4">
            {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((tier) => (
              <Card 
                key={tier} 
                className={`cursor-pointer hover:shadow-lg transition-all border-2 ${
                  tier === "beginner" ? "border-green-500 hover:bg-green-500/10" :
                  tier === "intermediate" ? "border-yellow-500 hover:bg-yellow-500/10" :
                  "border-red-500 hover:bg-red-500/10"
                }`}
                onClick={() => setSelectedTier(tier)}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{tierConfig[tier].title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tier === "beginner" && "Basic sentences with common words"}
                      {tier === "intermediate" && "Everyday conversations and phrases"}
                      {tier === "advanced" && "Complex sentences with advanced vocabulary"}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${
                    tier === "beginner" ? "text-green-500" :
                    tier === "intermediate" ? "text-yellow-500" :
                    "text-red-500"
                  }`}>
                    +{tierConfig[tier].points} pts
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isPreloading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-2">Loading Audio...</h2>
            <p className="text-muted-foreground mb-4">Pre-rendering {tierConfig[selectedTier].title} sentences</p>
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
            <p className="text-muted-foreground mb-2">{tierConfig[selectedTier].title} Level</p>
            <p className="text-3xl font-bold mb-6 text-primary">{score} points</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setSelectedTier(null); setGameComplete(false); setScore(0); setCurrentIndex(0); }}>
                Choose Tier
              </Button>
              <Button onClick={() => navigate("/", { state: { returnCategory: "games" } })}>Back to Games</Button>
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
          <div className="text-center">
            <h1 className="text-xl font-bold">Listening Fill-in</h1>
            <span className={`text-xs ${
              selectedTier === "beginner" ? "text-green-500" :
              selectedTier === "intermediate" ? "text-yellow-500" : "text-red-500"
            }`}>{tierConfig[selectedTier].title}</span>
          </div>
          <div className="text-sm font-medium">{currentIndex + 1}/{shuffledSentences.length}</div>
        </div>

        <div className="text-lg font-semibold mb-6 text-center">Score: {score}</div>

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
          <Button variant="outline" className="flex-1" onClick={handleHint}><Lightbulb className="h-4 w-4 mr-2" />Hint {hintsUsed.includes(currentIndex) ? "(Used)" : `(-${Math.floor(tierConfig[selectedTier].points / 2)} pts)`}</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!input1 || !input2 || feedback === "correct"}>Check Answer</Button>
        </div>
      </div>
    </div>
  );
};

export default ListeningFillGame;
