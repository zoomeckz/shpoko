import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoguelike } from '@/hooks/useRoguelike';
import { LoadingScreen } from '@/components/roguelike/LoadingScreen';
import { RadioUI } from '@/components/roguelike/RadioUI';
import { GameUI } from '@/components/roguelike/GameUI';
import { SwipeTransition } from '@/components/roguelike/SwipeTransition';
import { toast } from 'sonner';
import mapImage from '@/assets/roguelike/map_01.png';
import shpokoHover from '@/assets/roguelike/shpoko_hover.png';

export default function RoguelikeMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentMap,
    nodes,
    progress,
    completedNodes,
    loading,
    isPremium,
    maxLives,
    useMove,
    getTimeUntilReset,
    isNodeAccessible,
    isBossDefeated,
    enableBacktracking,
    proceedToNextMap
  } = useRoguelike();

  const [loadingComplete, setLoadingComplete] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Handle node click
  const handleNodeClick = useCallback(async (nodeId: string) => {
    if (!progress) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Check if locked
    if (node.node_type === 'locked') {
      toast.error('Този възел е заключен!');
      return;
    }

    // Check if accessible
    if (!isNodeAccessible(nodeId)) {
      toast.error('Трябва първо да завършите предишен възел!');
      return;
    }

    // Check if already completed (unless backtracking)
    if (completedNodes.has(nodeId) && !progress.is_backtracking) {
      toast.info('Вече сте завършили този възел!');
      return;
    }

    // Check moves
    if (progress.moves_today <= 0) {
      toast.error('Нямате повече ходове за днес!');
      return;
    }

    setSelectedNode(nodeId);
  }, [progress, nodes, isNodeAccessible, completedNodes]);

  // Start lesson
  const startLesson = useCallback(async () => {
    if (!selectedNode) return;

    const moved = await useMove();
    if (!moved) {
      toast.error('Грешка при използване на ход');
      return;
    }

    setTransitioning(true);
  }, [selectedNode, useMove]);

  // Handle transition complete
  const handleTransitionComplete = useCallback(() => {
    if (selectedNode) {
      navigate(`/roguelike/lesson/${selectedNode}`);
    }
  }, [selectedNode, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg mb-4">Трябва да влезете за да играете</p>
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Вход
          </button>
        </div>
      </div>
    );
  }

  if (!loadingComplete) {
    return (
      <LoadingScreen 
        isLoading={loading} 
        onComplete={() => setLoadingComplete(true)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0">
        <img 
          src={mapImage} 
          alt="Map" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Nodes */}
      <div className="absolute inset-0">
        {nodes.map(node => {
          const isCompleted = completedNodes.has(node.id);
          const isAccessible = isNodeAccessible(node.id);
          const isLocked = node.node_type === 'locked';
          const isSelected = selectedNode === node.id;

          return (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                isLocked ? 'opacity-50 cursor-not-allowed' : 
                isCompleted ? 'opacity-80' : 
                isAccessible ? 'cursor-pointer hover:scale-110' : 'opacity-60'
              }`}
              style={{
                left: `${(node.x_position / 800) * 100}%`,
                top: `${(node.y_position / 500) * 100}%`,
              }}
            >
              {/* Shpoko hover indicator */}
              {(isSelected || (progress?.current_node_id === node.id && !isSelected)) && (
                <img 
                  src={shpokoHover}
                  alt="Shpoko"
                  className="absolute -top-16 left-1/2 -translate-x-1/2 w-16 h-16 animate-bounce"
                />
              )}

              {/* Node visual */}
              <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-lg ${
                isCompleted ? 'bg-green-500 border-green-300' :
                isSelected ? 'bg-primary border-primary-foreground ring-4 ring-primary' :
                isLocked ? 'bg-gray-500 border-gray-400' :
                node.node_type === 'skull' ? 'bg-red-500 border-red-300' :
                node.node_type === 'heart' ? 'bg-pink-500 border-pink-300' :
                node.node_type === 'boss' ? 'bg-orange-500 border-orange-300' :
                node.node_type === 'treasure' ? 'bg-yellow-500 border-yellow-300' :
                'bg-secondary border-border'
              }`}>
                {isCompleted ? '✓' :
                 node.node_type === 'skull' ? '💀' :
                 node.node_type === 'heart' ? '❤️' :
                 node.node_type === 'boss' ? '👑' :
                 node.node_type === 'treasure' ? '🏆' :
                 node.node_type === 'locked' ? '🔒' :
                 node.node_type === 'empty' ? '?' : '⚔️'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Panel */}
      {selectedNode && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 bg-card/95 backdrop-blur-sm border rounded-lg p-4 w-80">
          <h3 className="font-bold mb-2">
            {nodes.find(n => n.id === selectedNode)?.node_type === 'boss' ? 'Бос битка!' :
             nodes.find(n => n.id === selectedNode)?.node_type === 'skull' ? 'Опасен възел' :
             nodes.find(n => n.id === selectedNode)?.node_type === 'heart' ? 'Безопасен възел' :
             'Започни урок'}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedNode(null)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              Отказ
            </button>
            <button
              onClick={startLesson}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Играй (-1 ход)
            </button>
          </div>
        </div>
      )}

      {/* UI Components */}
      <RadioUI />
      <GameUI
        progress={progress}
        currentMap={currentMap}
        maxLives={maxLives}
        isPremium={isPremium}
        getTimeUntilReset={getTimeUntilReset}
        isBossDefeated={isBossDefeated()}
        onBacktrack={enableBacktracking}
        onProceedToNextMap={proceedToNextMap}
        totalNodes={nodes.length}
        completedCount={completedNodes.size}
      />

      {/* Transition */}
      <SwipeTransition 
        isActive={transitioning} 
        onComplete={handleTransitionComplete}
      />
    </div>
  );
}
