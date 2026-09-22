import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import shpokoMascot from "@/assets/shpoko-mascot-new.png";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="rounded-[2rem] bg-secondary px-6 py-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Ready for your first Bulgarian word?
          </h2>
          <p className="mt-3 text-secondary-foreground font-semibold">
            Free to start, no card, no pressure.
          </p>
          <Link to="/auth" className="inline-block mt-6">
            <Button
              size="lg"
              className="text-base font-extrabold rounded-full px-8 py-6 shadow-[0_5px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none transition-all"
            >
              Start learning free
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src={shpokoMascot} alt="SHPOKO" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-foreground">SHPOKO</span>
          </div>

          <div className="flex items-center gap-5 text-sm font-semibold">
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SHPOKO
          </p>
        </div>
      </div>
    </footer>
  );
}
