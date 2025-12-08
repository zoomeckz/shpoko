import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Crown, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { LessonComplete } from "@/components/LessonComplete";
import { getLessonNavigation } from "@/lib/lessonNavigation";

interface MatchPair {
  cyrillic: string;
  latin: string;
}

const allPairs: MatchPair[] = [
  { cyrillic: "А", latin: "A" },
  { cyrillic: "Б", latin: "B" },
  { cyrillic: "В", latin: "V" },
  { cyrillic: "Г", latin: "G" },
  { cyrillic: "Д", latin: "D" },
  { cyrillic: "Е", latin: "E" },
  { cyrillic: "Ж", latin: "Zh" },
  { cyrillic: "З", latin: "Z" },
  { cyrillic: "И", latin: "I" },
  { cyrillic: "Й", latin: "Y" },
  { cyrillic: "К", latin: "K" },
  { cyrillic: "Л", latin: "L" },
  { cyrillic: "М", latin: "M" },
  { cyrillic: "Н", latin: "N" },
  { cyrillic: "О", latin: "O" },
  { cyrillic: "П", latin: "P" },
];

export const MatchCyrillicLesson = () => {
  const [round, setRound] = useState(0);
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [selectedCyrillic, setSelectedCyrillic] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, updateXP } = useAuth();

  const totalRounds = 4;
  const pairsPerRound = 4;
  const progress = ((round * pairsPerRound + matchedPairs.length) / (totalRounds * pairsPerRound)) * 100;
  const nav = getLessonNavigation("match-cyrillic-premium");

  // Check if user has premium access
  const hasPremiumAccess = profile?.is_premium;

  useEffect(() => {
    if (!hasPremiumAccess) return;
    startNewRound();
  }, [round, hasPremiumAccess]);

  const startNewRound = () => {
    const startIndex = round * pairsPerRound;
    const roundPairs = allPairs.slice(startIndex, startIndex + pairsPerRound);
    setPairs(roundPairs);
    setMatchedPairs([]);
    setSelectedCyrillic(null);
  };

  const shuffledLatins = [...pairs].sort(() => Math.random() - 0.5);

  const handleCyrillicClick = (cyrillic: string) => {
    if (matchedPairs.includes(cyrillic)) return;
    setSelectedCyrillic(cyrillic);
    setWrongMatch(null);
  };

  const handleLatinClick = (latin: string) => {
    if (!selectedCyrillic) return;
    
    const pair = pairs.find(p => p.cyrillic === selectedCyrillic);
    if (pair?.latin === latin) {
      // Correct match
      setMatchedPairs([...matchedPairs, selectedCyrillic]);
      setScore(score + 10);
      setCorrectAnswers(correctAnswers + 1);
      setSelectedCyrillic(null);
      
      // Check if round complete
      if (matchedPairs.length + 1 === pairsPerRound) {
        if (round < totalRounds - 1) {
          setTimeout(() => setRound(round + 1), 500);
        } else {
          completeLesson();
        }
      }
    } else {
      // Wrong match
      setWrongMatch(latin);
      setScore(score + 1);
      setTimeout(() => setWrongMatch(null), 500);
    }
  };

  const completeLesson = async () => {
    if (user) {
      await updateXP(score);
      
      await supabase.from("user_progress").upsert({
        user_id: user.id,
        lesson_id: "match-cyrillic-premium",
        completed: true,
        score: score,
        correct_answers: correctAnswers,
        total_answers: totalRounds * pairsPerRound,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' });
    }
    
    toast({
      title: "Lesson Complete!",
      description: `You scored ${score} XP!`,
    });
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey="match-cyrillic"
        score={score}
        correctAnswers={correctAnswers}
        totalQuestions={totalRounds * pairsPerRound}
        xpEarned={score}
      />
    );
  }

  if (!hasPremiumAccess) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Premium Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This lesson is available for premium subscribers only.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
                Go Back
              </Button>
              <Button onClick={() => navigate("/premium")} className="flex-1">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <Progress value={progress} className="h-3" />
          </div>
          <div className="flex items-center gap-1">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Premium</span>
          </div>
        </div>

        {/* Lesson Navigation */}
        <div className="flex justify-between mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => nav.prevRoute && navigate(nav.prevRoute)}
            disabled={!nav.hasPrev}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {nav.prevTitle || "Previous"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => nav.nextRoute && navigate(nav.nextRoute)}
            disabled={!nav.hasNext}
          >
            {nav.nextTitle || "Next"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Match Cyrillic with Latin</CardTitle>
            <p className="text-center text-muted-foreground">
              Select a Cyrillic letter, then select its Latin equivalent
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Cyrillic column */}
              <div className="space-y-3">
                <p className="text-center font-semibold text-muted-foreground mb-4">Cyrillic</p>
                {pairs.map((pair) => (
                  <Button
                    key={pair.cyrillic}
                    variant="outline"
                    onClick={() => handleCyrillicClick(pair.cyrillic)}
                    disabled={matchedPairs.includes(pair.cyrillic)}
                    className={cn(
                      "w-full py-6 text-2xl font-bold transition-all",
                      selectedCyrillic === pair.cyrillic && "ring-2 ring-primary bg-primary/10",
                      matchedPairs.includes(pair.cyrillic) && "bg-green-500/20 border-green-500 text-green-600"
                    )}
                  >
                    {pair.cyrillic}
                  </Button>
                ))}
              </div>

              {/* Latin column */}
              <div className="space-y-3">
                <p className="text-center font-semibold text-muted-foreground mb-4">Latin</p>
                {shuffledLatins.map((pair) => {
                  const isMatched = matchedPairs.some(c => pairs.find(p => p.cyrillic === c)?.latin === pair.latin);
                  return (
                    <Button
                      key={pair.latin}
                      variant="outline"
                      onClick={() => handleLatinClick(pair.latin)}
                      disabled={isMatched}
                      className={cn(
                        "w-full py-6 text-2xl font-bold transition-all",
                        wrongMatch === pair.latin && "bg-red-500/20 border-red-500 animate-shake",
                        isMatched && "bg-green-500/20 border-green-500 text-green-600"
                      )}
                    >
                      {pair.latin}
                    </Button>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-muted-foreground">
              Round {round + 1} of {totalRounds}
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>Score: {score} XP | Matched: {matchedPairs.length + round * pairsPerRound}/{totalRounds * pairsPerRound}</p>
        </div>
      </div>
    </div>
  );
};

export default MatchCyrillicLesson;
