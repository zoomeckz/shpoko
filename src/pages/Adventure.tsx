import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Volume2, VolumeX, Play, Skull, Zap } from "lucide-react";
import { useAdventure, AdventureNode } from "@/hooks/useAdventure";
import { useAuth } from "@/contexts/AuthContext";
import { useWorldMapSounds } from "@/hooks/useWorldMapSounds";
import { WorldMapNode } from "@/components/adventure/WorldMapNode";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { cn } from "@/lib/utils";
import adventureMapBg from "@/assets/adventure-map-bg.jpg";

// Generate node positions in a winding Mario-style path
const generateNodePositions = (count: number): Array<{ x: number; y: number }> => {
  const positions: Array<{ x: number; y: number }> = [];
  
  // Create a winding path pattern similar to Super Mario World
  const patterns = [
    { x: 15, y: 85 },   // Start bottom left
    { x: 30, y: 75 },
    { x: 45, y: 70 },
    { x: 60, y: 75 },
    { x: 75, y: 68 },
    { x: 85, y: 60 },
    { x: 75, y: 50 },
    { x: 60, y: 45 },
    { x: 45, y: 50 },
    { x: 30, y: 42 },
    { x: 20, y: 32 },   // Dungeon at position 11
    { x: 35, y: 25 },
    { x: 50, y: 20 },
    { x: 65, y: 25 },
    { x: 80, y: 18 },
  ];
  
  for (let i = 0; i < count; i++) {
    if (i < patterns.length) {
      positions.push(patterns[i]);
    } else {
      // Generate additional positions
      const progress = (i - patterns.length) / 10;
      positions.push({
        x: 15 + (i % 4) * 20 + Math.sin(i) * 10,
        y: 15 - progress * 5,
      });
    }
  }
  
  return positions;
};

