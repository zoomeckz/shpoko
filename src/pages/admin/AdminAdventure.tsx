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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Map, Users, Trophy, Castle } from "lucide-react";

export default function AdminAdventure() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("nodes");

  // Fetch adventure nodes
  const { data: nodes, isLoading: nodesLoading } = useQuery({
    queryKey: ["adventure-nodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("adventure_nodes")
        .select("*")
        .order("week_number", { ascending: true })
        .order("node_number", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch adventure progress for stats
  const { data: progressStats } = useQuery({
    queryKey: ["adventure-progress-stats"],
    queryFn: async () => {
      const { data: progress, error } = await supabase
        .from("adventure_progress")
        .select("*");
      if (error) throw error;

      const uniqueUsers = new Set(progress?.map(p => p.user_id)).size;
      const completedNodes = progress?.filter(p => p.completed).length || 0;
      const totalAttempts = progress?.reduce((sum, p) => sum + p.attempts, 0) || 0;

      return {
        uniqueUsers,
        completedNodes,
        totalAttempts,
      };
    },
  });

  // Fetch dungeon runs
  const { data: dungeonRuns } = useQuery({
    queryKey: ["dungeon-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dungeon_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout title="Adventure Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Adventure Mode Management</h1>
          <p className="text-muted-foreground">
            Manage adventure nodes, dungeons, and track player progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Nodes</p>
                  <p className="text-2xl font-bold">{nodes?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Castle className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dungeons</p>
                  <p className="text-2xl font-bold">
                    {nodes?.filter(n => n.is_dungeon).length || 0}
                  </p>
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
                  <p className="text-sm text-muted-foreground">Active Players</p>
                  <p className="text-2xl font-bold">{progressStats?.uniqueUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nodes Completed</p>
                  <p className="text-2xl font-bold">{progressStats?.completedNodes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="nodes">Adventure Nodes</TabsTrigger>
            <TabsTrigger value="dungeons">Dungeon Runs</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes">
            <NodesSection nodes={nodes} isLoading={nodesLoading} />
          </TabsContent>

          <TabsContent value="dungeons">
            <DungeonRunsSection runs={dungeonRuns} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function NodesSection({ nodes, isLoading }: { nodes: any[]; isLoading: boolean }) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lesson_id: "",
    node_number: 1,
    week_number: 1,
    xp_reward: 10,
    is_dungeon: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("adventure_nodes").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adventure-nodes"] });
      toast.success("Node created");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("adventure_nodes")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adventure-nodes"] });
      toast.success("Node updated");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("adventure_nodes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adventure-nodes"] });
      toast.success("Node deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      lesson_id: "",
      node_number: 1,
      week_number: 1,
      xp_reward: 10,
      is_dungeon: false,
    });
    setEditingNode(null);
  };

  const handleEdit = (node: any) => {
    setEditingNode(node);
    setFormData({
      title: node.title,
      description: node.description || "",
      lesson_id: node.lesson_id,
      node_number: node.node_number,
      week_number: node.week_number,
      xp_reward: node.xp_reward,
      is_dungeon: node.is_dungeon,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingNode) {
      updateMutation.mutate({ id: editingNode.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Adventure Nodes</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingNode ? "Edit Node" : "Create Node"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Lesson ID</Label>
                <Input
                  value={formData.lesson_id}
                  onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Week Number</Label>
                  <Input
                    type="number"
                    value={formData.week_number}
                    onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Node Number</Label>
                  <Input
                    type="number"
                    value={formData.node_number}
                    onChange={(e) => setFormData({ ...formData, node_number: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>XP Reward</Label>
                <Input
                  type="number"
                  value={formData.xp_reward}
                  onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_dungeon}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_dungeon: checked })}
                />
                <Label>Is Dungeon</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingNode ? "Update" : "Create"}
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
                <TableHead>Week</TableHead>
                <TableHead>Node</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nodes?.map((node) => (
                <TableRow key={node.id}>
                  <TableCell>{node.week_number}</TableCell>
                  <TableCell>{node.node_number}</TableCell>
                  <TableCell className="font-medium">{node.title}</TableCell>
                  <TableCell>{node.xp_reward}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs ${
                      node.is_dungeon 
                        ? "bg-purple-500/20 text-purple-500" 
                        : "bg-blue-500/20 text-blue-500"
                    }`}>
                      {node.is_dungeon ? "Dungeon" : "Lesson"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(node)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Delete this node?")) {
                          deleteMutation.mutate(node.id);
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
  );
}

function DungeonRunsSection({ runs }: { runs: any[] | undefined }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Dungeon Runs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Lives</TableHead>
              <TableHead>XP Earned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs?.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-mono text-xs">{run.user_id.slice(0, 8)}...</TableCell>
                <TableCell>{run.current_room}/{run.total_rooms}</TableCell>
                <TableCell>{run.lives_remaining}/{run.max_lives}</TableCell>
                <TableCell>{run.xp_earned}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-xs ${
                    run.completed 
                      ? "bg-green-500/20 text-green-500"
                      : run.failed
                      ? "bg-red-500/20 text-red-500"
                      : "bg-yellow-500/20 text-yellow-500"
                  }`}>
                    {run.completed ? "Completed" : run.failed ? "Failed" : "In Progress"}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(run.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
