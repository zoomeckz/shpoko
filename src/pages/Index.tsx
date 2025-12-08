import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LessonCard } from "@/components/LessonCard";
import { WordOfTheDay } from "@/components/WordOfTheDay";
import { LeaderboardRankTracker } from "@/components/LeaderboardRankTracker";
import { useUserProgress } from "@/hooks/useUserProgress";
import { lessons } from "@/data/lessons";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const { isLessonCompleted, getLessonProgress } = useUserProgress();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleLessonClick = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson?.route) {
      navigate(lesson.route);
    }
  };

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
        dailyGoalProgress={65}
      />
      
      <main>
        <HeroSection />
        
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <LeaderboardRankTracker />
          </div>
        </section>
        
        <WordOfTheDay />
        
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Your Learning Path</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Progress through carefully crafted lessons designed to build your Bulgarian skills step by step.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => {
                const completed = isLessonCompleted(lesson.id);
                const progress = getLessonProgress(lesson.id);
                const status = completed ? "completed" : lesson.status;
                
                return (
                  <LessonCard
                    key={lesson.id}
                    title={lesson.title}
                    description={lesson.description}
                    level={lesson.level}
                    xpReward={lesson.xpReward}
                    progress={progress}
                    status={status}
                    difficulty={lesson.difficulty}
                    isPremium={lesson.isPremium}
                    onClick={() => handleLessonClick(lesson.id)}
                  />
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
