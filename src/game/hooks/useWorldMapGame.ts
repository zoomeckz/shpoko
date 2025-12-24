import { useRef, useCallback } from "react";
import Phaser from "phaser";

import { BootScene } from "../scenes/BootScene";
import { WorldMapScene } from "../scenes/WorldMapScene";

type UseWorldMapGameArgs = {
  nodes: any[];
  isNodeUnlocked: (id: string) => boolean;
  isNodeCompleted: (id: string) => boolean;
  currentNodeIndex: number;
  onNodeSelect: (id: string) => void;
  onEnterLevel: (id: string) => void;
};

export function useWorldMapGame({
  nodes,
  isNodeUnlocked,
  isNodeCompleted,
  currentNodeIndex,
  onNodeSelect,
  onEnterLevel,
}: UseWorldMapGameArgs) {
  // MUST be declared unconditionally
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  /* --------------------------------------------------
     Initialize Phaser (called by Lovable)
     -------------------------------------------------- */
  const initGame = useCallback(() => {
    if (gameRef.current) return;
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,

      backgroundColor: "#000000",
      pixelArt: true,

      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },

      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 1600 },
          debug: false,
        },
      },

      scene: [BootScene, WorldMapScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Pass data to scenes via registry
    game.registry.set("nodes", nodes);
    game.registry.set("isNodeUnlocked", isNodeUnlocked);
    game.registry.set("isNodeCompleted", isNodeCompleted);
    game.registry.set("currentNodeIndex", currentNodeIndex);
    game.registry.set("onNodeSelect", onNodeSelect);
    game.registry.set("onEnterLevel", onEnterLevel);
  }, [nodes, isNodeUnlocked, isNodeCompleted, currentNodeIndex, onNodeSelect, onEnterLevel]);

  /* --------------------------------------------------
     Destroy Phaser (called by Lovable)
     -------------------------------------------------- */
  const destroyGame = useCallback(() => {
    if (!gameRef.current) return;
    gameRef.current.destroy(true);
    gameRef.current = null;
  }, []);

  // RETURN SHAPE MUST NEVER CHANGE
  return {
    containerRef,
    initGame,
    destroyGame,
  };
}
