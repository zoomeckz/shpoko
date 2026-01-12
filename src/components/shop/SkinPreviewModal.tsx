import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, Sparkles, Star, Lock, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ShopItem } from "@/hooks/useShopItems";
import { SkinUnlockProgress } from "./SkinUnlockProgress";

interface SkinPreviewModalProps {
  skin: ShopItem | null;
  isOpen: boolean;
  onClose: () => void;
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  onEquip: () => void;
  getRarityBadge: (rarity?: string) => string;
  achievementProgress?: Record<string, number>;
}

const rarityBackgrounds: Record<string, string> = {
  common: "from-gray-600/20 via-gray-500/10 to-gray-600/20",
  rare: "from-blue-600/30 via-blue-400/10 to-blue-600/30",
  epic: "from-purple-600/30 via-purple-400/10 to-purple-600/30",
  legendary: "from-yellow-600/30 via-amber-400/20 to-yellow-600/30",
};

const rarityGlow: Record<string, string> = {
  common: "shadow-gray-500/20",
  rare: "shadow-blue-500/40",
  epic: "shadow-purple-500/40",
  legendary: "shadow-yellow-500/50",
};

export const SkinPreviewModal = ({
  skin,
  isOpen,
  onClose,
  owned,
  equipped,
  canAfford,
  onPurchase,
  onEquip,
  getRarityBadge,
  achievementProgress = {},
}: SkinPreviewModalProps) => {
  if (!skin) return null;

  const isRewardSkin = !!skin.unlockCondition;

  const bgGradient = rarityBackgrounds[skin.rarity || "common"];
  const glow = rarityGlow[skin.rarity || "common"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-2 border-border">
        {/* Background Scene */}
        <div className={cn(
          "relative min-h-[400px] bg-gradient-to-br",
          bgGradient
        )}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Stars/sparkles for legendary */}
            {skin.rarity === "legendary" && (
              <>
                <motion.div
                  className="absolute top-10 left-10"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </motion.div>
                <motion.div
                  className="absolute top-20 right-16"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </motion.div>
                <motion.div
                  className="absolute bottom-32 left-16"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </motion.div>
              </>
            )}

            {/* Floating particles for epic */}
            {skin.rarity === "epic" && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-purple-400/60"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 3) * 20}%`,
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Skin Image */}
          <div className="relative z-10 flex flex-col items-center justify-center pt-8 pb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={cn(
                "relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl",
                glow
              )}
            >
              {skin.image ? (
                <motion.img
                  src={skin.image}
                  alt={skin.name}
                  className="w-full h-full object-cover"
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-accent">
                  {skin.icon}
                </div>
              )}
            </motion.div>

            {/* Name and Rarity */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center"
            >
              <h2 className="text-2xl font-bold">{skin.name}</h2>
              <Badge className={cn("mt-2", getRarityBadge(skin.rarity))}>
                {skin.rarity?.toUpperCase()}
              </Badge>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-center text-muted-foreground px-6 max-w-xs"
            >
              {skin.description}
            </motion.p>
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 p-6 pt-2"
          >
            {owned ? (
              <Button
                onClick={onEquip}
                variant={equipped ? "default" : "outline"}
                size="lg"
                className="w-full gap-2 text-lg"
              >
                {equipped ? <Check className="w-5 h-5" /> : null}
                {equipped ? "Currently Equipped" : "Equip This Skin"}
              </Button>
            ) : isRewardSkin ? (
              <div className="space-y-3">
                <SkinUnlockProgress
                  skinId={skin.id}
                  progress={achievementProgress}
                />
                <Button
                  disabled
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 text-lg"
                >
                  <Lock className="w-5 h-5" />
                  Unlock via Achievement
                </Button>
              </div>
            ) : (
              <Button
                onClick={onPurchase}
                disabled={!canAfford}
                size="lg"
                className={cn(
                  "w-full gap-2 text-lg",
                  skin.rarity === "legendary" && "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                )}
              >
                <Zap className="w-5 h-5" />
                {canAfford ? `Purchase for ${skin.cost} XP` : `Need ${skin.cost} XP`}
              </Button>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
