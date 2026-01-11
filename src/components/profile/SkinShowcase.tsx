import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, ChevronLeft, ChevronRight, Shirt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { SHOP_ITEMS, type ShopItem } from "@/hooks/useShopItems";
import { useNavigate } from "react-router-dom";

export const SkinShowcase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ownedSkins, setOwnedSkins] = useState<ShopItem[]>([]);
  const [equippedSkin, setEquippedSkin] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!user) return;

    const savedItems = localStorage.getItem(`shop_items_${user.id}`);
    const savedSkin = localStorage.getItem(`equipped_skin_${user.id}`);
    
    if (savedItems) {
      const itemIds = JSON.parse(savedItems) as string[];
      const skins = SHOP_ITEMS.filter(
        item => item.type === "raccoon_skin" && itemIds.includes(item.id)
      );
      setOwnedSkins(skins);
      
      // Set current index to equipped skin if exists
      if (savedSkin && skins.length > 0) {
        const equippedIndex = skins.findIndex(s => s.id === savedSkin);
        if (equippedIndex !== -1) {
          setCurrentIndex(equippedIndex);
        }
      }
    }
    
    if (savedSkin) {
      setEquippedSkin(savedSkin);
    }
  }, [user]);

  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case "rare":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "epic":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "legendary":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const nextSkin = () => {
    setCurrentIndex((prev) => (prev + 1) % ownedSkins.length);
  };

  const prevSkin = () => {
    setCurrentIndex((prev) => (prev - 1 + ownedSkins.length) % ownedSkins.length);
  };

  if (ownedSkins.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shirt className="w-5 h-5 text-primary" />
            Skin Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Shirt className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No skins collected yet</p>
          <Button onClick={() => navigate("/shop")} variant="outline" size="sm">
            Visit Shop
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentSkin = ownedSkins[currentIndex];
  const isEquipped = currentSkin?.id === equippedSkin;

  return (
    <Card className="border-2 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Skin Collection
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {ownedSkins.length} owned
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          {ownedSkins.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8"
                onClick={prevSkin}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8"
                onClick={nextSkin}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Skin Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSkin.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center py-4"
            >
              {/* Skin Image */}
              <div className={cn(
                "relative w-24 h-24 rounded-xl overflow-hidden border-2 mb-3",
                currentSkin.rarity === "legendary" && "border-yellow-500 shadow-yellow-500/30 shadow-lg",
                currentSkin.rarity === "epic" && "border-purple-500 shadow-purple-500/20 shadow-md",
                currentSkin.rarity === "rare" && "border-blue-500",
                currentSkin.rarity === "common" && "border-muted-foreground/30"
              )}>
                {currentSkin.image ? (
                  <img
                    src={currentSkin.image}
                    alt={currentSkin.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-accent">
                    {currentSkin.icon}
                  </div>
                )}

                {/* Equipped indicator */}
                {isEquipped && (
                  <div className="absolute top-1 right-1 bg-success rounded-full p-0.5">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                )}

                {/* Legendary glow */}
                {currentSkin.rarity === "legendary" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Skin Info */}
              <h4 className="font-bold text-sm">{currentSkin.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-xs", getRarityBadge(currentSkin.rarity))}>
                  {currentSkin.rarity?.toUpperCase()}
                </Badge>
                {isEquipped && (
                  <Badge variant="secondary" className="text-xs">
                    Equipped
                  </Badge>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          {ownedSkins.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2">
              {ownedSkins.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex
                      ? "bg-primary w-4"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={() => navigate("/shop")}
        >
          View All Skins
        </Button>
      </CardContent>
    </Card>
  );
};
