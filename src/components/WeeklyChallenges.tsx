import { motion } from "framer-motion";
import { useWeeklyChallenges } from "@/hooks/useWeeklyChallenges";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Gift, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";
import { useToast } from "@/hooks/use-toast";

interface WeeklyChallengesProps {
  compact?: boolean;
}

export const WeeklyChallenges = ({ compact = false }: WeeklyChallengesProps) => {
  const {
    challenges,
    loading,
    claimReward,
    daysRemaining,
    completedCount,
    totalChallenges,
  } = useWeeklyChallenges();
  const { playComplete, playXP } = useDuolingoSounds();
  const { toast } = useToast();

  const handleClaim = async (challengeId: string, xpReward: number) => {
    const success = await claimReward(challengeId);
    if (success) {
      playComplete();
      toast({
        title: "Challenge Complete! 🎉",
        description: `You earned ${xpReward} bonus XP!`,
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Loading challenges...</div>;
  }

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Weekly Challenges
          </h3>
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            {daysRemaining}d left
          </Badge>
        </div>
        <div className="space-y-2">
          {challenges.slice(0, 3).map((challenge) => (
            <div key={challenge.id} className="flex items-center gap-2">
              <span className="text-lg">{challenge.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{challenge.title}</div>
                <Progress
                  value={(challenge.current / challenge.target) * 100}
                  className="h-1.5"
                />
              </div>
              {challenge.completed && !challenge.claimed && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleClaim(challenge.id, challenge.xpReward)}
                >
                  <Gift className="w-3 h-3" />
                </Button>
              )}
              {challenge.claimed && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center mt-3">
          {completedCount}/{totalChallenges} completed
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Weekly Challenges
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete challenges for bonus XP rewards
          </p>
        </div>
        <Badge variant="outline" className="gap-1 text-sm">
          <Clock className="w-4 h-4" />
          {daysRemaining} days left
        </Badge>
      </div>

      {/* Progress overview */}
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Weekly Progress</span>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalChallenges}
          </span>
        </div>
        <Progress value={(completedCount / totalChallenges) * 100} className="h-2" />
      </Card>

      {/* Challenge list */}
      <div className="space-y-3">
        {challenges.map((challenge, idx) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={cn(
                "p-4 transition-all",
                challenge.completed && !challenge.claimed && "border-primary bg-primary/5",
                challenge.claimed && "opacity-75"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                    challenge.completed ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  {challenge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{challenge.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      +{challenge.xpReward} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {challenge.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(challenge.current / challenge.target) * 100}
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {challenge.current}/{challenge.target}
                    </span>
                  </div>
                </div>
                {challenge.completed && !challenge.claimed && (
                  <Button
                    onClick={() => handleClaim(challenge.id, challenge.xpReward)}
                    className="gap-1"
                  >
                    <Gift className="w-4 h-4" />
                    Claim
                  </Button>
                )}
                {challenge.claimed && (
                  <div className="flex items-center gap-1 text-green-500">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Claimed</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
