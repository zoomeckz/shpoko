import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Target, Users, CheckCircle } from "lucide-react";

interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  action_type: string;
  target_count: number;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
}

const questTypes = ["daily", "weekly", "special"];
const actionTypes = ["complete_lesson", "earn_xp", "win_streak", "complete_quiz", "play_game", "login"];

export default function AdminQuests() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "daily",
    action_type: "complete_lesson",
    target_count: 1,
    xp_reward: 10,
    is_active: true,
  });

  const { data: quests, isLoading } = useQuery({
    queryKey: ["admin-quests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quests")
        .select("*")
        .order("type", { ascending: true })
        .order("title", { ascending: true });
      if (error) throw error;
      return data as Quest[];
    },
  });

  const { data: questStats } = useQuery({
    queryKey: ["admin-quest-stats"],
    queryFn: async () => {
      const { data: userQuests, error } = await supabase
        .from("user_quests")
        .select("*");
      if (error) throw error;

      const completed = userQuests?.filter(q => q.completed).length || 0;
      const activeAssignments = userQuests?.filter(q => !q.completed && new Date(q.expires_at) > new Date()).length || 0;
      const uniqueUsers = new Set(userQuests?.map(q => q.user_id)).size;

      return { completed, activeAssignments, uniqueUsers };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("quests").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quests"] });
      toast.success("Quest created");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("quests")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quests"] });
      toast.success("Quest updated");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quests"] });
      toast.success("Quest deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("quests")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quests"] });
      toast.success("Quest status updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "daily",
      action_type: "complete_lesson",
      target_count: 1,
      xp_reward: 10,
      is_active: true,
    });
    setEditingQuest(null);
  };

  const handleEdit = (quest: Quest) => {
    setEditingQuest(quest);
    setFormData({
      title: quest.title,
      description: quest.description,
      type: quest.type,
      action_type: quest.action_type,
      target_count: quest.target_count,
      xp_reward: quest.xp_reward,
      is_active: quest.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingQuest) {
      updateMutation.mutate({ id: editingQuest.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily": return "bg-blue-500/20 text-blue-500";
      case "weekly": return "bg-purple-500/20 text-purple-500";
      case "special": return "bg-yellow-500/20 text-yellow-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout title="Quest Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quest Management</h1>
          <p className="text-muted-foreground">
            Create and manage quests for users to complete
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Quests</p>
                  <p className="text-2xl font-bold">{quests?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Quests</p>
                  <p className="text-2xl font-bold">
                    {quests?.filter(q => q.is_active).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Users with Quests</p>
                  <p className="text-2xl font-bold">{questStats?.uniqueUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Target className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{questStats?.completed || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quests Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Quests</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quest
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuest ? "Edit Quest" : "Create Quest"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Complete 3 lessons"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Finish any 3 lessons to complete this quest"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Action Type</Label>
                      <Select
                        value={formData.action_type}
                        onValueChange={(value) => setFormData({ ...formData, action_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {actionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Target Count</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.target_count}
                        onChange={(e) => setFormData({ ...formData, target_count: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>XP Reward</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.xp_reward}
                        onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingQuest ? "Update Quest" : "Create Quest"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quests?.map((quest) => (
                    <TableRow key={quest.id}>
                      <TableCell className="font-medium">{quest.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs capitalize ${getTypeColor(quest.type)}`}>
                          {quest.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {quest.action_type.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>{quest.target_count}</TableCell>
                      <TableCell>{quest.xp_reward}</TableCell>
                      <TableCell>
                        <Switch
                          checked={quest.is_active}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ id: quest.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(quest)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Delete this quest?")) {
                              deleteMutation.mutate(quest.id);
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
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}