import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Quest {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  xp_reward: number;
  target_count: number;
  action_type: string;
}

interface UserQuest {
  id: string;
  quest_id: string;
  current_count: number;
  completed: boolean;
  completed_at: string | null;
  expires_at: string;
  quest: Quest;
}

export const useQuests = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<UserQuest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuests = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Get available quests
      const { data: availableQuests, error: questsError } = await supabase
        .from("quests")
        .select("*")
        .eq("is_active", true);

      if (questsError) throw questsError;

      // Get user's current quests
      const now = new Date();
      const { data: userQuests, error: userQuestsError } = await supabase
        .from("user_quests")
        .select("*, quest:quests(*)")
        .eq("user_id", user.id)
        .gte("expires_at", now.toISOString());

      if (userQuestsError) throw userQuestsError;

      // If user doesn't have quests assigned, assign them
      if (!userQuests || userQuests.length === 0) {
        const dailyQuests = availableQuests?.filter(q => q.type === "daily") || [];
        const weeklyQuests = availableQuests?.filter(q => q.type === "weekly") || [];

        const toAssign = [
          ...dailyQuests.slice(0, 3),
          ...weeklyQuests.slice(0, 2),
        ];

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        
        const endOfWeek = new Date(startOfDay);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const newUserQuests = toAssign.map(quest => ({
          user_id: user.id,
          quest_id: quest.id,
          current_count: 0,
          completed: false,
          expires_at: quest.type === "daily" ? endOfDay.toISOString() : endOfWeek.toISOString(),
        }));

        const { data: inserted, error: insertError } = await supabase
          .from("user_quests")
          .insert(newUserQuests)
          .select("*, quest:quests(*)");

        if (insertError) throw insertError;
        
        setQuests(inserted as unknown as UserQuest[]);
      } else {
        setQuests(userQuests as unknown as UserQuest[]);
      }
    } catch (error) {
      console.error("Error fetching quests:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const updateQuestProgress = useCallback(async (actionType: string, amount: number = 1) => {
    if (!user) return;

    const relevantQuests = quests.filter(
      q => q.quest.action_type === actionType && !q.completed
    );

    for (const userQuest of relevantQuests) {
      const newCount = userQuest.current_count + amount;
      const completed = newCount >= userQuest.quest.target_count;

      const { error } = await supabase
        .from("user_quests")
        .update({
          current_count: newCount,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", userQuest.id);

      if (!error) {
        setQuests(prev => prev.map(q => 
          q.id === userQuest.id 
            ? { ...q, current_count: newCount, completed }
            : q
        ));

        // Award XP if completed
        if (completed) {
          await supabase
            .from("profiles")
            .update({ xp: (await supabase.from("profiles").select("xp").eq("id", user.id).single()).data?.xp! + userQuest.quest.xp_reward })
            .eq("id", user.id);
        }
      }
    }
  }, [user, quests]);

  const dailyQuests = quests.filter(q => q.quest.type === "daily");
  const weeklyQuests = quests.filter(q => q.quest.type === "weekly");

  return {
    quests,
    dailyQuests,
    weeklyQuests,
    loading,
    updateQuestProgress,
    refetch: fetchQuests,
  };
};
