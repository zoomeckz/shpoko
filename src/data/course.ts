/**
 * The new Shpoko course. Each lesson is a list of short exercises played by
 * src/pages/CourseLesson.tsx.
 *
 * `audio` fields point at clips in /public (e.g. public/audio/letters/a.mp3).
 * Sound buttons stay hidden until SHOW_SOUND_BUTTONS is turned on in
 * src/config/features.ts, so missing clips never show up for learners.
 */

export interface ChoiceOption {
  label: string;
  audio?: string;
}

export type Exercise =
  | {
      type: "intro";
      letter: string;
      lower: string;
      sound: string;
      hint: string;
      audio?: string;
    }
  | {
      type: "choice";
      prompt: string;
      /** Big text shown above the options (a letter or a word). */
      display?: string;
      displayAudio?: string;
      /** "letters" renders options as large Cyrillic tiles. */
      optionStyle?: "letters" | "text";
      options: ChoiceOption[];
      answer: string;
      explain?: string;
    }
  | {
      type: "match";
      prompt: string;
      pairs: { left: string; right: string; audio?: string }[];
    }
  | {
      type: "build";
      prompt: string;
      /** Latin spelling / meaning shown as the thing to write. */
      target: string;
      answer: string[];
      tiles: string[];
      explain?: string;
      audio?: string;
    };

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  xp: number;
  /** null = not built yet, shown as locked on the path. */
  exercises: Exercise[] | null;
}

export interface CourseUnit {
  id: string;
  section: number;
  unit: number;
  title: string;
  lessons: CourseLesson[];
}

const letterAudio = (name: string) => `/audio/letters/${name}.mp3`;
const wordAudio = (name: string) => `/audio/words/${name}.mp3`;

const lesson1: Exercise[] = [
  { type: "intro", letter: "А", lower: "а", sound: "a", hint: "Like the “a” in father.", audio: letterAudio("a") },
  { type: "intro", letter: "О", lower: "о", sound: "o", hint: "Like the “o” in port, but short.", audio: letterAudio("o") },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "А",
    displayAudio: letterAudio("a"),
    options: [{ label: "a" }, { label: "o" }, { label: "u" }],
    answer: "a",
  },
  { type: "intro", letter: "М", lower: "м", sound: "m", hint: "Just like the English “m” in moon.", audio: letterAudio("m") },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “m”",
    optionStyle: "letters",
    options: [{ label: "О", audio: letterAudio("o") }, { label: "М", audio: letterAudio("m") }, { label: "А", audio: letterAudio("a") }],
    answer: "М",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "МАМА",
    displayAudio: wordAudio("mama"),
    options: [{ label: "mama" }, { label: "nana" }, { label: "mapa" }],
    answer: "mama",
    explain: "МАМА means mum.",
  },
  { type: "intro", letter: "Т", lower: "т", sound: "t", hint: "Like the “t” in top.", audio: letterAudio("t") },
  { type: "intro", letter: "К", lower: "к", sound: "k", hint: "Like the “k” in kite.", audio: letterAudio("k") },
  {
    type: "match",
    prompt: "Tap the matching pairs",
    pairs: [
      { left: "А", right: "a", audio: letterAudio("a") },
      { left: "О", right: "o", audio: letterAudio("o") },
      { left: "М", right: "m", audio: letterAudio("m") },
      { left: "Т", right: "t", audio: letterAudio("t") },
      { left: "К", right: "k", audio: letterAudio("k") },
    ],
  },
  { type: "intro", letter: "Е", lower: "е", sound: "e", hint: "Like the “e” in pet.", audio: letterAudio("e") },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Е",
    displayAudio: letterAudio("e"),
    options: [{ label: "o" }, { label: "e" }, { label: "a" }],
    answer: "e",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “k”",
    optionStyle: "letters",
    options: [
      { label: "Т", audio: letterAudio("t") },
      { label: "Е", audio: letterAudio("e") },
      { label: "К", audio: letterAudio("k") },
      { label: "М", audio: letterAudio("m") },
    ],
    answer: "К",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "КОТКА",
    displayAudio: wordAudio("kotka"),
    options: [{ label: "kokta" }, { label: "kotka" }, { label: "totka" }],
    answer: "kotka",
    explain: "КОТКА means cat 🐱",
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "mama (mum)",
    answer: ["М", "А", "М", "А"],
    tiles: ["А", "М", "Т", "А", "О", "М"],
    audio: wordAudio("mama"),
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ТАТКО",
    displayAudio: wordAudio("tatko"),
    options: [{ label: "takto" }, { label: "tatka" }, { label: "tatko" }],
    answer: "tatko",
    explain: "ТАТКО means dad.",
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "oko (eye)",
    answer: ["О", "К", "О"],
    tiles: ["К", "О", "Е", "Т", "О", "А"],
    audio: wordAudio("oko"),
  },
  {
    type: "match",
    prompt: "Match the words with their meaning",
    pairs: [
      { left: "МАМА", right: "mum", audio: wordAudio("mama") },
      { left: "ТАТКО", right: "dad", audio: wordAudio("tatko") },
      { left: "КОТКА", right: "cat", audio: wordAudio("kotka") },
      { left: "ОКО", right: "eye", audio: wordAudio("oko") },
    ],
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "kotka (cat)",
    answer: ["К", "О", "Т", "К", "А"],
    tiles: ["Т", "К", "А", "Е", "О", "К", "М"],
    audio: wordAudio("kotka"),
  },
];

export const course: CourseUnit[] = [
  {
    id: "unit-1",
    section: 1,
    unit: 1,
    title: "Read your first letters",
    lessons: [
      { id: "alphabet-1", title: "First letters", description: "А О Е К М Т", xp: 10, exercises: lesson1 },
      { id: "alphabet-2", title: "Look-alikes", description: "Р Н В С Х У", xp: 10, exercises: null },
      { id: "alphabet-3", title: "New shapes", description: "Б Г Д З И Л П", xp: 10, exercises: null },
      { id: "alphabet-4", title: "Tricky sounds", description: "Ж Ш Щ Ц Ч Ф", xp: 10, exercises: null },
      { id: "alphabet-5", title: "Last letters", description: "Й Ъ Ь Ю Я", xp: 10, exercises: null },
    ],
  },
];

export const findLesson = (lessonId: string) => {
  for (const unit of course) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return null;
};
