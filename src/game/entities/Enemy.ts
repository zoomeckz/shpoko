import Phaser from 'phaser';
import { TILE_SIZE, SPRITE_SCALE } from '../config';
import { EnemyType, EnemyState, BulgarianWord } from '../types';
import { AudioManager } from '../systems/AudioManager';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private enemyState: EnemyState;
  private patrolTimer = 0;
  private patrolDuration: number;
  private wordText?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    type: EnemyType,
    word: BulgarianWord
  ) {
    super(scene, x, y, type);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(SPRITE_SCALE);
    this.setSize(TILE_SIZE * 0.7, TILE_SIZE * 0.7);
    this.setCollideWorldBounds(true);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
    
    this.patrolDuration = Phaser.Math.Between(1500, 3000);
    
    this.enemyState = {
      type,
      health: 1,
      isAlert: false,
      isDefeated: false,
      patrolDirection: 1,
      wordToRelease: word,
    };

    this.createAnimations();
    this.play(`${type}_idle`, true);
  }

  private createAnimations() {
    const { type } = this.enemyState;
    const scene = this.scene;
    
    if (!scene.anims.exists(`${type}_idle`)) {
      scene.anims.create({
        key: `${type}_idle`,
        frames: scene.anims.generateFrameNumbers(type, { start: 0, end: 0 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    
    if (!scene.anims.exists(`${type}_walk`)) {
      scene.anims.create({
        key: `${type}_walk`,
        frames: scene.anims.generateFrameNumbers(type, { start: 1, end: 2 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    
    if (!scene.anims.exists(`${type}_defeated`)) {
      scene.anims.create({
        key: `${type}_defeated`,
        frames: scene.anims.generateFrameNumbers(type, { start: 3, end: 3 }),
        frameRate: 10,
        repeat: 0,
      });
    }
  }

  update(time: number, delta: number) {
    if (this.enemyState.isDefeated) return;
    
    // Patrol behavior
    this.patrolTimer += delta;
    if (this.patrolTimer >= this.patrolDuration) {
      this.patrolTimer = 0;
      this.enemyState.patrolDirection *= -1;
    }
    
    // Move in patrol direction
    const speed = this.enemyState.isAlert ? 80 : 40;
    this.setVelocityX(this.enemyState.patrolDirection * speed);
    this.setFlipX(this.enemyState.patrolDirection < 0);
    
    // Play walk animation
    this.play(`${this.enemyState.type}_walk`, true);
  }

  alert() {
    this.enemyState.isAlert = true;
  }

  defeat(playerX: number) {
    if (this.enemyState.isDefeated) return;
    
    this.enemyState.isDefeated = true;
    this.setVelocity(0, 0);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    
    // Squash animation
    this.scene.tweens.add({
      targets: this,
      scaleY: SPRITE_SCALE * 0.3,
      scaleX: SPRITE_SCALE * 1.3,
      alpha: 0,
      duration: 300,
      ease: 'Back.easeIn',
    });
    
    // Play defeat animation
    this.play(`${this.enemyState.type}_defeated`, true);
    
    AudioManager.play('enemy_defeat');
    
    // Release word popup
    this.releaseWord();
    
    // Destroy after animation
    this.scene.time.delayedCall(400, () => {
      this.destroy();
    });
  }

  private releaseWord() {
    const word = this.enemyState.wordToRelease;
    
    // Create word popup text
    const wordContainer = this.scene.add.container(this.x, this.y - 20);
    
    // Glow background
    const glow = this.scene.add.graphics();
    glow.fillStyle(0xfbbf24, 0.3);
    glow.fillCircle(0, 0, 40);
    wordContainer.add(glow);
    
    // Cyrillic text (main)
    const cyrillicText = this.scene.add.text(0, -12, word.cyrillic, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#fbbf24',
      stroke: '#1f2937',
      strokeThickness: 4,
    }).setOrigin(0.5);
    wordContainer.add(cyrillicText);
    
    // English text (subtitle)
    const englishText = this.scene.add.text(0, 8, word.english, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#1f2937',
      strokeThickness: 2,
    }).setOrigin(0.5);
    wordContainer.add(englishText);
    
    wordContainer.setDepth(100);
    
    // Float up and fade animation
    this.scene.tweens.add({
      targets: wordContainer,
      y: this.y - 100,
      alpha: 0,
      duration: 2000,
      ease: 'Quad.easeOut',
      onComplete: () => wordContainer.destroy(),
    });
    
    // Scale pop effect
    this.scene.tweens.add({
      targets: wordContainer,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut',
    });
    
    AudioManager.play('word_popup');
  }

  isDefeated(): boolean {
    return this.enemyState.isDefeated;
  }

  getType(): EnemyType {
    return this.enemyState.type;
  }
}
