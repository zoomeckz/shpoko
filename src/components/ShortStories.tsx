import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookMarked, ChevronRight, Star, Sparkles } from "lucide-react";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { getTranslations } from "@/lib/translations";

interface Story {
  id: string;
  title: string;
  titleEnglish: string;
  level: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  preview: string;
  previewEnglish: string;
}

const stories: Story[] = [
  {
    id: "drebnoto-choveche",
    title: "Дребното човече",
    titleEnglish: "The Little Person",
    level: "beginner",
    xpReward: 25,
    preview: "Живяло едно време едно дребно човече...",
    previewEnglish: "Once upon a time there lived a little person...",
  },
  {
    id: "zlatnata-ribka",
    title: "Златната рибка",
    titleEnglish: "The Golden Fish",
    level: "beginner",
    xpReward: 25,
    preview: "Един беден рибар живеел край морето...",
    previewEnglish: "A poor fisherman lived by the sea...",
  },
  {
    id: "trima-bratya",
    title: "Тримата братя",
    titleEnglish: "The Three Brothers",
    level: "intermediate",
    xpReward: 35,
    preview: "В едно село живели трима братя...",
    previewEnglish: "In a village lived three brothers...",
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

  const getLevelLabel = (level: "beginner" | "intermediate" | "advanced") => {
    return levelLabels[uiLanguage]?.[level] || levelLabels.english[level];
  };

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-lg">Приказки</CardTitle>
          </div>
          <span className="text-xl">📚</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Read Bulgarian children's stories and learn new words!
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => navigate(`/stories/${story.id}`)}
            className="p-3 rounded-lg border bg-card hover:border-amber-500 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-medium">{story.title}</span>
                <p className="text-xs text-muted-foreground italic">{story.titleEnglish}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={levelColors[story.level]}>
                  {getLevelLabel(story.level)}
                </Badge>
                <Badge className="bg-amber-500/10 text-amber-600 border-0">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {story.xpReward} XP
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{story.preview}</p>
          </div>
        ))}

        <Button 
          onClick={() => navigate("/stories")} 
          className="w-full gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
          variant="outline"
        >
          <Sparkles className="w-4 h-4" />
          View All Stories
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
