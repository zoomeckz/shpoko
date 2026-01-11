import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAchievements, Achievement } from "@/hooks/useAchievements";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Trophy, 
  Star, 
  Lock, 
  Sparkles,
  ChevronRight,
  Flame,
  Zap,
  BookOpen,
  Gamepad2,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AchievementBadgesProps {
  compact?: boolean;
  showUnlockAnimation?: boolean;
}

// Category icons
const CATEGORY_ICONS = {
  lessons: BookOpen,
  streaks: Flame,
  xp: Zap,
  games: Gamepad2,
  social: Users,
};

const CATEGORY_COLORS = {
  lessons: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
  streaks: "from-orange-500/20 to-red-500/10 border-orange-500/30",
  xp: "from-purple-500/20 to-pink-500/10 border-purple-500/30",
  games: "from-green-500/20 to-emerald-500/10 border-green-500/30",
  social: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30",
};

export const AchievementBadges = ({ compact = false, showUnlockAnimation = true }: AchievementBadgesProps) => {
  const { 
    achievements, 
    unlockedAchievements, 
    lockedAchievements, 
    progress, 
    checkAndUnlock,
    loading 
  } = useAchievements();
  const { playComplete } = useDuolingoSounds();
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Check for new achievements on mount
  useEffect(() => {
    const checkAchievements = async () => {
      const unlocked = await checkAndUnlock();
      if (unlocked.length > 0 && showUnlockAnimation) {
        setNewlyUnlocked(unlocked);
        setShowUnlockDialog(true);
        playComplete();
        
        unlocked.forEach(a => {
          toast.success(`🏆 Achievement Unlocked: ${a.name}!`, {
            description: `+${a.xpReward} XP bonus!`,
          });
        });
      }
    };
    
    if (!loading) {
      checkAchievements();
    }
  }, [loading]);

  const getCategoryIcon = (category: Achievement["category"]) => {
    const Icon = CATEGORY_ICONS[category];
    return Icon ? <Icon className="w-4 h-4" /> : <Star className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-muted animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    // Show just the count and latest badges
    return (
      <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Trophy className="w-8 h-8 text-yellow-500" />
              </motion.div>
              <div>
                <h3 className="font-bold">Achievements</h3>
                <p className="text-sm text-muted-foreground">
                  {unlockedAchievements.length}/{achievements.length} unlocked
                </p>
              </div>
            </div>
            
            {/* Recent badges */}
            <div className="flex -space-x-2">
              {unlockedAchievements.slice(0, 4).map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/10 flex items-center justify-center text-lg border-2 border-background"
                  title={a.name}
                >
                  {a.icon}
                </motion.div>
              ))}
              {unlockedAchievements.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold border-2 border-background">
                  +{unlockedAchievements.length - 4}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements
            </CardTitle>
            <Badge variant="secondary">
              {unlockedAchievements.length}/{achievements.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress by category */}
          {Object.entries(CATEGORY_ICONS).map(([category, Icon]) => {
            const categoryAchievements = achievements.filter(a => a.category === category);
            const unlocked = categoryAchievements.filter(a => unlockedAchievements.find(u => u.id === a.id));
            const progressPercent = (unlocked.length / categoryAchievements.length) * 100;
            
            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 capitalize">
                    <Icon className="w-4 h-4" />
                    {category}
                  </span>
                  <span className="text-muted-foreground">
                    {unlocked.length}/{categoryAchievements.length}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            );
          })}

          {/* Achievement Grid */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {achievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.find(a => a.id === achievement.id);
              const currentProgress = progress[achievement.id] || 0;
              const progressPercent = Math.min((currentProgress / achievement.requirement) * 100, 100);
              
              return (
                <motion.button
                  key={achievement.id}
                  onClick={() => setSelectedAchievement(achievement)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all",
                    isUnlocked
                      ? `bg-gradient-to-br ${CATEGORY_COLORS[achievement.category]} border-yellow-500/50`
                      : "bg-muted/50 border-muted opacity-60"
                  )}
                >
                  <span className={cn(
                    "text-2xl",
                    !isUnlocked && "grayscale opacity-50"
                  )}>
                    {achievement.icon}
                  </span>
                  {!isUnlocked && (
                    <Progress value={progressPercent} className="h-1 w-full mt-1" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Unlock Animation Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Achievement Unlocked!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {newlyUnlocked.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: index * 0.2 }}
                className={cn(
                  "p-6 rounded-xl border-2 text-center",
                  `bg-gradient-to-br ${CATEGORY_COLORS[achievement.category]}`
                )}
              >
                <motion.span 
                  className="text-6xl block mb-3"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {achievement.icon}
                </motion.span>
                <h3 className="text-xl font-bold mb-1">{achievement.name}</h3>
                <p className="text-muted-foreground mb-3">{achievement.description}</p>
                <Badge className="bg-primary/20 text-primary">
                  +{achievement.xpReward} XP Bonus
                </Badge>
              </motion.div>
            ))}
          </div>
          <Button onClick={() => setShowUnlockDialog(false)} className="w-full">
            Awesome!
          </Button>
        </DialogContent>
      </Dialog>

      {/* Achievement Details Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="sm:max-w-sm">
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">{selectedAchievement.name}</DialogTitle>
              </DialogHeader>
              <div className="text-center space-y-4">
                <motion.span 
                  className={cn(
                    "text-6xl block",
                    !unlockedAchievements.find(a => a.id === selectedAchievement.id) && "grayscale opacity-50"
                  )}
                  animate={unlockedAchievements.find(a => a.id === selectedAchievement.id) ? { 
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  {selectedAchievement.icon}
                </motion.span>
                <p className="text-muted-foreground">{selectedAchievement.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {progress[selectedAchievement.id] || 0}/{selectedAchievement.requirement}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(((progress[selectedAchievement.id] || 0) / selectedAchievement.requirement) * 100, 100)} 
                    className="h-3"
                  />
                </div>
                
                <Badge variant="secondary" className="gap-1">
                  <Zap className="w-3 h-3" />
                  {selectedAchievement.xpReward} XP Reward
                </Badge>
                
                {unlockedAchievements.find(a => a.id === selectedAchievement.id) ? (
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    ✓ Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="w-3 h-3" />
                    Locked
                  </Badge>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
