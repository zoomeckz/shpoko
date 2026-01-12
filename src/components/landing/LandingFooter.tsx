import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border py-8 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl">🦝</span>
          <span className="text-xl font-extrabold text-primary">SHPOKO</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          The fun way to learn Bulgarian
        </p>

        <div className="flex items-center justify-center gap-4 text-sm">
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <span className="text-border">•</span>
          <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
          <span className="text-border">•</span>
          <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} SHPOKO
        </p>
      </div>
    </footer>
  );
}
