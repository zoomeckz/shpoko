import { lessons } from "@/data/lessons";

export interface LessonNavInfo {
  hasNext: boolean;
  hasPrev: boolean;
  nextRoute: string | null;
  nextTitle: string | null;
  prevRoute: string | null;
  prevTitle: string | null;
}

// Map lesson routes to their IDs
export const lessonRouteToId: Record<string, string> = {
  "cyrillic": "cyrillic-alphabet",
  "greetings": "basic-greetings",
  "numbers": "numbers-1-20",
  "type-in": "type-in-basics",
  "fill-blanks": "fill-blanks-basics",
  "match-cyrillic": "match-cyrillic-premium",
  "choose-word": "choose-word-premium",
  "pronouns": "pronouns-topic",
  "essential-verbs": "essential-verbs-topic",
  "survival-phrases": "survival-phrases-topic",
  "food-drinks-starter": "food-drinks-starter-topic",
};

const findLessonIndex = (lessonId: string): number => {
  return lessons.findIndex(l => 
    l.id === lessonId || 
    l.route?.includes(lessonId) ||
    Object.entries(lessonRouteToId).find(([key, val]) => val === lessonId)?.[0] === lessonId
  );
};

const findNextLessonWithRoute = (startIndex: number): { route: string; title: string } | null => {
  for (let i = startIndex; i < lessons.length; i++) {
    if (lessons[i].route) {
      return { route: lessons[i].route!, title: lessons[i].title };
    }
  }
  return null;
};

const findPrevLessonWithRoute = (startIndex: number): { route: string; title: string } | null => {
  for (let i = startIndex; i >= 0; i--) {
    if (lessons[i].route) {
      return { route: lessons[i].route!, title: lessons[i].title };
    }
  }
  return null;
};

export const getNextLesson = (currentLessonId: string): { hasNext: boolean; nextRoute: string | null; nextTitle: string | null } => {
  const currentIndex = findLessonIndex(currentLessonId);
  
  if (currentIndex === -1 || currentIndex >= lessons.length - 1) {
    return { hasNext: false, nextRoute: null, nextTitle: null };
  }

  const next = findNextLessonWithRoute(currentIndex + 1);
  if (next) {
    return { hasNext: true, nextRoute: next.route, nextTitle: next.title };
  }
  
  return { hasNext: false, nextRoute: null, nextTitle: null };
};

export const getPrevLesson = (currentLessonId: string): { hasPrev: boolean; prevRoute: string | null; prevTitle: string | null } => {
  const currentIndex = findLessonIndex(currentLessonId);
  
  if (currentIndex <= 0) {
    return { hasPrev: false, prevRoute: null, prevTitle: null };
  }

  const prev = findPrevLessonWithRoute(currentIndex - 1);
  if (prev) {
    return { hasPrev: true, prevRoute: prev.route, prevTitle: prev.title };
  }
  
  return { hasPrev: false, prevRoute: null, prevTitle: null };
};

export const getLessonNavigation = (currentLessonId: string): LessonNavInfo => {
  const next = getNextLesson(currentLessonId);
  const prev = getPrevLesson(currentLessonId);
  
  return {
    hasNext: next.hasNext,
    hasPrev: prev.hasPrev,
    nextRoute: next.nextRoute,
    nextTitle: next.nextTitle,
    prevRoute: prev.prevRoute,
    prevTitle: prev.prevTitle,
  };
};
