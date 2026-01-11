import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Edit, Trash2, Eye, EyeOff, RefreshCw, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  language: string;
  is_public: boolean;
  is_timed: boolean;
  time_limit_seconds: number | null;
  creator_id: string;
  created_at: string;
}

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    is_public: true,
    is_timed: false,
    time_limit_seconds: 0,
  });

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Failed to fetch quizzes");
    } else {
      setQuizzes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setEditForm({
      title: quiz.title,
      description: quiz.description || "",
      category: quiz.category || "",
      is_public: quiz.is_public,
      is_timed: quiz.is_timed,
      time_limit_seconds: quiz.time_limit_seconds || 0,
    });
  };

  const handleSave = async () => {
    if (!editingQuiz) return;

    const { error } = await supabase
      .from("quizzes")
      .update({
        title: editForm.title,
        description: editForm.description || null,
        category: editForm.category || null,
        is_public: editForm.is_public,
        is_timed: editForm.is_timed,
        time_limit_seconds: editForm.is_timed ? editForm.time_limit_seconds : null,
      })
      .eq("id", editingQuiz.id);

    if (error) {
      toast.error("Failed to update quiz");
    } else {
      toast.success("Quiz updated");
      setEditingQuiz(null);
      fetchQuizzes();
    }
  };

  const handleTogglePublic = async (quiz: Quiz) => {
    const { error } = await supabase
      .from("quizzes")
      .update({ is_public: !quiz.is_public })
      .eq("id", quiz.id);

    if (error) {
      toast.error("Failed to update quiz");
    } else {
      toast.success(quiz.is_public ? "Quiz made private" : "Quiz made public");
      fetchQuizzes();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quiz and all its questions?")) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete quiz");
    } else {
      toast.success("Quiz deleted");
      fetchQuizzes();
    }
  };

  return (
    <AdminLayout title="Quiz Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchQuizzes} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Quizzes ({filteredQuizzes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading quizzes...
                    </TableCell>
                  </TableRow>
                ) : filteredQuizzes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No quizzes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{quiz.category || "-"}</TableCell>
                      <TableCell>{quiz.language}</TableCell>
                      <TableCell>
                        {quiz.is_public ? (
                          <Badge className="bg-green-500/20 text-green-500">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {quiz.is_timed ? `${quiz.time_limit_seconds}s` : "No"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleTogglePublic(quiz)}>
                            {quiz.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(quiz)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(quiz.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingQuiz} onOpenChange={() => setEditingQuiz(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Public</Label>
              <Switch
                checked={editForm.is_public}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_public: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Timed</Label>
              <Switch
                checked={editForm.is_timed}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_timed: checked })}
              />
            </div>
            {editForm.is_timed && (
              <div className="space-y-2">
                <Label>Time Limit (seconds)</Label>
                <Input
                  type="number"
                  value={editForm.time_limit_seconds}
                  onChange={(e) => setEditForm({ ...editForm, time_limit_seconds: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuiz(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
