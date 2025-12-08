import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, X, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { LessonComplete } from "@/components/LessonComplete";
import { getLessonNavigation } from "@/lib/lessonNavigation";
import { ShpokoMascot } from "@/components/ShpokoMascot";

interface Question {
  sentence: string;
  blank: string;
  options: string[];
  correctIndex: number;
  translation: string;
}

const questions: Question[] = [
  {
    sentence: "Добро ____",
    blank: "утро",
    options: ["утро", "вечер", "ден", "нощ"],
    correctIndex: 0,
    translation: "Good morning",
  },
  {
    sentence: "Как сте? Аз съм ____",
    blank: "добре",
    options: ["зле", "добре", "гладен", "уморен"],
    correctIndex: 1,
    translation: "How are you? I am fine",
  },
  {
    sentence: "____ се казвам Иван",
    blank: "Аз",
    options: ["Той", "Тя", "Аз", "Ние"],
    correctIndex: 2,
    translation: "I am called Ivan",
  },
  {
    sentence: "Много ____ за помощта",
    blank: "благодаря",
    options: ["моля", "съжалявам", "благодаря", "здравей"],
    correctIndex: 2,
    translation: "Thank you very much for the help",
  },
  {
    sentence: "Лека ____!",
    blank: "нощ",
    options: ["утро", "ден", "вечер", "нощ"],
    correctIndex: 3,
    translation: "Good night!",
  },
  {
    sentence: "Приятно ми е да се ____",
    blank: "запознаем",
    options: ["видим", "чуем", "запознаем", "срещнем"],
    correctIndex: 2,
    translation: "Nice to meet you",
  },
  {
    sentence: "Колко ____ това?",
    blank: "струва",
    options: ["струва", "тежи", "има", "е"],
    correctIndex: 0,
    translation: "How much does this cost?",
  },
  {
    sentence: "Искам ____ вода",
    blank: "една",
    options: ["много", "една", "две", "малко"],
    correctIndex: 1,
    translation: "I want one water",
  },
  {
    sentence: "Къде е ____?",
    blank: "тоалетната",
    options: ["ресторантът", "хотелът", "тоалетната", "гарата"],
    correctIndex: 2,
    translation: "Where is the bathroom?",
  },
  {
    sentence: "Не ____ български",
    blank: "разбирам",
    options: ["говоря", "разбирам", "уча", "знам"],
    correctIndex: 1,
    translation: "I do not understand Bulgarian",
  },
  {
    sentence: "Обичам ____ храна",
    blank: "българска",
    options: ["добра", "българска", "голяма", "нова"],
    correctIndex: 1,
    translation: "I love Bulgarian food",
  },
  {
    sentence: "Днес е ____ ден",
    blank: "хубав",
    options: ["лош", "студен", "хубав", "дълъг"],
    correctIndex: 2,
    translation: "Today is a nice day",
  },
];

export const FillBlanksLesson = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateXP } = useAuth();

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const nav = getLessonNavigation("fill-blanks-basics");

  const playPronunciation = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text: text.replace("____", currentQuestion.blank), voice: "alloy" },
      });
      
      if (error) throw error;
      
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.play();
    } catch (error) {
      console.error("Error playing pronunciation:", error);
    }
  };

  const selectAnswer = (index: number) => {
    if (isCorrect !== null) return;
    
    setSelectedAnswer(index);
    const correct = index === currentQuestion.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 10);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setScore(score + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      if (user) {
        await updateXP(score);
        
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_id: "fill-blanks-basics",
          completed: true,
          score: score,
          correct_answers: correctAnswers,
          total_answers: questions.length,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' });
      }
      
      toast({
        title: "Lesson Complete!",
        description: `You scored ${score} XP with ${correctAnswers}/${questions.length} correct answers!`,
      });
      setIsComplete(true);
    }
  };

  // Determine Shpoko's expression based on state
  const getShpokoExpression = () => {
    if (isCorrect === true) return "correct";
    if (isCorrect === false) return "wrong";
    if (correctAnswers >= 5) return "excited";
    return "thinking";
  };

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey="fill-blanks"
        score={score}
        correctAnswers={correctAnswers}
        totalQuestions={questions.length}
        xpEarned={score}
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
          <span className="text-sm font-medium">{currentStep + 1}/{questions.length}</span>
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-center flex-1">Fill in the blank</CardTitle>
              <ShpokoMascot size="sm" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-3xl font-bold">{currentQuestion.sentence}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => playPronunciation(currentQuestion.sentence)}
                >
                  <Volume2 className="w-6 h-6" />
                </Button>
              </div>
              <p className="text-lg font-bold text-primary">{currentQuestion.translation}</p>
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
              <div className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-lg animate-fade-in",
                isCorrect ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
              )}>
                <ShpokoMascot size="xs" />
                {isCorrect ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-6 h-6" />
                    <span className="font-bold">Correct! +10 XP</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <X className="w-6 h-6" />
                    <span className="font-bold">
                      The answer is: {currentQuestion.options[currentQuestion.correctIndex]}
                    </span>
                  </div>
                )}
              </div>
            )}

            {isCorrect !== null && (
              <Button onClick={nextQuestion} className="w-full">
                {currentStep < questions.length - 1 ? "Next" : "Complete Lesson"}
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>Score: {score} XP | Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default FillBlanksLesson;
