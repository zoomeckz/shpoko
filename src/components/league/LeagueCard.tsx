import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLeague } from "@/hooks/useLeague";
import { useAuth } from "@/contexts/AuthContext";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfilePicture } from "@/components/ProfilePictureSelector";
import { 
  Trophy, 
  Crown, 
  Medal, 
  ChevronUp, 
  ChevronDown, 
  Flame, 
  Sparkles, 
  Star,
  Zap,
  Shield,
  Sword,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// League tier visual data
const LEAGUE_VISUALS: Record<string, { color: string; bgGradient: string; icon: string; glow: string }> = {
  "Bronze": {
    color: "text-amber-700",
    bgGradient: "from-amber-700/20 to-amber-900/10",
    icon: "🥉",
    glow: "shadow-amber-500/30",
  },
  "Silver": {
    color: "text-slate-400",
    bgGradient: "from-slate-400/20 to-slate-600/10",
    icon: "🥈",
    glow: "shadow-slate-400/30",
  },
  "Gold": {
    color: "text-yellow-500",
    bgGradient: "from-yellow-500/20 to-yellow-700/10",
    icon: "🥇",
    glow: "shadow-yellow-500/30",
  },
  "Platinum": {
    color: "text-cyan-400",
    bgGradient: "from-cyan-400/20 to-cyan-600/10",
    icon: "💎",
    glow: "shadow-cyan-400/40",
  },
  "Diamond": {
    color: "text-blue-400",
    bgGradient: "from-blue-400/20 to-blue-600/10",
    icon: "💠",
    glow: "shadow-blue-400/50",
  },
  "Master": {
    color: "text-purple-500",
    bgGradient: "from-purple-500/20 to-purple-700/10",
    icon: "👑",
    glow: "shadow-purple-500/50",
  },
  "Champion": {
    color: "text-rose-500",
    bgGradient: "from-rose-500/20 to-rose-700/10",
    icon: "🏆",
    glow: "shadow-rose-500/50",
  },
};

interface LeagueCardProps {
  compact?: boolean;
}

export const LeagueCard = ({ compact = false }: LeagueCardProps) => {
  const { currentLeague, participants, userParticipation, loading, getUserPosition } = useLeague();
  const { profile } = useAuth();
  const { playComplete } = useDuolingoSounds();
  const [showPromotion, setShowPromotion] = useState(false);

  const userPosition = getUserPosition();
  const leagueVisuals = LEAGUE_VISUALS[currentLeague?.name || "Bronze"] || LEAGUE_VISUALS["Bronze"];
  
  // Calculate promotion/demotion zone
  const promotionZone = 5; // Top 5 get promoted
  const demotionZone = participants.length - 5; // Bottom 5 get demoted
  
  const isInPromotionZone = userPosition !== null && userPosition <= promotionZone;
  const isInDemotionZone = userPosition !== null && userPosition > demotionZone;

  // Animation for position changes
  useEffect(() => {
    if (isInPromotionZone && userPosition === 1) {
      playComplete();
    }
  }, [isInPromotionZone, userPosition, playComplete]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-32 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-muted animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!currentLeague) {
    return null;
  }

  if (compact) {
    return (
      <Link to="/leaderboard">
        <Card className={cn(
          "relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02]",
          `bg-gradient-to-br ${leagueVisuals.bgGradient}`,
          leagueVisuals.glow,
          "shadow-lg"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="text-4xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                {leagueVisuals.icon}
              </motion.div>
              <div className="flex-1">
                <h3 className={cn("font-bold", leagueVisuals.color)}>
                  {currentLeague.name} League
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    #{userPosition || "-"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    {userParticipation?.week_xp || 0} XP
                  </span>
                </div>
              </div>
              {isInPromotionZone && (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Promotion
                  </Badge>
                </motion.div>
              )}
              {isInDemotionZone && (
                <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Demotion
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden",
      `bg-gradient-to-br ${leagueVisuals.bgGradient}`,
      leagueVisuals.glow,
      "shadow-xl"
    )}>
      {/* Sparkle effects for top positions */}
      {isInPromotionZone && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-2 left-4"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
          <motion.div
            className="absolute top-6 right-8"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Star className="w-3 h-3 text-yellow-400" />
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-8"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.div>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="text-5xl"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 4
              }}
            >
              {leagueVisuals.icon}
            </motion.div>
            <div>
              <CardTitle className={cn("text-xl", leagueVisuals.color)}>
                {currentLeague.name} League
              </CardTitle>
              <p className="text-sm text-muted-foreground">Week ends Sunday</p>
            </div>
          </div>
          
          {/* User position badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-16 rounded-full",
              isInPromotionZone && "bg-green-500/20 border-2 border-green-500",
              isInDemotionZone && "bg-red-500/20 border-2 border-red-500",
              !isInPromotionZone && !isInDemotionZone && "bg-muted"
            )}
          >
            <span className="text-xs text-muted-foreground">Rank</span>
            <span className="text-2xl font-bold">#{userPosition || "-"}</span>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* XP Progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              Weekly XP
            </span>
            <span className="text-sm font-bold">{userParticipation?.week_xp || 0} XP</span>
          </div>
          <Progress 
            value={Math.min(((userParticipation?.week_xp || 0) / (currentLeague.min_xp_to_promote || 100)) * 100, 100)} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {currentLeague.min_xp_to_promote - (userParticipation?.week_xp || 0) > 0 
              ? `${currentLeague.min_xp_to_promote - (userParticipation?.week_xp || 0)} XP to promotion zone`
              : "In promotion zone! 🎉"
            }
          </p>
        </div>

        {/* Top 5 Leaderboard Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Top Learners
          </h4>
          
          <div className="space-y-1">
            {participants.slice(0, 5).map((participant, index) => {
              const isUser = participant.user_id === profile?.id;
              
              return (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg transition-all",
                    isUser && "bg-primary/10 ring-1 ring-primary",
                    index < 3 && !isUser && "bg-muted/50"
                  )}
                >
                  <div className="w-6 text-center font-bold">
                    {index === 0 && <Trophy className="w-4 h-4 text-yellow-500 mx-auto" />}
                    {index === 1 && <Medal className="w-4 h-4 text-slate-400 mx-auto" />}
                    {index === 2 && <Medal className="w-4 h-4 text-amber-600 mx-auto" />}
                    {index > 2 && <span className="text-sm text-muted-foreground">{index + 1}</span>}
                  </div>
                  <ProfilePicture pictureId={participant.profile_picture} size="xs" />
                  <span className={cn(
                    "flex-1 text-sm truncate",
                    isUser && "font-bold"
                  )}>
                    {participant.username}
                    {isUser && " (You)"}
                  </span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    {participant.week_xp}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Promotion/Demotion Status */}
        <div className="flex gap-2">
          <div className={cn(
            "flex-1 p-2 rounded-lg border text-center",
            isInPromotionZone 
              ? "bg-green-500/10 border-green-500/30" 
              : "bg-muted/50"
          )}>
            <ChevronUp className={cn(
              "w-4 h-4 mx-auto mb-1",
              isInPromotionZone ? "text-green-500" : "text-muted-foreground"
            )} />
            <p className="text-xs font-medium">Promotion</p>
            <p className="text-xs text-muted-foreground">Top 5</p>
          </div>
          <div className={cn(
            "flex-1 p-2 rounded-lg border text-center",
            isInDemotionZone 
              ? "bg-red-500/10 border-red-500/30" 
              : "bg-muted/50"
          )}>
            <ChevronDown className={cn(
              "w-4 h-4 mx-auto mb-1",
              isInDemotionZone ? "text-red-500" : "text-muted-foreground"
            )} />
            <p className="text-xs font-medium">Demotion</p>
            <p className="text-xs text-muted-foreground">Bottom 5</p>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link to="/leaderboard">
            View Full Leaderboard
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
