import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, MessageSquare, Eye, Clock, Pin, Lock, ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForum, ForumCategory as CategoryType, ForumThread } from "@/hooks/useForum";
import { useToast } from "@/hooks/use-toast";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { formatDistanceToNow } from "date-fns";

const ForumCategoryPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user } = useAuth();
  const { categories, getThreadsForCategory, createThread, vote } = useForum();
  const { toast } = useToast();

  const [category, setCategory] = useState<CategoryType | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", content: "" });

  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) return;
      
      const cat = categories.find(c => c.id === categoryId);
      setCategory(cat || null);
      
      const threadList = await getThreadsForCategory(categoryId);
      setThreads(threadList);
      setLoading(false);
    };

    if (categories.length > 0) {
      loadData();
    }
  }, [categoryId, categories, getThreadsForCategory]);

  const handleCreateThread = async () => {
    if (!categoryId || !newThread.title.trim() || !newThread.content.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const thread = await createThread(categoryId, newThread.title, newThread.content);
    if (thread) {
      setThreads([thread, ...threads]);
      setNewThread({ title: "", content: "" });
      setIsCreateOpen(false);
      toast({ title: "Posted", description: "Thread created successfully!" });
      navigate(`/forum/thread/${thread.id}`);
    } else {
      toast({ title: "Error", description: "Failed to create thread", variant: "destructive" });
    }
  };

  const handleVote = async (threadId: string, voteType: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign in", description: "Please sign in to vote", variant: "destructive" });
      return;
    }

    await vote("thread", threadId, voteType);
    // Refresh threads
    const threadList = await getThreadsForCategory(categoryId!);
    setThreads(threadList);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/forum")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{category?.name || "Category"}</h1>
              <p className="text-sm text-muted-foreground">{category?.description}</p>
            </div>
          </div>
          {user && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Thread
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Thread</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newThread.title}
                      onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                      placeholder="What's your question or topic?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newThread.content}
                      onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                      placeholder="Describe your topic in detail..."
                      rows={6}
                    />
                  </div>
                  <Button className="w-full" onClick={handleCreateThread}>
                    Post Thread
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {threads.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No threads yet. Be the first to start a discussion!</p>
            {user && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Thread
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-2">
            {threads.map((thread) => (
              <Card
                key={thread.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/forum/thread/${thread.id}`)}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${thread.user_vote === 1 ? "text-primary" : ""}`}
                      onClick={(e) => handleVote(thread.id, 1, e)}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">{thread.vote_count || 0}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${thread.user_vote === -1 ? "text-destructive" : ""}`}
                      onClick={(e) => handleVote(thread.id, -1, e)}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {thread.is_pinned && <Pin className="w-4 h-4 text-primary" />}
                      {thread.is_locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      <h3 className="font-semibold truncate">{thread.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {thread.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ShpokoMascot size="xs" />
                        <span>{thread.author_username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{thread.reply_count} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{thread.view_count} views</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumCategoryPage;
