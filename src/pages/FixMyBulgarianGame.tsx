import { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, PenTool, Trophy, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useDailyGameXP } from "@/hooks/useDailyGameXP";
import { useLeague } from "@/hooks/useLeague";
import { useLessonKeyboardNavigation } from "@/hooks/useLessonKeyboardNavigation";


interface MistakeSentence {
  words: string[];
  romanized: string[];
  wrongWordIndex: number;
  correctWord: string;
  correctRomanized: string;
  hint: string;
  explanation: string;
}

const sentences: MistakeSentence[] = [
  {
    words: ["Аз", "съм", "добър", "учителка"],
    romanized: ["Az", "sam", "dobar", "uchitelka"],
    wrongWordIndex: 2,
    correctWord: "добра",
    correctRomanized: "dobra",
    hint: "Check the adjective gender agreement",
    explanation: "'учителка' is feminine, so the adjective should be 'добра' (feminine)"
  },
  {
    words: ["Той", "отиде", "на", "работа", "утре"],
    romanized: ["Toy", "otide", "na", "rabota", "utre"],
    wrongWordIndex: 1,
    correctWord: "отива",
    correctRomanized: "otiva",
    hint: "Check the verb tense",
    explanation: "'утре' (tomorrow) requires present/future tense 'отива', not past 'отиде'"
  },
  {
    words: ["Ние", "имам", "много", "приятели"],
    romanized: ["Nie", "imam", "mnogo", "priyateli"],
    wrongWordIndex: 1,
    correctWord: "имаме",
    correctRomanized: "imame",
    hint: "Check the verb conjugation",
    explanation: "'Ние' requires 'имаме' (we have), not 'имам' (I have)"
  },
  {
    words: ["Времето", "е", "хубав", "днес"],
    romanized: ["Vremeto", "e", "hubav", "dnes"],
    wrongWordIndex: 2,
    correctWord: "хубаво",
    correctRomanized: "hubavo",
    hint: "Check the adjective form",
    explanation: "'Времето' is neuter, so use 'хубаво' (neuter form)"
  },
  {
    words: ["Те", "говорят", "много", "добра"],
    romanized: ["Te", "govoryat", "mnogo", "dobra"],
    wrongWordIndex: 3,
    correctWord: "добре",
    correctRomanized: "dobre",
    hint: "Adjective vs. adverb",
    explanation: "Use adverb 'добре' (well) to modify the verb, not adjective 'добра'"
  },
  {
    words: ["Искам", "да", "ям", "много", "вода"],
    romanized: ["Iskam", "da", "yam", "mnogo", "voda"],
    wrongWordIndex: 2,
    correctWord: "пия",
    correctRomanized: "piya",
    hint: "Check the verb choice",
    explanation: "'ям' (eat) doesn't work with water; use 'пия' (drink)"
  },
  {
    words: ["Това", "е", "моят", "нова", "книга"],
    romanized: ["Tova", "e", "moyat", "nova", "kniga"],
    wrongWordIndex: 2,
    correctWord: "моята",
    correctRomanized: "moyata",
    hint: "Check the possessive form",
    explanation: "'книга' is feminine, so use 'моята' (feminine possessive)"
  },
  {
    words: ["Те", "живеят", "в", "голям", "село"],
    romanized: ["Te", "zhiveyat", "v", "golyam", "selo"],
    wrongWordIndex: 3,
    correctWord: "голямо",
    correctRomanized: "golyamo",
    hint: "Check adjective-noun agreement",
    explanation: "'село' is neuter, so use 'голямо' (neuter form)"
  },
  {
    words: ["Вие", "сте", "много", "умен", "хора"],
    romanized: ["Vie", "ste", "mnogo", "umen", "hora"],
    wrongWordIndex: 3,
    correctWord: "умни",
    correctRomanized: "umni",
    hint: "Check the adjective number",
    explanation: "'хора' is plural, so use plural adjective 'умни'"
  },
  {
    words: ["Аз", "чета", "интересен", "филм"],
    romanized: ["Az", "cheta", "interesen", "film"],
    wrongWordIndex: 1,
    correctWord: "гледам",
    correctRomanized: "gledam",
    hint: "Check the verb meaning",
    explanation: "'чета' means 'read'; for films use 'гледам' (watch)"
  },
  {
    words: ["Тя", "е", "красива", "момче"],
    romanized: ["Tya", "e", "krasiva", "momche"],
    wrongWordIndex: 3,
    correctWord: "момиче",
    correctRomanized: "momiche",
    hint: "Check noun and adjective",
    explanation: "'Тя' is feminine, needs 'момиче' (girl), not 'момче' (boy)"
  },
  {
    words: ["Котката", "спи", "на", "столът"],
    romanized: ["Kotkata", "spi", "na", "stolat"],
    wrongWordIndex: 3,
    correctWord: "стола",
    correctRomanized: "stola",
    hint: "Check the article form",
    explanation: "After preposition 'на', use 'стола' (accusative), not 'столът' (nominative)"
  },
];

const TOTAL_ROUNDS = 8;

const FixMyBulgarianGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, updateXP } = useAuth();
  const { playCorrect, playIncorrect } = useSoundEffects();
  const { hasEarnedToday, markAsEarned, canEarnXP } = useDailyGameXP("fix-my-bulgarian");
  const { addWeeklyXP } = useLeague();
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [xpAwarded, setXpAwarded] = useState(0);

  const shuffledSentences = useMemo(() => {
    return [...sentences].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
  }, [gameState]);

  const current = shuffledSentences[currentRound];
  const progress = ((currentRound + 1) / TOTAL_ROUNDS) * 100;

  const handleWordClick = (index: number) => {
    if (showFeedback) return;
    
    setSelectedWordIndex(index);
    const isCorrect = index === current.wrongWordIndex;
    
    if (isCorrect) {
      playCorrect();
      const points = showHint ? 5 : 10;
      setScore(prev => prev + points);
      setShowFeedback("correct");
    } else {
      playIncorrect();
      setShowFeedback("wrong");
    }
  };

  const nextRound = useCallback(() => {
    setShowFeedback(null);
    setSelectedWordIndex(null);
    setShowHint(false);
    
    if (currentRound < TOTAL_ROUNDS - 1) {
      setCurrentRound(prev => prev + 1);
    } else {
      endGame();
    }
  }, [currentRound]);

  useLessonKeyboardNavigation({
    isAnswered: showFeedback !== null,
    onNext: nextRound,
  });

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
    setCurrentRound(0);
    setScore(0);
    setSelectedWordIndex(null);
    setShowHint(false);
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
            <PenTool className="w-16 h-16 mx-auto text-purple-500 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Fix My Bulgarian</h1>
            <p className="text-muted-foreground mb-6">
              Each sentence has a grammatical mistake. Tap the <strong>wrong word</strong> to fix it!
              Use hints if you get stuck (but you'll earn fewer points).
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
                <div className="font-bold text-lg">10/5</div>
                <div className="text-muted-foreground">Points (no hint/hint)</div>
              </div>
            </div>
            <Button onClick={startGame} size="lg" className="gap-2">
              <PenTool className="w-5 h-5" />
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
          <span className="text-sm text-muted-foreground">
            Sentence {currentRound + 1}/{TOTAL_ROUNDS}
          </span>
          <div className="font-bold text-lg">Score: {score}</div>
        </div>

        <Progress value={progress} className="h-2 mb-6" />

        <Card className="p-8">
          <h2 className="text-xl font-bold text-center mb-2">Tap the Wrong Word</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Find and tap the incorrect word in the sentence
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {current.words.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordClick(index)}
                disabled={showFeedback !== null}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all border-2 flex flex-col items-center",
                  "hover:scale-105 hover:shadow-lg",
                  showFeedback === null && "hover:border-primary hover:bg-primary/10 border-border bg-muted",
                  showFeedback && index === current.wrongWordIndex && "border-green-500 bg-green-500/20 text-green-700 dark:text-green-300",
                  showFeedback === "wrong" && selectedWordIndex === index && index !== current.wrongWordIndex && "border-red-500 bg-red-500/20 text-red-700 dark:text-red-300",
                  showFeedback && index !== current.wrongWordIndex && selectedWordIndex !== index && "opacity-50"
                )}
              >
                <span className="text-xl font-bold">{word}</span>
                <span className="text-xs text-muted-foreground">{current.romanized[index]}</span>
              </button>
            ))}
          </div>

          {showHint && !showFeedback && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4 animate-fade-in">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">💡 {current.hint}</p>
            </div>
          )}

          {showFeedback !== null && (
            <div className={cn(
              "p-4 rounded-lg animate-fade-in",
              showFeedback === "correct" ? "bg-green-500/20" : "bg-red-500/20"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {showFeedback === "correct" ? (
                  <><Check className="w-6 h-6 text-green-500" /><span className="font-bold text-green-500">Correct!</span></>
                ) : (
                  <><X className="w-6 h-6 text-red-500" /><span className="font-bold text-red-500">Not quite right</span></>
                )}
              </div>
              <p className="text-sm mb-1">
                <span className="text-muted-foreground">The wrong word was:</span>{" "}
                <span className="font-bold line-through">{current.words[current.wrongWordIndex]}</span>
                <span className="text-xs text-muted-foreground ml-1">({current.romanized[current.wrongWordIndex]})</span>
                {" → "}
                <span className="font-bold text-green-600 dark:text-green-400">{current.correctWord}</span>
                <span className="text-xs text-muted-foreground ml-1">({current.correctRomanized})</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">{current.explanation}</p>
            </div>
          )}

          <div className="flex gap-4 mt-4">
            {showFeedback === null ? (
              <>
                {!showHint && (
                  <Button variant="outline" onClick={() => setShowHint(true)} className="flex-1">
                    Show Hint (-5 pts)
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={nextRound} className="w-full">
                {currentRound < TOTAL_ROUNDS - 1 ? "Next Sentence" : "Finish Game"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FixMyBulgarianGame;