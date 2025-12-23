import { Card } from "@/components/ui/card";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { getTranslations } from "@/lib/translations";

interface DailyWord {
  word: string;
  pronunciation: string;
  meaning: string;
  examples: {
    bulgarian: string;
    pronunciation: string;
    translation: string;
  }[];
}

// Bulgarian words (for learning Bulgarian - English UI)
const bulgarianWordsEN: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "To like",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "I like it." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "Do you like it?" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "She likes me." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "I like this book." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "To want",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "I want water." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "What do you want?" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "He wants to eat." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "I want to go." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Can / To be able",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "I can help." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "Can you?" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "I can't." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "I can speak." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "To love",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "I love you." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "I love food." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "She loves me." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "I love to read." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "To have",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "I have time." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "Do you have?" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "I don't have." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "I have an idea." },
    ],
  },
];

// Bulgarian words (for learning Bulgarian - Swedish UI)
const bulgarianWordsSV: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "Att gilla",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "Jag gillar det." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "Gillar du det?" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "Hon gillar mig." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "Jag gillar den här boken." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "Att vilja",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "Jag vill ha vatten." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "Vad vill du ha?" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "Han vill äta." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "Jag vill gå." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Kan / Att kunna",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "Jag kan hjälpa." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "Kan du?" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "Jag kan inte." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "Jag kan tala." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "Att älska",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "Jag älskar dig." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "Jag älskar mat." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "Hon älskar mig." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "Jag älskar att läsa." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "Att ha",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "Jag har tid." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "Har du?" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "Jag har inte." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "Jag har en idé." },
    ],
  },
];

// Bulgarian words (for learning Bulgarian - Tunisian Arabic UI)
const bulgarianWordsTN: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "نحب / يعجبني",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "يعجبني." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "يعجبك؟" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "هي تحبني." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "نحب الكتاب هذا." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "نحب / نريد",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "نحب ماء." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "شنوّة تحب؟" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "هو يحب ياكل." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "نحب نمشي." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "نجّم / نقدر",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "نجّم نعاونك." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "تنجّم؟" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "ما نجّمش." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "نجّم نحكي." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "نحب (حب قوي)",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "نحبك." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "نحب الماكلة." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "هي تحبني." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "نحب نقرا." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "عندي",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "عندي وقت." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "عندك؟" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "ما عنديش." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "عندي فكرة." },
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
  const { languageMode, uiLanguage } = useLanguageMode();
  const t = getTranslations(uiLanguage);

  if (languageMode === "spanish") {
    const word = getSpanishWordOfTheDay(spanishWordsOfTheDay);
    return (
      <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShpokoMascot size="xs" />
          <h2 className="text-sm font-bold text-foreground">{t.wordOfTheDay}</h2>
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

  // Bulgarian mode (English, Swedish or Tunisian UI)
  const words = uiLanguage === 'swedish' ? bulgarianWordsSV : uiLanguage === 'tunisian' ? bulgarianWordsTN : bulgarianWordsEN;
  const word = getWordOfTheDay(words);
  
  return (
    <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center justify-center gap-2 mb-2">
        <ShpokoMascot size="xs" />
        <h2 className="text-sm font-bold text-foreground">{t.wordOfTheDay}</h2>
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
            <div className="text-muted-foreground">{example.pronunciation} — {example.translation}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
