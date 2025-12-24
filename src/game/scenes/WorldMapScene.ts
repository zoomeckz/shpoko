import Phaser from "phaser";

/* ======================================================
   WORLD MAP SCENE
   - No new files
   - All logic self-contained
   ====================================================== */

type WorldNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  unlocked: boolean;
};

export default class WorldMapScene extends Phaser.Scene {
  private nodes: WorldNode[] = [];
  private selectedNode?: WorldNode;

  constructor() {
    super("WorldMapScene");
  }

  create() {
    const { width, height } = this.scale;

    // ----- TITLE -----
    this.add
      .text(width / 2, 40, "WORLD MAP", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // ----- DEFINE NODES (WORLD STRUCTURE) -----
    this.nodes = [
      { id: "school", name: "School", x: 200, y: 300, unlocked: true },
      { id: "city", name: "City", x: 420, y: 260, unlocked: false },
      { id: "sewer", name: "Sewer", x: 640, y: 340, unlocked: false },
      { id: "forest", name: "Forest", x: 860, y: 260, unlocked: false },
      { id: "space", name: "Space", x: 1080, y: 200, unlocked: false },
    ];

    // ----- DRAW CONNECTIONS -----
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];

      this.add.line(0, 0, a.x, a.y, b.x, b.y, 0x444444).setOrigin(0, 0).setLineWidth(4);
    }

    // ----- DRAW NODES -----
    this.nodes.forEach((node) => {
      const circle = this.add
        .circle(node.x, node.y, 26, node.unlocked ? 0x4caf50 : 0x555555)
        .setStrokeStyle(3, 0xffffff);

      if (node.unlocked) {
        circle.setInteractive({ useHandCursor: true });

        circle.on("pointerdown", () => {
          this.selectNode(node);
        });
      }

      this.add
        .text(node.x, node.y + 40, node.name, {
          fontSize: "16px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
    });

    // ----- PLAY BUTTON -----
    const playBtn = this.add
      .text(width / 2, height - 90, "PLAY", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#1f2937",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setAlpha(0.5);

    // Disabled until a node is selected
    playBtn.disableInteractive();

    // ----- INSTRUCTIONS -----
    this.add
      .text(width / 2, height - 40, "Select a world node to continue", {
        fontSize: "14px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    // ----- NODE SELECTION HANDLER -----
    this.selectNode = (node: WorldNode) => {
      this.selectedNode = node;

      playBtn.setAlpha(1).setInteractive({ useHandCursor: true });

      playBtn.off("pointerdown");
      playBtn.on("pointerdown", () => {
        // TEMP: go straight into stage
        // Later this becomes: Lesson → Stage
        this.scene.start("StageScene", { world: node.id });
      });
    };
  }

  // overwritten dynamically above to avoid extra bindings
  private selectNode(_node: WorldNode) {}
}
