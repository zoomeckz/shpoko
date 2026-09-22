import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Volume2 } from "lucide-react";
import shpokoMascot from "@/assets/shpoko-mascot-new.png";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-accent/60 blur-3xl" />
        <div className="absolute top-32 right-0 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-success/15 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-widest text-secondary-foreground">
            Bulgarian · from English
          </span>

          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold leading-[1.02] tracking-tight text-foreground">
            Read, hear and speak
            <span className="block text-primary">real Bulgarian.</span>
          </h1>

          <p className="mt-5 text-lg text-muted-foreground max-w-xl">
            Short lessons, native audio and word games built around the words
            people actually use. Every answer counts in Cyrillic or Latin letters.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/auth" className="sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base font-extrabold rounded-full px-8 py-6 shadow-[0_5px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none transition-all"
              >
                Start learning free
              </Button>
            </Link>
            <Link to="/auth" className="sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base font-extrabold rounded-full px-8 py-6 border-2 bg-card"
              >
                I have an account
              </Button>
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
            {["No card needed", "5 minutes a day", "Guest mode"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center">
                  <Check className="w-3 h-3 text-success" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="rounded-[2rem] bg-card border border-border p-6 shadow-[var(--shadow-elevated)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent-foreground bg-accent rounded-full px-3 py-1">
                New word
              </span>
              <span className="text-xs font-bold text-muted-foreground">3 / 8</span>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <motion.img
                src={shpokoMascot}
                alt="SHPOKO mascot"
                className="w-20 h-20 object-contain shrink-0"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative rounded-2xl bg-secondary px-4 py-3">
                <p className="text-2xl font-extrabold text-foreground">ябълка</p>
                <p className="text-sm font-semibold text-secondary-foreground">yabalka</p>
              </div>
            </div>

            <button className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-background py-3 text-sm font-extrabold text-foreground">
              <Volume2 className="w-4 h-4 text-primary" />
              Hear it
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {["apple", "bread", "water", "cheese"].map((word, i) => (
                <div
                  key={word}
                  className={`rounded-2xl border-2 py-3 text-center text-sm font-extrabold ${
                    i === 0
                      ? "border-success bg-success/10 text-success"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -bottom-5 -left-4 rounded-2xl bg-card border border-border px-4 py-3 shadow-[var(--shadow-card)]">
            <p className="text-xs font-bold text-muted-foreground">Streak</p>
            <p className="text-lg font-extrabold text-foreground">12 days 🔥</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
