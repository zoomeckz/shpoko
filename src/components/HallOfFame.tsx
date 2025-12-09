import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Crown, Medal } from "lucide-react";
import { ProfilePicture } from "@/components/ProfilePictureSelector";
import { cn } from "@/lib/utils";

interface HallOfFameEntry {
  id: string;
  user_id: string;
  month_year: string;
  place: number;
  xp_at_win: number;
  stars: number;
  username?: string;
  profile_picture?: string | null;
}

export const HallOfFame = () => {
  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHallOfFame();
  }, []);

  const fetchHallOfFame = async () => {
    // Fetch hall of fame entries with profile info
    const { data, error } = await supabase
      .from("hall_of_fame")
      .select("*")
      .order("month_year", { ascending: false })
      .order("place", { ascending: true })
      .limit(15);

    if (!error && data) {
      // Fetch profile data for each entry
      const userIds = [...new Set(data.map(e => e.user_id))];
      const { data: profiles } = await supabase
        .rpc("get_leaderboard", { limit_count: 100 });

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const entriesWithProfiles = data.map(entry => ({
        ...entry,
        username: profileMap.get(entry.user_id)?.username || "Unknown",
        profile_picture: profileMap.get(entry.user_id)?.profile_picture,
      }));

      setEntries(entriesWithProfiles);
    }
    setLoading(false);
  };

  const getPlaceIcon = (place: number) => {
    if (place === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (place === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (place === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Group entries by month
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.month_year]) {
      acc[entry.month_year] = [];
    }
    acc[entry.month_year].push(entry);
    return acc;
  }, {} as Record<string, HallOfFameEntry[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse flex justify-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Hall of Fame
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No champions yet! Be the first to claim the top spot at the end of the month.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          Hall of Fame
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
          <div key={monthYear}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {formatMonthYear(monthYear)}
            </h3>
            <div className="space-y-2">
              {monthEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    entry.place === 1 && "bg-yellow-500/20 border border-yellow-500/30",
                    entry.place === 2 && "bg-gray-400/10 border border-gray-400/20",
                    entry.place === 3 && "bg-amber-600/10 border border-amber-600/20"
                  )}
                >
                  {getPlaceIcon(entry.place)}
                  <ProfilePicture pictureId={entry.profile_picture} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium">{entry.username}</p>
                    <p className="text-xs text-muted-foreground">{entry.xp_at_win} XP</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(entry.stars, 5) }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-500 fill-yellow-500"
                      />
                    ))}
                    {entry.stars > 5 && (
                      <span className="text-xs text-yellow-500 font-bold">+{entry.stars - 5}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
