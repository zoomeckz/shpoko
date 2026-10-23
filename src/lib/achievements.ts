import { supabase } from "@/integrations/supabase/client";
import { course } from "@/data/course";
import { daysAgo, localDateKey } from "@/lib/dates";

/** Everything the achievements are worked out from. */
export interface AchievementStats {
  longestStreak: number;
  xp: number;
  lessons: number;
  perfectLessons: number;
  units: number;
  fruitBest: number;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  /** What reaching `goal` means, e.g. "Reach a 7 day streak". */
  describe: (goal: number) => string;
  /** Goal for each level. One goal = a one-off badge. */
  tiers: number[];
  /** Current value; one-off "moment" badges have none and are only awarded when they happen. */
  stat?: (s: AchievementStats) => number;
  color: "orange" | "yellow" | "blue" | "green" | "pink" | "purple";
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "wildfire",
    icon: "🔥",
    title: "Wildfire",
    describe: (n) => `Reach a ${n} day streak`,
    tiers: [3, 7, 14, 30, 100],
    stat: (s) => s.longestStreak,
    color: "orange",
  },
  {
    id: "sage",
    icon: "⚡",
    title: "Sage",
    describe: (n) => `Earn ${n} XP`,
    tiers: [50, 150, 400, 1000, 2500],
    stat: (s) => s.xp,
    color: "yellow",
  },
  {
    id: "scholar",
    icon: "📚",
    title: "Scholar",
    describe: (n) => `Finish ${plural(n, "lesson")}`,
    tiers: [1, 5, 10, 20, 40],
    stat: (s) => s.lessons,
    color: "blue",
  },
  {
    id: "sharpshooter",
    icon: "🎯",
    title: "Sharpshooter",
    describe: (n) => `Finish ${plural(n, "lesson")} without a single mistake`,
    tiers: [1, 3, 10, 25],
    stat: (s) => s.perfectLessons,
    color: "green",
  },
  {
    id: "champion",
    icon: "🏆",
    title: "Champion",
    describe: (n) => `Pass ${plural(n, "unit test")}`,
    tiers: course.map((_, i) => i + 1),
    stat: (s) => s.units,
    color: "purple",
  },
  {
    id: "slicer",
    icon: "🍉",
    title: "Fruit Ninja",
    describe: (n) => `Score ${n} in Fruit Slicer`,
    tiers: [20, 50, 100, 200],
    stat: (s) => s.fruitBest,
    color: "pink",
  },
  {
    id: "early-bird",
    icon: "🐦",
    title: "Early Bird",
    describe: () => "Finish a lesson before 8 in the morning",
    tiers: [1],
    color: "yellow",
  },
  {
    id: "night-owl",
    icon: "🦉",
    title: "Night Owl",
    describe: () => "Finish a lesson after 10 at night",
    tiers: [1],
    color: "blue",
  },
];

/** How many levels of `a` the stats reach (0 = none yet). */
export const levelFor = (a: Achievement, stats: AchievementStats) => {
  if (!a.stat) return 0;
  const value = a.stat(stats);
  return a.tiers.filter((goal) => value >= goal).length;
};

const badgeId = (a: Achievement, level: number) => `${a.id}-${level}`;

/** Highest level of each achievement already saved for the user. */
export const savedLevels = (badgeIds: string[]) => {
  const levels: Record<string, number> = {};
  for (const id of badgeIds) {
    const match = /^(.+)-(\d+)$/.exec(id);
    if (!match) continue;
    levels[match[1]] = Math.max(levels[match[1]] ?? 0, Number(match[2]));
  }
  return levels;
};

const FRUIT_BEST_KEY = "shpoko-fruit-slicer-best";
const readFruitBest = () => {
  try {
    return Number(localStorage.getItem(FRUIT_BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

/** A streak only counts while the last lesson was today or yesterday. */
export const currentStreak = (streak: number, lastActivity: string | null) =>
  lastActivity === localDateKey() || lastActivity === localDateKey(daysAgo(1)) ? streak : 0;

export interface AchievementState {
  stats: AchievementStats;
  /** Highest level reached per achievement id. */
  levels: Record<string, number>;
  /** Levels earned just now, for an "Achievement unlocked" message. */
  newlyEarned: { achievement: Achievement; level: number }[];
}

/**
 * Works out the user's achievements, saves any new levels and returns them.
 * `moments` are one-off badges that just happened, like finishing a lesson at night.
 * Saving is best effort: if it fails the achievements still show.
 */
export async function syncAchievements(userId: string, moments: string[] = []): Promise<AchievementState> {
  const [{ data: profile }, { data: progress }, { data: badges }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_progress").select("lesson_id, completed, score").eq("user_id", userId),
    supabase.from("user_badges").select("badge_id").eq("user_id", userId),
  ]);

  const done = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
  const courseLessonIds = new Set(course.flatMap((u) => u.lessons.map((l) => l.id)));
  const stats: AchievementStats = {
    longestStreak: Math.max(profile?.longest_streak ?? 0, profile?.streak ?? 0),
    xp: profile?.xp ?? 0,
    lessons: [...done].filter((id) => courseLessonIds.has(id)).length,
    perfectLessons: (progress ?? []).filter((p) => p.completed && p.score === 100 && courseLessonIds.has(p.lesson_id)).length,
    units: course.filter((u) => u.lessons.every((l) => done.has(l.id))).length,
    fruitBest: readFruitBest(),
  };

  const saved = savedLevels((badges ?? []).map((b) => b.badge_id));
  const levels: Record<string, number> = {};
  const newlyEarned: AchievementState["newlyEarned"] = [];
  const toSave: string[] = [];

  for (const a of ACHIEVEMENTS) {
    const reached = Math.max(levelFor(a, stats), moments.includes(a.id) ? 1 : 0);
    const before = saved[a.id] ?? 0;
    levels[a.id] = Math.max(before, reached);
    for (let level = before + 1; level <= reached; level++) {
      toSave.push(badgeId(a, level));
      newlyEarned.push({ achievement: a, level });
    }
  }

  if (toSave.length) {
    await supabase
      .from("user_badges")
      .upsert(
        toSave.map((badge_id) => ({ user_id: userId, badge_id, source: "course" })),
        { onConflict: "user_id,badge_id", ignoreDuplicates: true }
      )
      .then(
        () => {},
        () => {}
      );
  }

  return { stats, levels, newlyEarned };
}

/** One-off badges earned by finishing a lesson right now. */
export const lessonMoments = (now = new Date()) => {
  const hour = now.getHours();
  return [...(hour < 8 && hour >= 4 ? ["early-bird"] : []), ...(hour >= 22 || hour < 4 ? ["night-owl"] : [])];
};
