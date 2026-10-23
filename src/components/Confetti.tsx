import { useEffect, useRef } from "react";

const COLORS = ["#1cb0f6", "#ffc800", "#ff4b4b", "#58cc02", "#ce82ff", "#ff9600"];

/**
 * A burst of confetti over the whole screen, once, when it mounts.
 * `big` adds a second burst (for passing a unit test). Skipped entirely for
 * people who've asked their device for less motion.
 */
export function Confetti({ big = false }: { big?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();

    type Piece = { x: number; y: number; vx: number; vy: number; size: number; color: string; spin: number; angle: number };
    const pieces: Piece[] = [];
    const burst = (count: number, fromX: number) => {
      for (let i = 0; i < count; i++) {
        pieces.push({
          x: fromX * window.innerWidth,
          y: window.innerHeight * 0.35,
          vx: (Math.random() - 0.5) * 14,
          vy: -6 - Math.random() * 10,
          size: 6 + Math.random() * 6,
          color: COLORS[i % COLORS.length],
          spin: (Math.random() - 0.5) * 0.4,
          angle: Math.random() * Math.PI,
        });
      }
    };
    burst(big ? 110 : 70, 0.5);
    const second = big ? window.setTimeout(() => (burst(60, 0.25), burst(60, 0.75)), 450) : 0;

    let frame = 0;
    const startedAt = performance.now();
    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of pieces) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (now - startedAt < 3500) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(second);
      window.removeEventListener("resize", resize);
    };
  }, [big]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-50 w-full h-full" aria-hidden="true" />;
}
