import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, Target, User, BookOpen, BookMarked, Flame, Crown, Zap, Gamepad2, Swords, Apple, Dices, Users, ShoppingBag, ChevronDown, Headphones, PenLine, ListChecks, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  className?: string;
}

// Main navigation items (top section)
const mainNavItems = [
  { icon: Home, label: "Learn", path: "/" },
  { icon: Trophy, label: "Leaderboards", path: "/leaderboard" },
  { icon: Target, label: "Quests", path: "/quests" },
  { icon: BookOpen, label: "Scenarios", path: "/scenarios" },
  { icon: BookMarked, label: "Stories", path: "/stories" },
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
  { icon: Gamepad2, label: "Conjugation", path: "/game/conjugation" },
  { icon: Headphones, label: "Listening Fill", path: "/game/listening-fill" },
  { icon: PenLine, label: "Fix My Bulgarian", path: "/game/fix-bulgarian" },
];

// Bottom navigation items
const bottomNavItems = [
  { icon: Users, label: "Friends", path: "/friends" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const { profile } = useAuth();
  const [gamesOpen, setGamesOpen] = useState(false);
  const [quizzesOpen, setQuizzesOpen] = useState(false);

  // Check if any game or quiz is active
  const isGameActive = gameItems.some(item => location.pathname === item.path);
  const isQuizActive = quizItems.some(item => location.pathname === item.path);

  // Collapsible section renderer
  const renderCollapsibleSection = (
    title: string,
    Icon: typeof Gamepad2,
    items: typeof gameItems,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    isActive: boolean
  ) => (
    <Collapsible open={isOpen || isActive} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-bold text-base",
          isActive
            ? "bg-primary/10 text-primary border-2 border-primary"
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
      "hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border p-4",
      className
    )}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 px-4 py-3 mb-6">
        <span className="text-3xl">🦝</span>
        <span className="text-2xl font-extrabold text-primary">SHPOKO</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {/* Main Navigation Items */}
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-base",
                isActive
                  ? "bg-primary/10 text-primary border-2 border-primary"
                  : "text-muted-foreground hover:bg-accent border-2 border-transparent"
              )}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Separator */}
        <div className="py-3">
          <Separator />
        </div>

        {/* Quizzes Section - Collapsible */}
        {renderCollapsibleSection("Quizzes", GraduationCap, quizItems, quizzesOpen, setQuizzesOpen, isQuizActive)}

        {/* Games Section - Collapsible */}
        {renderCollapsibleSection("Games", Gamepad2, gameItems, gamesOpen, setGamesOpen, isGameActive)}

        {/* Separator */}
        <div className="py-3">
          <Separator />
        </div>

        {/* Bottom Navigation Items (Friends, Profile) */}
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-base",
                isActive
                  ? "bg-primary/10 text-primary border-2 border-primary"
                  : "text-muted-foreground hover:bg-accent border-2 border-transparent"
              )}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Shop - Special styling */}
        <Link
          to="/shop"
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-base",
            location.pathname === "/shop"
              ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-500 border-2 border-purple-500"
              : "text-muted-foreground hover:bg-accent border-2 border-transparent"
          )}
        >
          <ShoppingBag className="w-6 h-6" />
          <span>Shop</span>
          {profile && (profile.xp || 0) >= 100 && (
            <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
              {profile.xp} XP
            </span>
          )}
        </Link>
      </nav>

      {/* Premium banner */}
      {!profile?.is_premium && (
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
    </aside>
  );
};
