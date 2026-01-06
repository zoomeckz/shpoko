import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProfilePicture, ProfilePictureSelector } from "@/components/ProfilePictureSelector";
import { ChangeUsernameDialog } from "@/components/ChangeUsernameDialog";
import { Achievements } from "@/components/Achievements";
import { 
  Flame, Trophy, Zap, Crown, Calendar, Target, BookOpen, 
  Settings, LogOut, Edit, Award, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { calculateLevelProgress, getXPForNextLevel } from "@/lib/levelUtils";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalQuizzes: 0,
    perfectLessons: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      // Get lesson progress
      const { data: lessonData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      // Get quiz attempts
      const { data: quizData } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id);

      const perfectLessons = lessonData?.filter(l => l.score === 100).length || 0;

      setStats({
        totalLessons: lessonData?.length || 0,
        totalQuizzes: quizData?.length || 0,
        perfectLessons,
      });
    };

    fetchStats();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const levelProgress = calculateLevelProgress(profile.xp, profile.level);
  const xpForNext = getXPForNextLevel(profile.level);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 pb-20 lg:pb-8 px-4">
          <div className="max-w-2xl mx-auto py-8">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl border-2 border-border overflow-hidden mb-6"
            >
              {/* Banner */}
              <div className="h-24 bg-gradient-to-r from-primary to-primary-light" />
              
              <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="flex items-end gap-4 -mt-12 mb-4">
                  <ProfilePictureSelector
                    trigger={
                      <div className="relative cursor-pointer group">
                        <div className="w-24 h-24 rounded-full border-4 border-card bg-accent flex items-center justify-center text-5xl shadow-lg">
                          <ProfilePicture pictureId={profile.profile_picture} size="lg" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Edit className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    }
                  />
                  
                  <div className="flex-1 pt-12">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{profile.username}</h1>
                      {profile.is_premium && (
                        <Crown className="w-5 h-5 text-warning" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Level {profile.level} Learner
                    </p>
                  </div>
                  
                  <ChangeUsernameDialog />
                </div>

                {/* Level Progress */}
                <div className="bg-accent rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Level {profile.level}</span>
                    <span className="text-sm text-muted-foreground">
                      {profile.xp} / {xpForNext} XP
                    </span>
                  </div>
                  <Progress value={levelProgress} className="h-3" />
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
              <Card className="border-2">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mb-2">
                    <Flame className="w-6 h-6 text-warning" />
                  </div>
                  <span className="text-2xl font-bold">{profile.streak}</span>
                  <span className="text-xs text-muted-foreground">Day Streak</span>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-2xl font-bold">{profile.xp}</span>
                  <span className="text-xs text-muted-foreground">Total XP</span>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-2">
                    <Target className="w-6 h-6 text-success" />
                  </div>
                  <span className="text-2xl font-bold">{stats.totalLessons}</span>
                  <span className="text-xs text-muted-foreground">Lessons</span>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center mb-2">
                    <Award className="w-6 h-6 text-error" />
                  </div>
                  <span className="text-2xl font-bold">{stats.perfectLessons}</span>
                  <span className="text-xs text-muted-foreground">Perfect</span>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Achievements compact showUnlockPopup={false} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {!profile.is_premium && (
                <Button
                  onClick={() => navigate("/premium")}
                  className="w-full bg-gradient-to-r from-warning to-yellow-500 hover:from-warning/90 hover:to-yellow-500/90 text-black font-bold py-6"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Super SHPOKO
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full py-6"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
