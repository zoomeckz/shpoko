import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { useSfx } from "@/hooks/useSfx";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { syncAchievements } from "@/lib/achievements";
import { useT } from "@/i18n";
import { achievementText } from "@/lib/achievementText";
import { toast } from "sonner";
import { FruitSlicerEngine, LETTERS, type GameLetter, type GameResult, type HudState } from "@/games/fruitSlicer";
import shpokoMascot from "@/assets/shpoko-mascot.webp";

const BEST_KEY = "shpoko-fruit-slicer-best";

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

type Phase = "intro" | "playing" | "over";

export default function FruitSlicer() {
  const navigate = useNavigate();
  const sfx = useSfx();
  const { soundEnabled, toggleSound } = useSoundSettings();
  const { user } = useAuth();
  const t = useT();
  // The game engine is created once; it reads the current language through this.
  const tRef = useRef(t);
  tRef.current = t;
  // The engine's callbacks are set up once; read the current user through a ref.
  const userIdRef = useRef(user?.id);
  userIdRef.current = user?.id;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FruitSlicerEngine | null>(null);
  // The engine is created once; give it the latest sound settings through a ref.
  const sfxRef = useRef(sfx);
  sfxRef.current = sfx;

  const [phase, setPhase] = useState<Phase>("intro");
  const [hud, setHud] = useState<HudState | null>(null);
  const [banner, setBanner] = useState<GameLetter | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new FruitSlicerEngine(canvasRef.current, {
      sfx: new Proxy({} as typeof sfx, { get: (_, key: keyof typeof sfx) => sfxRef.current[key] }),
      texts: {
        combo: (n, bonus) => tRef.current("game.combo", { n, bonus }),
        wrongLetter: (char, sound) => tRef.current("game.wrongLetter", { char, sound }),
        missed: (char) => tRef.current("game.missed", { char }),
      },
      onUpdate: setHud,
      onNewTarget: (letter) => {
        setBanner(letter);
        window.setTimeout(() => setBanner((b) => (b === letter ? null : b)), 1600);
      },
      onGameOver: (r) => {
        setResult(r);
        setPhase("over");
        const previous = readBest();
        const isBest = r.score > previous;
        setNewBest(isBest);
        if (isBest) {
          setBest(r.score);
          try {
            localStorage.setItem(BEST_KEY, String(r.score));
          } catch {
            // Best score just won't be remembered.
          }
          // A new best can unlock a Fruit Ninja level.
          if (userIdRef.current) {
            syncAchievements(userIdRef.current).then(({ newlyEarned }) =>
              newlyEarned
                .filter((e) => e.achievement.id === "slicer")
                .slice(-1)
                .forEach(({ achievement, level }) =>
                  toast.success(tRef.current("ach.toast", { icon: achievement.icon, title: achievementText(tRef.current, achievement).title }), {
                    description: achievementText(tRef.current, achievement).describe(achievement.tiers[level - 1]),
                  })
                )
            );
          }
        }
      },
    });
    engineRef.current = engine;
    // Lets automated tests look inside the game during local development only.
    if (import.meta.env.DEV) (window as unknown as { __fruitSlicer?: FruitSlicerEngine }).__fruitSlicer = engine;
    return () => engine.destroy();
  }, []);

  const start = useCallback(() => {
    setResult(null);
    setBanner(null);
    setPhase("playing");
    sfxRef.current.reveal();
    engineRef.current?.start();
  }, []);

  // Enter / space starts or restarts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "playing" && (e.key === "Enter" || e.key === " ") && (e.target as HTMLElement)?.tagName !== "BUTTON") {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, start]);

  // Right slices out of everything that mattered: right, wrong and right-but-missed.
  const attempts = result ? result.correct + result.wrong + result.missed : 0;
  const accuracy = result && attempts > 0 ? Math.round((result.correct / attempts) * 100) : 0;

  return (
    <div className="fixed inset-0 flex flex-col bg-[radial-gradient(ellipse_at_top,_hsl(198_40%_17%),_hsl(197_32%_8%))] text-white select-none">
      {/* Top bar */}
      <header className="relative z-20 flex items-center gap-3 px-4 sm:px-6 py-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label={t("game.leave")}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
        >
          <X className="w-6 h-6" strokeWidth={3} />
        </button>

        <div className="flex items-center gap-1" aria-label={t("game.lives", { n: hud?.lives ?? 3 })}>
          {[0, 1, 2].map((i) => (
            <motion.span key={i} animate={{ scale: (hud?.lives ?? 3) > i ? 1 : 0.8 }} transition={{ type: "spring", stiffness: 400 }}>
              <Heart
                className={cn("w-6 h-6 sm:w-7 sm:h-7", (hud?.lives ?? 3) > i ? "fill-[#ff4b4b] text-[#ff4b4b]" : "text-white/25")}
              />
            </motion.span>
          ))}
        </div>

        {/* Target sound */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 flex flex-col items-center">
          {phase === "playing" && hud && (
            <>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/60">{t("game.sliceSound")}</span>
              <motion.span
                key={hud.target.sound}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 16 }}
                className="mt-0.5 rounded-2xl bg-primary px-5 py-1.5 text-2xl sm:text-3xl font-black text-primary-foreground shadow-[0_4px_0_0_hsl(var(--primary-dark))]"
              >
                “{hud.target.sound}”
              </motion.span>
              <span className="mt-1 flex gap-1" aria-label={t("game.untilNext", { n: hud.untilNext })}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={cn("w-2 h-2 rounded-full", i < 5 - hud.untilNext ? "bg-[#ffd84d]" : "bg-white/20")} />
                ))}
              </span>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/60">{t("game.score")}</p>
            <p className="text-2xl font-black tabular-nums text-[#ffd84d] leading-none">{hud?.score ?? 0}</p>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? t("sound.mute") : t("sound.unmute")}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
          >
            {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Board */}
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none cursor-crosshair" aria-label={t("game.board")} />

        {/* New target banner */}
        <AnimatePresence>
          {banner && phase === "playing" && (
            <motion.div
              key={banner.sound}
              initial={{ y: -20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-2xl bg-[#ffd84d] px-5 py-2 text-lg font-black text-[#3b2a00] shadow-[0_4px_0_0_#c9a400]"
            >
              {t("game.newSound", { s: banner.sound })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start screen */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ y: 24, scale: 0.96 }}
                animate={{ y: 0, scale: 1 }}
                className="w-full max-w-md rounded-3xl border-2 border-white/10 bg-[hsl(198_30%_13%)] p-6 sm:p-8 text-center shadow-2xl"
              >
                <img src={shpokoMascot} alt="" className="mx-auto w-24 h-24 object-contain" />
                <h1 className="mt-3 text-3xl font-black">{t("game.title")}</h1>
                <p className="mt-2 font-bold text-white/70">
                  {t("game.intro")}
                </p>
                <ul className="mt-5 space-y-2 text-left text-sm font-bold text-white/80">
                  <li>{t("game.rule1")}</li>
                  <li>{t("game.rule2")}</li>
                  <li>{t("game.rule3")}</li>
                </ul>
                <DuoButton size="xl" fullWidth className="mt-6" onClick={start}>
                  {t("game.play")}
                </DuoButton>
                {best > 0 && <p className="mt-3 text-sm font-extrabold text-white/60">{t("game.yourBest", { n: best })}</p>}
                <p className="mt-3 text-xs font-semibold text-white/40">{t("game.howTo")}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game over */}
        <AnimatePresence>
          {phase === "over" && result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 p-4"
            >
              <motion.div
                initial={{ y: 30, scale: 0.9 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full max-w-md rounded-3xl border-2 border-white/10 bg-[hsl(198_30%_13%)] p-6 sm:p-8 text-center shadow-2xl"
              >
                <h2 className="text-3xl font-black">{newBest ? t("game.newBest") : t("game.over")}</h2>
                <p className="mt-2 text-6xl font-black text-[#ffd84d] tabular-nums">{result.score}</p>
                {!newBest && best > 0 && <p className="text-sm font-extrabold text-white/60">{t("game.best", { n: best })}</p>}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    [t("game.sliced"), String(result.correct)],
                    [t("game.accuracy"), `${accuracy}%`],
                    [t("game.bestCombo"), result.bestCombo >= 2 ? `${result.bestCombo}×` : "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/5 py-3">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/50">{label}</p>
                      <p className="text-xl font-black">{value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm font-bold text-white/60">{t("game.soundsPractised")}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {[...new Set(result.sounds)].map((s) => {
                    const letter = LETTERS.find((l) => l.sound === s);
                    return (
                      <span key={s} className="rounded-xl bg-white/10 px-3 py-1 font-black">
                        {letter?.char} <span className="font-bold text-white/60">“{s}”</span>
                      </span>
                    );
                  })}
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <DuoButton size="xl" fullWidth onClick={start}>
                    {t("game.playAgain")}
                  </DuoButton>
                  <DuoButton variant="ghost" size="lg" fullWidth className="text-white/80 hover:bg-white/10" onClick={() => navigate("/")}>
                    {t("game.backToLearning")}
                  </DuoButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
