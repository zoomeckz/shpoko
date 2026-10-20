import { Link } from "react-router-dom";
import { DuoButton } from "@/components/duolingo/DuoButton";
import shpokoMascot from "@/assets/shpoko-mascot.png";
import { Wordmark } from "./Wordmark";
import { isLive } from "@/config/features";

interface LandingFooterProps {
  onStart: () => void;
}

export function LandingFooter({ onStart }: LandingFooterProps) {
  return (
    <>
      <section className="border-t-2 border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <img src={shpokoMascot} alt="" className="w-28 h-28 mx-auto object-contain" />
          <h2 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight text-foreground max-w-xl mx-auto">
            Your first Bulgarian word is three minutes away.
          </h2>
          <DuoButton size="xl" className="mt-8 w-full max-w-[330px]" onClick={onStart}>
            Start learning
          </DuoButton>
        </div>
      </section>

      <footer className="bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Wordmark inverted />
          <nav className="flex items-center gap-6 text-sm font-extrabold text-white/90">
            {isLive("/about") && <Link to="/about" className="hover:text-white">About</Link>}
            <Link to="/auth" className="hover:text-white">Log in</Link>
          </nav>
          <p className="text-xs font-bold text-white/80">© {new Date().getFullYear()} Shpoko</p>
        </div>
      </footer>
    </>
  );
}
