import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAchievements, Achievement, ACHIEVEMENTS } from "@/hooks/useAchievements";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Lock, Filter, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { unlockedAchievements, lockedAchievements, progress, loading } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const categories = [
    { id: "all", label: "All", icon: "🏆" },
    { id: "lessons", label: "Lessons", icon: "📚" },
    { id: "streaks", label: "Streaks", icon: "🔥" },
    { id: "xp", label: "XP", icon: "⭐" },
    { id: "games", label: "Games", icon: "🎮" },
    { id: "social", label: "Social", icon: "👥" },
  ];

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    const categoryMatch = selectedCategory === "all" || a.category === selectedCategory;
    const isUnlocked = unlockedAchievements.some((u) => u.id === a.id);
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "unlocked" && isUnlocked) ||
      (filterStatus === "locked" && !isUnlocked);
    return categoryMatch && statusMatch;
  });

  const totalXPEarned = unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto text-primary animate-pulse mb-4" />
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-nunito">Achievements</h1>
              <p className="text-sm text-muted-foreground">
                Track your progress and unlock rewards
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 text-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
              <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <div className="text-3xl font-bold">{unlockedAchievements.length}</div>
              <p className="text-sm text-muted-foreground">Unlocked</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <Sparkles className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <div className="text-3xl font-bold">{totalXPEarned}</div>
              <p className="text-sm text-muted-foreground">XP Earned</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
              <Star className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <div className="text-3xl font-bold">
                {Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </Card>
          </motion.div>
        </div>

        {/* Overall Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {unlockedAchievements.length} / {ACHIEVEMENTS.length}
            </span>
          </div>
          <Progress
            value={(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}
            className="h-3"
          />
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap flex-1">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="gap-1"
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </Button>
            ))}
          </div>
          {/* Status filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unlocked">Unlocked</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Achievement Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAchievements.map((achievement, idx) => {
            const isUnlocked = unlockedAchievements.some((a) => a.id === achievement.id);
            const currentProgress = progress[achievement.id] || 0;
            const progressPercent = Math.min(
              (currentProgress / achievement.requirement) * 100,
              100
            );

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card
                  className={cn(
                    "p-5 transition-all hover:shadow-md",
                    isUnlocked
                      ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30"
                      : "opacity-80"
                  )}
                >
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0",
                        isUnlocked
                          ? "bg-gradient-to-br from-yellow-400/20 to-orange-500/20"
                          : "bg-muted"
                      )}
                    >
                      {isUnlocked ? (
                        achievement.icon
                      ) : (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold">{achievement.name}</h3>
                        <Badge
                          variant={isUnlocked ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          +{achievement.xpReward} XP
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                      {!isUnlocked && (
                        <div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>
                              {currentProgress} / {achievement.requirement}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      )}
                      {isUnlocked && (
                        <div className="flex items-center gap-1 text-green-500 text-sm">
                          <Trophy className="w-4 h-4" />
                          <span>Unlocked!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No achievements match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
