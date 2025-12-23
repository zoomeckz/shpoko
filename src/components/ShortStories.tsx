import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, Star, Sparkles } from "lucide-react";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { getTranslations } from "@/lib/translations";

interface Story {
  id: string;
  titleEN: string;
  titleSV: string;
  titleBG: string;
  titleTN: string;
  titleNL: string;
  titleEL: string;
  titleRU: string;
  titleUK: string;
  titleIT: string;
  titlePL: string;
  level: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  previewEN: string;
  previewSV: string;
  previewBG: string;
  previewTN: string;
  previewNL: string;
  previewEL: string;
  previewRU: string;
  previewUK: string;
  previewIT: string;
  previewPL: string;
}

const stories: Story[] = [
  {
    id: "morning",
    titleEN: "Good Morning",
    titleSV: "God morgon",
    titleBG: "Добро утро",
    titleTN: "صباح الخير",
    titleNL: "Goedemorgen",
    titleEL: "Καλημέρα",
    titleRU: "Доброе утро",
    titleUK: "Добрий ранок",
    titleIT: "Buongiorno",
    titlePL: "Dzień dobry",
    level: "beginner",
    xpReward: 15,
    previewEN: "A simple story about morning routines...",
    previewSV: "En enkel berättelse om morgonrutiner...",
    previewBG: "Проста история за сутрешни рутини...",
    previewTN: "قصة بسيطة على روتين الصباح...",
    previewNL: "Een eenvoudig verhaal over ochtendroutines...",
    previewEL: "Μια απλή ιστορία για πρωινές ρουτίνες...",
    previewRU: "Простая история об утренних привычках...",
    previewUK: "Проста історія про ранкові звички...",
    previewIT: "Una semplice storia sulle routine mattutine...",
    previewPL: "Prosta historia o porannych zwyczajach...",
  },
  {
    id: "market",
    titleEN: "At the Market",
    titleSV: "På marknaden",
    titleBG: "На пазара",
    titleTN: "في السوق",
    titleNL: "Op de markt",
    titleEL: "Στην αγορά",
    titleRU: "На рынке",
    titleUK: "На ринку",
    titleIT: "Al mercato",
    titlePL: "Na targu",
    level: "beginner",
    xpReward: 15,
    previewEN: "Shopping for fresh apples...",
    previewSV: "Handla färska äpplen...",
    previewBG: "Пазаруване на пресни ябълки...",
    previewTN: "نشري تفاح فريش...",
    previewNL: "Verse appels kopen...",
    previewEL: "Αγοράζοντας φρέσκα μήλα...",
    previewRU: "Покупаем свежие яблоки...",
    previewUK: "Купуємо свіжі яблука...",
    previewIT: "Comprare mele fresche...",
    previewPL: "Kupowanie świeżych jabłek...",
  },
  {
    id: "family",
    titleEN: "My Family",
    titleSV: "Min familj",
    titleBG: "Моето семейство",
    titleTN: "عايلتي",
    titleNL: "Mijn familie",
    titleEL: "Η οικογένειά μου",
    titleRU: "Моя семья",
    titleUK: "Моя родина",
    titleIT: "La mia famiglia",
    titlePL: "Moja rodzina",
    level: "beginner",
    xpReward: 15,
    previewEN: "Learn about family members...",
    previewSV: "Lär dig om familjemedlemmar...",
    previewBG: "Научете за членовете на семейството...",
    previewTN: "تعلّم على أفراد العايلة...",
    previewNL: "Leer over familieleden...",
    previewEL: "Μάθε για τα μέλη της οικογένειας...",
    previewRU: "Узнайте о членах семьи...",
    previewUK: "Дізнайтесь про членів родини...",
    previewIT: "Impara sui membri della famiglia...",
    previewPL: "Poznaj członków rodziny...",
  },
  {
    id: "weather",
    titleEN: "The Weather",
    titleSV: "Vädret",
    titleBG: "Времето",
    titleTN: "الطقس",
    titleNL: "Het weer",
    titleEL: "Ο καιρός",
    titleRU: "Погода",
    titleUK: "Погода",
    titleIT: "Il meteo",
    titlePL: "Pogoda",
    level: "beginner",
    xpReward: 15,
    previewEN: "A sunny day outside...",
    previewSV: "En solig dag utomhus...",
    previewBG: "Слънчев ден навън...",
    previewTN: "نهار شمس برّا...",
    previewNL: "Een zonnige dag buiten...",
    previewEL: "Μια ηλιόλουστη μέρα έξω...",
    previewRU: "Солнечный день на улице...",
    previewUK: "Сонячний день надворі...",
    previewIT: "Una giornata di sole fuori...",
    previewPL: "Słoneczny dzień na zewnątrz...",
  },
];

