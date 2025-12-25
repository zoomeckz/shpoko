import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RoguelikeNode {
  id: string;
  map_id: string;
  node_type: 'normal' | 'skull' | 'heart' | 'empty' | 'boss' | 'locked' | 'treasure';
  x_position: number;
  y_position: number;
  connected_nodes: string[];
  lesson_id: string | null;
  order_index: number;
}

export interface RoguelikeMap {
  id: string;
  name: string;
  order_index: number;
  background_image: string | null;
  is_boss_map: boolean;
  next_map_ids: string[];
}

export interface RoguelikeProgress {
  id: string;
  user_id: string;
  current_map_id: string | null;
  current_node_id: string | null;
  lives: number;
  moves_today: number;
  last_move_reset: string;
  total_nodes_completed: number;
  maps_completed: string[];
  is_backtracking: boolean;
}

export interface RoguelikeQuestion {
  id: string;
  lesson_id: string;
  question_type: 'choose' | 'fill_blank' | 'reading';
  question_text: string;
  question_text_bg: string | null;
  correct_answer: string;
  options: string[];
  reading_text: string | null;
  word_translations: Record<string, string>;
  time_bonus_seconds: number;
  order_index: number;
}

export interface RoguelikeLesson {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  time_limit_seconds: number;
}

export function useRoguelike() {
  const { user, profile } = useAuth();
  const [currentMap, setCurrentMap] = useState<RoguelikeMap | null>(null);
  const [nodes, setNodes] = useState<RoguelikeNode[]>([]);
  const [progress, setProgress] = useState<RoguelikeProgress | null>(null);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPremium = profile?.is_premium ?? false;
  const maxLives = isPremium ? 5 : 3;
  const livesRegenPerDay = isPremium ? 2 : 1;

  // Check if moves should reset (24 hour reset)
  const checkMovesReset = useCallback(async () => {
    if (!progress) return;
    
    const lastReset = new Date(progress.last_move_reset);
    const now = new Date();
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= 24) {
      const newLives = Math.min(progress.lives + livesRegenPerDay, maxLives);
      
      const { error } = await supabase
        .from('roguelike_progress')
        .update({
          moves_today: 5,
          lives: newLives,
          last_move_reset: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', user?.id);
      
      if (!error) {
        setProgress(prev => prev ? {
          ...prev,
          moves_today: 5,
          lives: newLives,
          last_move_reset: now.toISOString()
        } : null);
      }
    }
  }, [progress, user?.id, livesRegenPerDay, maxLives]);

  // Fetch current map and nodes
  const fetchMapData = useCallback(async (mapId: string) => {
    const [mapResult, nodesResult] = await Promise.all([
      supabase.from('roguelike_maps').select('*').eq('id', mapId).single(),
      supabase.from('roguelike_nodes').select('*').eq('map_id', mapId).order('order_index')
    ]);

    if (mapResult.data) {
      setCurrentMap(mapResult.data as RoguelikeMap);
    }
    if (nodesResult.data) {
      setNodes(nodesResult.data as RoguelikeNode[]);
    }
  }, []);

  // Fetch user progress
  const fetchProgress = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('roguelike_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching progress:', error);
      return;
    }

    if (data) {
      setProgress(data as RoguelikeProgress);
      await fetchMapData(data.current_map_id || 'map_01');
    } else {
      // Create initial progress
      const { data: newProgress, error: insertError } = await supabase
        .from('roguelike_progress')
        .insert({
          user_id: user.id,
          current_map_id: 'map_01',
          lives: maxLives,
          moves_today: 5
        })
        .select()
        .single();

      if (newProgress) {
        setProgress(newProgress as RoguelikeProgress);
        await fetchMapData('map_01');
      }
    }
  }, [user?.id, fetchMapData, maxLives]);

  // Fetch completed nodes
  const fetchCompletedNodes = useCallback(async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('roguelike_completed_nodes')
      .select('node_id')
      .eq('user_id', user.id);

    if (data) {
      setCompletedNodes(new Set(data.map(d => d.node_id)));
    }
  }, [user?.id]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProgress();
      await fetchCompletedNodes();
      setLoading(false);
    };

    if (user?.id) {
      init();
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchProgress, fetchCompletedNodes]);

  // Check moves reset periodically
  useEffect(() => {
    checkMovesReset();
    const interval = setInterval(checkMovesReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkMovesReset]);

  // Use a move
  const useMove = useCallback(async () => {
    if (!progress || progress.moves_today <= 0) return false;

    const { error } = await supabase
      .from('roguelike_progress')
      .update({
        moves_today: progress.moves_today - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user?.id);

    if (!error) {
      setProgress(prev => prev ? { ...prev, moves_today: prev.moves_today - 1 } : null);
      return true;
    }
    return false;
  }, [progress, user?.id]);

  // Complete a node
  const completeNode = useCallback(async (
    nodeId: string,
    score: number,
    passed: boolean
  ) => {
    if (!user?.id || !progress) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    let livesChange = 0;
    const passThreshold = 80;

    if (passed) {
      // Skull nodes give +1 life on win
      if (node.node_type === 'skull') {
        livesChange = 1;
      }
    } else {
      // Failed
      if (score < passThreshold) {
        // Below 80% = lose 2 lives
        livesChange = -2;
      } else {
        livesChange = -1;
      }

      // Skull nodes = lose 2 on fail
      if (node.node_type === 'skull') {
        livesChange = -2;
      }

      // Heart nodes = no life loss on fail
      if (node.node_type === 'heart') {
        livesChange = 0;
      }
    }

    const newLives = Math.max(0, Math.min(maxLives, progress.lives + livesChange));
    const xpEarned = passed ? (progress.is_backtracking ? Math.floor(score / 2) : score) : 0;

    // Update progress
    const updates: Record<string, unknown> = {
      lives: newLives,
      updated_at: new Date().toISOString()
    };

    if (passed) {
      updates.total_nodes_completed = progress.total_nodes_completed + 1;
      updates.current_node_id = nodeId;
    }

    await supabase
      .from('roguelike_progress')
      .update(updates)
      .eq('user_id', user.id);

    // Record completion
    if (passed) {
      await supabase
        .from('roguelike_completed_nodes')
        .upsert({
          user_id: user.id,
          node_id: nodeId,
          map_id: currentMap?.id || 'map_01',
          score,
          xp_earned: xpEarned,
          completed_during_backtrack: progress.is_backtracking
        });

      setCompletedNodes(prev => new Set([...prev, nodeId]));
    }

    setProgress(prev => prev ? { ...prev, ...updates, lives: newLives } : null);

    return { livesChange, xpEarned, newLives };
  }, [user?.id, progress, nodes, currentMap, maxLives]);

  // Get lesson questions
  const getLessonQuestions = useCallback(async (lessonId: string) => {
    const { data } = await supabase
      .from('roguelike_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index');

    return (data || []) as RoguelikeQuestion[];
  }, []);

  // Get random lessons for empty nodes
  const getRandomLessons = useCallback(async (count: number = 3) => {
    const { data } = await supabase
      .from('roguelike_lessons')
      .select('*')
      .limit(count);

    return (data || []) as RoguelikeLesson[];
  }, []);

  // Proceed to next map
  const proceedToNextMap = useCallback(async (nextMapId: string) => {
    if (!user?.id || !currentMap) return;

    const newMapsCompleted = [...(progress?.maps_completed || []), currentMap.id];

    await supabase
      .from('roguelike_progress')
      .update({
        current_map_id: nextMapId,
        current_node_id: null,
        maps_completed: newMapsCompleted,
        is_backtracking: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    await fetchMapData(nextMapId);
    setProgress(prev => prev ? {
      ...prev,
      current_map_id: nextMapId,
      current_node_id: null,
      maps_completed: newMapsCompleted,
      is_backtracking: false
    } : null);
  }, [user?.id, currentMap, progress, fetchMapData]);

  // Enable backtracking
  const enableBacktracking = useCallback(async () => {
    if (!user?.id) return;

    await supabase
      .from('roguelike_progress')
      .update({
        is_backtracking: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    setProgress(prev => prev ? { ...prev, is_backtracking: true } : null);
  }, [user?.id]);

  // Calculate time until moves reset
  const getTimeUntilReset = useCallback(() => {
    if (!progress) return null;
    
    const lastReset = new Date(progress.last_move_reset);
    const resetTime = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const diff = resetTime.getTime() - now.getTime();
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, totalMs: diff };
  }, [progress]);

  // Check if node is accessible
  const isNodeAccessible = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return false;

    // Locked nodes are never accessible
    if (node.node_type === 'locked') return false;

    // First node is always accessible
    if (node.order_index === 1) return true;

    // Check if any connected nodes are completed
    const prevNodes = nodes.filter(n => n.order_index < node.order_index);
    return prevNodes.some(n => completedNodes.has(n.id));
  }, [nodes, completedNodes]);

  // Check if boss is defeated
  const isBossDefeated = useCallback(() => {
    const bossNode = nodes.find(n => n.node_type === 'boss');
    return bossNode ? completedNodes.has(bossNode.id) : false;
  }, [nodes, completedNodes]);

  return {
    currentMap,
    nodes,
    progress,
    completedNodes,
    loading,
    error,
    isPremium,
    maxLives,
    useMove,
    completeNode,
    getLessonQuestions,
    getRandomLessons,
    proceedToNextMap,
    enableBacktracking,
    getTimeUntilReset,
    isNodeAccessible,
    isBossDefeated,
    refetch: fetchProgress
  };
}
