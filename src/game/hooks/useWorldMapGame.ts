import { useEffect } from "react";
import Phaser from "phaser";

// Import scenes directly here (hooks ARE allowed to import)
import { BootScene } from "../scenes/BootScene";
import { WorldMapScene } from "../scenes/WorldMapScene";

export function useWorldMapGame() {
  useEffect(() => {
    // Prevent multiple Phaser instances
    if ((window as any).__PHASER_GAME__) {
      return;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,

      // Lovable provides this container
      parent: "game",

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

      // 🔥 THIS IS THE CRITICAL PART 🔥
      scene: [BootScene, WorldMapScene],
    };

    const game = new Phaser.Game(config);
    (window as any).__PHASER_GAME__ = game;

    return () => {
      game.destroy(true);
      (window as any).__PHASER_GAME__ = null;
    };
  }, []);
}
