import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useStreakFreeze } from "@/hooks/useStreakFreeze";
import { useShopItems, SHOP_ITEMS, ShopItem } from "@/hooks/useShopItems";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import {
  Snowflake,
  Zap,
  ShoppingBag,
  History,
  Gift,
  Shield,
  Crown,
  ChevronRight,
  Sparkles,
  Timer,
  Check,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const buttonPop: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};
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
    loading: freezeLoading,
    purchaseFreeze,
    freezeCostXP,
    maxFreezes,
    canPurchase,
  } = useStreakFreeze();

  const {
    shopItems,
    ownedItems,
    activeBooster,
    equippedSkin,
    equippedBadges,
    loading: shopLoading,
    purchaseItem,
    equipSkin,
    toggleBadge,
    getRarityColor,
    getRarityBadge,
  } = useShopItems();

  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("boosters");

  const handlePurchaseFreeze = async () => {
    setPurchasing("freeze");
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

    setPurchasing(null);
  };

  const handlePurchaseItem = async (item: ShopItem) => {
    setPurchasing(item.id);
    playClick();

    const result = await purchaseItem(item.id);

    if (result.success) {
      playComplete();
      toast({
        title: `${item.name} Purchased! ${item.icon}`,
        description: item.type === "xp_booster" 
          ? `Your XP boost is now active!` 
          : `${item.name} has been added to your collection!`,
      });
    } else {
      playIncorrect();
      toast({
        title: "Purchase Failed",
        description: result.error,
        variant: "destructive",
      });
    }

    setPurchasing(null);
  };

  if (!user) {
    return null;
  }

  const boosters = shopItems.filter((i) => i.type === "xp_booster");
  const badges = shopItems.filter((i) => i.type === "badge");
  const skins = shopItems.filter((i) => i.type === "raccoon_skin");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <TopBar />

        <div className="flex">
          <Sidebar />

          <main className="flex-1 pb-20 lg:pb-8 px-4">
            <motion.div 
              className="max-w-2xl mx-auto py-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Header */}
              <motion.div
                variants={staggerItem}
                className="text-center mb-8"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                >
                  <ShoppingBag className="w-10 h-10 text-purple-500" />
                </motion.div>
                <h1 className="text-3xl font-bold font-nunito">Shop</h1>
                <p className="text-muted-foreground">Spend your hard-earned XP!</p>

                {/* XP Balance */}
                <motion.div 
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary/10"
                  variants={buttonPop}
                >
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-bold text-lg">{profile?.xp || 0} XP</span>
                </motion.div>

                {/* Active Booster Indicator */}
                <AnimatePresence>
                  {activeBooster && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500"
                    >
                      <Timer className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-medium">
                        {activeBooster.multiplier}x XP Active
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Shop Tabs */}
              <motion.div variants={staggerItem}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                  <TabsList className="grid w-full grid-cols-4 h-12">
                    <TabsTrigger value="boosters" className="gap-1">
                      <Zap className="w-4 h-4" />
                      <span className="hidden sm:inline">Boosters</span>
                    </TabsTrigger>
                    <TabsTrigger value="badges" className="gap-1">
                      <Star className="w-4 h-4" />
                      <span className="hidden sm:inline">Badges</span>
                    </TabsTrigger>
                    <TabsTrigger value="skins" className="gap-1">
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Skins</span>
                    </TabsTrigger>
                    <TabsTrigger value="freezes" className="gap-1">
                      <Snowflake className="w-4 h-4" />
                      <span className="hidden sm:inline">Freezes</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* XP Boosters Tab */}
                  <TabsContent value="boosters">
                    <motion.div 
                      className="grid gap-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {boosters.map((item) => (
                        <motion.div key={item.id} variants={staggerItem}>
                          <Card className={cn(
                            "border-2 overflow-hidden transition-all",
                            getRarityColor(item.rarity),
                            activeBooster?.type === item.id && "ring-2 ring-yellow-500"
                          )}>
                            <CardContent className="p-4 flex items-center gap-4">
                              <div className="text-4xl">{item.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold">{item.name}</h3>
                                  <Badge className={cn("text-xs", getRarityBadge(item.rarity))}>
                                    {item.rarity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                              <div className="text-right">
                                <motion.div
                                  whileHover="hover"
                                  whileTap="tap"
                                  variants={buttonPop}
                                >
                                  <Button
                                    onClick={() => handlePurchaseItem(item)}
                                    disabled={purchasing === item.id || (profile?.xp || 0) < item.cost}
                                    size="sm"
                                    className="gap-1"
                                  >
                                    <Zap className="w-3 h-3" />
                                    {item.cost}
                                  </Button>
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  </TabsContent>

                  {/* Badges Tab */}
                  <TabsContent value="badges">
                    <motion.div 
                      className="grid grid-cols-2 gap-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {badges.map((item) => {
                        const owned = ownedItems.includes(item.id);
                        const equipped = equippedBadges.includes(item.id);
                        return (
                          <motion.div key={item.id} variants={staggerItem}>
                            <Card className={cn(
                              "border-2 overflow-hidden transition-all",
                              getRarityColor(item.rarity),
                              equipped && "ring-2 ring-primary"
                            )}>
                              <CardContent className="p-4 text-center">
                                <div className="text-5xl mb-2">{item.icon}</div>
                                <h3 className="font-bold text-sm">{item.name}</h3>
                                <Badge className={cn("text-xs mt-1 mb-2", getRarityBadge(item.rarity))}>
                                  {item.rarity}
                                </Badge>
                                <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
                                {owned ? (
                                  <Button
                                    onClick={() => toggleBadge(item.id)}
                                    variant={equipped ? "default" : "outline"}
                                    size="sm"
                                    className="w-full gap-1"
                                  >
                                    {equipped ? <Check className="w-3 h-3" /> : null}
                                    {equipped ? "Equipped" : "Equip"}
                                  </Button>
                                ) : (
                                  <motion.div whileHover="hover" whileTap="tap" variants={buttonPop}>
                                    <Button
                                      onClick={() => handlePurchaseItem(item)}
                                      disabled={purchasing === item.id || (profile?.xp || 0) < item.cost}
                                      size="sm"
                                      className="w-full gap-1"
                                    >
                                      <Zap className="w-3 h-3" />
                                      {item.cost}
                                    </Button>
                                  </motion.div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </TabsContent>

                  {/* Raccoon Skins Tab */}
                  <TabsContent value="skins">
                    <motion.div 
                      className="grid grid-cols-2 gap-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {skins.map((item) => {
                        const owned = ownedItems.includes(item.id);
                        const equipped = equippedSkin === item.id;
                        return (
                          <motion.div key={item.id} variants={staggerItem}>
                            <Card className={cn(
                              "border-2 overflow-hidden transition-all",
                              getRarityColor(item.rarity),
                              equipped && "ring-2 ring-primary"
                            )}>
                              <CardContent className="p-4 text-center">
                                {item.image ? (
                                  <div className="w-24 h-24 mx-auto mb-2 rounded-lg overflow-hidden bg-accent/50">
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-5xl mb-2">{item.icon}</div>
                                )}
                                <h3 className="font-bold text-sm">{item.name}</h3>
                                <Badge className={cn("text-xs mt-1 mb-2", getRarityBadge(item.rarity))}>
                                  {item.rarity}
                                </Badge>
                                <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
                                {owned ? (
                                  <Button
                                    onClick={() => equipSkin(item.id)}
                                    variant={equipped ? "default" : "outline"}
                                    size="sm"
                                    className="w-full gap-1"
                                  >
                                    {equipped ? <Check className="w-3 h-3" /> : null}
                                    {equipped ? "Equipped" : "Equip"}
                                  </Button>
                                ) : (
                                  <motion.div whileHover="hover" whileTap="tap" variants={buttonPop}>
                                    <Button
                                      onClick={() => handlePurchaseItem(item)}
                                      disabled={purchasing === item.id || (profile?.xp || 0) < item.cost}
                                      size="sm"
                                      className="w-full gap-1"
                                    >
                                      <Zap className="w-3 h-3" />
                                      {item.cost}
                                    </Button>
                                  </motion.div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </TabsContent>

                  {/* Streak Freezes Tab */}
                  <TabsContent value="freezes">
                    <motion.div variants={staggerItem}>
                      <Card className="relative border-2 mb-6 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 pointer-events-none" />
                        <CardHeader className="pb-3 relative z-10">
                          <CardTitle className="flex items-center gap-2">
                            <Snowflake className="w-6 h-6 text-cyan-500" />
                            Streak Freeze
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 relative z-10">
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
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: i * 0.1 }}
                                  className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                    i < freezeCount
                                      ? "bg-cyan-500/20 text-cyan-500"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  <Snowflake className="w-4 h-4" />
                                </motion.div>
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
                            <motion.div whileHover="hover" whileTap="tap" variants={buttonPop}>
                              <Button
                                onClick={handlePurchaseFreeze}
                                disabled={!canPurchase || purchasing === "freeze" || freezeLoading}
                                className="gap-2"
                                size="lg"
                              >
                                <Snowflake className="w-4 h-4" />
                                {purchasing === "freeze" ? "Purchasing..." : "Buy"}
                              </Button>
                            </motion.div>
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

                      {/* How it Works */}
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
                  </TabsContent>
                </Tabs>
              </motion.div>

              {/* Earn Free Items */}
              <motion.div variants={staggerItem}>
                <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="w-10 h-10 text-primary" />
                      <div>
                        <h3 className="font-bold">Earn Free Rewards</h3>
                        <p className="text-sm text-muted-foreground">
                          Complete challenges for free items!
                        </p>
                      </div>
                    </div>
                    <motion.div whileHover="hover" whileTap="tap" variants={buttonPop}>
                      <Button variant="outline" onClick={() => navigate("/quests")}>
                        View Challenges
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Transaction History */}
              {transactions.length > 0 && (
                <motion.div variants={staggerItem}>
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
                <motion.div variants={staggerItem}>
                  <Card className="mt-6 border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                    <CardContent className="p-6 flex items-center gap-4">
                      <Crown className="w-12 h-12 text-yellow-500 shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Super SHPOKO</h3>
                        <p className="text-sm text-muted-foreground">
                          Get unlimited streak freezes and 15% XP bonus!
                        </p>
                      </div>
                      <motion.div whileHover="hover" whileTap="tap" variants={buttonPop}>
                        <Button
                          onClick={() => navigate("/premium")}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                        >
                          Upgrade
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default Shop;
