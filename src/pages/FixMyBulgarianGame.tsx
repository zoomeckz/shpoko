import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, PenTool, Trophy, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useDailyGameXP } from "@/hooks/useDailyGameXP";

interface MistakeSentence {
  incorrect: string;
  correct: string;
  hint: string;
  explanation: string;
}

const sentences: MistakeSentence[] = [
  {
    incorrect: "Аз съм добър учителка",
    correct: "Аз съм добра учителка",
    hint: "Check the adjective gender agreement",
    explanation: "'учителка' is feminine, so the adjective should be 'добра' (feminine)"
  },
  {
    incorrect: "Той отиде на работа утре",
    correct: "Той отива на работа утре",
    hint: "Check the verb tense",
    explanation: "'утре' (tomorrow) requires present/future tense 'отива', not past 'отиде'"
  },
  {
    incorrect: "Ние имам много приятели",
    correct: "Ние имаме много приятели",
    hint: "Check the verb conjugation",
    explanation: "'Ние' requires 'имаме' (we have), not 'имам' (I have)"
  },
  {
    incorrect: "Времето е хубав днес",
    correct: "Времето е хубаво днес",
    hint: "Check the adjective form",
    explanation: "'Времето' is neuter, so use 'хубаво' (neuter form)"
  },
  {
    incorrect: "Те говорят много добра",
    correct: "Те говорят много добре",
    hint: "Adjective vs. adverb",
    explanation: "Use adverb 'добре' (well) to modify the verb, not adjective 'добра'"
  },
  {
    incorrect: "Искам да ям много вода",
    correct: "Искам да пия много вода",
    hint: "Check the verb choice",
    explanation: "'ям' (eat) doesn't work with water; use 'пия' (drink)"
  },
  {
    incorrect: "Това е моят нова книга",
    correct: "Това е моята нова книга",
    hint: "Check the possessive form",
    explanation: "'книга' is feminine, so use 'моята' (feminine possessive)"
  },
  {
    incorrect: "Те живеят в голям село",
    correct: "Те живеят в голямо село",
    hint: "Check adjective-noun agreement",
    explanation: "'село' is neuter, so use 'голямо' (neuter form)"
  },
  {
    incorrect: "Вие сте много умен хора",
    correct: "Вие сте много умни хора",
    hint: "Check the adjective number",
    explanation: "'хора' is plural, so use plural adjective 'умни'"
  },
  {
    incorrect: "Аз чета интересен филм",
    correct: "Аз гледам интересен филм",
    hint: "Check the verb meaning",
    explanation: "'чета' means 'read'; for films use 'гледам' (watch)"
  },
  {
    incorrect: "Тя е красива момче",
    correct: "Тя е красиво момиче",
    hint: "Check noun and adjective",
    explanation: "'Тя' is feminine, needs 'момиче' (girl) with neuter adjective 'красиво'"
  },
  {
    incorrect: "Котката спи на столът",
    correct: "Котката спи на стола",
    hint: "Check the article form",
    explanation: "After preposition 'на', use 'стола' (accusative), not 'столът' (nominative)"
  },
];

const TOTAL_ROUNDS = 8;

const FixMyBulgarianGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateXP } = useAuth();
  const { playCorrect, playIncorrect } = useSoundEffects();
  const { hasEarnedToday, markAsEarned, canEarnXP } = useDailyGameXP("fix-my-bulgarian");
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [xpAwarded, setXpAwarded] = useState(0);

  const shuffledSentences = useMemo(() => {
    return [...sentences].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
  }, [gameState]);

  const current = shuffledSentences[currentRound];
  const progress = ((currentRound + 1) / TOTAL_ROUNDS) * 100;

  const checkAnswer = () => {
    // Normalize both strings for comparison
    const normalizedUser = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedCorrect = current.correct.toLowerCase().replace(/\s+/g, ' ');
    
    const isCorrect = normalizedUser === normalizedCorrect;
    
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

  const nextRound = () => {
    setShowFeedback(null);
    setUserAnswer("");
    setShowHint(false);
    
    if (currentRound < TOTAL_ROUNDS - 1) {
      setCurrentRound(prev => prev + 1);
    } else {
      endGame();
    }
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
    setUserAnswer("");
    setShowHint(false);
    setShowFeedback(null);
  };

  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Card className="p-8 text-center">
            <PenTool className="w-16 h-16 mx-auto text-purple-500 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Fix My Bulgarian</h1>
            <p className="text-muted-foreground mb-6">
              Each sentence has a grammatical mistake. Type the corrected version!
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
              <Button variant="outline" onClick={() => navigate("/")}>
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
          <h2 className="text-xl font-bold text-center mb-2">Fix the Mistake</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Type the corrected sentence
          </p>
          
          <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg mb-6">
            <p className="text-sm text-red-500 mb-1">Incorrect:</p>
            <p className="text-2xl font-bold">{current.incorrect}</p>
          </div>

          {showHint && !showFeedback && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4 animate-fade-in">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">💡 {current.hint}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Type the corrected sentence..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showFeedback !== null}
              className={cn(
                "text-lg py-6",
                showFeedback === "correct" && "border-green-500 bg-green-500/10",
                showFeedback === "wrong" && "border-red-500 bg-red-500/10"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userAnswer.trim()) {
                  if (showFeedback) nextRound();
                  else checkAnswer();
                }
              }}
              autoFocus
            />

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
                  <span className="text-muted-foreground">Correct answer:</span>
                </p>
                <p className="font-bold text-lg">{current.correct}</p>
                <p className="text-xs text-muted-foreground mt-2">{current.explanation}</p>
              </div>
            )}

            <div className="flex gap-4">
              {showFeedback === null ? (
                <>
                  {!showHint && (
                    <Button variant="outline" onClick={() => setShowHint(true)} className="flex-1">
                      Show Hint (-5 pts)
                    </Button>
                  )}
                  <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="flex-1">
                    Check Answer
                  </Button>
                </>
              ) : (
                <Button onClick={nextRound} className="w-full">
                  {currentRound < TOTAL_ROUNDS - 1 ? "Next Sentence" : "Finish Game"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FixMyBulgarianGame;