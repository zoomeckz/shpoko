/**
 * Fruit Slicer: fruits carrying Cyrillic letters are tossed up the screen.
 * Slice every fruit whose letter makes the target sound, leave the rest.
 *
 * Pure canvas engine: physics, drawing, slicing and scoring. The React page
 * (src/pages/FruitSlicer.tsx) shows the menus and the HUD.
 */
import type { Sfx } from "@/lib/sfx";

/* ---------- Letters ---------- */

export interface GameLetter {
  char: string;
  sound: string;
}

// Every letter from the course except Ь (it only appears before О).
export const LETTERS: GameLetter[] = [
  { char: "А", sound: "a" }, { char: "Б", sound: "b" }, { char: "В", sound: "v" }, { char: "Г", sound: "g" },
  { char: "Д", sound: "d" }, { char: "Е", sound: "e" }, { char: "Ж", sound: "zh" }, { char: "З", sound: "z" },
  { char: "И", sound: "i" }, { char: "Й", sound: "y" }, { char: "К", sound: "k" }, { char: "Л", sound: "l" },
  { char: "М", sound: "m" }, { char: "Н", sound: "n" }, { char: "О", sound: "o" }, { char: "П", sound: "p" },
  { char: "Р", sound: "r" }, { char: "С", sound: "s" }, { char: "Т", sound: "t" }, { char: "У", sound: "u" },
  { char: "Ф", sound: "f" }, { char: "Х", sound: "h" }, { char: "Ц", sound: "ts" }, { char: "Ч", sound: "ch" },
  { char: "Ш", sound: "sh" }, { char: "Щ", sound: "sht" }, { char: "Ъ", sound: "ă" }, { char: "Ю", sound: "yu" },
  { char: "Я", sound: "ya" },
];

// Letters that are easy to mix up; used as the wrong fruits more often.
const LOOKALIKES: Record<string, string[]> = {
  Ш: ["Щ", "Ц"], Щ: ["Ш", "Ц"], Ц: ["Щ", "Ч"], Ч: ["Ц", "У"], Ж: ["З", "Х", "Ш"], З: ["Ж", "Е"],
  И: ["Й", "Н"], Й: ["И", "Н"], Н: ["И", "П"], П: ["Н", "Л"], Л: ["Д", "П"], Д: ["Л", "Б"],
  Б: ["В", "Ъ"], В: ["Б", "Ъ"], Ъ: ["Б", "В"], Р: ["Я", "П"], Я: ["Р", "Ю"], Ю: ["Я", "О"],
  У: ["Ч", "Х"], Х: ["Ж", "К"], С: ["З", "Е"], Е: ["З", "С"], Г: ["Т", "П"], Т: ["Г", "П"],
  К: ["Х", "Ж"], М: ["Н", "Л"], О: ["Ю", "С"], А: ["Я", "Д"], Ф: ["О", "Р"],
};

/* ---------- Fruit looks ---------- */

interface FruitStyle {
  skin: string;
  light: string;
  dark: string;
  flesh: string;
  shape: "round" | "oval" | "melon";
  stem?: boolean;
  leaf?: boolean;
  seeds?: string;
}

const FRUITS: FruitStyle[] = [
  { skin: "#e53935", light: "#ff8a80", dark: "#8e1515", flesh: "#fff1c1", shape: "round", stem: true, leaf: true }, // apple
  { skin: "#fb8c00", light: "#ffcc80", dark: "#a65200", flesh: "#ffb74d", shape: "round", leaf: true }, // orange
  { skin: "#fdd835", light: "#fff59d", dark: "#b89a00", flesh: "#fff8b0", shape: "oval" }, // lemon
  { skin: "#7cb342", light: "#c5e1a5", dark: "#3f6b17", flesh: "#d8f0a2", shape: "oval" }, // lime
  { skin: "#8e44ad", light: "#d7a6ee", dark: "#4f1c66", flesh: "#f6cf63", shape: "round", stem: true }, // plum
  { skin: "#ff8a65", light: "#ffd0bf", dark: "#c1452a", flesh: "#ffd59e", shape: "round", leaf: true }, // peach
  { skin: "#43a047", light: "#a5d6a7", dark: "#1b5e20", flesh: "#ef5350", shape: "melon", seeds: "#2b1a12" }, // melon
];

