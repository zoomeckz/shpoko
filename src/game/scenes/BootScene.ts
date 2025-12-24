import Phaser from "phaser";

/* ======================================================
   REQUIRED BY LOVABLE
   This MUST exist and MUST be named exactly this
   ====================================================== */
export function createGameConfig() {
  return {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    backgroundColor: "#0b0f14",
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 1600 },
        debug: false,
      },
    },
    scene: [BootScene, StageScene],
  };
}

/* ======================================================
   BOOT SCENE
   ====================================================== */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Placeholder assets (must exist)
    this.load.image("shpoko_placeholder", "assets/shpoko.png");
    this.load.image("enemy_placeholder", "assets/enemy.png");
    this.load.image("trashcan_placeholder", "assets/trashcan.png");
  }

  create() {
    // Start game here
    this.scene.start("StageScene");
  }
}

export default BootScene;

/* ======================================================
   EVERYTHING BELOW IS GAME LOGIC
   (Lovable workaround: no new files allowed)
   ====================================================== */

// ---------- INPUT MANAGER ----------
class InputManager {
  state = { left: false, right: false, jump: false, sprint: false };
  keys: any;

  constructor(scene: Phaser.Scene) {
    this.keys = scene.input.keyboard?.addKeys({
      left: "A",
      right: "D",
      jump: "SPACE",
      sprint: "SHIFT",
    });
  }

  update() {
    if (!this.keys) return;
    this.state.left = this.keys.left.isDown;
    this.state.right = this.keys.right.isDown;
    this.state.jump = this.keys.jump.isDown;
    this.state.sprint = this.keys.sprint.isDown;
  }
}

// ---------- WORD POP SYSTEM ----------
class WordPopSystem {
  scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  spawn(x: number, y: number) {
    const words = [
      { bg: "куче", ro: "kuche" },
      { bg: "котка", ro: "kotka" },
      { bg: "гора", ro: "gora" },
    ];

    const w = Phaser.Utils.Array.GetRandom(words);

    const txt = this.scene.add
      .text(x, y, `${w.bg} (${w.ro})`, {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.4)",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5);

    this.scene.tweens.add({
      targets: txt,
      y: y - 24,
      alpha: 0,
      duration: 1200,
      onComplete: () => txt.destroy(),
    });
  }
}

// ---------- PLAYER ----------
class Player extends Phaser.Physics.Arcade.Sprite {
  input: InputManager;

  constructor(scene: Phaser.Scene, x: number, y: number, input: InputManager) {
    super(scene, x, y, "shpoko_placeholder");
    this.input = input;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setGravityY(1600);
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = this.input.state.sprint ? 230 : 160;

    if (this.input.state.left) body.setVelocityX(-speed);
    else if (this.input.state.right) body.setVelocityX(speed);
    else body.setVelocityX(0);

    if (this.input.state.jump && body.blocked.down) {
      body.setVelocityY(-420);
    }
  }
}

// ---------- ENEMY ----------
class Enemy extends Phaser.Physics.Arcade.Sprite {
  alive = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy_placeholder");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }

  die() {
    this.alive = false;
    this.disableBody(true, true);
  }
}

// ---------- STAGE SCENE ----------
class StageScene extends Phaser.Scene {
  inputMgr!: InputManager;
  player!: Player;
  wordPop!: WordPopSystem;

  constructor() {
    super("StageScene");
  }

  create() {
    this.inputMgr = new InputManager(this);
    this.wordPop = new WordPopSystem(this);

    // Ground
    const ground = this.physics.add.staticGroup();
    ground.create(960, 520, "").setDisplaySize(2000, 40).refreshBody();

    // Player
    this.player = new Player(this, 100, 450, this.inputMgr);
    this.physics.add.collider(this.player, ground);

    // Enemy
    const enemy = new Enemy(this, 500, 480);
    this.physics.add.collider(enemy, ground);

    // Stomp logic
    this.physics.add.overlap(this.player, enemy, () => {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (body.velocity.y > 0 && enemy.alive) {
        enemy.die();
        body.setVelocityY(-260);
        this.wordPop.spawn(enemy.x, enemy.y);
      }
    });

    // Goal (trashcan)
    const goal = this.physics.add.sprite(900, 480, "trashcan_placeholder").setImmovable(true).setAllowGravity(false);

    this.physics.add.overlap(this.player, goal, () => {
      this.tweens.add({
        targets: goal,
        y: goal.y - 800,
        duration: 1400,
        ease: "Sine.easeIn",
        onComplete: () => this.scene.start("BootScene"),
      });
    });
  }

  update() {
    this.inputMgr.update();
    this.player.update();
  }
}
