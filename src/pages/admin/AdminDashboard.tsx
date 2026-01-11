import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, MessageSquare, Trophy, TrendingUp, Activity, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  activeToday: number;
  totalQuizzes: number;
  totalForumThreads: number;
  totalVocabulary: number;
  totalLeagues: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    premiumUsers: 0,
    activeToday: 0,
    totalQuizzes: 0,
    totalForumThreads: 0,
    totalVocabulary: 0,
    totalLeagues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          usersRes,
          premiumRes,
          activeTodayRes,
          quizzesRes,
          threadsRes,
          vocabRes,
          leaguesRes,
        ] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true),
          supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_activity_date", new Date().toISOString().split('T')[0]),
          supabase.from("quizzes").select("id", { count: "exact", head: true }),
          supabase.from("forum_threads").select("id", { count: "exact", head: true }),
          supabase.from("user_vocabulary").select("id", { count: "exact", head: true }),
          supabase.from("leagues").select("id", { count: "exact", head: true }),
        ]);

        setStats({
          totalUsers: usersRes.count || 0,
          premiumUsers: premiumRes.count || 0,
          activeToday: activeTodayRes.count || 0,
          totalQuizzes: quizzesRes.count || 0,
          totalForumThreads: threadsRes.count || 0,
          totalVocabulary: vocabRes.count || 0,
          totalLeagues: leaguesRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "Premium Users", value: stats.premiumUsers, icon: Crown, color: "text-yellow-500" },
    { title: "Active Today", value: stats.activeToday, icon: Activity, color: "text-green-500" },
    { title: "Total Quizzes", value: stats.totalQuizzes, icon: BookOpen, color: "text-purple-500" },
    { title: "Forum Threads", value: stats.totalForumThreads, icon: MessageSquare, color: "text-orange-500" },
    { title: "Vocabulary Items", value: stats.totalVocabulary, icon: TrendingUp, color: "text-pink-500" },
    { title: "Leagues", value: stats.totalLeagues, icon: Trophy, color: "text-red-500" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Admin Panel</h2>
          <p className="text-muted-foreground">
            Manage users, content, games, and more from this central dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <a href="/admin/users" className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <Users className="h-5 w-5" />
                <span>Manage Users</span>
              </a>
              <a href="/admin/quizzes" className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <BookOpen className="h-5 w-5" />
                <span>Manage Quizzes</span>
              </a>
              <a href="/admin/forum" className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <MessageSquare className="h-5 w-5" />
                <span>Moderate Forum</span>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Backend service health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="flex items-center gap-2 text-green-500 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <span className="flex items-center gap-2 text-green-500 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Edge Functions</span>
                <span className="flex items-center gap-2 text-green-500 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Healthy
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
