import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AdventureNode {
  id: string;
  node_number: number;
  lesson_id: string;
  title: string;
  description: string | null;
  xp_reward: number;
  is_dungeon: boolean;
  week_number: number;
}

export interface AdventureProgress {
  id: string;
  user_id: string;
  node_id: string;
  completed: boolean;
  completed_at: string | null;
  attempts: number;
  best_score: number;
}

export interface DungeonRun {
  id: string;
  user_id: string;
  dungeon_node_id: string;
  current_room: number;
  total_rooms: number;
  lives_remaining: number;
  max_lives: number;
  free_skips: number;
  xp_earned: number;
  completed: boolean;
  failed: boolean;
  powerups_collected: string[];
}

export const useAdventure = () => {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<AdventureNode[]>([]);
  const [progress, setProgress] = useState<Record<string, AdventureProgress>>({});
  const [currentDungeonRun, setCurrentDungeonRun] = useState<DungeonRun | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate current week (weeks since a fixed start date)
  const getCurrentWeek = useCallback(() => {
    const startDate = new Date('2024-01-01');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks + 1; // Week 1 starts immediately
  }, []);

  const fetchNodes = useCallback(async () => {
    const currentWeek = getCurrentWeek();
    
    const { data, error } = await supabase
      .from("adventure_nodes")
      .select("*")
      .lte("week_number", currentWeek)
      .order("node_number", { ascending: true });

    if (!error && data) {
      setNodes(data as AdventureNode[]);
    }
  }, [getCurrentWeek]);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setProgress({});
      return;
    }

    const { data, error } = await supabase
      .from("adventure_progress")
      .select("*")
      .eq("user_id", user.id);

    if (!error && data) {
      const progressMap: Record<string, AdventureProgress> = {};
      data.forEach((p) => {
        progressMap[p.node_id] = p as AdventureProgress;
      });
      setProgress(progressMap);
    }
  }, [user?.id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchNodes();
      await fetchProgress();
      setLoading(false);
    };
    loadData();
  }, [fetchNodes, fetchProgress]);

  const isNodeUnlocked = (node: AdventureNode): boolean => {
    // First node is always unlocked
    if (node.node_number === 1) return true;
    
    // Find the previous node
    const prevNode = nodes.find(n => n.node_number === node.node_number - 1);
    if (!prevNode) return false;
    
    // Previous node must be completed
    return progress[prevNode.id]?.completed === true;
  };

  const isNodeCompleted = (nodeId: string): boolean => {
    return progress[nodeId]?.completed === true;
  };

  const completeNode = async (nodeId: string, score: number): Promise<boolean> => {
    if (!user?.id) return false;

    const existing = progress[nodeId];
    
    if (existing) {
      // Update existing progress
      const { error } = await supabase
        .from("adventure_progress")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          attempts: existing.attempts + 1,
          best_score: Math.max(existing.best_score, score),
        })
        .eq("id", existing.id);

      if (!error) {
        await fetchProgress();
        return true;
      }
    } else {
      // Create new progress
      const { error } = await supabase
        .from("adventure_progress")
        .insert({
          user_id: user.id,
          node_id: nodeId,
          completed: true,
          completed_at: new Date().toISOString(),
          attempts: 1,
          best_score: score,
        });

      if (!error) {
        await fetchProgress();
        return true;
      }
    }
    
    return false;
  };

  // Dungeon functions
  const startDungeonRun = async (dungeonNodeId: string): Promise<DungeonRun | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("dungeon_runs")
      .insert({
        user_id: user.id,
        dungeon_node_id: dungeonNodeId,
        current_room: 1,
        total_rooms: 5,
        lives_remaining: 3,
        max_lives: 3,
        free_skips: 0,
        xp_earned: 0,
      })
      .select()
      .single();

    if (!error && data) {
      const run = data as DungeonRun;
      setCurrentDungeonRun(run);
      return run;
    }
    return null;
  };

  const updateDungeonRun = async (updates: Partial<DungeonRun>): Promise<boolean> => {
    if (!currentDungeonRun) return false;

    const { error } = await supabase
      .from("dungeon_runs")
      .update(updates)
      .eq("id", currentDungeonRun.id);

    if (!error) {
      setCurrentDungeonRun({ ...currentDungeonRun, ...updates });
      return true;
    }
    return false;
  };

  const collectPowerup = async (powerup: string): Promise<boolean> => {
    if (!currentDungeonRun) return false;

    const newPowerups = [...currentDungeonRun.powerups_collected, powerup];
    let updates: Partial<DungeonRun> = { powerups_collected: newPowerups };

    // Apply powerup effects
    switch (powerup) {
      case "extra_life":
        updates.max_lives = currentDungeonRun.max_lives + 1;
        updates.lives_remaining = currentDungeonRun.lives_remaining + 1;
        break;
      case "free_skip":
        updates.free_skips = currentDungeonRun.free_skips + 1;
        break;
      case "xp_boost":
        // Will be applied at end
        break;
    }

    return updateDungeonRun(updates);
  };

  const advanceRoom = async (correct: boolean, xpGained: number): Promise<boolean> => {
    if (!currentDungeonRun) return false;

    let updates: Partial<DungeonRun> = {
      xp_earned: currentDungeonRun.xp_earned + xpGained,
    };

    if (!correct) {
      updates.lives_remaining = currentDungeonRun.lives_remaining - 1;
      if (updates.lives_remaining <= 0) {
        updates.failed = true;
      }
    }

    if (correct && currentDungeonRun.current_room >= currentDungeonRun.total_rooms) {
      updates.completed = true;
    } else if (correct) {
      updates.current_room = currentDungeonRun.current_room + 1;
    }

    return updateDungeonRun(updates);
  };

  const useSkip = async (): Promise<boolean> => {
    if (!currentDungeonRun || currentDungeonRun.free_skips <= 0) return false;

    return updateDungeonRun({
      free_skips: currentDungeonRun.free_skips - 1,
      current_room: currentDungeonRun.current_room + 1,
    });
  };

  return {
    nodes,
    progress,
    loading,
    currentDungeonRun,
    getCurrentWeek,
    isNodeUnlocked,
    isNodeCompleted,
    completeNode,
    startDungeonRun,
    updateDungeonRun,
    collectPowerup,
    advanceRoom,
    useSkip,
    refetch: () => {
      fetchNodes();
      fetchProgress();
    },
  };
};
