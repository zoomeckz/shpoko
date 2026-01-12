import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🦝</span>
            <span className="text-xl sm:text-2xl font-extrabold text-primary">SHPOKO</span>
          </Link>

          {/* Auth Button - simplified for mobile */}
          <Link to="/auth">
            <Button className="font-bold bg-primary hover:bg-primary/90 shadow-[0_4px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none transition-all">
              LOG IN
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
