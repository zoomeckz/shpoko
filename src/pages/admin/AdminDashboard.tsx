import { ReactNode, useCallback, useEffect, useState } from "react";
import { Activity, Flame, RefreshCw, UserPlus, Users, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listAccounts } from "@/lib/adminApi";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { cn } from "@/lib/utils";
import { daysAgo, localDateKey } from "@/lib/dates";
import { AdminLayout } from "./AdminLayout";

interface ProfileRow {
  username: string;
  xp: number;
  level: number;
  streak: number;
  last_activity_date: string | null;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  activeToday: number;
  activeWeek: number;
  newWeek: number;
  totalXp: number;
  onStreak: number;
  signups: { date: string; count: number }[];
  lastActive: { date: string; count: number }[];
  byLevel: { level: number; count: number }[];
  byStreak: { range: string; count: number }[];
  topUsers: { username: string; xp: number }[];
}

const dayKey = localDateKey;
// Sign-up times are stored in UTC; compare them as local dates.
const joinedKey = (r: ProfileRow) => (r.created_at ? localDateKey(new Date(r.created_at)) : "");
const shortDate = (key: string) =>
  new Date(key + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });

function buildStats(rows: ProfileRow[], totalUsers: number): Stats {
  const today = dayKey(new Date());
  const weekAgo = dayKey(daysAgo(6));

  const signups = Array.from({ length: 14 }, (_, i) => {
    const key = dayKey(daysAgo(13 - i));
    return { date: shortDate(key), count: rows.filter((r) => joinedKey(r) === key).length };
  });
  const lastActive = Array.from({ length: 7 }, (_, i) => {
    const key = dayKey(daysAgo(6 - i));
    return { date: shortDate(key), count: rows.filter((r) => r.last_activity_date === key).length };
  });

  const levelCounts: Record<number, number> = {};
  rows.forEach((r) => (levelCounts[r.level] = (levelCounts[r.level] || 0) + 1));
  const byLevel = Object.entries(levelCounts)
    .map(([level, count]) => ({ level: Number(level), count }))
    .sort((a, b) => a.level - b.level)
    .slice(0, 20);

  const ranges = [
    { range: "0", min: 0, max: 0 },
    { range: "1–7", min: 1, max: 7 },
    { range: "8–30", min: 8, max: 30 },
    { range: "31–100", min: 31, max: 100 },
    { range: "100+", min: 101, max: Infinity },
  ];
  const byStreak = ranges.map((r) => ({
    range: r.range,
    count: rows.filter((p) => p.streak >= r.min && p.streak <= r.max).length,
  }));

  return {
    totalUsers,
    activeToday: rows.filter((r) => r.last_activity_date === today).length,
    activeWeek: rows.filter((r) => r.last_activity_date && r.last_activity_date >= weekAgo).length,
    newWeek: rows.filter((r) => joinedKey(r) >= weekAgo).length,
    totalXp: rows.reduce((sum, r) => sum + (r.xp || 0), 0),
    onStreak: rows.filter((r) => r.streak > 0).length,
    signups,
    lastActive,
    byLevel,
    byStreak,
    topUsers: [...rows].sort((a, b) => b.xp - a.xp).slice(0, 10).map((r) => ({ username: r.username, xp: r.xp })),
  };
}

function StatTile({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Users; tone: string }) {
  return (
    <div className="duo-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center", tone)}>
          <Icon className="w-5 h-5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-black text-foreground">{value}</p>
    </div>
  );
}

