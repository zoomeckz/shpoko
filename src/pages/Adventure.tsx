import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Volume2, VolumeX, Play, Skull, MapPin, Zap } from "lucide-react";
import { useAdventure, AdventureNode } from "@/hooks/useAdventure";
import { useAuth } from "@/contexts/AuthContext";
import { useWorldMapSounds } from "@/hooks/useWorldMapSounds";
import { WorldMapNode } from "@/components/adventure/WorldMapNode";
import { WorldMapPath } from "@/components/adventure/WorldMapPath";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { cn } from "@/lib/utils";

// Generate node positions in a winding path pattern
const generateNodePositions = (count: number): Array<{ x: number; y: number }> => {
  const positions: Array<{ x: number; y: number }> = [];
  
  for (let i = 0; i < count; i++) {
    // Create a winding path from bottom to top
    const progress = i / Math.max(count - 1, 1);
    const yBase = 85 - progress * 70; // From 85% to 15%
    
    // Sine wave for x position, wider amplitude
    const xBase = 50 + Math.sin(i * 0.8) * 25;
    
    // Add some variation
    const xOffset = (i % 3 - 1) * 8;
    const yOffset = Math.sin(i * 1.5) * 5;
    
    positions.push({
      x: Math.max(15, Math.min(85, xBase + xOffset)),
      y: Math.max(12, Math.min(88, yBase + yOffset)),
    });
  }
  
  return positions;
};

