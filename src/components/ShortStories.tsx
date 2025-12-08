import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Word {
  bulgarian: string;
  romanized: string;
  meaning: string;
}

interface Story {
  id: string;
  title: string;
  level: "beginner" | "intermediate";
  sentences: Word[][];
}

const stories: Story[] = [
  {
    id: "morning",
    title: "Good Morning",
    level: "beginner",
    sentences: [
      [
        { bulgarian: "Аз", romanized: "Az", meaning: "I" },
        { bulgarian: "ставам", romanized: "stavam", meaning: "wake up" },
        { bulgarian: "рано.", romanized: "rano.", meaning: "early." },
      ],
      [
        { bulgarian: "Пия", romanized: "Piya", meaning: "I drink" },
        { bulgarian: "кафе.", romanized: "kafe.", meaning: "coffee." },
      ],
      [
        { bulgarian: "Ям", romanized: "Yam", meaning: "I eat" },
        { bulgarian: "закуска.", romanized: "zakuska.", meaning: "breakfast." },
      ],
      [
        { bulgarian: "Отивам", romanized: "Otivam", meaning: "I go" },
        { bulgarian: "на", romanized: "na", meaning: "to" },
        { bulgarian: "работа.", romanized: "rabota.", meaning: "work." },
      ],
    ],
  },
  {
    id: "market",
    title: "At the Market",
    level: "beginner",
    sentences: [
      [
        { bulgarian: "Отивам", romanized: "Otivam", meaning: "I go" },
        { bulgarian: "на", romanized: "na", meaning: "to" },
        { bulgarian: "пазар.", romanized: "pazar.", meaning: "market." },
      ],
      [
        { bulgarian: "Купувам", romanized: "Kupuvam", meaning: "I buy" },
        { bulgarian: "ябълки.", romanized: "yabalki.", meaning: "apples." },
      ],
      [
        { bulgarian: "Те", romanized: "Te", meaning: "They" },
        { bulgarian: "са", romanized: "sa", meaning: "are" },
        { bulgarian: "червени.", romanized: "cherveni.", meaning: "red." },
      ],
      [
        { bulgarian: "Плащам", romanized: "Plashtam", meaning: "I pay" },
        { bulgarian: "два", romanized: "dva", meaning: "two" },
        { bulgarian: "лева.", romanized: "leva.", meaning: "leva." },
      ],
    ],
  },
  {
    id: "family",
    title: "My Family",
    level: "beginner",
    sentences: [
      [
        { bulgarian: "Моето", romanized: "Moeto", meaning: "My" },
        { bulgarian: "семейство", romanized: "semeystvo", meaning: "family" },
        { bulgarian: "е", romanized: "e", meaning: "is" },
        { bulgarian: "голямо.", romanized: "golyamo.", meaning: "big." },
      ],
      [
        { bulgarian: "Имам", romanized: "Imam", meaning: "I have" },
        { bulgarian: "брат", romanized: "brat", meaning: "a brother" },
        { bulgarian: "и", romanized: "i", meaning: "and" },
        { bulgarian: "сестра.", romanized: "sestra.", meaning: "a sister." },
      ],
      [
        { bulgarian: "Те", romanized: "Te", meaning: "They" },
        { bulgarian: "са", romanized: "sa", meaning: "are" },
        { bulgarian: "добри.", romanized: "dobri.", meaning: "kind." },
      ],
      [
        { bulgarian: "Обичам", romanized: "Obicham", meaning: "I love" },
        { bulgarian: "ги.", romanized: "gi.", meaning: "them." },
      ],
    ],
  },
  {
    id: "weather",
    title: "The Weather",
    level: "beginner",
    sentences: [
      [
        { bulgarian: "Днес", romanized: "Dnes", meaning: "Today" },
        { bulgarian: "е", romanized: "e", meaning: "is" },
        { bulgarian: "слънчево.", romanized: "slanchevo.", meaning: "sunny." },
      ],
      [
        { bulgarian: "Небето", romanized: "Nebeto", meaning: "The sky" },
        { bulgarian: "е", romanized: "e", meaning: "is" },
        { bulgarian: "синьо.", romanized: "sinyo.", meaning: "blue." },
      ],
      [
        { bulgarian: "Аз", romanized: "Az", meaning: "I" },
        { bulgarian: "съм", romanized: "sam", meaning: "am" },
        { bulgarian: "щастлив.", romanized: "shtastliv.", meaning: "happy." },
      ],
      [
        { bulgarian: "Искам", romanized: "Iskam", meaning: "I want" },
        { bulgarian: "да", romanized: "da", meaning: "to" },
        { bulgarian: "излеза.", romanized: "izleza.", meaning: "go out." },
      ],
    ],
  },
];

const HoverableWord = ({ word }: { word: Word }) => {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <span className="cursor-help hover:bg-primary/20 hover:text-primary px-0.5 rounded transition-colors inline-block">
          {word.bulgarian}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-center">
        <div className="font-medium">{word.romanized}</div>
        <div className="text-xs text-muted-foreground">{word.meaning}</div>
      </TooltipContent>
    </Tooltip>
  );
};

export const ShortStories = () => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const currentStory = stories[currentStoryIndex];

  const nextStory = () => {
    setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
  };

  const prevStory = () => {
    setCurrentStoryIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Short Stories</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={prevStory} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {currentStoryIndex + 1}/{stories.length}
            </span>
            <Button variant="ghost" size="icon" onClick={nextStory} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <h3 className="font-semibold text-primary">{currentStory.title}</h3>
          <span className="text-xs text-muted-foreground capitalize">{currentStory.level}</span>
        </div>
        
        <div className="space-y-2 text-lg leading-relaxed">
          {currentStory.sentences.map((sentence, sentenceIndex) => (
            <p key={sentenceIndex}>
              {sentence.map((word, wordIndex) => (
                <span key={wordIndex}>
                  <HoverableWord word={word} />
                  {wordIndex < sentence.length - 1 && " "}
                </span>
              ))}
            </p>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 italic">
          Hover over any word to see its romanization and meaning.
        </p>
      </CardContent>
    </Card>
  );
};
