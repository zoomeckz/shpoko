import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { course } from "@/data/course";

/**
 * What the signed-in account may see, from the access rules an admin set:
 * which units are visible, and whether every lesson in them is open.
 * Normal accounts and guests see the whole course with normal progression.
 */
export const useCourseAccess = () => {
  const { access } = useAuth();

  return useMemo(() => {
    const allowed = access?.units?.length ? new Set(access.units) : null;
    const units = allowed ? course.filter((u) => allowed.has(u.id)) : course;
    const lessonIds = new Set(units.flatMap((u) => [...u.lessons, ...(u.extras ?? [])].map((l) => l.id)));
    return {
      units,
      unlockAll: !!access?.unlock_all,
      isAllowedLesson: (lessonId: string) => lessonIds.has(lessonId),
    };
  }, [access]);
};
