/**
 * The new Shpoko course. Each lesson is a list of short exercises played by
 * src/pages/CourseLesson.tsx.
 *
 * `audio` fields point at clips in /public (e.g. public/audio/letters/r.mp3).
 * Sound buttons stay hidden until SHOW_SOUND_BUTTONS is turned on in
 * src/config/features.ts, so missing clips never show up for learners.
 */

/** How a piece of Cyrillic text is drawn: normal print, true italics or handwriting. */
export type TextFont = "print" | "italic" | "handwriting";

/** Colours for text drawn as a real-world sign. */
export type SignColor = "green" | "blue" | "red" | "yellow" | "white";

export interface ChoiceOption {
  label: string;
  audio?: string;
  /** With optionStyle "signs": the sign's colour. */
  sign?: SignColor;
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
      audio?: string;
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
      audio?: string;
    }
  | {
      type: "choice";
      prompt: string;
      /** Big text shown above the options (a letter or a word). */
      display?: string;
      displayAudio?: string;
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
      pairs: { left: string; right: string; audio?: string }[];
    }
  | {
      type: "build";
      prompt: string;
      /** Latin spelling / meaning shown as the thing to write. */
      target: string;
      targetFont?: TextFont;
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
  /**
   * "test": a unit test. No teaching cards, wrong answers aren't repeated,
   * and it only counts as complete with at least `passAccuracy` percent.
   */
  kind?: "lesson" | "test";
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
  color: "blue" | "pink" | "green";
  lessons: CourseLesson[];
}

/** Exercise types that only teach; they are read and continued, not graded. */
export const TEACHING_TYPES: Exercise["type"][] = ["intro", "familiar", "tip", "word", "shape"];

