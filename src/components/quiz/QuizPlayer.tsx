import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Clock, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  id: string;
  question_text: string;
  question_type: "choose_word" | "fill_blank";
  correct_answer: string;
  options: string[];
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  is_timed: boolean;
  time_limit_seconds: number | null;
  creator_id: string;
}

interface QuizPlayerProps {
  quizId: string;
  onBack: () => void;
}

export const QuizPlayer = ({ quizId, onBack }: QuizPlayerProps) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"loading" | "playing" | "finished">("loading");
  const [timeLeft, setTimeLeft] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [canRateThisWeek, setCanRateThisWeek] = useState(true);
  const [existingFeedbackId, setExistingFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuiz();
    checkWeeklyRating();
  }, [quizId]);

  useEffect(() => {
    if (gameState !== "playing" || !quiz?.is_timed || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, quiz, timeLeft]);

  const checkWeeklyRating = async () => {
    if (!user) return;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("quiz_feedback")
      .select("id, created_at")
      .eq("quiz_id", quizId)
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .maybeSingle();

    if (!error && data) {
      setCanRateThisWeek(false);
      setExistingFeedbackId(data.id);
    }
  };

  const fetchQuiz = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index");

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      if (quizData.is_timed && quizData.time_limit_seconds) {
        setTimeLeft(quizData.time_limit_seconds);
      }
      setGameState("playing");
    } catch (error: any) {
      toast.error("Failed to load quiz");
      onBack();
    }
  };

  const handleTimeUp = () => {
    if (isCorrect === null) {
      setIsCorrect(false);
      setTimeout(() => nextQuestion(), 1500);
    }
  };

  // Parse blanks from question text (x markers)
  const parseBlankCount = (text: string): number => {
    const matches = text.match(/\bx\b/gi);
    return matches ? matches.length : 0;
  };

  // Format question text with blank indicators
  const formatQuestionText = (text: string): string => {
    return text.replace(/\bx\b/gi, "_____");
  };

  const checkAnswer = () => {
    const current = questions[currentIndex];
    const blankCount = parseBlankCount(current.question_text);
    
    if (blankCount > 1) {
      // Multiple blanks - check all answers
      const correctAnswers = current.correct_answer.split(",").map(a => a.trim().toLowerCase());
      const userAnswersLower = userAnswers.map(a => a.trim().toLowerCase());
      
      const allCorrect = correctAnswers.every((answer, idx) => 
        userAnswersLower[idx] === answer
      );
      
      setIsCorrect(allCorrect);
      if (allCorrect) setScore((s) => s + 1);
    } else {
      // Single answer
      const userAnswer = userAnswers[0] || "";
      const correct = userAnswer.toLowerCase().trim() === current.correct_answer.toLowerCase().trim();
      setIsCorrect(correct);
      if (correct) setScore((s) => s + 1);
    }
  };

  const selectOption = (option: string) => {
    const current = questions[currentIndex];
    const correct = option.toLowerCase() === current.correct_answer.toLowerCase();
    setUserAnswers([option]);
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setUserAnswers([]);
      setIsCorrect(null);
      if (quiz?.is_timed && quiz.time_limit_seconds) {
        setTimeLeft(quiz.time_limit_seconds);
      }
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setGameState("finished");
    if (!user) return;

    try {
      await supabase.from("quiz_attempts").insert({
        quiz_id: quizId,
        user_id: user.id,
        score,
        total_questions: questions.length,
      });
    } catch (error) {
      console.error("Failed to save attempt:", error);
    }
  };

  const submitFeedback = async () => {
    if (!user || feedbackRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!canRateThisWeek) {
      toast.error("You've already rated this quiz this week");
      return;
    }

    try {
      const { error } = await supabase.from("quiz_feedback").insert({
        quiz_id: quizId,
        user_id: user.id,
        rating: feedbackRating,
        comment: feedbackComment.trim() || null,
      });

      if (error) throw error;
      toast.success("Thanks for your feedback!");
      setShowFeedback(false);
      setCanRateThisWeek(false);
    } catch (error: any) {
      toast.error("Failed to submit feedback");
    }
  };

  if (gameState === "loading" || !quiz) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (gameState === "finished") {
    const percentage = Math.round((score / questions.length) * 100);
    const isCreator = quiz.creator_id === user?.id;

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <p className="text-lg">
              You scored <span className="font-bold text-primary">{score}</span> out of{" "}
              <span className="font-bold">{questions.length}</span>
            </p>
            <p className="text-3xl font-bold text-primary">{percentage}%</p>
            
            <div className="flex gap-2 justify-center flex-wrap">
              <Button onClick={onBack}>Back to Quizzes</Button>
              {!isCreator && canRateThisWeek && (
                <Button variant="outline" onClick={() => setShowFeedback(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Leave Feedback
                </Button>
              )}
              {!isCreator && !canRateThisWeek && (
                <p className="text-sm text-muted-foreground">
                  You've already rated this quiz this week
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {showFeedback && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm mb-2">Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        feedbackRating >= star
                          ? "text-yellow-500"
                          : "text-muted-foreground hover:text-yellow-400"
                      )}
                    >
                      <Star className="w-6 h-6" fill={feedbackRating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm mb-2">Comment (optional)</p>
                <Textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share your thoughts about this quiz..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={submitFeedback}>Submit Feedback</Button>
                <Button variant="ghost" onClick={() => setShowFeedback(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const blankCount = current.question_type === "fill_blank" ? parseBlankCount(current.question_text) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <Progress value={progress} className="h-3" />
        </div>
        <span className="text-sm font-medium">
          {currentIndex + 1}/{questions.length}
        </span>
        {quiz.is_timed && (
          <div className={cn("flex items-center gap-1", timeLeft <= 5 && "text-destructive")}>
            <Clock className="w-4 h-4" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium">{formatQuestionText(current.question_text)}</p>

          {current.question_type === "fill_blank" ? (
            <div className="space-y-4">
              {blankCount > 1 ? (
                // Multiple blanks
                <div className="space-y-2">
                  {Array.from({ length: blankCount }).map((_, idx) => (
                    <Input
                      key={idx}
                      value={userAnswers[idx] || ""}
                      onChange={(e) => {
                        const newAnswers = [...userAnswers];
                        newAnswers[idx] = e.target.value;
                        setUserAnswers(newAnswers);
                      }}
                      placeholder={`Answer ${idx + 1}...`}
                      className={cn(
                        "text-center text-lg py-6",
                        isCorrect === true && "border-green-500 bg-green-500/10",
                        isCorrect === false && "border-red-500 bg-red-500/10"
                      )}
                      disabled={isCorrect !== null}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (isCorrect !== null) nextQuestion();
                          else if (userAnswers.filter(a => a?.trim()).length === blankCount) checkAnswer();
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                // Single blank
                <Input
                  value={userAnswers[0] || ""}
                  onChange={(e) => setUserAnswers([e.target.value])}
                  placeholder="Type your answer..."
                  className={cn(
                    "text-center text-lg py-6",
                    isCorrect === true && "border-green-500 bg-green-500/10",
                    isCorrect === false && "border-red-500 bg-red-500/10"
                  )}
                  disabled={isCorrect !== null}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (isCorrect !== null) nextQuestion();
                      else checkAnswer();
                    }
                  }}
                />
              )}
              {isCorrect === null && (
                <Button 
                  onClick={checkAnswer} 
                  className="w-full" 
                  disabled={blankCount > 1 
                    ? userAnswers.filter(a => a?.trim()).length !== blankCount 
                    : !userAnswers[0]?.trim()
                  }
                >
                  Check Answer
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {current.options.map((option, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className={cn(
                    "h-auto py-4 text-wrap",
                    isCorrect !== null && option.toLowerCase() === current.correct_answer.toLowerCase() &&
                      "bg-green-500/20 border-green-500",
                    isCorrect !== null && userAnswers[0] === option && !isCorrect &&
                      "bg-red-500/20 border-red-500"
                  )}
                  onClick={() => selectOption(option)}
                  disabled={isCorrect !== null}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {isCorrect !== null && (
            <div
              className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-lg animate-fade-in",
                isCorrect ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
              )}
            >
              {isCorrect ? (
                <>
                  <Check className="w-6 h-6" />
                  <span className="font-bold">Correct!</span>
                </>
              ) : (
                <>
                  <X className="w-6 h-6" />
                  <span className="font-bold">Answer: {current.correct_answer}</span>
                </>
              )}
            </div>
          )}

          {isCorrect !== null && (
            <Button onClick={nextQuestion} className="w-full">
              {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Score: {score}/{currentIndex + (isCorrect !== null ? 1 : 0)}
      </div>
    </div>
  );
};
