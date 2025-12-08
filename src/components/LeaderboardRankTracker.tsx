import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Crown, ArrowRight } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  level: number;
  is_premium: boolean;
}

export const LeaderboardRankTracker = () => {
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.id) {
      fetchUserRank();
    }
  }, [profile?.id, profile?.xp]);

  const fetchUserRank = async () => {
    const { data, error } = await supabase.rpc("get_leaderboard", {
      limit_count: 100,
    });

    if (!error && data) {
      const entries = data as LeaderboardEntry[];
      setTotalUsers(entries.length);
      const rank = entries.findIndex((e) => e.id === profile?.id) + 1;
      setUserRank(rank > 0 ? rank : null);
    }
    setLoading(false);
  };

  if (loading || !profile) {
    return null;
  }

  const getRankDisplay = () => {
    if (!userRank) return "Not ranked";
    if (userRank === 1) return "🥇 1st Place";
    if (userRank === 2) return "🥈 2nd Place";
    if (userRank === 3) return "🥉 3rd Place";
    return `#${userRank}`;
  };

  const getRankColor = () => {
    if (!userRank) return "text-muted-foreground";
    if (userRank === 1) return "text-yellow-500";
    if (userRank === 2) return "text-gray-400";
    if (userRank === 3) return "text-amber-600";
    return "text-primary";
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-soft transition-all duration-200 border-2 hover:border-primary bg-gradient-to-r from-primary/5 to-primary/10"
      onClick={() => navigate("/leaderboard")}
    >
      <CardContent className="p-2">
        <div className="flex flex-col items-center justify-center text-center gap-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Your Leaderboard Rank</p>
            <div className="flex items-center justify-center gap-1">
              <span className={`text-xl font-bold ${getRankColor()}`}>
                {getRankDisplay()}
              </span>
              {profile.is_premium && (
                <Crown className="w-3 h-3 text-yellow-500" />
              )}
            </div>
            {totalUsers > 0 && userRank && (
              <p className="text-xs text-muted-foreground">
                out of {totalUsers} learners
              </p>
            )}
          </div>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};
