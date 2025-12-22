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
  level: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  previewEN: string;
  previewSV: string;
  previewBG: string;
}

const stories: Story[] = [
  {
    id: "morning",
    titleEN: "Good Morning",
    titleSV: "God morgon",
    titleBG: "Добро утро",
    level: "beginner",
    xpReward: 15,
    previewEN: "A simple story about morning routines...",
    previewSV: "En enkel berättelse om morgonrutiner...",
    previewBG: "Проста история за сутрешни рутини...",
  },
  {
    id: "market",
    titleEN: "At the Market",
    titleSV: "På marknaden",
    titleBG: "На пазара",
    level: "beginner",
    xpReward: 15,
    previewEN: "Shopping for fresh apples...",
    previewSV: "Handla färska äpplen...",
    previewBG: "Пазаруване на пресни ябълки...",
  },
  {
    id: "family",
    titleEN: "My Family",
    titleSV: "Min familj",
    titleBG: "Моето семейство",
    level: "beginner",
    xpReward: 15,
    previewEN: "Learn about family members...",
    previewSV: "Lär dig om familjemedlemmar...",
    previewBG: "Научете за членовете на семейството...",
  },
  {
    id: "weather",
    titleEN: "The Weather",
    titleSV: "Vädret",
    titleBG: "Времето",
    level: "beginner",
    xpReward: 15,
    previewEN: "A sunny day outside...",
    previewSV: "En solig dag utomhus...",
    previewBG: "Слънчев ден навън...",
  },
];

const levelLabels = {
  english: { beginner: "beginner", intermediate: "intermediate", advanced: "advanced" },
  swedish: { beginner: "nybörjare", intermediate: "medel", advanced: "avancerad" },
  bulgarian: { beginner: "начинаещ", intermediate: "средно", advanced: "напреднал" },
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
    return story.titleEN;
  };

  const getPreview = (story: Story) => {
    if (uiLanguage === 'swedish') return story.previewSV;
    if (uiLanguage === 'bulgarian') return story.previewBG;
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
