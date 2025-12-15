import { Card } from "@/components/ui/card";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { useLanguageMode } from "@/contexts/LanguageModeContext";

interface DailyWord {
  word: string;
  pronunciation: string;
  meaning: string;
  examples: {
    bulgarian: string;
    pronunciation: string;
    english: string;
  }[];
}

// Bulgarian words (for learning Bulgarian - English UI)
const bulgarianWordsOfTheDay: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "To like",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", english: "I like it." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", english: "Do you like it?" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", english: "She likes me." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", english: "I like this book." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "To want",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", english: "I want water." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", english: "What do you want?" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", english: "He wants to eat." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", english: "I want to go." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Can / To be able",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", english: "I can help." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", english: "Can you?" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", english: "I can't." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", english: "I can speak." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "To love",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", english: "I love you." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", english: "I love food." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", english: "She loves me." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", english: "I love to read." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "To have",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", english: "I have time." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", english: "Do you have?" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", english: "I don't have." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", english: "I have an idea." },
    ],
  },
];

// Spanish words (for learning Spanish - Bulgarian UI)
interface SpanishDailyWord {
  word: string;
  pronunciation: string;
  meaning: string;
  examples: {
    spanish: string;
    pronunciation: string;
    bulgarian: string;
  }[];
}

const spanishWordsOfTheDay: SpanishDailyWord[] = [
  {
    word: "Querer",
    pronunciation: "керер",
    meaning: "Искам / Обичам",
    examples: [
      { spanish: "Te quiero.", pronunciation: "Те киеро.", bulgarian: "Обичам те." },
      { spanish: "Quiero agua.", pronunciation: "Киеро агуа.", bulgarian: "Искам вода." },
      { spanish: "¿Qué quieres?", pronunciation: "Ке киерес?", bulgarian: "Какво искаш?" },
      { spanish: "Quiero ir.", pronunciation: "Киеро ир.", bulgarian: "Искам да отида." },
    ],
  },
  {
    word: "Poder",
    pronunciation: "подер",
    meaning: "Мога",
    examples: [
      { spanish: "Puedo ayudar.", pronunciation: "Пуедо аюдар.", bulgarian: "Мога да помогна." },
      { spanish: "¿Puedes?", pronunciation: "Пуедес?", bulgarian: "Можеш ли?" },
      { spanish: "No puedo.", pronunciation: "Но пуедо.", bulgarian: "Не мога." },
      { spanish: "Puedo hablar.", pronunciation: "Пуедо аблар.", bulgarian: "Мога да говоря." },
    ],
  },
  {
    word: "Tener",
    pronunciation: "тенер",
    meaning: "Имам",
    examples: [
      { spanish: "Tengo tiempo.", pronunciation: "Тенго тиемпо.", bulgarian: "Имам време." },
      { spanish: "¿Tienes?", pronunciation: "Тиенес?", bulgarian: "Имаш ли?" },
      { spanish: "No tengo.", pronunciation: "Но тенго.", bulgarian: "Нямам." },
      { spanish: "Tengo una idea.", pronunciation: "Тенго уна идеа.", bulgarian: "Имам идея." },
    ],
  },
  {
    word: "Gustar",
    pronunciation: "густар",
    meaning: "Харесвам",
    examples: [
      { spanish: "Me gusta.", pronunciation: "Ме густа.", bulgarian: "Харесва ми." },
      { spanish: "¿Te gusta?", pronunciation: "Те густа?", bulgarian: "Харесва ли ти?" },
      { spanish: "Me gusta este libro.", pronunciation: "Ме густа есте либро.", bulgarian: "Харесвам тази книга." },
      { spanish: "Le gusta.", pronunciation: "Ле густа.", bulgarian: "Харесва му/ѝ." },
    ],
  },
  {
    word: "Amar",
    pronunciation: "амар",
    meaning: "Обичам",
    examples: [
      { spanish: "Te amo.", pronunciation: "Те амо.", bulgarian: "Обичам те." },
      { spanish: "Amo la comida.", pronunciation: "Амо ла комида.", bulgarian: "Обичам храна." },
      { spanish: "Ella me ama.", pronunciation: "Ея ме ама.", bulgarian: "Тя ме обича." },
      { spanish: "Amo leer.", pronunciation: "Амо леер.", bulgarian: "Обичам да чета." },
    ],
  },
];

const getWordOfTheDay = (words: DailyWord[]): DailyWord => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return words[dayOfYear % words.length];
};

const getSpanishWordOfTheDay = (words: SpanishDailyWord[]): SpanishDailyWord => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return words[dayOfYear % words.length];
};

export const WordOfTheDay = () => {
  const { languageMode } = useLanguageMode();

  if (languageMode === "spanish") {
    const word = getSpanishWordOfTheDay(spanishWordsOfTheDay);
    return (
      <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShpokoMascot size="xs" />
          <h2 className="text-sm font-bold text-foreground">Дума на деня</h2>
        </div>

        <div className="text-center mb-3">
          <div className="text-3xl font-bold text-primary">{word.word}</div>
          <div className="text-base text-muted-foreground">{word.pronunciation}</div>
          <div className="text-sm font-medium text-foreground">{word.meaning}</div>
        </div>

        <div className="space-y-1">
          {word.examples.slice(0, 2).map((example, index) => (
            <div key={index} className="p-1.5 bg-card/80 rounded text-xs border border-border/50 text-center">
              <div className="font-medium text-primary">{example.spanish}</div>
              <div className="text-muted-foreground">{example.pronunciation} — {example.bulgarian}</div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Bulgarian mode (default)
  const word = getWordOfTheDay(bulgarianWordsOfTheDay);
  return (
    <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center justify-center gap-2 mb-2">
        <ShpokoMascot size="xs" />
        <h2 className="text-sm font-bold text-foreground">Word of the Day</h2>
      </div>

      <div className="text-center mb-3">
        <div className="text-3xl font-bold text-primary">{word.word}</div>
        <div className="text-base text-muted-foreground">{word.pronunciation}</div>
        <div className="text-sm font-medium text-foreground">{word.meaning}</div>
      </div>

      <div className="space-y-1">
        {word.examples.slice(0, 2).map((example, index) => (
          <div key={index} className="p-1.5 bg-card/80 rounded text-xs border border-border/50 text-center">
            <div className="font-medium text-primary">{example.bulgarian}</div>
            <div className="text-muted-foreground">{example.pronunciation} — {example.english}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
