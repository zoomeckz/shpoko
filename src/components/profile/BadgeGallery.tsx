import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDeepDiveProgress } from "@/hooks/useDeepDiveProgress";
import { BADGES, getRarityColor, getRarityBorder } from "@/data/badges";
import { Award, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeGalleryProps {
  compact?: boolean;
}

export const BadgeGallery = ({ compact = false }: BadgeGalleryProps) => {
  const { getEarnedBadges, hasBadge, totalCompleted, loading } = useDeepDiveProgress();
  
  const earnedBadges = getEarnedBadges();
  const totalBadges = BADGES.length;
  const progressPercent = (earnedBadges.length / totalBadges) * 100;

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading badges...
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Badges
          </h3>
          <Badge variant="secondary">
            {earnedBadges.length}/{totalBadges}
          </Badge>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {earnedBadges.slice(0, 6).map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                "bg-gradient-to-br",
                getRarityColor(badge.rarity)
              )}
              title={badge.name}
            >
              {badge.icon}
            </motion.div>
          ))}
          {earnedBadges.length < 6 &&
            Array.from({ length: 6 - earnedBadges.length }).map((_, i) => (
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

  const categories = [
    { id: "mastery", label: "Mastery", icon: "🏆" },
    { id: "alphabet", label: "Alphabet", icon: "🔤" },
    { id: "grammar", label: "Grammar", icon: "📝" },
    { id: "vocabulary", label: "Vocabulary", icon: "📚" },
    { id: "challenges", label: "Challenges", icon: "⚡" },
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Badge Collection
          </span>
          <Badge variant="secondary">
            {earnedBadges.length}/{totalBadges}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Collection Progress</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-accent rounded-xl p-3">
            <div className="text-2xl font-bold text-primary">{totalCompleted}</div>
            <div className="text-xs text-muted-foreground">Deep Dives</div>
          </div>
          <div className="bg-accent rounded-xl p-3">
            <div className="text-2xl font-bold text-purple-500">{earnedBadges.length}</div>
            <div className="text-xs text-muted-foreground">Badges</div>
          </div>
          <div className="bg-accent rounded-xl p-3">
            <div className="text-2xl font-bold text-yellow-500">
              {earnedBadges.filter(b => b.rarity === 'legendary' || b.rarity === 'epic').length}
            </div>
            <div className="text-xs text-muted-foreground">Rare+</div>
          </div>
        </div>

        {/* Badge Grid by Category */}
        {categories.map(cat => {
          const catBadges = BADGES.filter(b => b.category === cat.id);
          if (catBadges.length === 0) return null;
          
          return (
            <div key={cat.id}>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <span>{cat.icon}</span>
                {cat.label}
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {catBadges.map(badge => {
                  const earned = hasBadge(badge.id);
                  
                  return (
                    <motion.div
                      key={badge.id}
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                        earned
                          ? cn("bg-gradient-to-br", getRarityColor(badge.rarity), getRarityBorder(badge.rarity))
                          : "bg-muted/50 border-muted opacity-60"
                      )}
                    >
                      <div className={cn(
                        "text-2xl mb-1",
                        !earned && "grayscale opacity-50"
                      )}>
                        {earned ? badge.icon : <Lock className="w-6 h-6" />}
                      </div>
                      <span className={cn(
                        "text-xs text-center font-medium line-clamp-2",
                        earned ? "text-white" : "text-muted-foreground"
                      )}>
                        {badge.name}
                      </span>
                      {earned && (
                        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
