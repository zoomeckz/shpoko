import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuizList } from "@/components/quiz/QuizList";
import { QuizCreator } from "@/components/quiz/QuizCreator";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { QuizFeedbackView } from "@/components/quiz/QuizFeedbackView";

type ViewState = 
  | { type: "list" }
  | { type: "create" }
  | { type: "edit"; quizId: string }
  | { type: "play"; quizId: string }
  | { type: "feedback"; quizId: string };

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ViewState>({ type: "list" });

  // Handle URL params for playing quiz directly
  useEffect(() => {
    const playId = searchParams.get("play");
    if (playId) {
      setView({ type: "play", quizId: playId });
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (view.type) {
      case "list":
        return (
          <QuizList
            onCreateNew={() => setView({ type: "create" })}
            onPlayQuiz={(quizId) => setView({ type: "play", quizId })}
            onViewFeedback={(quizId) => setView({ type: "feedback", quizId })}
            onEditQuiz={(quizId) => setView({ type: "edit", quizId })}
          />
        );
      case "create":
        return <QuizCreator onBack={() => setView({ type: "list" })} />;
      case "edit":
        return <QuizCreator onBack={() => setView({ type: "list" })} editQuizId={view.quizId} />;
      case "play":
        return <QuizPlayer quizId={view.quizId} onBack={() => setView({ type: "list" })} />;
      case "feedback":
        return <QuizFeedbackView quizId={view.quizId} onBack={() => setView({ type: "list" })} />;
    }
  };

  return (
    <AppLayout 
      showBackButton={view.type === "list"} 
      backLabel="Back to Home"
      maxWidth="2xl"
    >
      {renderContent()}
    </AppLayout>
  );
};

export default QuizPage;
