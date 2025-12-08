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
}

export const lessons: Lesson[] = [
  {
    id: "1",
    title: "Cyrillic Alphabet",
    description: "Learn the Bulgarian Cyrillic alphabet and basic pronunciation",
    level: 1,
    xpReward: 50,
    progress: 100,
    status: "completed",
    difficulty: "beginner",
    category: "Basics"
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
    category: "Basics"
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
    category: "Numbers"
  },
  {
    id: "4",
    title: "Family Members",
    description: "Learn words for family relationships",
    level: 4,
    xpReward: 80,
    progress: 0,
    status: "locked",
    difficulty: "beginner",
    category: "Family"
  },
  {
    id: "5",
    title: "Colors & Shapes",
    description: "Describe the world around you with colors and shapes",
    level: 5,
    xpReward: 70,
    progress: 0,
    status: "locked",
    difficulty: "beginner",
    category: "Descriptive"
  },
  {
    id: "6",
    title: "Food & Drinks",
    description: "Order food and drinks like a local",
    level: 6,
    xpReward: 90,
    progress: 0,
    status: "locked",
    difficulty: "intermediate",
    category: "Daily Life"
  },
  {
    id: "7",
    title: "Past Tense Verbs",
    description: "Talk about things that happened in the past",
    level: 7,
    xpReward: 100,
    progress: 0,
    status: "locked",
    difficulty: "intermediate",
    category: "Grammar"
  },
  {
    id: "8",
    title: "Directions & Places",
    description: "Navigate Bulgarian cities and find your way around",
    level: 8,
    xpReward: 95,
    progress: 0,
    status: "locked",
    difficulty: "intermediate",
    category: "Travel"
  },
  {
    id: "9",
    title: "Advanced Grammar",
    description: "Master complex grammatical structures",
    level: 9,
    xpReward: 120,
    progress: 0,
    status: "locked",
    difficulty: "advanced",
    category: "Grammar"
  }
];

export const getUserStats = () => ({
  streak: 7,
  hearts: 5,
  xp: 1250,
  dailyGoalProgress: 65,
  completedLessons: lessons.filter(l => l.status === "completed").length,
  totalLessons: lessons.length
});