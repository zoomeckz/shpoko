import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeagueResetResult {
  promoted: boolean;
  demoted: boolean;
  stayed: boolean;
  previousLeague: string;
  newLeague: string;
  finalPosition: number;
  weeklyXP: number;
}

export const useLeagueReset = () => {
  const { user } = useAuth();
  const [resetResult, setResetResult] = useState<LeagueResetResult | null>(null);
  const [hasCheckedReset, setHasCheckedReset] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const getWeekStart = (date: Date = new Date()) => {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const getPreviousWeekStart = () => {
    const currentWeekStart = getWeekStart();
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setDate(previousWeek.getDate() - 7);
    return previousWeek;
  };

  const checkAndProcessWeeklyReset = useCallback(async () => {
    if (!user || hasCheckedReset) return null;

    try {
      const currentWeekStart = getWeekStart();
      const previousWeekStart = getPreviousWeekStart();

      // Check if user already has an entry for the current week
      const { data: currentWeekEntry } = await supabase
        .from("user_leagues")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", currentWeekStart.toISOString())
        .single();

      // If they already have a current week entry, no reset needed
      if (currentWeekEntry) {
        setHasCheckedReset(true);
        return null;
      }

      // Get their previous week entry
      const { data: previousWeekEntry } = await supabase
        .from("user_leagues")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", previousWeekStart.toISOString())
        .single();

      if (!previousWeekEntry) {
        // No previous week, just create new entry in Bronze
        const { data: leagues } = await supabase
          .from("leagues")
          .select("*")
          .eq("tier", 1)
          .single();

        if (leagues) {
          await supabase
            .from("user_leagues")
            .insert({
              user_id: user.id,
              league_id: leagues.id,
              week_xp: 0,
              week_start: currentWeekStart.toISOString(),
            });
        }
        setHasCheckedReset(true);
        return null;
      }

      // Get all leagues for tier navigation
      const { data: allLeagues } = await supabase
        .from("leagues")
        .select("*")
        .order("tier", { ascending: true });

      if (!allLeagues) {
        setHasCheckedReset(true);
        return null;
      }

      // Get all participants from previous week in same league
      const { data: previousParticipants } = await supabase
        .from("user_leagues")
        .select("*")
        .eq("league_id", previousWeekEntry.league_id)
        .eq("week_start", previousWeekStart.toISOString())
        .order("week_xp", { ascending: false });

      if (!previousParticipants) {
        setHasCheckedReset(true);
        return null;
      }

      // Find user's position
      const userPosition = previousParticipants.findIndex(p => p.user_id === user.id) + 1;
      const totalParticipants = previousParticipants.length;

      // Determine promotion/demotion
      const currentLeague = allLeagues.find(l => l.id === previousWeekEntry.league_id);
      const currentTier = currentLeague?.tier || 1;
      const maxTier = Math.max(...allLeagues.map(l => l.tier));

      let newTier = currentTier;
      let promoted = false;
      let demoted = false;

      // Promotion zone: Top 5 (or top 20% for small groups)
      const promotionThreshold = Math.max(5, Math.floor(totalParticipants * 0.2));
      // Demotion zone: Bottom 5 (or bottom 20% for small groups)
      const demotionThreshold = totalParticipants - Math.max(5, Math.floor(totalParticipants * 0.2));

      if (userPosition <= promotionThreshold && currentTier < maxTier) {
        newTier = currentTier + 1;
        promoted = true;
      } else if (userPosition > demotionThreshold && currentTier > 1) {
        newTier = currentTier - 1;
        demoted = true;
      }

      const newLeague = allLeagues.find(l => l.tier === newTier);
      
      if (!newLeague) {
        setHasCheckedReset(true);
        return null;
      }

      // Update previous week entry with final position and promotion/demotion status
      await supabase
        .from("user_leagues")
        .update({
          position: userPosition,
          promoted: promoted,
          demoted: demoted,
        })
        .eq("id", previousWeekEntry.id);

      // Create new week entry
      await supabase
        .from("user_leagues")
        .insert({
          user_id: user.id,
          league_id: newLeague.id,
          week_xp: 0,
          week_start: currentWeekStart.toISOString(),
        });

      const result: LeagueResetResult = {
        promoted,
        demoted,
        stayed: !promoted && !demoted,
        previousLeague: currentLeague?.name || "Bronze",
        newLeague: newLeague.name,
        finalPosition: userPosition,
        weeklyXP: previousWeekEntry.week_xp,
      };

      setResetResult(result);
      setHasCheckedReset(true);

      // Trigger celebration for promotion
      if (promoted) {
        setShowCelebration(true);
      }

      return result;
    } catch (error) {
      console.error("Error processing weekly reset:", error);
      setHasCheckedReset(true);
      return null;
    }
  }, [user, hasCheckedReset]);

  useEffect(() => {
    checkAndProcessWeeklyReset();
  }, [checkAndProcessWeeklyReset]);

  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const clearResetResult = useCallback(() => {
    setResetResult(null);
  }, []);

  return {
    resetResult,
    showCelebration,
    hasCheckedReset,
    dismissCelebration,
    clearResetResult,
    checkAndProcessWeeklyReset,
  };
};
