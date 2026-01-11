import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Settings, Database, Shield, RefreshCcw, Trash2, AlertTriangle } from "lucide-react";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [isClearing, setIsClearing] = useState(false);

  // Get database stats
  const { data: dbStats, refetch: refetchStats } = useQuery({
    queryKey: ["admin-db-stats"],
    queryFn: async () => {
      const tables = [
        "profiles",
        "user_vocabulary",
        "user_progress",
        "user_skins",
        "skin_trades",
        "dungeon_runs",
        "adventure_progress",
        "roguelike_progress",
        "roguelike_completed_nodes",
        "quiz_attempts",
        "quiz_feedback",
        "forum_threads",
        "forum_posts",
        "friendships",
        "friend_messages",
      ];

      const stats: Record<string, number> = {};

      for (const table of tables) {
        const { count, error } = await supabase
          .from(table as any)
          .select("*", { count: "exact", head: true });
        if (!error) {
          stats[table] = count || 0;
        }
      }

      return stats;
    },
  });

  // Clear old data mutation
  const clearOldDataMutation = useMutation({
    mutationFn: async (days: number) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString();

      // Clear old friend messages
      await supabase
        .from("friend_messages")
        .delete()
        .lt("created_at", cutoffStr);

      // Clear old dungeon runs
      await supabase
        .from("dungeon_runs")
        .delete()
        .lt("created_at", cutoffStr)
        .eq("completed", true);

      return { cutoffDate: cutoffStr };
    },
    onSuccess: () => {
      toast.success("Old data cleared successfully");
      refetchStats();
    },
    onError: (error) => toast.error(error.message),
  });

  // Reset user progress (dangerous!)
  const resetUserProgressMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Reset profile stats
      await supabase
        .from("profiles")
        .update({ xp: 0, level: 1, streak: 0 })
        .eq("id", userId);

      // Clear progress
      await supabase.from("user_progress").delete().eq("user_id", userId);
      await supabase.from("adventure_progress").delete().eq("user_id", userId);
      await supabase.from("roguelike_progress").delete().eq("user_id", userId);
      await supabase.from("roguelike_completed_nodes").delete().eq("user_id", userId);
    },
    onSuccess: () => {
      toast.success("User progress reset");
      queryClient.invalidateQueries({ queryKey: ["admin-db-stats"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">
            System configuration and maintenance tools
          </p>
        </div>

        {/* Database Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Statistics
            </CardTitle>
            <CardDescription>
              Current record counts across all tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dbStats && Object.entries(dbStats).map(([table, count]) => (
                <div key={table} className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground capitalize">
                    {table.replace(/_/g, " ")}
                  </p>
                  <p className="text-2xl font-bold">{count.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetchStats()}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
          </CardContent>
        </Card>

        {/* Maintenance Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Maintenance Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Clear Old Messages</h3>
                <p className="text-sm text-muted-foreground">
                  Remove friend messages older than 30 days
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm("Clear messages older than 30 days?")) {
                    clearOldDataMutation.mutate(30);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Clear Old Dungeon Runs</h3>
                <p className="text-sm text-muted-foreground">
                  Remove completed dungeon runs older than 90 days
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm("Clear dungeon runs older than 90 days?")) {
                    clearOldDataMutation.mutate(90);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Invalidate All Caches</h3>
                <p className="text-sm text-muted-foreground">
                  Clear all React Query caches
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  queryClient.invalidateQueries();
                  toast.success("All caches invalidated");
                }}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Invalidate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              These actions are irreversible. Use with extreme caution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
              <h3 className="font-medium text-red-500">Reset All User Progress</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will reset XP, levels, and streaks for ALL users. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                disabled
                onClick={() => {
                  // Intentionally disabled for safety
                  toast.error("This action is disabled for safety");
                }}
              >
                Reset All Progress (Disabled)
              </Button>
            </div>

            <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
              <h3 className="font-medium text-red-500">Clear All Vocabulary</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Remove all vocabulary entries from all users.
              </p>
              <Button
                variant="destructive"
                disabled
                onClick={() => {
                  toast.error("This action is disabled for safety");
                }}
              >
                Clear Vocabulary (Disabled)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Admin Access:</strong> sam.nowroozi@gmail.com or users with admin role</p>
              <p><strong>Session:</strong> Managed by Supabase Auth</p>
              <p><strong>Permissions:</strong> Full CRUD on all tables</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