/* ---------- State types ---------- */

interface Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  style: FruitStyle;
  letter: GameLetter;
  isTarget: boolean;
}

interface Half {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  side: 1 | -1;
  style: FruitStyle;
  life: number;
}

interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  life: number;
  max: number;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  size: number;
}

export interface HudState {
  score: number;
  lives: number;
  target: GameLetter;
  /** Correct slices left before the target sound changes. */
  untilNext: number;
}

export interface GameResult {
  score: number;
  correct: number;
  wrong: number;
  missed: number;
  bestCombo: number;
  seconds: number;
  /** The sounds this game asked for, in order. */
  sounds: string[];
}

interface Options {
  sfx: Sfx;
  onUpdate: (hud: HudState) => void;
  /** A new target sound was picked (not called for the first one). */
  onNewTarget: (letter: GameLetter) => void;
  onGameOver: (result: GameResult) => void;
}

const START_LIVES = 3;
const PER_TARGET = 5;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

/* ---------- Engine ---------- */

export class FruitSlicerEngine {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private running = false;
  private over = false;
  private overTimer = 0;

  private fruits: Fruit[] = [];
  private halves: Half[] = [];
  private drops: Drop[] = [];
  private texts: FloatText[] = [];
  private queue: { at: number; fruit: Fruit }[] = [];

  private trail: { x: number; y: number; t: number }[] = [];
  private slicing = false;
  private swipeCorrect = 0;

  private score = 0;
  private lives = START_LIVES;
  private target: GameLetter = LETTERS[0];
  private untilNext = PER_TARGET;
  private correct = 0;
  private wrong = 0;
  private missed = 0;
  private streak = 0;
  private bestCombo = 0;
  private elapsed = 0;
  private waveTimer = 0;
  private flash = 0;
  private shake = 0;
  private sounds: string[] = [];

  private resizeObserver: ResizeObserver;

