import Phaser from 'phaser';

// Game constants
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const MAP_WIDTH = 2400;
export const MAP_HEIGHT = 1000;

// Node layout constants
export const NODE_RADIUS = 28;
export const NODE_SPACING_X = 180;
export const NODE_SPACING_Y = 120;
export const PATH_LINE_WIDTH = 6;

// Character constants
export const SHPOKO_SPEED = 200;
export const SHPOKO_SCALE = 1.2;

// Animation durations
export const WALK_DURATION = 400;
export const BOUNCE_AMPLITUDE = 8;
export const PULSE_SCALE = 1.15;

// Colors
export const COLORS = {
  nodeUnlocked: 0x4ade80,
  nodeCompleted: 0x3b82f6,
  nodeLocked: 0x6b7280,
  nodeDungeon: 0xa855f7,
  pathLine: 0x78716c,
  pathLineLocked: 0x44403c,
  highlight: 0xfbbf24,
  text: 0xffffff,
  textShadow: 0x1f2937,
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
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [], // Scenes added dynamically
  };
}
