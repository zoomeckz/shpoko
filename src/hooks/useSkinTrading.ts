import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SHOP_ITEMS, ShopItem } from "@/hooks/useShopItems";

export interface UserSkin {
  id: string;
  user_id: string;
  skin_id: string;
  equipped: boolean;
  acquired_at: string;
  acquired_from: string;
  gifted_by: string | null;
}

export interface SkinTrade {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_skin_id: string | null;
  recipient_skin_id: string | null;
  trade_type: "trade" | "gift";
  status: "pending" | "accepted" | "declined" | "cancelled";
  message: string | null;
  created_at: string;
  responded_at: string | null;
  // Joined data
  sender_profile?: { username: string; profile_picture: string | null };
  recipient_profile?: { username: string; profile_picture: string | null };
}

export interface FriendWithSkins {
  id: string;
  username: string;
  profile_picture: string | null;
  skins: UserSkin[];
}

export const useSkinTrading = () => {
  const { user } = useAuth();
  const [userSkins, setUserSkins] = useState<UserSkin[]>([]);
  const [pendingTrades, setPendingTrades] = useState<SkinTrade[]>([]);
  const [friendsWithSkins, setFriendsWithSkins] = useState<FriendWithSkins[]>([]);
  const [loading, setLoading] = useState(false);
  const [incomingTradeCount, setIncomingTradeCount] = useState(0);

  // Fetch user's skins from database
  const fetchUserSkins = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_skins")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching user skins:", error);
      return;
    }

    setUserSkins(data || []);
  }, [user]);

  // Fetch pending trades
  const fetchPendingTrades = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("skin_trades")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trades:", error);
      return;
    }

    // Fetch profiles for trades
    const trades = data || [];
    const userIds = [...new Set(trades.flatMap(t => [t.sender_id, t.recipient_id]))];
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, profile_picture")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const tradesWithProfiles = trades.map(trade => ({
        ...trade,
        trade_type: trade.trade_type as "trade" | "gift",
        status: trade.status as "pending" | "accepted" | "declined" | "cancelled",
        sender_profile: profileMap.get(trade.sender_id),
        recipient_profile: profileMap.get(trade.recipient_id),
      }));

      setPendingTrades(tradesWithProfiles);
      // Count incoming trades (where user is recipient)
      setIncomingTradeCount(tradesWithProfiles.filter(t => t.recipient_id === user.id).length);
    } else {
      setPendingTrades([]);
      setIncomingTradeCount(0);
    }
  }, [user]);

  // Fetch friends with their skins
  const fetchFriendsWithSkins = useCallback(async () => {
    if (!user) return;

    // Get accepted friendships
    const { data: friendships, error: friendError } = await supabase
      .from("friendships")
      .select("user_id, friend_id")
      .eq("status", "accepted")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (friendError) {
      console.error("Error fetching friendships:", friendError);
      return;
    }

    // Extract friend IDs
    const friendIds = friendships?.map(f => 
      f.user_id === user.id ? f.friend_id : f.user_id
    ) || [];

    if (friendIds.length === 0) {
      setFriendsWithSkins([]);
      return;
    }

    // Fetch friend profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, profile_picture")
      .in("id", friendIds);

    // Fetch friend skins
    const { data: skins } = await supabase
      .from("user_skins")
      .select("*")
      .in("user_id", friendIds);

    const friendsData: FriendWithSkins[] = (profiles || []).map(profile => ({
      id: profile.id,
      username: profile.username,
      profile_picture: profile.profile_picture,
      skins: (skins || []).filter(s => s.user_id === profile.id),
    }));

    setFriendsWithSkins(friendsData);
  }, [user]);

  // Migrate localStorage skins to database
  const migrateLocalStorageSkins = useCallback(async () => {
    if (!user) return;

    const savedItems = localStorage.getItem(`shop_items_${user.id}`);
    if (!savedItems) return;

    const itemIds = JSON.parse(savedItems) as string[];
    const skinIds = itemIds.filter(id => 
      SHOP_ITEMS.find(item => item.id === id && item.type === "raccoon_skin")
    );

    if (skinIds.length === 0) return;

    // Check which skins are already in database
    const { data: existingSkins } = await supabase
      .from("user_skins")
      .select("skin_id")
      .eq("user_id", user.id);

    const existingIds = new Set(existingSkins?.map(s => s.skin_id) || []);
    const newSkins = skinIds.filter(id => !existingIds.has(id));

    if (newSkins.length === 0) return;

    // Insert new skins
    const skinsToInsert = newSkins.map(skin_id => ({
      user_id: user.id,
      skin_id,
      acquired_from: "purchase",
    }));

    const { error } = await supabase
      .from("user_skins")
      .insert(skinsToInsert);

    if (!error) {
      // Also migrate equipped skin
      const equippedSkin = localStorage.getItem(`equipped_skin_${user.id}`);
      if (equippedSkin && newSkins.includes(equippedSkin)) {
        await supabase
          .from("user_skins")
          .update({ equipped: true })
          .eq("user_id", user.id)
          .eq("skin_id", equippedSkin);
      }
      
      fetchUserSkins();
    }
  }, [user, fetchUserSkins]);

  // Send a gift
  const sendGift = async (recipientId: string, skinId: string, message?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" };

    // Check if user owns the skin
    const ownsSkin = userSkins.some(s => s.skin_id === skinId);
    if (!ownsSkin) return { success: false, error: "You don't own this skin" };

    // Check if there's already a pending trade for this skin
    const hasPendingTrade = pendingTrades.some(
      t => t.sender_id === user.id && t.sender_skin_id === skinId
    );
    if (hasPendingTrade) return { success: false, error: "This skin is already in a pending trade" };

    setLoading(true);
    try {
      const { error } = await supabase
        .from("skin_trades")
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          sender_skin_id: skinId,
          trade_type: "gift",
          message,
        });

      if (error) throw error;

      await fetchPendingTrades();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Propose a trade
  const proposeTrade = async (
    recipientId: string, 
    mySkinId: string, 
    theirSkinId: string, 
    message?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" };

    // Check if user owns their skin
    const ownsSkin = userSkins.some(s => s.skin_id === mySkinId);
    if (!ownsSkin) return { success: false, error: "You don't own this skin" };

    setLoading(true);
    try {
      const { error } = await supabase
        .from("skin_trades")
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          sender_skin_id: mySkinId,
          recipient_skin_id: theirSkinId,
          trade_type: "trade",
          message,
        });

      if (error) throw error;

      await fetchPendingTrades();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Accept a trade/gift
  const acceptTrade = async (tradeId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" };

    const trade = pendingTrades.find(t => t.id === tradeId);
    if (!trade) return { success: false, error: "Trade not found" };
    if (trade.recipient_id !== user.id) return { success: false, error: "You can't accept this trade" };

    setLoading(true);
    try {
      // For gifts: just transfer the skin
      if (trade.trade_type === "gift") {
        // Delete sender's skin
        await supabase
          .from("user_skins")
          .delete()
          .eq("user_id", trade.sender_id)
          .eq("skin_id", trade.sender_skin_id!);

        // Add to recipient
        await supabase
          .from("user_skins")
          .insert({
            user_id: user.id,
            skin_id: trade.sender_skin_id!,
            acquired_from: "gift",
            gifted_by: trade.sender_id,
          });
      } else {
        // For trades: swap skins
        // Delete both skins
        await supabase
          .from("user_skins")
          .delete()
          .eq("user_id", trade.sender_id)
          .eq("skin_id", trade.sender_skin_id!);

        await supabase
          .from("user_skins")
          .delete()
          .eq("user_id", user.id)
          .eq("skin_id", trade.recipient_skin_id!);

        // Add swapped skins
        await supabase
          .from("user_skins")
          .insert([
            {
              user_id: user.id,
              skin_id: trade.sender_skin_id!,
              acquired_from: "trade",
            },
            {
              user_id: trade.sender_id,
              skin_id: trade.recipient_skin_id!,
              acquired_from: "trade",
            },
          ]);
      }

      // Update trade status
      await supabase
        .from("skin_trades")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", tradeId);

      await Promise.all([fetchUserSkins(), fetchPendingTrades()]);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Decline a trade
  const declineTrade = async (tradeId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" };

    setLoading(true);
    try {
      await supabase
        .from("skin_trades")
        .update({ status: "declined", responded_at: new Date().toISOString() })
        .eq("id", tradeId);

      await fetchPendingTrades();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cancel a trade (sender only)
  const cancelTrade = async (tradeId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" };

    setLoading(true);
    try {
      await supabase
        .from("skin_trades")
        .delete()
        .eq("id", tradeId)
        .eq("sender_id", user.id);

      await fetchPendingTrades();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get skin details from ID
  const getSkinDetails = (skinId: string): ShopItem | undefined => {
    return SHOP_ITEMS.find(item => item.id === skinId);
  };

  useEffect(() => {
    if (user) {
      migrateLocalStorageSkins();
      fetchUserSkins();
      fetchPendingTrades();
      fetchFriendsWithSkins();
    }
  }, [user, migrateLocalStorageSkins, fetchUserSkins, fetchPendingTrades, fetchFriendsWithSkins]);

  return {
    userSkins,
    pendingTrades,
    friendsWithSkins,
    loading,
    incomingTradeCount,
    sendGift,
    proposeTrade,
    acceptTrade,
    declineTrade,
    cancelTrade,
    getSkinDetails,
    refreshData: () => {
      fetchUserSkins();
      fetchPendingTrades();
      fetchFriendsWithSkins();
    },
  };
};
