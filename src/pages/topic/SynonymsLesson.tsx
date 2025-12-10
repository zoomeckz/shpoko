import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Crown, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LessonComplete } from "@/components/LessonComplete";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useInputMode } from "@/contexts/InputModeContext";

interface SynonymPair {
  word: string;
  romanized: string;
  synonyms: { bulgarian: string; romanized: string }[];
  english: string;
}

const synonymPairs: SynonymPair[] = [
  { word: "голям", romanized: "golyam", synonyms: [{ bulgarian: "огромен", romanized: "ogromen" }, { bulgarian: "грамаден", romanized: "gramaden" }], english: "big/large" },
  { word: "малък", romanized: "malak", synonyms: [{ bulgarian: "дребен", romanized: "dreben" }, { bulgarian: "миниатюрен", romanized: "miniatyuren" }], english: "small" },
  { word: "хубав", romanized: "hubav", synonyms: [{ bulgarian: "красив", romanized: "krasiv" }, { bulgarian: "прекрасен", romanized: "prekrasen" }], english: "beautiful/nice" },
  { word: "бърз", romanized: "barz", synonyms: [{ bulgarian: "скоростен", romanized: "skorosten" }, { bulgarian: "стремителен", romanized: "stremitelen" }], english: "fast" },
  { word: "бавен", romanized: "baven", synonyms: [{ bulgarian: "муден", romanized: "muden" }, { bulgarian: "протачен", romanized: "protachen" }], english: "slow" },
  { word: "умен", romanized: "umen", synonyms: [{ bulgarian: "интелигентен", romanized: "inteligenten" }, { bulgarian: "разумен", romanized: "razumen" }], english: "smart" },
  { word: "щастлив", romanized: "shtastliv", synonyms: [{ bulgarian: "радостен", romanized: "radosten" }, { bulgarian: "весел", romanized: "vesel" }], english: "happy" },
  { word: "тъжен", romanized: "tazhen", synonyms: [{ bulgarian: "нещастен", romanized: "neshtasten" }, { bulgarian: "скръбен", romanized: "skraben" }], english: "sad" },
  { word: "лесен", romanized: "lesen", synonyms: [{ bulgarian: "прост", romanized: "prost" }, { bulgarian: "елементарен", romanized: "elementaren" }], english: "easy" },
  { word: "труден", romanized: "truden", synonyms: [{ bulgarian: "сложен", romanized: "slozhen" }, { bulgarian: "тежък", romanized: "tezhak" }], english: "difficult" },
  { word: "нов", romanized: "nov", synonyms: [{ bulgarian: "пресен", romanized: "presen" }, { bulgarian: "скорошен", romanized: "skoroshen" }], english: "new" },
  { word: "стар", romanized: "star", synonyms: [{ bulgarian: "древен", romanized: "dreven" }, { bulgarian: "антикварен", romanized: "antikvaren" }], english: "old" },
];

