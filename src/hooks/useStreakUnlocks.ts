import { useAuth } from "@/contexts/AuthContext";

export const useStreakUnlocks = () => {
  const { profile } = useAuth();
  
  const streak = profile?.streak || 0;
  const isPremium = profile?.is_premium || false;
  
  // Every 5 streak days = 1 premium lesson unlock
  const unlockedPremiumLessons = Math.floor(streak / 5);
  
  // Check if a specific premium lesson is unlocked by streak
  const isPremiumLessonUnlocked = (lessonIndex: number): boolean => {
    if (isPremium) return true; // Premium users have access to all
    return lessonIndex < unlockedPremiumLessons;
  };
  
  // Get number of remaining days until next unlock
  const daysUntilNextUnlock = 5 - (streak % 5);
  
  return {
    streak,
    unlockedPremiumLessons,
    isPremiumLessonUnlocked,
    daysUntilNextUnlock,
    isPremium,
  };
};
