import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              The free, fun, and effective way to{" "}
              <span className="text-primary">learn a language!</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Learning with Shpoko is fun and addictive. Earn points for correct answers, 
              race against the clock, and level up. Our bite-sized lessons are effective.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-lg font-bold px-8 py-6 bg-primary hover:bg-primary-light shadow-[0_4px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none transition-all"
                >
                  GET STARTED
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto text-lg font-bold px-8 py-6 border-2 border-border shadow-[0_4px_0_0_hsl(var(--border))] active:translate-y-1 active:shadow-none transition-all"
                >
                  I ALREADY HAVE AN ACCOUNT
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Raccoon Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Animated Raccoon */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-[200px] sm:text-[280px] select-none"
              >
                🦝
              </motion.div>
              
              {/* Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
                className="absolute -top-4 -right-4 bg-card rounded-2xl px-4 py-2 shadow-lg border-2 border-border"
              >
                <p className="font-bold text-foreground">Let's learn! 📚</p>
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-card border-r-2 border-b-2 border-border transform rotate-45" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-success/10 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
