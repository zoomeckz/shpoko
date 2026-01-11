import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, BookOpen, Users, TrendingUp, Eye, Trash2 } from "lucide-react";

export default function AdminVocabulary() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedVocab, setSelectedVocab] = useState<any>(null);

  // Get all users who have vocabulary
  const { data: users } = useQuery({
    queryKey: ["vocab-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_vocabulary")
        .select("user_id")
        .limit(1000);
      if (error) throw error;
      
      const uniqueUserIds = [...new Set(data.map(v => v.user_id))];
      
      if (uniqueUserIds.length === 0) return [];
      
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", uniqueUserIds);
      if (profileError) throw profileError;
      
      return profiles;
    },
  });

  // Get vocabulary with optional filtering
  const { data: vocabulary, isLoading } = useQuery({
    queryKey: ["admin-vocabulary", selectedUser, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("user_vocabulary")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (selectedUser && selectedUser !== "all") {
        query = query.eq("user_id", selectedUser);
      }

      if (searchTerm) {
        query = query.ilike("word", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Get vocabulary stats
  const { data: stats } = useQuery({
    queryKey: ["vocabulary-stats"],
    queryFn: async () => {
      const { count: totalWords } = await supabase
        .from("user_vocabulary")
        .select("*", { count: "exact", head: true });

      const { data: statusCounts } = await supabase
        .from("user_vocabulary")
        .select("status");

      const statuses = statusCounts?.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      return {
        totalWords: totalWords || 0,
        statusBreakdown: statuses || {},
      };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_vocabulary")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vocabulary"] });
      queryClient.invalidateQueries({ queryKey: ["vocabulary-stats"] });
      toast.success("Vocabulary entry deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("user_vocabulary")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vocabulary"] });
      toast.success("Vocabulary updated");
      setSelectedVocab(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const getStatusLabel = (status: number) => {
    const labels: Record<number, string> = {
      0: "New",
      1: "Learning",
      2: "Familiar",
      3: "Known",
      4: "Mastered",
    };
    return labels[status] || "Unknown";
  };

  const getStatusColor = (status: number) => {
    const colors: Record<number, string> = {
      0: "bg-blue-500/20 text-blue-500",
      1: "bg-yellow-500/20 text-yellow-500",
      2: "bg-orange-500/20 text-orange-500",
      3: "bg-green-500/20 text-green-500",
      4: "bg-emerald-500/20 text-emerald-500",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vocabulary Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage user vocabulary across the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Words</p>
                  <p className="text-2xl font-bold">{stats?.totalWords || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Words</p>
                  <p className="text-2xl font-bold">{stats?.statusBreakdown?.[0] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Learning</p>
                  <p className="text-2xl font-bold">{stats?.statusBreakdown?.[1] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mastered</p>
                  <p className="text-2xl font-bold">{stats?.statusBreakdown?.[4] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vocabulary Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Vocabulary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Word</TableHead>
                      <TableHead>Translation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Times Seen</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vocabulary?.map((vocab) => (
                      <TableRow key={vocab.id}>
                        <TableCell className="font-medium">{vocab.word}</TableCell>
                        <TableCell>{vocab.translation || "-"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-md text-xs ${getStatusColor(vocab.status)}`}>
                            {getStatusLabel(vocab.status)}
                          </span>
                        </TableCell>
                        <TableCell>{vocab.times_seen}</TableCell>
                        <TableCell>
                          {vocab.times_seen > 0
                            ? Math.round((vocab.times_correct / vocab.times_seen) * 100)
                            : 0}%
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(vocab.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedVocab(vocab)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Delete this vocabulary entry?")) {
                                deleteMutation.mutate(vocab.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!selectedVocab} onOpenChange={() => setSelectedVocab(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Vocabulary Entry</DialogTitle>
            </DialogHeader>
            {selectedVocab && (
              <div className="space-y-4">
                <div>
                  <Label>Word</Label>
                  <Input value={selectedVocab.word} disabled />
                </div>
                <div>
                  <Label>Translation</Label>
                  <Input
                    value={selectedVocab.translation || ""}
                    onChange={(e) =>
                      setSelectedVocab({ ...selectedVocab, translation: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Romanization</Label>
                  <Input
                    value={selectedVocab.romanization || ""}
                    onChange={(e) =>
                      setSelectedVocab({ ...selectedVocab, romanization: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedVocab.status.toString()}
                    onValueChange={(v) =>
                      setSelectedVocab({ ...selectedVocab, status: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">New</SelectItem>
                      <SelectItem value="1">Learning</SelectItem>
                      <SelectItem value="2">Familiar</SelectItem>
                      <SelectItem value="3">Known</SelectItem>
                      <SelectItem value="4">Mastered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={selectedVocab.notes || ""}
                    onChange={(e) =>
                      setSelectedVocab({ ...selectedVocab, notes: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={() =>
                    updateMutation.mutate({
                      id: selectedVocab.id,
                      data: {
                        translation: selectedVocab.translation,
                        romanization: selectedVocab.romanization,
                        status: selectedVocab.status,
                        notes: selectedVocab.notes,
                      },
                    })
                  }
                  className="w-full"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
