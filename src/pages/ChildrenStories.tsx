import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Star,
  Check,
  BookMarked,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useUserProgress } from "@/hooks/useUserProgress";
import { PageTransition, AnimatedItem } from "@/components/PageTransition";
import { LingqWord } from "@/components/lingq/LingqWord";
import { useLingqVocabulary } from "@/hooks/useLingqVocabulary";

interface StoryPart {
  id: string;
  title: string;
  titleEnglish: string;
  sentences: {
    bulgarian: string;
    english: string;
    wordTranslations: Record<string, { translation: string; romanization?: string }>;
  }[];
}

interface ChildrenStory {
  id: string;
  title: string;
  titleRomanized: string;
  titleEnglish: string;
  level: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  parts: StoryPart[];
  moral?: string;
  moralEnglish?: string;
}

// Story data - simplified with proper escaping
const childrenStories: ChildrenStory[] = [
  {
    id: "drebnoto-choveche",
    title: "Дребното човече",
    titleRomanized: "Drebnoto choveche",
    titleEnglish: "The Little Person",
    level: "intermediate",
    xpReward: 50,
    parts: [
      {
        id: "1-1",
        title: "В кръчмата",
        titleEnglish: "At the Tavern",
        sentences: [
          {
            bulgarian: "Живяло едно време един твърде дребничък господин.",
            english: "Once upon a time there lived a very small gentleman.",
            wordTranslations: {
              "Живяло": { translation: "lived", romanization: "zhivyalo" },
              "едно": { translation: "one", romanization: "edno" },
              "време": { translation: "time", romanization: "vreme" },
              "един": { translation: "a/one", romanization: "edin" },
              "твърде": { translation: "very", romanization: "tvarde" },
              "дребничък": { translation: "tiny/small", romanization: "drebnichak" },
              "господин": { translation: "gentleman", romanization: "gospodin" },
            }
          },
          {
            bulgarian: "Щом седнел в кръчмата да пийне чаша вино или халба бира, чувал все едно и също от кръчмаря.",
            english: "Whenever he sat in the tavern to drink a glass of wine or a mug of beer, he heard the same thing from the innkeeper.",
            wordTranslations: {
              "Щом": { translation: "whenever", romanization: "shtom" },
              "седнел": { translation: "sat down", romanization: "sednel" },
              "кръчмата": { translation: "the tavern", romanization: "krachmata" },
              "пийне": { translation: "drink", romanization: "piyne" },
              "чаша": { translation: "glass", romanization: "chasha" },
              "вино": { translation: "wine", romanization: "vino" },
              "или": { translation: "or", romanization: "ili" },
              "халба": { translation: "mug", romanization: "halba" },
              "бира": { translation: "beer", romanization: "bira" },
              "чувал": { translation: "heard", romanization: "chuval" },
              "кръчмаря": { translation: "the innkeeper", romanization: "krachmarya" },
            }
          },
          {
            bulgarian: "Добре дошло, дребно човече!",
            english: "Welcome, little person!",
            wordTranslations: {
              "Добре": { translation: "well/good", romanization: "dobre" },
              "дошло": { translation: "come", romanization: "doshlo" },
              "дребно": { translation: "little/small", romanization: "drebno" },
              "човече": { translation: "person", romanization: "choveche" },
            }
          },
          {
            bulgarian: "Ах, тези думи така го ядосвали!",
            english: "Ah, these words made him so angry!",
            wordTranslations: {
              "Ах": { translation: "Ah", romanization: "ah" },
              "тези": { translation: "these", romanization: "tezi" },
              "думи": { translation: "words", romanization: "dumi" },
              "така": { translation: "so", romanization: "taka" },
              "го": { translation: "him", romanization: "go" },
              "ядосвали": { translation: "angered", romanization: "yadosvali" },
            }
          },
        ]
      },
      {
        id: "1-2",
        title: "При обущаря",
        titleEnglish: "At the Shoemaker",
        sentences: [
          {
            bulgarian: "Една сутрин дребосъкът отишъл при обущаря.",
            english: "One morning the little man went to the shoemaker.",
            wordTranslations: {
              "Една": { translation: "one", romanization: "edna" },
              "сутрин": { translation: "morning", romanization: "sutrin" },
              "дребосъкът": { translation: "the little man", romanization: "drebosakat" },
              "отишъл": { translation: "went", romanization: "otishal" },
              "при": { translation: "to/at", romanization: "pri" },
              "обущаря": { translation: "the shoemaker", romanization: "obushtarya" },
            }
          },
          {
            bulgarian: "Майсторе, искам да ми направиш колкото се може по-високи токове.",
            english: "Master, I want you to make me the highest heels possible.",
            wordTranslations: {
              "Майсторе": { translation: "Master", romanization: "maystora" },
              "искам": { translation: "I want", romanization: "iskam" },
              "ми": { translation: "me", romanization: "mi" },
              "направиш": { translation: "make", romanization: "napravish" },
              "колкото": { translation: "as much as", romanization: "kolkoto" },
              "може": { translation: "possible", romanization: "mozhe" },
              "по-високи": { translation: "higher", romanization: "po-visoki" },
              "токове": { translation: "heels", romanization: "tokove" },
            }
          },
          {
            bulgarian: "Искам да спрат да ми викат дребно човече. Това ме ядосва ужасно.",
            english: "I want them to stop calling me little person. This makes me terribly angry.",
            wordTranslations: {
              "Искам": { translation: "I want", romanization: "iskam" },
              "спрат": { translation: "stop", romanization: "sprat" },
              "викат": { translation: "call", romanization: "vikat" },
              "Това": { translation: "this", romanization: "tova" },
              "ме": { translation: "me", romanization: "me" },
              "ядосва": { translation: "angers", romanization: "yadosva" },
              "ужасно": { translation: "terribly", romanization: "uzhasno" },
            }
          },
        ]
      },
      {
        id: "1-3",
        title: "Отново в кръчмата",
        titleEnglish: "Back at the Tavern",
        sentences: [
          {
            bulgarian: "Обущарят запретнал ръкави и се захванал за работа.",
            english: "The shoemaker rolled up his sleeves and got to work.",
            wordTranslations: {
              "Обущарят": { translation: "the shoemaker", romanization: "obushtaryat" },
              "запретнал": { translation: "rolled up", romanization: "zapretnal" },
              "ръкави": { translation: "sleeves", romanization: "rakavi" },
              "захванал": { translation: "got to", romanization: "zahvanal" },
              "работа": { translation: "work", romanization: "rabota" },
            }
          },
          {
            bulgarian: "Дребосъкът платил и отишъл в кръчмата.",
            english: "The little man paid and went to the tavern.",
            wordTranslations: {
              "платил": { translation: "paid", romanization: "platil" },
              "отишъл": { translation: "went", romanization: "otishal" },
            }
          },
          {
            bulgarian: "Домакинът веднага го забелязал и се провикнал: Добре дошло, дребно човече!",
            english: "The host immediately noticed him and called out: Welcome, little person!",
            wordTranslations: {
              "Домакинът": { translation: "the host", romanization: "domakinat" },
              "веднага": { translation: "immediately", romanization: "vednaga" },
              "забелязал": { translation: "noticed", romanization: "zabelyazal" },
              "провикнал": { translation: "called out", romanization: "proviknal" },
            }
          },
          {
            bulgarian: "Високите токове не помогнали. Дребосъкът хукнал при шапкаря.",
            english: "The high heels didn't help. The little man rushed to the hatter.",
            wordTranslations: {
              "Високите": { translation: "the high", romanization: "visokite" },
              "помогнали": { translation: "helped", romanization: "pomognali" },
              "хукнал": { translation: "rushed", romanization: "huknal" },
              "шапкаря": { translation: "the hatter", romanization: "shapkarya" },
            }
          },
        ]
      },
      {
        id: "1-4",
        title: "Пътуването до Рим",
        titleEnglish: "The Journey to Rome",
        sentences: [
          {
            bulgarian: "Нито високите токове, нито огромната шапка помогнали.",
            english: "Neither the high heels nor the huge hat helped.",
            wordTranslations: {
              "Нито": { translation: "neither", romanization: "nito" },
              "огромната": { translation: "the huge", romanization: "ogromnata" },
              "шапка": { translation: "hat", romanization: "shapka" },
            }
          },
          {
            bulgarian: "Дребосъкът решил да отиде в Рим и да попита папата.",
            english: "The little man decided to go to Rome and ask the Pope.",
            wordTranslations: {
              "решил": { translation: "decided", romanization: "reshil" },
              "отиде": { translation: "go", romanization: "otide" },
              "Рим": { translation: "Rome", romanization: "Rim" },
              "попита": { translation: "ask", romanization: "popita" },
              "папата": { translation: "the Pope", romanization: "papata" },
            }
          },
          {
            bulgarian: "По пътя срещнал ханджия и прислужник, които също имали въпроси.",
            english: "On the way he met an innkeeper and a servant who also had questions.",
            wordTranslations: {
              "пътя": { translation: "the way", romanization: "patya" },
              "срещнал": { translation: "met", romanization: "sreshnal" },
              "ханджия": { translation: "innkeeper", romanization: "handzhiya" },
              "прислужник": { translation: "servant", romanization: "prislujnik" },
              "също": { translation: "also", romanization: "sashto" },
              "имали": { translation: "had", romanization: "imali" },
              "въпроси": { translation: "questions", romanization: "vaprosi" },
            }
          },
        ]
      },
      {
        id: "1-5",
        title: "При папата",
        titleEnglish: "At the Pope",
        sentences: [
          {
            bulgarian: "Тримата пристигнали в Рим и помолили за аудиенция с папата.",
            english: "The three arrived in Rome and asked for an audience with the Pope.",
            wordTranslations: {
              "Тримата": { translation: "the three", romanization: "trimata" },
              "пристигнали": { translation: "arrived", romanization: "pristignali" },
              "помолили": { translation: "asked for", romanization: "pomolili" },
              "аудиенция": { translation: "audience", romanization: "audientsiya" },
            }
          },
          {
            bulgarian: "Папата ги поканил в красива зала с огромно огледало.",
            english: "The Pope invited them into a beautiful hall with a huge mirror.",
            wordTranslations: {
              "Папата": { translation: "the Pope", romanization: "papata" },
              "поканил": { translation: "invited", romanization: "pokanil" },
              "красива": { translation: "beautiful", romanization: "krasiva" },
              "зала": { translation: "hall", romanization: "zala" },
              "огледало": { translation: "mirror", romanization: "ogledalo" },
            }
          },
          {
            bulgarian: "Всеки трябвало да погледне в огледалото и да каже какво вижда.",
            english: "Each one had to look in the mirror and say what they saw.",
            wordTranslations: {
              "Всеки": { translation: "each one", romanization: "vseki" },
              "трябвало": { translation: "had to", romanization: "tryabvalo" },
              "погледне": { translation: "look", romanization: "pogledne" },
              "каже": { translation: "say", romanization: "kazhe" },
              "вижда": { translation: "sees", romanization: "vizhda" },
            }
          },
        ]
      },
      {
        id: "1-6",
        title: "Поуката",
        titleEnglish: "The Moral",
        sentences: [
          {
            bulgarian: "Папата казал на дребосъка: Трябва да се мериш според ръста си.",
            english: "The Pope told the little man: You must measure yourself by your own height.",
            wordTranslations: {
              "казал": { translation: "told", romanization: "kazal" },
              "Трябва": { translation: "must", romanization: "tryabva" },
              "мериш": { translation: "measure", romanization: "merish" },
              "според": { translation: "according to", romanization: "spored" },
              "ръста": { translation: "height", romanization: "rasta" },
            }
          },
          {
            bulgarian: "Едва когато израстеш достатъчно, хората ще спрат да те наричат дребно човече.",
            english: "Only when you grow enough will people stop calling you little person.",
            wordTranslations: {
              "Едва": { translation: "only", romanization: "edva" },
              "когато": { translation: "when", romanization: "kogato" },
              "израстеш": { translation: "grow", romanization: "izrastesh" },
              "достатъчно": { translation: "enough", romanization: "dostatachno" },
              "хората": { translation: "people", romanization: "horata" },
              "наричат": { translation: "call", romanization: "narichat" },
            }
          },
          {
            bulgarian: "Истинското величие идва от вътрешния растеж, не от външните атрибути.",
            english: "True greatness comes from inner growth, not from external attributes.",
            wordTranslations: {
              "Истинското": { translation: "true", romanization: "istinskoto" },
              "величие": { translation: "greatness", romanization: "velichie" },
              "идва": { translation: "comes", romanization: "idva" },
              "вътрешния": { translation: "inner", romanization: "vatreshniya" },
              "растеж": { translation: "growth", romanization: "rastezh" },
              "външните": { translation: "external", romanization: "vanshnite" },
              "атрибути": { translation: "attributes", romanization: "atributi" },
            }
          },
        ]
      },
    ],
    moral: "Истинското величие идва от вътрешния растеж, не от външните атрибути.",
    moralEnglish: "True greatness comes from inner growth, not from external attributes.",
  },
];

