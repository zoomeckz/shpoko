/* ================================
   TEMP GAME LOGIC BUNDLE
   (Placed here because Lovable
   does not allow new files)
   ================================ */

// ----- GLOBAL STATE -----
type WordEntry = { bg: string; ro: string };

const PlayerProfile = {
  characterVariant: "male" as "male" | "female",
  lastLessonWords: [] as WordEntry[],
};

// ----- INPUT MANAGER -----
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

// ----- WORD POP SYSTEM -----
class WordPopSystem {
  scene: Phaser.Scene;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  spawn(x: number, y: number) {
    if (!PlayerProfile.lastLessonWords.length) return;
    const w = Phaser.Utils.Array.GetRandom(PlayerProfile.lastLessonWords);
    const txt = this.scene.add
      .text(x, y, `${w.bg} (${w.ro})`, {
        fontSize: "18px",
        color: "#fff",
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

// ----- PLAYER -----
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

// ----- ENEMY -----
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

// ----- STAGE SCENE -----
class StageScene extends Phaser.Scene {
  inputMgr!: InputManager;
  player!: Player;
  wordPop!: WordPopSystem;

  constructor() {
    super("StageScene");
  }

  create() {
    // Back → Map (hard rule)
    this.add
      .text(20, 20, "Back", { color: "#fff" })
      .setInteractive()
      .on("pointerdown", () => this.scene.start("WorldMapScene"));

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

    this.physics.add.overlap(this.player, enemy, () => {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (body.velocity.y > 0 && enemy.alive) {
        enemy.die();
        body.setVelocityY(-260);
        this.wordPop.spawn(enemy.x, enemy.y);
      }
    });
  }

  update() {
    this.inputMgr.update();
    this.player.update();
  }
}
