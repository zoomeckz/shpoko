/**
 * The new Shpoko course. Each lesson is a list of short exercises played by
 * src/pages/CourseLesson.tsx.
 *
 * Bulgarian text is spoken from clips made once by scripts/generate-audio.mjs
 * (see src/lib/speech.ts); nothing here needs to point at a sound file.
 */

/** How a piece of Cyrillic text is drawn: normal print, true italics or handwriting. */
export type TextFont = "print" | "italic" | "handwriting";

/** Colours for text drawn as a real-world sign. */
export type SignColor = "green" | "blue" | "red" | "yellow" | "white";

export interface ChoiceOption {
  label: string;
  /** With optionStyle "signs": the sign's colour. */
  sign?: SignColor;
}

export interface FamiliarLetter {
  upper: string;
  lower: string;
  sound: string;
  /** Extra writing rule, shown highlighted. */
  note?: string;
}

export type Exercise =
  | {
      /** A short teaching screen, optionally with a list of examples. */
      type: "tip";
      title: string;
      text: string;
      items?: { big: string; small: string; font?: TextFont }[];
    }
  | {
      /** Teaches one word: how it's read and what it means. */
      type: "word";
      word: string;
      reading: string;
      meaning: string;
      emoji?: string;
      /** Draw the word as a sign of this colour. */
      sign?: SignColor;
      font?: TextFont;
    }
  | {
      /** Shows how a print letter looks in italics or handwriting. */
      type: "shape";
      letter: string;
      font: Exclude<TextFont, "print">;
      /** What the styled letter looks like, e.g. "an English m". */
      looksLike: string;
      note?: string;
    }
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
      /** What this letter is easily mistaken for, shown as a "Not P!" sticker. */
      looksLike?: string;
      /** How to say it in a sentence; defaults to "an English P". */
      looksLikeName?: string;
    }
  | {
      type: "choice";
      prompt: string;
      /** Big text shown above the options (a letter or a word). */
      display?: string;
      displayFont?: TextFont;
      /** Draw the display as a sign of this colour. */
      displaySign?: SignColor;
      /** "letters" renders options as large tiles, "signs" as little signs. */
      optionStyle?: "letters" | "text" | "signs";
      optionFont?: TextFont;
      options: ChoiceOption[];
      answer: string;
      explain?: string;
    }
  | {
      type: "match";
      prompt: string;
      leftFont?: TextFont;
      pairs: { left: string; right: string }[];
    }
  | {
      type: "build";
      prompt: string;
      /** Latin spelling / meaning shown as the thing to write. */
      target: string;
      targetFont?: TextFont;
      answer: string[];
      tiles: string[];
      /** Tiles are whole words (a word bank), joined with spaces, instead of letters. */
      words?: boolean;
      explain?: string;
    }
  | {
      /** Teaches a whole sentence; every word can be tapped for its meaning. */
      type: "phrase";
      text: string;
      reading: string;
      meaning: string;
      /** One entry per word in `text`, in order. `isNew` words are highlighted. */
      words: { bg: string; en: string; isNew?: boolean }[];
      note?: string;
      /** Asks the learner to say it out loud three times, tapping after each. */
      repeat?: boolean;
    }
  | {
      /** Pick the word that fills the gap (written ___) in a sentence. */
      type: "fill";
      sentence: string;
      /** The whole sentence in English, shown as a hint. */
      meaning: string;
      options: string[];
      answer: string;
      explain?: string;
    };

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  xp: number;
  /**
   * "test": a unit test. No teaching cards, wrong answers aren't repeated,
   * and it only counts as complete with at least `passAccuracy` percent.
   */
  kind?: "lesson" | "test" | "extra";
  /** Extras only: total XP needed to open it (set from the unit's position, see below). */
  unlockXp?: number;
  passAccuracy?: number;
  /** Shown when a unit test is passed. */
  completeMessage?: string;
  /** Font for the description's chips on the finish screen. */
  descriptionFont?: TextFont;
  /** null = not built yet, shown as locked on the path. */
  exercises: Exercise[] | null;
}

export interface CourseUnit {
  id: string;
  section: number;
  unit: number;
  title: string;
  /** Each unit has its own colour on the path, like Duolingo. */
  color: "blue" | "pink" | "green" | "gold";
  /** An extra unit outside the main path, opened by earning XP. */
  bonus?: { unlockXp: number };
  /** Short extra lessons beside the path, one per lesson, opened with XP. */
  extras?: CourseLesson[];
  /** Picture shown beside the unit's path. */
  mascot: string;
  lessons: CourseLesson[];
}

