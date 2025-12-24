import { useRef, useCallback, useEffect } from 'react';
import Phaser from 'phaser';
import { createPhaserConfig } from '../config';
import { BootScene } from '../scenes/BootScene';
import { WorldMapScene } from '../scenes/WorldMapScene';
import { WorldNode, GameData } from '../types';

interface UsePhaserGameProps {
  nodes: WorldNode[];
  currentNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onEnterLevel: (nodeId: string) => void;
  isNodeUnlocked: (nodeId: string) => boolean;
  isNodeCompleted: (nodeId: string) => boolean;
}

export function usePhaserGame({
  nodes,
  currentNodeId,
  onNodeSelect,
  onEnterLevel,
  isNodeUnlocked,
  isNodeCompleted,
}: UsePhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneDataRef = useRef<GameData | null>(null);

  // Create stable callback references
  const callbacksRef = useRef({
    onNodeSelect,
    onEnterLevel,
    isNodeUnlocked,
    isNodeCompleted,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onNodeSelect,
      onEnterLevel,
      isNodeUnlocked,
      isNodeCompleted,
    };
  }, [onNodeSelect, onEnterLevel, isNodeUnlocked, isNodeCompleted]);

  const initGame = useCallback(() => {
    if (gameRef.current || !containerRef.current) return;

    // Prepare game data with stable callback wrappers
    const gameData: GameData = {
      nodes,
      currentNodeId,
      callbacks: {
        onNodeSelect: (id: string) => callbacksRef.current.onNodeSelect(id),
        onEnterLevel: (id: string) => callbacksRef.current.onEnterLevel(id),
        isNodeUnlocked: (id: string) => callbacksRef.current.isNodeUnlocked(id),
        isNodeCompleted: (id: string) => callbacksRef.current.isNodeCompleted(id),
      },
    };
    sceneDataRef.current = gameData;

    // Create Phaser config
    const config = createPhaserConfig(containerRef.current);
    
    // Add scenes to config
    config.scene = [BootScene, WorldMapScene];

    // Create game instance
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // When WorldMapScene starts, pass data to it
    game.events.on('ready', () => {
      const worldMapScene = game.scene.getScene('WorldMapScene') as WorldMapScene;
      if (worldMapScene) {
        // Scene will receive data via init()
      }
    });

    // Override scene start to pass data
    const originalStart = game.scene.start.bind(game.scene);
    game.scene.start = (key: string, data?: object) => {
      if (key === 'WorldMapScene') {
        return originalStart(key, gameData);
      }
      return originalStart(key, data);
    };
  }, [nodes, currentNodeId]);

  const destroyGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
  }, []);

  // Update scene when nodes change
  useEffect(() => {
    if (gameRef.current && sceneDataRef.current) {
      const worldMapScene = gameRef.current.scene.getScene('WorldMapScene') as WorldMapScene;
      if (worldMapScene?.scene?.isActive()) {
        worldMapScene.updateNodes(nodes, currentNodeId);
      }
    }
  }, [nodes, currentNodeId]);

  return {
    containerRef,
    initGame,
    destroyGame,
    isReady: !!gameRef.current,
  };
}
