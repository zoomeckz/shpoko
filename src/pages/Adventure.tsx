import { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdventure, AdventureNode } from '@/hooks/useAdventure';
import { useAuth } from '@/contexts/AuthContext';
import { usePhaserGame } from '@/game/hooks/usePhaserGame';
import { WorldNode } from '@/game/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Star, Play, Skull, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShpokoMascot } from '@/components/ShpokoMascot';

const Adventure = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { nodes, loading, isNodeUnlocked, isNodeCompleted, getCurrentWeek } = useAdventure();
  
  const [selectedNode, setSelectedNode] = useState<AdventureNode | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameReady, setGameReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Transform adventure nodes to game nodes with positions
  const gameNodes: WorldNode[] = useMemo(() => {
    return nodes.map((node, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      const zigzag = row % 2 === 0 ? col : 4 - col;
      const x = 200 + zigzag * 180;
      const y = 300 + row * 140;
      const zones = ['school', 'city', 'sewer', 'forest', 'space'] as const;
      const zoneIndex = Math.min(Math.floor(index / 4), zones.length - 1);
      
      return {
        id: node.id,
        x, y,
        title: node.title,
        description: node.description,
        isDungeon: node.is_dungeon,
        lessonId: node.lesson_id,
        xpReward: node.xp_reward,
        nodeNumber: node.node_number,
        weekNumber: node.week_number,
        worldZone: zones[zoneIndex],
      };
    });
  }, [nodes]);

  const currentNodeId = useMemo(() => {
    const node = gameNodes.find((n) => {
      const adventureNode = nodes.find(an => an.id === n.id);
      return adventureNode && isNodeUnlocked(adventureNode) && !isNodeCompleted(n.id);
    });
    return node?.id || gameNodes[0]?.id || null;
  }, [gameNodes, nodes, isNodeUnlocked, isNodeCompleted]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) setSelectedNode(node);
  }, [nodes]);

  const handleEnterLevel = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    if (node.is_dungeon) {
      navigate(`/adventure/dungeon/${node.id}`);
    } else {
      const lessonRoutes: Record<string, string> = {
        'cyrillic-alphabet': '/lesson/cyrillic', 'basic-greetings': '/lesson/greetings',
        'numbers-1-20': '/lesson/numbers', 'pronouns-topic': '/topic/pronouns',
        'colors-topic': '/topic/colors', 'survival-phrases-topic': '/topic/survival-phrases',
        'food-drinks-starter-topic': '/topic/food-drinks-starter', 'animals-topic': '/topic/animals',
        'weekdays-topic': '/topic/weekdays', 'family-topic': '/topic/family',
        'adjectives-topic': '/topic/adjectives', 'verbs-topic': '/topic/verbs',
        'directions-beginner': '/topic/directions-beginner', 'weather-topic': '/topic/weather',
        'jobs-topic': '/topic/jobs', 'restaurant-topic': '/topic/restaurant',
        'essential-verbs-topic': '/topic/essential-verbs', 'shapes-topic': '/topic/shapes',
        'adjectives-2-topic': '/topic/adjectives-2', 'numbers-topic': '/topic/numbers',
      };
      const route = lessonRoutes[node.lesson_id];
      if (route) navigate(`${route}?adventure=${node.id}`);
    }
  }, [nodes, navigate]);

  const checkNodeUnlocked = useCallback((nodeId: string): boolean => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? isNodeUnlocked(node) : false;
  }, [nodes, isNodeUnlocked]);

  const { containerRef, initGame, destroyGame } = usePhaserGame({
    nodes: gameNodes,
    currentNodeId,
    onNodeSelect: handleNodeSelect,
    onEnterLevel: handleEnterLevel,
    isNodeUnlocked: checkNodeUnlocked,
    isNodeCompleted,
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !showIntro && nodes.length > 0 && !gameReady) {
      const timer = setTimeout(() => { initGame(); setGameReady(true); }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, showIntro, nodes.length, gameReady, initGame]);

  useEffect(() => () => { destroyGame(); }, [destroyGame]);

  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-sky-400 to-sky-200 flex items-center justify-center z-50">
        <div className="text-center animate-fade-in">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="relative animate-bounce"><ShpokoMascot size="lg" /></div>
          </div>
          <h1 className="text-5xl font-bold text-white mt-8 drop-shadow-lg" style={{ textShadow: '3px 3px 0 #000' }}>
            🗺️ Adventure Mode 🗺️
          </h1>
          <p className="text-2xl text-white/90 mt-4 drop-shadow-md">World {getCurrentWeek()}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-sky-400 flex items-center justify-center">
        <div className="text-center"><ShpokoMascot size="lg" /><p className="mt-4 text-lg text-white font-bold animate-pulse">Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Button variant="secondary" size="sm" onClick={() => navigate("/")} className="bg-white/95 hover:bg-white shadow-lg">
              <ArrowLeft className="w-4 h-4 mr-2" />Home
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} className="bg-white/95 hover:bg-white shadow-lg">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full shadow-lg font-bold">
                <Star className="w-5 h-5" /><span>{profile?.xp || 0} XP</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          <div className="bg-red-600 text-white px-8 py-3 rounded-2xl shadow-xl font-bold text-xl border-4 border-white">🏰 World {getCurrentWeek()} 🏰</div>
        </div>
        {!user && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 pointer-events-auto">
            <Card className="bg-white/95 px-6 py-3 shadow-xl"><p className="text-sm font-medium text-center">Sign in to save progress!</p>
              <Button size="sm" className="w-full mt-2" onClick={() => navigate("/auth")}>Sign In</Button>
            </Card>
          </div>
        )}
        {selectedNode && (
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
            <Card className={cn("relative max-w-lg mx-auto border-4 shadow-2xl", selectedNode.is_dungeon ? "border-purple-400 bg-gradient-to-br from-purple-900 to-purple-950" : "border-yellow-400 bg-gradient-to-br from-amber-50 to-orange-50")}>
              <div className="p-5 flex items-center gap-4">
                <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg", selectedNode.is_dungeon ? "bg-gradient-to-br from-purple-500 to-purple-700" : "bg-gradient-to-br from-yellow-400 to-orange-500")}>
                  {selectedNode.is_dungeon ? <Skull className="w-12 h-12 text-white" /> : <span className="text-4xl font-bold text-white">{selectedNode.node_number}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn("font-bold text-xl truncate", selectedNode.is_dungeon ? "text-white" : "text-gray-900")}>{selectedNode.title}</h3>
                  <p className={cn("text-sm truncate", selectedNode.is_dungeon ? "text-purple-200" : "text-gray-600")}>{selectedNode.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold"><Star className="w-4 h-4" />+{selectedNode.xp_reward} XP</div>
                  </div>
                </div>
                <Button size="lg" onClick={() => handleEnterLevel(selectedNode.id)} className={cn("h-20 w-20 rounded-2xl shadow-xl", selectedNode.is_dungeon ? "bg-gradient-to-br from-purple-500 to-purple-700" : "bg-gradient-to-br from-green-500 to-green-700")}>
                  <Play className="w-10 h-10 fill-white text-white" />
                </Button>
              </div>
            </Card>
          </div>
        )}
        <div className="absolute bottom-4 left-4"><div className="bg-black/60 text-white/80 px-3 py-2 rounded-lg text-xs"><p>🎮 Arrow keys to navigate</p><p>⏎ Enter to play</p></div></div>
      </div>
    </div>
  );
};

export default Adventure;
