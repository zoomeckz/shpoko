import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LessonComplete } from "@/components/LessonComplete";
import { useUserProgress } from "@/hooks/useUserProgress";

interface TypeInQuestion {
  bulgarian: string;
  answer: string;
  hint: string;
  emoji: string;
}

interface FillBlankQuestion {
  sentence: string;
  blank: string;
  options: string[];
  correctIndex: number;
  translation: string;
  emoji: string;
}

type Question = { type: "typeIn"; data: TypeInQuestion } | { type: "fillBlank"; data: FillBlankQuestion };

const LESSON_ID = "jobs-topic";
const XP_REWARD = 70;

const typeInQuestions: TypeInQuestion[] = [
  { bulgarian: "Лекар", answer: "lekar", hint: "Doctor", emoji: "👨‍⚕️" },
  { bulgarian: "Учител", answer: "uchitel", hint: "Teacher", emoji: "👩‍🏫" },
  { bulgarian: "Инженер", answer: "inzhener", hint: "Engineer", emoji: "👷" },
  { bulgarian: "Готвач", answer: "gotvach", hint: "Chef/Cook", emoji: "👨‍🍳" },
  { bulgarian: "Полицай", answer: "politsay", hint: "Police Officer", emoji: "👮" },
];

const fillBlankQuestions: FillBlankQuestion[] = [
  { sentence: "Той е ____", blank: "лекар", options: ["лекар", "учител", "готвач", "шофьор"], correctIndex: 0, translation: "He is a doctor", emoji: "👨‍⚕️" },
  { sentence: "Тя работи като ____", blank: "медицинска сестра", options: ["полицай", "медицинска сестра", "инженер", "адвокат"], correctIndex: 1, translation: "She works as a nurse", emoji: "👩‍⚕️" },
  { sentence: "____ кара автобус", blank: "Шофьорът", options: ["Лекарят", "Шофьорът", "Готвачът", "Учителят"], correctIndex: 1, translation: "The driver drives the bus", emoji: "🚌" },
];

const generateMixedQuestions = (): Question[] => {
  const typeIn: Question[] = typeInQuestions.map(q => ({ type: "typeIn" as const, data: q }));
  const fillBlank: Question[] = fillBlankQuestions.map(q => ({ type: "fillBlank" as const, data: q }));
  const allQuestions = [...typeIn, ...fillBlank];
  return allQuestions.sort(() => Math.random() - 0.5);
};

export const JobsLesson = () => {
  const [questions] = useState<Question[]>(() => generateMixedQuestions());
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
  const { canEarnXP, saveProgress, isLessonCompleted, refetch } = useUserProgress();

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isRevision = isLessonCompleted(LESSON_ID);

  const checkTypeInAnswer = () => {
    if (currentQuestion.type !== "typeIn") return;
    const q = currentQuestion.data as TypeInQuestion;
    const isAnswerCorrect = userAnswer.toLowerCase().trim() === q.answer.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    if (isAnswerCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }
  };

  const selectFillBlankAnswer = (index: number) => {
    if (currentQuestion.type !== "fillBlank" || isCorrect !== null) return;
    const q = currentQuestion.data as FillBlankQuestion;
    setSelectedAnswer(index);
    const correct = index === q.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserAnswer("");
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      let xpEarned = 0;
      
      if (!isRevision && user?.id) {
        const baseXP = Math.round((correctAnswers / questions.length) * XP_REWARD);
        xpEarned = baseXP;
        await updateXP(xpEarned);
        await saveProgress(LESSON_ID, xpEarned, correctAnswers, questions.length);
        refetch();
      }
      
      setEarnedXP(xpEarned);
      setIsComplete(true);
    }
  };

  const getCurrentEmoji = () => {
    if (currentQuestion.type === "typeIn") {
      return (currentQuestion.data as TypeInQuestion).emoji;
    }
    return (currentQuestion.data as FillBlankQuestion).emoji;
  };

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey={LESSON_ID}
        score={earnedXP}
        xpEarned={earnedXP}
        correctAnswers={correctAnswers}
        totalQuestions={questions.length}
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
          <span className="text-sm font-medium">{currentStep + 1}/{questions.length}</span>
          {isRevision && (
            <span className="text-xs bg-muted px-2 py-1 rounded">Revision</span>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              Jobs - {currentQuestion.type === "typeIn" ? "Type the transliteration" : "Fill in the blank"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-8xl text-center mb-4">
              {getCurrentEmoji()}
            </div>

            {currentQuestion.type === "typeIn" ? (
              <>
                <div className="text-center">
                  <p className="text-5xl font-bold mb-4">{(currentQuestion.data as TypeInQuestion).bulgarian}</p>
                  {showHint && (
                    <p className="text-muted-foreground animate-fade-in">Hint: {(currentQuestion.data as TypeInQuestion).hint}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Type the transliteration..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={isCorrect !== null}
                    className={cn(
                      "text-center text-xl py-6",
                      isCorrect === true && "border-green-500 bg-green-500/10",
                      isCorrect === false && "border-red-500 bg-red-500/10"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (isCorrect !== null) nextQuestion();
                        else if (userAnswer.trim()) checkTypeInAnswer();
                      }
                    }}
                  />

                  {isCorrect !== null && (
                    <div className={cn(
                      "flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                      isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    )}>
                      {isCorrect ? (
                        <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
                      ) : (
                        <><X className="w-6 h-6" /><span className="font-bold">The answer is: {(currentQuestion.data as TypeInQuestion).answer}</span></>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  {isCorrect === null ? (
                    <>
                      <Button variant="outline" onClick={() => setShowHint(true)} disabled={showHint} className="flex-1">Show Hint</Button>
                      <Button onClick={checkTypeInAnswer} disabled={!userAnswer.trim()} className="flex-1">Check</Button>
                    </>
                  ) : (
                    <Button onClick={nextQuestion} className="w-full">
                      {currentStep < questions.length - 1 ? "Next" : "Complete"}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-3xl font-bold mb-2">{(currentQuestion.data as FillBlankQuestion).sentence}</p>
                  <p className="text-lg font-bold text-primary">{(currentQuestion.data as FillBlankQuestion).translation}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(currentQuestion.data as FillBlankQuestion).options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => selectFillBlankAnswer(index)}
                      disabled={isCorrect !== null}
                      className={cn(
                        "py-6 text-lg transition-all",
                        selectedAnswer === index && isCorrect && "bg-green-500 text-white border-green-500",
                        selectedAnswer === index && !isCorrect && "bg-red-500 text-white border-red-500",
                        isCorrect !== null && index === (currentQuestion.data as FillBlankQuestion).correctIndex && selectedAnswer !== index && "border-green-500 border-2"
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
                        <><X className="w-6 h-6" /><span className="font-bold">Answer: {(currentQuestion.data as FillBlankQuestion).options[(currentQuestion.data as FillBlankQuestion).correctIndex]}</span></>
                      )}
                    </div>
                    <Button onClick={nextQuestion} className="w-full">
                      {currentStep < questions.length - 1 ? "Next" : "Complete"}
                    </Button>
                  </>
                )}
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

export default JobsLesson;