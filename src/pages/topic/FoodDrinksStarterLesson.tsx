import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, X, Volume2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useInputMode } from "@/contexts/InputModeContext";
import { LessonComplete } from "@/components/LessonComplete";
import { supabase } from "@/integrations/supabase/client";
import { useLessonKeyboardNavigation } from "@/hooks/useLessonKeyboardNavigation";

interface TypeInQuestion {
  type: "type-in";
  bulgarian: string;
  romanized: string;
  english: string;
  emoji: string;
}

interface FillBlankQuestion {
  type: "fill-blank";
  sentence: string;
  blankedWord: string;
  options: string[];
  correctIndex: number;
  english: string;
}

type Question = TypeInQuestion | FillBlankQuestion;

const typeInQuestions: TypeInQuestion[] = [
  { type: "type-in", bulgarian: "хляб", romanized: "hlyab", english: "bread", emoji: "🍞" },
  { type: "type-in", bulgarian: "вода", romanized: "voda", english: "water", emoji: "💧" },
  { type: "type-in", bulgarian: "мляко", romanized: "mlyako", english: "milk", emoji: "🥛" },
  { type: "type-in", bulgarian: "месо", romanized: "meso", english: "meat", emoji: "🥩" },
  { type: "type-in", bulgarian: "зеленчук", romanized: "zelenchuk", english: "vegetable", emoji: "🥕" },
  { type: "type-in", bulgarian: "плод", romanized: "plod", english: "fruit", emoji: "🍎" },
  { type: "type-in", bulgarian: "ям", romanized: "yam", english: "I eat", emoji: "🍽️" },
  { type: "type-in", bulgarian: "пия", romanized: "piya", english: "I drink", emoji: "🥤" },
];

const fillBlankQuestions: FillBlankQuestion[] = [
  { type: "fill-blank", sentence: "Аз ___ хляб.", blankedWord: "ям", options: ["ям", "пия", "искам"], correctIndex: 0, english: "I eat bread." },
  { type: "fill-blank", sentence: "Той ___ вода.", blankedWord: "пие", options: ["яде", "пие", "има"], correctIndex: 1, english: "He drinks water." },
  { type: "fill-blank", sentence: "Тя яде ___.", blankedWord: "месо", options: ["вода", "месо", "мляко"], correctIndex: 1, english: "She eats meat." },
  { type: "fill-blank", sentence: "Ние ___ мляко.", blankedWord: "пием", options: ["ядем", "пием", "имаме"], correctIndex: 1, english: "We drink milk." },
  { type: "fill-blank", sentence: "Аз обичам ___.", blankedWord: "плодове", options: ["зеленчуци", "плодове", "хляб"], correctIndex: 1, english: "I love fruits." },
  { type: "fill-blank", sentence: "Те ___ зеленчуци.", blankedWord: "ядат", options: ["пият", "ядат", "имат"], correctIndex: 1, english: "They eat vegetables." },
];

