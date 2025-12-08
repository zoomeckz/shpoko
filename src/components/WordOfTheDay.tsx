import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

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
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Word of the Day</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{word.word}</div>
              <div className="text-xl text-muted-foreground mb-2">{word.pronunciation}</div>
              <div className="text-lg font-medium">{word.meaning}</div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-muted-foreground">Example sentences:</h3>
              {word.examples.map((example, index) => (
                <div key={index} className="p-3 bg-background/60 rounded-lg">
                  <div className="font-medium text-primary">{example.bulgarian}</div>
                  <div className="text-sm text-muted-foreground">{example.pronunciation}</div>
                  <div className="text-sm">{example.english}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
