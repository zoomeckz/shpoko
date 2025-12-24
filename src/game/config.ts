import Phaser from 'phaser';

// Game constants
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const MAP_WIDTH = 2400;
export const MAP_HEIGHT = 1200;

// Sprite constants (32x32 base, scales cleanly)
export const TILE_SIZE = 32;
export const SPRITE_SCALE = 2;

// Player physics (Celeste-inspired)
export const PLAYER_CONFIG = {
  moveSpeed: 180,
  runSpeed: 280,
  jumpForce: -380,
  gravity: 900,
  coyoteTime: 100, // ms after leaving ground you can still jump
  jumpBufferTime: 100, // ms before landing you can queue a jump
  maxFallSpeed: 500,
  acceleration: 1200,
  deceleration: 2000,
  airAcceleration: 800,
  wallSlideSpeed: 80,
};

// Node layout constants
export const NODE_RADIUS = 28;
export const NODE_SPACING_X = 180;
export const NODE_SPACING_Y = 120;
export const PATH_LINE_WIDTH = 6;

// Animation durations
export const WALK_DURATION = 400;
export const BOUNCE_AMPLITUDE = 8;
export const PULSE_SCALE = 1.15;

// Colors (HSL-friendly hex values)
export const COLORS = {
  // Nodes
  nodeUnlocked: 0x4ade80,
  nodeCompleted: 0x3b82f6,
  nodeLocked: 0x6b7280,
  nodeDungeon: 0xa855f7,
  
  // Paths
  pathLine: 0x78716c,
  pathLineLocked: 0x44403c,
  
  // UI
  highlight: 0xfbbf24,
  text: 0xffffff,
  textShadow: 0x1f2937,
  
  // World zones
  school: { sky: 0x87ceeb, ground: 0x4ade80 },
  city: { sky: 0x475569, ground: 0x64748b },
  sewer: { sky: 0x1e3a1e, ground: 0x365314 },
  forest: { sky: 0x166534, ground: 0x14532d },
  space: { sky: 0x0f0f23, ground: 0x1e1b4b },
};

// Animation frame data
export const ANIMATIONS = {
  shpoko: {
    idle: { start: 0, end: 5, frameRate: 8 },
    walk: { start: 6, end: 13, frameRate: 12 },
    run: { start: 14, end: 23, frameRate: 16 },
    jump: { start: 24, end: 25, frameRate: 10 },
    air: { start: 26, end: 28, frameRate: 8 },
    fall: { start: 29, end: 30, frameRate: 8 },
    land: { start: 31, end: 32, frameRate: 12 },
    stomp: { start: 33, end: 35, frameRate: 12 },
    hurt: { start: 36, end: 39, frameRate: 10 },
    victory: { start: 40, end: 45, frameRate: 10 },
  },
  coyote: {
    idle: { start: 0, end: 3, frameRate: 6 },
    walk: { start: 4, end: 9, frameRate: 8 },
    alert: { start: 10, end: 12, frameRate: 8 },
    defeated: { start: 13, end: 16, frameRate: 10 },
  },
};

// Create Phaser game configuration
export function createPhaserConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#1b1f2a',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: PLAYER_CONFIG.gravity },
        debug: false,
      },
    },
    scene: [], // Scenes added dynamically
  };
}