const generateMixedQuestions = (): Question[] => {
  const shuffledTypeIn = [...typeInQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
  const shuffledFillBlank = [...fillBlankQuestions].sort(() => Math.random() - 0.5).slice(0, 3);
  return [...shuffledTypeIn, ...shuffledFillBlank].sort(() => Math.random() - 0.5);
};

const FoodDrinksStarterLesson = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateXP } = useAuth();
  const { saveProgress, canEarnXP } = useUserProgress();
  const { inputMode } = useInputMode();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);

  useEffect(() => {
    setQuestions(generateMixedQuestions());
  }, []);

  const currentQuestion = questions[currentStep];

  const playPronunciation = async (text: string) => {
    try {
      const { data } = await supabase.functions.invoke('text-to-speech', {
        body: { text, language: 'bg' }
      });
      if (data?.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.play();
      }
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  const checkTypeInAnswer = () => {
    if (!currentQuestion || currentQuestion.type !== "type-in") return;
    const correctAnswer = inputMode === "bulgarian" ? currentQuestion.bulgarian : currentQuestion.romanized;
    const correct = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase();
    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const selectFillBlankAnswer = (index: number) => {
    if (!currentQuestion || currentQuestion.type !== "fill-blank" || isCorrect !== null) return;
    const correct = index === currentQuestion.correctIndex;
    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUserAnswer("");
      setIsCorrect(null);
      setProgress(((currentStep + 1) / questions.length) * 100);
    } else {
      const score = Math.round((correctAnswers / questions.length) * 100);
      let earnedXP = 0;
      
      if (user && canEarnXP("food-drinks-starter-topic")) {
        const result = await saveProgress("food-drinks-starter-topic", score, correctAnswers, questions.length, updateXP);
        if (result.xpAwarded) {
          earnedXP = result.xpAmount;
        }
      }
      
      setXpAwarded(earnedXP);
      setShowComplete(true);
    }
  };

  useLessonKeyboardNavigation({
    isAnswered: isCorrect !== null,
    onNext: nextQuestion,
    disabled: showComplete,
  });

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isCorrect === null && userAnswer.trim()) {
        checkTypeInAnswer();
      } else if (isCorrect !== null) {
        nextQuestion();
      }
    }
  };

  if (showComplete) {
    const score = Math.round((correctAnswers / questions.length) * 100);
    return (
      <LessonComplete
        lessonKey="food-drinks-starter-topic"
        score={score}
        correctAnswers={correctAnswers}
        totalQuestions={questions.length}
        xpEarned={xpAwarded}
      />
    );
  }

  if (!currentQuestion) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/", { state: { selectedCategory: location.state?.selectedCategory || "lessons" } })}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1">
            <Progress value={progress} className="h-3" />
          </div>
          <span className="text-sm text-muted-foreground">{currentStep + 1}/{questions.length}</span>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-lg">
          {currentQuestion.type === "type-in" ? (
            <>
              <div className="text-center mb-8">
                <span className="text-6xl mb-4 block">{currentQuestion.emoji}</span>
                <p className="text-muted-foreground mb-2">Type the {inputMode === "bulgarian" ? "Bulgarian" : "romanized"} word for:</p>
                <h2 className="text-3xl font-bold text-foreground mb-2">{currentQuestion.english}</h2>
                <Button variant="ghost" size="sm" onClick={() => playPronunciation(currentQuestion.bulgarian)} className="mt-2">
                  <Volume2 className="h-4 w-4 mr-2" /> Listen
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type in ${inputMode === "bulgarian" ? "Bulgarian" : "romanized"}...`}
                  className="text-center text-xl py-6"
                  disabled={isCorrect !== null}
                  autoFocus
                />

                {isCorrect === null ? (
                  <Button onClick={checkTypeInAnswer} disabled={!userAnswer.trim()} className="w-full py-6">
                    Check Answer
                  </Button>
                ) : (
                  <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />}
                      <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                        {isCorrect ? "Correct!" : "Not quite!"}
                      </span>
                    </div>
                    {!isCorrect && (
                      <p className="text-sm">
                        The answer is: <strong>{inputMode === "bulgarian" ? currentQuestion.bulgarian : currentQuestion.romanized}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-muted-foreground mb-2">Fill in the blank:</p>
                <h2 className="text-2xl font-bold text-foreground mb-2">{currentQuestion.sentence}</h2>
                <p className="text-sm text-muted-foreground">"{currentQuestion.english}"</p>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={isCorrect === null ? "outline" : index === currentQuestion.correctIndex ? "default" : "outline"}
                    className={`py-6 text-lg ${
                      isCorrect !== null && index === currentQuestion.correctIndex ? "bg-green-500 hover:bg-green-500" : ""
                    } ${isCorrect === false && index !== currentQuestion.correctIndex ? "opacity-50" : ""}`}
                    onClick={() => selectFillBlankAnswer(index)}
                    disabled={isCorrect !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {isCorrect !== null && (
                <div className={`mt-4 p-4 rounded-lg ${isCorrect ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                  <div className="flex items-center gap-2">
                    {isCorrect ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />}
                    <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                      {isCorrect ? "Correct!" : `The answer is: ${currentQuestion.blankedWord}`}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {isCorrect !== null && (
            <Button onClick={nextQuestion} className="w-full mt-4 py-6">
              {currentStep < questions.length - 1 ? "Next" : "Complete"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDrinksStarterLesson;
