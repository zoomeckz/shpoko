import { supabase } from "@/integrations/supabase/client";
import { findLesson, TEACHING_TYPES, type CourseLesson, type Exercise } from "@/data/course";

/** One exercise the learner got wrong, by lesson and position in it. */
export interface Mistake {
  lessonId: string;
  index: number;
  misses: number;
  lastMissedAt: string;
}

// Guests keep their mistakes in this browser; accounts keep them in the database.
const GUEST_KEY = "shpoko-mistakes";
const key = (lessonId: string, index: number) => `${lessonId}#${index}`;

const readGuest = (): Record<string, Mistake> => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "{}");
  } catch {
    return {};
  }
};
const writeGuest = (all: Record<string, Mistake>) => {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(all));
  } catch {
    // Mistakes just won't be remembered in this browser.
  }
};

/** Counts a wrong answer. Never throws: a failed save mustn't stop the lesson. */
export async function recordMistake(userId: string | null, lessonId: string, index: number) {
  if (userId) {
    await supabase.rpc("record_mistake", { _lesson_id: lessonId, _exercise_index: index }).then(
      () => {},
      () => {}
    );
    return;
  }
  const all = readGuest();
  const k = key(lessonId, index);
  all[k] = { lessonId, index, misses: (all[k]?.misses ?? 0) + 1, lastMissedAt: new Date().toISOString() };
  writeGuest(all);
}

/** Forgets a mistake once it's been answered correctly in practice. */
export async function clearMistake(userId: string | null, lessonId: string, index: number) {
  if (userId) {
    await supabase
      .from("user_mistakes")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .eq("exercise_index", index)
      .then(
        () => {},
        () => {}
      );
    return;
  }
  const all = readGuest();
  delete all[key(lessonId, index)];
  writeGuest(all);
}

/** The exercise a mistake points at, if it still exists and is a graded one. */
export function exerciseFor(m: Pick<Mistake, "lessonId" | "index">): Exercise | null {
  const exercise = findLesson(m.lessonId)?.lesson.exercises?.[m.index];
  return exercise && !TEACHING_TYPES.includes(exercise.type) ? exercise : null;
}

/** All the learner's mistakes that still point at a real exercise, most-missed first. */
export async function loadMistakes(userId: string | null): Promise<Mistake[]> {
  let list: Mistake[];
  if (userId) {
    const { data } = await supabase
      .from("user_mistakes")
      .select("lesson_id, exercise_index, misses, last_missed_at")
      .eq("user_id", userId);
    list = (data ?? []).map((r) => ({
      lessonId: r.lesson_id,
      index: r.exercise_index,
      misses: r.misses,
      lastMissedAt: r.last_missed_at,
    }));
  } else {
    list = Object.values(readGuest());
  }
  return list
    .filter((m) => exerciseFor(m))
    .sort((a, b) => b.misses - a.misses || b.lastMissedAt.localeCompare(a.lastMissedAt));
}

export const PRACTICE_SIZE = 10;

/** A short lesson made of the learner's mistakes, plus where each exercise came from. */
export function buildPractice(mistakes: Mistake[]): { lesson: CourseLesson; sources: Mistake[] } {
  const sources = mistakes.slice(0, PRACTICE_SIZE);
  return {
    lesson: {
      id: "practice",
      title: "Practise your mistakes",
      description: "Your tricky ones",
      xp: 5,
      exercises: sources.map((m) => exerciseFor(m)!),
    },
    sources,
  };
}
