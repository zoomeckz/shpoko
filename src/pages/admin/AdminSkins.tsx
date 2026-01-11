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
import { Image, Users, Gift, Trash2, Eye } from "lucide-react";

// Available skins from the assets folder
const availableSkins = [
  { id: "raccoon-angel", name: "Angel", image: "/src/assets/skins/raccoon-angel.png" },
  { id: "raccoon-astronaut", name: "Astronaut", image: "/src/assets/skins/raccoon-astronaut.png" },
  { id: "raccoon-baby", name: "Baby", image: "/src/assets/skins/raccoon-baby.png" },
  { id: "raccoon-bandit", name: "Bandit", image: "/src/assets/skins/raccoon-bandit.png" },
  { id: "raccoon-chef", name: "Chef", image: "/src/assets/skins/raccoon-chef.png" },
  { id: "raccoon-chubby", name: "Chubby", image: "/src/assets/skins/raccoon-chubby.png" },
  { id: "raccoon-curious", name: "Curious", image: "/src/assets/skins/raccoon-curious.png" },
  { id: "raccoon-golden", name: "Golden", image: "/src/assets/skins/raccoon-golden.png" },
  { id: "raccoon-mischief", name: "Mischief", image: "/src/assets/skins/raccoon-mischief.png" },
  { id: "raccoon-mystic", name: "Mystic", image: "/src/assets/skins/raccoon-mystic.png" },
  { id: "raccoon-ninja", name: "Ninja", image: "/src/assets/skins/raccoon-ninja.png" },
  { id: "raccoon-pirate", name: "Pirate", image: "/src/assets/skins/raccoon-pirate.png" },
  { id: "raccoon-robot", name: "Robot", image: "/src/assets/skins/raccoon-robot.png" },
  { id: "raccoon-royal", name: "Royal", image: "/src/assets/skins/raccoon-royal.png" },
  { id: "raccoon-scholarly", name: "Scholarly", image: "/src/assets/skins/raccoon-scholarly.png" },
  { id: "raccoon-sleepy", name: "Sleepy", image: "/src/assets/skins/raccoon-sleepy.png" },
  { id: "raccoon-superhero", name: "Superhero", image: "/src/assets/skins/raccoon-superhero.png" },
  { id: "raccoon-vampire", name: "Vampire", image: "/src/assets/skins/raccoon-vampire.png" },
  { id: "raccoon-warrior", name: "Warrior", image: "/src/assets/skins/raccoon-warrior.png" },
];

export default function AdminSkins() {
  const queryClient = useQueryClient();
  const [selectedSkin, setSelectedSkin] = useState<string | null>(null);
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [giftUserId, setGiftUserId] = useState("");
  const [giftSkinId, setGiftSkinId] = useState("");

  // Fetch user skins
  const { data: userSkins, isLoading } = useQuery({
    queryKey: ["admin-user-skins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skins")
        .select("*")
        .order("acquired_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch users for gifting
  const { data: users } = useQuery({
    queryKey: ["admin-users-for-skins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .order("username");
      if (error) throw error;
      return data;
    },
  });

  // Stats
  const skinStats = userSkins?.reduce((acc: any, skin) => {
    acc[skin.skin_id] = (acc[skin.skin_id] || 0) + 1;
    return acc;
  }, {});

  const giftMutation = useMutation({
    mutationFn: async ({ userId, skinId }: { userId: string; skinId: string }) => {
      // Check if user already has this skin
      const { data: existing } = await supabase
        .from("user_skins")
        .select("id")
        .eq("user_id", userId)
        .eq("skin_id", skinId)
        .single();

      if (existing) {
        throw new Error("User already owns this skin");
      }

      const { error } = await supabase.from("user_skins").insert({
        user_id: userId,
        skin_id: skinId,
        acquired_from: "admin_gift",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-skins"] });
      toast.success("Skin gifted successfully");
      setGiftDialogOpen(false);
      setGiftUserId("");
      setGiftSkinId("");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_skins")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-skins"] });
      toast.success("Skin removed from user");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Skins Management</h1>
            <p className="text-muted-foreground">
              View available skins and manage user skin ownership
            </p>
          </div>
          <Button onClick={() => setGiftDialogOpen(true)}>
            <Gift className="h-4 w-4 mr-2" />
            Gift Skin
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Skins</p>
                  <p className="text-2xl font-bold">{availableSkins.length}</p>
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
                  <p className="text-sm text-muted-foreground">Total Owned</p>
                  <p className="text-2xl font-bold">{userSkins?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Gift className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gifted</p>
                  <p className="text-2xl font-bold">
                    {userSkins?.filter(s => s.acquired_from === "admin_gift").length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Skins Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Available Skins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {availableSkins.map((skin) => (
                <div
                  key={skin.id}
                  className="relative group rounded-lg border bg-card p-4 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => setSelectedSkin(skin.id)}
                >
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-2">
                    <Image className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-center">{skin.name}</p>
                  <p className="text-xs text-muted-foreground text-center">
                    {skinStats?.[skin.id] || 0} owned
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Skins Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Skin Ownership</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Skin</TableHead>
                    <TableHead>Acquired From</TableHead>
                    <TableHead>Equipped</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSkins?.map((skin) => (
                    <TableRow key={skin.id}>
                      <TableCell className="font-mono text-xs">
                        {skin.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {availableSkins.find(s => s.id === skin.skin_id)?.name || skin.skin_id}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs ${
                          skin.acquired_from === "admin_gift"
                            ? "bg-purple-500/20 text-purple-500"
                            : skin.acquired_from === "shop"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-blue-500/20 text-blue-500"
                        }`}>
                          {skin.acquired_from || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {skin.equipped ? (
                          <span className="text-green-500">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(skin.acquired_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Remove this skin from the user?")) {
                              deleteMutation.mutate(skin.id);
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

        {/* Gift Dialog */}
        <Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gift Skin to User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select User</Label>
                <Select value={giftUserId} onValueChange={setGiftUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
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
                <Label>Select Skin</Label>
                <Select value={giftSkinId} onValueChange={setGiftSkinId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a skin" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSkins.map((skin) => (
                      <SelectItem key={skin.id} value={skin.id}>
                        {skin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => giftMutation.mutate({ userId: giftUserId, skinId: giftSkinId })}
                disabled={!giftUserId || !giftSkinId}
                className="w-full"
              >
                Gift Skin
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
