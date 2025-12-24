import Phaser from "phaser";

/* ======================================================
   WORLD MAP SCENE
   Draws ONLY after resize event (Lovable-safe)
   ====================================================== */

export class WorldMapScene extends Phaser.Scene {
  private drawn = false;

  constructor() {
    super("WorldMapScene");
  }

  create() {
    // Force background immediately (camera-level)
    this.cameras.main.setBackgroundColor(0x1b1f2a);

    // Draw once AFTER Lovable finishes resizing
    this.scale.on("resize", () => {
      if (this.drawn) return;
      this.drawn = true;
      this.drawWorld();
    });

    // Fallback: draw after a tiny delay in case resize already happened
    this.time.delayedCall(50, () => {
      if (!this.drawn) {
        this.drawn = true;
        this.drawWorld();
      }
    });
  }

  private drawWorld() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    /* --------------------------------------------------
       HARD PROOF TEXT (top-left, absolute)
       -------------------------------------------------- */
    this.add.text(20, 20, "WORLD MAP ACTIVE", {
      fontSize: "20px",
      color: "#ffffff",
    });

    /* --------------------------------------------------
       NODES (FIXED COORDINATES – NOT RELATIVE)
       -------------------------------------------------- */
    const nodes = [
      { id: "school", name: "School", x: 200, y: 300, unlocked: true },
      { id: "city", name: "City", x: 400, y: 260, unlocked: false },
      { id: "sewer", name: "Sewer", x: 600, y: 340, unlocked: false },
      { id: "forest", name: "Forest", x: 800, y: 260, unlocked: false },
      { id: "space", name: "Space", x: 1000, y: 200, unlocked: false },
    ];

    /* --------------------------------------------------
       CONNECTION LINES
       -------------------------------------------------- */
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];

      this.add.line(0, 0, a.x, a.y, b.x, b.y, 0x888888).setOrigin(0, 0).setLineWidth(4);
    }

    /* --------------------------------------------------
       DRAW NODES
       -------------------------------------------------- */
    nodes.forEach((node) => {
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
          console.log("Selected:", node.id);
        });
      }
    });

    /* --------------------------------------------------
       BOTTOM-RIGHT DEBUG (absolute)
       -------------------------------------------------- */
    this.add
      .text(width - 10, height - 10, "MAP RENDERED", {
        fontSize: "12px",
        color: "#00ff00",
      })
      .setOrigin(1);
  }
}

export default WorldMapScene;
