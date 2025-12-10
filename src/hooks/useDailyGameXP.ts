import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const GAME_XP_KEY_PREFIX = "daily_game_xp_";

interface DailyGameXPResult {
  hasEarnedToday: boolean;
  markAsEarned: () => void;
  canEarnXP: boolean;
}

export const useDailyGameXP = (gameId: string): DailyGameXPResult => {
  const { user } = useAuth();
  const [hasEarnedToday, setHasEarnedToday] = useState(false);

  const getStorageKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return `${GAME_XP_KEY_PREFIX}${gameId}_${user?.id}_${today}`;
  };

  useEffect(() => {
    if (!user?.id) return;
    
    const key = getStorageKey();
    const earned = localStorage.getItem(key) === "true";
    setHasEarnedToday(earned);
  }, [user?.id, gameId]);

  const markAsEarned = () => {
    if (!user?.id) return;
    const key = getStorageKey();
    localStorage.setItem(key, "true");
    setHasEarnedToday(true);
  };

  return {
    hasEarnedToday,
    markAsEarned,
    canEarnXP: !hasEarnedToday && !!user?.id,
  };
};
