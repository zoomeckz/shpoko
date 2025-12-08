export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: number;
  xpReward: number;
  progress: number;
  status: "locked" | "available" | "completed";
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  isPremium?: boolean;
  route?: string;
}

export const lessons: Lesson[] = [
  {
    id: "1",
    title: "Cyrillic Alphabet",
    description: "Learn the Bulgarian Cyrillic alphabet and basic pronunciation",
    level: 1,
    xpReward: 50,
    progress: 0,
    status: "available",
    difficulty: "beginner",
    category: "Basics",
    route: "/lesson/cyrillic",
  },
  {
    id: "2", 
    title: "Basic Greetings",
    description: "Master essential greetings and polite expressions",
    level: 2,
    xpReward: 75,
    progress: 0,
    status: "available",
    difficulty: "beginner",
    category: "Basics",
    route: "/lesson/greetings",
  },
  {
    id: "3",
    title: "Numbers 1-20",
    description: "Count from one to twenty in Bulgarian",
    level: 3,
    xpReward: 60,
    progress: 0,
    status: "available",
    difficulty: "beginner",
    category: "Numbers",
    route: "/lesson/numbers",
  },
  {
    id: "4",
    title: "Type & Learn",
    description: "Practice typing Bulgarian transliterations",
    level: 4,
    xpReward: 80,
    progress: 0,
    status: "available",
    difficulty: "beginner",
    category: "Practice",
    route: "/lesson/type-in",
  },
  {
    id: "5",
    title: "Fill the Blanks",
    description: "Complete sentences with the correct word",
    level: 5,
    xpReward: 70,
    progress: 0,
    status: "available",
    difficulty: "beginner",
    category: "Practice",
    route: "/lesson/fill-blanks",
  },
  {
    id: "6",
    title: "Match Cyrillic",
    description: "Match Cyrillic letters with their Latin equivalents",
    level: 6,
    xpReward: 90,
    progress: 0,
    status: "available",
    difficulty: "intermediate",
    category: "Premium",
    isPremium: true,
    route: "/lesson/match-cyrillic",
  },
  {
    id: "7",
    title: "Vocabulary Quiz",
    description: "Choose the correct translation for Bulgarian words",
    level: 7,
    xpReward: 100,
    progress: 0,
    status: "available",
    difficulty: "intermediate",
    category: "Premium",
    isPremium: true,
    route: "/lesson/choose-word",
  },
];

export const getUserStats = () => ({
  streak: 0,
  hearts: 5,
  xp: 0,
  dailyGoalProgress: 0,
  completedLessons: 0,
  totalLessons: lessons.length,
});
