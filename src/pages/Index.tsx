import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { WordOfTheDay } from "@/components/WordOfTheDay";
import { LeaderboardRankTracker } from "@/components/LeaderboardRankTracker";
import { LessonTopicSelector } from "@/components/LessonTopicSelector";
import { ShortStories } from "@/components/ShortStories";
import { useUserProgress } from "@/hooks/useUserProgress";
import { lessons } from "@/data/lessons";
import { Card, CardContent } from "@/components/ui/card";
import { ProfilePicture, ProfilePictureSelector } from "@/components/ProfilePictureSelector";
import { Crown, Trophy, Flame } from "lucide-react";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const { progress } = useUserProgress();
  const navigate = useNavigate();
  
  // Check if it's the user's first visit
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  
  useEffect(() => {
    if (user) {
      const visitKey = `shpoko_first_visit_${user.id}`;
      const hasVisited = localStorage.getItem(visitKey);
      if (!hasVisited) {
        setIsFirstVisit(true);
        localStorage.setItem(visitKey, "true");
      }
    }
  }, [user]);
  
  // Calculate daily goal progress based on completed lessons
  const totalLessons = lessons.length;
  const completedLessons = Object.values(progress).filter(p => p.completed).length;
  const dailyGoalProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        streak={profile?.streak || 0}
        hearts={5}
        xp={profile?.xp || 0}
        dailyGoalProgress={dailyGoalProgress}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Profile Card and Leaderboard */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Profile Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <ProfilePictureSelector
                  trigger={
                    <div className="cursor-pointer hover:opacity-80 transition-opacity">
                      <ProfilePicture pictureId={profile?.profile_picture} size="lg" />
                    </div>
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{profile?.username}</h3>
                    {profile?.is_premium && <Crown className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground">Level {profile?.level || 1}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="font-medium">{profile?.xp || 0} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-warning" />
                      <span className="font-medium">{profile?.streak || 0} day streak</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Leaderboard Tracker */}
          <LeaderboardRankTracker />
        </div>

        {/* Show hero only on first visit, otherwise Word of the Day */}
        {isFirstVisit ? (
          <div className="mb-6">
            <HeroSection />
          </div>
        ) : (
          <div className="mb-6">
            <WordOfTheDay />
          </div>
        )}

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lessons selector - takes 2 columns */}
          <div className="lg:col-span-2">
            <LessonTopicSelector />
          </div>

          {/* Short Stories sidebar */}
          <div>
            <ShortStories />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
