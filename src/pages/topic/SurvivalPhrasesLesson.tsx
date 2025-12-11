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
  usage: string;
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
  { type: "type-in", bulgarian: "Къде е", romanized: "Kade e", english: "Where is...?", usage: "Ask for locations" },
  { type: "type-in", bulgarian: "Как се казваш", romanized: "Kak se kazvash", english: "What's your name?", usage: "Introduce yourself" },
  { type: "type-in", bulgarian: "Аз съм от", romanized: "Az sam ot", english: "I am from...", usage: "Say where you're from" },
  { type: "type-in", bulgarian: "Колко струва", romanized: "Kolko struva", english: "How much does it cost?", usage: "Shopping/prices" },
  { type: "type-in", bulgarian: "Не разбирам", romanized: "Ne razbiram", english: "I don't understand", usage: "When confused" },
  { type: "type-in", bulgarian: "Говорите ли английски", romanized: "Govorite li angliyski", english: "Do you speak English?", usage: "Ask for English" },
  { type: "type-in", bulgarian: "Помогнете ми", romanized: "Pomognete mi", english: "Help me", usage: "Ask for help" },
  { type: "type-in", bulgarian: "Извинете", romanized: "Izvinete", english: "Excuse me", usage: "Get attention politely" },
];

const fillBlankQuestions: FillBlankQuestion[] = [
  { type: "fill-blank", sentence: "___ е тоалетната?", blankedWord: "Къде", options: ["Къде", "Колко", "Как"], correctIndex: 0, english: "Where is the toilet?" },
  { type: "fill-blank", sentence: "Аз съм ___ България.", blankedWord: "от", options: ["от", "в", "на"], correctIndex: 0, english: "I am from Bulgaria." },
  { type: "fill-blank", sentence: "Колко ___ това?", blankedWord: "струва", options: ["е", "струва", "има"], correctIndex: 1, english: "How much is this?" },
  { type: "fill-blank", sentence: "Не ___ български.", blankedWord: "разбирам", options: ["говоря", "разбирам", "искам"], correctIndex: 1, english: "I don't understand Bulgarian." },
  { type: "fill-blank", sentence: "___ се казвате?", blankedWord: "Как", options: ["Как", "Къде", "Колко"], correctIndex: 0, english: "What is your name? (formal)" },
  { type: "fill-blank", sentence: "___ ми, моля.", blankedWord: "Помогнете", options: ["Кажете", "Помогнете", "Дайте"], correctIndex: 1, english: "Help me, please." },
];

const generateMixedQuestions = (): Question[] => {
  const shuffledTypeIn = [...typeInQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
  const shuffledFillBlank = [...fillBlankQuestions].sort(() => Math.random() - 0.5).slice(0, 3);
  return [...shuffledTypeIn, ...shuffledFillBlank].sort(() => Math.random() - 0.5);
};

const SurvivalPhrasesLesson = () => {
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
      
      if (user && canEarnXP("survival-phrases-topic")) {
        const result = await saveProgress("survival-phrases-topic", score, correctAnswers, questions.length, updateXP);
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
        lessonKey="survival-phrases-topic"
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
                <p className="text-muted-foreground mb-2">Type the {inputMode === "bulgarian" ? "Bulgarian" : "romanized"} phrase for:</p>
                <h2 className="text-3xl font-bold text-foreground mb-2">{currentQuestion.english}</h2>
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1 inline-block">
                  Use: {currentQuestion.usage}
                </p>
                <Button variant="ghost" size="sm" onClick={() => playPronunciation(currentQuestion.bulgarian)} className="mt-2 block mx-auto">
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

export default SurvivalPhrasesLesson;
