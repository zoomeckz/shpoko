import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { ShpokoMascot } from "@/components/ShpokoMascot";

interface DailyWord {
  word: string;
  pronunciation: string;
  meaning: string;
  examples: { bulgarian: string; pronunciation: string; english: string }[];
}

const wordsOfTheDay: DailyWord[] = [
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
    word: "Разбирам",
    pronunciation: "Razbiram",
    meaning: "To understand",
    examples: [
      { bulgarian: "Разбирам.", pronunciation: "Razbiram.", english: "I understand." },
      { bulgarian: "Разбираш ли?", pronunciation: "Razbirash li?", english: "Do you understand?" },
      { bulgarian: "Не разбирам.", pronunciation: "Ne razbiram.", english: "I don't understand." },
      { bulgarian: "Разбирам български.", pronunciation: "Razbiram balgarski.", english: "I understand Bulgarian." },
    ],
  },
  {
    word: "Знам",
    pronunciation: "Znam",
    meaning: "To know",
    examples: [
      { bulgarian: "Знам.", pronunciation: "Znam.", english: "I know." },
      { bulgarian: "Не знам.", pronunciation: "Ne znam.", english: "I don't know." },
      { bulgarian: "Знаеш ли?", pronunciation: "Znaesh li?", english: "Do you know?" },
      { bulgarian: "Знам отговора.", pronunciation: "Znam otgovora.", english: "I know the answer." },
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

const getWordOfTheDay = (): DailyWord => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return wordsOfTheDay[dayOfYear % wordsOfTheDay.length];
};

export const WordOfTheDay = () => {
  const word = getWordOfTheDay();

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center justify-center gap-3 mb-4">
        <ShpokoMascot expression="studying" size="sm" />
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Shpoko's Word of the Day</h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col justify-center items-center text-center h-full">
          <div className="text-7xl font-bold text-primary mb-4">{word.word}</div>
          <div className="text-3xl text-muted-foreground mb-2">{word.pronunciation}</div>
          <div className="text-2xl font-medium text-foreground">{word.meaning}</div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Examples:</h3>
          {word.examples.map((example, index) => (
            <div key={index} className="p-2 bg-card/80 rounded-lg text-sm border border-border/50">
              <div className="font-medium text-primary">{example.bulgarian}</div>
              <div className="text-xs text-muted-foreground">{example.pronunciation} — {example.english}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
