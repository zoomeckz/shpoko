import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Friend {
  id: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
  profile_picture: string | null;
  is_premium: boolean;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  friend?: Friend;
}

interface FriendMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  message_type: "encouragement" | "challenge" | "celebration";
  read: boolean;
  created_at: string;
  sender?: Friend;
}

const ENCOURAGEMENT_MESSAGES = [
  "Keep up the great work! 🌟",
  "You're doing amazing! 💪",
  "Don't give up, you've got this! 🔥",
  "Proud of your progress! 🏆",
  "Let's learn together! 📚",
  "Your dedication inspires me! ⭐",
  "One step at a time! 👏",
  "You're crushing it! 🎉",
];

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [messages, setMessages] = useState<FriendMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all friendships
      const { data: friendships, error } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;

      // Get unique user IDs to fetch profiles
      const userIds = new Set<string>();
      friendships?.forEach((f) => {
        userIds.add(f.user_id);
        userIds.add(f.friend_id);
      });
      userIds.delete(user.id);

      // Fetch profiles for friends
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, xp, level, streak, profile_picture, is_premium")
        .in("id", Array.from(userIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      // Categorize friendships
      const accepted: Friendship[] = [];
      const pending: Friendship[] = [];
      const sent: Friendship[] = [];

      friendships?.forEach((f) => {
        const friendId = f.user_id === user.id ? f.friend_id : f.user_id;
        const friendProfile = profileMap.get(friendId);

        const friendship: Friendship = {
          ...f,
          status: f.status as "pending" | "accepted" | "rejected",
          friend: friendProfile as Friend,
        };

        if (f.status === "accepted") {
          accepted.push(friendship);
        } else if (f.status === "pending") {
          if (f.friend_id === user.id) {
            pending.push(friendship);
          } else {
            sent.push(friendship);
          }
        }
      });

      setFriends(accepted);
      setPendingRequests(pending);
      setSentRequests(sent);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("friend_messages")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    // Fetch sender profiles
    const senderIds = [...new Set(data?.map((m) => m.sender_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, xp, level, streak, profile_picture, is_premium")
      .in("id", senderIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const messagesWithSenders = data?.map((m) => ({
      ...m,
      sender: profileMap.get(m.sender_id) as Friend,
    })) as FriendMessage[];

    setMessages(messagesWithSenders || []);
    setUnreadCount(data?.filter((m) => !m.read).length || 0);
  }, [user]);

  useEffect(() => {
    fetchFriends();
    fetchMessages();
  }, [fetchFriends, fetchMessages]);

  const searchUsers = async (query: string): Promise<Friend[]> => {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, xp, level, streak, profile_picture, is_premium")
      .ilike("username", `%${query}%`)
      .neq("id", user?.id || "")
      .limit(10);

    if (error) {
      console.error("Error searching users:", error);
      return [];
    }

    return data as Friend[];
  };

  const sendFriendRequest = async (friendId: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase.from("friendships").insert({
      user_id: user.id,
      friend_id: friendId,
      status: "pending",
    });

    if (error) {
      console.error("Error sending friend request:", error);
      return false;
    }

    await fetchFriends();
    return true;
  };

  const acceptFriendRequest = async (friendshipId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);

    if (error) {
      console.error("Error accepting friend request:", error);
      return false;
    }

    await fetchFriends();
    return true;
  };

  const rejectFriendRequest = async (friendshipId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);

    if (error) {
      console.error("Error rejecting friend request:", error);
      return false;
    }

    await fetchFriends();
    return true;
  };

  const removeFriend = async (friendshipId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);

    if (error) {
      console.error("Error removing friend:", error);
      return false;
    }

    await fetchFriends();
    return true;
  };

  const sendEncouragement = async (
    recipientId: string,
    message?: string,
    type: "encouragement" | "challenge" | "celebration" = "encouragement"
  ): Promise<boolean> => {
    if (!user) return false;

    const finalMessage =
      message ||
      ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];

    const { error } = await supabase.from("friend_messages").insert({
      sender_id: user.id,
      recipient_id: recipientId,
      message: finalMessage,
      message_type: type,
    });

    if (error) {
      console.error("Error sending encouragement:", error);
      return false;
    }

    return true;
  };

  const markMessageAsRead = async (messageId: string): Promise<void> => {
    await supabase
      .from("friend_messages")
      .update({ read: true })
      .eq("id", messageId);

    await fetchMessages();
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!user) return;

    await supabase
      .from("friend_messages")
      .update({ read: true })
      .eq("recipient_id", user.id)
      .eq("read", false);

    await fetchMessages();
  };

  return {
    friends,
    pendingRequests,
    sentRequests,
    messages,
    unreadCount,
    loading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    sendEncouragement,
    markMessageAsRead,
    markAllAsRead,
    refetch: fetchFriends,
    encouragementMessages: ENCOURAGEMENT_MESSAGES,
  };
};
