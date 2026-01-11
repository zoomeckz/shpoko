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
import { Trophy, Plus, Pencil, Trash2, Star, Medal } from "lucide-react";

export default function AdminHallOfFame() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    user_id: "",
    month_year: "",
    place: 1,
    xp_at_win: 0,
    stars: 0,
  });

  // Fetch hall of fame entries
  const { data: entries, isLoading } = useQuery({
    queryKey: ["admin-hall-of-fame"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hall_of_fame")
        .select("*")
        .order("month_year", { ascending: false })
        .order("place", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch users for selection
  const { data: users } = useQuery({
    queryKey: ["admin-users-hof"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .order("username");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("hall_of_fame").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hall-of-fame"] });
      toast.success("Entry added to Hall of Fame");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("hall_of_fame")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hall-of-fame"] });
      toast.success("Entry updated");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hall_of_fame")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hall-of-fame"] });
      toast.success("Entry removed from Hall of Fame");
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      user_id: "",
      month_year: "",
      place: 1,
      xp_at_win: 0,
      stars: 0,
    });
    setEditingEntry(null);
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      user_id: entry.user_id,
      month_year: entry.month_year,
      place: entry.place,
      xp_at_win: entry.xp_at_win,
      stars: entry.stars,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getPlaceIcon = (place: number) => {
    switch (place) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground">{place}</span>;
    }
  };

  // Group entries by month
  const entriesByMonth = entries?.reduce((acc: any, entry) => {
    if (!acc[entry.month_year]) {
      acc[entry.month_year] = [];
    }
    acc[entry.month_year].push(entry);
    return acc;
  }, {});

  return (
    <AdminLayout title="Hall of Fame Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hall of Fame Management</h1>
            <p className="text-muted-foreground">
              Manage monthly champions and achievements
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Entry" : "Add to Hall of Fame"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>User</Label>
                  <Select
                    value={formData.user_id}
                    onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Month/Year (e.g., 2024-01)</Label>
                  <Input
                    value={formData.month_year}
                    onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
                    placeholder="YYYY-MM"
                  />
                </div>
                <div>
                  <Label>Place</Label>
                  <Select
                    value={formData.place.toString()}
                    onValueChange={(value) => setFormData({ ...formData, place: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">🥇 1st Place</SelectItem>
                      <SelectItem value="2">🥈 2nd Place</SelectItem>
                      <SelectItem value="3">🥉 3rd Place</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>XP at Win</Label>
                  <Input
                    type="number"
                    value={formData.xp_at_win}
                    onChange={(e) => setFormData({ ...formData, xp_at_win: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Stars (0-5)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    value={formData.stars}
                    onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) })}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingEntry ? "Update" : "Add"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{entries?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Medal className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Months Recorded</p>
                  <p className="text-2xl font-bold">
                    {entriesByMonth ? Object.keys(entriesByMonth).length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Star className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Stars</p>
                  <p className="text-2xl font-bold">
                    {entries?.reduce((sum, e) => sum + (e.stars || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Hall of Fame Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Place</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>XP at Win</TableHead>
                    <TableHead>Stars</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.month_year}</TableCell>
                      <TableCell>{getPlaceIcon(entry.place)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{entry.xp_at_win.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < entry.stars ? "text-yellow-500 fill-yellow-500" : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Remove this entry?")) {
                              deleteMutation.mutate(entry.id);
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
