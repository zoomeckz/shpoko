import Phaser from "phaser";

/* ======================================================
   REQUIRED BY LOVABLE
   Lovable imports this by name
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

    // Scenes are registered automatically by Lovable
    scene: [],
  };
}

/* ======================================================
   BOOT SCENE
   MUST EXIST AS BOTH NAMED + DEFAULT EXPORT
   ====================================================== */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Placeholder assets so the game does not crash
    this.load.image("shpoko_placeholder", "assets/shpoko.png");
    this.load.image("enemy_placeholder", "assets/enemy.png");
    this.load.image("trashcan_placeholder", "assets/trashcan.png");
  }

  create() {
    // IMPORTANT: start the World Map explicitly
    this.scene.start("WorldMapScene");
  }
}

export default BootScene;
