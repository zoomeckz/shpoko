import { useEffect, useState } from "react";
import { Edit, Flame, RefreshCw, Search, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { cn } from "@/lib/utils";
import { AdminLayout } from "./AdminLayout";

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  xp: number;
  level: number;
  streak: number;
  created_at: string;
  last_activity_date: string | null;
  profile_picture: string | null;
}

const fieldClass =
  "w-full h-12 rounded-2xl border-2 border-border bg-muted px-4 font-semibold text-foreground outline-none focus:border-primary focus:bg-card transition-colors";

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({ username: "", xp: 0, level: 1, streak: 0 });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, email, xp, level, streak, created_at, last_activity_date, profile_picture")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } else {
      setUsers((data as UserProfile[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const query = searchQuery.trim().toLowerCase();
  const filteredUsers = users.filter(
    (user) => user.username.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)
  );

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({ username: user.username, xp: user.xp, level: user.level, streak: user.streak });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    const { error } = await supabase.from("profiles").update(editForm).eq("id", editingUser.id);
    if (error) {
      toast.error("Failed to update user");
      console.error(error);
    } else {
      toast.success("User updated");
      setEditingUser(null);
      fetchUsers();
    }
  };

  const handleDelete = async (user: UserProfile) => {
    if (!confirm(`Delete ${user.username}'s profile? This can't be undone.`)) return;
    // Note: this deletes the profile row, not the login itself.
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    if (error) {
      toast.error("Failed to delete user");
      console.error(error);
    } else {
      toast.success("User deleted");
      fetchUsers();
    }
  };

  return (
    <AdminLayout
      title="Users"
      description={loading ? "Loading…" : `${users.length.toLocaleString()} registered accounts, newest first`}
      actions={
        <DuoButton variant="white" size="sm" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </DuoButton>
      }
    >
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          placeholder="Search by username or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(fieldClass, "pl-12")}
          aria-label="Search users"
        />
      </div>

      <div className="duo-card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-border text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3 text-right">XP</th>
                <th className="px-5 py-3 text-right">Level</th>
                <th className="px-5 py-3 text-right">Streak</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Last active</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center font-bold text-muted-foreground">
                    Loading users…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center font-bold text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center overflow-hidden">
                          {user.profile_picture ? (
                            <img src={user.profile_picture} alt="" className="w-10 h-10 object-cover" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-extrabold text-foreground truncate">{user.username}</span>
                          <span className="block text-sm font-semibold text-muted-foreground truncate">{user.email || "No email"}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-extrabold text-warning">{user.xp.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold text-foreground">{user.level}</td>
                    <td className="px-5 py-3 text-right font-bold text-foreground">
                      <span className="inline-flex items-center gap-1">
                        {user.streak}
                        <Flame className={cn("w-4 h-4", user.streak > 0 ? "text-warning" : "text-muted-foreground/40")} />
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-muted-foreground whitespace-nowrap">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-muted-foreground whitespace-nowrap">{formatDate(user.last_activity_date)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          aria-label={`Edit ${user.username}`}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          aria-label={`Delete ${user.username}`}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="rounded-2xl border-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Edit {editingUser?.username}</DialogTitle>
            <DialogDescription className="font-semibold">Changes apply right away.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="font-bold">Username</Label>
              <input
                id="username"
                className={fieldClass}
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["xp", "level", "streak"] as const).map((field) => (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={field} className="font-bold capitalize">{field === "xp" ? "XP" : field}</Label>
                  <input
                    id={field}
                    type="number"
                    className={fieldClass}
                    value={editForm[field]}
                    onChange={(e) => setEditForm({ ...editForm, [field]: parseInt(e.target.value) || (field === "level" ? 1 : 0) })}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DuoButton variant="white" onClick={() => setEditingUser(null)}>
              Cancel
            </DuoButton>
            <DuoButton onClick={handleSave}>Save</DuoButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
