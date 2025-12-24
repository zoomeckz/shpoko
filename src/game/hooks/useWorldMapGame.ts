import { useRef, useEffect, useCallback } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../config';
import { BootScene } from '../scenes/BootScene';
import { WorldMapScene } from '../scenes/WorldMapScene';
import { AdventureNode } from '@/hooks/useAdventure';

interface UseWorldMapGameProps {
  nodes: AdventureNode[];
  isNodeUnlocked: (node: AdventureNode) => boolean;
  isNodeCompleted: (id: string) => boolean;
  currentNodeIndex: number;
  onNodeSelect: (node: AdventureNode) => void;
  onEnterLevel: (node: AdventureNode) => void;
}

export const useWorldMapGame = ({
  nodes,
  isNodeUnlocked,
  isNodeCompleted,
  currentNodeIndex,
  onNodeSelect,
  onEnterLevel,
}: UseWorldMapGameProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const initGame = useCallback(() => {
    if (!containerRef.current || gameRef.current) return;

    // Create custom WorldMapScene with data
    class ConfiguredWorldMapScene extends WorldMapScene {
      init() {
        super.init({
          nodes,
          isNodeUnlocked,
          isNodeCompleted,
          currentNodeIndex,
          onNodeSelect,
          onEnterLevel,
        });
      }
    }

    const config = createGameConfig('phaser-container', [BootScene, ConfiguredWorldMapScene]);
    gameRef.current = new Phaser.Game(config);
  }, [nodes, isNodeUnlocked, isNodeCompleted, currentNodeIndex, onNodeSelect, onEnterLevel]);

  const destroyGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      destroyGame();
    };
  }, [destroyGame]);

  return {
    containerRef,
    initGame,
    destroyGame,
  };
};
