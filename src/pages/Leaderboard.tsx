import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, ArrowLeft, Flame, Star, Sparkles } from "lucide-react";
import { ProfilePicture } from "@/components/ProfilePictureSelector";
import { cn } from "@/lib/utils";

const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
import { PageTransition } from "@/components/PageTransition";

interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  level: number;
  is_premium: boolean;
  profile_picture: string | null;
  streak?: number;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchLeaderboard()
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
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-amber-600/5 border-amber-600/30";
    return "";
  };

  const userRank = entries.findIndex((e) => e.id === profile?.id) + 1;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header - Fixed position with proper spacing */}
        <div className="bg-card/95 backdrop-blur-sm border-b fixed top-0 left-0 right-0 z-50">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </motion.div>
              <div className="flex-1">
                <motion.h1 
                  className="text-xl font-bold font-nunito flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Leaderboard
                </motion.h1>
              </div>
            </div>
          </div>
        </div>

        {/* Add padding-top to account for fixed header */}
        <main className="max-w-2xl mx-auto p-4 pb-24 pt-20">
          {/* Top 3 Podium */}
          {!loading && entries.length >= 3 && (
            <motion.div 
              className="flex items-end justify-center gap-3 mb-8 mt-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* 2nd Place */}
              <motion.div 
                className="flex flex-col items-center"
                variants={staggerItem}
              >
                <ProfilePicture pictureId={entries[1]?.profile_picture} size="lg" />
                <div className="mt-2 text-center">
                  <p className="font-semibold text-sm truncate max-w-[80px]">{entries[1]?.username}</p>
                  <p className="text-xs text-muted-foreground">{entries[1]?.xp} XP</p>
                </div>
                <motion.div 
                  className="mt-2 w-16 h-16 bg-gray-400/20 rounded-t-lg flex items-center justify-center"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  style={{ originY: 1 }}
                >
                  <Medal className="w-8 h-8 text-gray-400" />
                </motion.div>
              </motion.div>
              
              {/* 1st Place */}
              <motion.div 
                className="flex flex-col items-center -mt-4"
                variants={staggerItem}
              >
                <div className="relative">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Crown className="w-8 h-8 text-yellow-500 absolute -top-8 left-1/2 -translate-x-1/2" />
                  </motion.div>
                  <ProfilePicture pictureId={entries[0]?.profile_picture} size="xl" />
                </div>
                <div className="mt-2 text-center">
                  <p className="font-bold truncate max-w-[100px]">{entries[0]?.username}</p>
                  <p className="text-sm text-primary font-semibold">{entries[0]?.xp} XP</p>
                </div>
                <motion.div 
                  className="mt-2 w-20 h-24 bg-yellow-500/20 rounded-t-lg flex items-center justify-center"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  style={{ originY: 1 }}
                >
                  <Trophy className="w-10 h-10 text-yellow-500" />
                </motion.div>
              </motion.div>
              
              {/* 3rd Place */}
              <motion.div 
                className="flex flex-col items-center"
                variants={staggerItem}
              >
                <ProfilePicture pictureId={entries[2]?.profile_picture} size="lg" />
                <div className="mt-2 text-center">
                  <p className="font-semibold text-sm truncate max-w-[80px]">{entries[2]?.username}</p>
                  <p className="text-xs text-muted-foreground">{entries[2]?.xp} XP</p>
                </div>
                <motion.div 
                  className="mt-2 w-16 h-12 bg-amber-600/20 rounded-t-lg flex items-center justify-center"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  style={{ originY: 1 }}
                >
                  <Medal className="w-6 h-6 text-amber-600" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Your rank card */}
          {profile && userRank > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="mb-6 p-4 bg-primary/5 border-primary/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    #{userRank}
                  </div>
                  <ProfilePicture pictureId={profile.profile_picture} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{profile.username}</p>
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">You</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> Lvl {profile.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" /> {profile.streak}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">{profile.xp}</span>
                    <span className="text-sm text-muted-foreground ml-1">XP</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Full leaderboard */}
          <motion.div 
            className="space-y-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No learners yet. Be the first!
              </div>
            ) : (
              entries.map((entry, index) => (
                <motion.div key={entry.id} variants={staggerItem}>
                  <Card
                    className={cn(
                      "p-3 flex items-center gap-3 transition-all hover:scale-[1.02]",
                      entry.id === profile?.id && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      getRankBg(index + 1)
                    )}
                  >
                    <div className="w-8 flex-shrink-0 flex justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                    <ProfilePicture pictureId={entry.profile_picture} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{entry.username}</p>
                        {entry.is_premium && (
                          <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-bold">{entry.xp}</span>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Leaderboard;
