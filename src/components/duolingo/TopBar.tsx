import { cn } from "@/lib/utils";
import { Flame, Heart, Zap, Crown, Menu, X, Home, Trophy, Target, User, LogOut, Gamepad2, Apple, Swords, Dices, BookOpen, BookMarked, Users, ShoppingBag, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/hooks/useAdminAuth";

interface TopBarProps {
  className?: string;
}

const navItems = [
  { icon: Home, label: "Learn", path: "/" },
  { icon: Trophy, label: "Leaderboards", path: "/leaderboard" },
  { icon: Target, label: "Quests", path: "/quests" },
  { icon: Users, label: "Friends", path: "/friends" },
  { icon: User, label: "Profile", path: "/profile" },
];

const gameItems = [
  { icon: Apple, label: "Fruit Slicer", path: "/game/fruit-slicer" },
  { icon: Swords, label: "Dialogue Battle", path: "/game/dialogue-battle" },
  { icon: Dices, label: "Rapid Fire", path: "/game/rapid-fire" },
  { icon: Type, label: "Endless Words", path: "/game/endless-words" },
  { icon: Gamepad2, label: "Conjugation", path: "/game/conjugation" },
];

export const TopBar = ({ className }: TopBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Check email first
      if (isAdminEmail(user.email)) {
        setIsAdmin(true);
        return;
      }

      // Check user_roles table
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className={cn(
        "lg:hidden sticky top-0 z-50 bg-card border-b border-border",
        className
      )}>
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🦝</span>
            <span className="text-lg font-extrabold text-primary">SHPOKO</span>
          </Link>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 leading-none">
              <Flame className="w-5 h-5 text-warning shrink-0" />
              <span className="font-bold text-sm leading-none">{profile?.streak || 0}</span>
            </div>
            <div className="flex items-center gap-1 leading-none">
              <Zap className="w-5 h-5 text-primary shrink-0" />
              <span className="font-bold text-sm leading-none">{profile?.xp || 0}</span>
            </div>
            <div className="flex items-center gap-1 leading-none">
              <Heart className="w-5 h-5 text-error fill-error shrink-0" />
              <span className="font-bold text-sm leading-none">{profile?.is_premium ? "∞" : "5"}</span>
            </div>
          </div>

          {/* Menu button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm lg:hidden"
          >
            <div className="flex flex-col h-full p-4 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🦝</span>
                  <span className="text-2xl font-extrabold text-primary">SHPOKO</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User info */}
              <div className="bg-accent rounded-xl p-4 mb-6">
                <p className="font-bold text-lg">{profile?.username || "Learner"}</p>
                <p className="text-sm text-muted-foreground">Level {profile?.level || 1}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Flame className="w-5 h-5 text-warning" />
                    <span className="font-bold">{profile?.streak || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-bold">{profile?.xp || 0}</span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-6 h-6" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <Link
                  to="/scenarios"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-colors",
                    location.pathname === "/scenarios" || location.pathname.startsWith("/scenarios/")
                      ? "bg-primary/10 text-primary" 
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Scenarios</span>
                </Link>

                <Link
                  to="/stories"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-colors",
                    location.pathname === "/stories" || location.pathname.startsWith("/stories/")
                      ? "bg-primary/10 text-primary" 
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <BookMarked className="w-6 h-6" />
                  <span>Stories</span>
                </Link>

                {/* Separator */}
                <div className="py-3">
                  <Separator />
                </div>

                {/* Games Section */}
                <div className="px-4 py-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Games
                  </p>
                </div>
                
                {gameItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-6 h-6" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                <Link
                  to="/premium"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-warning hover:bg-accent transition-colors"
                >
                  <Crown className="w-6 h-6" />
                  <span>Super SHPOKO</span>
                </Link>

                {/* Admin Panel Link - Only visible for admins */}
                {isAdmin && (
                  <>
                    <div className="py-3">
                      <Separator />
                    </div>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-colors",
                        location.pathname.startsWith("/admin")
                          ? "bg-red-500/10 text-red-500" 
                          : "text-red-500/70 hover:bg-red-500/10"
                      )}
                    >
                      <Shield className="w-6 h-6" />
                      <span>Admin Panel</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Footer actions */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-semibold">Dark Mode</span>
                  <DarkModeToggle />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-error hover:bg-error/10 transition-colors w-full"
                >
                  <LogOut className="w-6 h-6" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