function ChartCard({ title, description, children, className }: { title: string; description: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("duo-card p-5", className)}>
      <p className="text-lg font-extrabold text-foreground">{title}</p>
      <p className="text-sm font-semibold text-muted-foreground">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// Recharts styling that follows the light/dark theme.
const axis = { tick: { fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 700 }, axisLine: false, tickLine: false };
const grid = { stroke: "hsl(var(--border))", strokeDasharray: "4 4", vertical: false };
const tooltip = {
  cursor: { fill: "hsl(var(--muted))" },
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "2px solid hsl(var(--border))",
    borderRadius: 12,
    color: "hsl(var(--foreground))",
    fontWeight: 700,
  },
  labelStyle: { color: "hsl(var(--muted-foreground))" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Read through the admin function: the database only lets each user
      // read their own profile, so a direct query would only see you.
      const rows: ProfileRow[] = await listAccounts();
      setStats(buildStats(rows, rows.length));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Couldn't load statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const n = (v: number | undefined) => (loading || v === undefined ? "…" : v.toLocaleString());

  return (
    <AdminLayout
      title="Overview"
      description="How people are using Shpoko. Counts registered accounts; guests aren't stored."
      actions={
        <DuoButton variant="white" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </DuoButton>
      }
    >
      <div className="space-y-6">
        {loadError && (
          <div className="rounded-2xl border-2 border-error/40 bg-error/10 px-5 py-4 font-bold text-error">{loadError}</div>
        )}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <StatTile label="Total users" value={n(stats?.totalUsers)} icon={Users} tone="bg-primary/15 text-primary" />
          <StatTile label="Active today" value={n(stats?.activeToday)} icon={Activity} tone="bg-success/15 text-success" />
          <StatTile label="Active this week" value={n(stats?.activeWeek)} icon={Activity} tone="bg-success/15 text-success" />
          <StatTile label="New this week" value={n(stats?.newWeek)} icon={UserPlus} tone="bg-accent-strong/15 text-accent-strong" />
          <StatTile label="On a streak" value={n(stats?.onStreak)} icon={Flame} tone="bg-warning/15 text-warning" />
          <StatTile label="XP earned" value={n(stats?.totalXp)} icon={Zap} tone="bg-warning/15 text-warning" />
        </div>

        {stats && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="New sign-ups" description="Accounts created per day, last 14 days">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.signups}>
                    <CartesianGrid {...grid} />
                    <XAxis dataKey="date" {...axis} interval={1} />
                    <YAxis allowDecimals={false} {...axis} width={32} />
                    <Tooltip {...tooltip} />
                    <Bar dataKey="count" name="Sign-ups" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Last active" description="Users whose latest visit was on each day, last 7 days">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={stats.lastActive}>
                    <CartesianGrid {...grid} />
                    <XAxis dataKey="date" {...axis} />
                    <YAxis allowDecimals={false} {...axis} width={32} />
                    <Tooltip {...tooltip} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Users"
                      stroke="hsl(var(--success))"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "hsl(var(--success))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Users by level" description="How many users are on each level">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.byLevel}>
                    <CartesianGrid {...grid} />
                    <XAxis dataKey="level" {...axis} />
                    <YAxis allowDecimals={false} {...axis} width={32} />
                    <Tooltip {...tooltip} />
                    <Bar dataKey="count" name="Users" fill="hsl(var(--accent-strong))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Users by streak" description="Current streak length in days">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.byStreak}>
                    <CartesianGrid {...grid} />
                    <XAxis dataKey="range" {...axis} />
                    <YAxis allowDecimals={false} {...axis} width={32} />
                    <Tooltip {...tooltip} />
                    <Bar dataKey="count" name="Users" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Top 10 by XP" description="Your most active learners">
              {stats.topUsers.length === 0 ? (
                <p className="py-8 text-center font-bold text-muted-foreground">No users yet.</p>
              ) : (
                <ol className="divide-y-2 divide-border">
                  {stats.topUsers.map((u, i) => (
                    <li key={u.username + i} className="flex items-center gap-4 py-3">
                      <span
                        className={cn(
                          "w-8 text-center text-lg font-black",
                          i === 0 ? "text-warning" : i < 3 ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 font-extrabold text-foreground">{u.username}</span>
                      <span className="font-extrabold text-warning">{u.xp.toLocaleString()} XP</span>
                    </li>
                  ))}
                </ol>
              )}
            </ChartCard>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
