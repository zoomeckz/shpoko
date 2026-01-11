export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'alphabet' | 'grammar' | 'vocabulary' | 'challenges' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: Badge[] = [
  // Alphabet & Letters
  {
    id: "cyrillic-master",
    name: "Cyrillic Master",
    description: "Mastered the Cyrillic alphabet speed match",
    icon: "🔤",
    category: "alphabet",
    rarity: "rare",
  },
  
  // Grammar
  {
    id: "grammar-pro",
    name: "Grammar Pro",
    description: "Completed pronoun dialogue challenges",
    icon: "📝",
    category: "grammar",
    rarity: "rare",
  },
  {
    id: "verb-virtuoso",
    name: "Verb Virtuoso",
    description: "Mastered essential verb conjugations",
    icon: "⚡",
    category: "grammar",
    rarity: "epic",
  },
  
  // Numbers & Math
  {
    id: "number-ninja",
    name: "Number Ninja",
    description: "Solved math problems in Bulgarian",
    icon: "🔢",
    category: "vocabulary",
    rarity: "rare",
  },
  
  // Vocabulary
  {
    id: "color-expert",
    name: "Color Expert",
    description: "Named colors at lightning speed",
    icon: "🎨",
    category: "vocabulary",
    rarity: "common",
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Mastered navigation and directions",
    icon: "🧭",
    category: "vocabulary",
    rarity: "epic",
  },
  
  // Mastery
  {
    id: "first-deep-dive",
    name: "Deep Diver",
    description: "Completed your first deep-dive lesson",
    icon: "🤿",
    category: "mastery",
    rarity: "common",
  },
  {
    id: "deep-dive-10",
    name: "Ocean Explorer",
    description: "Completed 10 deep-dive lessons",
    icon: "🌊",
    category: "mastery",
    rarity: "rare",
  },
  {
    id: "deep-dive-25",
    name: "Abyss Conqueror",
    description: "Completed 25 deep-dive lessons",
    icon: "🏊",
    category: "mastery",
    rarity: "epic",
  },
  {
    id: "deep-dive-50",
    name: "Mariana Master",
    description: "Completed 50 deep-dive lessons",
    icon: "👑",
    category: "mastery",
    rarity: "legendary",
  },
  {
    id: "challenge-streak-3",
    name: "Challenge Streak",
    description: "Completed 3 challenge deep-dives in a row",
    icon: "🔥",
    category: "challenges",
    rarity: "rare",
  },
  {
    id: "mastery-collector",
    name: "Mastery Collector",
    description: "Earned 5 mastery-type deep-dives",
    icon: "🏆",
    category: "mastery",
    rarity: "epic",
  },
  {
    id: "practice-perfect",
    name: "Practice Perfect",
    description: "Completed 10 practice deep-dives",
    icon: "✨",
    category: "mastery",
    rarity: "rare",
  },
];

export const getBadgeById = (id: string): Badge | undefined => {
  return BADGES.find(b => b.id === id);
};

export const getBadgesByCategory = (category: Badge['category']): Badge[] => {
  return BADGES.filter(b => b.category === category);
};

export const getRarityColor = (rarity: Badge['rarity']): string => {
  switch (rarity) {
    case 'common': return 'from-slate-400 to-slate-500';
    case 'rare': return 'from-blue-400 to-blue-600';
    case 'epic': return 'from-purple-400 to-purple-600';
    case 'legendary': return 'from-yellow-400 to-orange-500';
  }
};

export const getRarityBorder = (rarity: Badge['rarity']): string => {
  switch (rarity) {
    case 'common': return 'border-slate-400';
    case 'rare': return 'border-blue-500';
    case 'epic': return 'border-purple-500';
    case 'legendary': return 'border-yellow-500';
  }
};
