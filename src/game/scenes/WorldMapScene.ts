import Phaser from 'phaser';
import { COLORS, GAME_CONFIG } from '../config';
import { AdventureNode } from '@/hooks/useAdventure';

interface NodeData {
  node: AdventureNode;
  x: number;
  y: number;
  unlocked: boolean;
  completed: boolean;
}

export class WorldMapScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private nodes: Map<string, Phaser.GameObjects.Container> = new Map();
  private nodeData: NodeData[] = [];
  private currentNodeIndex: number = 0;
  private selectedNodeIndex: number = -1;
  private isMoving: boolean = false;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private clouds: Phaser.GameObjects.Image[] = [];
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private selectSound?: Phaser.Sound.BaseSound;
  private moveSound?: Phaser.Sound.BaseSound;
  private lockedSound?: Phaser.Sound.BaseSound;
  
  // Callbacks for React integration
  public onNodeSelect?: (node: AdventureNode) => void;
  public onEnterLevel?: (node: AdventureNode) => void;

  constructor() {
    super({ key: 'WorldMapScene' });
  }

  init(data: { 
    nodes: AdventureNode[]; 
    isNodeUnlocked: (node: AdventureNode) => boolean;
    isNodeCompleted: (id: string) => boolean;
    currentNodeIndex: number;
    onNodeSelect: (node: AdventureNode) => void;
    onEnterLevel: (node: AdventureNode) => void;
  }) {
    this.onNodeSelect = data.onNodeSelect;
    this.onEnterLevel = data.onEnterLevel;
    this.currentNodeIndex = data.currentNodeIndex;
    
    // Generate node positions along a winding path
    this.nodeData = data.nodes.map((node, index) => {
      const pos = this.generateNodePosition(index, data.nodes.length);
      return {
        node,
        x: pos.x,
        y: pos.y,
        unlocked: data.isNodeUnlocked(node),
        completed: data.isNodeCompleted(node.id),
      };
    });
  }

  generateNodePosition(index: number, total: number): { x: number; y: number } {
    const width = this.scale.width;
    const height = this.scale.height;
    const padding = 120;
    
    // Create a winding S-curve path
    const progress = index / Math.max(total - 1, 1);
    const waveAmplitude = (width - padding * 2) * 0.3;
    const waveFrequency = 2;
    
    const baseX = padding + (width - padding * 2) * progress;
    const waveOffset = Math.sin(progress * Math.PI * waveFrequency) * waveAmplitude;
    
    // Alternate rows
    const row = Math.floor(index / 5) % 2;
    const yBase = height * 0.75 - (progress * height * 0.5);
    
    return {
      x: row === 0 ? baseX + waveOffset * 0.3 : baseX - waveOffset * 0.3,
      y: yBase + Math.sin(index * 0.8) * 40,
    };
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Sky gradient background
    const skyGradient = this.add.graphics();
    skyGradient.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F4FF, 0xE0F4FF, 1);
    skyGradient.fillRect(0, 0, width, height);

    // Create ground
    this.createGround();

    // Create decorations
    this.createDecorations();

    // Create animated clouds
    this.createClouds();

    // Create path between nodes
    this.pathGraphics = this.add.graphics();
    this.drawPath();

    // Create node sprites
    this.createNodes();

    // Create player character
    this.createPlayer();

    // Create particle emitter for sparkles
    this.emitter = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      gravityY: 100,
      emitting: false,
    });

    // Create sounds using Web Audio (since we don't have audio files)
    this.createSounds();

    // Input handling
    this.input.keyboard?.on('keydown-LEFT', () => this.moveToNode(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveToNode(1));
    this.input.keyboard?.on('keydown-UP', () => this.moveToNode(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveToNode(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.enterSelectedNode());
    this.input.keyboard?.on('keydown-SPACE', () => this.enterSelectedNode());

    // Camera setup
    this.cameras.main.setBounds(0, 0, width * 1.5, height);
    
    // Initial selection
    if (this.nodeData.length > 0) {
      this.selectedNodeIndex = this.currentNodeIndex;
      this.focusOnNode(this.selectedNodeIndex, false);
    }
  }

  createSounds() {
    // Sounds are created dynamically using playTone
  }

  playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Audio not supported
    }
  }

  createGround() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Green grass ground
    const ground = this.add.graphics();
    ground.fillStyle(0x4ADE80, 1);
    ground.fillRect(0, height * 0.85, width * 1.5, height * 0.15);
    
    // Add grass texture
    ground.fillStyle(0x22C55E, 1);
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width * 1.5;
      const y = height * 0.85 + Math.random() * height * 0.15;
      ground.fillRect(x, y, 4, 8);
    }
  }

  createDecorations() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Add hills in background
    for (let i = 0; i < 5; i++) {
      const hill = this.add.image(
        200 + i * 400 + Math.random() * 100,
        height * 0.88,
        'hill'
      );
      hill.setScale(0.8 + Math.random() * 0.5);
      hill.setDepth(-2);
    }

    // Add trees
    for (let i = 0; i < 15; i++) {
      const tree = this.add.image(
        Math.random() * width * 1.5,
        height * 0.78 + Math.random() * 50,
        'tree'
      );
      tree.setScale(0.6 + Math.random() * 0.4);
      tree.setDepth(-1);
    }
  }

  createClouds() {
    const width = this.scale.width;
    const height = this.scale.height;

    for (let i = 0; i < 6; i++) {
      const cloud = this.add.image(
        Math.random() * width * 1.5,
        50 + Math.random() * 150,
        'cloud'
      );
      cloud.setScale(0.5 + Math.random() * 0.5);
      cloud.setDepth(-3);
      cloud.setAlpha(0.7 + Math.random() * 0.3);
      this.clouds.push(cloud);

      // Animate cloud movement
      this.tweens.add({
        targets: cloud,
        x: cloud.x + width * 1.5 + 200,
        duration: 30000 + Math.random() * 20000,
        repeat: -1,
        onRepeat: () => {
          cloud.x = -200;
        },
      });
    }
  }

  drawPath() {
    this.pathGraphics.clear();
    
    if (this.nodeData.length < 2) return;

    // Draw main path
    this.pathGraphics.lineStyle(20, 0xD4A373, 1);
    this.pathGraphics.beginPath();
    
    const firstNode = this.nodeData[0];
    this.pathGraphics.moveTo(firstNode.x, firstNode.y);
    
    for (let i = 1; i < this.nodeData.length; i++) {
      const prev = this.nodeData[i - 1];
      const curr = this.nodeData[i];
      
      // Create curved path with bezier
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      const controlOffset = (i % 2 === 0 ? 1 : -1) * 30;
      
      this.pathGraphics.lineTo(curr.x, curr.y);
    }
    
    this.pathGraphics.strokePath();

    // Draw dotted overlay
    this.pathGraphics.lineStyle(6, 0xFFE4C4, 0.6);
    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(firstNode.x, firstNode.y);
    
    for (let i = 1; i < this.nodeData.length; i++) {
      this.pathGraphics.lineTo(this.nodeData[i].x, this.nodeData[i].y);
    }
    
    this.pathGraphics.strokePath();
  }

  createNodes() {
    this.nodeData.forEach((data, index) => {
      const container = this.add.container(data.x, data.y);
      
      // Shadow
      const shadow = this.add.ellipse(0, 30, 60, 20, 0x000000, 0.3);
      container.add(shadow);

      // Node sprite
      const nodeType = data.node.is_dungeon ? 'node-dungeon' : 'node-level';
      const nodeSprite = this.add.image(0, 0, nodeType);
      nodeSprite.setScale(GAME_CONFIG.NODE_SCALE);
      
      // Apply visual state
      if (!data.unlocked) {
        nodeSprite.setTint(0x666666);
      } else if (data.completed) {
        nodeSprite.setTint(0xFFFFFF);
      }
      
      container.add(nodeSprite);

      // Level number text
      const levelText = this.add.text(0, 5, String(data.node.node_number), {
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);
      container.add(levelText);

      // Completed star
      if (data.completed) {
        const star = this.add.image(25, -30, 'star');
        star.setScale(0.8);
        container.add(star);
        
        // Star sparkle animation
        this.tweens.add({
          targets: star,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 500,
          yoyo: true,
          repeat: -1,
        });
      }

      // Lock icon for locked nodes
      if (!data.unlocked) {
        const lock = this.add.image(0, -40, 'lock');
        container.add(lock);
      }

      // Dungeon special effects
      if (data.node.is_dungeon && data.unlocked) {
        // Purple glow
        const glow = this.add.ellipse(0, 10, 90, 60, 0x9C27B0, 0.3);
        container.add(glow);
        container.sendToBack(glow);
        
        this.tweens.add({
          targets: glow,
          scaleX: 1.2,
          scaleY: 1.2,
          alpha: 0.1,
          duration: 1000,
          yoyo: true,
          repeat: -1,
        });
      }

      // Bounce animation for current node
      if (index === this.currentNodeIndex) {
        this.tweens.add({
          targets: container,
          y: data.y - 8,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }

      // Make interactive
      nodeSprite.setInteractive({ useHandCursor: true });
      nodeSprite.on('pointerdown', () => this.selectNode(index));
      nodeSprite.on('pointerover', () => {
        if (data.unlocked) {
          this.tweens.add({
            targets: container,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
          });
        }
      });
      nodeSprite.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        });
      });

      container.setDepth(1);
      this.nodes.set(data.node.id, container);
    });
  }

  createPlayer() {
    if (this.nodeData.length === 0) return;

    const startNode = this.nodeData[this.currentNodeIndex] || this.nodeData[0];
    
    this.player = this.add.sprite(startNode.x, startNode.y - 50, 'character');
    this.player.setScale(1.2);
    this.player.setDepth(10);

    // Idle bounce animation
    this.tweens.add({
      targets: this.player,
      y: startNode.y - 55,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  selectNode(index: number) {
    if (this.isMoving) return;
    
    const data = this.nodeData[index];
    if (!data) return;

    if (!data.unlocked) {
      this.playTone(200, 0.2, 'square'); // Error sound
      
      // Shake animation for locked node
      const container = this.nodes.get(data.node.id);
      if (container) {
        this.tweens.add({
          targets: container,
          x: data.x - 5,
          duration: 50,
          yoyo: true,
          repeat: 5,
          onComplete: () => {
            container.x = data.x;
          },
        });
      }
      return;
    }

    this.selectedNodeIndex = index;
    this.playTone(440, 0.1, 'sine'); // Select sound
    this.movePlayerToNode(index);
    
    if (this.onNodeSelect) {
      this.onNodeSelect(data.node);
    }
  }

  moveToNode(direction: number) {
    if (this.isMoving) return;
    
    const newIndex = this.selectedNodeIndex + direction;
    if (newIndex >= 0 && newIndex < this.nodeData.length) {
      this.selectNode(newIndex);
    }
  }

  movePlayerToNode(index: number) {
    const targetNode = this.nodeData[index];
    if (!targetNode || !this.player) return;

    this.isMoving = true;

    // Play walking sound
    this.playTone(330, 0.05, 'square');
    setTimeout(() => this.playTone(350, 0.05, 'square'), 100);
    setTimeout(() => this.playTone(370, 0.05, 'square'), 200);

    // Move player with bouncy animation
    this.tweens.add({
      targets: this.player,
      x: targetNode.x,
      y: targetNode.y - 50,
      duration: 500,
      ease: 'Back.easeOut',
      onUpdate: () => {
        // Squash and stretch
        const progress = this.tweens.getTweens()[0]?.progress || 0;
        this.player.setScale(1.2 + Math.sin(progress * Math.PI * 3) * 0.1);
      },
      onComplete: () => {
        this.isMoving = false;
        this.player.setScale(1.2);
        this.playTone(523, 0.1, 'sine'); // Arrival sound
        
        // Emit sparkles on arrival
        this.emitter.setPosition(targetNode.x, targetNode.y);
        this.emitter.explode(10);
        
        // Camera follow
        this.focusOnNode(index);
      },
    });
  }

  focusOnNode(index: number, animate: boolean = true) {
    const node = this.nodeData[index];
    if (!node) return;

    const camera = this.cameras.main;
    if (animate) {
      camera.pan(node.x, node.y, 300, 'Power2');
    } else {
      camera.centerOn(node.x, node.y);
    }
  }

  enterSelectedNode() {
    const data = this.nodeData[this.selectedNodeIndex];
    if (!data || !data.unlocked) return;

    // Play enter sound
    if (data.node.is_dungeon) {
      this.playTone(200, 0.3, 'sawtooth');
      setTimeout(() => this.playTone(180, 0.3, 'sawtooth'), 150);
      setTimeout(() => this.playTone(160, 0.5, 'sawtooth'), 300);
    } else {
      this.playTone(523, 0.1, 'sine');
      setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
      setTimeout(() => this.playTone(784, 0.15, 'sine'), 200);
    }

    // Zoom in animation
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.5,
      duration: 500,
      ease: 'Power2',
    });

    // Fade out
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.time.delayedCall(500, () => {
      if (this.onEnterLevel) {
        this.onEnterLevel(data.node);
      }
    });
  }

  update() {
    // Parallax effect for clouds
    const camera = this.cameras.main;
    this.clouds.forEach((cloud, i) => {
      cloud.x += 0.2 + i * 0.05;
      if (cloud.x > this.scale.width * 1.5 + 200) {
        cloud.x = -200;
      }
    });
  }
}
