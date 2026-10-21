import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Home, Trophy, Target, User, BookOpen, BookMarked, Flame, Crown, Zap, Gamepad2, Swords, Apple, Dices, Users, ShoppingBag, ChevronDown, Headphones, PenLine, ListChecks, GraduationCap, Bell, ScanEye, Shield, HelpCircle, Type } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/hooks/useAdminAuth";
import { HelpTourModal } from "@/components/onboarding/HelpTourModal";
import { Wordmark } from "@/components/landing/Wordmark";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { SoundToggle } from "@/components/SoundToggle";
import { SHOW_LEGACY, isLive } from "@/config/features";

interface SidebarProps {
  className?: string;
}

// Main navigation items (top section)
const mainNavItems = [
  { icon: Home, label: "Learn", path: "/", onboardingId: "lessons" },
  { icon: Trophy, label: "Leaderboards", path: "/leaderboard" },
  { icon: Target, label: "Quests", path: "/quests" },
  { icon: BookOpen, label: "Scenarios", path: "/scenarios" },
  { icon: BookMarked, label: "Stories", path: "/stories", onboardingId: "stories" },
  { icon: ScanEye, label: "Shpoko Image", path: "/image-analyzer", onboardingId: "image-analyzer" },
];

// Quiz items (collapsible section)
const quizItems = [
  { icon: ListChecks, label: "My Quizzes", path: "/quiz" },
  { icon: Dices, label: "Discover Quizzes", path: "/quiz-discover" },
];

// Game items (collapsible section)
const gameItems = [
  { icon: Apple, label: "Fruit Slicer", path: "/game/fruit-slicer" },
  { icon: Swords, label: "Dialogue Battle", path: "/game/dialogue-battle" },
  { icon: Dices, label: "Rapid Fire", path: "/game/rapid-fire" },
  { icon: Type, label: "Endless Words", path: "/game/endless-words" },
  { icon: Gamepad2, label: "Conjugation", path: "/game/conjugation" },
  { icon: Headphones, label: "Listening Fill", path: "/game/listening-fill" },
  { icon: PenLine, label: "Fix My Bulgarian", path: "/game/fix-bulgarian" },
];

// Bottom navigation items
const bottomNavItems = [
  { icon: Users, label: "Friends", path: "/friends" },
  { icon: User, label: "Profile", path: "/profile", onboardingId: "profile" },
];

