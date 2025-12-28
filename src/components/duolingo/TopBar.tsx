import { cn } from "@/lib/utils";
import { Flame, Heart, Zap, Crown, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import LanguageModeToggle from "@/components/LanguageModeToggle";
import shpokoLogo from "@/assets/shpoko-logo.png";

interface TopBarProps {
  className?: string;
}

export const TopBar = ({ className }: TopBarProps) => {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border",
        className
      )}>
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 hover:bg-accent rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo - visible on mobile */}
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <img src={shpokoLogo} alt="Shpoko" className="w-8 h-8" />
            <span className="font-bold text-primary">Shpoko</span>
          </Link>

          {/* Stats */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Streak */}
            <Link 
              to="/profile" 
              className="flex items-center gap-1 px-3 py-2 hover:bg-accent rounded-xl transition-colors"
            >
              <Flame className={cn(
                "w-5 h-5 md:w-6 md:h-6",
                profile?.streak && profile.streak > 0 ? "text-warning" : "text-muted-foreground"
              )} />
              <span className="font-bold text-sm md:text-base">{profile?.streak || 0}</span>
            </Link>

            {/* XP */}
            <Link 
              to="/leaderboard"
              className="flex items-center gap-1 px-3 py-2 hover:bg-accent rounded-xl transition-colors"
            >
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <span className="font-bold text-sm md:text-base text-primary">{profile?.xp || 0}</span>
            </Link>

            {/* Hearts (lives) */}
            <div className="flex items-center gap-1 px-3 py-2">
              <Heart className={cn(
                "w-5 h-5 md:w-6 md:h-6",
                profile?.is_premium ? "text-destructive fill-destructive" : "text-destructive"
              )} />
              <span className="font-bold text-sm md:text-base">
                {profile?.is_premium ? "∞" : "5"}
              </span>
            </div>

            {/* Premium badge */}
            {profile?.is_premium && (
              <div className="hidden md:flex items-center gap-1 px-3 py-2 bg-warning/20 rounded-xl">
                <Crown className="w-5 h-5 text-warning" />
                <span className="font-bold text-sm text-warning">PRO</span>
              </div>
            )}

            {/* Settings */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageModeToggle />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background">
          <div className="pt-20 px-4 space-y-2">
            <Link 
              to="/" 
              className="block px-4 py-3 rounded-xl hover:bg-accent font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              🏠 Learn
            </Link>
            <Link 
              to="/leaderboard" 
              className="block px-4 py-3 rounded-xl hover:bg-accent font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              🏆 Leaderboards
            </Link>
            <Link 
              to="/quests" 
              className="block px-4 py-3 rounded-xl hover:bg-accent font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              🎯 Quests
            </Link>
            <Link 
              to="/stories" 
              className="block px-4 py-3 rounded-xl hover:bg-accent font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              📖 Stories
            </Link>
            <Link 
              to="/profile" 
              className="block px-4 py-3 rounded-xl hover:bg-accent font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              👤 Profile
            </Link>
            
            <div className="flex items-center gap-4 px-4 py-3">
              <LanguageModeToggle />
              <DarkModeToggle />
            </div>

            <button
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 rounded-xl hover:bg-accent font-bold text-destructive"
            >
              🚪 Log out
            </button>
          </div>
        </div>
      )}
    </>
  );
};
