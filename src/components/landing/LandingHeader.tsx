import { Link } from "react-router-dom";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { Wordmark } from "./Wordmark";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b-2 border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between">
        <Link to="/" aria-label="Shpoko home">
          <Wordmark />
        </Link>

        <DuoButton asChild variant="white" size="sm">
          <Link to="/auth">Log in</Link>
        </DuoButton>
      </div>
    </header>
  );
}
