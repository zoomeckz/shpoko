import Phaser from 'phaser';
import { COLORS, NODE_RADIUS } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
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

    // Generate all game graphics programmatically
    this.generateSprites();
  }

  private generateSprites() {
    // Generate Shpoko character sprite (raccoon)
    this.generateShpokoSprite();
    
    // Generate node sprites
    this.generateNodeSprites();
    
    // Generate decorations
    this.generateDecorations();
    
    // Generate path texture
    this.generatePathTexture();
  }

  private generateShpokoSprite() {
    const size = 48;
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Raccoon body (gray)
    graphics.fillStyle(0x6b7280);
    graphics.fillCircle(size / 2, size / 2 + 4, 16);
    
    // Raccoon head
    graphics.fillStyle(0x9ca3af);
    graphics.fillCircle(size / 2, size / 2 - 8, 14);
    
    // Ears
    graphics.fillStyle(0x4b5563);
    graphics.fillCircle(size / 2 - 10, size / 2 - 18, 6);
    graphics.fillCircle(size / 2 + 10, size / 2 - 18, 6);
    
    // Inner ears
    graphics.fillStyle(0xfda4af);
    graphics.fillCircle(size / 2 - 10, size / 2 - 18, 3);
    graphics.fillCircle(size / 2 + 10, size / 2 - 18, 3);
    
    // Mask (raccoon eye mask)
    graphics.fillStyle(0x1f2937);
    graphics.fillRoundedRect(size / 2 - 12, size / 2 - 12, 24, 8, 4);
    
    // Eyes
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(size / 2 - 6, size / 2 - 8, 4);
    graphics.fillCircle(size / 2 + 6, size / 2 - 8, 4);
    
    // Pupils
    graphics.fillStyle(0x1f2937);
    graphics.fillCircle(size / 2 - 5, size / 2 - 8, 2);
    graphics.fillCircle(size / 2 + 7, size / 2 - 8, 2);
    
    // Nose
    graphics.fillStyle(0x1f2937);
    graphics.fillCircle(size / 2, size / 2 - 2, 3);
    
    // Tail (striped)
    graphics.fillStyle(0x6b7280);
    graphics.fillRoundedRect(size / 2 + 12, size / 2 + 8, 12, 6, 3);
    graphics.fillStyle(0x1f2937);
    graphics.fillRect(size / 2 + 15, size / 2 + 8, 3, 6);
    graphics.fillRect(size / 2 + 21, size / 2 + 8, 3, 6);

    graphics.generateTexture('shpoko', size, size);
    graphics.destroy();
  }

  private generateNodeSprites() {
    const r = NODE_RADIUS;
    const size = r * 2 + 8;

    // Unlocked node (green castle)
    const unlocked = this.make.graphics({ x: 0, y: 0 });
    unlocked.fillStyle(COLORS.nodeUnlocked);
    unlocked.fillCircle(size / 2, size / 2, r);
    unlocked.fillStyle(0xffffff, 0.3);
    unlocked.fillCircle(size / 2 - 8, size / 2 - 8, r / 3);
    unlocked.lineStyle(3, 0xffffff, 0.8);
    unlocked.strokeCircle(size / 2, size / 2, r);
    // Castle tower icon
    unlocked.fillStyle(0xffffff);
    unlocked.fillRect(size / 2 - 8, size / 2 - 10, 16, 18);
    unlocked.fillRect(size / 2 - 12, size / 2 - 14, 6, 6);
    unlocked.fillRect(size / 2 + 6, size / 2 - 14, 6, 6);
    unlocked.fillStyle(COLORS.nodeUnlocked);
    unlocked.fillRect(size / 2 - 3, size / 2 + 2, 6, 8);
    unlocked.generateTexture('node_unlocked', size, size);
    unlocked.destroy();

    // Completed node (blue with star)
    const completed = this.make.graphics({ x: 0, y: 0 });
    completed.fillStyle(COLORS.nodeCompleted);
    completed.fillCircle(size / 2, size / 2, r);
    completed.fillStyle(0xffffff, 0.3);
    completed.fillCircle(size / 2 - 8, size / 2 - 8, r / 3);
    completed.lineStyle(3, 0xfbbf24, 1);
    completed.strokeCircle(size / 2, size / 2, r);
    // Star icon
    completed.fillStyle(0xfbbf24);
    this.drawStar(completed, size / 2, size / 2, 5, 12, 6);
    completed.generateTexture('node_completed', size, size);
    completed.destroy();

    // Locked node (gray)
    const locked = this.make.graphics({ x: 0, y: 0 });
    locked.fillStyle(COLORS.nodeLocked);
    locked.fillCircle(size / 2, size / 2, r);
    locked.lineStyle(2, 0x4b5563, 0.8);
    locked.strokeCircle(size / 2, size / 2, r);
    // Lock icon
    locked.fillStyle(0x4b5563);
    locked.fillRect(size / 2 - 6, size / 2 - 2, 12, 10);
    locked.lineStyle(3, 0x4b5563);
    locked.strokeCircle(size / 2, size / 2 - 6, 6);
    locked.generateTexture('node_locked', size, size);
    locked.destroy();

    // Dungeon node (purple with portal)
    const dungeon = this.make.graphics({ x: 0, y: 0 });
    dungeon.fillStyle(COLORS.nodeDungeon);
    dungeon.fillCircle(size / 2, size / 2, r);
    dungeon.fillStyle(0xffffff, 0.2);
    dungeon.fillCircle(size / 2 - 6, size / 2 - 6, r / 4);
    dungeon.lineStyle(3, 0xc084fc, 1);
    dungeon.strokeCircle(size / 2, size / 2, r);
    // Portal swirl
    dungeon.lineStyle(2, 0xe9d5ff);
    dungeon.strokeCircle(size / 2, size / 2, 10);
    dungeon.strokeCircle(size / 2, size / 2, 6);
    dungeon.fillStyle(0x1f0a3d);
    dungeon.fillCircle(size / 2, size / 2, 4);
    dungeon.generateTexture('node_dungeon', size, size);
    dungeon.destroy();

    // Current node highlight
    const highlight = this.make.graphics({ x: 0, y: 0 });
    highlight.lineStyle(4, COLORS.highlight, 1);
    highlight.strokeCircle(size / 2, size / 2, r + 6);
    highlight.generateTexture('node_highlight', size + 12, size + 12);
    highlight.destroy();
  }

  private drawStar(graphics: Phaser.GameObjects.Graphics, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }
    
    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
  }

  private generateDecorations() {
    // Cloud
    const cloud = this.make.graphics({ x: 0, y: 0 });
    cloud.fillStyle(0xffffff, 0.8);
    cloud.fillCircle(30, 25, 20);
    cloud.fillCircle(55, 20, 25);
    cloud.fillCircle(80, 25, 20);
    cloud.fillCircle(45, 35, 18);
    cloud.fillCircle(65, 35, 18);
    cloud.generateTexture('cloud', 100, 50);
    cloud.destroy();

    // Tree
    const tree = this.make.graphics({ x: 0, y: 0 });
    tree.fillStyle(0x78350f);
    tree.fillRect(22, 50, 16, 30);
    tree.fillStyle(0x22c55e);
    tree.fillCircle(30, 35, 25);
    tree.fillCircle(18, 45, 18);
    tree.fillCircle(42, 45, 18);
    tree.generateTexture('tree', 60, 80);
    tree.destroy();

    // Bush
    const bush = this.make.graphics({ x: 0, y: 0 });
    bush.fillStyle(0x16a34a);
    bush.fillCircle(20, 25, 18);
    bush.fillCircle(40, 25, 18);
    bush.fillCircle(30, 20, 16);
    bush.generateTexture('bush', 60, 40);
    bush.destroy();

    // Building (for city)
    const building = this.make.graphics({ x: 0, y: 0 });
    building.fillStyle(0x475569);
    building.fillRect(0, 20, 50, 80);
    building.fillStyle(0x64748b);
    building.fillRect(5, 0, 40, 25);
    // Windows
    building.fillStyle(0xfef08a);
    for (let y = 30; y < 90; y += 20) {
      for (let x = 8; x < 45; x += 15) {
        building.fillRect(x, y, 8, 12);
      }
    }
    building.generateTexture('building', 50, 100);
    building.destroy();

    // Star (for space)
    const star = this.make.graphics({ x: 0, y: 0 });
    star.fillStyle(0xffffff);
    this.drawStar(star, 10, 10, 4, 10, 4);
    star.generateTexture('star_deco', 20, 20);
    star.destroy();

    // Pipe (for sewer)
    const pipe = this.make.graphics({ x: 0, y: 0 });
    pipe.fillStyle(0x15803d);
    pipe.fillRect(0, 10, 40, 50);
    pipe.fillStyle(0x22c55e);
    pipe.fillRect(0, 0, 40, 15);
    pipe.fillStyle(0x166534);
    pipe.fillRect(5, 20, 30, 8);
    pipe.generateTexture('pipe', 40, 60);
    pipe.destroy();
  }

  private generatePathTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(COLORS.pathLine);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('path_dot', 8, 8);
    graphics.destroy();
  }

  create() {
    this.scene.start('WorldMapScene');
  }
}
