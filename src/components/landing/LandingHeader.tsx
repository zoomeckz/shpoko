import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import shpokoMascot from "@/assets/shpoko-mascot-new.png";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={shpokoMascot} alt="SHPOKO" className="w-9 h-9 object-contain" />
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              SHPOKO
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#learn" className="hover:text-foreground transition-colors">What you learn</a>
            <a href="#practice" className="hover:text-foreground transition-colors">Practice</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" className="font-bold hidden sm:inline-flex">
                Log in
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="font-bold rounded-full px-5 shadow-[0_4px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none transition-all">
                Start free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
