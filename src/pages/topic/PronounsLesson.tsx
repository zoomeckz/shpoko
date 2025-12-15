import { useState, useEffect, useRef } from "react";
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
  hint: string;
}

interface FillBlankQuestion {
  type: "fill-blank";
  sentence: string;
  blankedWord: string;
  blankedWordRomanized: string;
  options: { bulgarian: string; romanized: string }[];
  correctIndex: number;
  english: string;
  explanation: string;
}

type Question = TypeInQuestion | FillBlankQuestion;

const typeInQuestions: TypeInQuestion[] = [
  { type: "type-in", bulgarian: "аз", romanized: "az", english: "I", hint: "First person singular" },
  { type: "type-in", bulgarian: "ти", romanized: "ti", english: "you (singular)", hint: "Second person singular" },
  { type: "type-in", bulgarian: "той", romanized: "toy", english: "he", hint: "Third person masculine" },
  { type: "type-in", bulgarian: "тя", romanized: "tya", english: "she", hint: "Third person feminine" },
  { type: "type-in", bulgarian: "то", romanized: "to", english: "it", hint: "Third person neuter" },
  { type: "type-in", bulgarian: "ние", romanized: "nie", english: "we", hint: "First person plural" },
  { type: "type-in", bulgarian: "вие", romanized: "vie", english: "you (plural/formal)", hint: "Second person plural" },
  { type: "type-in", bulgarian: "те", romanized: "te", english: "they", hint: "Third person plural" },
  { type: "type-in", bulgarian: "съм", romanized: "sam", english: "am/is/are (I am)", hint: "To be - first person" },
  { type: "type-in", bulgarian: "имам", romanized: "imam", english: "I have", hint: "To have" },
];

const fillBlankQuestions: FillBlankQuestion[] = [
  { type: "fill-blank", sentence: "___ съм студент.", blankedWord: "Аз", blankedWordRomanized: "Az", options: [{ bulgarian: "Аз", romanized: "Az" }, { bulgarian: "Ти", romanized: "Ti" }, { bulgarian: "Той", romanized: "Toy" }], correctIndex: 0, english: "I am a student.", explanation: "'Аз' (Az) means 'I' - the first person singular pronoun used when talking about yourself." },
  { type: "fill-blank", sentence: "Той ___ в София.", blankedWord: "живее", blankedWordRomanized: "zhivee", options: [{ bulgarian: "имам", romanized: "imam" }, { bulgarian: "живее", romanized: "zhivee" }, { bulgarian: "съм", romanized: "sam" }], correctIndex: 1, english: "He lives in Sofia.", explanation: "'Живее' (zhivee) means 'lives' - the verb 'to live' conjugated for he/she/it (third person singular)." },
  { type: "fill-blank", sentence: "Тя ___ музика.", blankedWord: "обича", blankedWordRomanized: "obicha", options: [{ bulgarian: "обича", romanized: "obicha" }, { bulgarian: "харесва", romanized: "haresva" }, { bulgarian: "живее", romanized: "zhivee" }], correctIndex: 0, english: "She loves music.", explanation: "'Обича' (obicha) means 'loves' - a stronger feeling than 'харесва' (likes). Used for deep affection." },
  { type: "fill-blank", sentence: "Ние ___ котка.", blankedWord: "имаме", blankedWordRomanized: "imame", options: [{ bulgarian: "имаме", romanized: "imame" }, { bulgarian: "обичаме", romanized: "obichame" }, { bulgarian: "живеем", romanized: "zhiveem" }], correctIndex: 0, english: "We have a cat.", explanation: "'Имаме' (imame) means 'we have' - the verb 'to have' conjugated for 'we' (first person plural)." },
  { type: "fill-blank", sentence: "Вие ___ български.", blankedWord: "харесвате", blankedWordRomanized: "haresvate", options: [{ bulgarian: "живеете", romanized: "zhiveete" }, { bulgarian: "харесвате", romanized: "haresvate" }, { bulgarian: "сте", romanized: "ste" }], correctIndex: 1, english: "You like Bulgarian.", explanation: "'Харесвате' (haresvate) means 'you like' - the polite/plural form of 'to like' for 'you' (second person plural)." },
  { type: "fill-blank", sentence: "___ са от България.", blankedWord: "Те", blankedWordRomanized: "Te", options: [{ bulgarian: "Той", romanized: "Toy" }, { bulgarian: "Тя", romanized: "Tya" }, { bulgarian: "Те", romanized: "Te" }], correctIndex: 2, english: "They are from Bulgaria.", explanation: "'Те' (Te) means 'they' - the third person plural pronoun. 'Той' is 'he' and 'Тя' is 'she'." },
];

const generateMixedQuestions = (): Question[] => {
  const shuffledTypeIn = [...typeInQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
  const shuffledFillBlank = [...fillBlankQuestions].sort(() => Math.random() - 0.5).slice(0, 3);
  return [...shuffledTypeIn, ...shuffledFillBlank].sort(() => Math.random() - 0.5);
};

const PronounsLesson = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateXP } = useAuth();
  const { saveProgress, canEarnXP } = useUserProgress();
  const { inputMode } = useInputMode();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStep]);
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
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
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
      
      if (user && canEarnXP("pronouns-topic")) {
        const result = await saveProgress("pronouns-topic", score, correctAnswers, questions.length, updateXP);
        if (result.xpAwarded) {
          earnedXP = result.xpAmount;
        }
      }
      
      setXpAwarded(earnedXP);
      setShowComplete(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isCorrect === null && userAnswer.trim()) {
        checkTypeInAnswer();
      } else if (isCorrect !== null) {
        nextQuestion();
      }
    }
  };

  useLessonKeyboardNavigation({
    isAnswered: isCorrect !== null,
    onNext: nextQuestion,
    disabled: showComplete,
  });

  if (showComplete) {
    const score = Math.round((correctAnswers / questions.length) * 100);
    return (
      <LessonComplete
        lessonKey="pronouns-topic"
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
                <p className="text-muted-foreground mb-2">Type the {inputMode === "bulgarian" ? "Bulgarian" : "romanized"} word for:</p>
                <h2 className="text-3xl font-bold text-foreground mb-2">{currentQuestion.english}</h2>
                <p className="text-sm text-muted-foreground">{currentQuestion.hint}</p>
                <Button variant="ghost" size="sm" onClick={() => playPronunciation(currentQuestion.bulgarian)} className="mt-2">
                  <Volume2 className="h-4 w-4 mr-2" /> Listen
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  ref={inputRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type in ${inputMode === "bulgarian" ? "Bulgarian" : "romanized"}...`}
                  className="text-center text-xl py-6"
                  disabled={isCorrect !== null}
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
                    className={`py-6 text-lg flex flex-col ${
                      isCorrect !== null && index === currentQuestion.correctIndex ? "bg-green-500 hover:bg-green-500" : ""
                    } ${isCorrect === false && index !== currentQuestion.correctIndex ? "opacity-50" : ""}`}
                    onClick={() => selectFillBlankAnswer(index)}
                    disabled={isCorrect !== null}
                  >
                    <span>{option.bulgarian}</span>
                    <span className="text-sm opacity-70">({option.romanized})</span>
                  </Button>
                ))}
              </div>

              {isCorrect !== null && (
                <div className={`mt-4 p-4 rounded-lg ${isCorrect ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />}
                    <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                      {isCorrect ? "Correct!" : `The answer is: ${currentQuestion.blankedWord} (${currentQuestion.blankedWordRomanized})`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
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

export default PronounsLesson;
