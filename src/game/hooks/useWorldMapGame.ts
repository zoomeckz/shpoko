import { useEffect, useRef } from "react";
import Phaser from "phaser";

// Scenes are imported HERE (this is the real entry point)
import { BootScene } from "../scenes/BootScene";
import { WorldMapScene } from "../scenes/WorldMapScene";

export function useWorldMapGame() {
  // Lovable expects this ref
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Prevent multiple Phaser instances
    if ((window as any).__PHASER_GAME__) return;
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,

      // IMPORTANT: use the ref, not a hardcoded id
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

      // REGISTER SCENES HERE (Lovable-style)
      scene: [BootScene, WorldMapScene],
    };

    const game = new Phaser.Game(config);
    (window as any).__PHASER_GAME__ = game;

    return () => {
      game.destroy(true);
      (window as any).__PHASER_GAME__ = null;
    };
  }, []);

  // 🔥 THIS FIXES THE ERROR 🔥
  return { containerRef };
}
