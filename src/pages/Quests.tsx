import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { useQuests } from "@/hooks/useQuests";
import { WeeklyChallenges } from "@/components/WeeklyChallenges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Target, Zap, Flame, BookOpen, Trophy, Clock, 
  CheckCircle2, Gift, Crown, ChevronRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const getQuestIcon = (actionType: string) => {
  switch (actionType) {
    case "earn_xp":
      return Zap;
    case "complete_lesson":
      return BookOpen;
    case "maintain_streak":
      return Flame;
    case "complete_quiz":
      return Trophy;
    default:
      return Target;
  }
};

const getQuestColor = (actionType: string) => {
  switch (actionType) {
    case "earn_xp":
      return "text-primary bg-primary/20";
    case "complete_lesson":
      return "text-success bg-success/20";
    case "maintain_streak":
      return "text-warning bg-warning/20";
    case "complete_quiz":
      return "text-purple-500 bg-purple-500/20";
    default:
      return "text-muted-foreground bg-muted";
  }
};

const Quests = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { dailyQuests, weeklyQuests, loading: questsLoading, refetch } = useQuests();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedDaily = dailyQuests.filter(q => q.completed).length;
  const completedWeekly = weeklyQuests.filter(q => q.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 pb-20 lg:pb-8 px-4">
          <div className="max-w-2xl mx-auto py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Quests</h1>
              <p className="text-muted-foreground">Complete quests to earn bonus XP!</p>
            </motion.div>

            {/* Weekly Challenges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-6"
            >
              <WeeklyChallenges />
            </motion.div>

            {/* Achievements Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-6"
            >
              <Card
                className="border-2 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate("/achievements")}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">Achievements</h3>
                      <p className="text-sm text-muted-foreground">View all badges and progress</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Daily Quests
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {completedDaily} / {dailyQuests.length} completed
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading quests...
                    </div>
                  ) : dailyQuests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No daily quests available
                    </div>
                  ) : (
                    dailyQuests.map((userQuest, index) => {
                      const Icon = getQuestIcon(userQuest.quest.action_type);
                      const colorClass = getQuestColor(userQuest.quest.action_type);
                      const progress = Math.min(100, (userQuest.current_count / userQuest.quest.target_count) * 100);
                      
                      return (
                        <motion.div
                          key={userQuest.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-colors",
                            userQuest.completed 
                              ? "bg-success/10 border-success/30" 
                              : "bg-card border-border"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-14 h-14 rounded-xl flex items-center justify-center",
                              userQuest.completed ? "bg-success/20" : colorClass.split(" ")[1]
                            )}>
                              {userQuest.completed ? (
                                <CheckCircle2 className="w-7 h-7 text-success" />
                              ) : (
                                <Icon className={cn("w-7 h-7", colorClass.split(" ")[0])} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold truncate">{userQuest.quest.title}</h3>
                                {userQuest.completed && (
                                  <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                                    Done!
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {userQuest.quest.description}
                              </p>
                              <div className="flex items-center gap-3">
                                <Progress value={progress} className="h-2 flex-1" />
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                  {userQuest.current_count} / {userQuest.quest.target_count}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 text-primary font-bold">
                                <Gift className="w-4 h-4" />
                                <span>+{userQuest.quest.xp_reward} XP</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Expires {formatDistanceToNow(new Date(userQuest.expires_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Weekly Quests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-warning" />
                      Weekly Quests
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {completedWeekly} / {weeklyQuests.length} completed
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading quests...
                    </div>
                  ) : weeklyQuests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No weekly quests available
                    </div>
                  ) : (
                    weeklyQuests.map((userQuest, index) => {
                      const Icon = getQuestIcon(userQuest.quest.action_type);
                      const colorClass = getQuestColor(userQuest.quest.action_type);
                      const progress = Math.min(100, (userQuest.current_count / userQuest.quest.target_count) * 100);
                      
                      return (
                        <motion.div
                          key={userQuest.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-colors",
                            userQuest.completed 
                              ? "bg-success/10 border-success/30" 
                              : "bg-card border-border"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-14 h-14 rounded-xl flex items-center justify-center",
                              userQuest.completed ? "bg-success/20" : colorClass.split(" ")[1]
                            )}>
                              {userQuest.completed ? (
                                <CheckCircle2 className="w-7 h-7 text-success" />
                              ) : (
                                <Icon className={cn("w-7 h-7", colorClass.split(" ")[0])} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold truncate">{userQuest.quest.title}</h3>
                                {userQuest.completed && (
                                  <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                                    Done!
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {userQuest.quest.description}
                              </p>
                              <div className="flex items-center gap-3">
                                <Progress value={progress} className="h-2 flex-1" />
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                  {userQuest.current_count} / {userQuest.quest.target_count}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 text-warning font-bold">
                                <Gift className="w-4 h-4" />
                                <span>+{userQuest.quest.xp_reward} XP</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Expires {formatDistanceToNow(new Date(userQuest.expires_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Banner */}
            {!profile.is_premium && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-2 border-warning/30 bg-gradient-to-r from-warning/10 to-yellow-500/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Crown className="w-12 h-12 text-warning" />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">Get Super SHPOKO</h3>
                        <p className="text-sm text-muted-foreground">
                          Earn 15% more XP on all quests and lessons!
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate("/premium")}
                        className="bg-warning hover:bg-warning/90 text-black font-bold"
                      >
                        Upgrade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Quests;
