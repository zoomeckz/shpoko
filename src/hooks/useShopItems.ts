import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: "xp_booster" | "badge" | "raccoon_skin" | "streak_freeze";
  cost: number;
  icon: string;
  duration_hours?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
  effect?: string;
}

export interface UserItem {
  id: string;
  item_id: string;
  purchased_at: string;
  expires_at?: string;
  is_active: boolean;
  equipped: boolean;
}

// Static shop items (in a real app, these would come from DB)
export const SHOP_ITEMS: ShopItem[] = [
  // XP Boosters
  {
    id: "xp_boost_1h",
    name: "XP Surge (1hr)",
    description: "2x XP for 1 hour!",
    type: "xp_booster",
    cost: 150,
    icon: "⚡",
    duration_hours: 1,
    rarity: "common",
    effect: "2x_xp",
  },
  {
    id: "xp_boost_3h",
    name: "XP Storm (3hr)",
    description: "2x XP for 3 hours!",
    type: "xp_booster",
    cost: 400,
    icon: "🌩️",
    duration_hours: 3,
    rarity: "rare",
    effect: "2x_xp",
  },
  {
    id: "xp_boost_24h",
    name: "XP Tsunami (24hr)",
    description: "1.5x XP for a full day!",
    type: "xp_booster",
    cost: 1000,
    icon: "🌊",
    duration_hours: 24,
    rarity: "epic",
    effect: "1.5x_xp",
  },
  // Profile Badges
  {
    id: "badge_early_bird",
    name: "Early Bird",
    description: "Show you're an early adopter!",
    type: "badge",
    cost: 200,
    icon: "🐦",
    rarity: "common",
  },
  {
    id: "badge_night_owl",
    name: "Night Owl",
    description: "For the midnight learners!",
    type: "badge",
    cost: 200,
    icon: "🦉",
    rarity: "common",
  },
  {
    id: "badge_champion",
    name: "Champion",
    description: "A legendary badge of honor!",
    type: "badge",
    cost: 500,
    icon: "🏆",
    rarity: "rare",
  },
  {
    id: "badge_fire_master",
    name: "Fire Master",
    description: "You're on fire! 🔥",
    type: "badge",
    cost: 750,
    icon: "🔥",
    rarity: "epic",
  },
  {
    id: "badge_diamond",
    name: "Diamond Learner",
    description: "The rarest of them all!",
    type: "badge",
    cost: 2000,
    icon: "💎",
    rarity: "legendary",
  },
  // Raccoon Skins - All use raccoon emoji 🦝
  {
    id: "skin_bandit",
    name: "Bandit Shpoko",
    description: "Classic raccoon with extra fluffy striped tail!",
    type: "raccoon_skin",
    cost: 100,
    icon: "🦝",
    rarity: "common",
  },
  {
    id: "skin_sleepy",
    name: "Sleepy Shpoko",
    description: "A cozy raccoon ready for naptime learning!",
    type: "raccoon_skin",
    cost: 150,
    icon: "🦝",
    rarity: "common",
  },
  {
    id: "skin_baby",
    name: "Baby Shpoko",
    description: "An adorable baby raccoon taking first steps!",
    type: "raccoon_skin",
    cost: 200,
    icon: "🦝",
    rarity: "common",
  },
  {
    id: "skin_chubby",
    name: "Chubby Shpoko",
    description: "A well-fed, extra huggable raccoon!",
    type: "raccoon_skin",
    cost: 250,
    icon: "🦝",
    rarity: "rare",
  },
  {
    id: "skin_curious",
    name: "Curious Shpoko",
    description: "Wide-eyed raccoon discovering new words!",
    type: "raccoon_skin",
    cost: 300,
    icon: "🦝",
    rarity: "rare",
  },
  {
    id: "skin_mischief",
    name: "Mischief Shpoko",
    description: "A playful raccoon with a sneaky grin!",
    type: "raccoon_skin",
    cost: 400,
    icon: "🦝",
    rarity: "rare",
  },
  {
    id: "skin_scholarly",
    name: "Scholar Shpoko",
    description: "A wise raccoon with tiny glasses!",
    type: "raccoon_skin",
    cost: 500,
    icon: "🦝",
    rarity: "epic",
  },
  {
    id: "skin_warrior",
    name: "Warrior Shpoko",
    description: "A brave raccoon ready for language battles!",
    type: "raccoon_skin",
    cost: 600,
    icon: "🦝",
    rarity: "epic",
  },
  {
    id: "skin_royal",
    name: "Royal Shpoko",
    description: "A majestic raccoon wearing a tiny crown!",
    type: "raccoon_skin",
    cost: 800,
    icon: "🦝",
    rarity: "epic",
  },
  {
    id: "skin_mystic",
    name: "Mystic Shpoko",
    description: "An enchanted raccoon with magical powers!",
    type: "raccoon_skin",
    cost: 1200,
    icon: "🦝",
    rarity: "legendary",
  },
  {
    id: "skin_golden",
    name: "Golden Shpoko",
    description: "A shimmering golden raccoon of legend!",
    type: "raccoon_skin",
    cost: 2000,
    icon: "🦝",
    rarity: "legendary",
  },
];

