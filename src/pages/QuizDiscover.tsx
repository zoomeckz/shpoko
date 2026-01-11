import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
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
  Play, 
  Star, 
  Search, 
  Trophy, 
  Clock, 
  Users, 
  TrendingUp,
  Sparkles,
  Filter,
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playClick } = useDuolingoSounds();

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
      const { data: publicQuizzes, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const quizIds = (publicQuizzes || []).map(q => q.id);
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("quiz_id")
        .in("quiz_id", quizIds);

      const questionCounts = new Map<string, number>();
      (questions || []).forEach(q => {
        questionCounts.set(q.quiz_id, (questionCounts.get(q.quiz_id) || 0) + 1);
      });

      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("quiz_id")
        .in("quiz_id", quizIds);

      const playCounts = new Map<string, number>();
      (attempts || []).forEach(a => {
        playCounts.set(a.quiz_id, (playCounts.get(a.quiz_id) || 0) + 1);
      });

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

      const creatorIds = [...new Set((publicQuizzes || []).map(q => q.creator_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, profile_picture")
        .in("id", creatorIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

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
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: feedback } = await supabase
        .from("quiz_feedback")
        .select("quiz_id, rating")
        .gte("created_at", weekStart.toISOString());

      const quizRatings = new Map<string, { sum: number; count: number }>();
      (feedback || []).forEach(f => {
        if (f.rating) {
          const existing = quizRatings.get(f.quiz_id) || { sum: 0, count: 0 };
          quizRatings.set(f.quiz_id, { sum: existing.sum + f.rating, count: existing.count + 1 });
        }
      });

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
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("id, creator_id")
        .eq("is_public", true);

      if (!quizzesData || quizzesData.length === 0) return;

      const creatorStats = new Map<string, { quiz_count: number; quiz_ids: string[] }>();
      quizzesData.forEach(q => {
        const stats = creatorStats.get(q.creator_id) || { quiz_count: 0, quiz_ids: [] };
        stats.quiz_count++;
        stats.quiz_ids.push(q.id);
        creatorStats.set(q.creator_id, stats);
      });

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
          return (b.rating_count * 2 + b.play_count) - (a.rating_count * 2 + a.play_count);
      }
    });

  const getCategoryInfo = (cat: string | null) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[1];
  const getLanguageInfo = (lang: string) => LANGUAGES.find(l => l.value === lang) || LANGUAGES[0];

  return (
    <AppLayout backLabel="Back to Home" maxWidth="6xl">
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
        
        <motion.div
          className="absolute top-4 right-8 text-6xl opacity-20"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🎯
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
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="top">Top This Week</TabsTrigger>
          <TabsTrigger value="creators">Top Creators</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No quizzes found matching your criteria.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePlayQuiz(quiz.id)}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-2">{quiz.title}</h3>
                        {quiz.is_timed && (
                          <Badge variant="secondary" className="shrink-0">
                            <Clock className="w-3 h-3 mr-1" />
                            Timed
                          </Badge>
                        )}
                      </div>

                      {quiz.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {quiz.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">
                          {getCategoryInfo(quiz.category).icon} {getCategoryInfo(quiz.category).label}
                        </Badge>
                        <Badge variant="outline">
                          {getLanguageInfo(quiz.language).flag}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <ProfilePicture pictureId={quiz.creator_picture} size="xs" />
                          <span className="text-muted-foreground">{quiz.creator_username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {quiz.avg_rating > 0 && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span>{quiz.avg_rating.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{quiz.play_count}</span>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Play Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          {topQuizzes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No top quizzes yet this week.</p>
                <p className="text-sm">Quizzes need at least 2 ratings to appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {topQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePlayQuiz(quiz.id)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="text-3xl font-bold text-primary">#{index + 1}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">by {quiz.creator_username}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-semibold">{quiz.avg_rating.toFixed(1)}</span>
                      </div>
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="creators" className="space-y-4">
          {topCreators.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No top creators yet.</p>
                <p className="text-sm">Creators need at least 2 public quizzes to appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topCreators.map((creator, index) => (
                <motion.div
                  key={creator.user_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4 text-center space-y-3">
                      <ProfilePicture pictureId={creator.profile_picture} size="lg" />
                      <div>
                        <h3 className="font-semibold">{creator.username}</h3>
                        <p className="text-sm text-muted-foreground">{creator.quiz_count} quizzes</p>
                      </div>
                      {creator.avg_rating > 0 && (
                        <div className="flex items-center justify-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{creator.avg_rating.toFixed(1)} avg rating</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default QuizDiscover;
