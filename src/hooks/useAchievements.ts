import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ACHIEVEMENTS_KEY = "user_achievements";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "lessons" | "streaks" | "xp" | "games" | "social" | "deepdives" | "vocabulary";
  requirement: number;
  xpReward: number;
  skinReward?: string; // Skin ID to unlock
}

export const ACHIEVEMENTS: Achievement[] = [
  // Lessons
  { id: "first_lesson", name: "First Steps", description: "Complete your first lesson", icon: "📚", category: "lessons", requirement: 1, xpReward: 10, skinReward: "skin_trash_panda" },
  { id: "lessons_10", name: "Dedicated Learner", description: "Complete 10 lessons", icon: "📖", category: "lessons", requirement: 10, xpReward: 50 },
  { id: "lessons_25", name: "Knowledge Seeker", description: "Complete 25 lessons", icon: "🎓", category: "lessons", requirement: 25, xpReward: 100 },
  { id: "lessons_50", name: "Scholar", description: "Complete 50 lessons", icon: "📖", category: "lessons", requirement: 50, xpReward: 200 },
  { id: "lessons_100", name: "Master Linguist", description: "Complete 100 lessons", icon: "👑", category: "lessons", requirement: 100, xpReward: 500 },

  // Streaks
  { id: "streak_3", name: "Getting Started", description: "Reach a 3-day streak", icon: "🔥", category: "streaks", requirement: 3, xpReward: 15 },
  { id: "streak_7", name: "Week Warrior", description: "Reach a 7-day streak", icon: "⚡", category: "streaks", requirement: 7, xpReward: 50 },
  { id: "streak_14", name: "Fortnight Fighter", description: "Reach a 14-day streak", icon: "💪", category: "streaks", requirement: 14, xpReward: 100 },
  { id: "streak_30", name: "Monthly Master", description: "Reach a 30-day streak", icon: "🌟", category: "streaks", requirement: 30, xpReward: 250, skinReward: "skin_firefighter" },
  { id: "streak_100", name: "Unstoppable", description: "Reach a 100-day streak", icon: "🏆", category: "streaks", requirement: 100, xpReward: 1000 },

  // XP
  { id: "xp_100", name: "XP Hunter", description: "Earn 100 XP", icon: "✨", category: "xp", requirement: 100, xpReward: 10 },
  { id: "xp_500", name: "XP Collector", description: "Earn 500 XP", icon: "💫", category: "xp", requirement: 500, xpReward: 50 },
  { id: "xp_1000", name: "XP Champion", description: "Earn 1,000 XP", icon: "🌠", category: "xp", requirement: 1000, xpReward: 100 },
  { id: "xp_5000", name: "XP Legend", description: "Earn 5,000 XP", icon: "🎇", category: "xp", requirement: 5000, xpReward: 250 },
  { id: "xp_10000", name: "XP Master", description: "Earn 10,000 XP", icon: "🏅", category: "xp", requirement: 10000, xpReward: 500 },
  { id: "xp_50000", name: "XP Overlord", description: "Earn 50,000 XP", icon: "🤖", category: "xp", requirement: 50000, xpReward: 1000, skinReward: "skin_mech" },

  // Games
  { id: "game_first", name: "Game On", description: "Play your first mini-game", icon: "🎮", category: "games", requirement: 1, xpReward: 10 },
  { id: "games_10", name: "Gamer", description: "Play 10 mini-games", icon: "🕹️", category: "games", requirement: 10, xpReward: 50, skinReward: "skin_slingshot" },
  { id: "games_50", name: "Pro Gamer", description: "Play 50 mini-games", icon: "👾", category: "games", requirement: 50, xpReward: 150 },

  // Deep Dives
  { id: "deepdive_1", name: "Deep Diver", description: "Complete your first deep-dive", icon: "🤿", category: "deepdives", requirement: 1, xpReward: 20 },
  { id: "deepdive_5", name: "Ocean Bound", description: "Complete 5 deep-dives", icon: "🌊", category: "deepdives", requirement: 5, xpReward: 50, skinReward: "skin_stink_bomber" },
  { id: "deepdive_15", name: "Treasure Hunter", description: "Complete 15 deep-dives", icon: "💎", category: "deepdives", requirement: 15, xpReward: 100 },
  { id: "deepdive_25", name: "Shadow Master", description: "Complete 25 deep-dives", icon: "🥷", category: "deepdives", requirement: 25, xpReward: 150, skinReward: "skin_shadow_ninja" },
  { id: "deepdive_30", name: "Abyss Explorer", description: "Complete 30 deep-dives", icon: "🏊", category: "deepdives", requirement: 30, xpReward: 200 },
  { id: "deepdive_50", name: "Mariana Master", description: "Complete 50 deep-dives", icon: "👑", category: "deepdives", requirement: 50, xpReward: 500 },

  // Vocabulary
  { id: "vocab_100", name: "Word Learner", description: "Learn 100 words", icon: "📝", category: "vocabulary", requirement: 100, xpReward: 50 },
  { id: "vocab_250", name: "Word Collector", description: "Learn 250 words", icon: "📖", category: "vocabulary", requirement: 250, xpReward: 100 },
  { id: "vocab_500", name: "Word Wizard", description: "Learn 500 words", icon: "🧙", category: "vocabulary", requirement: 500, xpReward: 200, skinReward: "skin_wizard" },
  { id: "vocab_1000", name: "Lexicon Master", description: "Learn 1,000 words", icon: "📚", category: "vocabulary", requirement: 1000, xpReward: 500 },

  // Social
  { id: "level_5", name: "Rising Star", description: "Reach level 5", icon: "⭐", category: "social", requirement: 5, xpReward: 50 },
  { id: "level_10", name: "Shining Star", description: "Reach level 10", icon: "🌟", category: "social", requirement: 10, xpReward: 100 },
  { id: "level_25", name: "Superstar", description: "Reach level 25", icon: "💎", category: "social", requirement: 25, xpReward: 250 },
];

