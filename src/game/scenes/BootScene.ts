import Phaser from "phaser";
import WorldMapScene from "./WorldMapScene";

/* ======================================================
   BOOT SCENE
   - Registers scenes manually (Lovable requirement)
   - Starts the World Map
   ====================================================== */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Minimal placeholders so Phaser doesn't crash
    this.load.image("shpoko_placeholder", "assets/shpoko.png");
    this.load.image("enemy_placeholder", "assets/enemy.png");
    this.load.image("trashcan_placeholder", "assets/trashcan.png");
  }

  create() {
    // IMPORTANT: manually register scenes
    this.scene.add("WorldMapScene", WorldMapScene, false);

    // Start game here
    this.scene.start("WorldMapScene");
  }
}

export default BootScene;
