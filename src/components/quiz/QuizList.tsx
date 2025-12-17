import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Globe, Lock, Clock, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  is_timed: boolean;
  time_limit_seconds: number | null;
  created_at: string;
  creator_id: string;
}

interface QuizListProps {
  onCreateNew: () => void;
  onPlayQuiz: (quizId: string) => void;
  onViewFeedback: (quizId: string) => void;
}

export const QuizList = ({ onCreateNew, onPlayQuiz, onViewFeedback }: QuizListProps) => {
  const { user } = useAuth();
  const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);
  const [publicQuizzes, setPublicQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuizzes();
    }
  }, [user]);

  const fetchQuizzes = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch user's own quizzes
      const { data: mine, error: mineError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (mineError) throw mineError;
      setMyQuizzes(mine || []);

      // Fetch public quizzes from others
      const { data: pub, error: pubError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("is_public", true)
        .neq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (pubError) throw pubError;
      setPublicQuizzes(pub || []);
    } catch (error: any) {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);

      if (error) throw error;
      toast.success("Quiz deleted");
      fetchQuizzes();
    } catch (error: any) {
      toast.error("Failed to delete quiz");
    }
  };

  const togglePublic = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ is_public: !quiz.is_public })
        .eq("id", quiz.id);

      if (error) throw error;
      toast.success(quiz.is_public ? "Quiz is now private" : "Quiz is now public");
      fetchQuizzes();
    } catch (error: any) {
      toast.error("Failed to update quiz");
    }
  };

  const QuizCard = ({ quiz, isOwner }: { quiz: Quiz; isOwner: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg">{quiz.title}</h3>
          <div className="flex gap-1">
            {quiz.is_public ? (
              <Badge variant="secondary" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
            {quiz.is_timed && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {quiz.time_limit_seconds}s
              </Badge>
            )}
          </div>
        </div>
        
        {quiz.description && (
          <p className="text-sm text-muted-foreground mb-3">{quiz.description}</p>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => onPlayQuiz(quiz.id)}>
            <Play className="w-4 h-4 mr-1" />
            Play
          </Button>
          
          {isOwner && (
            <>
              <Button size="sm" variant="outline" onClick={() => togglePublic(quiz)}>
                {quiz.is_public ? <Lock className="w-4 h-4 mr-1" /> : <Globe className="w-4 h-4 mr-1" />}
                {quiz.is_public ? "Make Private" : "Make Public"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onViewFeedback(quiz.id)}>
                <MessageSquare className="w-4 h-4 mr-1" />
                Feedback
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteQuiz(quiz.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quizzes</h2>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      <Tabs defaultValue="my" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my">My Quizzes ({myQuizzes.length})</TabsTrigger>
          <TabsTrigger value="public">Community ({publicQuizzes.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my" className="space-y-3 mt-4">
          {myQuizzes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                You haven't created any quizzes yet.
              </CardContent>
            </Card>
          ) : (
            myQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} isOwner={true} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="public" className="space-y-3 mt-4">
          {publicQuizzes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No community quizzes available yet.
              </CardContent>
            </Card>
          ) : (
            publicQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} isOwner={false} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
