import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  Star,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  BookMarked,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useUserProgress } from "@/hooks/useUserProgress";
import { PageTransition, AnimatedItem } from "@/components/PageTransition";
import { useTextToSpeechCached } from "@/hooks/useTextToSpeechCached";

interface StoryParagraph {
  bulgarian: string;
  romanized: string;
  english: string;
}

interface ChildrenStory {
  id: string;
  title: string;
  titleRomanized: string;
  titleEnglish: string;
  author?: string;
  level: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  paragraphs: StoryParagraph[];
  moral?: string;
  moralEnglish?: string;
}

// Children's stories data
const childrenStories: ChildrenStory[] = [
  {
    id: "drebnoto-choveche",
    title: "Дребното човече",
    titleRomanized: "Drebnoto choveche",
    titleEnglish: "The Little Person",
    level: "beginner",
    xpReward: 25,
    paragraphs: [
      {
        bulgarian: "Живяло едно време едно дребно човече.",
        romanized: "Zhivyalo edno vreme edno drebno choveche.",
        english: "Once upon a time there lived a little person.",
      },
      {
        bulgarian: "То било толкова малко, че можело да се скрие под една гъба.",
        romanized: "To bilo tolkova malko, che mozhelo da se skrie pod edna gaba.",
        english: "It was so small that it could hide under a mushroom.",
      },
      {
        bulgarian: "Един ден дребното човече тръгнало на път.",
        romanized: "Edin den drebnoto choveche tragnalo na pat.",
        english: "One day the little person set off on a journey.",
      },
      {
        bulgarian: "По пътя срещнало едно голямо куче.",
        romanized: "Po patya sreshtnalo edno golyamo kuche.",
        english: "On the way it met a big dog.",
      },
      {
        bulgarian: "\"Къде отиваш?\" попитало кучето.",
        romanized: "\"Kade otivash?\" popitalo kucheto.",
        english: "\"Where are you going?\" asked the dog.",
      },
      {
        bulgarian: "\"Отивам да търся приятели,\" отговорило човечето.",
        romanized: "\"Otivam da tarsya priyateli,\" otgovorilo chovecheto.",
        english: "\"I'm going to look for friends,\" replied the little person.",
      },
      {
        bulgarian: "\"Мога ли да дойда с теб?\" попитало кучето.",
        romanized: "\"Moga li da doida s teb?\" popitalo kucheto.",
        english: "\"Can I come with you?\" asked the dog.",
      },
      {
        bulgarian: "\"Разбира се!\" казало човечето щастливо.",
        romanized: "\"Razbira se!\" kazalo chovecheto shtastlivo.",
        english: "\"Of course!\" said the little person happily.",
      },
      {
        bulgarian: "И така двамата станали най-добри приятели.",
        romanized: "I taka dvamata stanali nay-dobri priyateli.",
        english: "And so the two became best friends.",
      },
    ],
    moral: "Приятелите се намират по най-неочакваните начини.",
    moralEnglish: "Friends are found in the most unexpected ways.",
  },
  {
    id: "zlatnata-ribka",
    title: "Златната рибка",
    titleRomanized: "Zlatnata ribka",
    titleEnglish: "The Golden Fish",
    level: "beginner",
    xpReward: 25,
    paragraphs: [
      {
        bulgarian: "Един беден рибар живеел край морето.",
        romanized: "Edin beden ribar zhiveel kray moreto.",
        english: "A poor fisherman lived by the sea.",
      },
      {
        bulgarian: "Всеки ден той ходел да лови риба.",
        romanized: "Vseki den toy hodel da lovi riba.",
        english: "Every day he went fishing.",
      },
      {
        bulgarian: "Веднъж той хванал една златна рибка.",
        romanized: "Vednaazh toy hvanal edna zlatna ribka.",
        english: "Once he caught a golden fish.",
      },
      {
        bulgarian: "\"Моля те, пусни ме!\" казала рибката.",
        romanized: "\"Molya te, pusni me!\" kazala ribkata.",
        english: "\"Please let me go!\" said the fish.",
      },
      {
        bulgarian: "\"Ще изпълня три твои желания.\"",
        romanized: "\"Shte izpalnya tri tvoi zhelaniya.\"",
        english: "\"I will grant you three wishes.\"",
      },
      {
        bulgarian: "Рибарят помислил и казал: \"Искам само да бъда щастлив.\"",
        romanized: "Ribaryat pomislil i kazal: \"Iskam samo da bada shtastliv.\"",
        english: "The fisherman thought and said: \"I just want to be happy.\"",
      },
      {
        bulgarian: "Рибката се усмихнала: \"Това вече го имаш.\"",
        romanized: "Ribkata se usmihnala: \"Tova veche go imash.\"",
        english: "The fish smiled: \"You already have that.\"",
      },
      {
        bulgarian: "И рибарят разбрал, че щастието е в простите неща.",
        romanized: "I ribaryat razbral, che shtastieto e v prostite neshta.",
        english: "And the fisherman understood that happiness is in simple things.",
      },
    ],
    moral: "Щастието не се купува с пари.",
    moralEnglish: "Happiness cannot be bought with money.",
  },
  {
    id: "trima-bratya",
    title: "Тримата братя",
    titleRomanized: "Trimata bratya",
    titleEnglish: "The Three Brothers",
    level: "intermediate",
    xpReward: 35,
    paragraphs: [
      {
        bulgarian: "В едно село живели трима братя.",
        romanized: "V edno selo zhiveli trima bratya.",
        english: "In a village lived three brothers.",
      },
      {
        bulgarian: "Най-големият бил силен, средният - умен, а най-малкият - добър.",
        romanized: "Nay-golemiyat bil silen, sredniyat - umen, a nay-malkiyat - dobar.",
        english: "The oldest was strong, the middle one - smart, and the youngest - kind.",
      },
      {
        bulgarian: "Един ден баща им ги повикал и казал:",
        romanized: "Edin den bashta im gi povikal i kazal:",
        english: "One day their father called them and said:",
      },
      {
        bulgarian: "\"Искам да намерите най-ценното нещо на света.\"",
        romanized: "\"Iskam da namerite nay-tsennoto neshto na sveta.\"",
        english: "\"I want you to find the most valuable thing in the world.\"",
      },
      {
        bulgarian: "Първият брат донесъл злато.",
        romanized: "Parviyat brat donesal zlato.",
        english: "The first brother brought gold.",
      },
      {
        bulgarian: "Вторият донесъл книги пълни с мъдрост.",
        romanized: "Vtoriyat donesal knigi palni s madrost.",
        english: "The second brought books full of wisdom.",
      },
      {
        bulgarian: "Третият се върнал с празни ръце, но с много приятели.",
        romanized: "Tretiyat se varnal s prazni ratse, no s mnogo priyateli.",
        english: "The third returned with empty hands, but with many friends.",
      },
      {
        bulgarian: "\"Ти победи,\" казал бащата на най-малкия.",
        romanized: "\"Ti pobedi,\" kazal bashtata na nay-malkiya.",
        english: "\"You win,\" said the father to the youngest.",
      },
      {
        bulgarian: "\"Защото приятелството е най-голямото богатство.\"",
        romanized: "\"Zashtoto priyatelstvoto e nay-golyamoto bogatstvo.\"",
        english: "\"Because friendship is the greatest wealth.\"",
      },
    ],
    moral: "Приятелството е по-ценно от златото.",
    moralEnglish: "Friendship is more valuable than gold.",
  },
  {
    id: "lisitsata-i-grozdeto",
    title: "Лисицата и гроздето",
    titleRomanized: "Lisitsata i grozdeto",
    titleEnglish: "The Fox and the Grapes",
    level: "beginner",
    xpReward: 20,
    paragraphs: [
      {
        bulgarian: "Една лисица видяла грозде на висока лоза.",
        romanized: "Edna lisitsa vidyala grozde na visoka loza.",
        english: "A fox saw grapes on a high vine.",
      },
      {
        bulgarian: "Гроздето изглеждало много вкусно.",
        romanized: "Grozdeto izglejdalo mnogo vkusno.",
        english: "The grapes looked very delicious.",
      },
      {
        bulgarian: "Лисицата скочила, но не можала да ги достигне.",
        romanized: "Lisitsata skochila, no ne mozhala da gi dostiigne.",
        english: "The fox jumped, but couldn't reach them.",
      },
      {
        bulgarian: "Скочила пак и пак, но без успех.",
        romanized: "Skochila pak i pak, no bez uspeh.",
        english: "She jumped again and again, but without success.",
      },
      {
        bulgarian: "Накрая лисицата казала: \"Това грозде е кисело!\"",
        romanized: "Nakraya lisitsata kazala: \"Tova grozde e kiselo!\"",
        english: "Finally the fox said: \"Those grapes are sour!\"",
      },
      {
        bulgarian: "И си тръгнала с вдигната глава.",
        romanized: "I si tragnala s vdignata glava.",
        english: "And she left with her head held high.",
      },
    ],
    moral: "Лесно е да се омаловажи това, което не можем да имаме.",
    moralEnglish: "It's easy to despise what we cannot have.",
  },
];

