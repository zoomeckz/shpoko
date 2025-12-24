import { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdventure, AdventureNode } from '@/hooks/useAdventure';
import { useAuth } from '@/contexts/AuthContext';
import { useWorldMapGame } from '@/game/hooks/useWorldMapGame';
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

  // Find current node (first incomplete unlocked node)
  const currentNodeIndex = useMemo(() => {
    const idx = nodes.findIndex(node => 
      isNodeUnlocked(node) && !isNodeCompleted(node.id)
    );
    return idx >= 0 ? idx : Math.max(0, nodes.length - 1);
  }, [nodes, isNodeUnlocked, isNodeCompleted]);

  const handleNodeSelect = useCallback((node: AdventureNode) => {
    setSelectedNode(node);
  }, []);

  const handleEnterLevel = useCallback((node: AdventureNode) => {
    if (node.is_dungeon) {
      navigate(`/adventure/dungeon/${node.id}`);
    } else {
      const lessonRoutes: Record<string, string> = {
        'cyrillic-alphabet': '/lesson/cyrillic',
        'basic-greetings': '/lesson/greetings',
        'numbers-1-20': '/lesson/numbers',
        'pronouns-topic': '/topic/pronouns',
        'colors-topic': '/topic/colors',
        'survival-phrases-topic': '/topic/survival-phrases',
        'food-drinks-starter-topic': '/topic/food-drinks-starter',
        'animals-topic': '/topic/animals',
        'weekdays-topic': '/topic/weekdays',
        'family-topic': '/topic/family',
        'adjectives-topic': '/topic/adjectives',
        'verbs-topic': '/topic/verbs',
        'directions-beginner': '/topic/directions-beginner',
        'weather-topic': '/topic/weather',
        'jobs-topic': '/topic/jobs',
        'restaurant-topic': '/topic/restaurant',
        'essential-verbs-topic': '/topic/essential-verbs',
        'shapes-topic': '/topic/shapes',
        'adjectives-2-topic': '/topic/adjectives-2',
        'numbers-topic': '/topic/numbers',
      };
      
      const route = lessonRoutes[node.lesson_id];
      if (route) {
        navigate(`${route}?adventure=${node.id}`);
      }
    }
  }, [navigate]);

  const { containerRef, initGame, destroyGame } = useWorldMapGame({
    nodes,
    isNodeUnlocked,
    isNodeCompleted,
    currentNodeIndex,
    onNodeSelect: handleNodeSelect,
    onEnterLevel: handleEnterLevel,
  });

  // Hide intro after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize game after loading and intro
  useEffect(() => {
    if (!loading && !showIntro && nodes.length > 0 && !gameReady) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initGame();
        setGameReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, showIntro, nodes.length, gameReady, initGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyGame();
    };
  }, [destroyGame]);

  // Handle play button click
  const handlePlayClick = useCallback(() => {
    if (selectedNode) {
      handleEnterLevel(selectedNode);
    }
  }, [selectedNode, handleEnterLevel]);

  // Intro screen
  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-sky-400 to-sky-200 flex items-center justify-center z-50">
        <div className="text-center animate-fade-in">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="relative animate-bounce">
              <ShpokoMascot size="lg" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mt-8 drop-shadow-lg" style={{ textShadow: '3px 3px 0 #000' }}>
            🗺️ Adventure Mode 🗺️
          </h1>
          <p className="text-2xl text-white/90 mt-4 drop-shadow-md">World {getCurrentWeek()}</p>
          <div className="mt-8 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-yellow-400 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-sky-400 flex items-center justify-center">
        <div className="text-center">
          <ShpokoMascot size="lg" />
          <p className="mt-4 text-lg text-white font-bold animate-pulse">Loading adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Phaser Game Container */}
      <div
        id="phaser-container"
        ref={containerRef}
        className="absolute inset-0"
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => navigate("/")}
              className="bg-white/95 hover:bg-white shadow-lg border-2 border-black/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-white/95 hover:bg-white shadow-lg border-2 border-black/10"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full shadow-lg font-bold border-2 border-yellow-500">
                <Star className="w-5 h-5" />
                <span>{profile?.xp || 0} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* World indicator */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-red-600 text-white px-8 py-3 rounded-2xl shadow-xl font-bold text-xl border-4 border-white transform -rotate-1">
            🏰 World {getCurrentWeek()} 🏰
          </div>
        </div>

        {/* Sign in prompt */}
        {!user && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 pointer-events-auto">
            <Card className="bg-white/95 backdrop-blur-sm px-6 py-3 shadow-xl border-2 border-black/10">
              <p className="text-sm font-medium text-center">Sign in to save progress!</p>
              <Button size="sm" className="w-full mt-2" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </Card>
          </div>
        )}

        {/* Level info panel */}
        {selectedNode && (
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
            <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute inset-0 -top-20" />
            <Card className={cn(
              "relative max-w-lg mx-auto border-4 shadow-2xl overflow-hidden",
              selectedNode.is_dungeon 
                ? "border-purple-400 bg-gradient-to-br from-purple-900 to-purple-950"
                : "border-yellow-400 bg-gradient-to-br from-amber-50 to-orange-50"
            )}>
              <div className="p-5">
                <div className="flex items-center gap-4">
                  {/* Level icon */}
                  <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3",
                    selectedNode.is_dungeon 
                      ? "bg-gradient-to-br from-purple-500 to-purple-700" 
                      : "bg-gradient-to-br from-yellow-400 to-orange-500"
                  )}>
                    {selectedNode.is_dungeon ? (
                      <Skull className="w-12 h-12 text-white" />
                    ) : (
                      <span className="text-4xl font-bold text-white drop-shadow-md">{selectedNode.node_number}</span>
                    )}
                  </div>
                  
                  {/* Level info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-bold text-xl truncate",
                      selectedNode.is_dungeon ? "text-white" : "text-gray-900"
                    )}>
                      {selectedNode.title}
                    </h3>
                    <p className={cn(
                      "text-sm truncate",
                      selectedNode.is_dungeon ? "text-purple-200" : "text-gray-600"
                    )}>
                      {selectedNode.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                        <Star className="w-4 h-4" />
                        +{selectedNode.xp_reward} XP
                      </div>
                      {selectedNode.is_dungeon && (
                        <span className="text-purple-300 text-sm font-medium">⚔️ Boss Battle!</span>
                      )}
                    </div>
                  </div>

                  {/* Play button */}
                  <Button 
                    size="lg"
                    onClick={handlePlayClick}
                    className={cn(
                      "h-20 w-20 rounded-2xl shadow-xl transform rotate-3 transition-transform hover:rotate-0 hover:scale-110",
                      selectedNode.is_dungeon 
                        ? "bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600" 
                        : "bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600"
                    )}
                  >
                    <Play className="w-10 h-10 fill-white text-white" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 pointer-events-none">
          <div className="bg-black/60 text-white/80 px-3 py-2 rounded-lg text-xs">
            <p>🎮 Arrow keys to navigate</p>
            <p>⏎ Enter/Space to play</p>
            <p>🖱️ Click nodes to select</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adventure;
