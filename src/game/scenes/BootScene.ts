import Phaser from 'phaser';
import { COLORS, NODE_RADIUS } from '../config';
import shpokoMaleImg from '@/assets/game/shpoko-male.png';
import shpokoFemaleImg from '@/assets/game/shpoko-female.png';
import coyoteImg from '@/assets/game/enemy-coyote.png';
import vfxImg from '@/assets/game/vfx-sheet.png';
import worldNodesImg from '@/assets/game/world-nodes.png';
import tilesetSchoolImg from '@/assets/game/tileset-school.png';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const { width, height } = this.cameras.main;
    
    // Loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4ade80, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load generated sprites
    this.load.spritesheet('shpoko', shpokoMaleImg, { frameWidth: 85, frameHeight: 170 });
    this.load.spritesheet('shpoko_female', shpokoFemaleImg, { frameWidth: 85, frameHeight: 170 });
    this.load.spritesheet('coyote', coyoteImg, { frameWidth: 128, frameHeight: 256 });
    this.load.image('vfx', vfxImg);
    this.load.image('world_nodes', worldNodesImg);
    this.load.image('tileset_school', tilesetSchoolImg);

    // Generate programmatic sprites for world map
    this.generateSprites();
  }

  private generateSprites() {
    const r = NODE_RADIUS;
    const size = r * 2 + 8;

    // Node sprites
    this.createNodeSprite('node_unlocked', COLORS.nodeUnlocked, size, r);
    this.createNodeSprite('node_completed', COLORS.nodeCompleted, size, r, true);
    this.createNodeSprite('node_locked', COLORS.nodeLocked, size, r);
    this.createNodeSprite('node_dungeon', COLORS.nodeDungeon, size, r);
    
    // Highlight
    const highlight = this.make.graphics({ x: 0, y: 0 });
    highlight.lineStyle(4, COLORS.highlight, 1);
    highlight.strokeCircle(size / 2, size / 2, r + 6);
    highlight.generateTexture('node_highlight', size + 12, size + 12);
    highlight.destroy();

    // Decorations
    this.generateDecorations();
    
    // Dust particle
    const dust = this.make.graphics({ x: 0, y: 0 });
    dust.fillStyle(0xffffff, 0.6);
    dust.fillCircle(8, 8, 6);
    dust.generateTexture('dust', 16, 16);
    dust.destroy();
  }

  private createNodeSprite(key: string, color: number, size: number, r: number, hasStar = false) {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(color);
    g.fillCircle(size / 2, size / 2, r);
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(size / 2 - 8, size / 2 - 8, r / 3);
    g.lineStyle(3, 0xffffff, 0.8);
    g.strokeCircle(size / 2, size / 2, r);
    if (hasStar) {
      g.fillStyle(0xfbbf24);
      this.drawStar(g, size / 2, size / 2, 5, 12, 6);
    }
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private drawStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, spikes: number, outer: number, inner: number) {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    g.beginPath();
    g.moveTo(cx, cy - outer);
    for (let i = 0; i < spikes; i++) {
      g.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
      rot += step;
      g.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
      rot += step;
    }
    g.closePath();
    g.fillPath();
  }

  private generateDecorations() {
    // Cloud
    const cloud = this.make.graphics({ x: 0, y: 0 });
    cloud.fillStyle(0xffffff, 0.8);
    cloud.fillCircle(30, 25, 20);
    cloud.fillCircle(55, 20, 25);
    cloud.fillCircle(80, 25, 20);
    cloud.generateTexture('cloud', 100, 50);
    cloud.destroy();

    // Tree
    const tree = this.make.graphics({ x: 0, y: 0 });
    tree.fillStyle(0x78350f);
    tree.fillRect(22, 50, 16, 30);
    tree.fillStyle(0x22c55e);
    tree.fillCircle(30, 35, 25);
    tree.generateTexture('tree', 60, 80);
    tree.destroy();

    // Bush
    const bush = this.make.graphics({ x: 0, y: 0 });
    bush.fillStyle(0x16a34a);
    bush.fillCircle(20, 25, 18);
    bush.fillCircle(40, 25, 18);
    bush.generateTexture('bush', 60, 40);
    bush.destroy();

    // Star
    const star = this.make.graphics({ x: 0, y: 0 });
    star.fillStyle(0xffffff);
    this.drawStar(star, 10, 10, 4, 10, 4);
    star.generateTexture('star_deco', 20, 20);
    star.destroy();
  }

  create() {
    this.scene.start('WorldMapScene');
  }
}