  constructor(private canvas: HTMLCanvasElement, private opts: Options) {
    this.ctx = canvas.getContext("2d")!;
    // A canvas doesn't fetch web fonts by itself; ask for the Bulgarian letters up front.
    document.fonts?.load('900 40px "Shpoko Cyrillic"', "Дд").catch(() => {});
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    canvas.addEventListener("pointerdown", this.onDown);
    canvas.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp);
    canvas.addEventListener("pointercancel", this.onUp);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  /** Starts (or restarts) a game. */
  start() {
    this.fruits = [];
    this.halves = [];
    this.drops = [];
    this.texts = [];
    this.queue = [];
    this.score = 0;
    this.lives = START_LIVES;
    this.correct = this.wrong = this.missed = this.streak = this.bestCombo = 0;
    this.elapsed = 0;
    this.waveTimer = 0.6;
    this.flash = this.shake = 0;
    this.over = false;
    this.overTimer = 0;
    this.sounds = [];
    this.pickTarget(true);
    this.running = true;
    this.emit();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onUp);
    this.canvas.removeEventListener("pointercancel", this.onUp);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  /* ----- setup ----- */

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
  }

  private get radius() {
    return Math.max(34, Math.min(58, Math.min(this.w, this.h) * 0.075));
  }

  private pickTarget(first = false) {
    let next = pick(LETTERS);
    while (next.char === this.target.char && !first) next = pick(LETTERS);
    this.target = next;
    this.untilNext = PER_TARGET;
    this.sounds.push(next.sound);
    if (!first) this.opts.onNewTarget(next);
  }

  private emit() {
    this.opts.onUpdate({ score: this.score, lives: this.lives, target: this.target, untilNext: this.untilNext });
  }

  /* ----- spawning ----- */

  private get level() {
    return 1 + Math.floor(this.elapsed / 20);
  }

  private spawnWave() {
    const count = Math.min(4, 1 + Math.floor(Math.random() * Math.min(3, this.level)));
    const targetSlot = Math.floor(Math.random() * count);
    for (let i = 0; i < count; i++) {
      const isTarget = i === targetSlot || Math.random() < 0.3;
      const letter = isTarget ? this.target : this.distractor();
      this.queue.push({ at: this.elapsed + i * rand(0.12, 0.3), fruit: this.makeFruit(letter, isTarget) });
    }
  }

  private distractor(): GameLetter {
    const similar = (LOOKALIKES[this.target.char] ?? []).filter((c) => c !== this.target.char);
    if (similar.length && Math.random() < 0.55) {
      const char = pick(similar);
      return LETTERS.find((l) => l.char === char) ?? pick(LETTERS);
    }
    let l = pick(LETTERS);
    while (l.char === this.target.char) l = pick(LETTERS);
    return l;
  }

  private makeFruit(letter: GameLetter, isTarget: boolean): Fruit {
    const r = this.radius;
    const g = this.gravity;
    const peak = rand(0.5, 0.82) * this.h;
    const vy = -Math.sqrt(2 * g * peak);
    const x = rand(0.12, 0.88) * this.w;
    const flight = (2 * -vy) / g;
    const landX = rand(0.25, 0.75) * this.w;
    return {
      x,
      y: this.h + r,
      vx: (landX - x) / flight,
      vy,
      r,
      rot: rand(0, Math.PI * 2),
      vr: rand(-2.5, 2.5),
      style: pick(FRUITS),
      letter,
      isTarget,
    };
  }

  private get gravity() {
    // Slightly heavier as the game speeds up, so fruits fly faster.
    return this.h * (1.15 + Math.min(this.level - 1, 5) * 0.08);
  }

  /* ----- input ----- */

  private point(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() };
  }

  private onDown = (e: PointerEvent) => {
    if (!this.running) return;
    this.slicing = true;
    this.swipeCorrect = 0;
    this.trail = [this.point(e)];
    this.canvas.setPointerCapture?.(e.pointerId);
  };

  private onMove = (e: PointerEvent) => {
    if (!this.slicing || !this.running) return;
    const p = this.point(e);
    const prev = this.trail[this.trail.length - 1];
    this.trail.push(p);
    if (prev) this.sliceAlong(prev, p);
  };

  private onUp = () => {
    if (this.slicing && this.swipeCorrect >= 2) this.comboBonus(this.swipeCorrect);
    this.slicing = false;
    this.swipeCorrect = 0;
  };

  private onVisibility = () => {
    // Don't let fruit fall while the tab is hidden.
    this.last = performance.now();
  };

  /* ----- slicing ----- */

  private sliceAlong(a: { x: number; y: number }, b: { x: number; y: number }) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 < 4) return;
    for (const f of [...this.fruits]) {
      // Distance from the fruit's centre to the blade segment.
      const t = Math.max(0, Math.min(1, ((f.x - a.x) * dx + (f.y - a.y) * dy) / len2));
      const px = a.x + t * dx - f.x;
      const py = a.y + t * dy - f.y;
      if (px * px + py * py <= (f.r * 0.95) ** 2) this.slice(f, Math.atan2(dy, dx));
    }
  }

  private slice(f: Fruit, angle: number) {
    this.fruits = this.fruits.filter((x) => x !== f);
    this.opts.sfx.slice();

    // Two halves flying apart along the cut.
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    for (const side of [1, -1] as const) {
      this.halves.push({
        x: f.x + side * nx * 4,
        y: f.y + side * ny * 4,
        vx: f.vx + side * nx * 140 + Math.cos(angle) * 60,
        vy: Math.min(f.vy, 0) * 0.4 + side * ny * 140 - 60,
        r: f.r,
        rot: angle,
        vr: side * rand(1.5, 3.5),
        side,
        style: f.style,
        life: 2.5,
      });
    }
    // Juice
    for (let i = 0; i < 16; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(120, 480);
      const max = rand(0.35, 0.75);
      this.drops.push({ x: f.x, y: f.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, r: rand(2, 6), color: f.style.flesh, life: max, max });
    }

    if (f.isTarget) {
      this.correct++;
      this.streak++;
      this.swipeCorrect++;
      this.score += 10;
      this.untilNext--;
      this.texts.push({ x: f.x, y: f.y - f.r, text: "+10", color: "#ffd84d", life: 0.8, size: 26 });
      this.opts.sfx.correct(this.streak);
      if (this.untilNext <= 0) this.pickTarget();
    } else {
      this.wrong++;
      this.streak = 0;
      this.loseLife(f.x, f.y - f.r, `${f.letter.char} is “${f.letter.sound}”`);
    }
    this.emit();
  }

  private comboBonus(n: number) {
    const bonus = (n - 1) * 5;
    this.score += bonus;
    this.bestCombo = Math.max(this.bestCombo, n);
    const last = this.trail[this.trail.length - 1] ?? { x: this.w / 2, y: this.h / 2 };
    this.texts.push({ x: last.x, y: last.y - 30, text: `${n}× combo! +${bonus}`, color: "#7dd3fc", life: 1.1, size: 30 });
    this.opts.sfx.match(n);
    this.emit();
  }

  private loseLife(x: number, y: number, message: string) {
    this.lives = Math.max(0, this.lives - 1);
    this.flash = 1;
    this.shake = 0.3;
    this.texts.push({ x, y, text: message, color: "#ff6b6b", life: 1.3, size: 22 });
    this.opts.sfx.wrong();
    if (this.lives === 0 && !this.over) {
      this.over = true;
      this.running = false;
      this.slicing = false;
      this.overTimer = 1.2;
    }
  }

  /* ----- loop ----- */

  private loop(now: number) {
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  }

  private update(dt: number) {
    if (this.running) {
      this.elapsed += dt;
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.spawnWave();
        this.waveTimer = Math.max(0.85, 2.1 - (this.level - 1) * 0.18) + rand(-0.15, 0.25);
      }
      for (const q of this.queue.filter((q) => q.at <= this.elapsed)) this.fruits.push(q.fruit);
      this.queue = this.queue.filter((q) => q.at > this.elapsed);
    }

    const g = this.gravity;
    for (const f of this.fruits) {
      f.vy += g * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.rot += f.vr * dt;
    }
    // Fruit that fell off the bottom
    for (const f of this.fruits.filter((f) => f.vy > 0 && f.y - f.r > this.h)) {
      this.fruits = this.fruits.filter((x) => x !== f);
      if (f.isTarget && this.running) {
        this.missed++;
        this.streak = 0;
        this.loseLife(Math.min(Math.max(f.x, 80), this.w - 80), this.h - 40, `Missed ${f.letter.char}!`);
        this.emit();
      }
    }

    for (const h of this.halves) {
      h.vy += g * dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.rot += h.vr * dt;
      h.life -= dt;
    }
    this.halves = this.halves.filter((h) => h.life > 0 && h.y - h.r < this.h + 40);

    for (const d of this.drops) {
      d.vy += g * 0.8 * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.life -= dt;
    }
    this.drops = this.drops.filter((d) => d.life > 0);

    for (const t of this.texts) {
      t.y -= 40 * dt;
      t.life -= dt;
    }
    this.texts = this.texts.filter((t) => t.life > 0);

    const cutoff = performance.now() - 140;
    this.trail = this.trail.filter((p) => p.t >= cutoff);

    this.flash = Math.max(0, this.flash - dt * 2.5);
    this.shake = Math.max(0, this.shake - dt);

    if (this.over && this.overTimer > 0) {
      this.overTimer -= dt;
      if (this.overTimer <= 0) {
        this.opts.sfx.miss();
        this.opts.onGameOver({
          score: this.score,
          correct: this.correct,
          wrong: this.wrong,
          missed: this.missed,
          bestCombo: this.bestCombo,
          seconds: Math.round(this.elapsed),
          sounds: this.sounds,
        });
      }
    }
  }

  /* ----- drawing ----- */

  private draw() {
    const { ctx } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);

    ctx.save();
    if (this.shake > 0) ctx.translate(rand(-6, 6) * this.shake * 3, rand(-6, 6) * this.shake * 3);

    for (const d of this.drops) {
      ctx.globalAlpha = Math.max(0, d.life / d.max);
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const h of this.halves) this.drawHalf(h);
    for (const f of this.fruits) this.drawFruit(f);

    ctx.restore();

    this.drawTrail();

    for (const t of this.texts) {
      ctx.globalAlpha = Math.min(1, t.life * 2);
      ctx.font = `900 ${t.size}px "Shpoko Cyrillic", Nunito, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 60, 60, ${this.flash * 0.22})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }
  }

  private bodyPath(style: FruitStyle, r: number) {
    const { ctx } = this;
    ctx.beginPath();
    if (style.shape === "oval") ctx.ellipse(0, 0, r * 1.15, r * 0.88, 0, 0, Math.PI * 2);
    else ctx.arc(0, 0, r, 0, Math.PI * 2);
  }

  private drawBody(style: FruitStyle, r: number) {
    const { ctx } = this;
    const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.15);
    grad.addColorStop(0, style.light);
    grad.addColorStop(0.45, style.skin);
    grad.addColorStop(1, style.dark);
    this.bodyPath(style, r);
    ctx.fillStyle = grad;
    ctx.fill();

    if (style.shape === "melon") {
      ctx.save();
      this.bodyPath(style, r);
      ctx.clip();
      ctx.strokeStyle = "rgba(20, 70, 25, 0.55)";
      ctx.lineWidth = r * 0.16;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(i * r * 0.42, 0, r * 0.18, r * 1.1, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Shine
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.38, -r * 0.42, r * 0.28, r * 0.16, -0.6, 0, Math.PI * 2);
    ctx.fill();

    if (style.stem) {
      ctx.strokeStyle = "#5d3a1a";
      ctx.lineWidth = Math.max(3, r * 0.1);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.85);
      ctx.quadraticCurveTo(r * 0.05, -r * 1.15, r * 0.18, -r * 1.25);
      ctx.stroke();
    }
    if (style.leaf) {
      ctx.fillStyle = "#4caf50";
      ctx.beginPath();
      ctx.ellipse(r * 0.32, -r * 0.98, r * 0.32, r * 0.13, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawFruit(f: Fruit) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(f.x, f.y);
    // Soft shadow so fruit pops off the board
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.rotate(f.rot);
    this.drawBody(f.style, f.r);
    ctx.restore();

    // The letter stays upright so it's easy to read.
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.font = `900 ${Math.round(f.r * 1.05)}px "Shpoko Cyrillic", Nunito, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = Math.max(4, f.r * 0.14);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.strokeText(f.letter.char, 0, f.r * 0.06);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(f.letter.char, 0, f.r * 0.06);
    ctx.restore();
  }

  private drawHalf(h: Half) {
    const { ctx } = this;
    const r = h.r;
    ctx.save();
    ctx.globalAlpha = Math.min(1, h.life * 2);
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rot);
    ctx.beginPath();
    ctx.rect(-r * 1.6, h.side > 0 ? 0 : -r * 1.6, r * 3.2, r * 1.6);
    ctx.clip();
    this.drawBody(h.style, r);
    // The cut face
    ctx.fillStyle = h.style.flesh;
    ctx.beginPath();
    ctx.ellipse(0, 0, (h.style.shape === "oval" ? 1.1 : 0.95) * r, r * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    if (h.style.seeds) {
      ctx.fillStyle = h.style.seeds;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(i * r * 0.32, 0, r * 0.05, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawTrail() {
    const { ctx } = this;
    const pts = this.trail;
    if (pts.length < 2) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(125, 211, 252, 0.9)";
    ctx.shadowBlur = 16;
    for (let i = 1; i < pts.length; i++) {
      const k = i / pts.length; // thin tail → thick tip
      ctx.strokeStyle = `rgba(255,255,255,${0.35 + k * 0.65})`;
      ctx.lineWidth = 2 + k * 9;
      ctx.beginPath();
      ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
      ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }
}
