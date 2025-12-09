import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Volume2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ShpokoMascot } from "@/components/ShpokoMascot";

interface WeekdayItem {
  bulgarian: string;
  romanized: string;
  english: string;
}

const weekdays: WeekdayItem[] = [
  { bulgarian: "Понеделник", romanized: "Ponedelnik", english: "Monday" },
  { bulgarian: "Вторник", romanized: "Vtornik", english: "Tuesday" },
  { bulgarian: "Сряда", romanized: "Sryada", english: "Wednesday" },
  { bulgarian: "Четвъртък", romanized: "Chetvartuk", english: "Thursday" },
  { bulgarian: "Петък", romanized: "Petuk", english: "Friday" },
  { bulgarian: "Събота", romanized: "Sabota", english: "Saturday" },
  { bulgarian: "Неделя", romanized: "Nedelya", english: "Sunday" },
];

const months: WeekdayItem[] = [
  { bulgarian: "Януари", romanized: "Yanuari", english: "January" },
  { bulgarian: "Февруари", romanized: "Fevruari", english: "February" },
  { bulgarian: "Март", romanized: "Mart", english: "March" },
  { bulgarian: "Април", romanized: "April", english: "April" },
  { bulgarian: "Май", romanized: "May", english: "May" },
  { bulgarian: "Юни", romanized: "Yuni", english: "June" },
  { bulgarian: "Юли", romanized: "Yuli", english: "July" },
  { bulgarian: "Август", romanized: "Avgust", english: "August" },
  { bulgarian: "Септември", romanized: "Septemvri", english: "September" },
  { bulgarian: "Октомври", romanized: "Oktomvri", english: "October" },
  { bulgarian: "Ноември", romanized: "Noemvri", english: "November" },
  { bulgarian: "Декември", romanized: "Dekemvri", english: "December" },
];

type Phase = "learn-weekdays" | "learn-months" | "quiz" | "complete";

interface QuizQuestion {
  type: "weekday" | "month";
  item: WeekdayItem;
  options: string[];
  correctIndex: number;
}

const generateQuizQuestions = (): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  
  // Add weekday questions
  weekdays.forEach((item) => {
    const otherOptions = weekdays
      .filter(w => w.english !== item.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.english);
    
    const options = [...otherOptions, item.english].sort(() => Math.random() - 0.5);
    questions.push({
      type: "weekday",
      item,
      options,
      correctIndex: options.indexOf(item.english),
    });
  });
  
  // Add month questions
  months.forEach((item) => {
    const otherOptions = months
      .filter(m => m.english !== item.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(m => m.english);
    
    const options = [...otherOptions, item.english].sort(() => Math.random() - 0.5);
    questions.push({
      type: "month",
      item,
      options,
      correctIndex: options.indexOf(item.english),
    });
  });
  
  return questions.sort(() => Math.random() - 0.5).slice(0, 10);
};

const WeekdaysLesson = () => {
  const navigate = useNavigate();
  const { user, profile, updateXP } = useAuth();
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<Phase>("learn-weekdays");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [interactions, setInteractions] = useState(0);

  useEffect(() => {
    setQuizQuestions(generateQuizQuestions());
  }, []);

  const currentItems = phase === "learn-weekdays" ? weekdays : months;
  const progress = phase === "learn-weekdays" 
    ? (currentIndex / weekdays.length) * 33
    : phase === "learn-months"
    ? 33 + (currentIndex / months.length) * 33
    : phase === "quiz"
    ? 66 + (currentQuestionIndex / quizQuestions.length) * 34
    : 100;

  const handleNext = () => {
    setInteractions(prev => prev + 1);
    
    if (phase === "learn-weekdays") {
      if (currentIndex < weekdays.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setPhase("learn-months");
        setCurrentIndex(0);
      }
    } else if (phase === "learn-months") {
      if (currentIndex < months.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setPhase("quiz");
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (isCorrect !== null) return;
    
    setInteractions(prev => prev + 1);
    setSelectedAnswer(index);
    const correct = index === quizQuestions[currentQuestionIndex].correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
      setTotalXP(prev => prev + 10);
    } else {
      setTotalXP(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Complete lesson
      if (user && totalXP > 0) {
        await updateXP(totalXP);
        
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_id: "days-months",
          completed: true,
          score: totalXP,
          correct_answers: correctCount,
          total_answers: quizQuestions.length,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
      }
      
      setPhase("complete");
    }
  };

  if (phase === "complete") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <ShpokoMascot size="lg" className="mx-auto mb-4" />
            <CardTitle className="text-2xl">Lesson Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              You got <span className="font-bold text-primary">{correctCount}</span> out of{" "}
              <span className="font-bold">{quizQuestions.length}</span> correct!
            </p>
            <p className="text-xl font-bold text-primary">+{totalXP} XP</p>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/")} className="flex-1">
                Back to Home
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setPhase("learn-weekdays");
                  setCurrentIndex(0);
                  setQuizQuestions(generateQuizQuestions());
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer(null);
                  setIsCorrect(null);
                  setCorrectCount(0);
                  setTotalXP(0);
                }}
                className="flex-1"
              >
                Practice Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "quiz") {
    const question = quizQuestions[currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                What is "{question.item.bulgarian}" in English?
              </CardTitle>
              <p className="text-center text-muted-foreground">
                ({question.item.romanized})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={cn(
                      "h-14 text-lg",
                      selectedAnswer === index && isCorrect && "bg-green-500 text-white border-green-500",
                      selectedAnswer === index && !isCorrect && "bg-red-500 text-white border-red-500",
                      isCorrect !== null && index === question.correctIndex && "bg-green-500 text-white border-green-500"
                    )}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={isCorrect !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {isCorrect !== null && (
                <div className={cn(
                  "p-4 rounded-lg flex items-center gap-3",
                  isCorrect ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                )}>
                  {isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  <span className="font-medium">
                    {isCorrect ? "Correct! +10 XP" : `Incorrect. The answer is "${question.item.english}"`}
                  </span>
                </div>
              )}

              {isCorrect !== null && (
                <Button onClick={handleNextQuestion} className="w-full">
                  {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "Finish"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Learning phase
  const currentItem = currentItems[currentIndex];
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {phase === "learn-weekdays" ? "Days of the Week" : "Months of the Year"}
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {currentIndex + 1} of {currentItems.length}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">
                {currentItem.bulgarian}
              </div>
              <div className="text-2xl text-muted-foreground">
                {currentItem.romanized}
              </div>
              <div className="text-xl font-medium">
                {currentItem.english}
              </div>
            </div>

            <Button onClick={handleNext} className="w-full">
              {currentIndex < currentItems.length - 1 ? "Next" : 
               phase === "learn-weekdays" ? "Continue to Months" : "Start Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeekdaysLesson;
