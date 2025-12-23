import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Globe, Lock, Clock, MessageSquare, Trash2, Edit, Trophy, Star } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "general", label: "General" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "grammar", label: "Grammar" },
  { value: "verbs", label: "Verbs" },
  { value: "phrases", label: "Phrases" },
  { value: "culture", label: "Culture" },
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

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  is_timed: boolean;
  time_limit_seconds: number | null;
  created_at: string;
  creator_id: string;
  category?: string;
  language?: string;
  avg_rating?: number;
  rating_count?: number;
}

interface LeaderboardEntry {
  quiz_id: string;
  quiz_title: string;
  creator_id: string;
  avg_rating: number;
  rating_count: number;
  creator_username?: string;
}

interface QuizListProps {
  onCreateNew: () => void;
  onPlayQuiz: (quizId: string) => void;
  onViewFeedback: (quizId: string) => void;
  onEditQuiz?: (quizId: string) => void;
}

export const QuizList = ({ onCreateNew, onPlayQuiz, onViewFeedback, onEditQuiz }: QuizListProps) => {
  const { user } = useAuth();
  const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);
  const [publicQuizzes, setPublicQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchQuizzes();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchQuizzes = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch user's own quizzes
      const { data: mine, error: mineError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (mineError) throw mineError;
      setMyQuizzes(mine || []);

      // Fetch public quizzes from others with average rating
      const { data: pub, error: pubError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("is_public", true)
        .neq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (pubError) throw pubError;
      
      // Fetch ratings for public quizzes
      const quizIds = (pub || []).map(q => q.id);
      if (quizIds.length > 0) {
        const { data: ratings } = await supabase
          .from("quiz_feedback")
          .select("quiz_id, rating")
          .in("quiz_id", quizIds);

        const ratingMap = new Map<string, { sum: number; count: number }>();
        (ratings || []).forEach(r => {
          const existing = ratingMap.get(r.quiz_id) || { sum: 0, count: 0 };
          ratingMap.set(r.quiz_id, { sum: existing.sum + (r.rating || 0), count: existing.count + 1 });
        });

        const publicWithRatings = (pub || []).map(q => ({
          ...q,
          avg_rating: ratingMap.has(q.id) ? ratingMap.get(q.id)!.sum / ratingMap.get(q.id)!.count : 0,
          rating_count: ratingMap.get(q.id)?.count || 0,
        }));
        
        setPublicQuizzes(publicWithRatings);
      } else {
        setPublicQuizzes(pub || []);
      }
    } catch (error: any) {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Get quizzes with ratings from this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: feedback, error } = await supabase
        .from("quiz_feedback")
        .select("quiz_id, rating, created_at")
        .gte("created_at", weekStart.toISOString());

      if (error) throw error;

      // Calculate average ratings per quiz
      const quizRatings = new Map<string, { sum: number; count: number }>();
      (feedback || []).forEach(f => {
        const existing = quizRatings.get(f.quiz_id) || { sum: 0, count: 0 };
        quizRatings.set(f.quiz_id, { sum: existing.sum + (f.rating || 0), count: existing.count + 1 });
      });

      // Get quiz details for top rated quizzes (minimum 3 ratings)
      const topQuizIds = Array.from(quizRatings.entries())
        .filter(([_, v]) => v.count >= 3)
        .sort((a, b) => (b[1].sum / b[1].count) - (a[1].sum / a[1].count))
        .slice(0, 10)
        .map(([id]) => id);

      if (topQuizIds.length > 0) {
        const { data: quizzes } = await supabase
          .from("quizzes")
          .select("id, title, creator_id")
          .in("id", topQuizIds)
          .eq("is_public", true);

        // Get creator usernames
        const creatorIds = [...new Set((quizzes || []).map(q => q.creator_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", creatorIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p.username]));

        const leaderboardData: LeaderboardEntry[] = (quizzes || []).map(q => {
          const rating = quizRatings.get(q.id)!;
          return {
            quiz_id: q.id,
            quiz_title: q.title,
            creator_id: q.creator_id,
            avg_rating: rating.sum / rating.count,
            rating_count: rating.count,
            creator_username: profileMap.get(q.creator_id) || "Unknown",
          };
        }).sort((a, b) => b.avg_rating - a.avg_rating);

        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);

      if (error) throw error;
      toast.success("Quiz deleted");
      fetchQuizzes();
    } catch (error: any) {
      toast.error("Failed to delete quiz");
    }
  };

  const togglePublic = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ is_public: !quiz.is_public })
        .eq("id", quiz.id);

      if (error) throw error;
      toast.success(quiz.is_public ? "Quiz is now private" : "Quiz is now public");
      fetchQuizzes();
    } catch (error: any) {
      toast.error("Failed to update quiz");
    }
  };

  const filteredPublicQuizzes = publicQuizzes.filter(q => {
    const matchesCategory = categoryFilter === "all" || (q as any).category === categoryFilter;
    const matchesLanguage = languageFilter === "all" || (q as any).language === languageFilter;
    return matchesCategory && matchesLanguage;
  });

  const QuizCard = ({ quiz, isOwner }: { quiz: Quiz; isOwner: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg">{quiz.title}</h3>
              <div className="flex gap-1 mt-1 flex-wrap">
                {(quiz as any).category && (quiz as any).category !== "general" && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {(quiz as any).category}
                  </Badge>
                )}
                {(quiz as any).language && (quiz as any).language !== "english" && (
                  <Badge variant="secondary" className="text-xs">
                    {LANGUAGES.find(l => l.value === (quiz as any).language)?.flag || "🌍"} {(quiz as any).language}
                  </Badge>
                )}
              </div>
            </div>
          <div className="flex gap-1">
            {quiz.is_public ? (
              <Badge variant="secondary" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
            {quiz.is_timed && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {quiz.time_limit_seconds}s
              </Badge>
            )}
          </div>
        </div>
        
        {quiz.description && (
          <p className="text-sm text-muted-foreground mb-2">{quiz.description}</p>
        )}

        {!isOwner && quiz.rating_count !== undefined && quiz.rating_count > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
            <span>{quiz.avg_rating?.toFixed(1)}</span>
            <span>({quiz.rating_count} reviews)</span>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => onPlayQuiz(quiz.id)}>
            <Play className="w-4 h-4 mr-1" />
            Play
          </Button>
          
          {isOwner && (
            <>
              {onEditQuiz && (
                <Button size="sm" variant="outline" onClick={() => onEditQuiz(quiz.id)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => togglePublic(quiz)}>
                {quiz.is_public ? <Lock className="w-4 h-4 mr-1" /> : <Globe className="w-4 h-4 mr-1" />}
                {quiz.is_public ? "Make Private" : "Make Public"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onViewFeedback(quiz.id)}>
                <MessageSquare className="w-4 h-4 mr-1" />
                Feedback
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteQuiz(quiz.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quizzes</h2>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      <Tabs defaultValue="my" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my">My Quizzes ({myQuizzes.length})</TabsTrigger>
          <TabsTrigger value="public">Community ({publicQuizzes.length})</TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4 mr-1" />
            Top Quizzes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my" className="space-y-3 mt-4">
          {myQuizzes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                You haven't created any quizzes yet.
              </CardContent>
            </Card>
          ) : (
            myQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} isOwner={true} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="public" className="space-y-3 mt-4">
          <div className="flex gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredPublicQuizzes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No community quizzes available{categoryFilter !== "all" ? " in this category" : ""}.
              </CardContent>
            </Card>
          ) : (
            filteredPublicQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} isOwner={false} />
            ))
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-3 mt-4">
          <Card className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>
                  Top rated quiz of the week gets <strong className="text-primary">500 XP</strong> for the creator!
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 3 ratings required. You can rate each quiz once per week.
              </p>
            </CardContent>
          </Card>

          {leaderboard.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No quizzes with enough ratings this week yet. Play and rate quizzes to build the leaderboard!
              </CardContent>
            </Card>
          ) : (
            leaderboard.map((entry, index) => (
              <Card key={entry.quiz_id} className={index === 0 ? "border-yellow-500/50 bg-yellow-500/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${index === 0 ? "text-yellow-500" : "text-muted-foreground"}`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{entry.quiz_title}</h3>
                      <p className="text-sm text-muted-foreground">by {entry.creator_username}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                      <span className="font-bold">{entry.avg_rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({entry.rating_count})</span>
                    </div>
                    <Button size="sm" onClick={() => onPlayQuiz(entry.quiz_id)}>
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
