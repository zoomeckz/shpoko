import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useStreakFreeze } from "@/hooks/useStreakFreeze";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Snowflake,
  Zap,
  ShoppingBag,
  History,
  Gift,
  Shield,
  Crown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const Shop = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { playComplete, playClick, playIncorrect } = useDuolingoSounds();
  const {
    freezeCount,
    transactions,
    loading,
    purchaseFreeze,
    freezeCostXP,
    maxFreezes,
    canPurchase,
  } = useStreakFreeze();

  const [purchasing, setPurchasing] = useState(false);

  const handlePurchaseFreeze = async () => {
    setPurchasing(true);
    playClick();

    const result = await purchaseFreeze();

    if (result.success) {
      playComplete();
      toast({
        title: "Streak Freeze Purchased! ❄️",
        description: "Your streak is now protected for one day!",
      });
    } else {
      playIncorrect();
      toast({
        title: "Purchase Failed",
        description: result.error,
        variant: "destructive",
      });
    }

    setPurchasing(false);
  };

  if (!user) {
    return null;
  }

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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                <ShoppingBag className="w-10 h-10 text-purple-500" />
              </div>
              <h1 className="text-3xl font-bold font-nunito">Shop</h1>
              <p className="text-muted-foreground">Spend your hard-earned XP!</p>

              {/* XP Balance */}
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg">{profile?.xp || 0} XP</span>
              </div>
            </motion.div>

            {/* Streak Freeze Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 mb-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Snowflake className="w-6 h-6 text-cyan-500" />
                    Streak Freeze
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Protect your streak when you can't practice! A freeze will
                    automatically be used if you miss a day.
                  </p>

                  {/* Current Freezes */}
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Your Freezes</span>
                      <Badge variant="secondary">
                        {freezeCount} / {maxFreezes}
                      </Badge>
                    </div>
                    <Progress
                      value={(freezeCount / maxFreezes) * 100}
                      className="h-3"
                    />
                    <div className="flex justify-center gap-2 mt-3">
                      {[...Array(maxFreezes)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            i < freezeCount
                              ? "bg-cyan-500/20 text-cyan-500"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Snowflake className="w-4 h-4" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed">
                    <div>
                      <div className="font-bold text-lg">Buy Streak Freeze</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Zap className="w-4 h-4 text-primary" />
                        <span>{freezeCostXP} XP</span>
                      </div>
                    </div>
                    <Button
                      onClick={handlePurchaseFreeze}
                      disabled={!canPurchase || purchasing || loading}
                      className="gap-2"
                      size="lg"
                    >
                      <Snowflake className="w-4 h-4" />
                      {purchasing ? "Purchasing..." : "Buy"}
                    </Button>
                  </div>

                  {!canPurchase && (
                    <p className="text-sm text-muted-foreground text-center">
                      {freezeCount >= maxFreezes
                        ? "You have the maximum number of freezes!"
                        : `Need ${freezeCostXP - (profile?.xp || 0)} more XP`}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* How it Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    How Streak Freeze Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Purchase freezes with XP</p>
                      <p className="text-sm text-muted-foreground">
                        Each freeze costs {freezeCostXP} XP
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Freezes protect your streak</p>
                      <p className="text-sm text-muted-foreground">
                        If you miss a day, a freeze is automatically used
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Stack up to {maxFreezes}</p>
                      <p className="text-sm text-muted-foreground">
                        Plan ahead for busy days or vacations!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Earn Free Freezes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gift className="w-10 h-10 text-primary" />
                    <div>
                      <h3 className="font-bold">Earn Free Freezes</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete weekly challenges for rewards!
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/quests")}>
                    View Challenges
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Transaction History */}
            {transactions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Recent Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              tx.transaction_type === "purchase"
                                ? "bg-cyan-500/20 text-cyan-500"
                                : tx.transaction_type === "earned"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-orange-500/20 text-orange-500"
                            )}
                          >
                            <Snowflake className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">
                              {tx.transaction_type === "purchase"
                                ? "Purchased"
                                : tx.transaction_type === "earned"
                                ? "Earned"
                                : "Used"}{" "}
                              Freeze
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(tx.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        {tx.xp_cost && (
                          <span className="text-sm text-muted-foreground">
                            -{tx.xp_cost} XP
                          </span>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Premium Upsell */}
            {!profile?.is_premium && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="mt-6 border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                  <CardContent className="p-6 flex items-center gap-4">
                    <Crown className="w-12 h-12 text-yellow-500 shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Super SHPOKO</h3>
                      <p className="text-sm text-muted-foreground">
                        Get unlimited streak freezes and 15% XP bonus!
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate("/premium")}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    >
                      Upgrade
                    </Button>
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

export default Shop;
