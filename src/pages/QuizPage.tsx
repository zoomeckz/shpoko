import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { QuizList } from "@/components/quiz/QuizList";
import { QuizCreator } from "@/components/quiz/QuizCreator";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { QuizFeedbackView } from "@/components/quiz/QuizFeedbackView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ViewState = 
  | { type: "list" }
  | { type: "create" }
  | { type: "play"; quizId: string }
  | { type: "feedback"; quizId: string };

const QuizPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>({ type: "list" });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const renderContent = () => {
    switch (view.type) {
      case "list":
        return (
          <QuizList
            onCreateNew={() => setView({ type: "create" })}
            onPlayQuiz={(quizId) => setView({ type: "play", quizId })}
            onViewFeedback={(quizId) => setView({ type: "feedback", quizId })}
          />
        );
      case "create":
        return <QuizCreator onBack={() => setView({ type: "list" })} />;
      case "play":
        return <QuizPlayer quizId={view.quizId} onBack={() => setView({ type: "list" })} />;
      case "feedback":
        return <QuizFeedbackView quizId={view.quizId} onBack={() => setView({ type: "list" })} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        streak={profile?.streak || 0}
        hearts={5}
        xp={profile?.xp || 0}
        dailyGoalProgress={0}
      />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {view.type === "list" && (
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default QuizPage;
