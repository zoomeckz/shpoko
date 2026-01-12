import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import shpokoMascot from "@/assets/shpoko-mascot-new.png";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-primary/5 to-background">
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        {/* Mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6"
        >
          <motion.img
            src={shpokoMascot}
            alt="SHPOKO mascot"
            className="w-40 h-40 sm:w-52 sm:h-52 object-contain drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight"
        >
          Learn <span className="text-primary">Bulgarian</span> the fun way!
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-muted-foreground text-base sm:text-lg"
        >
          Free lessons, games, and stories. Practice reading, listening, and speaking Bulgarian with SHPOKO.
        </motion.p>

        {/* Language badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 flex items-center gap-3 bg-card rounded-full px-4 py-2 border border-border shadow-sm"
        >
          <span className="text-2xl">🇧🇬</span>
          <span className="font-semibold text-foreground">Bulgarian from English</span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 w-full flex flex-col gap-3"
        >
          <Link to="/auth" className="w-full">
            <Button 
              size="lg" 
              className="w-full text-lg font-bold py-6 bg-primary hover:bg-primary/90 shadow-[0_4px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none transition-all"
            >
              GET STARTED — IT'S FREE
            </Button>
          </Link>
          <Link to="/auth" className="w-full">
            <Button 
              size="lg" 
              variant="outline"
              className="w-full text-lg font-bold py-6 border-2 border-border shadow-[0_4px_0_0_hsl(var(--border))] active:translate-y-1 active:shadow-none transition-all"
            >
              I ALREADY HAVE AN ACCOUNT
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-success/10 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
