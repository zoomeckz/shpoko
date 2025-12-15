import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { WordOfTheDay } from "@/components/WordOfTheDay";
import { LeaderboardRankTracker } from "@/components/LeaderboardRankTracker";
import { LessonTopicSelector } from "@/components/LessonTopicSelector";
import { ShortStories } from "@/components/ShortStories";
import { DailyGames } from "@/components/DailyGames";
import { useUserProgress } from "@/hooks/useUserProgress";
import { lessons } from "@/data/lessons";
import { Card, CardContent } from "@/components/ui/card";
import { ProfilePicture, ProfilePictureSelector } from "@/components/ProfilePictureSelector";
import { Crown, Trophy, Flame, Calendar, BookOpen, Gamepad2, BookText, Brain, Headphones, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryType = "daily" | "lessons" | "games" | "stories";

const categories = [
  { id: "daily" as CategoryType, label: "Daily", icon: Calendar, description: "Daily activities" },
  { id: "lessons" as CategoryType, label: "Lessons", icon: BookOpen, description: "Learn Bulgarian" },
  { id: "games" as CategoryType, label: "Games", icon: Gamepad2, description: "Fun challenges" },
  { id: "stories" as CategoryType, label: "Stories", icon: BookText, description: "Read & learn" },
];

const Index = () => {
  const { user, profile, loading } = useAuth();
  const { languageMode } = useLanguageMode();
  const { progress } = useUserProgress();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize category from navigation state if coming back from a game
  const initialCategory = (location.state?.selectedCategory as CategoryType) || "daily";
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(initialCategory);
  
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

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case "daily":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DailyGames />
          </div>
        );
      case "lessons":
        if (languageMode === "spanish") {
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/spanish/alphabet">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-primary/50 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">🔤</div>
                    <h3 className="font-bold text-lg">Испанска азбука</h3>
                    <p className="text-sm text-muted-foreground">Научи буквите</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/spanish/greetings">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-primary/50 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">👋</div>
                    <h3 className="font-bold text-lg">Поздрави</h3>
                    <p className="text-sm text-muted-foreground">Основни поздрави</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/spanish/numbers">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-primary/50 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">🔢</div>
                    <h3 className="font-bold text-lg">Числа 1-20</h3>
                    <p className="text-sm text-muted-foreground">Научи числата</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          );
        }
        return <LessonTopicSelector />;
      case "games":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link to="/contexto" state={{ returnCategory: "games" }}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-400 bg-gradient-to-br from-purple-500/10 to-purple-400/5 h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="font-bold text-sm">Contexto</h3>
                  <p className="text-xs text-muted-foreground">Guess the word</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/game/rapid-fire" state={{ returnCategory: "games" }}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-yellow-400 bg-gradient-to-br from-yellow-500/10 to-yellow-400/5 h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <Gamepad2 className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="font-bold text-sm">Rapid Fire</h3>
                  <p className="text-xs text-muted-foreground">7s rounds</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/game/conjugation" state={{ returnCategory: "games" }}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-400 bg-gradient-to-br from-green-500/10 to-green-400/5 h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <BookOpen className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="font-bold text-sm">Conjugation</h3>
                  <p className="text-xs text-muted-foreground">Verb forms</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/game/cloze-combat" state={{ returnCategory: "games" }}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-red-400 bg-gradient-to-br from-red-500/10 to-red-400/5 h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <Brain className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-bold text-sm">Cloze Combat</h3>
                  <p className="text-xs text-muted-foreground">Find wrong word</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/game/fix-bulgarian" state={{ returnCategory: "games" }}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-400 bg-gradient-to-br from-blue-500/10 to-blue-400/5 h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <BookText className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-sm">Fix My Bulgarian</h3>
                  <p className="text-xs text-muted-foreground">Proofread</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/game/listening-fill" state={{ returnCategory: "games" }}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-pink-400 bg-gradient-to-br from-pink-500/10 to-pink-400/5 h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-pink-500/20 rounded-full">
                    <Headphones className="w-6 h-6 text-pink-500" />
                  </div>
                  <h3 className="font-bold text-sm">Listening Fill</h3>
                  <p className="text-xs text-muted-foreground">Audio blanks</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/game/dialogue-battle" state={{ returnCategory: "games" }}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-cyan-400 bg-gradient-to-br from-cyan-500/10 to-cyan-400/5 h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-cyan-500/20 rounded-full">
                    <MessageCircle className="w-6 h-6 text-cyan-500" />
                  </div>
                  <h3 className="font-bold text-sm">Dialogue Battle</h3>
                  <p className="text-xs text-muted-foreground">Real conversations</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        );
      case "stories":
        return <ShortStories />;
      default:
        return null;
    }
  };

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
                      <ProfilePicture pictureId={profile?.profile_picture} size="xl" />
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

        {/* Category Navigation */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200",
                  "border-2",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                    : "bg-card hover:bg-accent border-border hover:border-primary/50"
                )}
              >
                <Icon className={cn("w-6 h-6", isSelected ? "text-primary-foreground" : "text-primary")} />
                <span className={cn("text-sm font-medium", isSelected ? "text-primary-foreground" : "text-foreground")}>
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Content */}
        <div className="animate-fade-in min-h-[400px]">
          {renderCategoryContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
