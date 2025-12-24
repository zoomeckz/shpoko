import Phaser from "phaser";

/* ======================================================
   REQUIRED EXPORT FOR LOVABLE
   ====================================================== */
export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    backgroundColor: "#0b0f14",
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 1600 },
        debug: false,
      },
    },
    scene: [],
  };
}

/* ======================================================
   GAME CONSTANTS (SAFE TO EXTEND)
   ====================================================== */
export const GAME_CONFIG = {
  MAP_WIDTH: 1920,
  MAP_HEIGHT: 1080,

  INTERNAL_WIDTH: 960,
  INTERNAL_HEIGHT: 540,

  CAMERA_ZOOM: 1,

  TITLE_SIZE: 48,

  PLAYER_SPEED_WALK: 160,
  PLAYER_SPEED_RUN: 230,
  PLAYER_JUMP_VELOCITY: -420,
  GRAVITY_Y: 1600,

  STOMP_BOUNCE: -260,
  WORD_POP_FADE_MS: 1200,

  NODE_SCALE: 0.8,
};
