/**
 * The new Shpoko course. Each lesson is a list of short exercises played by
 * src/pages/CourseLesson.tsx.
 *
 * `audio` fields point at clips in /public (e.g. public/audio/letters/r.mp3).
 * Sound buttons stay hidden until SHOW_SOUND_BUTTONS is turned on in
 * src/config/features.ts, so missing clips never show up for learners.
 */

export interface ChoiceOption {
  label: string;
  audio?: string;
}

export interface FamiliarLetter {
  upper: string;
  lower: string;
  sound: string;
  /** Extra writing rule, shown highlighted. */
  note?: string;
  audio?: string;
}

export type Exercise =
  | {
      /** A short overview of letters that are written just like English ones. */
      type: "familiar";
      title: string;
      note: string;
      letters: FamiliarLetter[];
    }
  | {
      type: "intro";
      letter: string;
      lower: string;
      sound: string;
      hint: string;
      /** The English letter this one is easily mistaken for. */
      looksLike?: string;
      audio?: string;
    }
  | {
      type: "choice";
      prompt: string;
      /** Big text shown above the options (a letter or a word). */
      display?: string;
      displayAudio?: string;
      /** "letters" renders options as large tiles. */
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

// Lesson 1: a quick look at the letters learners already know, then the
// "false friends" that look English but sound different.
const lesson1: Exercise[] = [
  {
    type: "familiar",
    title: "Letters you already know",
    note: "These are written just like in English. A few sound a little different, but you write them the same way.",
    letters: [
      { upper: "А", lower: "а", sound: "a, as in father", audio: letterAudio("a") },
      { upper: "Е", lower: "е", sound: "e, as in pet (never “ee”)", audio: letterAudio("e") },
      { upper: "К", lower: "к", sound: "k, as in kite", audio: letterAudio("k") },
      { upper: "О", lower: "о", sound: "o, as in sort, but short", audio: letterAudio("o") },
      {
        upper: "М",
        lower: "м",
        sound: "m, as in moon",
        note: "Small м is just a little М. It's never written m.",
        audio: letterAudio("m"),
      },
      { upper: "Т", lower: "т", sound: "t, as in top", note: "Small т is a little Т too.", audio: letterAudio("t") },
    ],
  },
  {
    type: "choice",
    prompt: "Which one is a small М?",
    optionStyle: "letters",
    options: [{ label: "m" }, { label: "м" }, { label: "n" }],
    answer: "м",
    explain: "Small м is a little М, never m.",
  },
  {
    type: "intro",
    letter: "Р",
    lower: "р",
    sound: "r",
    looksLike: "P",
    hint: "A rolled “r”, like in Spanish or Italian.",
    audio: letterAudio("r"),
  },
  {
    type: "intro",
    letter: "С",
    lower: "с",
    sound: "s",
    looksLike: "C",
    hint: "Always “s” as in sun. Never a “k” sound.",
    audio: letterAudio("s"),
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Р",
    displayAudio: letterAudio("r"),
    options: [{ label: "p" }, { label: "r" }, { label: "b" }],
    answer: "r",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "С",
    displayAudio: letterAudio("s"),
    options: [{ label: "k" }, { label: "ch" }, { label: "s" }],
    answer: "s",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "РАК",
    displayAudio: wordAudio("rak"),
    options: [{ label: "pak" }, { label: "rak" }, { label: "rac" }],
    answer: "rak",
    explain: "РАК means crab 🦀",
  },
  {
    type: "intro",
    letter: "Н",
    lower: "н",
    sound: "n",
    looksLike: "H",
    hint: "“n” as in nose. Small н looks like a little Н.",
    audio: letterAudio("n"),
  },
  {
    type: "intro",
    letter: "В",
    lower: "в",
    sound: "v",
    looksLike: "B",
    hint: "“v” as in van. Small в is a little В.",
    audio: letterAudio("v"),
  },
  {
    type: "match",
    prompt: "Tap the matching pairs",
    pairs: [
      { left: "Р", right: "r", audio: letterAudio("r") },
      { left: "С", right: "s", audio: letterAudio("s") },
      { left: "Н", right: "n", audio: letterAudio("n") },
      { left: "В", right: "v", audio: letterAudio("v") },
    ],
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "НОС",
    displayAudio: wordAudio("nos"),
    options: [{ label: "hoc" }, { label: "nos" }, { label: "noc" }],
    answer: "nos",
    explain: "НОС means nose 👃",
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "sok (juice)",
    answer: ["С", "О", "К"],
    tiles: ["К", "Р", "С", "О", "Н", "А"],
    explain: "СОК means juice 🧃",
    audio: wordAudio("sok"),
  },
  {
    type: "intro",
    letter: "У",
    lower: "у",
    sound: "u",
    looksLike: "Y",
    hint: "“oo” as in moon, but short.",
    audio: letterAudio("u"),
  },
  {
    type: "intro",
    letter: "Х",
    lower: "х",
    sound: "h",
    looksLike: "X",
    hint: "“h” as in hat, a little throaty, like “ch” in Scottish loch.",
    audio: letterAudio("h"),
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “u”",
    optionStyle: "letters",
    options: [
      { label: "Х", audio: letterAudio("h") },
      { label: "У", audio: letterAudio("u") },
      { label: "В", audio: letterAudio("v") },
      { label: "Н", audio: letterAudio("n") },
    ],
    answer: "У",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "УХО",
    displayAudio: wordAudio("uho"),
    options: [{ label: "yxo" }, { label: "uho" }, { label: "uxo" }],
    answer: "uho",
    explain: "УХО means ear 👂",
  },
  {
    type: "choice",
    prompt: "How do you read this sign?",
    display: "РЕСТОРАНТ",
    displayAudio: wordAudio("restorant"),
    options: [{ label: "pectopaht" }, { label: "restorant" }, { label: "restoran" }],
    answer: "restorant",
    explain: "РЕСТОРАНТ means restaurant 🍽️",
  },
  {
    type: "match",
    prompt: "Match the words with their meaning",
    pairs: [
      { left: "НОС", right: "nose", audio: wordAudio("nos") },
      { left: "УХО", right: "ear", audio: wordAudio("uho") },
      { left: "СОК", right: "juice", audio: wordAudio("sok") },
      { left: "РАК", right: "crab", audio: wordAudio("rak") },
    ],
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "more (sea)",
    answer: ["М", "О", "Р", "Е"],
    tiles: ["Е", "Р", "Н", "М", "С", "О"],
    explain: "МОРЕ means sea 🌊",
    audio: wordAudio("more"),
  },
];

export const course: CourseUnit[] = [
  {
    id: "unit-1",
    section: 1,
    unit: 1,
    title: "Read your first letters",
    lessons: [
      { id: "alphabet-1", title: "First letters", description: "В Н Р С У Х", xp: 10, exercises: lesson1 },
      { id: "alphabet-2", title: "New shapes", description: "Б Г Д З И Л П", xp: 10, exercises: null },
      { id: "alphabet-3", title: "Tricky sounds", description: "Ж Ш Щ Ц Ч Ф", xp: 10, exercises: null },
      { id: "alphabet-4", title: "Last letters", description: "Й Ъ Ь Ю Я", xp: 10, exercises: null },
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
