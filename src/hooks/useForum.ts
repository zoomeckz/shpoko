import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  language: string;
  icon: string;
  display_order: number;
  created_at: string;
  thread_count?: number;
}

export interface ForumThread {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at: string | null;
  last_reply_user_id: string | null;
  created_at: string;
  updated_at: string;
  author_username?: string;
  author_profile_picture?: string;
  vote_count?: number;
  user_vote?: number;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  author_username?: string;
  author_profile_picture?: string;
  vote_count?: number;
  user_vote?: number;
}

export const useForum = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forum_categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setCategories(data as ForumCategory[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getThreadsForCategory = async (categoryId: string): Promise<ForumThread[]> => {
    const { data: threads, error } = await supabase
      .from("forum_threads")
      .select("*")
      .eq("category_id", categoryId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !threads) return [];

    // Fetch author info for each thread
    const userIds = [...new Set(threads.map(t => t.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, profile_picture")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Fetch vote counts
    const threadIds = threads.map(t => t.id);
    const { data: votes } = await supabase
      .from("forum_votes")
      .select("thread_id, vote_type")
      .in("thread_id", threadIds);

    const voteMap = new Map<string, number>();
    votes?.forEach(v => {
      if (v.thread_id) {
        voteMap.set(v.thread_id, (voteMap.get(v.thread_id) || 0) + v.vote_type);
      }
    });

    // Fetch user votes if logged in
    let userVoteMap = new Map<string, number>();
    if (user?.id) {
      const { data: userVotes } = await supabase
        .from("forum_votes")
        .select("thread_id, vote_type")
        .eq("user_id", user.id)
        .in("thread_id", threadIds);

      userVotes?.forEach(v => {
        if (v.thread_id) userVoteMap.set(v.thread_id, v.vote_type);
      });
    }

    return threads.map(t => ({
      ...t,
      author_username: profileMap.get(t.user_id)?.username || "Unknown",
      author_profile_picture: profileMap.get(t.user_id)?.profile_picture || "happy",
      vote_count: voteMap.get(t.id) || 0,
      user_vote: userVoteMap.get(t.id) || 0,
    })) as ForumThread[];
  };

  const getThread = async (threadId: string): Promise<ForumThread | null> => {
    const { data: thread, error } = await supabase
      .from("forum_threads")
      .select("*")
      .eq("id", threadId)
      .single();

    if (error || !thread) return null;

    // Increment view count
    await supabase
      .from("forum_threads")
      .update({ view_count: (thread.view_count || 0) + 1 })
      .eq("id", threadId);

    // Fetch author info
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, profile_picture")
      .eq("id", thread.user_id)
      .single();

    // Fetch vote count
    const { data: votes } = await supabase
      .from("forum_votes")
      .select("vote_type")
      .eq("thread_id", threadId);

    const voteCount = votes?.reduce((sum, v) => sum + v.vote_type, 0) || 0;

    // Fetch user vote
    let userVote = 0;
    if (user?.id) {
      const { data: uv } = await supabase
        .from("forum_votes")
        .select("vote_type")
        .eq("user_id", user.id)
        .eq("thread_id", threadId)
        .single();
      userVote = uv?.vote_type || 0;
    }

    return {
      ...thread,
      author_username: profile?.username || "Unknown",
      author_profile_picture: profile?.profile_picture || "happy",
      vote_count: voteCount,
      user_vote: userVote,
    } as ForumThread;
  };

  const getPostsForThread = async (threadId: string): Promise<ForumPost[]> => {
    const { data: posts, error } = await supabase
      .from("forum_posts")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error || !posts) return [];

    // Fetch author info
    const userIds = [...new Set(posts.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, profile_picture")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Fetch vote counts
    const postIds = posts.map(p => p.id);
    const { data: votes } = await supabase
      .from("forum_votes")
      .select("post_id, vote_type")
      .in("post_id", postIds);

    const voteMap = new Map<string, number>();
    votes?.forEach(v => {
      if (v.post_id) {
        voteMap.set(v.post_id, (voteMap.get(v.post_id) || 0) + v.vote_type);
      }
    });

    // Fetch user votes if logged in
    let userVoteMap = new Map<string, number>();
    if (user?.id) {
      const { data: userVotes } = await supabase
        .from("forum_votes")
        .select("post_id, vote_type")
        .eq("user_id", user.id)
        .in("post_id", postIds);

      userVotes?.forEach(v => {
        if (v.post_id) userVoteMap.set(v.post_id, v.vote_type);
      });
    }

    return posts.map(p => ({
      ...p,
      author_username: profileMap.get(p.user_id)?.username || "Unknown",
      author_profile_picture: profileMap.get(p.user_id)?.profile_picture || "happy",
      vote_count: voteMap.get(p.id) || 0,
      user_vote: userVoteMap.get(p.id) || 0,
    })) as ForumPost[];
  };

  const createThread = async (
    categoryId: string,
    title: string,
    content: string
  ): Promise<ForumThread | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("forum_threads")
      .insert({
        category_id: categoryId,
        user_id: user.id,
        title,
        content,
      })
      .select()
      .single();

    if (!error && data) {
      return data as ForumThread;
    }
    return null;
  };

  const createPost = async (
    threadId: string,
    content: string
  ): Promise<ForumPost | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("forum_posts")
      .insert({
        thread_id: threadId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (!error && data) {
      // Update thread reply count
      const { data: thread } = await supabase
        .from("forum_threads")
        .select("reply_count")
        .eq("id", threadId)
        .single();

      await supabase
        .from("forum_threads")
        .update({
          reply_count: (thread?.reply_count || 0) + 1,
          last_reply_at: new Date().toISOString(),
          last_reply_user_id: user.id,
        })
        .eq("id", threadId);

      return data as ForumPost;
    }
    return null;
  };

  const vote = async (
    targetType: "thread" | "post",
    targetId: string,
    voteType: 1 | -1
  ): Promise<boolean> => {
    if (!user?.id) return false;

    const column = targetType === "thread" ? "thread_id" : "post_id";
    
    // Check existing vote
    const { data: existing } = await supabase
      .from("forum_votes")
      .select("id, vote_type")
      .eq("user_id", user.id)
      .eq(column, targetId)
      .single();

    if (existing) {
      if (existing.vote_type === voteType) {
        // Remove vote
        await supabase.from("forum_votes").delete().eq("id", existing.id);
      } else {
        // Change vote
        await supabase.from("forum_votes").update({ vote_type: voteType }).eq("id", existing.id);
      }
    } else {
      // Add new vote
      await supabase.from("forum_votes").insert({
        user_id: user.id,
        [column]: targetId,
        vote_type: voteType,
      });
    }

    return true;
  };

  const deleteThread = async (threadId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("forum_threads")
      .delete()
      .eq("id", threadId);

    return !error;
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("forum_posts")
      .delete()
      .eq("id", postId);

    return !error;
  };

  return {
    categories,
    loading,
    fetchCategories,
    getThreadsForCategory,
    getThread,
    getPostsForThread,
    createThread,
    createPost,
    vote,
    deleteThread,
    deletePost,
  };
};
