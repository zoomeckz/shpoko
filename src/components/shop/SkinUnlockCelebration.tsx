import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useCallback } from "react";
import type { ShopItem } from "@/hooks/useShopItems";

interface SkinUnlockCelebrationProps {
  skin: ShopItem | null;
  isOpen: boolean;
  onClose: () => void;
  getRarityBadge: (rarity?: string) => string;
}

// Confetti particle component
const ConfettiParticle = ({ delay, color, left }: { delay: number; color: string; left: number }) => (
  <motion.div
    className="absolute w-3 h-3 rounded-sm"
    style={{ 
      backgroundColor: color,
      left: `${left}%`,
      top: -10,
    }}
    initial={{ y: 0, rotate: 0, opacity: 1 }}
    animate={{ 
      y: 500, 
      rotate: [0, 180, 360, 540],
      opacity: [1, 1, 1, 0],
      x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
    }}
    transition={{ 
      duration: 3,
      delay: delay,
      ease: "easeOut",
    }}
  />
);

const rarityColors: Record<string, string[]> = {
  common: ["#9ca3af", "#6b7280", "#d1d5db"],
  rare: ["#3b82f6", "#60a5fa", "#93c5fd"],
  epic: ["#a855f7", "#c084fc", "#e879f9"],
  legendary: ["#eab308", "#facc15", "#fef08a", "#f59e0b"],
};

export const SkinUnlockCelebration = ({
  skin,
  isOpen,
  onClose,
  getRarityBadge,
}: SkinUnlockCelebrationProps) => {
  const audioRef = useRef<AudioContext | null>(null);

  const playUnlockSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      const ctx = audioRef.current;
      
      // Play a celebratory sequence
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
        
        oscillator.start(ctx.currentTime + startTime);
        oscillator.stop(ctx.currentTime + startTime + duration);
      };

      // Victory jingle
      playTone(523.25, 0, 0.15);     // C5
      playTone(659.25, 0.1, 0.15);   // E5
      playTone(783.99, 0.2, 0.15);   // G5
      playTone(1046.50, 0.3, 0.4);   // C6 (longer)
    } catch (e) {
      console.log("Audio not available");
    }
  }, []);

  useEffect(() => {
    if (isOpen && skin) {
      playUnlockSound();
    }
  }, [isOpen, skin, playUnlockSound]);

  if (!skin) return null;

  const colors = rarityColors[skin.rarity || "common"];
  const confettiCount = skin.rarity === "legendary" ? 60 : skin.rarity === "epic" ? 40 : 25;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-2 border-border bg-background">
        {/* Confetti Container */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(confettiCount)].map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={Math.random() * 0.5}
              color={colors[i % colors.length]}
              left={Math.random() * 100}
            />
          ))}
        </div>

        <div className="relative z-10 p-8">
          {/* Header */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <PartyPopper className="w-12 h-12 text-warning" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center mb-2"
          >
            Skin Unlocked!
          </motion.h2>

          {/* Skin Image */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex justify-center my-6"
          >
            <div className={cn(
              "relative w-40 h-40 rounded-2xl overflow-hidden border-4",
              skin.rarity === "legendary" && "border-yellow-500 shadow-yellow-500/50 shadow-xl",
              skin.rarity === "epic" && "border-purple-500 shadow-purple-500/40 shadow-lg",
              skin.rarity === "rare" && "border-blue-500 shadow-blue-500/30 shadow-md",
              skin.rarity === "common" && "border-muted-foreground/30"
            )}>
              {skin.image ? (
                <motion.img
                  src={skin.image}
                  alt={skin.name}
                  className="w-full h-full object-cover"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl bg-accent">
                  {skin.icon}
                </div>
              )}

              {/* Legendary glow effect */}
              {skin.rarity === "legendary" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 to-transparent"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Sparkles for epic+ */}
              {(skin.rarity === "epic" || skin.rarity === "legendary") && (
                <>
                  <motion.div
                    className="absolute top-2 right-2"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                  <motion.div
                    className="absolute bottom-2 left-2"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  >
                    <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>

          {/* Skin Name & Rarity */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-4"
          >
            <h3 className="text-xl font-bold mb-2">{skin.name}</h3>
            <Badge className={cn("mb-2", getRarityBadge(skin.rarity))}>
              {skin.rarity?.toUpperCase()}
            </Badge>
            <p className="text-muted-foreground text-sm">{skin.description}</p>
          </motion.div>

          {/* Close Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onClose}
              className="w-full"
              size="lg"
            >
              Awesome!
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
