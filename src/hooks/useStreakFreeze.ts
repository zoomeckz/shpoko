import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StreakFreezeTransaction {
  id: string;
  amount: number;
  transaction_type: "purchase" | "earned" | "used" | "expired";
  xp_cost: number | null;
  created_at: string;
}

const FREEZE_COST_XP = 200;
const MAX_FREEZES = 5;

export const useStreakFreeze = () => {
  const { user, profile, updateXP } = useAuth();
  const [freezeCount, setFreezeCount] = useState(0);
  const [transactions, setTransactions] = useState<StreakFreezeTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFreezeData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get current freeze count from profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("streak_freezes")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setFreezeCount(profileData?.streak_freezes || 0);

      // Get transaction history
      const { data: txData, error: txError } = await supabase
        .from("streak_freeze_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (txError) throw txError;
      setTransactions(txData as StreakFreezeTransaction[]);
    } catch (error) {
      console.error("Error fetching freeze data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFreezeData();
  }, [fetchFreezeData]);

  const purchaseFreeze = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user || !profile) {
      return { success: false, error: "Not authenticated" };
    }

    if (freezeCount >= MAX_FREEZES) {
      return { success: false, error: `Maximum ${MAX_FREEZES} freezes allowed` };
    }

    if (profile.xp < FREEZE_COST_XP) {
      return { success: false, error: `Need ${FREEZE_COST_XP} XP to purchase` };
    }

    try {
      // Deduct XP
      const { error: xpError } = await supabase
        .from("profiles")
        .update({
          xp: profile.xp - FREEZE_COST_XP,
          streak_freezes: freezeCount + 1,
        })
        .eq("id", user.id);

      if (xpError) throw xpError;

      // Log transaction
      const { error: txError } = await supabase
        .from("streak_freeze_transactions")
        .insert({
          user_id: user.id,
          amount: 1,
          transaction_type: "purchase",
          xp_cost: FREEZE_COST_XP,
        });

      if (txError) throw txError;

      await fetchFreezeData();
      return { success: true };
    } catch (error) {
      console.error("Error purchasing freeze:", error);
      return { success: false, error: "Failed to purchase freeze" };
    }
  };

  const useFreeze = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    if (freezeCount <= 0) {
      return { success: false, error: "No freezes available" };
    }

    try {
      // Use freeze
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          streak_freezes: freezeCount - 1,
          streak_freeze_used_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Log transaction
      const { error: txError } = await supabase
        .from("streak_freeze_transactions")
        .insert({
          user_id: user.id,
          amount: -1,
          transaction_type: "used",
          xp_cost: null,
        });

      if (txError) throw txError;

      await fetchFreezeData();
      return { success: true };
    } catch (error) {
      console.error("Error using freeze:", error);
      return { success: false, error: "Failed to use freeze" };
    }
  };

  const earnFreeze = async (reason: string = "challenge"): Promise<boolean> => {
    if (!user) return false;

    if (freezeCount >= MAX_FREEZES) return false;

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ streak_freezes: freezeCount + 1 })
        .eq("id", user.id);

      if (updateError) throw updateError;

      const { error: txError } = await supabase
        .from("streak_freeze_transactions")
        .insert({
          user_id: user.id,
          amount: 1,
          transaction_type: "earned",
          xp_cost: null,
        });

      if (txError) throw txError;

      await fetchFreezeData();
      return true;
    } catch (error) {
      console.error("Error earning freeze:", error);
      return false;
    }
  };

  return {
    freezeCount,
    transactions,
    loading,
    purchaseFreeze,
    useFreeze,
    earnFreeze,
    refetch: fetchFreezeData,
    freezeCostXP: FREEZE_COST_XP,
    maxFreezes: MAX_FREEZES,
    canPurchase: (profile?.xp || 0) >= FREEZE_COST_XP && freezeCount < MAX_FREEZES,
  };
};
