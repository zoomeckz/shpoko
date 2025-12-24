import Phaser from 'phaser';
import { 
  GAME_WIDTH, GAME_HEIGHT, MAP_WIDTH, MAP_HEIGHT, 
  NODE_RADIUS, COLORS, WALK_DURATION, BOUNCE_AMPLITUDE, PULSE_SCALE 
} from '../config';
import { WorldNode, GameData, WORLD_ZONES, WorldZone } from '../types';

interface NodeSprite {
  node: WorldNode;
  sprite: Phaser.GameObjects.Sprite;
  label: Phaser.GameObjects.Text;
  highlight?: Phaser.GameObjects.Sprite;
}

export class WorldMapScene extends Phaser.Scene {
  private nodes: WorldNode[] = [];
  private nodeSprites: Map<string, NodeSprite> = new Map();
  private shpoko!: Phaser.GameObjects.Sprite;
  private selectedNodeId: string | null = null;
  private currentNodeId: string | null = null;
  private callbacks!: GameData['callbacks'];
  private isMoving = false;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private decorations: Phaser.GameObjects.Sprite[] = [];

  constructor() {
    super({ key: 'WorldMapScene' });
  }

  init(data: GameData) {
    this.nodes = data.nodes || [];
    this.currentNodeId = data.currentNodeId;
    this.callbacks = data.callbacks;
  }

  create() {
    // Set up camera bounds
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    
    // Draw background gradient
    this.createBackground();
    
    // Add decorations per world zone
    this.addDecorations();
    
    // Draw paths between nodes
    this.pathGraphics = this.add.graphics();
    this.drawPaths();
    
    // Create node sprites
    this.createNodes();
    
    // Create Shpoko character
    this.createShpoko();
    
    // Set up input
    this.setupInput();
    
    // Focus camera on current or first unlocked node
    this.focusOnCurrentNode();
    
    // Start idle animations
    this.startAnimations();
  }

  private createBackground() {
    // Create gradient background
    const bg = this.add.graphics();
    
    // Sky gradient
    const topColor = Phaser.Display.Color.IntegerToColor(0x1e3a5f);
    const bottomColor = Phaser.Display.Color.IntegerToColor(0x0f172a);
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const ratio = y / MAP_HEIGHT;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(topColor, bottomColor, 1, ratio);
      bg.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      bg.fillRect(0, y, MAP_WIDTH, 1);
    }
    
    // Ground layer
    bg.fillStyle(0x3f6212);
    bg.fillRect(0, MAP_HEIGHT - 80, MAP_WIDTH, 80);
    
