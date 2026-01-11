import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfilePicture } from "@/components/ProfilePictureSelector";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  Star, 
  Search, 
  Trophy, 
  Clock, 
  Users, 
  TrendingUp,
  Sparkles,
  Filter,
  SortAsc,
  SortDesc,
  Heart,
  Flame,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";

const CATEGORIES = [
  { value: "all", label: "All Categories", icon: "📚" },
  { value: "general", label: "General", icon: "📖" },
  { value: "vocabulary", label: "Vocabulary", icon: "📝" },
  { value: "grammar", label: "Grammar", icon: "✏️" },
  { value: "verbs", label: "Verbs", icon: "🏃" },
  { value: "phrases", label: "Phrases", icon: "💬" },
  { value: "culture", label: "Culture", icon: "🎭" },
];

const LANGUAGES = [
  { value: "all", label: "All Languages", flag: "🌍" },
  { value: "english", label: "English", flag: "🇬🇧" },
  { value: "swedish", label: "Svenska", flag: "🇸🇪" },
  { value: "dutch", label: "Nederlands", flag: "🇳🇱" },
  { value: "tunisian", label: "تونسي", flag: "🇹🇳" },
  { value: "bulgarian", label: "Български", flag: "🇧🇬" },
  { value: "greek", label: "Ελληνικά", flag: "🇬🇷" },
  { value: "russian", label: "Русский", flag: "🇷🇺" },
  { value: "ukrainian", label: "Українська", flag: "🇺🇦" },
  { value: "italian", label: "Italiano", flag: "🇮🇹" },
  { value: "polish", label: "Polski", flag: "🇵🇱" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "rating", label: "Highest Rated", icon: Star },
  { value: "newest", label: "Newest", icon: Calendar },
  { value: "plays", label: "Most Played", icon: Users },
];

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  language: string;
  is_timed: boolean;
  time_limit_seconds: number | null;
  created_at: string;
  creator_id: string;
  creator_username?: string;
  creator_picture?: string;
  avg_rating: number;
  rating_count: number;
  play_count: number;
  question_count: number;
}

interface TopCreator {
  user_id: string;
  username: string;
  profile_picture: string | null;
  quiz_count: number;
  total_plays: number;
  avg_rating: number;
}

