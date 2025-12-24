import { useRef } from "react";
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
  // 🔥 REQUIRED BY LOVABLE
  const containerRef = useRef<HTMLDivElement | null>(null);

  let game: Phaser.Game | null = null;

  /* --------------------------------------------------
     Called by Lovable when the game should start
     -------------------------------------------------- */
  function initGame() {
    if (game || !containerRef.current) return;

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

    game = new Phaser.Game(config);

    // Expose callbacks to scenes via registry
    game.registry.set("nodes", nodes);
    game.registry.set("isNodeUnlocked", isNodeUnlocked);
    game.registry.set("isNodeCompleted", isNodeCompleted);
    game.registry.set("currentNodeIndex", currentNodeIndex);
    game.registry.set("onNodeSelect", onNodeSelect);
    game.registry.set("onEnterLevel", onEnterLevel);
  }

  /* --------------------------------------------------
     Called by Lovable on unmount / route change
     -------------------------------------------------- */
  function destroyGame() {
    if (!game) return;
    game.destroy(true);
    game = null;
  }

  // 🔥 THIS MATCHES WHAT YOUR CODE EXPECTS 🔥
  return {
    containerRef,
    initGame,
    destroyGame,
  };
}
