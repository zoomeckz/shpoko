import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Search, Edit2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProfilePicture } from "@/components/ProfilePictureSelector";

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  profile_picture: string | null;
  level: number;
}

export const AdminChangeUsername = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" });
    
    setIsAdmin(data === true);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .rpc("get_leaderboard", { limit_count: 100 });
    
    if (!error && data) {
      const filtered = data.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUsers(filtered.map(u => ({
        id: u.id,
        username: u.username,
        email: null,
        profile_picture: u.profile_picture,
        level: u.level,
      })));
    }
    setLoading(false);
  };

  const updateUsername = async () => {
    if (!editingUser || !newUsername.trim()) return;

    // Validate username format
    if (newUsername.length < 3 || newUsername.length > 20) {
      toast({
        title: "Invalid Username",
        description: "Username must be 3-20 characters",
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-zA-Z0-9 ]+$/.test(newUsername)) {
      toast({
        title: "Invalid Username",
        description: "Username can only contain letters, numbers, and spaces",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ 
        username: newUsername.trim(),
        last_username_change: new Date().toISOString()
      })
      .eq("id", editingUser.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Username Updated",
        description: `Changed to "${newUsername}"`,
      });
      setEditingUser(null);
      setNewUsername("");
      searchUsers(); // Refresh the list
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shield className="w-4 h-4" />
          Admin: Change Username
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Change User Username
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchUsers()}
            />
            <Button onClick={searchUsers} disabled={loading}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Searching...</div>
          ) : users.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
                >
                  <ProfilePicture pictureId={u.profile_picture} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium">{u.username}</p>
                    <p className="text-xs text-muted-foreground">Level {u.level}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(u);
                      setNewUsername(u.username);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <p className="text-center text-muted-foreground py-4">No users found</p>
          ) : null}

          {editingUser && (
            <Card className="border-primary">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">
                  Editing: {editingUser.username}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3 space-y-3">
                <Input
                  placeholder="New username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={updateUsername}>
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