// Skin rewards mapped to unlock conditions for easy lookup
export const SKIN_UNLOCK_CONDITIONS: Record<string, { achievementId: string; description: string }> = {
  skin_trash_panda: { achievementId: "first_lesson", description: "Complete your first lesson" },
  skin_slingshot: { achievementId: "games_10", description: "Play 10 mini-games" },
  skin_stink_bomber: { achievementId: "deepdive_5", description: "Complete 5 deep-dives" },
  skin_firefighter: { achievementId: "streak_30", description: "Reach a 30-day streak" },
  skin_shadow_ninja: { achievementId: "deepdive_25", description: "Complete 25 deep-dives" },
  skin_wizard: { achievementId: "vocab_500", description: "Learn 500 words" },
  skin_mech: { achievementId: "xp_50000", description: "Earn 50,000 XP" },
  skin_king: { achievementId: "leaderboard_first", description: "Reach #1 in weekly league" },
};

interface AchievementState {
  unlockedIds: string[];
  progress: Record<string, number>;
  unlockedSkins: string[]; // Track unlocked reward skins
}

interface UseAchievementsResult {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  progress: Record<string, number>;
  unlockedSkins: string[];
  checkAndUnlock: () => Promise<{ achievements: Achievement[]; skins: string[] }>;
  loading: boolean;
}

export const useAchievements = (): UseAchievementsResult => {
  const { user, profile, updateXP } = useAuth();
  const [state, setState] = useState<AchievementState>({ unlockedIds: [], progress: {}, unlockedSkins: [] });
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
        const parsed = JSON.parse(stored);
        setState({
          unlockedIds: parsed.unlockedIds || [],
          progress: parsed.progress || {},
          unlockedSkins: parsed.unlockedSkins || [],
        });
      } catch {
        setState({ unlockedIds: [], progress: {}, unlockedSkins: [] });
      }
    }
    setLoading(false);
  }, [user?.id, getStorageKey]);

  // Helper to add skin to owned items
  const awardSkin = useCallback((skinId: string, userId: string) => {
    const ownedKey = `shop_items_${userId}`;
    const owned = JSON.parse(localStorage.getItem(ownedKey) || "[]");
    if (!owned.includes(skinId)) {
      owned.push(skinId);
      localStorage.setItem(ownedKey, JSON.stringify(owned));
    }
  }, []);

  // Check and unlock achievements based on current stats
  const checkAndUnlock = useCallback(async (): Promise<{ achievements: Achievement[]; skins: string[] }> => {
    if (!user?.id || !profile) return { achievements: [], skins: [] };

    const newlyUnlocked: Achievement[] = [];
    const newlyUnlockedSkins: string[] = [];
    const currentUnlocked = [...state.unlockedIds];
    const currentSkins = [...state.unlockedSkins];
    const newProgress: Record<string, number> = {};

    // Fetch lesson count
    const { count: lessonCount } = await supabase
      .from("user_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true);

    // Fetch deep-dive count
    const { count: deepDiveCount } = await supabase
      .from("deep_dive_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Fetch vocabulary count
    const { count: vocabCount } = await supabase
      .from("user_vocabulary")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

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
        case "deepdives":
          currentValue = deepDiveCount || 0;
          isUnlocked = currentValue >= achievement.requirement;
          break;
        case "vocabulary":
          currentValue = vocabCount || 0;
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
        
        // Award skin if applicable
        if (achievement.skinReward && !currentSkins.includes(achievement.skinReward)) {
          currentSkins.push(achievement.skinReward);
          newlyUnlockedSkins.push(achievement.skinReward);
          awardSkin(achievement.skinReward, user.id);
        }
      }
    }

    const newState = { unlockedIds: currentUnlocked, progress: newProgress, unlockedSkins: currentSkins };
    setState(newState);
    localStorage.setItem(getStorageKey(), JSON.stringify(newState));

    return { achievements: newlyUnlocked, skins: newlyUnlockedSkins };
  }, [user?.id, profile, state.unlockedIds, state.unlockedSkins, getStorageKey, updateXP, awardSkin]);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => state.unlockedIds.includes(a.id));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !state.unlockedIds.includes(a.id));

  return {
    achievements: ACHIEVEMENTS,
    unlockedAchievements,
    lockedAchievements,
    progress: state.progress,
    unlockedSkins: state.unlockedSkins,
    checkAndUnlock,
    loading,
  };
};
