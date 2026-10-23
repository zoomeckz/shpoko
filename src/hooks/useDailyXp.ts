import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { daysAgo, localDateKey } from "@/lib/dates";

export const DEFAULT_DAILY_GOAL = 20;

export const GOAL_OPTIONS = [
  { xp: 10, label: "Casual" },
  { xp: 20, label: "Regular" },
  { xp: 30, label: "Serious" },
  { xp: 50, label: "Intense" },
];

/**
 * XP earned on each of the last `days` days (oldest first, today last), plus
 * the daily goal. Reloads whenever the profile changes, i.e. after a lesson.
 */
export const useDailyXp = (days = 7) => {
  const { user, profile } = useAuth();
  const [byDay, setByDay] = useState<{ day: string; xp: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const keys = Array.from({ length: days }, (_, i) => localDateKey(daysAgo(days - 1 - i)));
    if (!user) {
      setByDay(keys.map((day) => ({ day, xp: 0 })));
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("daily_xp")
      .select("day, xp")
      .eq("user_id", user.id)
      .gte("day", keys[0])
      .then(({ data }) => {
        if (cancelled) return;
        const xp = new Map((data ?? []).map((r) => [r.day, r.xp]));
        setByDay(keys.map((day) => ({ day, xp: xp.get(day) ?? 0 })));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, profile?.xp, days]);

  const goal = profile?.daily_goal ?? DEFAULT_DAILY_GOAL;
  const today = byDay[byDay.length - 1]?.xp ?? 0;
  return { byDay, today, goal, loading };
};