const levelLabels: Record<string, { beginner: string; intermediate: string; advanced: string }> = {
  english: { beginner: "beginner", intermediate: "intermediate", advanced: "advanced" },
  swedish: { beginner: "nybörjare", intermediate: "medel", advanced: "avancerad" },
  bulgarian: { beginner: "начинаещ", intermediate: "средно", advanced: "напреднал" },
  tunisian: { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" },
  dutch: { beginner: "beginner", intermediate: "gemiddeld", advanced: "gevorderd" },
  greek: { beginner: "αρχάριος", intermediate: "μεσαίος", advanced: "προχωρημένος" },
  russian: { beginner: "начинающий", intermediate: "средний", advanced: "продвинутый" },
  ukrainian: { beginner: "початківець", intermediate: "середній", advanced: "просунутий" },
  italian: { beginner: "principiante", intermediate: "intermedio", advanced: "avanzato" },
  polish: { beginner: "początkujący", intermediate: "średni", advanced: "zaawansowany" },
};

const levelColors = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/30",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  advanced: "bg-red-500/10 text-red-600 border-red-500/30",
};

export const ShortStories = () => {
  const navigate = useNavigate();
  const { uiLanguage } = useLanguageMode();
  const t = getTranslations(uiLanguage);

  const getTitle = (story: Story) => {
    if (uiLanguage === 'swedish') return story.titleSV;
    if (uiLanguage === 'bulgarian') return story.titleBG;
    if (uiLanguage === 'tunisian') return story.titleTN;
    if (uiLanguage === 'dutch') return story.titleNL;
    if (uiLanguage === 'greek') return story.titleEL;
    if (uiLanguage === 'russian') return story.titleRU;
    if (uiLanguage === 'ukrainian') return story.titleUK;
    if (uiLanguage === 'italian') return story.titleIT;
    if (uiLanguage === 'polish') return story.titlePL;
    return story.titleEN;
  };

  const getPreview = (story: Story) => {
    if (uiLanguage === 'swedish') return story.previewSV;
    if (uiLanguage === 'bulgarian') return story.previewBG;
    if (uiLanguage === 'tunisian') return story.previewTN;
    if (uiLanguage === 'dutch') return story.previewNL;
    if (uiLanguage === 'greek') return story.previewEL;
    if (uiLanguage === 'russian') return story.previewRU;
    if (uiLanguage === 'ukrainian') return story.previewUK;
    if (uiLanguage === 'italian') return story.previewIT;
    if (uiLanguage === 'polish') return story.previewPL;
    return story.previewEN;
  };

  const getLevelLabel = (level: "beginner" | "intermediate" | "advanced") => {
    return levelLabels[uiLanguage][level];
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{t.shortStories}</CardTitle>
          </div>
          <ShpokoMascot size="xs" />
        </div>
        <p className="text-sm text-muted-foreground">
          {t.readStoriesDescription}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {stories.slice(0, 3).map((story) => (
          <div
            key={story.id}
            onClick={() => navigate(`/stories/${story.id}`)}
            className="p-3 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{getTitle(story)}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={levelColors[story.level]}>
                  {getLevelLabel(story.level)}
                </Badge>
                <Badge className="bg-primary/10 text-primary border-0">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {story.xpReward} XP
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{getPreview(story)}</p>
          </div>
        ))}

        <Button 
          onClick={() => navigate("/stories")} 
          className="w-full gap-2"
          variant="outline"
        >
          <Sparkles className="w-4 h-4" />
          {t.viewAllStories}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
