import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  usersByLevel: { level: number; count: number }[];
  usersByStreak: { range: string; count: number }[];
  topUsers: { username: string; xp: number }[];
  premiumRatio: { name: string; value: number }[];
  recentActivity: { date: string; count: number }[];
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F"];

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    usersByLevel: [],
    usersByStreak: [],
    topUsers: [],
    premiumRatio: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("level, streak, xp, username, is_premium, last_activity_date");

        if (!profiles) return;

        // Users by level
        const levelCounts: Record<number, number> = {};
        profiles.forEach((p) => {
          levelCounts[p.level] = (levelCounts[p.level] || 0) + 1;
        });
        const usersByLevel = Object.entries(levelCounts)
          .map(([level, count]) => ({ level: parseInt(level), count }))
          .sort((a, b) => a.level - b.level)
          .slice(0, 20);

        // Users by streak ranges
        const streakRanges = [
          { range: "0", min: 0, max: 0 },
          { range: "1-7", min: 1, max: 7 },
          { range: "8-30", min: 8, max: 30 },
          { range: "31-100", min: 31, max: 100 },
          { range: "100+", min: 101, max: Infinity },
        ];
        const usersByStreak = streakRanges.map((range) => ({
          range: range.range,
          count: profiles.filter((p) => p.streak >= range.min && p.streak <= range.max).length,
        }));

        // Top users by XP
        const topUsers = [...profiles]
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 10)
          .map((p) => ({ username: p.username, xp: p.xp }));

        // Premium vs Free ratio
        const premiumCount = profiles.filter((p) => p.is_premium).length;
        const premiumRatio = [
          { name: "Premium", value: premiumCount },
          { name: "Free", value: profiles.length - premiumCount },
        ];

        // Recent activity (last 7 days)
        const today = new Date();
        const recentActivity = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          const count = profiles.filter((p) => p.last_activity_date === dateStr).length;
          recentActivity.push({ date: dateStr.slice(5), count });
        }

        setData({
          usersByLevel,
          usersByStreak,
          topUsers,
          premiumRatio,
          recentActivity,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Users by Level */}
          <Card>
            <CardHeader>
              <CardTitle>Users by Level</CardTitle>
              <CardDescription>Distribution of users across levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.usersByLevel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Users by Streak */}
          <Card>
            <CardHeader>
              <CardTitle>Users by Streak</CardTitle>
              <CardDescription>Streak ranges distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.usersByStreak}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Active users in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Premium Ratio */}
          <Card>
            <CardHeader>
              <CardTitle>Premium vs Free Users</CardTitle>
              <CardDescription>User subscription status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.premiumRatio}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.premiumRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users by XP</CardTitle>
            <CardDescription>Leaderboard of top 10 users</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topUsers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="username" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="xp" fill="hsl(var(--chart-4))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
