import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BADGES, Badge, getBadgeById } from "@/data/badges";
import { useToast } from "@/hooks/use-toast";

interface DeepDiveCompletion {
  id: string;
  deep_dive_id: string;
  lesson_id: string;
  completed_at: string;
  xp_earned: number;
  badge_earned: string | null;
  skin_earned: string | null;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  source: string;
}

export const useDeepDiveProgress = () => {
  const { user, updateXP } = useAuth();
  const { toast } = useToast();
  const [completedDeepDives, setCompletedDeepDives] = useState<DeepDiveCompletion[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch progress on mount
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      const [deepDiveRes, badgeRes] = await Promise.all([
        supabase
          .from("deep_dive_progress")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", user.id),
      ]);

      if (deepDiveRes.data) {
        setCompletedDeepDives(deepDiveRes.data);
      }
      if (badgeRes.data) {
        setEarnedBadges(badgeRes.data);
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user?.id]);

  // Complete a deep-dive
  const completeDeepDive = useCallback(async (
    deepDiveId: string,
    lessonId: string,
    xpReward: number,
    badgeReward?: string,
    skinReward?: string
  ) => {
    if (!user?.id) return { success: false, newBadges: [] };

    // Check if already completed
    const existing = completedDeepDives.find(d => d.deep_dive_id === deepDiveId);
    if (existing) {
      return { success: true, newBadges: [], alreadyCompleted: true };
    }

    // Insert completion record
    const { error } = await supabase
      .from("deep_dive_progress")
      .insert({
        user_id: user.id,
        deep_dive_id: deepDiveId,
        lesson_id: lessonId,
        xp_earned: xpReward,
        badge_earned: badgeReward || null,
        skin_earned: skinReward || null,
      });

    if (error) {
      console.error("Error completing deep-dive:", error);
      return { success: false, newBadges: [] };
    }

    // Award XP
    await updateXP(xpReward);

    // Award badges
    const newBadges: Badge[] = [];

    // Award specific badge from deep-dive
    if (badgeReward) {
      await awardBadge(badgeReward, "deep-dive");
      const badge = getBadgeById(badgeReward);
      if (badge) newBadges.push(badge);
    }

    // Check for milestone badges
    const newCount = completedDeepDives.length + 1;
    
    if (newCount === 1) {
      await awardBadge("first-deep-dive", "milestone");
      const badge = getBadgeById("first-deep-dive");
      if (badge) newBadges.push(badge);
    }
    if (newCount === 10) {
      await awardBadge("deep-dive-10", "milestone");
      const badge = getBadgeById("deep-dive-10");
      if (badge) newBadges.push(badge);
    }
    if (newCount === 25) {
      await awardBadge("deep-dive-25", "milestone");
      const badge = getBadgeById("deep-dive-25");
      if (badge) newBadges.push(badge);
    }
    if (newCount === 50) {
      await awardBadge("deep-dive-50", "milestone");
      const badge = getBadgeById("deep-dive-50");
      if (badge) newBadges.push(badge);
    }

    // Refresh data
    setCompletedDeepDives(prev => [...prev, {
      id: crypto.randomUUID(),
      deep_dive_id: deepDiveId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      xp_earned: xpReward,
      badge_earned: badgeReward || null,
      skin_earned: skinReward || null,
    }]);

    // Show toast for new badges
    newBadges.forEach(badge => {
      toast({
        title: `🏆 Badge Earned: ${badge.name}`,
        description: badge.description,
      });
    });

    return { success: true, newBadges };
  }, [user?.id, completedDeepDives, updateXP, toast]);

  // Award a badge
  const awardBadge = async (badgeId: string, source: string) => {
    if (!user?.id) return false;

    // Check if already earned
    const existing = earnedBadges.find(b => b.badge_id === badgeId);
    if (existing) return false;

    const { error } = await supabase
      .from("user_badges")
      .insert({
        user_id: user.id,
        badge_id: badgeId,
        source,
      });

    if (!error) {
      setEarnedBadges(prev => [...prev, {
        id: crypto.randomUUID(),
        badge_id: badgeId,
        earned_at: new Date().toISOString(),
        source,
      }]);
      return true;
    }
    return false;
  };

  // Check if deep-dive is completed
  const isCompleted = useCallback((deepDiveId: string) => {
    return completedDeepDives.some(d => d.deep_dive_id === deepDiveId);
  }, [completedDeepDives]);

  // Check if badge is earned
  const hasBadge = useCallback((badgeId: string) => {
    return earnedBadges.some(b => b.badge_id === badgeId);
  }, [earnedBadges]);

  // Get all earned badges with full details
  const getEarnedBadges = useCallback((): Badge[] => {
    return earnedBadges
      .map(ub => getBadgeById(ub.badge_id))
      .filter((b): b is Badge => b !== undefined);
  }, [earnedBadges]);

  return {
    completedDeepDives,
    earnedBadges,
    loading,
    completeDeepDive,
    isCompleted,
    hasBadge,
    getEarnedBadges,
    totalCompleted: completedDeepDives.length,
  };
};
