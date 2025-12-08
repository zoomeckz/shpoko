import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, ArrowLeft } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  level: number;
  is_premium: boolean;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
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
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
  };

  const userRank = entries.findIndex((e) => e.id === profile?.id) + 1;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        streak={profile?.streak || 0}
        hearts={5}
        xp={profile?.xp || 0}
        dailyGoalProgress={65}
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
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      entry.id === profile?.id
                        ? "bg-primary/10 border border-primary"
                        : "bg-accent/50 hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {getRankIcon(index + 1)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{entry.username}</p>
                          {entry.is_premium && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                          {entry.id === profile?.id && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Level {entry.level}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold">{entry.xp} XP</span>
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
