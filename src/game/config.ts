import Phaser from "phaser";

export const GAME_CONFIG = {
  // World / camera
  MAP_WIDTH: 1920,
  MAP_HEIGHT: 1080,
  CAMERA_ZOOM: 1,

  // Typography / UI
  TITLE_SIZE: 48,

  // Player (Celeste-like tuning)
  PLAYER_SPEED_WALK: 160,
  PLAYER_SPEED_RUN: 230,
  PLAYER_JUMP_VELOCITY: -420,
  GRAVITY_Y: 1600,

  // Map
  NODE_SCALE: 0.8,

  // Rendering
  INTERNAL_WIDTH: 960,
  INTERNAL_HEIGHT: 540,

  // Gameplay
  STOMP_BOUNCE: -260,
  WORD_POP_FADE_MS: 1200,
};
