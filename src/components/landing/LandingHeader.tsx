import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { Wordmark } from "./Wordmark";

interface LandingHeaderProps {
  onStart: () => void;
}

// Like Duolingo: just the logo, until you scroll past the hero buttons.
export function LandingHeader({ onStart }: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 380);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-background transition-colors",
        scrolled ? "border-b-2 border-border" : "border-b-2 border-transparent"
      )}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between">
        <Link to="/" aria-label="Shpoko home">
          <Wordmark />
        </Link>

        <AnimatePresence>
          {scrolled && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <DuoButton size="md" onClick={onStart}>
                Get started
              </DuoButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
