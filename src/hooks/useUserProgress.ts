import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";

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
  const { isGuest, completedLessons: guestCompletedLessons } = useGuest();

  useEffect(() => {
    if (user?.id) {
      fetchProgress();
    } else {
      setLoading(false);
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

  // For guests we expose their localStorage-tracked completions in the same
  // shape so the lesson path / completion UI works identically before signup.
  const effectiveProgress: Record<string, UserProgress> = user?.id
    ? progress
    : isGuest
    ? Object.fromEntries(
        Object.entries(guestCompletedLessons).map(([lessonId, rec]) => [
          lessonId,
          {
            lesson_id: lessonId,
            completed: true,
            score: rec.score,
            completed_at: rec.completedAt,
          },
        ])
      )
    : {};

  const isLessonCompleted = (lessonId: string): boolean => {
    return effectiveProgress[lessonId]?.completed ?? false;
  };

  const getLessonProgress = (lessonId: string): number => {
    const p = effectiveProgress[lessonId];
    if (!p) return 0;
    if (p.completed) return 100;
    return p.score || 0;
  };

  // Check if XP can be earned - lessons now only give XP on FIRST completion
  const canEarnXP = (lessonId: string): boolean => {
    const p = progress[lessonId];
    // If never completed, can earn XP
    if (!p?.completed) return true;
    // If already completed once, no more XP
    return false;
  };

  // Save progress and optionally award XP
  const saveProgress = async (
    lessonId: string, 
    score: number, 
    correctAnswers: number, 
    totalAnswers: number,
    updateXPFn?: (amount: number) => Promise<void>
  ): Promise<{ xpAwarded: boolean; xpAmount: number }> => {
    if (!user?.id) return { xpAwarded: false, xpAmount: 0 };
    
    const canEarn = canEarnXP(lessonId);
    
    // Save progress
    await supabase.from("user_progress").upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      score,
      correct_answers: correctAnswers,
      total_answers: totalAnswers,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });
    
    // Award XP only on first completion
    if (canEarn && updateXPFn) {
      await updateXPFn(score);
      await fetchProgress(); // Refresh progress
      return { xpAwarded: true, xpAmount: score };
    }
    
    await fetchProgress(); // Refresh progress
    return { xpAwarded: false, xpAmount: 0 };
  };

  return {
    progress,
    loading,
    isLessonCompleted,
    getLessonProgress,
    canEarnXP,
    saveProgress,
    refetch: fetchProgress,
  };
};