const SynonymsLesson = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, updateXP } = useAuth();
  const { saveProgress } = useUserProgress();
  const { inputMode } = useInputMode();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const isBulgarian = inputMode === "bulgarian";
  const isPremium = profile?.is_premium;

  const questions = useMemo(() => {
    const shuffled = [...synonymPairs].sort(() => Math.random() - 0.5).slice(0, 8);
    return shuffled.map((pair, index) => {
      if (index < 5) {
        // Typing question
        return { type: "typing" as const, pair, correctSynonym: pair.synonyms[0] };
      } else {
        // MCQ question
        const correctAnswer = pair.synonyms[0];
        const wrongOptions = synonymPairs
          .filter(p => p.word !== pair.word)
          .flatMap(p => p.synonyms)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);
        return { type: "mcq" as const, pair, correctSynonym: correctAnswer, options };
      }
    });
  }, []);

  const currentQuestion = questions[currentStep];

  const handleBack = () => {
    const returnCategory = location.state?.returnCategory || "lessons";
    navigate("/", { state: { returnCategory } });
  };

  const checkAnswer = () => {
    const correct = currentQuestion.correctSynonym;
    let isCorrect = false;

    if (currentQuestion.type === "typing") {
      const normalized = userAnswer.toLowerCase().trim();
      isCorrect = isBulgarian 
        ? normalized === correct.bulgarian.toLowerCase()
        : normalized === correct.romanized.toLowerCase();
    } else {
      isCorrect = selectedOption === correct.bulgarian;
    }

    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) setCorrectAnswers(prev => prev + 1);
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUserAnswer("");
      setSelectedOption(null);
      setFeedback(null);
    } else {
      // Complete lesson
      const score = Math.round((correctAnswers / questions.length) * 100);
      
      if (user) {
        await saveProgress("synonyms-premium", score, correctAnswers, questions.length, updateXP);
      }
      setIsComplete(true);
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Premium Lesson</h2>
            <p className="text-muted-foreground mb-6">
              Synonyms is a premium lesson. Upgrade to access advanced vocabulary training.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleBack}>Go Back</Button>
              <Button onClick={() => navigate("/premium")}>Upgrade to Premium</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey="synonyms-premium"
        score={Math.round((correctAnswers / questions.length) * 100)}
        correctAnswers={correctAnswers}
        totalQuestions={questions.length}
        xpEarned={100}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h1 className="text-xl font-bold">Synonyms</h1>
          </div>
          <div className="text-sm font-medium">{currentStep + 1}/{questions.length}</div>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }} 
          />
        </div>

        <Card className={`mb-6 transition-colors ${
          feedback === "correct" ? "border-green-500 bg-green-500/10" : 
          feedback === "incorrect" ? "border-red-500 bg-red-500/10" : ""
        }`}>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">Find a synonym for:</p>
              <h2 className="text-3xl font-bold mb-1">{currentQuestion.pair.word}</h2>
              <p className="text-lg text-muted-foreground">{currentQuestion.pair.romanized}</p>
              <p className="text-sm text-muted-foreground italic">({currentQuestion.pair.english})</p>
            </div>

            {currentQuestion.type === "typing" ? (
              <div className="space-y-4">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && userAnswer && !feedback && checkAnswer()}
                  placeholder={isBulgarian ? "Въведете синоним" : "Type a synonym"}
                  className="text-center text-lg"
                  autoFocus
                  disabled={!!feedback}
                />
                {feedback && (
                  <p className={`text-center ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}>
                    {feedback === "correct" ? "✓ Correct!" : `✗ Answer: ${currentQuestion.correctSynonym.bulgarian} (${currentQuestion.correctSynonym.romanized})`}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options?.map((option) => (
                  <Button
                    key={option.bulgarian}
                    variant={selectedOption === option.bulgarian ? "default" : "outline"}
                    className={`h-auto py-3 ${
                      feedback && option.bulgarian === currentQuestion.correctSynonym.bulgarian
                        ? "border-green-500 bg-green-500/20"
                        : feedback && selectedOption === option.bulgarian && feedback === "incorrect"
                        ? "border-red-500 bg-red-500/20"
                        : ""
                    }`}
                    onClick={() => !feedback && setSelectedOption(option.bulgarian)}
                    disabled={!!feedback}
                  >
                    <div className="text-center">
                      <div className="font-bold">{option.bulgarian}</div>
                      <div className="text-xs text-muted-foreground">{option.romanized}</div>
                    </div>
                    {feedback && option.bulgarian === currentQuestion.correctSynonym.bulgarian && (
                      <Check className="h-4 w-4 ml-2 text-green-500" />
                    )}
                    {feedback === "incorrect" && selectedOption === option.bulgarian && (
                      <X className="h-4 w-4 ml-2 text-red-500" />
                    )}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {!feedback ? (
            <Button 
              className="flex-1" 
              onClick={checkAnswer}
              disabled={currentQuestion.type === "typing" ? !userAnswer : !selectedOption}
            >
              Check Answer
            </Button>
          ) : (
            <Button className="flex-1" onClick={nextQuestion}>
              {currentStep < questions.length - 1 ? "Next Question" : "Complete Lesson"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SynonymsLesson;