    // Ground highlight
    bg.fillStyle(0x4d7c0f);
    bg.fillRect(0, MAP_HEIGHT - 80, MAP_WIDTH, 4);
  }

  private addDecorations() {
    // Add clouds
    for (let i = 0; i < 8; i++) {
      const cloud = this.add.sprite(
        Phaser.Math.Between(50, MAP_WIDTH - 50),
        Phaser.Math.Between(30, 200),
        'cloud'
      );
      cloud.setAlpha(0.6);
      cloud.setScale(Phaser.Math.FloatBetween(0.5, 1.2));
      this.decorations.push(cloud);
      
      // Slow cloud drift
      this.tweens.add({
        targets: cloud,
        x: cloud.x + Phaser.Math.Between(20, 50),
        duration: Phaser.Math.Between(8000, 15000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    // Add trees and bushes near ground
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(30, MAP_WIDTH - 30);
      const tree = this.add.sprite(x, MAP_HEIGHT - 80, 'tree');
      tree.setOrigin(0.5, 1);
      tree.setScale(Phaser.Math.FloatBetween(0.6, 1));
      this.decorations.push(tree);
    }
    
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(20, MAP_WIDTH - 20);
      const bush = this.add.sprite(x, MAP_HEIGHT - 75, 'bush');
      bush.setOrigin(0.5, 1);
      bush.setScale(Phaser.Math.FloatBetween(0.5, 0.9));
      this.decorations.push(bush);
    }
    
    // Add stars in the sky
    for (let i = 0; i < 30; i++) {
      const star = this.add.sprite(
        Phaser.Math.Between(10, MAP_WIDTH - 10),
        Phaser.Math.Between(10, 250),
        'star_deco'
      );
      star.setScale(Phaser.Math.FloatBetween(0.3, 0.8));
      star.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
      this.decorations.push(star);
      
      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: star.alpha * 0.3,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private drawPaths() {
    this.pathGraphics.clear();
    
    // Sort nodes by position to draw paths between adjacent nodes
    const sortedNodes = [...this.nodes].sort((a, b) => a.nodeNumber - b.nodeNumber);
    
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      const nodeA = sortedNodes[i];
      const nodeB = sortedNodes[i + 1];
      
      const isUnlocked = this.callbacks.isNodeUnlocked(nodeA.id) && 
                         this.callbacks.isNodeUnlocked(nodeB.id);
      
      const color = isUnlocked ? COLORS.pathLine : COLORS.pathLineLocked;
      this.pathGraphics.lineStyle(6, color, isUnlocked ? 0.8 : 0.4);
      
      // Draw curved path
      const midX = (nodeA.x + nodeB.x) / 2;
      const midY = (nodeA.y + nodeB.y) / 2 - 30;
      
      const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(nodeA.x, nodeA.y),
        new Phaser.Math.Vector2(midX, midY),
        new Phaser.Math.Vector2(nodeB.x, nodeB.y)
      );
      
      curve.draw(this.pathGraphics);
      
      // Add dotted effect
      const points = curve.getPoints(10);
      for (let j = 0; j < points.length; j += 2) {
        this.pathGraphics.fillStyle(color, isUnlocked ? 1 : 0.5);
        this.pathGraphics.fillCircle(points[j].x, points[j].y, 3);
      }
    }
  }

  private createNodes() {
    this.nodes.forEach((node) => {
      const isUnlocked = this.callbacks.isNodeUnlocked(node.id);
      const isCompleted = this.callbacks.isNodeCompleted(node.id);
      
      // Determine sprite texture
      let textureKey = 'node_locked';
      if (node.isDungeon && isUnlocked) {
        textureKey = 'node_dungeon';
      } else if (isCompleted) {
        textureKey = 'node_completed';
      } else if (isUnlocked) {
        textureKey = 'node_unlocked';
      }
      
      const sprite = this.add.sprite(node.x, node.y, textureKey);
      sprite.setInteractive({ useHandCursor: isUnlocked });
      
      // Node label
      const label = this.add.text(node.x, node.y + NODE_RADIUS + 16, node.title, {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        stroke: '#1f2937',
        strokeThickness: 3,
        align: 'center',
      }).setOrigin(0.5);
      
      // Create highlight for current node
      let highlight: Phaser.GameObjects.Sprite | undefined;
      if (this.currentNodeId === node.id || (!this.currentNodeId && isUnlocked && !isCompleted)) {
        highlight = this.add.sprite(node.x, node.y, 'node_highlight');
        highlight.setDepth(-1);
        
        // Pulse animation
        this.tweens.add({
          targets: highlight,
          scale: PULSE_SCALE,
          alpha: 0.6,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        
        // Set as selected by default
        if (!this.selectedNodeId) {
          this.selectedNodeId = node.id;
        }
      }
      
      // Store sprite reference
      this.nodeSprites.set(node.id, { node, sprite, label, highlight });
      
      // Click handler
      sprite.on('pointerdown', () => {
        if (isUnlocked) {
          this.selectNode(node.id);
        } else {
          this.playLockedSound();
        }
      });
      
      // Hover effects
      sprite.on('pointerover', () => {
        if (isUnlocked) {
          this.tweens.add({
            targets: sprite,
            scale: 1.15,
            duration: 100,
            ease: 'Back.easeOut'
          });
        }
      });
      
      sprite.on('pointerout', () => {
        this.tweens.add({
          targets: sprite,
          scale: 1,
          duration: 100,
          ease: 'Quad.easeOut'
        });
      });
    });
  }

  private createShpoko() {
    // Find starting position (current or first unlocked node)
    let startNode = this.nodes.find(n => n.id === this.currentNodeId);
    if (!startNode) {
      startNode = this.nodes.find(n => this.callbacks.isNodeUnlocked(n.id));
    }
    if (!startNode && this.nodes.length > 0) {
      startNode = this.nodes[0];
    }
    
    const startX = startNode?.x || GAME_WIDTH / 2;
    const startY = startNode ? startNode.y - NODE_RADIUS - 24 : GAME_HEIGHT / 2;
    
    this.shpoko = this.add.sprite(startX, startY, 'shpoko');
    this.shpoko.setScale(1.2);
    this.shpoko.setDepth(10);
    
    // Idle bounce animation
    this.tweens.add({
      targets: this.shpoko,
      y: startY - BOUNCE_AMPLITUDE,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    if (startNode) {
      this.currentNodeId = startNode.id;
      this.selectedNodeId = startNode.id;
    }
  }

  private setupInput() {
    // Keyboard navigation
    this.input.keyboard?.on('keydown-LEFT', () => this.navigateNodes(-1, 0));
    this.input.keyboard?.on('keydown-RIGHT', () => this.navigateNodes(1, 0));
    this.input.keyboard?.on('keydown-UP', () => this.navigateNodes(0, -1));
    this.input.keyboard?.on('keydown-DOWN', () => this.navigateNodes(0, 1));
    this.input.keyboard?.on('keydown-A', () => this.navigateNodes(-1, 0));
    this.input.keyboard?.on('keydown-D', () => this.navigateNodes(1, 0));
    this.input.keyboard?.on('keydown-W', () => this.navigateNodes(0, -1));
    this.input.keyboard?.on('keydown-S', () => this.navigateNodes(0, 1));
    
    this.input.keyboard?.on('keydown-ENTER', () => this.enterSelectedLevel());
    this.input.keyboard?.on('keydown-SPACE', () => this.enterSelectedLevel());
    
    // Camera drag
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && !this.isMoving) {
        this.cameras.main.scrollX -= pointer.velocity.x * 0.5;
        this.cameras.main.scrollY -= pointer.velocity.y * 0.5;
      }
    });
  }

  private navigateNodes(dx: number, dy: number) {
    if (this.isMoving || !this.selectedNodeId) return;
    
    const currentSprite = this.nodeSprites.get(this.selectedNodeId);
    if (!currentSprite) return;
    
    // Find closest node in direction
    let closestNode: WorldNode | null = null;
    let closestDist = Infinity;
    
    this.nodes.forEach(node => {
      if (node.id === this.selectedNodeId) return;
      if (!this.callbacks.isNodeUnlocked(node.id)) return;
      
      const nodeDx = node.x - currentSprite.node.x;
      const nodeDy = node.y - currentSprite.node.y;
      
      // Check if node is in the right direction
      const matchX = dx === 0 || (dx > 0 && nodeDx > 50) || (dx < 0 && nodeDx < -50);
      const matchY = dy === 0 || (dy > 0 && nodeDy > 50) || (dy < 0 && nodeDy < -50);
      
      if (matchX && matchY) {
        const dist = Math.sqrt(nodeDx * nodeDx + nodeDy * nodeDy);
        if (dist < closestDist) {
          closestDist = dist;
          closestNode = node;
        }
      }
    });
    
    if (closestNode) {
      this.moveToNode(closestNode.id);
    }
  }

  private selectNode(nodeId: string) {
    if (this.selectedNodeId === nodeId) {
      // Double-click to enter
      this.enterSelectedLevel();
      return;
    }
    
    this.moveToNode(nodeId);
  }

  private moveToNode(nodeId: string) {
    if (this.isMoving) return;
    
    const targetSprite = this.nodeSprites.get(nodeId);
    if (!targetSprite) return;
    
    // Remove old highlight
    if (this.selectedNodeId) {
      const oldSprite = this.nodeSprites.get(this.selectedNodeId);
      if (oldSprite?.highlight) {
        oldSprite.highlight.destroy();
        oldSprite.highlight = undefined;
      }
    }
    
    this.selectedNodeId = nodeId;
    this.currentNodeId = nodeId;
    
    // Add new highlight
    const highlight = this.add.sprite(targetSprite.node.x, targetSprite.node.y, 'node_highlight');
    highlight.setDepth(-1);
    this.tweens.add({
      targets: highlight,
      scale: PULSE_SCALE,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    targetSprite.highlight = highlight;
    
    // Move Shpoko
    this.isMoving = true;
    const targetY = targetSprite.node.y - NODE_RADIUS - 24;
    
    // Play walk sound
    this.playWalkSound();
    
    this.tweens.add({
      targets: this.shpoko,
      x: targetSprite.node.x,
      y: targetY,
      duration: WALK_DURATION,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        this.isMoving = false;
        this.playArrivalSound();
        
        // Notify React
        this.callbacks.onNodeSelect(nodeId);
        
        // Resume idle animation
        this.tweens.add({
          targets: this.shpoko,
          y: targetY - BOUNCE_AMPLITUDE,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
    
    // Camera follow
    this.cameras.main.pan(
      targetSprite.node.x,
      targetSprite.node.y,
      400,
      'Quad.easeInOut'
    );
  }

  private enterSelectedLevel() {
    if (!this.selectedNodeId || this.isMoving) return;
    
    const nodeSprite = this.nodeSprites.get(this.selectedNodeId);
    if (!nodeSprite) return;
    
    // Play enter sound
    this.playEnterSound();
    
    // Zoom effect
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.5,
      duration: 300,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.callbacks.onEnterLevel(this.selectedNodeId!);
      }
    });
    
    // Shpoko jump animation
    this.tweens.add({
      targets: this.shpoko,
      y: this.shpoko.y - 30,
      scaleX: 1.3,
      scaleY: 0.9,
      duration: 150,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  private focusOnCurrentNode() {
    let focusNode = this.nodes.find(n => n.id === this.selectedNodeId);
    if (!focusNode) {
      focusNode = this.nodes.find(n => this.callbacks.isNodeUnlocked(n.id));
    }
    
    if (focusNode) {
      this.cameras.main.centerOn(focusNode.x, focusNode.y);
    }
  }

  private startAnimations() {
    // Node floating animation for unlocked nodes
    this.nodeSprites.forEach((nodeSprite) => {
      if (this.callbacks.isNodeUnlocked(nodeSprite.node.id)) {
        this.tweens.add({
          targets: nodeSprite.sprite,
          y: nodeSprite.node.y - 3,
          duration: 1500 + Math.random() * 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
  }

  // Sound methods using Web Audio
  private playWalkSound() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 200;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialDecayTo?.(0.01, ctx.currentTime + 0.1) || 
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  private playArrivalSound() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.15);
      });
    } catch (e) {}
  }

  private playEnterSound() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [392, 523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.2);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.2);
      });
    } catch (e) {}
  }

  private playLockedSound() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 150;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  // Called from React to update state
  public updateNodes(nodes: WorldNode[], currentNodeId: string | null) {
    this.nodes = nodes;
    this.currentNodeId = currentNodeId;
    
    // Redraw paths and update node states
    this.drawPaths();
    
    // Update node sprites
    this.nodeSprites.forEach((nodeSprite, id) => {
      const isUnlocked = this.callbacks.isNodeUnlocked(id);
      const isCompleted = this.callbacks.isNodeCompleted(id);
      
      let textureKey = 'node_locked';
      if (nodeSprite.node.isDungeon && isUnlocked) {
        textureKey = 'node_dungeon';
      } else if (isCompleted) {
        textureKey = 'node_completed';
      } else if (isUnlocked) {
        textureKey = 'node_unlocked';
      }
      
      nodeSprite.sprite.setTexture(textureKey);
      nodeSprite.sprite.setInteractive({ useHandCursor: isUnlocked });
    });
  }
}
