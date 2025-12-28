import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface League {
  id: string;
  name: string;
  tier: number;
  icon: string;
  color: string;
  min_xp_to_promote: number;
}

interface LeagueParticipant {
  id: string;
  user_id: string;
  league_id: string;
  week_xp: number;
  position: number | null;
  promoted: boolean | null;
  demoted: boolean | null;
  username?: string;
  profile_picture?: string;
}

export const useLeague = () => {
  const { user, profile } = useAuth();
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [participants, setParticipants] = useState<LeagueParticipant[]>([]);
  const [userParticipation, setUserParticipation] = useState<LeagueParticipant | null>(null);
  const [loading, setLoading] = useState(true);

  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const fetchLeagues = useCallback(async () => {
    const { data, error } = await supabase
      .from("leagues")
      .select("*")
      .order("tier", { ascending: true });

    if (!error && data) {
      setLeagues(data);
    }
    return data || [];
  }, []);

  const fetchUserLeague = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const allLeagues = await fetchLeagues();
      const weekStart = getWeekStart();

      // Check if user has a league entry for this week
      const { data: participation, error: partError } = await supabase
        .from("user_leagues")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", weekStart.toISOString())
        .single();

      if (partError && partError.code !== "PGRST116") {
        console.error("Error fetching user league:", partError);
      }

      if (!participation) {
        // Assign to Bronze league (tier 1) by default
        const bronzeLeague = allLeagues.find(l => l.tier === 1);
        if (bronzeLeague) {
          const { data: newPart, error: insertError } = await supabase
            .from("user_leagues")
            .insert({
              user_id: user.id,
              league_id: bronzeLeague.id,
              week_xp: 0,
              week_start: weekStart.toISOString(),
            })
            .select()
            .single();

          if (!insertError && newPart) {
            setUserParticipation(newPart);
            setCurrentLeague(bronzeLeague);
          }
        }
      } else {
        setUserParticipation(participation);
        const league = allLeagues.find(l => l.id === participation.league_id);
        setCurrentLeague(league || null);

        // Fetch other participants in the same league for this week
        const { data: leagueParticipants } = await supabase
          .from("user_leagues")
          .select("*")
          .eq("league_id", participation.league_id)
          .eq("week_start", weekStart.toISOString())
          .order("week_xp", { ascending: false })
          .limit(30);

        if (leagueParticipants) {
          // Fetch usernames for participants
          const userIds = leagueParticipants.map(p => p.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username, profile_picture")
            .in("id", userIds);

          const participantsWithNames = leagueParticipants.map((p, index) => ({
            ...p,
            position: index + 1,
            username: profiles?.find(pr => pr.id === p.user_id)?.username || "Unknown",
            profile_picture: profiles?.find(pr => pr.id === p.user_id)?.profile_picture || null,
          }));

          setParticipants(participantsWithNames);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserLeague:", error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchLeagues]);

  useEffect(() => {
    fetchUserLeague();
  }, [fetchUserLeague]);

  const addWeeklyXP = useCallback(async (amount: number) => {
    if (!user || !userParticipation) return;

    const newXP = (userParticipation.week_xp || 0) + amount;

    const { error } = await supabase
      .from("user_leagues")
      .update({ week_xp: newXP })
      .eq("id", userParticipation.id);

    if (!error) {
      setUserParticipation(prev => prev ? { ...prev, week_xp: newXP } : null);
    }
  }, [user, userParticipation]);

  const getUserPosition = () => {
    if (!userParticipation) return null;
    const position = participants.findIndex(p => p.user_id === user?.id);
    return position >= 0 ? position + 1 : null;
  };

  return {
    currentLeague,
    leagues,
    participants,
    userParticipation,
    loading,
    addWeeklyXP,
    getUserPosition,
    refetch: fetchUserLeague,
  };
};
