import { cn } from "@/lib/utils";
import { Cherry, Library, Flame, Heart, Zap, Crown, Menu, X, Home, Trophy, Target, User, LogOut, Gamepad2, Swords, Dices, BookOpen, BookMarked, Users, ShoppingBag, Shield, Type } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { SoundToggle } from "@/components/SoundToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/hooks/useAdminAuth";
import { Wordmark } from "@/components/landing/Wordmark";
import { SHOW_LEGACY, isLive } from "@/config/features";
import { useT, type TKey } from "@/i18n";
import { LanguageSelect } from "@/components/LanguageSelect";

// Menu labels that are part of the live site, with their translations.
const LABEL_KEYS: Partial<Record<string, TKey>> = {
  Learn: "nav.learn",
  "My words": "nav.words",
  Profile: "nav.profile",
  "Fruit Slicer": "nav.fruitSlicer",
};

interface TopBarProps {
  className?: string;
}

const navItems = [
  { icon: Home, label: "Learn", path: "/" },
  { icon: Library, label: "My words", path: "/words" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Trophy, label: "Leaderboards", path: "/leaderboard" },
  { icon: Target, label: "Quests", path: "/quests" },
  { icon: Users, label: "Friends", path: "/friends" },
];

const gameItems = [
  { icon: Cherry, label: "Fruit Slicer", path: "/game/fruit-slicer" },
  { icon: Swords, label: "Dialogue Battle", path: "/game/dialogue-battle" },
  { icon: Dices, label: "Rapid Fire", path: "/game/rapid-fire" },
  { icon: Type, label: "Endless Words", path: "/game/endless-words" },
  { icon: Gamepad2, label: "Conjugation", path: "/game/conjugation" },
];

export const TopBar = ({ className }: TopBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const t = useT();
  const tl = (label: string) => (LABEL_KEYS[label] ? t(LABEL_KEYS[label]!) : label);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Only show what's part of the rebuilt site (see src/config/features.ts).
  const liveNavItems = navItems.filter((item) => isLive(item.path));
  const liveGameItems = gameItems.filter((item) => isLive(item.path));

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
    navigate("/");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className={cn(
        "lg:hidden sticky top-0 z-50 bg-background border-b-2 border-border",
        className
      )}>
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Wordmark size="sm" />
          </Link>

          {/* Stats */}
          {SHOW_LEGACY && (
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
          )}

          {/* Menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t("nav.openMenu")}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {liveNavItems.length > 1 && (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16">
          {liveNavItems.map((item) => {
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
                <span className="text-xs font-semibold">{tl(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      )}

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
                  <Wordmark />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t("nav.closeMenu")}
                  className="p-2 hover:bg-accent rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User info */}
              {SHOW_LEGACY && (
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
              )}

              {/* Menu items */}
              <div className="flex-1 space-y-2">
                {/* Profile sits at the bottom, next to Dark Mode */}
                {liveNavItems.filter((item) => item.path !== "/profile").map((item) => {
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
                      <span>{tl(item.label)}</span>
                    </Link>
                  );
                })}

                {isLive("/scenarios") && (
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
                )}

                {isLive("/stories") && (
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
                )}

                {liveGameItems.length > 0 && (
                <>
                <div className="py-3">
                  <Separator />
                </div>

                {/* Games Section */}
                <div className="px-4 py-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    {t("nav.games")}
                  </p>
                </div>
                
                {liveGameItems.map((item) => {
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
                      <span>{tl(item.label)}</span>
                    </Link>
                  );
                })}
                </>
                )}
                
                {isLive("/premium") && (
                <Link
                  to="/premium"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-warning hover:bg-accent transition-colors"
                >
                  <Crown className="w-6 h-6" />
                  <span>Super SHPOKO</span>
                </Link>
                )}

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
                      <span>{t("nav.admin")}</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Footer actions */}
              <div className="space-y-2 pt-4 border-t border-border">
                {isLive("/profile") && (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors",
                      location.pathname === "/profile" ? "bg-primary/10 text-primary" : "hover:bg-accent"
                    )}
                  >
                    <User className="w-5 h-5" />
                    {t("nav.profile")}
                  </Link>
                )}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-semibold">{t("nav.darkMode")}</span>
                  <DarkModeToggle />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-semibold">{t("nav.sound")}</span>
                  <SoundToggle />
                </div>
                <div className="px-4 py-3">
                  <LanguageSelect className="text-base" />
                </div>
                {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-error hover:bg-error/10 transition-colors w-full"
                >
                  <LogOut className="w-6 h-6" />
                  <span>{t("common.logOut")}</span>
                </button>
                ) : (
                  <div className="space-y-2 px-1">
                    <Link
                      to="/auth?mode=signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full rounded-2xl bg-primary py-3 text-center font-extrabold uppercase tracking-wide text-primary-foreground shadow-[0_4px_0_0_hsl(var(--primary-dark))]"
                    >
                      {t("common.createProfile")}
                    </Link>
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 text-center font-extrabold uppercase tracking-wide text-primary"
                    >
                      {t("common.logIn")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
