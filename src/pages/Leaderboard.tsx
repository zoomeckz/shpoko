import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, ArrowLeft } from "lucide-react";
import { ProfilePicture } from "@/components/ProfilePictureSelector";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  level: number;
  is_premium: boolean;
  profile_picture: string | null;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time updates on profiles table
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          // Refetch leaderboard when any profile changes
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase.rpc("get_leaderboard", {
      limit_count: 50,
    });

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Medal className="w-8 h-8 text-amber-600" />;
    return <span className="w-8 h-8 flex items-center justify-center text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const userRank = entries.findIndex((e) => e.id === profile?.id) + 1;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        streak={profile?.streak || 0}
        hearts={5}
        xp={profile?.xp || 0}
        dailyGoalProgress={0}
      />

      <main className="max-w-4xl mx-auto p-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>

        {profile && userRank > 0 && (
          <Card className="mb-6 bg-primary/10 border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-primary">#{userRank}</span>
                  <ProfilePicture pictureId={profile.profile_picture} size="md" />
                  <div>
                    <p className="font-semibold">{profile.username} (You)</p>
                    <p className="text-sm text-muted-foreground">Level {profile.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile.is_premium && <Crown className="w-5 h-5 text-yellow-500" />}
                  <span className="text-xl font-bold text-primary">{profile.xp} XP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Top Learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No learners yet. Be the first!
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-all",
                      entry.id === profile?.id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-accent/50 hover:bg-accent border border-transparent"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {getRankIcon(index + 1)}
                    </div>
                    <ProfilePicture pictureId={entry.profile_picture} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-lg truncate">{entry.username}</p>
                        {entry.is_premium && (
                          <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        )}
                        {entry.id === profile?.id && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Level {entry.level}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary">{entry.xp}</span>
                      <span className="text-sm text-muted-foreground ml-1">XP</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;
