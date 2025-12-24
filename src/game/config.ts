import Phaser from 'phaser';

export const GAME_CONFIG = {
  TILE_SIZE: 64,
  MAP_WIDTH: 1920,
  MAP_HEIGHT: 1080,
  PLAYER_SPEED: 200,
  NODE_SCALE: 0.8,
  CAMERA_ZOOM: 1,
};

export const COLORS = {
  PATH: 0x8B4513,
  PATH_HIGHLIGHT: 0xDEB887,
  COMPLETED: 0x4CAF50,
  LOCKED: 0x666666,
  DUNGEON: 0x9C27B0,
  GOLD: 0xFFD700,
  SKY_BLUE: 0x87CEEB,
};

export const createGameConfig = (
  parent: string,
  scene: Phaser.Types.Scenes.SceneType[]
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: false,
  antialias: true,
});