export const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();

  // Only show what's part of the rebuilt site (see src/config/features.ts).
  const liveMainItems = mainNavItems.filter((item) => isLive(item.path));
  const liveQuizItems = quizItems.filter((item) => isLive(item.path));
  const liveGameItems = gameItems.filter((item) => isLive(item.path));
  const liveBottomItems = bottomNavItems.filter((item) => isLive(item.path));
  const showMiddle = liveQuizItems.length > 0 || liveGameItems.length > 0;
  const showBottom = liveBottomItems.length > 0 || isLive("/shop") || SHOW_LEGACY;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  const [gamesOpen, setGamesOpen] = useState(false);
  const [quizzesOpen, setQuizzesOpen] = useState(false);
  const [pendingTradeCount, setPendingTradeCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [helpTourOpen, setHelpTourOpen] = useState(false);

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

  // Check if any game or quiz is active
  const isGameActive = gameItems.some(item => location.pathname === item.path);
  const isQuizActive = quizItems.some(item => location.pathname === item.path);

  // Fetch pending incoming trades count (only while the shop is part of the site)
  useEffect(() => {
    if (!isLive("/shop")) return;
    const fetchPendingTrades = async () => {
      if (!user) {
        setPendingTradeCount(0);
        return;
      }

      const { count } = await supabase
        .from("skin_trades")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("status", "pending");

      setPendingTradeCount(count || 0);
    };

    fetchPendingTrades();

    // Subscribe to changes
    const channel = supabase
      .channel("sidebar-trades")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "skin_trades",
        },
        () => {
          fetchPendingTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Collapsible section renderer
  const renderCollapsibleSection = (
    title: string,
    Icon: typeof Gamepad2,
    items: typeof gameItems,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    isActive: boolean,
    onboardingId?: string
  ) => (
    <Collapsible open={isOpen || isActive} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full" data-onboarding={onboardingId}>
        <div className={cn(
          "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-bold text-base",
          isActive
            ? "bg-primary/10 text-primary border-2 border-primary/50"
            : "text-muted-foreground hover:bg-accent border-2 border-transparent"
        )}>
          <div className="flex items-center gap-4">
            <Icon className="w-6 h-6" />
            <span>{title}</span>
          </div>
          <motion.div
            animate={{ rotate: (isOpen || isActive) ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <AnimatePresence>
          <motion.div 
            className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {items.map((item, index) => {
              const itemIsActive = location.pathname === item.path;
              const ItemIcon = item.icon;
              
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm",
                      itemIsActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <ItemIcon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <aside className={cn(
      "hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-background border-r-2 border-border p-4",
      className
    )}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 px-4 py-3 mb-6">
        <Wordmark />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {/* Main Navigation Items */}
        {liveMainItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-onboarding={item.onboardingId}
              className={cn(
                "flex items-center gap-4 px-4 py-2.5 rounded-xl transition-colors duration-150 font-extrabold text-[15px] uppercase tracking-wide",
                isActive
                  ? "bg-primary/10 text-primary border-2 border-primary/50"
                  : "text-muted-foreground hover:bg-accent border-2 border-transparent"
              )}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {showMiddle && (
          <div className="py-3">
            <Separator />
          </div>
        )}

        {/* Quizzes Section - Collapsible */}
        {liveQuizItems.length > 0 && renderCollapsibleSection("Quizzes", GraduationCap, liveQuizItems, quizzesOpen, setQuizzesOpen, isQuizActive)}

        {/* Games Section - Collapsible */}
        {liveGameItems.length > 0 && renderCollapsibleSection("Games", Gamepad2, liveGameItems, gamesOpen, setGamesOpen, isGameActive, "games")}

        {showBottom && (
          <div className="py-3">
            <Separator />
          </div>
        )}

        {/* Bottom Navigation Items (Friends, Profile) */}
        {liveBottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-onboarding={item.onboardingId}
              className={cn(
                "flex items-center gap-4 px-4 py-2.5 rounded-xl transition-colors duration-150 font-extrabold text-[15px] uppercase tracking-wide",
                isActive
                  ? "bg-primary/10 text-primary border-2 border-primary/50"
                  : "text-muted-foreground hover:bg-accent border-2 border-transparent"
              )}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Shop - Special styling with notification badge */}
        {isLive("/shop") && (
        <Link
          to="/shop"
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-base relative",
            location.pathname === "/shop" || location.pathname === "/trade-history"
              ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-500 border-2 border-purple-500"
              : "text-muted-foreground hover:bg-accent border-2 border-transparent"
          )}
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            {pendingTradeCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
              >
                <span className="text-xs font-bold text-white">{pendingTradeCount}</span>
              </motion.div>
            )}
          </div>
          <span>Shop</span>
          {pendingTradeCount > 0 && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-auto text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
            >
              <Bell className="w-3 h-3" />
              {pendingTradeCount} pending
            </motion.span>
          )}
          {!pendingTradeCount && profile && (profile.xp || 0) >= 100 && (
            <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
              {profile.xp} XP
            </span>
          )}
        </Link>
        )}

        {/* Help / Tour Button */}
        {SHOW_LEGACY && (
        <button
          onClick={() => setHelpTourOpen(true)}
          className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-base text-muted-foreground hover:bg-accent border-2 border-transparent w-full text-left"
        >
          <HelpCircle className="w-6 h-6" />
          <span>Help / Tour</span>
        </button>
        )}

        {/* Admin Panel Link - Only visible for admins */}
        {isAdmin && (
          <>
            <div className="py-3">
              <Separator />
            </div>
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-4 px-4 py-2.5 rounded-xl transition-colors duration-150 font-extrabold text-[15px] uppercase tracking-wide",
                location.pathname.startsWith("/admin")
                  ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-500 border-2 border-red-500"
                  : "text-red-500/70 hover:bg-red-500/10 border-2 border-transparent"
              )}
            >
              <Shield className="w-6 h-6" />
              <span>Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* Premium banner */}
      {isLive("/premium") && !profile?.is_premium && (
        <Link
          to="/premium"
          className="mt-4 p-4 bg-gradient-to-r from-warning/20 to-warning/10 rounded-xl border-2 border-warning/30 hover:border-warning transition-colors"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-warning" />
            <div>
              <p className="font-bold text-sm">Try Super</p>
              <p className="text-xs text-muted-foreground">No ads & unlimited hearts</p>
            </div>
          </div>
        </Link>
      )}

      {/* User stats mini */}
      {SHOW_LEGACY && (
      <div className="mt-4 p-4 bg-accent rounded-xl">
        <div className="flex items-center justify-around">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-warning" />
            <span className="font-bold">{profile?.streak || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold">{profile?.xp || 0}</span>
          </div>
        </div>
      </div>
      )}

      {/* Account */}
      <div className="mt-4 space-y-3">
        {!user && (
          <DuoButton asChild size="md" fullWidth className="xl:hidden">
            <Link to="/auth?mode=signup">Create a profile</Link>
          </DuoButton>
        )}
        <div className="flex items-center justify-between rounded-2xl border-2 border-border px-4 py-2">
          <span className="text-sm font-bold text-muted-foreground">Dark mode</span>
          <DarkModeToggle />
        </div>
        <div className="flex items-center justify-between rounded-2xl border-2 border-border px-4 py-2">
          <span className="text-sm font-bold text-muted-foreground">Sound effects</span>
          <SoundToggle />
        </div>
        {user ? (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        ) : (
          <Link
            to="/auth"
            className="block w-full rounded-xl px-4 py-2 text-center text-sm font-extrabold uppercase tracking-wide text-primary hover:bg-muted transition-colors"
          >
            Log in
          </Link>
        )}
      </div>

      {/* Help Tour Modal */}
      {SHOW_LEGACY && <HelpTourModal open={helpTourOpen} onOpenChange={setHelpTourOpen} />}
    </aside>
  );
};
