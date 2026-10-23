import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DuoButton } from "@/components/duolingo/DuoButton";
import shpokoMascot from "@/assets/shpoko-mascot.webp";

// Letter tiles that float around the mascot.
const tiles = [
  { letter: "Ж", className: "top-2 left-0 bg-accent-strong shadow-[0_4px_0_0_hsl(var(--accent-dark))] -rotate-12", delay: 0 },
  { letter: "Щ", className: "top-0 right-2 bg-primary shadow-[0_4px_0_0_hsl(var(--primary-dark))] rotate-6", delay: 0.6 },
  { letter: "Ю", className: "bottom-10 -left-2 bg-error shadow-[0_4px_0_0_hsl(var(--error-dark))] rotate-6", delay: 1.2 },
  { letter: "Б", className: "bottom-4 right-0 bg-warning shadow-[0_4px_0_0_hsl(var(--warning-dark))] -rotate-6", delay: 0.3 },
];

interface HeroSectionProps {
  onStart: () => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto w-full max-w-[300px] sm:max-w-[380px] aspect-square"
      >
        <div className="absolute inset-[8%] rounded-full bg-primary/10" />
        <motion.img
          src={shpokoMascot}
          alt="Shpoko the raccoon giving a thumbs up"
          className="absolute inset-[10%] w-[80%] h-[80%] object-contain drop-shadow-[0_10px_0_hsl(var(--border))]"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {tiles.map((t) => (
          <motion.span
            key={t.letter}
            aria-hidden="true"
            className={`absolute w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black text-white ${t.className}`}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.6, delay: t.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {t.letter}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="text-center"
      >
        <h1 className="text-[28px] sm:text-[34px] leading-tight font-extrabold text-foreground max-w-md mx-auto">
          The free, fun and fast way to learn everyday Bulgarian!
        </h1>

        <div className="mt-8 flex flex-col gap-3 max-w-[330px] mx-auto">
          <DuoButton size="xl" fullWidth onClick={onStart}>
            Get started
          </DuoButton>
          <DuoButton asChild variant="white" size="xl" fullWidth>
            <Link to="/auth">I already have an account</Link>
          </DuoButton>
        </div>
      </motion.div>
    </section>
  );
}
