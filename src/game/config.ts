import Phaser from "phaser";

/* ======================================================
   REQUIRED BY LOVABLE
   Phaser reads THIS function to boot the game
   ====================================================== */
export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,

    // Lovable injects a container with id="game"
    parent: "game",

    // Base internal resolution (scaled by RESIZE)
    width: 960,
    height: 540,

    backgroundColor: "#000000",
    pixelArt: true,

    // CRITICAL for Lovable layout
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

    // Lovable injects scenes elsewhere – keep empty
    scene: [],
  };
}

/* ======================================================
   GAME CONSTANTS
   Safe to extend. Do NOT remove.
   ====================================================== */
export const GAME_CONFIG = {
  // World / map
  MAP_WIDTH: 1920,
  MAP_HEIGHT: 1080,

  // Internal resolution reference
  INTERNAL_WIDTH: 960,
  INTERNAL_HEIGHT: 540,

  CAMERA_ZOOM: 1,

  // UI
  TITLE_SIZE: 48,
  NODE_SCALE: 0.8,

  // Player movement (Celeste-like)
  PLAYER_SPEED_WALK: 160,
  PLAYER_SPEED_RUN: 230,
  PLAYER_JUMP_VELOCITY: -420,
  GRAVITY_Y: 1600,

  // Combat / FX
  STOMP_BOUNCE: -260,
  WORD_POP_FADE_MS: 1200,
};
