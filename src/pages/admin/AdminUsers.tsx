import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Edit, Trash2, Crown, User, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  xp: number;
  level: number;
  streak: number;
  is_premium: boolean;
  created_at: string;
  profile_picture: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    xp: 0,
    level: 1,
    streak: 0,
    is_premium: false,
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("xp", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      is_premium: user.is_premium,
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: editForm.username,
        xp: editForm.xp,
        level: editForm.level,
        streak: editForm.streak,
        is_premium: editForm.is_premium,
      })
      .eq("id", editingUser.id);

    if (error) {
      toast.error("Failed to update user");
      console.error(error);
    } else {
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    // Note: This only deletes the profile, not the auth user
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      toast.error("Failed to delete user");
      console.error(error);
    } else {
      toast.success("User deleted successfully");
      fetchUsers();
    }
  };

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Streak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {user.profile_picture ? (
                                <img src={user.profile_picture} alt="" className="w-8 h-8 rounded-full" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </div>
                            <span className="font-medium">{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email || "N/A"}
                        </TableCell>
                        <TableCell>{user.xp.toLocaleString()}</TableCell>
                        <TableCell>{user.level}</TableCell>
                        <TableCell>{user.streak} 🔥</TableCell>
                        <TableCell>
                          {user.is_premium ? (
                            <Badge className="bg-yellow-500/20 text-yellow-500">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify user details. Changes will be applied immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xp">XP</Label>
                <Input
                  id="xp"
                  type="number"
                  value={editForm.xp}
                  onChange={(e) => setEditForm({ ...editForm, xp: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  type="number"
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="streak">Streak</Label>
                <Input
                  id="streak"
                  type="number"
                  value={editForm.streak}
                  onChange={(e) => setEditForm({ ...editForm, streak: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="premium">Premium Status</Label>
              <Switch
                id="premium"
                checked={editForm.is_premium}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_premium: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
