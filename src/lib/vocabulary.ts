import { course, type CourseLesson, type CourseUnit, type Exercise } from "@/data/course";

/** A word or phrase the course teaches. */
export interface VocabItem {
  bg: string;
  reading?: string;
  en: string;
  lessonId: string;
}

export interface Tip {
  title: string;
  text: string;
  items?: { big: string; small: string }[];
}

const cyrillic = /[Ѐ-ӿ]/;
const latinOnly = /^[a-zăâ' -]+$/i;
const stripEnd = (s: string) => s.replace(/[.,!?…:;]+$/, "");
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Words, phrases and tips in one lesson. */
function fromLesson(lesson: CourseLesson) {
  const words: VocabItem[] = [];
  const phrases: VocabItem[] = [];
  const tips: Tip[] = [];
  const add = (e: Exercise) => {
    switch (e.type) {
      case "word":
        words.push({ bg: e.word, reading: e.reading, en: e.meaning, lessonId: lesson.id });
        break;
      case "phrase":
        phrases.push({ bg: e.text, reading: e.reading, en: e.meaning, lessonId: lesson.id });
        for (const w of e.words) {
          if (cyrillic.test(w.bg) && !w.en.includes("question word")) words.push({ bg: stripEnd(w.bg), en: w.en, lessonId: lesson.id });
        }
        break;
      case "choice": {
        // "How do you read this word?" ДОМ → dom, explained as "ДОМ means home 🏠".
        const means =
          e.explain && e.display ? new RegExp(`^${escapeRegExp(e.display)}\\s+means\\s+(.+?)\\.?$`).exec(e.explain) : null;
        if (means && e.display) {
          words.push({
            bg: e.display,
            reading: latinOnly.test(e.answer) ? e.answer : undefined,
            en: means[1],
            lessonId: lesson.id,
          });
        }
        break;
      }
      case "tip":
        tips.push({ title: e.title, text: e.text, items: e.items });
        break;
    }
  };
  lesson.exercises?.forEach(add);
  return { words, phrases, tips };
}

/** Keeps the first of each word (by spelling, ignoring case), preferring ones with a reading. */
function dedupe(items: VocabItem[]) {
  const seen = new Map<string, VocabItem>();
  for (const item of items) {
    const key = item.bg.toLowerCase();
    const prev = seen.get(key);
    if (!prev || (!prev.reading && item.reading)) seen.set(key, item);
  }
  return [...seen.values()];
}

/** Everything in one unit, for its guidebook. */
export function unitGuide(unit: CourseUnit) {
  const parts = unit.lessons.map(fromLesson);
  const extraParts = (unit.extras ?? []).map(fromLesson);
  return {
    tips: parts.flatMap((p) => p.tips),
    phrases: dedupe(parts.flatMap((p) => p.phrases)),
    words: dedupe(parts.flatMap((p) => p.words)),
    extraWords: dedupe([...extraParts.flatMap((p) => p.words), ...extraParts.flatMap((p) => p.phrases)]),
  };
}

/** Words and phrases from the lessons (and extras) the learner has finished. */
export function learnedVocabulary(isDone: (lessonId: string) => boolean) {
  const lessons = course.flatMap((u) => [...u.lessons, ...(u.extras ?? [])]).filter((l) => isDone(l.id));
  const parts = lessons.map(fromLesson);
  return {
    words: dedupe(parts.flatMap((p) => p.words)),
    phrases: dedupe(parts.flatMap((p) => p.phrases)),
  };
}
