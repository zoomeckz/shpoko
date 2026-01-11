import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MessageSquare, Folder, Lock, Pin, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  category_id: string;
  user_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
}

export default function AdminForum() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categories");
  
  // Category dialog
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", icon: "", display_order: 0 });

  const fetchData = async () => {
    setLoading(true);
    const [categoriesRes, threadsRes] = await Promise.all([
      supabase.from("forum_categories").select("*").order("display_order"),
      supabase.from("forum_threads").select("*").order("created_at", { ascending: false }).limit(100),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (threadsRes.data) setThreads(threadsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCategory = async () => {
    if (editingCategory) {
      const { error } = await supabase
        .from("forum_categories")
        .update({
          name: categoryForm.name,
          description: categoryForm.description || null,
          icon: categoryForm.icon || null,
          display_order: categoryForm.display_order,
        })
        .eq("id", editingCategory.id);
      
      if (error) {
        toast.error("Failed to update category");
      } else {
        toast.success("Category updated");
        setCategoryDialog(false);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from("forum_categories")
        .insert({
          name: categoryForm.name,
          description: categoryForm.description || null,
          icon: categoryForm.icon || null,
          display_order: categoryForm.display_order,
        });
      
      if (error) {
        toast.error("Failed to create category");
      } else {
        toast.success("Category created");
        setCategoryDialog(false);
        fetchData();
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category and all its threads?")) return;
    const { error } = await supabase.from("forum_categories").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete category");
    } else {
      toast.success("Category deleted");
      fetchData();
    }
  };

  const handleTogglePin = async (thread: ForumThread) => {
    const { error } = await supabase
      .from("forum_threads")
      .update({ is_pinned: !thread.is_pinned })
      .eq("id", thread.id);
    
    if (error) {
      toast.error("Failed to update thread");
    } else {
      toast.success(thread.is_pinned ? "Thread unpinned" : "Thread pinned");
      fetchData();
    }
  };

  const handleToggleLock = async (thread: ForumThread) => {
    const { error } = await supabase
      .from("forum_threads")
      .update({ is_locked: !thread.is_locked })
      .eq("id", thread.id);
    
    if (error) {
      toast.error("Failed to update thread");
    } else {
      toast.success(thread.is_locked ? "Thread unlocked" : "Thread locked");
      fetchData();
    }
  };

  const handleDeleteThread = async (id: string) => {
    if (!confirm("Delete this thread and all its replies?")) return;
    const { error } = await supabase.from("forum_threads").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete thread");
    } else {
      toast.success("Thread deleted");
      fetchData();
    }
  };

  return (
    <AdminLayout title="Forum Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="categories" className="gap-2">
                <Folder className="h-4 w-4" /> Categories ({categories.length})
              </TabsTrigger>
              <TabsTrigger value="threads" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Threads ({threads.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Categories</CardTitle>
                <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: "", description: "", icon: "", display_order: categories.length }); setCategoryDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Category
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Threads</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.display_order}</TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{category.description || "-"}</TableCell>
                        <TableCell>{threads.filter(t => t.category_id === category.id).length}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingCategory(category); setCategoryForm({ name: category.name, description: category.description || "", icon: category.icon || "", display_order: category.display_order }); setCategoryDialog(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threads">
            <Card>
              <CardHeader>
                <CardTitle>Threads</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Replies</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {threads.map((thread) => (
                      <TableRow key={thread.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{thread.title}</TableCell>
                        <TableCell>{categories.find(c => c.id === thread.category_id)?.name || "Unknown"}</TableCell>
                        <TableCell>{thread.view_count}</TableCell>
                        <TableCell>{thread.reply_count}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {thread.is_pinned && <Badge className="bg-blue-500/20 text-blue-500"><Pin className="h-3 w-3" /></Badge>}
                            {thread.is_locked && <Badge className="bg-red-500/20 text-red-500"><Lock className="h-3 w-3" /></Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleTogglePin(thread)} title={thread.is_pinned ? "Unpin" : "Pin"}>
                              <Pin className={`h-4 w-4 ${thread.is_pinned ? "text-blue-500" : ""}`} />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleToggleLock(thread)} title={thread.is_locked ? "Unlock" : "Lock"}>
                              <Lock className={`h-4 w-4 ${thread.is_locked ? "text-red-500" : ""}`} />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteThread(thread.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input value={categoryForm.icon} onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })} placeholder="📚" />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={categoryForm.display_order} onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