const Adventure = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { nodes, progress, loading, isNodeUnlocked, isNodeCompleted, getCurrentWeek } = useAdventure();
  const sounds = useWorldMapSounds();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [shpokoPosition, setShpokoPosition] = useState<{ x: number; y: number }>({ x: 15, y: 85 });
  const [isMoving, setIsMoving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  
  // Generate positions for all nodes
  const nodePositions = useMemo(() => {
    return generateNodePositions(nodes.length);
  }, [nodes.length]);

  // Find current node (first incomplete unlocked node)
  const currentNodeIndex = useMemo(() => {
    const idx = nodes.findIndex(node => 
      isNodeUnlocked(node) && !isNodeCompleted(node.id)
    );
    return idx >= 0 ? idx : Math.max(0, nodes.length - 1);
  }, [nodes, isNodeUnlocked, isNodeCompleted]);

  // Initialize Shpoko position to current node
  useEffect(() => {
    if (nodePositions.length > 0 && currentNodeIndex >= 0 && nodePositions[currentNodeIndex]) {
      setShpokoPosition(nodePositions[currentNodeIndex]);
    }
  }, [nodePositions, currentNodeIndex]);

  // Start ambient sounds
  useEffect(() => {
    if (soundEnabled && !showIntro) {
      sounds.startAmbient();
    }
    return () => sounds.stopAmbient();
  }, [soundEnabled, showIntro, sounds]);

  // Hide intro after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Animated path drawing
  const pathD = useMemo(() => {
    if (nodePositions.length < 2) return "";
    
    let path = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    for (let i = 1; i < nodePositions.length; i++) {
      const prev = nodePositions[i - 1];
      const curr = nodePositions[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      const offsetX = (i % 2 === 0 ? 1 : -1) * 5;
      path += ` Q ${midX + offsetX} ${midY} ${curr.x} ${curr.y}`;
    }
    return path;
  }, [nodePositions]);

  // Handle node click with smooth animation
  const handleNodeClick = useCallback((node: AdventureNode, index: number) => {
    const unlocked = isNodeUnlocked(node);
    
    if (!unlocked) {
      if (soundEnabled) sounds.playLocked();
      return;
    }

    if (soundEnabled) sounds.playSelect();
    setSelectedNodeId(node.id);

    // Animate Shpoko moving along the path
    if (nodePositions[index]) {
      setIsMoving(true);
      
      // Play step sounds during movement
      const distance = Math.abs(index - currentNodeIndex);
      const steps = Math.min(distance * 2, 8);
      for (let i = 0; i < steps; i++) {
        setTimeout(() => {
          if (soundEnabled) sounds.playStep();
        }, i * 80);
      }

      // Smooth movement
      setShpokoPosition(nodePositions[index]);
      
      setTimeout(() => {
        setIsMoving(false);
        if (soundEnabled) sounds.playArrival();
      }, 500);
    }
  }, [isNodeUnlocked, soundEnabled, sounds, nodePositions, currentNodeIndex]);

  // Handle entering a level
  const handleEnterLevel = useCallback(() => {
    if (!selectedNodeId) return;
    
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return;

    if (node.is_dungeon) {
      if (soundEnabled) sounds.playDungeonEntrance();
      setTimeout(() => navigate(`/adventure/dungeon/${node.id}`), 600);
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
        setTimeout(() => navigate(`${route}?adventure=${node.id}`), 300);
      }
    }
  }, [selectedNodeId, nodes, soundEnabled, sounds, navigate]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Intro screen
  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center animate-fade-in">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-pulse" />
            <ShpokoMascot size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-white mt-6 animate-bounce">Adventure Mode</h1>
          <p className="text-xl text-white/70 mt-2">Week {getCurrentWeek()}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <ShpokoMascot size="lg" />
          <p className="mt-4 text-lg text-white animate-pulse">Loading adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Full-screen background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${adventureMapBg})` }}
      />
      
      {/* Animated clouds overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/30 rounded-full blur-xl"
            style={{
              width: `${100 + i * 40}px`,
              height: `${60 + i * 20}px`,
              top: `${5 + i * 8}%`,
              left: `${-20 + (i * 30)}%`,
              animation: `float-cloud ${20 + i * 5}s linear infinite`,
              animationDelay: `${i * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate("/")}
            className="bg-white/90 hover:bg-white shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-white/90 hover:bg-white shadow-lg"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full shadow-lg font-bold">
              <Star className="w-5 h-5" />
              <span>{profile?.xp || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Week indicator */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-red-600 text-white px-6 py-2 rounded-full shadow-xl font-bold text-lg border-4 border-white">
          🗺️ World {getCurrentWeek()}
        </div>
      </div>

      {/* Sign in prompt */}
      {!user && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20">
          <Card className="bg-white/95 backdrop-blur-sm px-6 py-3 shadow-xl">
            <p className="text-sm font-medium">Sign in to save progress!</p>
            <Button size="sm" className="w-full mt-2" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </Card>
        </div>
      )}

      {/* Map container */}
      <div 
        ref={mapRef}
        className="absolute inset-0 pt-24"
        style={{ touchAction: "pan-x pan-y" }}
      >
        {/* Path SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="100%" stopColor="#A0522D" />
            </linearGradient>
            <filter id="pathShadow">
              <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Main path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pathShadow)"
            className="opacity-80"
            style={{
              strokeDasharray: "1000",
              strokeDashoffset: "0",
            }}
          />
          
          {/* Path dots decoration */}
          <path
            d={pathD}
            fill="none"
            stroke="#F5DEB3"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="2 15"
            className="opacity-60"
          />
        </svg>

        {/* Animated Shpoko character */}
        <div
          className={cn(
            "absolute z-20 pointer-events-none transition-all ease-out",
            isMoving ? "duration-500" : "duration-200"
          )}
          style={{
            left: `${shpokoPosition.x}%`,
            top: `${shpokoPosition.y}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className={cn(
            "relative",
            isMoving && "animate-bounce"
          )}>
            {/* Shadow under Shpoko */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/30 rounded-full blur-sm" />
            <ShpokoMascot size="md" />
          </div>
        </div>

        {/* Map nodes */}
        {nodes.map((node, index) => (
          <WorldMapNode
            key={node.id}
            node={node}
            index={index}
            isUnlocked={isNodeUnlocked(node)}
            isCompleted={isNodeCompleted(node.id)}
            isSelected={selectedNodeId === node.id}
            position={nodePositions[index] || { x: 50, y: 50 }}
            onClick={() => handleNodeClick(node, index)}
          />
        ))}
      </div>

      {/* Level info panel */}
      {selectedNode && (
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/80 to-transparent pt-20">
          <Card className={cn(
            "max-w-lg mx-auto border-4 shadow-2xl overflow-hidden",
            selectedNode.is_dungeon 
              ? "border-purple-500 bg-gradient-to-br from-purple-900 to-purple-950"
              : "border-yellow-400 bg-gradient-to-br from-amber-50 to-orange-50"
          )}>
            <div className="p-4">
              <div className="flex items-center gap-4">
                {/* Level icon */}
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center shadow-lg",
                  selectedNode.is_dungeon 
                    ? "bg-purple-600" 
                    : "bg-gradient-to-br from-yellow-400 to-orange-400"
                )}>
                  {selectedNode.is_dungeon ? (
                    <Skull className="w-10 h-10 text-white" />
                  ) : (
                    <span className="text-3xl font-bold text-white">{selectedNode.node_number}</span>
                  )}
                </div>
                
                {/* Level info */}
                <div className="flex-1">
                  <h3 className={cn(
                    "font-bold text-xl",
                    selectedNode.is_dungeon ? "text-white" : "text-gray-900"
                  )}>
                    {selectedNode.title}
                  </h3>
                  <p className={cn(
                    "text-sm",
                    selectedNode.is_dungeon ? "text-purple-200" : "text-gray-600"
                  )}>
                    {selectedNode.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-sm font-bold">
                      <Star className="w-4 h-4" />
                      +{selectedNode.xp_reward}
                    </div>
                    {selectedNode.is_dungeon && (
                      <span className="text-purple-300 text-sm">⚔️ Boss Battle!</span>
                    )}
                  </div>
                </div>

                {/* Play button */}
                <Button 
                  size="lg"
                  onClick={handleEnterLevel}
                  className={cn(
                    "h-16 w-16 rounded-full shadow-xl",
                    selectedNode.is_dungeon 
                      ? "bg-purple-500 hover:bg-purple-400" 
                      : "bg-green-500 hover:bg-green-400"
                  )}
                >
                  <Play className="w-8 h-8 fill-white text-white" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Cloud animation keyframes */}
      <style>{`
        @keyframes float-cloud {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }
      `}</style>
    </div>
  );
};

export default Adventure;