import { unit2 } from "./units/unit2";
import { unit3 } from "./units/unit3";

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
    prompt: "Match each word with how it's read",
    pairs: [
      { left: "НОС", right: "nos", audio: wordAudio("nos") },
      { left: "УХО", right: "uho", audio: wordAudio("uho") },
      { left: "СОК", right: "sok", audio: wordAudio("sok") },
      { left: "РАК", right: "rak", audio: wordAudio("rak") },
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

// Lesson 2: letters with shapes English doesn't have. Every word uses only
// letters from lessons 1 and 2, so learners can actually read it.
const lesson2: Exercise[] = [
  {
    type: "intro",
    letter: "Б",
    lower: "б",
    sound: "b",
    hint: "“b” as in boy. Small б looks a bit like a 6.",
    audio: letterAudio("b"),
  },
  {
    type: "intro",
    letter: "Д",
    lower: "д",
    sound: "d",
    hint: "“d” as in dog. Small д is a little Д.",
    audio: letterAudio("d"),
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Б",
    displayAudio: letterAudio("b"),
    options: [{ label: "v" }, { label: "b" }, { label: "p" }],
    answer: "b",
    explain: "Careful: В is “v”, Б is “b”.",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Д",
    displayAudio: letterAudio("d"),
    options: [{ label: "d" }, { label: "g" }, { label: "l" }],
    answer: "d",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ДОМ",
    displayAudio: wordAudio("dom"),
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
    audio: letterAudio("p"),
  },
  {
    type: "intro",
    letter: "Л",
    lower: "л",
    sound: "l",
    hint: "“l” as in lamp.",
    audio: letterAudio("l"),
  },
  {
    type: "match",
    prompt: "Tap the matching pairs",
    pairs: [
      { left: "Б", right: "b", audio: letterAudio("b") },
      { left: "Д", right: "d", audio: letterAudio("d") },
      { left: "П", right: "p", audio: letterAudio("p") },
      { left: "Л", right: "l", audio: letterAudio("l") },
    ],
  },
  {
    type: "choice",
    prompt: "How do you read this sign?",
    display: "ПАРК",
    displayAudio: wordAudio("park"),
    options: [{ label: "rapk" }, { label: "park" }, { label: "pank" }],
    answer: "park",
    explain: "ПАРК means park 🌳",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЛАМПА",
    displayAudio: wordAudio("lampa"),
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
    audio: wordAudio("dom"),
  },
  {
    type: "intro",
    letter: "Г",
    lower: "г",
    sound: "g",
    hint: "Always a hard “g” as in go, never like the g in gem.",
    audio: letterAudio("g"),
  },
  {
    type: "intro",
    letter: "З",
    lower: "з",
    sound: "z",
    looksLike: "3",
    looksLikeName: "the number 3",
    hint: "“z” as in zoo.",
    audio: letterAudio("z"),
  },
  {
    type: "intro",
    letter: "И",
    lower: "и",
    sound: "i",
    looksLike: "N",
    looksLikeName: "a backwards N",
    hint: "“ee” as in meet, but short.",
    audio: letterAudio("i"),
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “z”",
    optionStyle: "letters",
    options: [
      { label: "Г", audio: letterAudio("g") },
      { label: "З", audio: letterAudio("z") },
      { label: "Б", audio: letterAudio("b") },
      { label: "Д", audio: letterAudio("d") },
    ],
    answer: "З",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ee”",
    optionStyle: "letters",
    options: [
      { label: "Н", audio: letterAudio("n") },
      { label: "И", audio: letterAudio("i") },
      { label: "П", audio: letterAudio("p") },
      { label: "Л", audio: letterAudio("l") },
    ],
    answer: "И",
    explain: "Н is “n”, И is “i”.",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЗИМА",
    displayAudio: wordAudio("zima"),
    options: [{ label: "3ima" }, { label: "zina" }, { label: "zima" }],
    answer: "zima",
    explain: "ЗИМА means winter ❄️",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "КРОКОДИЛ",
    displayAudio: wordAudio("krokodil"),
    options: [{ label: "krokodil" }, { label: "kpokodil" }, { label: "krokobil" }],
    answer: "krokodil",
    explain: "КРОКОДИЛ means crocodile 🐊",
  },
  {
    type: "match",
    prompt: "Match each word with how it's read",
    pairs: [
      { left: "ГРАД", right: "grad", audio: wordAudio("grad") },
      { left: "ВОДА", right: "voda", audio: wordAudio("voda") },
      { left: "БИРА", right: "bira", audio: wordAudio("bira") },
      { left: "ЛИМОН", right: "limon", audio: wordAudio("limon") },
    ],
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "magazin (shop)",
    answer: ["М", "А", "Г", "А", "З", "И", "Н"],
    tiles: ["Г", "А", "Н", "М", "И", "З", "А", "П", "Д"],
    explain: "МАГАЗИН means shop 🛒",
    audio: wordAudio("magazin"),
  },
];

// Lesson 3: the hissing and buzzing sounds.
const lesson3: Exercise[] = [
  { type: "intro", letter: "Ш", lower: "ш", sound: "sh", hint: "“sh” as in ship.", audio: letterAudio("sh") },
  {
    type: "intro",
    letter: "Щ",
    lower: "щ",
    sound: "sht",
    hint: "Ш with a little tail. It says “sht”, like in ashtray.",
    audio: letterAudio("sht"),
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Ш",
    displayAudio: letterAudio("sh"),
    options: [{ label: "sh" }, { label: "sht" }, { label: "ch" }],
    answer: "sh",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Щ",
    displayAudio: letterAudio("sht"),
    options: [{ label: "sh" }, { label: "ts" }, { label: "sht" }],
    answer: "sht",
    explain: "The little tail adds a “t”: Щ = sht.",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ШАПКА",
    displayAudio: wordAudio("shapka"),
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
    audio: letterAudio("zh"),
  },
  {
    type: "intro",
    letter: "Ч",
    lower: "ч",
    sound: "ch",
    looksLike: "4",
    looksLikeName: "the number 4",
    hint: "“ch” as in chair.",
    audio: letterAudio("ch"),
  },
  {
    type: "match",
    prompt: "Tap the matching pairs",
    pairs: [
      { left: "Ш", right: "sh", audio: letterAudio("sh") },
      { left: "Щ", right: "sht", audio: letterAudio("sht") },
      { left: "Ж", right: "zh", audio: letterAudio("zh") },
      { left: "Ч", right: "ch", audio: letterAudio("ch") },
    ],
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЖАБА",
    displayAudio: wordAudio("zhaba"),
    options: [{ label: "shaba" }, { label: "zhaba" }, { label: "chaba" }],
    answer: "zhaba",
    explain: "ЖАБА means frog 🐸",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЧАША",
    displayAudio: wordAudio("chasha"),
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
    audio: wordAudio("shapka"),
  },
  {
    type: "intro",
    letter: "Ц",
    lower: "ц",
    sound: "ts",
    hint: "“ts” as in cats. Notice the little tail at the bottom.",
    audio: letterAudio("ts"),
  },
  {
    type: "intro",
    letter: "Ф",
    lower: "ф",
    sound: "f",
    hint: "“f” as in fish. A circle with a line through it.",
    audio: letterAudio("f"),
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ts”",
    optionStyle: "letters",
    options: [
      { label: "Ч", audio: letterAudio("ch") },
      { label: "Ц", audio: letterAudio("ts") },
      { label: "Щ", audio: letterAudio("sht") },
      { label: "Ш", audio: letterAudio("sh") },
    ],
    answer: "Ц",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ch”",
    optionStyle: "letters",
    options: [
      { label: "Ц", audio: letterAudio("ts") },
      { label: "Ж", audio: letterAudio("zh") },
      { label: "Ч", audio: letterAudio("ch") },
      { label: "Щ", audio: letterAudio("sht") },
    ],
    answer: "Ч",
    explain: "Ч looks like a 4 and says “ch”.",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ПИЦА",
    displayAudio: wordAudio("pitsa"),
    options: [{ label: "pisa" }, { label: "pitsa" }, { label: "picha" }],
    answer: "pitsa",
    explain: "ПИЦА means pizza 🍕",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЖИРАФ",
    displayAudio: wordAudio("zhiraf"),
    options: [{ label: "zhiraf" }, { label: "shiraf" }, { label: "zhirat" }],
    answer: "zhiraf",
    explain: "ЖИРАФ means giraffe 🦒",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЩАСТИЕ",
    displayAudio: wordAudio("shtastie"),
    options: [{ label: "shastie" }, { label: "chastie" }, { label: "shtastie" }],
    answer: "shtastie",
    explain: "ЩАСТИЕ means happiness 😊",
  },
  {
    type: "match",
    prompt: "Match each word with how it's read",
    pairs: [
      { left: "ЦИРК", right: "tsirk", audio: wordAudio("tsirk") },
      { left: "ФОТО", right: "foto", audio: wordAudio("foto") },
      { left: "КАФЕ", right: "kafe", audio: wordAudio("kafe") },
      { left: "УЛИЦА", right: "ulitsa", audio: wordAudio("ulitsa") },
    ],
  },
  {
    type: "build",
    prompt: "Write this word in Cyrillic",
    target: "shokolad (chocolate)",
    answer: ["Ш", "О", "К", "О", "Л", "А", "Д"],
    tiles: ["Л", "О", "Ш", "Д", "К", "А", "О", "Щ", "Ч"],
    explain: "ШОКОЛАД means chocolate 🍫",
    audio: wordAudio("shokolad"),
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
    audio: letterAudio("ya"),
  },
  {
    type: "intro",
    letter: "Ю",
    lower: "ю",
    sound: "yu",
    looksLike: "IO",
    looksLikeName: "I and O stuck together",
    hint: "“yu” as in you.",
    audio: letterAudio("yu"),
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Я",
    displayAudio: letterAudio("ya"),
    options: [{ label: "r" }, { label: "ya" }, { label: "yu" }],
    answer: "ya",
    explain: "Я is “ya”, not R.",
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Ю",
    displayAudio: letterAudio("yu"),
    options: [{ label: "io" }, { label: "ya" }, { label: "yu" }],
    answer: "yu",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЮЛИ",
    displayAudio: wordAudio("yuli"),
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
    audio: letterAudio("y"),
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЧАЙ",
    displayAudio: wordAudio("chay"),
    options: [{ label: "shay" }, { label: "chay" }, { label: "chan" }],
    answer: "chay",
    explain: "ЧАЙ means tea 🍵",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЗДРАВЕЙ",
    displayAudio: wordAudio("zdravey"),
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
    audio: letterAudio("a-short"),
  },
  {
    type: "choice",
    prompt: "What sound does this letter make?",
    display: "Ъ",
    displayAudio: letterAudio("a-short"),
    options: [{ label: "b" }, { label: "ă" }, { label: "y" }],
    answer: "ă",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "КЪЩА",
    displayAudio: wordAudio("kashta"),
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
    audio: wordAudio("pat"),
  },
  {
    type: "intro",
    letter: "Ь",
    lower: "ь",
    sound: "ьо = yo",
    hint: "It only ever comes before О, and together they say “yo”.",
    audio: letterAudio("yo"),
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ШОФЬОР",
    displayAudio: wordAudio("shofyor"),
    options: [{ label: "shofbor" }, { label: "shofyor" }, { label: "shotyor" }],
    answer: "shofyor",
    explain: "ШОФЬОР means driver 🚕",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ă”",
    optionStyle: "letters",
    options: [
      { label: "Ь", audio: letterAudio("yo") },
      { label: "Б", audio: letterAudio("b") },
      { label: "Ъ", audio: letterAudio("a-short") },
      { label: "Й", audio: letterAudio("y") },
    ],
    answer: "Ъ",
    explain: "Ъ has a little flag on top. Ь doesn't.",
  },
  {
    type: "choice",
    prompt: "Select the letter that sounds like “ya”",
    optionStyle: "letters",
    options: [
      { label: "Р", audio: letterAudio("r") },
      { label: "Ю", audio: letterAudio("yu") },
      { label: "Я", audio: letterAudio("ya") },
      { label: "Й", audio: letterAudio("y") },
    ],
    answer: "Я",
  },
  {
    type: "choice",
    prompt: "How do you read this word?",
    display: "ЯБЪЛКА",
    displayAudio: wordAudio("yabalka"),
    options: [{ label: "yubălka" }, { label: "yabălka" }, { label: "rabălka" }],
    answer: "yabălka",
    explain: "ЯБЪЛКА means apple 🍎",
  },
  {
    type: "match",
    prompt: "Match each word with how it's read",
    pairs: [
      { left: "ЛЮБОВ", right: "lyubov", audio: wordAudio("lyubov") },
      { left: "ЯЙЦЕ", right: "yaytse", audio: wordAudio("yaytse") },
      { left: "АКТЬОР", right: "aktyor", audio: wordAudio("aktyor") },
      { left: "МУЗЕЙ", right: "muzey", audio: wordAudio("muzey") },
    ],
  },
  {
    type: "choice",
    prompt: "How do you read this city?",
    display: "СОФИЯ",
    displayAudio: wordAudio("sofiya"),
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
    audio: wordAudio("balgariya"),
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
        completeMessage: "You can read and write all 30 letters of the Bulgarian alphabet!",
        exercises: unit1Test,
      },
    ],
  },
  unit2,
  unit3,
];

export const findLesson = (lessonId: string) => {
  for (const unit of course) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return null;
};
