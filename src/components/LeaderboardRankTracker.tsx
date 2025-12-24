import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { getTranslations } from "@/lib/translations";
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
  const { uiLanguage } = useLanguageMode();
  const t = getTranslations(uiLanguage);
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
    if (!userRank) return t.notRanked;
    
    const rankTexts: Record<string, { first: string; second: string; third: string }> = {
      english: { first: "🥇 1st Place", second: "🥈 2nd Place", third: "🥉 3rd Place" },
      swedish: { first: "🥇 1:a plats", second: "🥈 2:a plats", third: "🥉 3:e plats" },
      bulgarian: { first: "🥇 1-во място", second: "🥈 2-ро място", third: "🥉 3-то място" },
      tunisian: { first: "🥇 المرتبة الأولى", second: "🥈 المرتبة الثانية", third: "🥉 المرتبة الثالثة" },
      dutch: { first: "🥇 1e plaats", second: "🥈 2e plaats", third: "🥉 3e plaats" },
      greek: { first: "🥇 1η θέση", second: "🥈 2η θέση", third: "🥉 3η θέση" },
      russian: { first: "🥇 1-е место", second: "🥈 2-е место", third: "🥉 3-е место" },
      ukrainian: { first: "🥇 1-е місце", second: "🥈 2-е місце", third: "🥉 3-є місце" },
      italian: { first: "🥇 1° posto", second: "🥈 2° posto", third: "🥉 3° posto" },
      polish: { first: "🥇 1. miejsce", second: "🥈 2. miejsce", third: "🥉 3. miejsce" },
    };
    
    const texts = rankTexts[uiLanguage] || rankTexts.english;
    
    if (userRank === 1) return texts.first;
    if (userRank === 2) return texts.second;
    if (userRank === 3) return texts.third;
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
      className="cursor-pointer hover:shadow-soft transition-all duration-200 border-2 hover:border-primary bg-gradient-to-r from-yellow-500/5 to-yellow-500/10 h-full"
      onClick={() => navigate("/leaderboard")}
    >
      <CardContent className="p-4 h-full flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.leaderboardRank}</p>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getRankColor()}`}>
                  {getRankDisplay()}
                </span>
                {profile.is_premium && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              {totalUsers > 0 && userRank && (
                <p className="text-xs text-muted-foreground">
                  {t.outOfLearners.replace('{count}', totalUsers.toString())}
                </p>
              )}
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};
