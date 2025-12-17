import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, User } from "lucide-react";
import { toast } from "sonner";

interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
}

interface QuizFeedbackViewProps {
  quizId: string;
  onBack: () => void;
}

export const QuizFeedbackView = ({ quizId, onBack }: QuizFeedbackViewProps) => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [quizId]);

  const fetchFeedback = async () => {
    try {
      const { data: quiz } = await supabase
        .from("quizzes")
        .select("title")
        .eq("id", quizId)
        .single();

      if (quiz) setQuizTitle(quiz.title);

      const { data, error } = await supabase
        .from("quiz_feedback")
        .select("*")
        .eq("quiz_id", quizId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error: any) {
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const averageRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : "N/A";

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Feedback</h2>
          <p className="text-muted-foreground">{quizTitle}</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-8 h-8" fill="currentColor" />
                <span className="text-3xl font-bold">{averageRating}</span>
              </div>
              <p className="text-sm text-muted-foreground">{feedback.length} reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {feedback.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No feedback yet. Share your quiz to get reviews!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedback.map((f) => (
            <Card key={f.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-full">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4"
                          fill={star <= (f.rating || 0) ? "currentColor" : "none"}
                          color={star <= (f.rating || 0) ? "#eab308" : "#d1d5db"}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(f.created_at).toLocaleDateString()}
                  </span>
                </div>
                {f.comment && <p className="text-sm">{f.comment}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
