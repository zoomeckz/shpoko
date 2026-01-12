import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAchievements, Achievement, ACHIEVEMENTS } from "@/hooks/useAchievements";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";
import { SHOP_ITEMS } from "@/hooks/useShopItems";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Lock, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { SkinUnlockCelebration } from "@/components/shop/SkinUnlockCelebration";
import type { ShopItem } from "@/hooks/useShopItems";

interface AchievementsProps {
  compact?: boolean;
  showUnlockPopup?: boolean;
}

const getRarityBadge = (rarity?: string) => {
  switch (rarity) {
    case "legendary":
      return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
    case "epic":
      return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    case "rare":
      return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const Achievements = ({ compact = false, showUnlockPopup = true }: AchievementsProps) => {
  const { unlockedAchievements, lockedAchievements, progress, checkAndUnlock, loading } = useAchievements();
  const { playComplete, playStreak } = useDuolingoSounds();
  const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebratingSkin, setCelebratingSkin] = useState<ShopItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const check = async () => {
      const result = await checkAndUnlock();
      if (result.achievements.length > 0 && showUnlockPopup) {
        setNewUnlocks(result.achievements);
        setShowConfetti(true);
        playComplete();
        setTimeout(() => playStreak(), 300);
        result.achievements.forEach(a => {
          toast({
            title: `🏆 Achievement Unlocked!`,
            description: `${a.name} - +${a.xpReward} XP${a.skinReward ? ' + Skin!' : ''}`,
          });
        });
        
        // Show skin celebration for unlocked skins
        if (result.skins.length > 0) {
          const firstSkinId = result.skins[0];
          const skin = SHOP_ITEMS.find(s => s.id === firstSkinId);
          if (skin) {
            // Delay the skin celebration slightly for better UX
            setTimeout(() => setCelebratingSkin(skin), 500);
          }
        }
        setTimeout(() => setShowConfetti(false), 3000);
      }
    };
    check();
  }, []);

  const categories = [
    { id: "all", label: "All" },
    { id: "lessons", label: "Lessons" },
    { id: "deepdives", label: "Deep Dives" },
    { id: "streaks", label: "Streaks" },
    { id: "xp", label: "XP" },
    { id: "games", label: "Games" },
    { id: "social", label: "Social" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredAchievements = ACHIEVEMENTS.filter(
    a => selectedCategory === "all" || a.category === selectedCategory
  );

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading achievements...</div>;
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </h3>
          <Badge variant="secondary">
            {unlockedAchievements.length}/{ACHIEVEMENTS.length}
          </Badge>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {unlockedAchievements.slice(0, 6).map(achievement => (
            <div
              key={achievement.id}
              className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg"
              title={achievement.name}
            >
              {achievement.icon}
            </div>
          ))}
          {unlockedAchievements.length < 6 &&
            Array.from({ length: 6 - unlockedAchievements.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
              >
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New unlock popup */}
      <AnimatePresence>
        {newUnlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                <div>
                  <p className="font-bold">New Achievement{newUnlocks.length > 1 ? "s" : ""} Unlocked!</p>
                  <p className="text-sm text-muted-foreground">
                    {newUnlocks.map(a => a.name).join(", ")}
                  </p>
                </div>
                <button onClick={() => setNewUnlocks([])}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{unlockedAchievements.length}</div>
          <p className="text-sm text-muted-foreground">Unlocked</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-muted-foreground">{lockedAchievements.length}</div>
          <p className="text-sm text-muted-foreground">Remaining</p>
        </Card>
      </div>

      {/* Category tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full flex-wrap h-auto gap-1">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex-1 min-w-[60px]">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <div className="grid gap-3">
            {filteredAchievements.map(achievement => {
              const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
              const currentProgress = progress[achievement.id] || 0;
              const progressPercent = Math.min((currentProgress / achievement.requirement) * 100, 100);

              return (
                <Card
                  key={achievement.id}
                  className={cn(
                    "p-4 transition-all",
                    isUnlocked
                      ? "bg-primary/5 border-primary/30"
                      : "opacity-75"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                        isUnlocked ? "bg-primary/20" : "bg-muted"
                      )}
                    >
                      {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{achievement.name}</h4>
                        {isUnlocked && (
                          <Badge variant="secondary" className="text-xs">
                            +{achievement.xpReward} XP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {!isUnlocked && (
                        <div className="mt-2">
                          <Progress value={progressPercent} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {currentProgress} / {achievement.requirement}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Skin Unlock Celebration */}
      <SkinUnlockCelebration
        skin={celebratingSkin}
        isOpen={!!celebratingSkin}
        onClose={() => setCelebratingSkin(null)}
        getRarityBadge={getRarityBadge}
      />
    </div>
  );
};
