import Phaser from "phaser";

/* ======================================================
   WORLD MAP SCENE
   Forces visible output no matter what
   ====================================================== */

type WorldNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  unlocked: boolean;
};

export class WorldMapScene extends Phaser.Scene {
  private nodes: WorldNode[] = [];

  constructor() {
    super("WorldMapScene");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    /* --------------------------------------------------
       HARD BACKGROUND (proves scene is rendering)
       -------------------------------------------------- */
    this.add.rectangle(0, 0, width, height, 0x1b1f2a).setOrigin(0, 0);

    /* --------------------------------------------------
       TITLE (centered, impossible to miss)
       -------------------------------------------------- */
    this.add
      .text(width / 2, 60, "WORLD MAP", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    /* --------------------------------------------------
       DEFINE NODES (screen-relative positions)
       -------------------------------------------------- */
    this.nodes = [
      { id: "school", name: "School", x: width * 0.2, y: height * 0.55, unlocked: true },
      { id: "city", name: "City", x: width * 0.4, y: height * 0.45, unlocked: false },
      { id: "sewer", name: "Sewer", x: width * 0.6, y: height * 0.6, unlocked: false },
      { id: "forest", name: "Forest", x: width * 0.8, y: height * 0.45, unlocked: false },
    ];

    /* --------------------------------------------------
       CONNECTION LINES
       -------------------------------------------------- */
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];

      this.add.line(0, 0, a.x, a.y, b.x, b.y, 0x888888).setOrigin(0, 0).setLineWidth(4);
    }

    /* --------------------------------------------------
       DRAW NODES
       -------------------------------------------------- */
    this.nodes.forEach((node) => {
      const circle = this.add
        .circle(node.x, node.y, 28, node.unlocked ? 0x4caf50 : 0x555555)
        .setStrokeStyle(3, 0xffffff);

      this.add
        .text(node.x, node.y + 44, node.name, {
          fontSize: "16px",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      if (node.unlocked) {
        circle.setInteractive({ useHandCursor: true });

        circle.on("pointerdown", () => {
          this.scene.start("StageScene", { world: node.id });
        });
      }
    });

    /* --------------------------------------------------
       DEBUG MARKER (absolute bottom-right)
       -------------------------------------------------- */
    this.add
      .text(width - 10, height - 10, "MAP ACTIVE", {
        fontSize: "12px",
        color: "#00ff00",
      })
      .setOrigin(1);
  }
}

export default WorldMapScene;
