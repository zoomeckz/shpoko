import type { Exercise } from "@/data/course";

/** One line saying what an exercise asked, for review lists and reports. */
export function describeExercise(e: Exercise): { kind: string; text: string } {
  switch (e.type) {
    case "intro":
      return { kind: "New letter", text: `${e.letter} ${e.lower} · “${e.sound}”` };
    case "choice":
      return { kind: "Multiple choice", text: [e.prompt, e.display].filter(Boolean).join(" · ") };
    case "match":
      return { kind: "Matching", text: `${e.prompt} · ${e.pairs.map((p) => `${p.left}=${p.right}`).join(", ")}` };
    case "build":
      return { kind: "Build", text: `${e.prompt} · ${e.target}` };
    case "shape":
      return { kind: "Letter shape", text: `${e.letter} looks like ${e.looksLike}` };
    case "tip":
      return { kind: "Tip", text: e.title };
    case "familiar":
      return { kind: "Familiar letters", text: e.title };
    case "word":
      return { kind: "Word", text: `${e.word} · “${e.reading}” = ${e.meaning}` };
    case "phrase":
      return { kind: "Phrase", text: `${e.text} = ${e.meaning}` };
    case "fill":
      return { kind: "Fill the gap", text: `${e.sentence} (${e.meaning})` };
  }
}

/** The question part only, for the learner's "worth another look" list. */
export function questionOf(e: Exercise): string {
  switch (e.type) {
    case "choice":
      return e.display ? `${e.prompt} ${e.display}` : e.prompt;
    case "build":
      return `${e.prompt}: ${e.target}`;
    case "fill":
      return `${e.sentence} (${e.meaning})`;
    case "match":
      return e.prompt;
    default:
      return describeExercise(e).text;
  }
}
