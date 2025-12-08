import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProgress {
  lesson_id: string;
  completed: boolean;
  score: number;
}

export const useUserProgress = () => {
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchProgress();
    }
  }, [user?.id]);

  const fetchProgress = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("user_progress")
      .select("lesson_id, completed, score")
      .eq("user_id", user.id);

    if (!error && data) {
      const progressMap: Record<string, UserProgress> = {};
      data.forEach((p) => {
        progressMap[p.lesson_id] = p;
      });
      setProgress(progressMap);
    }
    setLoading(false);
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return progress[lessonId]?.completed ?? false;
  };

  const getLessonProgress = (lessonId: string): number => {
    const p = progress[lessonId];
    if (!p) return 0;
    if (p.completed) return 100;
    return p.score || 0;
  };

  return {
    progress,
    loading,
    isLessonCompleted,
    getLessonProgress,
    refetch: fetchProgress,
  };
};
