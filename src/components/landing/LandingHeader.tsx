import { Link } from "react-router-dom";
import { Globe, GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🦝</span>
            <span className="text-2xl font-extrabold text-primary">SHPOKO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="#languages" 
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-semibold"
            >
              <Globe className="w-4 h-4" />
              Languages
            </Link>
            <Link 
              to="#schools" 
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-semibold"
            >
              <GraduationCap className="w-4 h-4" />
              For Schools
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="font-bold text-primary hover:bg-primary/10">
                LOG IN
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="font-bold bg-primary hover:bg-primary-light shadow-[0_4px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none transition-all">
                GET STARTED
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden border-t border-border bg-card overflow-hidden transition-all duration-300",
        mobileMenuOpen ? "max-h-64" : "max-h-0"
      )}>
        <div className="px-4 py-4 space-y-4">
          <Link 
            to="#languages" 
            className="flex items-center gap-2 text-muted-foreground font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Globe className="w-4 h-4" />
            Languages
          </Link>
          <Link 
            to="#schools" 
            className="flex items-center gap-2 text-muted-foreground font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            <GraduationCap className="w-4 h-4" />
            For Schools
          </Link>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full font-bold">
                LOG IN
              </Button>
            </Link>
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full font-bold bg-primary">
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
