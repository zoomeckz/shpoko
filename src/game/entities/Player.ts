import Phaser from 'phaser';
import { PLAYER_CONFIG, TILE_SIZE, SPRITE_SCALE } from '../config';
import { PlayerState } from '../types';
import { AudioManager } from '../systems/AudioManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private playerState: PlayerState;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private runKey!: Phaser.Input.Keyboard.Key;
  private lastGroundedTime = 0;
  private lastJumpPressTime = 0;
  private footstepTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'shpoko');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(SPRITE_SCALE);
    this.setSize(TILE_SIZE * 0.6, TILE_SIZE * 0.9);
    this.setOffset(TILE_SIZE * 0.2, TILE_SIZE * 0.1);
    this.setCollideWorldBounds(true);
    this.setMaxVelocity(PLAYER_CONFIG.runSpeed, PLAYER_CONFIG.maxFallSpeed);
    this.setDragX(PLAYER_CONFIG.deceleration);
    
    this.playerState = {
      isGrounded: false,
      isJumping: false,
      isFalling: false,
      isRunning: false,
      facingRight: true,
      coyoteTimeLeft: 0,
      jumpBuffered: false,
      canDoubleJump: false,
      isHurt: false,
      isStomping: false,
    };

    this.setupInput();
    this.createAnimations();
  }

  private setupInput() {
    if (!this.scene.input.keyboard) return;
    
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.runKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  private createAnimations() {
    const scene = this.scene;
    
    // Simple frame-based animations using the generated sprite
    if (!scene.anims.exists('shpoko_idle')) {
      scene.anims.create({
        key: 'shpoko_idle',
        frames: scene.anims.generateFrameNumbers('shpoko', { start: 0, end: 0 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    
    if (!scene.anims.exists('shpoko_walk')) {
      scene.anims.create({
        key: 'shpoko_walk',
        frames: scene.anims.generateFrameNumbers('shpoko', { start: 1, end: 2 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    
    if (!scene.anims.exists('shpoko_jump')) {
      scene.anims.create({
        key: 'shpoko_jump',
        frames: scene.anims.generateFrameNumbers('shpoko', { start: 3, end: 3 }),
        frameRate: 10,
        repeat: 0,
      });
    }
    
    if (!scene.anims.exists('shpoko_fall')) {
      scene.anims.create({
        key: 'shpoko_fall',
        frames: scene.anims.generateFrameNumbers('shpoko', { start: 4, end: 4 }),
        frameRate: 10,
        repeat: 0,
      });
    }
    
    if (!scene.anims.exists('shpoko_stomp')) {
      scene.anims.create({
        key: 'shpoko_stomp',
        frames: scene.anims.generateFrameNumbers('shpoko', { start: 5, end: 5 }),
        frameRate: 12,
        repeat: 0,
      });
    }
  }

  update(time: number, delta: number) {
    if (this.playerState.isHurt) return;
    
    const wasGrounded = this.playerState.isGrounded;
    this.playerState.isGrounded = (this.body as Phaser.Physics.Arcade.Body).blocked.down;
    
    // Just landed
    if (!wasGrounded && this.playerState.isGrounded) {
      this.onLand();
    }
    
    // Left ground
    if (wasGrounded && !this.playerState.isGrounded) {
      this.lastGroundedTime = time;
    }
    
    // Coyote time
    this.playerState.coyoteTimeLeft = this.playerState.isGrounded 
      ? PLAYER_CONFIG.coyoteTime 
      : Math.max(0, PLAYER_CONFIG.coyoteTime - (time - this.lastGroundedTime));
    
    this.handleMovement(delta);
    this.handleJump(time);
    this.updateAnimation();
    this.handleFootsteps(time);
  }

  private handleMovement(delta: number) {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    this.playerState.isRunning = this.runKey.isDown;
    
    const targetSpeed = this.playerState.isRunning ? PLAYER_CONFIG.runSpeed : PLAYER_CONFIG.moveSpeed;
    const accel = this.playerState.isGrounded ? PLAYER_CONFIG.acceleration : PLAYER_CONFIG.airAcceleration;
    
    if (left && !right) {
      this.setAccelerationX(-accel);
      this.playerState.facingRight = false;
      this.setFlipX(true);
    } else if (right && !left) {
      this.setAccelerationX(accel);
      this.playerState.facingRight = true;
      this.setFlipX(false);
    } else {
      this.setAccelerationX(0);
    }
    
    // Clamp velocity to target speed
    const vx = this.body?.velocity.x || 0;
    if (Math.abs(vx) > targetSpeed) {
      this.setVelocityX(Math.sign(vx) * targetSpeed);
    }
  }

  private handleJump(time: number) {
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                        Phaser.Input.Keyboard.JustDown(this.wasd.W) ||
                        Phaser.Input.Keyboard.JustDown(this.cursors.space);
    
    // Jump buffering
    if (jumpPressed) {
      this.lastJumpPressTime = time;
      this.playerState.jumpBuffered = true;
    }
    
    const jumpBufferActive = time - this.lastJumpPressTime < PLAYER_CONFIG.jumpBufferTime;
    const canJump = this.playerState.coyoteTimeLeft > 0 || this.playerState.canDoubleJump;
    
    if ((jumpPressed || (this.playerState.jumpBuffered && jumpBufferActive)) && canJump) {
      this.jump();
      this.playerState.jumpBuffered = false;
      
      if (!this.playerState.isGrounded && this.playerState.coyoteTimeLeft <= 0) {
        this.playerState.canDoubleJump = false;
      }
    }
    
    // Variable jump height - release to fall faster
    const jumpHeld = this.cursors.up.isDown || this.wasd.W.isDown || this.cursors.space.isDown;
    const vy = this.body?.velocity.y || 0;
    if (!jumpHeld && vy < -100) {
      this.setVelocityY(vy * 0.5);
    }
    
    // Update falling state
    this.playerState.isJumping = vy < 0;
    this.playerState.isFalling = vy > 50 && !this.playerState.isGrounded;
  }

  private jump() {
    this.setVelocityY(PLAYER_CONFIG.jumpForce);
    this.playerState.isJumping = true;
    AudioManager.play('jump_start');
    
    // Squash and stretch
    this.scene.tweens.add({
      targets: this,
      scaleX: SPRITE_SCALE * 0.8,
      scaleY: SPRITE_SCALE * 1.2,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  private onLand() {
    this.playerState.canDoubleJump = true;
    this.playerState.isJumping = false;
    this.playerState.isFalling = false;
    AudioManager.play('jump_land');
    
    // Landing squash
    this.scene.tweens.add({
      targets: this,
      scaleX: SPRITE_SCALE * 1.2,
      scaleY: SPRITE_SCALE * 0.8,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
    
    // Emit dust particles
    this.emitDust();
  }

  private emitDust() {
    const particles = this.scene.add.particles(this.x, this.y + 16, 'dust', {
      speed: { min: 20, max: 50 },
      angle: { min: -150, max: -30 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      quantity: 3,
    });
    
    this.scene.time.delayedCall(300, () => particles.destroy());
  }

  private handleFootsteps(time: number) {
    const vx = Math.abs(this.body?.velocity.x || 0);
    if (this.playerState.isGrounded && vx > 50) {
      const interval = this.playerState.isRunning ? 150 : 250;
      if (time - this.footstepTimer > interval) {
        AudioManager.play(this.playerState.isRunning ? 'footstep_run' : 'footstep_walk');
        this.footstepTimer = time;
      }
    }
  }

  private updateAnimation() {
    if (this.playerState.isStomping) {
      this.play('shpoko_stomp', true);
    } else if (this.playerState.isJumping) {
      this.play('shpoko_jump', true);
    } else if (this.playerState.isFalling) {
      this.play('shpoko_fall', true);
    } else if (Math.abs(this.body?.velocity.x || 0) > 10 && this.playerState.isGrounded) {
      this.play('shpoko_walk', true);
    } else {
      this.play('shpoko_idle', true);
    }
  }

  stomp() {
    this.playerState.isStomping = true;
    this.setVelocityY(-200); // Bounce up after stomp
    AudioManager.play('stomp');
    
    this.scene.time.delayedCall(200, () => {
      this.playerState.isStomping = false;
    });
  }

  hurt() {
    if (this.playerState.isHurt) return;
    
    this.playerState.isHurt = true;
    AudioManager.play('hurt');
    
    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.alpha = 1;
        this.playerState.isHurt = false;
      },
    });
    
    // Knockback
    const knockbackDir = this.playerState.facingRight ? -1 : 1;
    this.setVelocity(knockbackDir * 200, -150);
  }

  getState(): PlayerState {
    return { ...this.playerState };
  }
}
