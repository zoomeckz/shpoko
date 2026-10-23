/**
 * Which Bulgarian the course can say out loud. scripts/generate-audio.mjs makes
 * one clip for every text listed here.
 */
import { course, type Exercise } from "@/data/course";
import { isBulgarian, speechId, spokenText } from "@/lib/speech";

/** A fill-the-gap sentence with the right word in the gap. */
export const filledSentence = (e: Extract<Exercise, { type: "fill" }>) => e.sentence.replace("___", e.answer);

/** What is said after an answer is checked: the Bulgarian the question was about. */
export function answerSpeech(e: Exercise): string | undefined {
  switch (e.type) {
    case "choice":
      if (isBulgarian(e.display)) return e.display;
      return isBulgarian(e.answer) ? e.answer : undefined;
    case "fill":
      return filledSentence(e);
    case "build": {
      const text = e.answer.join(e.words ? " " : "");
      return isBulgarian(text) ? text : undefined;
    }
    default:
      return undefined;
  }
}

/** Every piece of Bulgarian in one exercise that may be played. */
function textsOf(e: Exercise): (string | undefined)[] {
  switch (e.type) {
    case "tip":
      return (e.items ?? []).map((i) => i.big);
    case "word":
      return [e.word];
    case "phrase":
      // Words on their own as well, for My words and the guidebook ("си?" → "си").
      return [e.text, ...e.words.flatMap((w) => [w.bg, w.bg.replace(/[.,!?…:;]+$/, "")])];
    case "intro":
      return [e.letter];
    case "familiar":
      return e.letters.map((l) => l.upper);
    case "choice":
      return [e.display, ...e.options.map((o) => o.label)];
    case "match":
      return e.pairs.flatMap((p) => [p.left, p.right]);
    case "fill":
      return [filledSentence(e)];
    default:
      return [answerSpeech(e)];
  }
}

/** One entry per clip: its id, a readable label and what the voice should say. */
export function courseSpeechTexts() {
  const clips = new Map<string, { id: string; text: string; say: string }>();
  for (const unit of course) {
    for (const lesson of [...unit.lessons, ...(unit.extras ?? [])]) {
      for (const e of lesson.exercises ?? []) {
        for (const text of textsOf(e)) {
          if (!isBulgarian(text)) continue;
          const id = speechId(text);
          if (!clips.has(id)) clips.set(id, { id, text, say: spokenText(text) });
        }
      }
    }
  }
  return [...clips.values()];
}
