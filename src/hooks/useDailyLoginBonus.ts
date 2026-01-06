import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const LOGIN_BONUS_KEY = "daily_login_bonus";

interface DailyLoginState {
  lastLoginDate: string;
  consecutiveDays: number;
  totalDaysLoggedIn: number;
}

interface DailyLoginBonusResult {
  consecutiveDays: number;
  todaysClaimed: boolean;
  bonusXP: number;
  bonusHearts: number;
  claimBonus: () => Promise<void>;
  loading: boolean;
}

const BONUS_TIERS = [
  { days: 1, xp: 10, hearts: 0 },
  { days: 2, xp: 15, hearts: 0 },
  { days: 3, xp: 20, hearts: 1 },
  { days: 4, xp: 25, hearts: 0 },
  { days: 5, xp: 30, hearts: 1 },
  { days: 6, xp: 40, hearts: 0 },
  { days: 7, xp: 50, hearts: 2 }, // Weekly milestone
];

export const useDailyLoginBonus = (): DailyLoginBonusResult => {
  const { user, updateXP } = useAuth();
  const [state, setState] = useState<DailyLoginState | null>(null);
  const [todaysClaimed, setTodaysClaimed] = useState(false);
  const [loading, setLoading] = useState(true);

  const getStorageKey = useCallback(() => {
    return `${LOGIN_BONUS_KEY}_${user?.id}`;
  }, [user?.id]);

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getYesterdayString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const key = getStorageKey();
    const stored = localStorage.getItem(key);
    const today = getTodayString();
    const yesterday = getYesterdayString();

    if (stored) {
      try {
        const parsed: DailyLoginState = JSON.parse(stored);
        
        if (parsed.lastLoginDate === today) {
          // Already logged in today
          setTodaysClaimed(true);
          setState(parsed);
        } else if (parsed.lastLoginDate === yesterday) {
          // Consecutive day - increment streak
          setState({
            ...parsed,
            consecutiveDays: parsed.consecutiveDays,
          });
          setTodaysClaimed(false);
        } else {
          // Streak broken - reset
          setState({
            lastLoginDate: "",
            consecutiveDays: 0,
            totalDaysLoggedIn: parsed.totalDaysLoggedIn,
          });
          setTodaysClaimed(false);
        }
      } catch {
        setState({ lastLoginDate: "", consecutiveDays: 0, totalDaysLoggedIn: 0 });
        setTodaysClaimed(false);
      }
    } else {
      setState({ lastLoginDate: "", consecutiveDays: 0, totalDaysLoggedIn: 0 });
      setTodaysClaimed(false);
    }
    
    setLoading(false);
  }, [user?.id, getStorageKey]);

  const getCurrentBonus = () => {
    const nextDay = (state?.consecutiveDays || 0) + 1;
    const cycleDay = ((nextDay - 1) % 7) + 1;
    return BONUS_TIERS.find(t => t.days === cycleDay) || BONUS_TIERS[0];
  };

  const claimBonus = async () => {
    if (!user?.id || todaysClaimed || loading) return;

    const today = getTodayString();
    const bonus = getCurrentBonus();
    
    const newState: DailyLoginState = {
      lastLoginDate: today,
      consecutiveDays: (state?.consecutiveDays || 0) + 1,
      totalDaysLoggedIn: (state?.totalDaysLoggedIn || 0) + 1,
    };

    // Award XP
    if (bonus.xp > 0) {
      await updateXP(bonus.xp);
    }

    // Save state
    localStorage.setItem(getStorageKey(), JSON.stringify(newState));
    setState(newState);
    setTodaysClaimed(true);
  };

  const bonus = getCurrentBonus();

  return {
    consecutiveDays: state?.consecutiveDays || 0,
    todaysClaimed,
    bonusXP: bonus.xp,
    bonusHearts: bonus.hearts,
    claimBonus,
    loading,
  };
};

export const BONUS_TIERS_INFO = BONUS_TIERS;