const levelColors = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/30",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  advanced: "bg-red-500/10 text-red-600 border-red-500/30",
};

const ChildrenStories = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const { profile, user, updateXP } = useAuth();
  const { toast } = useToast();
  const { isLessonCompleted, refetch: refetchProgress } = useUserProgress();
  const { playPronunciation: speak } = useTextToSpeechCached();

  const [selectedStory, setSelectedStory] = useState<ChildrenStory | null>(null);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showRomanization, setShowRomanization] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load story from URL
  useState(() => {
    if (storyId) {
      const story = childrenStories.find(s => s.id === storyId);
      if (story) {
        setSelectedStory(story);
        setCurrentParagraphIndex(0);
        setIsCompleted(false);
      }
    }
  });

  const handleStorySelect = (story: ChildrenStory) => {
    navigate(`/children-stories/${story.id}`);
    setSelectedStory(story);
    setCurrentParagraphIndex(0);
    setIsCompleted(false);
  };

  const handlePlayParagraph = () => {
    if (!selectedStory) return;
    const paragraph = selectedStory.paragraphs[currentParagraphIndex];
    speak(paragraph.bulgarian);
  };

  const handleNextParagraph = () => {
    if (selectedStory && currentParagraphIndex < selectedStory.paragraphs.length - 1) {
      setCurrentParagraphIndex(prev => prev + 1);
    }
  };

  const handlePrevParagraph = () => {
    if (currentParagraphIndex > 0) {
      setCurrentParagraphIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!selectedStory || !user) return;

    const storyLessonId = `children-story-${selectedStory.id}`;
    const alreadyCompleted = isLessonCompleted(storyLessonId);
    const earnedXP = alreadyCompleted ? 0 : selectedStory.xpReward;

    if (earnedXP > 0) {
      await updateXP(earnedXP);
    }

    await supabase.from("user_progress").upsert({
      user_id: user.id,
      lesson_id: storyLessonId,
      completed: true,
      score: earnedXP,
      correct_answers: selectedStory.paragraphs.length,
      total_answers: selectedStory.paragraphs.length,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });

    refetchProgress();
    setIsCompleted(true);

    toast({
      title: "Приказката завърши! 🎉",
      description: earnedXP > 0 
        ? `Спечелихте ${earnedXP} XP!` 
        : "Вече сте прочели тази приказка.",
    });
  };

  const handleBackToList = () => {
    setSelectedStory(null);
    setCurrentParagraphIndex(0);
    setIsCompleted(false);
    navigate("/children-stories");
  };

  // Keyboard shortcuts
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedStory || isCompleted) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowRight":
        case "n":
          e.preventDefault();
          handleNextParagraph();
          break;
        case "ArrowLeft":
        case "p":
          e.preventDefault();
          handlePrevParagraph();
          break;
        case " ":
          e.preventDefault();
          handlePlayParagraph();
          break;
        case "Escape":
          e.preventDefault();
          handleBackToList();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Story list view
  if (!selectedStory) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <BookMarked className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Български приказки</h1>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              Четете български детски приказки и учете нови думи!
            </p>

            {/* Story Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {childrenStories.map((story, idx) => {
                const storyLessonId = `children-story-${story.id}`;
                const completed = isLessonCompleted(storyLessonId);

                return (
                  <AnimatedItem key={story.id} delay={idx * 0.05}>
                    <Card
                      onClick={() => handleStorySelect(story)}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:border-primary hover:shadow-lg",
                        completed && "border-green-500/50 bg-green-500/5"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{story.title}</h3>
                          <p className="text-sm text-muted-foreground">{story.titleRomanized}</p>
                          <p className="text-xs text-muted-foreground italic">{story.titleEnglish}</p>
                        </div>
                        {completed && (
                          <div className="bg-green-500 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className={levelColors[story.level]}>
                          {story.level}
                        </Badge>
                        <Badge className="bg-primary/10 text-primary border-0">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          {story.xpReward} XP
                        </Badge>
                        <Badge variant="outline">
                          {story.paragraphs.length} параграфа
                        </Badge>
                      </div>
                    </Card>
                  </AnimatedItem>
                );
              })}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Story reading view
  const currentParagraph = selectedStory.paragraphs[currentParagraphIndex];
  const progress = ((currentParagraphIndex + 1) / selectedStory.paragraphs.length) * 100;
  const isLastParagraph = currentParagraphIndex === selectedStory.paragraphs.length - 1;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h2 className="font-bold">{selectedStory.title}</h2>
              <p className="text-xs text-muted-foreground">{selectedStory.titleEnglish}</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-0">
              {currentParagraphIndex + 1} / {selectedStory.paragraphs.length}
            </Badge>
          </div>

          {/* Progress */}
          <Progress value={progress} className="h-2 mb-6" />

          {/* Main Content */}
          {!isCompleted ? (
            <Card className="p-6 mb-6">
              {/* Bulgarian text */}
              <div className="text-center mb-6">
                <p className="text-2xl font-medium leading-relaxed mb-3">
                  {currentParagraph.bulgarian}
                </p>
                
                {showRomanization && (
                  <p className="text-lg text-muted-foreground italic mb-2">
                    {currentParagraph.romanized}
                  </p>
                )}

                {showTranslation && (
                  <p className="text-base text-muted-foreground">
                    {currentParagraph.english}
                  </p>
                )}
              </div>

              {/* Audio button */}
              <div className="flex justify-center mb-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePlayParagraph}
                  className="gap-2"
                >
                  <Volume2 className="w-5 h-5" />
                  Слушай
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handlePrevParagraph}
                  disabled={currentParagraphIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Назад
                </Button>

                {isLastParagraph ? (
                  <Button onClick={handleComplete} className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Завърши
                  </Button>
                ) : (
                  <Button onClick={handleNextParagraph}>
                    Напред
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            /* Completion screen */
            <Card className="p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Браво!</h2>
              <p className="text-muted-foreground mb-4">
                Прочетохте "{selectedStory.title}"
              </p>

              {selectedStory.moral && (
                <div className="bg-primary/5 rounded-lg p-4 mb-6">
                  <p className="font-medium text-primary mb-1">Поука:</p>
                  <p className="italic">{selectedStory.moral}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedStory.moralEnglish}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleBackToList}>
                  Всички приказки
                </Button>
                <Button
                  onClick={() => {
                    setCurrentParagraphIndex(0);
                    setIsCompleted(false);
                  }}
                >
                  Прочети отново
                </Button>
              </div>
            </Card>
          )}

          {/* Keyboard shortcuts hint */}
          {!isCompleted && (
            <div className="text-center text-xs text-muted-foreground mt-4">
              <span className="inline-flex items-center gap-4">
                <span>← → навигация</span>
                <span>Space аудио</span>
                <span>Esc изход</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ChildrenStories;
