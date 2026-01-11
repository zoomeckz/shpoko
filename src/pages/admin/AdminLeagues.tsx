import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface League {
  id: string;
  name: string;
  tier: number;
  icon: string;
  color: string;
  min_xp_to_promote: number;
}

export default function AdminLeagues() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [leagueDialog, setLeagueDialog] = useState(false);
  const [leagueForm, setLeagueForm] = useState({
    name: "",
    tier: 1,
    icon: "",
    color: "#000000",
    min_xp_to_promote: 0,
  });

  const fetchLeagues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leagues")
      .select("*")
      .order("tier");

    if (error) {
      toast.error("Failed to fetch leagues");
    } else {
      setLeagues(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeagues();
  }, []);

  const handleSave = async () => {
    if (editingLeague) {
      const { error } = await supabase
        .from("leagues")
        .update({
          name: leagueForm.name,
          tier: leagueForm.tier,
          icon: leagueForm.icon,
          color: leagueForm.color,
          min_xp_to_promote: leagueForm.min_xp_to_promote,
        })
        .eq("id", editingLeague.id);

      if (error) {
        toast.error("Failed to update league");
      } else {
        toast.success("League updated");
        setLeagueDialog(false);
        fetchLeagues();
      }
    } else {
      const { error } = await supabase
        .from("leagues")
        .insert({
          name: leagueForm.name,
          tier: leagueForm.tier,
          icon: leagueForm.icon,
          color: leagueForm.color,
          min_xp_to_promote: leagueForm.min_xp_to_promote,
        });

      if (error) {
        toast.error("Failed to create league");
      } else {
        toast.success("League created");
        setLeagueDialog(false);
        fetchLeagues();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this league?")) return;
    const { error } = await supabase.from("leagues").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete league");
    } else {
      toast.success("League deleted");
      fetchLeagues();
    }
  };

  const openCreateDialog = () => {
    setEditingLeague(null);
    setLeagueForm({
      name: "",
      tier: leagues.length + 1,
      icon: "🏆",
      color: "#FFD700",
      min_xp_to_promote: 100,
    });
    setLeagueDialog(true);
  };

  const openEditDialog = (league: League) => {
    setEditingLeague(league);
    setLeagueForm({
      name: league.name,
      tier: league.tier,
      icon: league.icon,
      color: league.color,
      min_xp_to_promote: league.min_xp_to_promote,
    });
    setLeagueDialog(true);
  };

  return (
    <AdminLayout title="League Management">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={fetchLeagues} variant="outline" size="sm" className="mr-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add League
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Leagues ({leagues.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Min XP to Promote</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading leagues...
                    </TableCell>
                  </TableRow>
                ) : leagues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No leagues found
                    </TableCell>
                  </TableRow>
                ) : (
                  leagues.map((league) => (
                    <TableRow key={league.id}>
                      <TableCell>{league.tier}</TableCell>
                      <TableCell className="text-2xl">{league.icon}</TableCell>
                      <TableCell className="font-medium">{league.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded" 
                            style={{ backgroundColor: league.color }}
                          />
                          {league.color}
                        </div>
                      </TableCell>
                      <TableCell>{league.min_xp_to_promote.toLocaleString()} XP</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEditDialog(league)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(league.id)}>
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

      <Dialog open={leagueDialog} onOpenChange={setLeagueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLeague ? "Edit League" : "Create League"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={leagueForm.name}
                onChange={(e) => setLeagueForm({ ...leagueForm, name: e.target.value })}
                placeholder="Bronze League"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Input
                  type="number"
                  value={leagueForm.tier}
                  onChange={(e) => setLeagueForm({ ...leagueForm, tier: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input
                  value={leagueForm.icon}
                  onChange={(e) => setLeagueForm({ ...leagueForm, icon: e.target.value })}
                  placeholder="🏆"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={leagueForm.color}
                    onChange={(e) => setLeagueForm({ ...leagueForm, color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={leagueForm.color}
                    onChange={(e) => setLeagueForm({ ...leagueForm, color: e.target.value })}
                    placeholder="#FFD700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Min XP to Promote</Label>
                <Input
                  type="number"
                  value={leagueForm.min_xp_to_promote}
                  onChange={(e) => setLeagueForm({ ...leagueForm, min_xp_to_promote: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeagueDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