const levelColors = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/30",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  advanced: "bg-red-500/10 text-red-600 border-red-500/30",
};

const ChildrenStories = () => {
  const navigate = useNavigate();
  const { storyId, partId } = useParams();
  const { user, updateXP } = useAuth();
  const { toast } = useToast();
  const { isLessonCompleted, refetch: refetchProgress } = useUserProgress();
  const { vocabulary, saveWord, updateWordStatus, markAsKnown, deleteWord } = useLingqVocabulary();

  const [selectedStory, setSelectedStory] = useState<ChildrenStory | null>(null);
  const [selectedPart, setSelectedPart] = useState<StoryPart | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (storyId) {
      const story = childrenStories.find(s => s.id === storyId);
      if (story) {
        setSelectedStory(story);
        if (partId) {
          const part = story.parts.find(p => p.id === partId);
          if (part) setSelectedPart(part);
        } else {
          setSelectedPart(null);
        }
      }
    } else {
      setSelectedStory(null);
      setSelectedPart(null);
    }
  }, [storyId, partId]);

  const handleStorySelect = (story: ChildrenStory) => {
    navigate(`/children-stories/${story.id}`);
    setSelectedStory(story);
    setSelectedPart(null);
  };

  const handlePartSelect = (part: StoryPart) => {
    if (!selectedStory) return;
    navigate(`/children-stories/${selectedStory.id}/${part.id}`);
    setSelectedPart(part);
    setIsCompleted(false);
  };

  const handleComplete = async () => {
    if (!selectedStory || !selectedPart || !user) return;
    const partLessonId = `children-story-${selectedStory.id}-${selectedPart.id}`;
    const alreadyCompleted = isLessonCompleted(partLessonId);
    const earnedXP = alreadyCompleted ? 0 : Math.floor(selectedStory.xpReward / selectedStory.parts.length);

    if (earnedXP > 0) await updateXP(earnedXP);

    await supabase.from("user_progress").upsert({
      user_id: user.id,
      lesson_id: partLessonId,
      completed: true,
      score: earnedXP,
      correct_answers: selectedPart.sentences.length,
      total_answers: selectedPart.sentences.length,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });

    refetchProgress();
    setIsCompleted(true);
    toast({ title: "Частта е завършена! 🎉", description: earnedXP > 0 ? `+${earnedXP} XP` : "" });
  };

  const handleBackToList = () => {
    if (selectedPart) {
      setSelectedPart(null);
      if (selectedStory) navigate(`/children-stories/${selectedStory.id}`);
    } else {
      setSelectedStory(null);
      navigate("/children-stories");
    }
  };

  const handleWordSave = useCallback((word: string, translation: string, romanization?: string, notes?: string, status?: number) => {
    saveWord(word, translation, romanization, notes, status);
  }, [saveWord]);

  const renderWord = (word: string, translations: Record<string, { translation: string; romanization?: string }>) => {
    const cleanWord = word.replace(/[,.!?;:–—\-()]/g, "");
    const punctuation = word.match(/[,.!?;:–—\-()]+$/)?.[0] || "";
    const wordData = translations[cleanWord] || translations[cleanWord.toLowerCase()];
    const existingVocab = vocabulary.find(v => v.word.toLowerCase() === cleanWord.toLowerCase());
    
    if (!cleanWord.trim()) return word;
    
    return (
      <span key={word + Math.random()}>
        <LingqWord
          word={cleanWord}
          translation={wordData?.translation || ""}
          romanization={wordData?.romanization}
          existingVocab={existingVocab}
          onSave={handleWordSave}
          onUpdateStatus={updateWordStatus}
          onMarkKnown={markAsKnown}
          onDelete={deleteWord}
        />
        {punctuation}{" "}
      </span>
    );
  };

  // Story list view
  if (!selectedStory) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <BookMarked className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Български приказки</h1>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">Четете приказки с интерактивни преводи!</p>

            <div className="grid gap-4 md:grid-cols-2">
              {childrenStories.map((story, idx) => {
                const completedParts = story.parts.filter(part => isLessonCompleted(`children-story-${story.id}-${part.id}`)).length;
                const progress = (completedParts / story.parts.length) * 100;

                return (
                  <AnimatedItem key={story.id} delay={idx * 0.05}>
                    <Card onClick={() => handleStorySelect(story)} className={cn("p-4 cursor-pointer transition-all hover:border-primary", progress === 100 && "border-green-500/50 bg-green-500/5")}>
                      <h3 className="font-bold text-lg">{story.title}</h3>
                      <p className="text-sm text-muted-foreground">{story.titleEnglish}</p>
                      <Progress value={progress} className="h-2 my-3" />
                      <div className="flex gap-2">
                        <Badge variant="outline" className={levelColors[story.level]}>{story.level}</Badge>
                        <Badge className="bg-primary/10 text-primary"><Star className="w-3 h-3 mr-1" />{story.xpReward} XP</Badge>
                        <Badge variant="outline">{story.parts.length} части</Badge>
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

  // Parts list view
  if (!selectedPart) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={handleBackToList}><ArrowLeft className="w-5 h-5" /></Button>
              <div>
                <h1 className="text-2xl font-bold">{selectedStory.title}</h1>
                <p className="text-sm text-muted-foreground">{selectedStory.titleEnglish}</p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedStory.parts.map((part, idx) => {
                const completed = isLessonCompleted(`children-story-${selectedStory.id}-${part.id}`);
                return (
                  <AnimatedItem key={part.id} delay={idx * 0.03}>
                    <Card onClick={() => handlePartSelect(part)} className={cn("p-4 cursor-pointer hover:border-primary flex items-center justify-between", completed && "border-green-500/50 bg-green-500/5")}>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", completed ? "bg-green-500 text-white" : "bg-muted")}>
                          {completed ? <Check className="w-5 h-5" /> : idx + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{part.title}</h3>
                          <p className="text-sm text-muted-foreground">{part.titleEnglish}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Card>
                  </AnimatedItem>
                );
              })}
            </div>

            {selectedStory.moral && (
              <Card className="mt-6 p-4 bg-primary/5">
                <div className="flex items-center gap-2 mb-2"><BookOpen className="w-5 h-5 text-primary" /><h3 className="font-semibold">Поука</h3></div>
                <p>{selectedStory.moral}</p>
                <p className="text-sm text-muted-foreground italic mt-1">{selectedStory.moralEnglish}</p>
              </Card>
            )}
          </div>
        </div>
      </PageTransition>
    );
  }

  // Reading view
  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBackToList}><ArrowLeft className="w-5 h-5" /></Button>
            <div>
              <h1 className="text-xl font-bold">{selectedPart.title}</h1>
              <p className="text-sm text-muted-foreground">{selectedPart.titleEnglish}</p>
            </div>
          </div>

          <Card className="p-6 mb-6">
            <div className="space-y-8">
              {selectedPart.sentences.map((sentence, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="text-lg leading-relaxed">
                    {sentence.bulgarian.split(/\s+/).map((word) => renderWord(word, sentence.wordTranslations))}
                  </p>
                  <p className="text-sm text-muted-foreground italic">{sentence.english}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBackToList}><ArrowLeft className="w-4 h-4 mr-2" />Назад</Button>
            {!isCompleted ? (
              <Button onClick={handleComplete}><Check className="w-4 h-4 mr-2" />Завърши</Button>
            ) : (
              selectedStory.parts.findIndex(p => p.id === selectedPart.id) < selectedStory.parts.length - 1 && (
                <Button onClick={() => handlePartSelect(selectedStory.parts[selectedStory.parts.findIndex(p => p.id === selectedPart.id) + 1])}>
                  Следваща<ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )
            )}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">💡 Щракнете върху дума за превод</p>
        </div>
      </div>
    </PageTransition>
  );
};

export default ChildrenStories;