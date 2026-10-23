/**
 * Spoken Bulgarian. Every clip is made once by scripts/generate-audio.mjs
 * (Azure text-to-speech) and saved as /public/audio/bg/<id>.mp3, where the id
 * comes from the text itself. Nothing is generated while people use the site.
 *
 * Text that has no clip yet (e.g. a brand-new lesson) simply gets no sound
 * button until the script is run again.
 */
import { SPEECH_CLIPS } from "@/data/speechClips";
import { SHOW_SOUND_BUTTONS } from "@/config/features";

const CYRILLIC = /[Ѐ-ӿ]/;

/**
 * The same text always gives the same clip, whatever its case, spacing or
 * full stop. Question marks stay: they change how a sentence is said.
 */
export const speechKey = (text: string) =>
  text
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!:;…]+$/, "")
    .toLocaleLowerCase("bg");

/** cyrb53: a small, stable 53-bit string hash. */
function hash(str: string) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export const speechId = (text: string) => hash(speechKey(text)).toString(36);

export const isBulgarian = (text?: string): text is string => !!text && CYRILLIC.test(text);

/**
 * How a single letter is said on its own: vowels as themselves, consonants
 * with a short "ъ" after them, the way Bulgarian children learn them.
 */
const LETTER_SOUNDS: Record<string, string> = {
  а: "а", б: "бъ", в: "въ", г: "гъ", д: "дъ", е: "е", ж: "жъ", з: "зъ", и: "и", й: "и кратко",
  к: "къ", л: "лъ", м: "мъ", н: "нъ", о: "о", п: "пъ", р: "ръ", с: "съ", т: "тъ", у: "у",
  ф: "фъ", х: "хъ", ц: "цъ", ч: "чъ", ш: "шъ", щ: "щъ", ъ: "ъ", ь: "ер малък", ю: "ю", я: "я",
};

/** What the voice actually reads for a piece of course text. */
export function spokenText(text: string) {
  const key = speechKey(text);
  if (LETTER_SOUNDS[key]) return LETTER_SOUNDS[key];
  // Words in capitals (signs, "СОК") would be spelled out letter by letter.
  const clean = text.normalize("NFC").trim().replace(/\s+/g, " ");
  return clean === clean.toLocaleUpperCase("bg") ? key : clean;
}

const available = new Set(SPEECH_CLIPS);

/** The clip for this text, if there is one (and sound is switched on). */
export function speechSrc(text?: string) {
  if (!SHOW_SOUND_BUTTONS || !isBulgarian(text)) return undefined;
  const id = speechId(text);
  return available.has(id) ? `/audio/bg/${id}.mp3` : undefined;
}

let current: HTMLAudioElement | null = null;

/** Plays the clip for this text (stopping any other). Returns false when there is none. */
export function playSpeech(text?: string, onEnd?: () => void) {
  const src = speechSrc(text);
  if (!src) return false;
  current?.pause();
  const audio = new Audio(src);
  current = audio;
  audio.onended = () => onEnd?.();
  audio.onerror = () => onEnd?.();
  audio.play().catch(() => onEnd?.());
  return true;
}

export const stopSpeech = () => current?.pause();