const Adventure = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { nodes, progress, loading, isNodeUnlocked, isNodeCompleted, getCurrentWeek } = useAdventure();
  const sounds = useWorldMapSounds();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [shpokoPosition, setShpokoPosition] = useState<{ x: number; y: number } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Generate positions for all nodes
  const nodePositions = useMemo(() => {
    return generateNodePositions(nodes.length);
  }, [nodes.length]);

  // Find current node (first incomplete unlocked node)
  const currentNodeIndex = useMemo(() => {
    const idx = nodes.findIndex(node => 
      isNodeUnlocked(node) && !isNodeCompleted(node.id)
    );
    return idx >= 0 ? idx : nodes.length - 1;
  }, [nodes, isNodeUnlocked, isNodeCompleted]);

  const currentNode = nodes[currentNodeIndex];

  // Initialize Shpoko position
  useEffect(() => {
    if (nodePositions.length > 0 && currentNodeIndex >= 0) {
      setShpokoPosition(nodePositions[currentNodeIndex]);
    }
  }, [nodePositions, currentNodeIndex]);

  // Start ambient sounds
  useEffect(() => {
    if (soundEnabled) {
      sounds.startAmbient();
    }
    return () => sounds.stopAmbient();
  }, [soundEnabled, sounds]);

  // Generate path segments
  const pathSegments = useMemo(() => {
    return nodes.slice(0, -1).map((node, index) => {
      const nextNode = nodes[index + 1];
      return {
        from: nodePositions[index],
        to: nodePositions[index + 1],
        isCompleted: isNodeCompleted(node.id),
        isDungeonPath: nextNode?.is_dungeon || false,
      };
    });
  }, [nodes, nodePositions, isNodeCompleted]);

  // Handle node click
  const handleNodeClick = useCallback((node: AdventureNode, index: number) => {
    const unlocked = isNodeUnlocked(node);
    
    if (!unlocked) {
      if (soundEnabled) sounds.playLocked();
      return;
    }

    if (soundEnabled) sounds.playSelect();
    setSelectedNodeId(node.id);

    // Animate Shpoko moving to node
    if (nodePositions[index] && shpokoPosition) {
      setIsMoving(true);
      
      // Play step sounds during movement
      const stepCount = 5;
      for (let i = 0; i < stepCount; i++) {
        setTimeout(() => {
          if (soundEnabled) sounds.playStep();
        }, i * 100);
      }

      // Move Shpoko
      setTimeout(() => {
        setShpokoPosition(nodePositions[index]);
        setIsMoving(false);
        if (soundEnabled) sounds.playArrival();
      }, 400);
    }
  }, [isNodeUnlocked, soundEnabled, sounds, nodePositions, shpokoPosition]);

  // Handle entering a level
  const handleEnterLevel = useCallback(() => {
    if (!selectedNodeId) return;
    
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return;

    if (node.is_dungeon) {
      if (soundEnabled) sounds.playDungeonEntrance();
      setTimeout(() => {
        navigate(`/adventure/dungeon/${node.id}`);
      }, 500);
    } else {
      if (soundEnabled) sounds.playEnterLevel();
      
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
        setTimeout(() => {
          navigate(`${route}?adventure=${node.id}`);
        }, 300);
      }
    }
  }, [selectedNodeId, nodes, soundEnabled, sounds, navigate]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <ShpokoMascot size="lg" />
          <p className="mt-4 text-lg animate-pulse">Loading adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-purple-900/10 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-20 w-40 h-40 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-36 h-36 bg-yellow-500/5 rounded-full blur-3xl" />
        
        {/* Stars decoration */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Adventure Mode
              </h1>
              <p className="text-sm text-muted-foreground">Week {getCurrentWeek()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </Button>
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">{profile?.xp || 0} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign in prompt */}
      {!user && (
        <div className="relative z-10 px-4 mb-4">
          <Card className="max-w-md mx-auto p-4 bg-primary/10 border-primary/20 text-center">
            <p className="text-sm mb-2">Sign in to save your adventure progress!</p>
            <Button size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
          </Card>
        </div>
      )}

      {/* World Map Container */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-32">
        <div 
          className="relative w-full rounded-2xl border bg-card/30 backdrop-blur-sm overflow-hidden"
          style={{ height: "70vh", minHeight: "500px" }}
        >
          {/* Map paths */}
          {pathSegments.length > 0 && (
            <WorldMapPath segments={pathSegments} />
          )}

          {/* Map nodes */}
          {nodes.map((node, index) => (
            <WorldMapNode
              key={node.id}
              node={node}
              index={index}
              isUnlocked={isNodeUnlocked(node)}
              isCompleted={isNodeCompleted(node.id)}
              isSelected={selectedNodeId === node.id}
              isShpokoHere={false}
              position={nodePositions[index]}
              onClick={() => handleNodeClick(node, index)}
            />
          ))}

          {/* Animated Shpoko */}
          {shpokoPosition && (
            <div
              className={cn(
                "absolute transform -translate-x-1/2 transition-all duration-400 ease-out z-20",
                isMoving && "animate-bounce"
              )}
              style={{
                left: `${shpokoPosition.x}%`,
                top: `${shpokoPosition.y - 8}%`,
              }}
            >
              <ShpokoMascot size="md" />
            </div>
          )}

          {/* Coming soon indicator at top */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
            <p className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
              🌟 More adventures unlock weekly
            </p>
          </div>
        </div>
      </div>

      {/* Selected node action panel */}
      {selectedNode && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Card className={cn(
            "max-w-md mx-auto p-4 border-2 transition-all",
            selectedNode.is_dungeon 
              ? "border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-red-500/10"
              : "border-primary/50"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                selectedNode.is_dungeon ? "bg-purple-500/20" : "bg-primary/20"
              )}>
                {selectedNode.is_dungeon ? (
                  <Skull className="w-8 h-8 text-purple-400" />
                ) : (
                  <Zap className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{selectedNode.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                  <Star className="w-4 h-4" />
                  <span>+{selectedNode.xp_reward} XP</span>
                  {selectedNode.is_dungeon && (
                    <span className="text-purple-400 ml-2">⚔️ Dungeon Challenge</span>
                  )}
                </div>
              </div>
              <Button 
                size="lg"
                onClick={handleEnterLevel}
                className={cn(
                  selectedNode.is_dungeon && "bg-purple-600 hover:bg-purple-700"
                )}
              >
                <Play className="w-5 h-5 mr-1" />
                {selectedNode.is_dungeon ? "Enter" : "Play"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Adventure;