const QuizDiscover = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { playClick, playComplete } = useDuolingoSounds();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [topQuizzes, setTopQuizzes] = useState<Quiz[]>([]);
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuizzes();
      fetchTopQuizzes();
      fetchTopCreators();
    }
  }, [user]);

  const fetchQuizzes = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch all public quizzes
      const { data: publicQuizzes, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get question counts
      const quizIds = (publicQuizzes || []).map(q => q.id);
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("quiz_id")
        .in("quiz_id", quizIds);

      const questionCounts = new Map<string, number>();
      (questions || []).forEach(q => {
        questionCounts.set(q.quiz_id, (questionCounts.get(q.quiz_id) || 0) + 1);
      });

      // Get play counts
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("quiz_id")
        .in("quiz_id", quizIds);

      const playCounts = new Map<string, number>();
      (attempts || []).forEach(a => {
        playCounts.set(a.quiz_id, (playCounts.get(a.quiz_id) || 0) + 1);
      });

      // Get ratings
      const { data: ratings } = await supabase
        .from("quiz_feedback")
        .select("quiz_id, rating")
        .in("quiz_id", quizIds);

      const ratingMap = new Map<string, { sum: number; count: number }>();
      (ratings || []).forEach(r => {
        if (r.rating) {
          const existing = ratingMap.get(r.quiz_id) || { sum: 0, count: 0 };
          ratingMap.set(r.quiz_id, { sum: existing.sum + r.rating, count: existing.count + 1 });
        }
      });

      // Get creator profiles
      const creatorIds = [...new Set((publicQuizzes || []).map(q => q.creator_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, profile_picture")
        .in("id", creatorIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      // Combine all data
      const enrichedQuizzes: Quiz[] = (publicQuizzes || []).map(q => {
        const ratingData = ratingMap.get(q.id);
        const creatorProfile = profileMap.get(q.creator_id);
        return {
          ...q,
          creator_username: creatorProfile?.username || "Unknown",
          creator_picture: creatorProfile?.profile_picture || null,
          avg_rating: ratingData ? ratingData.sum / ratingData.count : 0,
          rating_count: ratingData?.count || 0,
          play_count: playCounts.get(q.id) || 0,
          question_count: questionCounts.get(q.id) || 0,
        };
      });

      setQuizzes(enrichedQuizzes);
    } catch (error: any) {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopQuizzes = async () => {
    try {
      // Get this week's top rated quizzes
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: feedback } = await supabase
        .from("quiz_feedback")
        .select("quiz_id, rating")
        .gte("created_at", weekStart.toISOString());

      // Calculate averages
      const quizRatings = new Map<string, { sum: number; count: number }>();
      (feedback || []).forEach(f => {
        if (f.rating) {
          const existing = quizRatings.get(f.quiz_id) || { sum: 0, count: 0 };
          quizRatings.set(f.quiz_id, { sum: existing.sum + f.rating, count: existing.count + 1 });
        }
      });

      // Get top 5 quiz IDs with at least 2 ratings
      const topQuizIds = Array.from(quizRatings.entries())
        .filter(([_, v]) => v.count >= 2)
        .sort((a, b) => (b[1].sum / b[1].count) - (a[1].sum / a[1].count))
        .slice(0, 5)
        .map(([id]) => id);

      if (topQuizIds.length > 0) {
        const { data: topQuizData } = await supabase
          .from("quizzes")
          .select("*")
          .in("id", topQuizIds)
          .eq("is_public", true);

        const creatorIds = [...new Set((topQuizData || []).map(q => q.creator_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, profile_picture")
          .in("id", creatorIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));

        const enrichedTop = (topQuizData || []).map(q => {
          const ratingData = quizRatings.get(q.id);
          const creatorProfile = profileMap.get(q.creator_id);
          return {
            ...q,
            creator_username: creatorProfile?.username || "Unknown",
            creator_picture: creatorProfile?.profile_picture || null,
            avg_rating: ratingData ? ratingData.sum / ratingData.count : 0,
            rating_count: ratingData?.count || 0,
            play_count: 0,
            question_count: 0,
          };
        }).sort((a, b) => b.avg_rating - a.avg_rating);

        setTopQuizzes(enrichedTop);
      }
    } catch (error) {
      console.error("Failed to fetch top quizzes:", error);
    }
  };

  const fetchTopCreators = async () => {
    try {
      // Get all public quizzes with their creators
      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("id, creator_id")
        .eq("is_public", true);

      if (!quizzes || quizzes.length === 0) return;

      // Count quizzes per creator
      const creatorStats = new Map<string, { quiz_count: number; quiz_ids: string[] }>();
      quizzes.forEach(q => {
        const stats = creatorStats.get(q.creator_id) || { quiz_count: 0, quiz_ids: [] };
        stats.quiz_count++;
        stats.quiz_ids.push(q.id);
        creatorStats.set(q.creator_id, stats);
      });

      // Get creators with at least 2 quizzes
      const topCreatorIds = Array.from(creatorStats.entries())
        .filter(([_, v]) => v.quiz_count >= 2)
        .sort((a, b) => b[1].quiz_count - a[1].quiz_count)
        .slice(0, 5)
        .map(([id]) => id);

      if (topCreatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, profile_picture")
          .in("id", topCreatorIds);

        // Get ratings for their quizzes
        const allQuizIds = topCreatorIds.flatMap(id => creatorStats.get(id)?.quiz_ids || []);
        const { data: ratings } = await supabase
          .from("quiz_feedback")
          .select("quiz_id, rating")
          .in("quiz_id", allQuizIds);

        const quizRatings = new Map<string, number[]>();
        (ratings || []).forEach(r => {
          if (r.rating) {
            const existing = quizRatings.get(r.quiz_id) || [];
            existing.push(r.rating);
            quizRatings.set(r.quiz_id, existing);
          }
        });

        const creators: TopCreator[] = topCreatorIds.map(id => {
          const profile = profiles?.find(p => p.id === id);
          const stats = creatorStats.get(id)!;
          
          // Calculate average rating across all quizzes
          const allRatings = stats.quiz_ids.flatMap(qid => quizRatings.get(qid) || []);
          const avgRating = allRatings.length > 0 
            ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length 
            : 0;

          return {
            user_id: id,
            username: profile?.username || "Unknown",
            profile_picture: profile?.profile_picture || null,
            quiz_count: stats.quiz_count,
            total_plays: 0,
            avg_rating: avgRating,
          };
        });

        setTopCreators(creators);
      }
    } catch (error) {
      console.error("Failed to fetch top creators:", error);
    }
  };

  const handlePlayQuiz = (quizId: string) => {
    playClick();
    navigate(`/quiz?play=${quizId}`);
  };

  // Filter and sort quizzes
  const filteredQuizzes = quizzes
    .filter(q => {
      const matchesSearch = searchQuery === "" || 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.creator_username?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || q.category === categoryFilter;
      const matchesLanguage = languageFilter === "all" || q.language === languageFilter;
      return matchesSearch && matchesCategory && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.avg_rating - a.avg_rating;
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "plays":
          return b.play_count - a.play_count;
        case "popular":
        default:
          // Combine rating and play count for popularity
          return (b.rating_count * 2 + b.play_count) - (a.rating_count * 2 + a.play_count);
      }
    });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        streak={profile?.streak || 0}
        hearts={5}
        xp={profile?.xp || 0}
        dailyGoalProgress={0}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10 p-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-primary" />
              Discover Quizzes
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Explore quizzes created by the community. Learn, play, and rate your favorites!
            </p>
          </motion.div>
          
          {/* Decorative elements */}
          <motion.div
            className="absolute top-4 right-8 text-6xl opacity-20"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🎯
          </motion.div>
          <motion.div
            className="absolute bottom-4 right-24 text-4xl opacity-20"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📚
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search quizzes, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(categoryFilter !== "all" || languageFilter !== "all") && (
                <Badge variant="secondary" className="ml-1">
                  {[categoryFilter !== "all", languageFilter !== "all"].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-3 flex-wrap p-4 bg-muted/50 rounded-lg">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.flag} {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(categoryFilter !== "all" || languageFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryFilter("all");
                        setLanguageFilter("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="browse">
              <Search className="w-4 h-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="trending">
              <Flame className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="creators">
              <Trophy className="w-4 h-4 mr-2" />
              Top Creators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p className="text-lg mb-2">No quizzes found</p>
                  <p className="text-sm">Try adjusting your filters or search query</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] group">
                      <CardContent className="p-5">
                        {/* Creator info */}
                        <div className="flex items-center gap-2 mb-3">
                          <ProfilePicture pictureId={quiz.creator_picture} size="xs" />
                          <span className="text-sm text-muted-foreground">
                            {quiz.creator_username}
                          </span>
                        </div>

                        {/* Quiz title and description */}
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {quiz.title}
                        </h3>
                        {quiz.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {quiz.description}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex gap-1 flex-wrap mb-3">
                          {quiz.category && quiz.category !== "general" && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {CATEGORIES.find(c => c.value === quiz.category)?.icon} {quiz.category}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {LANGUAGES.find(l => l.value === quiz.language)?.flag || "🌍"} {quiz.language}
                          </Badge>
                          {quiz.is_timed && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {quiz.time_limit_seconds}s
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          {quiz.rating_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                              {quiz.avg_rating.toFixed(1)}
                              <span className="text-xs">({quiz.rating_count})</span>
                            </span>
                          )}
                          {quiz.play_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {quiz.play_count}
                            </span>
                          )}
                          {quiz.question_count > 0 && (
                            <span className="text-xs">
                              {quiz.question_count} questions
                            </span>
                          )}
                        </div>

                        {/* Play button */}
                        <Button 
                          onClick={() => handlePlayQuiz(quiz.id)} 
                          className="w-full gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Play Quiz
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending">
            <div className="space-y-6">
              {/* Weekly Top Quiz */}
              <Card className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
                <CardContent className="py-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <div>
                      <h3 className="font-bold text-lg">🔥 This Week's Top Quizzes</h3>
                      <p className="text-sm text-muted-foreground">
                        Top creators earn 500 XP bonus!
                      </p>
                    </div>
                  </div>

                  {topQuizzes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No quizzes with enough ratings this week yet. Be the first!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topQuizzes.map((quiz, index) => (
                        <motion.div
                          key={quiz.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-4 p-4 rounded-lg ${
                            index === 0 
                              ? "bg-yellow-500/20 border border-yellow-500/30" 
                              : "bg-muted/50"
                          }`}
                        >
                          <div className={`text-3xl font-bold ${
                            index === 0 ? "text-yellow-500" : "text-muted-foreground"
                          }`}>
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{quiz.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              by {quiz.creator_username}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                            <span className="font-bold">{quiz.avg_rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({quiz.rating_count})
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handlePlayQuiz(quiz.id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="creators">
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span>
                      Create amazing quizzes to join the top creators!
                    </span>
                  </div>
                </CardContent>
              </Card>

              {topCreators.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No top creators yet. Create quizzes to be featured!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topCreators.map((creator, index) => (
                    <motion.div
                      key={creator.user_id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`${index === 0 ? "border-yellow-500/50" : ""}`}>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <ProfilePicture pictureId={creator.profile_picture} size="md" />
                              {index < 3 && (
                                <div className="absolute -top-1 -right-1 text-lg">
                                  {index === 0 && "🥇"}
                                  {index === 1 && "🥈"}
                                  {index === 2 && "🥉"}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg">{creator.username}</h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>{creator.quiz_count} quizzes</span>
                                {creator.avg_rating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                                    {creator.avg_rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default QuizDiscover;
