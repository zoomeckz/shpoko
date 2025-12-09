import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LessonComplete } from "@/components/LessonComplete";
import { useUserProgress } from "@/hooks/useUserProgress";

interface FillBlankQuestion {
  scenario: string;
  sentence: string;
  blank: string;
  options: string[];
  correctIndex: number;
  translation: string;
  emoji: string;
}

const LESSON_ID = "restaurant-ordering";
const XP_REWARD = 95;

const questions: FillBlankQuestion[] = [
  { 
    scenario: "You want to get the waiter's attention",
    sentence: "____!", 
    blank: "Извинете", 
    options: ["Здравей", "Извинете", "Благодаря", "Довиждане"], 
    correctIndex: 1, 
    translation: "Excuse me!", 
    emoji: "🙋" 
  },
  { 
    scenario: "You want to ask for the menu",
    sentence: "Може ли ____?", 
    blank: "менюто", 
    options: ["сметката", "менюто", "водата", "хляба"], 
    correctIndex: 1, 
    translation: "Can I have the menu?", 
    emoji: "📋" 
  },
  { 
    scenario: "You want to order water",
    sentence: "Бих искал ____, моля", 
    blank: "вода", 
    options: ["кафе", "вода", "бира", "вино"], 
    correctIndex: 1, 
    translation: "I would like water, please", 
    emoji: "💧" 
  },
  { 
    scenario: "You want to order a salad",
    sentence: "Ще взема една ____", 
    blank: "салата", 
    options: ["супа", "салата", "пица", "торта"], 
    correctIndex: 1, 
    translation: "I will have a salad", 
    emoji: "🥗" 
  },
  { 
    scenario: "The waiter asks what you want",
    sentence: "Какво ще ____?", 
    blank: "поръчате", 
    options: ["ядете", "поръчате", "пиете", "правите"], 
    correctIndex: 1, 
    translation: "What will you order?", 
    emoji: "🍽️" 
  },
  { 
    scenario: "You want to say the food is delicious",
    sentence: "Храната е много ____", 
    blank: "вкусна", 
    options: ["скъпа", "вкусна", "студена", "топла"], 
    correctIndex: 1, 
    translation: "The food is very delicious", 
    emoji: "😋" 
  },
  { 
    scenario: "You want to ask for the bill",
    sentence: "Може ли ____, моля?", 
    blank: "сметката", 
    options: ["менюто", "водата", "сметката", "хляба"], 
    correctIndex: 2, 
    translation: "Can I have the bill, please?", 
    emoji: "💳" 
  },
  { 
    scenario: "You want to say thank you",
    sentence: "____ много!", 
    blank: "Благодаря", 
    options: ["Извинете", "Здравей", "Благодаря", "Моля"], 
    correctIndex: 2, 
    translation: "Thank you very much!", 
    emoji: "🙏" 
  },
];

const shuffleQuestions = () => [...questions].sort(() => Math.random() - 0.5);

export const RestaurantOrderingLesson = () => {
  const [shuffledQuestions] = useState<FillBlankQuestion[]>(() => shuffleQuestions());
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
  const { saveProgress, isLessonCompleted, refetch } = useUserProgress();

  const currentQuestion = shuffledQuestions[currentStep];
  const progress = ((currentStep + 1) / shuffledQuestions.length) * 100;
  const isRevision = isLessonCompleted(LESSON_ID);

  const selectAnswer = (index: number) => {
    if (isCorrect !== null) return;
    setSelectedAnswer(index);
    const correct = index === currentQuestion.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentStep < shuffledQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      let xpEarned = 0;
      
      if (!isRevision && user?.id) {
        const baseXP = Math.round((correctAnswers / shuffledQuestions.length) * XP_REWARD);
        xpEarned = baseXP;
        await updateXP(xpEarned);
        await saveProgress(LESSON_ID, xpEarned, correctAnswers, shuffledQuestions.length);
        refetch();
      }
      
      setEarnedXP(xpEarned);
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey={LESSON_ID}
        score={earnedXP}
        xpEarned={earnedXP}
        correctAnswers={correctAnswers}
        totalQuestions={shuffledQuestions.length}
        isRevision={isRevision}
      />
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
          <span className="text-sm font-medium">{currentStep + 1}/{shuffledQuestions.length}</span>
          {isRevision && (
            <span className="text-xs bg-muted px-2 py-1 rounded">Revision</span>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              Ordering at a Restaurant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-8xl text-center mb-4">
              {currentQuestion.emoji}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Scenario:</p>
              <p className="font-medium">{currentQuestion.scenario}</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold mb-2">{currentQuestion.sentence}</p>
              <p className="text-lg text-primary">{currentQuestion.translation}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => selectAnswer(index)}
                  disabled={isCorrect !== null}
                  className={cn(
                    "py-6 text-lg transition-all",
                    selectedAnswer === index && isCorrect && "bg-green-500 text-white border-green-500",
                    selectedAnswer === index && !isCorrect && "bg-red-500 text-white border-red-500",
                    isCorrect !== null && index === currentQuestion.correctIndex && selectedAnswer !== index && "border-green-500 border-2"
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>

            {isCorrect !== null && (
              <>
                <div className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                  isCorrect ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                )}>
                  {isCorrect ? (
                    <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
                  ) : (
                    <><X className="w-6 h-6" /><span className="font-bold">Answer: {currentQuestion.options[currentQuestion.correctIndex]}</span></>
                  )}
                </div>
                <Button onClick={nextQuestion} className="w-full">
                  {currentStep < shuffledQuestions.length - 1 ? "Next" : "Complete"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>{isRevision ? "Revision Mode" : ""} Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrderingLesson;