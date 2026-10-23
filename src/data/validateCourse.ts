import { course, type CourseLesson } from "./course";

/**
 * Checks every lesson and extra for mistakes that would make an exercise
 * impossible or confusing. Runs on every build (see vite.config.ts), so a
 * broken lesson can never be published. Returns one line per problem.
 */
export function validateCourse(): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();

  const check = (lesson: CourseLesson) => {
    if (ids.has(lesson.id)) problems.push(`Lesson id "${lesson.id}" is used twice`);
    ids.add(lesson.id);

    (lesson.exercises ?? []).forEach((e, i) => {
      const at = `${lesson.id} #${i + 1} (${e.type})`;
      const dup = (list: string[]) => new Set(list).size !== list.length;
      switch (e.type) {
        case "choice": {
          const labels = e.options.map((o) => o.label);
          if (!labels.includes(e.answer)) problems.push(`${at}: the answer "${e.answer}" isn't one of the options`);
          if (dup(labels)) problems.push(`${at}: two options are the same`);
          break;
        }
        case "fill":
          if (!e.options.includes(e.answer)) problems.push(`${at}: the answer "${e.answer}" isn't one of the options`);
          if (dup(e.options)) problems.push(`${at}: two options are the same`);
          if (e.sentence.split("___").length !== 2) problems.push(`${at}: the sentence needs exactly one ___ gap`);
          break;
        case "build": {
          const pool = [...e.tiles];
          for (const piece of e.answer) {
            const k = pool.indexOf(piece);
            if (k < 0) problems.push(`${at}: the answer needs a "${piece}" tile that isn't there`);
            else pool.splice(k, 1);
          }
          break;
        }
        case "match":
          if (dup(e.pairs.map((p) => p.left)) || dup(e.pairs.map((p) => p.right))) problems.push(`${at}: two pairs look the same`);
          break;
        case "phrase":
          if (e.words.map((w) => w.bg).join(" ") !== e.text) problems.push(`${at}: the word-by-word list doesn't match the sentence`);
          break;
      }
    });
  };

  for (const unit of course) {
    unit.lessons.forEach(check);
    unit.extras?.forEach(check);
    if (unit.extras && unit.extras.length !== unit.lessons.length) {
      problems.push(`${unit.id}: has ${unit.lessons.length} lessons but ${unit.extras.length} extras`);
    }
  }
  return problems;
}
