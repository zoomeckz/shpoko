import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare, Clock, ChevronUp, ChevronDown, Trash2, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForum, ForumThread as ThreadType, ForumPost } from "@/hooks/useForum";
import { useToast } from "@/hooks/use-toast";

import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";

const ForumThreadPage = () => {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();
  const { getThread, getPostsForThread, createPost, vote, deleteThread, deletePost } = useForum();
  const { toast } = useToast();

  const [thread, setThread] = useState<ThreadType | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!threadId) return;
    
    const threadData = await getThread(threadId);
    setThread(threadData);
    
    const postList = await getPostsForThread(threadId);
    setPosts(postList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [threadId]);

  const handleSubmitReply = async () => {
    if (!threadId || !replyContent.trim()) {
      toast({ title: "Error", description: "Please enter a reply", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const post = await createPost(threadId, replyContent);
    if (post) {
      await loadData();
      setReplyContent("");
      toast({ title: "Posted", description: "Reply posted successfully!" });
    } else {
      toast({ title: "Error", description: "Failed to post reply", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleVoteThread = async (voteType: 1 | -1) => {
    if (!user) {
      toast({ title: "Sign in", description: "Please sign in to vote", variant: "destructive" });
      return;
    }
    await vote("thread", threadId!, voteType);
    loadData();
  };

  const handleVotePost = async (postId: string, voteType: 1 | -1) => {
    if (!user) {
      toast({ title: "Sign in", description: "Please sign in to vote", variant: "destructive" });
      return;
    }
    await vote("post", postId, voteType);
    loadData();
  };

  const handleDeleteThread = async () => {
    if (confirm("Delete this thread and all replies?")) {
      const success = await deleteThread(threadId!);
      if (success) {
        toast({ title: "Deleted", description: "Thread deleted" });
        navigate(-1);
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Delete this reply?")) {
      const success = await deletePost(postId);
      if (success) {
        loadData();
        toast({ title: "Deleted", description: "Reply deleted" });
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Button variant="ghost" onClick={() => navigate("/forum")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-center mt-8">Thread not found</p>
      </div>
    );
  }

  const isThreadOwner = thread.user_id === user?.id;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Thread */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Vote buttons */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${thread.user_vote === 1 ? "text-primary" : ""}`}
                  onClick={() => handleVoteThread(1)}
                >
                  <ChevronUp className="w-5 h-5" />
                </Button>
                <span className="text-lg font-bold">{thread.vote_count || 0}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${thread.user_vote === -1 ? "text-destructive" : ""}`}
                  onClick={() => handleVoteThread(-1)}
                >
                  <ChevronDown className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🦝</span>
                    <span>{thread.author_username}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <p className="whitespace-pre-wrap">{thread.content}</p>

                {isThreadOwner && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={handleDeleteThread}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Thread
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Replies */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {posts.length} {posts.length === 1 ? "Reply" : "Replies"}
          </h2>

          {posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => {
                const isPostOwner = post.user_id === user?.id;
                return (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Vote buttons */}
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-6 w-6 ${post.user_vote === 1 ? "text-primary" : ""}`}
                            onClick={() => handleVotePost(post.id, 1)}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium">{post.vote_count || 0}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-6 w-6 ${post.user_vote === -1 ? "text-destructive" : ""}`}
                            onClick={() => handleVotePost(post.id, -1)}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="text-lg">🦝</span>
                              <span>{post.author_username}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                            </div>
                            {isPostOwner && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap">{post.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Reply box */}
        {user ? (
          <Card className="p-4">
            <div className="space-y-4">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={4}
              />
              <Button
                className="w-full"
                onClick={handleSubmitReply}
                disabled={submitting || !replyContent.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Sign in to reply to this thread</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ForumThreadPage;
