import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProgress {
  lesson_id: string;
  completed: boolean;
  score: number;
  completed_at: string | null;
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
      .select("lesson_id, completed, score, completed_at")
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

  // Check if XP can be earned (only once per week per lesson)
  const canEarnXP = (lessonId: string): boolean => {
    const p = progress[lessonId];
    if (!p?.completed_at) return true;
    
    const completedAt = new Date(p.completed_at);
    const now = new Date();
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    
    return (now.getTime() - completedAt.getTime()) >= weekInMs;
  };

  return {
    progress,
    loading,
    isLessonCompleted,
    getLessonProgress,
    canEarnXP,
    refetch: fetchProgress,
  };
};
