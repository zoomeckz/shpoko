import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ACHIEVEMENTS_KEY = "user_achievements";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "lessons" | "streaks" | "xp" | "games" | "social";
  requirement: number;
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Lessons
  { id: "first_lesson", name: "First Steps", description: "Complete your first lesson", icon: "📚", category: "lessons", requirement: 1, xpReward: 10 },
  { id: "lessons_10", name: "Dedicated Learner", description: "Complete 10 lessons", icon: "📖", category: "lessons", requirement: 10, xpReward: 50 },
  { id: "lessons_25", name: "Knowledge Seeker", description: "Complete 25 lessons", icon: "🎓", category: "lessons", requirement: 25, xpReward: 100 },
  { id: "lessons_50", name: "Scholar", description: "Complete 50 lessons", icon: "🏅", category: "lessons", requirement: 50, xpReward: 200 },
  { id: "lessons_100", name: "Master Linguist", description: "Complete 100 lessons", icon: "👑", category: "lessons", requirement: 100, xpReward: 500 },

  // Streaks
  { id: "streak_3", name: "Getting Started", description: "Reach a 3-day streak", icon: "🔥", category: "streaks", requirement: 3, xpReward: 15 },
  { id: "streak_7", name: "Week Warrior", description: "Reach a 7-day streak", icon: "⚡", category: "streaks", requirement: 7, xpReward: 50 },
  { id: "streak_14", name: "Fortnight Fighter", description: "Reach a 14-day streak", icon: "💪", category: "streaks", requirement: 14, xpReward: 100 },
  { id: "streak_30", name: "Monthly Master", description: "Reach a 30-day streak", icon: "🌟", category: "streaks", requirement: 30, xpReward: 250 },
  { id: "streak_100", name: "Unstoppable", description: "Reach a 100-day streak", icon: "🏆", category: "streaks", requirement: 100, xpReward: 1000 },

  // XP
  { id: "xp_100", name: "XP Hunter", description: "Earn 100 XP", icon: "✨", category: "xp", requirement: 100, xpReward: 10 },
  { id: "xp_500", name: "XP Collector", description: "Earn 500 XP", icon: "💫", category: "xp", requirement: 500, xpReward: 50 },
  { id: "xp_1000", name: "XP Champion", description: "Earn 1,000 XP", icon: "🌠", category: "xp", requirement: 1000, xpReward: 100 },
  { id: "xp_5000", name: "XP Legend", description: "Earn 5,000 XP", icon: "🎇", category: "xp", requirement: 5000, xpReward: 250 },
  { id: "xp_10000", name: "XP Master", description: "Earn 10,000 XP", icon: "🏅", category: "xp", requirement: 10000, xpReward: 500 },

  // Games
  { id: "game_first", name: "Game On", description: "Play your first mini-game", icon: "🎮", category: "games", requirement: 1, xpReward: 10 },
  { id: "games_10", name: "Gamer", description: "Play 10 mini-games", icon: "🕹️", category: "games", requirement: 10, xpReward: 50 },
  { id: "games_50", name: "Pro Gamer", description: "Play 50 mini-games", icon: "👾", category: "games", requirement: 50, xpReward: 150 },

  // Social
  { id: "level_5", name: "Rising Star", description: "Reach level 5", icon: "⭐", category: "social", requirement: 5, xpReward: 50 },
  { id: "level_10", name: "Shining Star", description: "Reach level 10", icon: "🌟", category: "social", requirement: 10, xpReward: 100 },
  { id: "level_25", name: "Superstar", description: "Reach level 25", icon: "💎", category: "social", requirement: 25, xpReward: 250 },
];

interface AchievementState {
  unlockedIds: string[];
  progress: Record<string, number>;
}

interface UseAchievementsResult {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  progress: Record<string, number>;
  checkAndUnlock: () => Promise<Achievement[]>;
  loading: boolean;
}

export const useAchievements = (): UseAchievementsResult => {
  const { user, profile, updateXP } = useAuth();
  const [state, setState] = useState<AchievementState>({ unlockedIds: [], progress: {} });
  const [loading, setLoading] = useState(true);

  const getStorageKey = useCallback(() => {
    return `${ACHIEVEMENTS_KEY}_${user?.id}`;
  }, [user?.id]);

  // Load achievements state
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch {
        setState({ unlockedIds: [], progress: {} });
      }
    }
    setLoading(false);
  }, [user?.id, getStorageKey]);

  // Check and unlock achievements based on current stats
  const checkAndUnlock = useCallback(async (): Promise<Achievement[]> => {
    if (!user?.id || !profile) return [];

    const newlyUnlocked: Achievement[] = [];
    const currentUnlocked = [...state.unlockedIds];
    const newProgress: Record<string, number> = {};

    // Fetch lesson count
    const { count: lessonCount } = await supabase
      .from("user_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true);

    // Fetch game count (approximation from localStorage)
    const gameKeys = Object.keys(localStorage).filter(k => k.startsWith("daily_game_xp_"));
    const gameCount = gameKeys.length;

    for (const achievement of ACHIEVEMENTS) {
      if (currentUnlocked.includes(achievement.id)) continue;

      let currentValue = 0;
      let isUnlocked = false;

      switch (achievement.category) {
        case "lessons":
          currentValue = lessonCount || 0;
          isUnlocked = currentValue >= achievement.requirement;
          break;
        case "streaks":
          currentValue = profile.streak || 0;
          isUnlocked = currentValue >= achievement.requirement;
          break;
        case "xp":
          currentValue = profile.xp || 0;
          isUnlocked = currentValue >= achievement.requirement;
          break;
        case "games":
          currentValue = gameCount;
          isUnlocked = currentValue >= achievement.requirement;
          break;
        case "social":
          currentValue = profile.level || 1;
          isUnlocked = currentValue >= achievement.requirement;
          break;
      }

      newProgress[achievement.id] = Math.min(currentValue, achievement.requirement);

      if (isUnlocked) {
        currentUnlocked.push(achievement.id);
        newlyUnlocked.push(achievement);
        
        // Award XP bonus
        await updateXP(achievement.xpReward);
      }
    }

    const newState = { unlockedIds: currentUnlocked, progress: newProgress };
    setState(newState);
    localStorage.setItem(getStorageKey(), JSON.stringify(newState));

    return newlyUnlocked;
  }, [user?.id, profile, state.unlockedIds, getStorageKey, updateXP]);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => state.unlockedIds.includes(a.id));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !state.unlockedIds.includes(a.id));

  return {
    achievements: ACHIEVEMENTS,
    unlockedAchievements,
    lockedAchievements,
    progress: state.progress,
    checkAndUnlock,
    loading,
  };
};