/** Exercise types that only teach; they are read and continued, not graded. */
export const TEACHING_TYPES: Exercise["type"][] = ["intro", "familiar", "tip", "word", "shape", "phrase"];

import shpokoMascot from "@/assets/shpoko-mascot.webp";
import { unit2 } from "./units/unit2";
import { unit3 } from "./units/unit3";
import { unit4 } from "./units/unit4";
import { extras } from "./units/extras";
import { bonusHandwriting } from "./units/handwriting";

// Lesson 1: a quick look at the letters learners already know, then the
// "false friends" that look English but sound different.
const lesson1: Exercise[] = [
  {
    type: "familiar",
    title: "Letters you already know",
    note: "These are written just like in English. A few sound a little different, but you write them the same way.",
    letters: [
      { upper: "А", lower: "а", sound: "a, as in father" },
      { upper: "Е", lower: "е", sound: "e, as in pet (never “ee”)" },
      { upper: "К", lower: "к", sound: "k, as in kite" },
      { upper: "О", lower: "о", sound: "o, as in sort, but short" },
      {
        upper: "М",
        lower: "м",
        sound: "m, as in moon",
        note: "Small м is just a little М. It's never written m.",
      },
      { upper: "Т", lower: "т", sound: "t, as in top", note: "Small т is a little Т too." },
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
  },
  {
    type: "intro",
    letter: "С",
    lower: "с",
    sound: "s",
    looksLike: "C",
    hint: "Always “s” as in sun. Never a “k” sound.",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Р",
    options: [{ label: "p" }, { label: "r" }, { label: "b" }],
    answer: "r",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "С",
    options: [{ label: "k" }, { label: "ch" }, { label: "s" }],
    answer: "s",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "РАК",
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
  },
  {
    type: "intro",
    letter: "В",
    lower: "в",
    sound: "v",
    looksLike: "B",
    hint: "“v” as in van. Small в is a little В.",
  },
  {
    type: "match",
    prompt: "Tap the matching pairs",
    pairs: [
      { left: "Р", right: "r" },
      { left: "С", right: "s" },
      { left: "Н", right: "n" },
      { left: "В", right: "v" },
    ],
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "НОС",
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
  },
  {
    type: "intro",
    letter: "У",
    lower: "у",
    sound: "u",
    looksLike: "Y",
    hint: "“oo” as in moon, but short.",
  },
  {
    type: "intro",
    letter: "Х",
    lower: "х",
    sound: "h",
    looksLike: "X",
    hint: "“h” as in hat, a little throaty, like “ch” in Scottish loch.",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “u”",
    optionStyle: "letters",
    options: [
      { label: "Х" },
      { label: "У" },
      { label: "В" },
      { label: "Н" },
    ],
    answer: "У",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "УХО",
    options: [{ label: "yxo" }, { label: "uho" }, { label: "uxo" }],
    answer: "uho",
    explain: "УХО means ear 👂",
  },
  {
    type: "choice",
    prompt: "How do you read this sign?",
    display: "РЕСТОРАНТ",
    options: [{ label: "pectopaht" }, { label: "restorant" }, { label: "restoran" }],
    answer: "restorant",
    explain: "РЕСТОРАНТ means restaurant 🍽️",
  },
  {
    type: "match",
    prompt: "Match each word with how it's read",
    pairs: [
      { left: "НОС", right: "nos" },
      { left: "УХО", right: "uho" },
      { left: "СОК", right: "sok" },
      { left: "РАК", right: "rak" },
    ],
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "more (sea)",
    answer: ["М", "О", "Р", "Е"],
    tiles: ["Е", "Р", "Н", "М", "С", "О"],
    explain: "МОРЕ means sea 🌊",
  },
];

// Lesson 2: letters with shapes English doesn't have. Every word uses only
// letters from lessons 1 and 2, so learners can actually read it.
const lesson2: Exercise[] = [
  {
    type: "intro",
    letter: "Б",
    lower: "б",
    sound: "b",
    hint: "“b” as in boy. Small б looks a bit like a 6.",
  },
  {
    type: "intro",
    letter: "Д",
    lower: "д",
    sound: "d",
    hint: "“d” as in dog. Small д is a little Д.",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Б",
    options: [{ label: "v" }, { label: "b" }, { label: "p" }],
    answer: "b",
    explain: "Careful: В is “v”, Б is “b”.",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Д",
    options: [{ label: "d" }, { label: "g" }, { label: "l" }],
    answer: "d",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ДОМ",
    options: [{ label: "bom" }, { label: "dom" }, { label: "tom" }],
    answer: "dom",
    explain: "ДОМ means home 🏠",
  },
  {
    type: "intro",
    letter: "П",
    lower: "п",
    sound: "p",
    hint: "“p” as in pen. Don't mix it up with Р, which is “r”!",
  },
  {
    type: "intro",
    letter: "Л",
    lower: "л",
    sound: "l",
    hint: "“l” as in lamp.",
  },
  {
    type: "match",
    prompt: "Tap the matching pairs",
    pairs: [
      { left: "Б", right: "b" },
      { left: "Д", right: "d" },
      { left: "П", right: "p" },
      { left: "Л", right: "l" },
    ],
  },
  {
    type: "choice",
    prompt: "How do you read this sign?",
    display: "ПАРК",
    options: [{ label: "rapk" }, { label: "park" }, { label: "pank" }],
    answer: "park",
    explain: "ПАРК means park 🌳",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЛАМПА",
    options: [{ label: "lampa" }, { label: "dampa" }, { label: "lamra" }],
    answer: "lampa",
    explain: "ЛАМПА means lamp 💡",
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "dom (home)",
    answer: ["Д", "О", "М"],
    tiles: ["М", "Б", "Д", "О", "Л", "А"],
  },
  {
    type: "intro",
    letter: "Г",
    lower: "г",
    sound: "g",
    hint: "Always a hard “g” as in go, never like the g in gem.",
  },
  {
    type: "intro",
    letter: "З",
    lower: "з",
    sound: "z",
    looksLike: "3",
    looksLikeName: "the number 3",
    hint: "“z” as in zoo.",
  },
  {
    type: "intro",
    letter: "И",
    lower: "и",
    sound: "i",
    looksLike: "N",
    looksLikeName: "a backwards N",
    hint: "“ee” as in meet, but short.",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “z”",
    optionStyle: "letters",
    options: [
      { label: "Г" },
      { label: "З" },
      { label: "Б" },
      { label: "Д" },
    ],
    answer: "З",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ee”",
    optionStyle: "letters",
    options: [
      { label: "Н" },
      { label: "И" },
      { label: "П" },
      { label: "Л" },
    ],
    answer: "И",
    explain: "Н is “n”, И is “i”.",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЗИМА",
    options: [{ label: "3ima" }, { label: "zina" }, { label: "zima" }],
    answer: "zima",
    explain: "ЗИМА means winter ❄️",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "КРОКОДИЛ",
    options: [{ label: "krokodil" }, { label: "kpokodil" }, { label: "krokobil" }],
    answer: "krokodil",
    explain: "КРОКОДИЛ means crocodile 🐊",
  },
  {
    type: "match",
    prompt: "Match each word with how it's read",
    pairs: [
      { left: "ГРАД", right: "grad" },
      { left: "ВОДА", right: "voda" },
      { left: "БИРА", right: "bira" },
      { left: "ЛИМОН", right: "limon" },
    ],
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "magazin (shop)",
    answer: ["М", "А", "Г", "А", "З", "И", "Н"],
    tiles: ["Г", "А", "Н", "М", "И", "З", "А", "П", "Д"],
    explain: "МАГАЗИН means shop 🛒",
  },
];

// Lesson 3: the hissing and buzzing sounds.
const lesson3: Exercise[] = [
  { type: "intro", letter: "Ш", lower: "ш", sound: "sh", hint: "“sh” as in ship." },
  {
    type: "intro",
    letter: "Щ",
    lower: "щ",
    sound: "sht",
    hint: "Ш with a little tail. It says “sht”, like in ashtray.",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Ш",
    options: [{ label: "sh" }, { label: "sht" }, { label: "ch" }],
    answer: "sh",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Щ",
    options: [{ label: "sh" }, { label: "ts" }, { label: "sht" }],
    answer: "sht",
    explain: "The little tail adds a “t”: Щ = sht.",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ШАПКА",
    options: [{ label: "shtapka" }, { label: "shapka" }, { label: "chapka" }],
    answer: "shapka",
    explain: "ШАПКА means hat 🧢",
  },
  {
    type: "intro",
    letter: "Ж",
    lower: "ж",
    sound: "zh",
    hint: "Like the s in pleasure. It looks like a little bug!",
  },
  {
    type: "intro",
    letter: "Ч",
    lower: "ч",
    sound: "ch",
    looksLike: "4",
    looksLikeName: "the number 4",
    hint: "“ch” as in chair.",
  },
  {
    type: "match",
    prompt: "Tap the matching pairs",
    pairs: [
      { left: "Ш", right: "sh" },
      { left: "Щ", right: "sht" },
      { left: "Ж", right: "zh" },
      { left: "Ч", right: "ch" },
    ],
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЖАБА",
    options: [{ label: "shaba" }, { label: "zhaba" }, { label: "chaba" }],
    answer: "zhaba",
    explain: "ЖАБА means frog 🐸",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЧАША",
    options: [{ label: "chasha" }, { label: "shasha" }, { label: "chashta" }],
    answer: "chasha",
    explain: "ЧАША means cup ☕",
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "shapka (hat)",
    answer: ["Ш", "А", "П", "К", "А"],
    tiles: ["К", "Ш", "А", "П", "Щ", "А", "Ч"],
  },
  {
    type: "intro",
    letter: "Ц",
    lower: "ц",
    sound: "ts",
    hint: "“ts” as in cats. Notice the little tail at the bottom.",
  },
  {
    type: "intro",
    letter: "Ф",
    lower: "ф",
    sound: "f",
    hint: "“f” as in fish. A circle with a line through it.",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ts”",
    optionStyle: "letters",
    options: [
      { label: "Ч" },
      { label: "Ц" },
      { label: "Щ" },
      { label: "Ш" },
    ],
    answer: "Ц",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ch”",
    optionStyle: "letters",
    options: [
      { label: "Ц" },
      { label: "Ж" },
      { label: "Ч" },
      { label: "Щ" },
    ],
    answer: "Ч",
    explain: "Ч looks like a 4 and says “ch”.",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ПИЦА",
    options: [{ label: "pisa" }, { label: "pitsa" }, { label: "picha" }],
    answer: "pitsa",
    explain: "ПИЦА means pizza 🍕",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЖИРАФ",
    options: [{ label: "zhiraf" }, { label: "shiraf" }, { label: "zhirat" }],
    answer: "zhiraf",
    explain: "ЖИРАФ means giraffe 🦒",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЩАСТИЕ",
    options: [{ label: "shastie" }, { label: "chastie" }, { label: "shtastie" }],
    answer: "shtastie",
    explain: "ЩАСТИЕ means happiness 😊",
  },
  {
    type: "match",
    prompt: "Match each word with how it's read",
    pairs: [
      { left: "ЦИРК", right: "tsirk" },
      { left: "ФОТО", right: "foto" },
      { left: "КАФЕ", right: "kafe" },
      { left: "УЛИЦА", right: "ulitsa" },
    ],
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "shokolad (chocolate)",
    answer: ["Ш", "О", "К", "О", "Л", "А", "Д"],
    tiles: ["Л", "О", "Ш", "Д", "К", "А", "О", "Щ", "Ч"],
    explain: "ШОКОЛАД means chocolate 🍫",
  },
];

// Lesson 4: the last letters. Ъ is written “ă” in the Latin spellings.
const lesson4: Exercise[] = [
  {
    type: "intro",
    letter: "Я",
    lower: "я",
    sound: "ya",
    looksLike: "R",
    looksLikeName: "a backwards R",
    hint: "“ya” as in yard.",
  },
  {
    type: "intro",
    letter: "Ю",
    lower: "ю",
    sound: "yu",
    looksLike: "IO",
    looksLikeName: "I and O stuck together",
    hint: "“yu” as in you.",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Я",
    options: [{ label: "r" }, { label: "ya" }, { label: "yu" }],
    answer: "ya",
    explain: "Я is “ya”, not R.",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Ю",
    options: [{ label: "io" }, { label: "ya" }, { label: "yu" }],
    answer: "yu",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЮЛИ",
    options: [{ label: "yuli" }, { label: "ioli" }, { label: "yali" }],
    answer: "yuli",
    explain: "ЮЛИ means July ☀️",
  },
  {
    type: "intro",
    letter: "Й",
    lower: "й",
    sound: "y",
    hint: "A short “y”, like at the end of boy. It's И with a little hat.",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЧАЙ",
    options: [{ label: "shay" }, { label: "chay" }, { label: "chan" }],
    answer: "chay",
    explain: "ЧАЙ means tea 🍵",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЗДРАВЕЙ",
    options: [{ label: "sdravey" }, { label: "zdrabey" }, { label: "zdravey" }],
    answer: "zdravey",
    explain: "ЗДРАВЕЙ means hello! 👋",
  },
  {
    type: "intro",
    letter: "Ъ",
    lower: "ъ",
    sound: "ă",
    hint: "A short “uh”, like the a in about. We write it ă.",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Ъ",
    options: [{ label: "b" }, { label: "ă" }, { label: "y" }],
    answer: "ă",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "КЪЩА",
    options: [{ label: "kăsta" }, { label: "kăchta" }, { label: "kăshta" }],
    answer: "kăshta",
    explain: "КЪЩА means house 🏡",
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "păt (road)",
    answer: ["П", "Ъ", "Т"],
    tiles: ["Т", "Ъ", "Б", "П", "Д", "Р"],
    explain: "ПЪТ means road 🛣️",
  },
  {
    type: "intro",
    letter: "Ь",
    lower: "ь",
    sound: "ьо = yo",
    hint: "It only ever comes before О, and together they say “yo”.",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ШОФЬОР",
    options: [{ label: "shofbor" }, { label: "shofyor" }, { label: "shotyor" }],
    answer: "shofyor",
    explain: "ШОФЬОР means driver 🚕",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ă”",
    optionStyle: "letters",
    options: [
      { label: "Ь" },
      { label: "Б" },
      { label: "Ъ" },
      { label: "Й" },
    ],
    answer: "Ъ",
    explain: "Ъ has a little flag on top. Ь doesn't.",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ya”",
    optionStyle: "letters",
    options: [
      { label: "Р" },
      { label: "Ю" },
      { label: "Я" },
      { label: "Й" },
    ],
    answer: "Я",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЯБЪЛКА",
    options: [{ label: "yubălka" }, { label: "yabălka" }, { label: "rabălka" }],
    answer: "yabălka",
    explain: "ЯБЪЛКА means apple 🍎",
  },
  {
    type: "match",
    prompt: "Match each word with how it's read",
    pairs: [
      { left: "ЛЮБОВ", right: "lyubov" },
      { left: "ЯЙЦЕ", right: "yaytse" },
      { left: "АКТЬОР", right: "aktyor" },
      { left: "МУЗЕЙ", right: "muzey" },
    ],
  },
  {
    type: "choice",
    prompt: "How do you read this city?",
    display: "СОФИЯ",
    options: [{ label: "sotiya" }, { label: "sofiyu" }, { label: "sofiya" }],
    answer: "sofiya",
    explain: "СОФИЯ is Sofia, the capital of Bulgaria 🏙️",
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "Bălgariya (Bulgaria)",
    answer: ["Б", "Ъ", "Л", "Г", "А", "Р", "И", "Я"],
    tiles: ["Я", "Л", "Ъ", "Б", "И", "Ь", "Г", "Р", "А", "Ю"],
    explain: "БЪЛГАРИЯ: you can write Bulgaria! 🇧🇬",
  },
];

// Unit test: questions only, mixing all 30 letters.
const unit1Test: Exercise[] = [
  {
    type: "choice",
    prompt: "Select the letter that sounds like “zh”",
    optionStyle: "letters",
    options: [{ label: "Ш" }, { label: "З" }, { label: "Ж" }, { label: "Щ" }],
    answer: "Ж",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Р",
    options: [{ label: "p" }, { label: "r" }, { label: "ya" }],
    answer: "r",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "И",
    options: [{ label: "n" }, { label: "y" }, { label: "i" }],
    answer: "i",
  },
  {
    type: "match",
    prompt: "Tap the matching pairs",
    pairs: [
      { left: "В", right: "v" },
      { left: "Н", right: "n" },
      { left: "С", right: "s" },
      { left: "У", right: "u" },
      { left: "Х", right: "h" },
    ],
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ВОДА",
    options: [{ label: "boda" }, { label: "voda" }, { label: "voba" }],
    answer: "voda",
    explain: "ВОДА means water 💧",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Щ",
    options: [{ label: "sh" }, { label: "sht" }, { label: "ts" }],
    answer: "sht",
  },
  {
    type: "choice",
    prompt: "How do you read this sign?",
    display: "ХОТЕЛ",
    options: [{ label: "xotel" }, { label: "hotep" }, { label: "hotel" }],
    answer: "hotel",
    explain: "ХОТЕЛ means hotel 🏨",
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "tsirk (circus)",
    answer: ["Ц", "И", "Р", "К"],
    tiles: ["К", "Р", "Ц", "И", "Ч", "П"],
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ya”",
    optionStyle: "letters",
    options: [{ label: "Р" }, { label: "Я" }, { label: "Ю" }, { label: "А" }],
    answer: "Я",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЧЕРЕША",
    options: [{ label: "cheresha" }, { label: "chepesha" }, { label: "tseresha" }],
    answer: "cheresha",
    explain: "ЧЕРЕША means cherry 🍒",
  },
  {
    type: "match",
    prompt: "Match each word with how it's read",
    pairs: [
      { left: "ЖИРАФ", right: "zhiraf" },
      { left: "ЮНИ", right: "yuni" },
      { left: "ЩАСТИЕ", right: "shtastie" },
      { left: "ФУТБОЛ", right: "futbol" },
    ],
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “b”",
    optionStyle: "letters",
    options: [{ label: "В" }, { label: "Ь" }, { label: "Д" }, { label: "Б" }],
    answer: "Б",
  },
  {
    type: "choice",
    prompt: "How do you read this?",
    display: "ДОБЪР ДЕН",
    options: [{ label: "dobăr den" }, { label: "dobăr pen" }, { label: "bobăr den" }],
    answer: "dobăr den",
    explain: "ДОБЪР ДЕН means good day 👋",
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "chay (tea)",
    answer: ["Ч", "А", "Й"],
    tiles: ["Й", "Ц", "А", "Ч", "И", "Щ"],
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Ц",
    options: [{ label: "ch" }, { label: "ts" }, { label: "k" }],
    answer: "ts",
  },
  {
    type: "match",
    prompt: "Tap the matching pairs",
    pairs: [
      { left: "Ш", right: "sh" },
      { left: "Ч", right: "ch" },
      { left: "Ж", right: "zh" },
      { left: "Ъ", right: "ă" },
    ],
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "КОМПЮТЪР",
    options: [{ label: "konpyutăr" }, { label: "kompyutăr" }, { label: "kompyutăp" }],
    answer: "kompyutăr",
    explain: "КОМПЮТЪР means computer 💻",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ee”",
    optionStyle: "letters",
    options: [{ label: "Й" }, { label: "Н" }, { label: "И" }, { label: "Ю" }],
    answer: "И",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ПЛАЖ",
    options: [{ label: "plazh" }, { label: "plash" }, { label: "rlazh" }],
    answer: "plazh",
    explain: "ПЛАЖ means beach 🏖️",
  },
  {
    type: "build",
    prompt: "Write this city in Cyrillic",
    target: "Sofiya (Sofia)",
    answer: ["С", "О", "Ф", "И", "Я"],
    tiles: ["Я", "Ф", "О", "С", "И", "Ю", "Р"],
  },
];

export const course: CourseUnit[] = [
  {
    id: "unit-1",
    section: 1,
    unit: 1,
    title: "Read your first letters",
    color: "blue",
    mascot: shpokoMascot,
    lessons: [
      { id: "alphabet-1", title: "First letters", description: "В Н Р С У Х", xp: 10, exercises: lesson1 },
      { id: "alphabet-2", title: "New shapes", description: "Б Г Д З И Л П", xp: 10, exercises: lesson2 },
      { id: "alphabet-3", title: "Hissing sounds", description: "Ш Щ Ж Ч Ц Ф", xp: 10, exercises: lesson3 },
      { id: "alphabet-4", title: "Last letters", description: "Я Ю Й Ъ Ь", xp: 10, exercises: lesson4 },
      {
        id: "unit-1-test",
        title: "Unit 1 test",
        description: "All 30 letters",
        xp: 30,
        kind: "test",
        passAccuracy: 80,
        completeMessage: "You can read all 30 letters of the Bulgarian alphabet!",
        exercises: unit1Test,
      },
    ],
  },
  unit2,
  unit3,
  unit4,
  bonusHandwriting,
];

/** The main path, in order. Bonus units sit outside it. */
export const mainUnits = course.filter((u) => !u.bonus);

// Each extra opens at the XP a learner has after finishing the lesson beside it
// (counting every earlier unit too). Replaying lessons for XP opens them sooner.
{
  let before = 0;
  for (const unit of mainUnits) {
    unit.extras = extras[unit.id];
    let sum = before;
    unit.lessons.forEach((lesson, i) => {
      sum += lesson.xp;
      const extra = unit.extras?.[i];
      if (extra) extra.unlockXp = sum;
    });
    before = sum;
  }
}

export const findLesson = (lessonId: string) => {
  for (const unit of course) {
    const lesson = [...unit.lessons, ...(unit.extras ?? [])].find((l) => l.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return null;
};
