import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  xpReward: number;
  icon: string;
  type: "lessons" | "xp" | "games" | "streak" | "perfect";
}

const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: "complete_10_lessons",
    title: "Lesson Master",
    description: "Complete 10 lessons this week",
    target: 10,
    xpReward: 100,
    icon: "📚",
    type: "lessons",
  },
  {
    id: "earn_500_xp",
    title: "XP Hunter",
    description: "Earn 500 XP this week",
    target: 500,
    xpReward: 75,
    icon: "⭐",
    type: "xp",
  },
  {
    id: "play_5_games",
    title: "Game Champion",
    description: "Play 5 mini-games this week",
    target: 5,
    xpReward: 50,
    icon: "🎮",
    type: "games",
  },
  {
    id: "maintain_streak",
    title: "Streak Keeper",
    description: "Maintain a 7-day streak",
    target: 7,
    xpReward: 150,
    icon: "🔥",
    type: "streak",
  },
  {
    id: "perfect_lessons",
    title: "Perfectionist",
    description: "Complete 3 lessons with 100% accuracy",
    target: 3,
    xpReward: 125,
    icon: "💎",
    type: "perfect",
  },
];

interface ChallengeProgress {
  challengeId: string;
  current: number;
  completed: boolean;
  claimedAt: string | null;
}

interface WeeklyData {
  weekStart: string;
  challenges: ChallengeProgress[];
}

const getWeekStart = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
};

const getWeekEnd = (): Date => {
  const start = new Date(getWeekStart());
  start.setDate(start.getDate() + 7);
  return start;
};

export const useWeeklyChallenges = () => {
  const { user, updateXP } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);

  const storageKey = `weekly_challenges_${user?.id || "guest"}`;

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem(storageKey);
      const currentWeekStart = getWeekStart();

      if (stored) {
        const data: WeeklyData = JSON.parse(stored);
        if (data.weekStart === currentWeekStart) {
          setWeeklyData(data);
          setLoading(false);
          return;
        }
      }

      // Initialize new week
      const newData: WeeklyData = {
        weekStart: currentWeekStart,
        challenges: WEEKLY_CHALLENGES.map((c) => ({
          challengeId: c.id,
          current: 0,
          completed: false,
          claimedAt: null,
        })),
      };
      localStorage.setItem(storageKey, JSON.stringify(newData));
      setWeeklyData(newData);
      setLoading(false);
    };

    loadData();
  }, [storageKey]);

  const updateProgress = useCallback(
    (type: WeeklyChallenge["type"], amount: number = 1) => {
      if (!weeklyData) return;

      const updatedChallenges = weeklyData.challenges.map((progress) => {
        const challenge = WEEKLY_CHALLENGES.find(
          (c) => c.id === progress.challengeId
        );
        if (!challenge || challenge.type !== type || progress.completed) {
          return progress;
        }

        const newCurrent = Math.min(progress.current + amount, challenge.target);
        return {
          ...progress,
          current: newCurrent,
          completed: newCurrent >= challenge.target,
        };
      });

      const newData = { ...weeklyData, challenges: updatedChallenges };
      localStorage.setItem(storageKey, JSON.stringify(newData));
      setWeeklyData(newData);
    },
    [weeklyData, storageKey]
  );

  const claimReward = useCallback(
    async (challengeId: string) => {
      if (!weeklyData || !user) return false;

      const progress = weeklyData.challenges.find(
        (c) => c.challengeId === challengeId
      );
      const challenge = WEEKLY_CHALLENGES.find((c) => c.id === challengeId);

      if (!progress || !challenge || !progress.completed || progress.claimedAt) {
        return false;
      }

      // Award XP
      await updateXP(challenge.xpReward);

      // Mark as claimed
      const updatedChallenges = weeklyData.challenges.map((c) =>
        c.challengeId === challengeId
          ? { ...c, claimedAt: new Date().toISOString() }
          : c
      );

      const newData = { ...weeklyData, challenges: updatedChallenges };
      localStorage.setItem(storageKey, JSON.stringify(newData));
      setWeeklyData(newData);

      return true;
    },
    [weeklyData, user, updateXP, storageKey]
  );

  const challenges = WEEKLY_CHALLENGES.map((challenge) => {
    const progress = weeklyData?.challenges.find(
      (c) => c.challengeId === challenge.id
    );
    return {
      ...challenge,
      current: progress?.current || 0,
      completed: progress?.completed || false,
      claimed: !!progress?.claimedAt,
    };
  });

  const daysRemaining = Math.max(
    0,
    Math.ceil((getWeekEnd().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const completedCount = challenges.filter((c) => c.completed).length;
  const claimedCount = challenges.filter((c) => c.claimed).length;

  return {
    challenges,
    loading,
    updateProgress,
    claimReward,
    daysRemaining,
    completedCount,
    claimedCount,
    totalChallenges: WEEKLY_CHALLENGES.length,
  };
};
