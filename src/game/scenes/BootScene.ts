import Phaser from 'phaser';

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
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 10);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading Adventure...', {
      font: '24px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffd700, 1);
      progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 8);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load assets - we'll create these programmatically
    this.createPlaceholderAssets();
  }

  createPlaceholderAssets() {
    // Create character sprite (Shpoko-like raccoon)
    const characterCanvas = this.textures.createCanvas('character', 64, 64);
    if (characterCanvas) {
      const ctx = characterCanvas.context;
      // Body (gray)
      ctx.fillStyle = '#6B7280';
      ctx.beginPath();
      ctx.ellipse(32, 38, 20, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Face mask (lighter)
      ctx.fillStyle = '#E5E7EB';
      ctx.beginPath();
      ctx.ellipse(32, 28, 16, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(26, 26, 4, 0, Math.PI * 2);
      ctx.arc(38, 26, 4, 0, Math.PI * 2);
      ctx.fill();
      // Eye highlights
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(27, 25, 2, 0, Math.PI * 2);
      ctx.arc(39, 25, 2, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(32, 32, 3, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#6B7280';
      ctx.beginPath();
      ctx.arc(18, 14, 8, 0, Math.PI * 2);
      ctx.arc(46, 14, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F9A8D4';
      ctx.beginPath();
      ctx.arc(18, 14, 4, 0, Math.PI * 2);
      ctx.arc(46, 14, 4, 0, Math.PI * 2);
      ctx.fill();
      // Tail stripes
      ctx.strokeStyle = '#4B5563';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(50, 50, 10, -0.5, 1, false);
      ctx.stroke();
      characterCanvas.refresh();
    }

    // Create level node (castle-like)
    const nodeCanvas = this.textures.createCanvas('node-level', 80, 80);
    if (nodeCanvas) {
      const ctx = nodeCanvas.context;
      // Base
      ctx.fillStyle = '#FCD34D';
      ctx.fillRect(15, 40, 50, 35);
      // Tower left
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(10, 25, 20, 50);
      // Tower right
      ctx.fillRect(50, 25, 20, 50);
      // Center tower
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(30, 10, 20, 45);
      // Roof left
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(5, 25);
      ctx.lineTo(20, 5);
      ctx.lineTo(35, 25);
      ctx.fill();
      // Roof right
      ctx.beginPath();
      ctx.moveTo(45, 25);
      ctx.lineTo(60, 5);
      ctx.lineTo(75, 25);
      ctx.fill();
      // Door
      ctx.fillStyle = '#7C2D12';
      ctx.fillRect(33, 55, 14, 20);
      // Windows
      ctx.fillStyle = '#60A5FA';
      ctx.fillRect(17, 35, 8, 10);
      ctx.fillRect(55, 35, 8, 10);
      nodeCanvas.refresh();
    }

    // Create dungeon node (purple castle)
    const dungeonCanvas = this.textures.createCanvas('node-dungeon', 80, 80);
    if (dungeonCanvas) {
      const ctx = dungeonCanvas.context;
      // Base
      ctx.fillStyle = '#7C3AED';
      ctx.fillRect(15, 40, 50, 35);
      // Towers
      ctx.fillStyle = '#6D28D9';
      ctx.fillRect(10, 20, 20, 55);
      ctx.fillRect(50, 20, 20, 55);
      // Spikes on towers
      ctx.fillStyle = '#4C1D95';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(15 + i * 7, 20);
        ctx.lineTo(18 + i * 7, 5);
        ctx.lineTo(21 + i * 7, 20);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(55 + i * 7, 20);
        ctx.lineTo(58 + i * 7, 5);
        ctx.lineTo(61 + i * 7, 20);
        ctx.fill();
      }
      // Skull decoration
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(40, 50, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4C1D95';
      ctx.beginPath();
      ctx.arc(36, 48, 3, 0, Math.PI * 2);
      ctx.arc(44, 48, 3, 0, Math.PI * 2);
      ctx.fill();
      // Door
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(33, 60, 14, 15);
      dungeonCanvas.refresh();
    }

    // Create completed star
    const starCanvas = this.textures.createCanvas('star', 32, 32);
    if (starCanvas) {
      const ctx = starCanvas.context;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      const cx = 16, cy = 16, spikes = 5, outerRadius = 14, innerRadius = 6;
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.stroke();
      starCanvas.refresh();
    }

    // Create lock icon
    const lockCanvas = this.textures.createCanvas('lock', 32, 32);
    if (lockCanvas) {
      const ctx = lockCanvas.context;
      ctx.fillStyle = '#6B7280';
      // Lock body
      ctx.fillRect(8, 16, 16, 14);
      // Lock shackle
      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(16, 14, 7, Math.PI, 0);
      ctx.stroke();
      // Keyhole
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(16, 22, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(14, 22, 4, 6);
      lockCanvas.refresh();
    }

    // Create particle for sparkles
    const sparkleCanvas = this.textures.createCanvas('sparkle', 16, 16);
    if (sparkleCanvas) {
      const ctx = sparkleCanvas.context;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      sparkleCanvas.refresh();
    }

    // Create cloud
    const cloudCanvas = this.textures.createCanvas('cloud', 128, 64);
    if (cloudCanvas) {
      const ctx = cloudCanvas.context;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(30, 40, 25, 0, Math.PI * 2);
      ctx.arc(60, 35, 30, 0, Math.PI * 2);
      ctx.arc(95, 40, 25, 0, Math.PI * 2);
      ctx.arc(50, 50, 20, 0, Math.PI * 2);
      ctx.arc(80, 50, 22, 0, Math.PI * 2);
      ctx.fill();
      cloudCanvas.refresh();
    }

    // Create grass tile
    const grassCanvas = this.textures.createCanvas('grass', 64, 64);
    if (grassCanvas) {
      const ctx = grassCanvas.context;
      ctx.fillStyle = '#4ADE80';
      ctx.fillRect(0, 0, 64, 64);
      // Add some texture
      ctx.fillStyle = '#22C55E';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(Math.random() * 60, Math.random() * 60, 4, 4);
      }
      grassCanvas.refresh();
    }

    // Create path tile
    const pathCanvas = this.textures.createCanvas('path-tile', 64, 64);
    if (pathCanvas) {
      const ctx = pathCanvas.context;
      ctx.fillStyle = '#D4A373';
      ctx.fillRect(0, 0, 64, 64);
      // Add dots for gravel look
      ctx.fillStyle = '#BC8A5F';
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 60 + 2, Math.random() * 60 + 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      pathCanvas.refresh();
    }

    // Create hill decoration
    const hillCanvas = this.textures.createCanvas('hill', 200, 100);
    if (hillCanvas) {
      const ctx = hillCanvas.context;
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.ellipse(100, 100, 100, 60, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.ellipse(100, 100, 80, 45, 0, Math.PI, 0);
      ctx.fill();
      hillCanvas.refresh();
    }

    // Create tree
    const treeCanvas = this.textures.createCanvas('tree', 64, 96);
    if (treeCanvas) {
      const ctx = treeCanvas.context;
      // Trunk
      ctx.fillStyle = '#92400E';
      ctx.fillRect(26, 60, 12, 36);
      // Foliage layers
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.moveTo(32, 0);
      ctx.lineTo(60, 40);
      ctx.lineTo(4, 40);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.moveTo(32, 15);
      ctx.lineTo(58, 55);
      ctx.lineTo(6, 55);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4ADE80';
      ctx.beginPath();
      ctx.moveTo(32, 30);
      ctx.lineTo(55, 70);
      ctx.lineTo(9, 70);
      ctx.closePath();
      ctx.fill();
      treeCanvas.refresh();
    }
  }

  create() {
    this.scene.start('WorldMapScene');
  }
}