export const useShopItems = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [activeBooster, setActiveBooster] = useState<{
    type: string;
    expiresAt: Date;
    multiplier: number;
  } | null>(null);
  const [equippedSkin, setEquippedSkin] = useState<string | null>(null);
  const [equippedBadges, setEquippedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load owned items from localStorage (in production, this would be from DB)
  useEffect(() => {
    if (!user) return;
    
    const savedItems = localStorage.getItem(`shop_items_${user.id}`);
    if (savedItems) {
      setOwnedItems(JSON.parse(savedItems));
    }

    const savedSkin = localStorage.getItem(`equipped_skin_${user.id}`);
    if (savedSkin) {
      setEquippedSkin(savedSkin);
    }

    const savedBadges = localStorage.getItem(`equipped_badges_${user.id}`);
    if (savedBadges) {
      setEquippedBadges(JSON.parse(savedBadges));
    }

    // Check for active booster
    const savedBooster = localStorage.getItem(`active_booster_${user.id}`);
    if (savedBooster) {
      const booster = JSON.parse(savedBooster);
      if (new Date(booster.expiresAt) > new Date()) {
        setActiveBooster({
          ...booster,
          expiresAt: new Date(booster.expiresAt),
        });
      } else {
        localStorage.removeItem(`active_booster_${user.id}`);
      }
    }
  }, [user]);

  const purchaseItem = async (itemId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !profile) {
      return { success: false, error: "Not authenticated" };
    }

    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, error: "Item not found" };
    }

    // Check if already owned (for non-consumables)
    if (item.type !== "xp_booster" && ownedItems.includes(itemId)) {
      return { success: false, error: "You already own this item!" };
    }

    if (profile.xp < item.cost) {
      return { success: false, error: `Need ${item.cost - profile.xp} more XP` };
    }

    setLoading(true);
    try {
      // Deduct XP
      const { error: xpError } = await supabase
        .from("profiles")
        .update({ xp: profile.xp - item.cost })
        .eq("id", user.id);

      if (xpError) throw xpError;

      // Handle different item types
      if (item.type === "xp_booster") {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (item.duration_hours || 1));
        const multiplier = item.effect === "2x_xp" ? 2 : 1.5;

        const boosterData = { type: item.id, expiresAt: expiresAt.toISOString(), multiplier };
        localStorage.setItem(`active_booster_${user.id}`, JSON.stringify(boosterData));
        setActiveBooster({ ...boosterData, expiresAt });
      } else {
        // Add to owned items
        const newOwnedItems = [...ownedItems, itemId];
        setOwnedItems(newOwnedItems);
        localStorage.setItem(`shop_items_${user.id}`, JSON.stringify(newOwnedItems));
      }

      await refreshProfile();
      return { success: true };
    } catch (error) {
      console.error("Error purchasing item:", error);
      return { success: false, error: "Purchase failed" };
    } finally {
      setLoading(false);
    }
  };

  const equipSkin = (skinId: string) => {
    if (!user || !ownedItems.includes(skinId)) return;
    setEquippedSkin(skinId);
    localStorage.setItem(`equipped_skin_${user.id}`, skinId);
  };

  const toggleBadge = (badgeId: string) => {
    if (!user || !ownedItems.includes(badgeId)) return;

    let newBadges: string[];
    if (equippedBadges.includes(badgeId)) {
      newBadges = equippedBadges.filter((b) => b !== badgeId);
    } else {
      // Max 3 badges
      if (equippedBadges.length >= 3) {
        newBadges = [...equippedBadges.slice(1), badgeId];
      } else {
        newBadges = [...equippedBadges, badgeId];
      }
    }

    setEquippedBadges(newBadges);
    localStorage.setItem(`equipped_badges_${user.id}`, JSON.stringify(newBadges));
  };

  const getXPMultiplier = (): number => {
    if (!activeBooster) return 1;
    if (new Date() > activeBooster.expiresAt) {
      setActiveBooster(null);
      if (user) {
        localStorage.removeItem(`active_booster_${user.id}`);
      }
      return 1;
    }
    return activeBooster.multiplier;
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "common":
        return "border-muted-foreground/30";
      case "rare":
        return "border-blue-500";
      case "epic":
        return "border-purple-500";
      case "legendary":
        return "border-yellow-500 shadow-yellow-500/20 shadow-lg";
      default:
        return "border-border";
    }
  };

  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case "rare":
        return "bg-blue-500/20 text-blue-400";
      case "epic":
        return "bg-purple-500/20 text-purple-400";
      case "legendary":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return {
    shopItems: SHOP_ITEMS,
    ownedItems,
    activeBooster,
    equippedSkin,
    equippedBadges,
    loading,
    purchaseItem,
    equipSkin,
    toggleBadge,
    getXPMultiplier,
    getRarityColor,
    getRarityBadge,
  };
};
