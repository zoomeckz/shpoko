import Phaser from "phaser";

/* ======================================================
   REQUIRED BY LOVABLE
   DO NOT import scenes here
   ====================================================== */
export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,

    // Lovable mounts Phaser into this container
    parent: "game",

    width: 960,
    height: 540,

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

    // Scenes are added manually in BootScene
    scene: [],
  };
}

/* ======================================================
   GAME CONSTANTS
   ====================================================== */
export const GAME_CONFIG = {
  MAP_WIDTH: 1920,
  MAP_HEIGHT: 1080,

  INTERNAL_WIDTH: 960,
  INTERNAL_HEIGHT: 540,

  CAMERA_ZOOM: 1,

  TITLE_SIZE: 48,
  NODE_SCALE: 0.8,

  PLAYER_SPEED_WALK: 160,
  PLAYER_SPEED_RUN: 230,
  PLAYER_JUMP_VELOCITY: -420,
  GRAVITY_Y: 1600,

  STOMP_BOUNCE: -260,
  WORD_POP_FADE_MS: 1200,
};
