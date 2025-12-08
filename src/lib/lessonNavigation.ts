import { lessons } from "@/data/lessons";

export interface NextLessonInfo {
  hasNext: boolean;
  nextRoute: string | null;
  nextTitle: string | null;
}

export const getNextLesson = (currentLessonId: string): NextLessonInfo => {
  const currentIndex = lessons.findIndex(l => l.id === currentLessonId || l.route?.includes(currentLessonId));
  
  if (currentIndex === -1 || currentIndex >= lessons.length - 1) {
    return { hasNext: false, nextRoute: null, nextTitle: null };
  }

  const nextLesson = lessons[currentIndex + 1];
  
  // Skip lessons without routes (not yet implemented)
  if (!nextLesson.route) {
    // Find next lesson with a route
    for (let i = currentIndex + 2; i < lessons.length; i++) {
      if (lessons[i].route) {
        return {
          hasNext: true,
          nextRoute: lessons[i].route!,
          nextTitle: lessons[i].title,
        };
      }
    }
    return { hasNext: false, nextRoute: null, nextTitle: null };
  }

  return {
    hasNext: true,
    nextRoute: nextLesson.route,
    nextTitle: nextLesson.title,
  };
};

// Map lesson routes to their IDs
export const lessonRouteToId: Record<string, string> = {
  "cyrillic": "1",
  "greetings": "2",
  "numbers": "3",
  "type-in": "4",
  "fill-blanks": "5",
  "match-cyrillic": "9",
  "choose-word": "10",
};
