import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Star,
  Settings,
  Volume2,
  Eye,
  EyeOff,
  List,
  AlignJustify,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Library,
  Brain,
  HelpCircle,
  Crown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useLingqVocabulary } from "@/hooks/useLingqVocabulary";
import { LingqWord } from "@/components/lingq/LingqWord";
import { StoryStats } from "@/components/lingq/StoryStats";
import { SentencePlayer } from "@/components/lingq/SentencePlayer";
import { VocabularyPanel } from "@/components/lingq/VocabularyPanel";
import { PageTransition, AnimatedItem } from "@/components/PageTransition";
import { useTextToSpeechCached } from "@/hooks/useTextToSpeechCached";
import { VocabLimitDialog } from "@/components/lingq/VocabLimitDialog";
import { ComprehensionQuiz } from "@/components/lingq/ComprehensionQuiz";
import { VocabularyReview } from "@/components/lingq/VocabularyReview";

interface Word {
  bulgarian: string;
  romanized: string;
  meaning: string;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Story {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  sentences: Word[][];
  questions: Question[];
  audio?: string;
}

// Story data with questions
const stories: Story[] = [
  // BEGINNER STORIES
  {
    id: "morning",
    title: "Good Morning",
    level: "beginner",
    xpReward: 15,
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
    questions: [
      { question: "What does the person drink in the morning?", options: ["Tea", "Coffee", "Water", "Juice"], correctIndex: 1 },
      { question: "Where does the person go?", options: ["School", "Home", "Work", "Market"], correctIndex: 2 },
    ],
  },
  {
    id: "market",
    title: "At the Market",
    level: "beginner",
    xpReward: 15,
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
    questions: [
      { question: "What fruit is bought at the market?", options: ["Oranges", "Bananas", "Apples", "Grapes"], correctIndex: 2 },
      { question: "What color are the apples?", options: ["Green", "Yellow", "Red", "Blue"], correctIndex: 2 },
    ],
  },
  {
    id: "family",
    title: "My Family",
    level: "beginner",
    xpReward: 15,
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
    questions: [
      { question: "How is the family described?", options: ["Small", "Big", "Happy", "Sad"], correctIndex: 1 },
      { question: "Who does the person have?", options: ["Two brothers", "Two sisters", "A brother and a sister", "No siblings"], correctIndex: 2 },
    ],
  },
  {
    id: "weather",
    title: "The Weather",
    level: "beginner",
    xpReward: 15,
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
    questions: [
      { question: "What is the weather like today?", options: ["Rainy", "Cloudy", "Sunny", "Snowy"], correctIndex: 2 },
      { question: "How does the person feel?", options: ["Sad", "Angry", "Tired", "Happy"], correctIndex: 3 },
    ],
  },
  // INTERMEDIATE STORIES
  {
    id: "restaurant",
    title: "At the Restaurant",
    level: "intermediate",
    xpReward: 25,
    sentences: [
      [
        { bulgarian: "Влизам", romanized: "Vlizam", meaning: "I enter" },
        { bulgarian: "в", romanized: "v", meaning: "in" },
        { bulgarian: "ресторанта.", romanized: "restoranta.", meaning: "the restaurant." },
      ],
      [
        { bulgarian: "Сядам", romanized: "Syadam", meaning: "I sit" },
        { bulgarian: "на", romanized: "na", meaning: "at" },
        { bulgarian: "маса", romanized: "masa", meaning: "a table" },
        { bulgarian: "до", romanized: "do", meaning: "near" },
        { bulgarian: "прозореца.", romanized: "prozoretsa.", meaning: "the window." },
      ],
      [
        { bulgarian: "Поръчвам", romanized: "Porachvam", meaning: "I order" },
        { bulgarian: "салата", romanized: "salata", meaning: "a salad" },
        { bulgarian: "и", romanized: "i", meaning: "and" },
        { bulgarian: "супа.", romanized: "supa.", meaning: "soup." },
      ],
      [
        { bulgarian: "Храната", romanized: "Hranata", meaning: "The food" },
        { bulgarian: "е", romanized: "e", meaning: "is" },
        { bulgarian: "много", romanized: "mnogo", meaning: "very" },
        { bulgarian: "вкусна.", romanized: "vkusna.", meaning: "delicious." },
      ],
    ],
    questions: [
      { question: "Where does the person sit?", options: ["Near the door", "Near the window", "At the bar", "Outside"], correctIndex: 1 },
      { question: "What does the person order?", options: ["Pizza and pasta", "Salad and soup", "Meat and rice", "Fish and chips"], correctIndex: 1 },
    ],
  },
  {
    id: "bus-ride",
    title: "The Bus Ride",
    level: "intermediate",
    xpReward: 25,
    sentences: [
      [
        { bulgarian: "Чакам", romanized: "Chakam", meaning: "I wait" },
        { bulgarian: "на", romanized: "na", meaning: "at" },
        { bulgarian: "спирката.", romanized: "spirkata.", meaning: "the bus stop." },
      ],
      [
        { bulgarian: "Автобусът", romanized: "Avtobusat", meaning: "The bus" },
        { bulgarian: "пристига", romanized: "pristiga", meaning: "arrives" },
        { bulgarian: "след", romanized: "sled", meaning: "after" },
        { bulgarian: "пет", romanized: "pet", meaning: "five" },
        { bulgarian: "минути.", romanized: "minuti.", meaning: "minutes." },
      ],
      [
        { bulgarian: "Качвам", romanized: "Kachvam", meaning: "I get on" },
        { bulgarian: "се", romanized: "se", meaning: "myself" },
        { bulgarian: "и", romanized: "i", meaning: "and" },
        { bulgarian: "плащам.", romanized: "plashtam.", meaning: "pay." },
      ],
      [
        { bulgarian: "Пътуването", romanized: "Patuvaneto", meaning: "The journey" },
        { bulgarian: "е", romanized: "e", meaning: "is" },
        { bulgarian: "кратко.", romanized: "kratko.", meaning: "short." },
      ],
    ],
    questions: [
      { question: "How long does the person wait?", options: ["Ten minutes", "Five minutes", "One hour", "Two minutes"], correctIndex: 1 },
      { question: "How is the journey described?", options: ["Long", "Short", "Boring", "Exciting"], correctIndex: 1 },
    ],
  },
  {
    id: "new-friend",
    title: "A New Friend",
    level: "intermediate",
    xpReward: 25,
    sentences: [
      [
        { bulgarian: "Срещам", romanized: "Sreshtam", meaning: "I meet" },
        { bulgarian: "нов", romanized: "nov", meaning: "a new" },
        { bulgarian: "приятел", romanized: "priyatel", meaning: "friend" },
        { bulgarian: "в", romanized: "v", meaning: "in" },
        { bulgarian: "парка.", romanized: "parka.", meaning: "the park." },
      ],
      [
        { bulgarian: "Той", romanized: "Toy", meaning: "He" },
        { bulgarian: "се", romanized: "se", meaning: "himself" },
        { bulgarian: "казва", romanized: "kazva", meaning: "is called" },
        { bulgarian: "Петър.", romanized: "Petar.", meaning: "Peter." },
      ],
      [
        { bulgarian: "Разговаряме", romanized: "Razgovaryame", meaning: "We talk" },
        { bulgarian: "за", romanized: "za", meaning: "about" },
        { bulgarian: "музика.", romanized: "muzika.", meaning: "music." },
      ],
      [
        { bulgarian: "Ще", romanized: "Shte", meaning: "Will" },
        { bulgarian: "се", romanized: "se", meaning: "ourselves" },
        { bulgarian: "видим", romanized: "vidim", meaning: "see" },
        { bulgarian: "пак.", romanized: "pak.", meaning: "again." },
      ],
    ],
    questions: [
      { question: "Where does the person meet their new friend?", options: ["At school", "In the park", "At work", "At home"], correctIndex: 1 },
      { question: "What is the friend's name?", options: ["Ivan", "Georgi", "Peter", "Dimitar"], correctIndex: 2 },
    ],
  },
  // ADVANCED STORIES
  {
    id: "job-interview",
    title: "The Job Interview",
    level: "advanced",
    xpReward: 40,
    sentences: [
      [
        { bulgarian: "Имам", romanized: "Imam", meaning: "I have" },
        { bulgarian: "интервю", romanized: "intervyu", meaning: "an interview" },
        { bulgarian: "за", romanized: "za", meaning: "for" },
        { bulgarian: "нова", romanized: "nova", meaning: "a new" },
        { bulgarian: "работа.", romanized: "rabota.", meaning: "job." },
      ],
      [
        { bulgarian: "Подготвям", romanized: "Podgotvyam", meaning: "I prepare" },
        { bulgarian: "се", romanized: "se", meaning: "myself" },
        { bulgarian: "внимателно", romanized: "vnimatelno", meaning: "carefully" },
        { bulgarian: "цяла", romanized: "tsyala", meaning: "the whole" },
        { bulgarian: "седмица.", romanized: "sedmitsa.", meaning: "week." },
      ],
      [
        { bulgarian: "Интервюто", romanized: "Intervyuto", meaning: "The interview" },
        { bulgarian: "е", romanized: "e", meaning: "is" },
        { bulgarian: "трудно,", romanized: "trudno,", meaning: "difficult," },
        { bulgarian: "но", romanized: "no", meaning: "but" },
        { bulgarian: "се", romanized: "se", meaning: "I" },
        { bulgarian: "справям.", romanized: "spravyam.", meaning: "manage." },
      ],
      [
        { bulgarian: "Получавам", romanized: "Poluchavam", meaning: "I receive" },
        { bulgarian: "работата!", romanized: "rabotata!", meaning: "the job!" },
      ],
    ],
    questions: [
      { question: "How long did the person prepare?", options: ["One day", "One week", "One month", "One hour"], correctIndex: 1 },
      { question: "What was the result of the interview?", options: ["They failed", "They got the job", "They have to wait", "They declined"], correctIndex: 1 },
    ],
  },
  {
    id: "mountain-trip",
    title: "Mountain Adventure",
    level: "advanced",
    xpReward: 40,
    sentences: [
      [
        { bulgarian: "Изкачваме", romanized: "Izkachvame", meaning: "We climb" },
        { bulgarian: "планината", romanized: "planinata", meaning: "the mountain" },
        { bulgarian: "от", romanized: "ot", meaning: "since" },
        { bulgarian: "сутринта.", romanized: "sutrintata.", meaning: "morning." },
      ],
      [
        { bulgarian: "Пътеката", romanized: "Patekata", meaning: "The trail" },
        { bulgarian: "е", romanized: "e", meaning: "is" },
        { bulgarian: "стръмна", romanized: "stramna", meaning: "steep" },
        { bulgarian: "и", romanized: "i", meaning: "and" },
        { bulgarian: "каменлива.", romanized: "kamenliva.", meaning: "rocky." },
      ],
      [
        { bulgarian: "Гледката", romanized: "Gledkata", meaning: "The view" },
        { bulgarian: "от", romanized: "ot", meaning: "from" },
        { bulgarian: "върха", romanized: "varha", meaning: "the peak" },
        { bulgarian: "е", romanized: "e", meaning: "is" },
        { bulgarian: "невероятна.", romanized: "neveroyatna.", meaning: "incredible." },
      ],
      [
        { bulgarian: "Чувствам", romanized: "Chuvstvam", meaning: "I feel" },
        { bulgarian: "се", romanized: "se", meaning: "myself" },
        { bulgarian: "свободен.", romanized: "svoboden.", meaning: "free." },
      ],
    ],
    questions: [
      { question: "When did they start climbing?", options: ["In the evening", "At noon", "In the morning", "At night"], correctIndex: 2 },
      { question: "How is the view from the peak?", options: ["Boring", "Ordinary", "Incredible", "Foggy"], correctIndex: 2 },
    ],
  },
  {
    id: "childhood-memory",
    title: "A Childhood Memory",
    level: "advanced",
    xpReward: 40,
    sentences: [
      [
        { bulgarian: "Спомням", romanized: "Spomnyam", meaning: "I remember" },
        { bulgarian: "си", romanized: "si", meaning: "myself" },
        { bulgarian: "лятото", romanized: "lyatoto", meaning: "the summer" },
        { bulgarian: "при", romanized: "pri", meaning: "at" },
        { bulgarian: "баба.", romanized: "baba.", meaning: "grandmother's." },
      ],
      [
        { bulgarian: "Тя", romanized: "Tya", meaning: "She" },
        { bulgarian: "правеше", romanized: "praveshe", meaning: "used to make" },
        { bulgarian: "най-вкусната", romanized: "nay-vkusnata", meaning: "the tastiest" },
        { bulgarian: "баница.", romanized: "banitsa.", meaning: "banitsa." },
      ],
      [
        { bulgarian: "Играех", romanized: "Igraeh", meaning: "I used to play" },
        { bulgarian: "с", romanized: "s", meaning: "with" },
        { bulgarian: "братовчедите", romanized: "bratovtchedite", meaning: "the cousins" },
        { bulgarian: "си", romanized: "si", meaning: "my" },
        { bulgarian: "всеки", romanized: "vseki", meaning: "every" },
        { bulgarian: "ден.", romanized: "den.", meaning: "day." },
      ],
      [
        { bulgarian: "Това", romanized: "Tova", meaning: "Those" },
        { bulgarian: "бяха", romanized: "byaha", meaning: "were" },
        { bulgarian: "щастливи", romanized: "shtastlivi", meaning: "happy" },
        { bulgarian: "времена.", romanized: "vremena.", meaning: "times." },
      ],
    ],
    questions: [
      { question: "What did grandmother make?", options: ["Cake", "Banitsa", "Soup", "Bread"], correctIndex: 1 },
      { question: "Who did the person play with?", options: ["Friends", "Siblings", "Cousins", "Neighbors"], correctIndex: 2 },
    ],
  },
];
const levelColors = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/30",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  advanced: "bg-red-500/10 text-red-600 border-red-500/30",
};

const LingqReader = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const { profile, user, updateXP } = useAuth();
  const { toast } = useToast();
  const { isLessonCompleted, refetch: refetchProgress } = useUserProgress();
  const { playPronunciation: speak } = useTextToSpeechCached();
  const {
    vocabulary,
    getWordStatus,
    saveWord,
    updateWordStatus,
    updateWordAfterReview,
    markAsKnown,
    deleteWord,
    getStats,
    getLearningWords,
    canAddWord,
    vocabLimit,
  } = useLingqVocabulary();

  // State
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [viewMode, setViewMode] = useState<"sentence" | "page">("sentence");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [showRomanization, setShowRomanization] = useState(true);
  const [showVocabPanel, setShowVocabPanel] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });
  const [showVocabLimitDialog, setShowVocabLimitDialog] = useState(false);
  const [showVocabReview, setShowVocabReview] = useState(false);

  // Load story from URL
  useEffect(() => {
    if (storyId) {
      const story = stories.find(s => s.id === storyId);
      if (story) {
        setSelectedStory(story);
        setCurrentSentenceIndex(0);
        setIsCompleted(false);
      }
    }
  }, [storyId]);

  // Calculate word statistics for current story
  const storyWordStats = useMemo(() => {
    if (!selectedStory) return { newWords: 0, learningWords: 0, knownWords: 0, totalWords: 0 };
    
    const allWords = selectedStory.sentences.flat();
    let newWords = 0;
    let learningWords = 0;
    let knownWords = 0;

    allWords.forEach(word => {
      const vocabWord = getWordStatus(word.bulgarian);
      if (!vocabWord) {
        newWords++;
      } else if (vocabWord.status === 5) {
        knownWords++;
      } else {
        learningWords++;
      }
    });

    return { newWords, learningWords, knownWords, totalWords: allWords.length };
  }, [selectedStory, vocabulary, getWordStatus]);

  // Handlers
  const handleStorySelect = (story: Story) => {
    navigate(`/stories/${story.id}`);
  };

  const handlePlaySentence = useCallback(() => {
    if (!selectedStory) return;
    const sentence = selectedStory.sentences[currentSentenceIndex];
    const text = sentence.map(w => w.bulgarian).join(" ");
    speak(text);
  }, [selectedStory, currentSentenceIndex, speak]);

  const handlePlayWord = useCallback((word: string) => {
    speak(word);
  }, [speak]);

  const handleNextSentence = () => {
    if (selectedStory && currentSentenceIndex < selectedStory.sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    }
  };

  const handlePrevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!selectedStory || !user) return;

    // Show quiz if story has questions
    if (selectedStory.questions && selectedStory.questions.length > 0 && !quizCompleted) {
      setShowQuiz(true);
      return;
    }

    await finishStory();
  };

  const finishStory = async () => {
    if (!selectedStory || !user) return;

    const storyLessonId = `lingq-${selectedStory.id}`;
    const alreadyCompleted = isLessonCompleted(storyLessonId);
    let earnedXP = alreadyCompleted ? 0 : selectedStory.xpReward;
    
    // Add quiz bonus XP
    if (quizCompleted && quizScore.score > 0) {
      earnedXP += quizScore.score * 5;
    }

    if (earnedXP > 0) {
      await updateXP(earnedXP);
    }

    await supabase.from("user_progress").upsert({
      user_id: user.id,
      lesson_id: storyLessonId,
      completed: true,
      score: earnedXP,
      correct_answers: storyWordStats.knownWords + storyWordStats.learningWords,
      total_answers: storyWordStats.totalWords,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });

    refetchProgress();
    setIsCompleted(true);

    toast({
      title: "Story Complete! 🎉",
      description: alreadyCompleted 
        ? "Great review! Keep practicing!" 
        : `You earned ${earnedXP} XP!`,
    });
  };

  const handleQuizComplete = (score: number, total: number) => {
    setQuizScore({ score, total });
    setQuizCompleted(true);
    setShowQuiz(false);
    finishStory();
  };

  const handleVocabReviewComplete = async (results: { word: string; correct: boolean }[]) => {
    setShowVocabReview(false);
    
    const correctCount = results.filter(r => r.correct).length;
    if (correctCount > 0 && user) {
      await updateXP(correctCount * 3);
      toast({
        title: "Review Complete!",
        description: `You earned ${correctCount * 3} XP from reviewing vocabulary!`,
      });
    }
  };

  const handleWordSave = async (
    word: string,
    translation: string,
    romanization?: string,
    notes?: string,
    status?: number
  ) => {
    // Check if we can add a word
    if (!getWordStatus(word) && !canAddWord()) {
      setShowVocabLimitDialog(true);
      return null;
    }
    return saveWord(word, translation, romanization, notes, status);
  };

  const handleBackToList = () => {
    navigate("/stories");
    setSelectedStory(null);
    setCurrentSentenceIndex(0);
    setIsCompleted(false);
    setShowQuiz(false);
    setQuizCompleted(false);
    setQuizScore({ score: 0, total: 0 });
  };

  // Story list view
  if (!selectedStory) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="bg-card border-b sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-xl font-bold font-nunito flex items-center gap-2">
                    <Library className="w-6 h-6 text-primary" />
                    Reading Library
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Click words to learn vocabulary • LingQ-style reading
                  </p>
                </div>
                <span className="text-3xl">🦝</span>
              </div>
            </div>
          </div>

          {/* Vocabulary Stats & Review Button */}
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Card className="p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Your Vocabulary</span>
                  <span className="text-xs text-muted-foreground">
                    ({getStats().total}/{getStats().limit === Infinity ? "∞" : getStats().limit})
                  </span>
                  {!getStats().isPremium && (
                    <Badge variant="outline" className="text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      Free
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-bold">{getStats().new}</span>
                    <span className="text-muted-foreground ml-1">New</span>
                  </div>
                  <div>
                    <span className="text-yellow-600 font-bold">
                      {getStats().recognized + getStats().familiar + getStats().learned}
                    </span>
                    <span className="text-muted-foreground ml-1">Learning</span>
                  </div>
                  <div>
                    <span className="text-green-600 font-bold">{getStats().known}</span>
                    <span className="text-muted-foreground ml-1">Known</span>
                  </div>
                </div>
              </div>
              {getLearningWords().length > 0 && (
                <Button 
                  onClick={() => setShowVocabReview(true)} 
                  className="w-full mt-4 gap-2"
                  variant="outline"
                >
                  <Brain className="w-4 h-4" />
                  Review Vocabulary ({getLearningWords().length} words)
                </Button>
              )}
            </Card>
          </div>

          {/* Vocab Review Mode */}
          {showVocabReview && (
            <div className="fixed inset-0 bg-background z-50 overflow-auto p-4">
              <div className="max-w-2xl mx-auto pt-8">
                <Button variant="ghost" onClick={() => setShowVocabReview(false)} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
                </Button>
                <VocabularyReview
                  words={getLearningWords()}
                  onComplete={handleVocabReviewComplete}
                  onUpdateWord={updateWordAfterReview}
                  onPlayAudio={handlePlayWord}
                />
              </div>
            </div>
          )}

          {/* Vocab Limit Dialog */}
          <VocabLimitDialog
            open={showVocabLimitDialog}
            onOpenChange={setShowVocabLimitDialog}
            currentCount={getStats().total}
            limit={vocabLimit === Infinity ? 50 : vocabLimit}
          />

          {/* Story Grid */}
          <main className="max-w-4xl mx-auto px-4 pb-24">
            {["beginner", "intermediate", "advanced"].map((level, levelIdx) => {
              const levelStories = stories.filter(s => s.level === level);
              if (levelStories.length === 0) return null;

              return (
                <AnimatedItem key={level} delay={levelIdx * 0.1}>
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold capitalize mb-4 flex items-center gap-2">
                      <Badge variant="outline" className={levelColors[level as keyof typeof levelColors]}>
                        {level}
                      </Badge>
                      <span className="text-muted-foreground text-sm">
                        ({levelStories.length} stories)
                      </span>
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {levelStories.map((story, idx) => {
                        const isComplete = isLessonCompleted(`lingq-${story.id}`);
                        const allWords = story.sentences.flat();
                        const knownCount = allWords.filter(w => getWordStatus(w.bulgarian)?.status === 5).length;
                        const newCount = allWords.filter(w => !getWordStatus(w.bulgarian)).length;
                        
                        return (
                          <AnimatedItem key={story.id} delay={(levelIdx * 0.1) + (idx * 0.05)}>
                            <Card
                              onClick={() => handleStorySelect(story)}
                              className={cn(
                                "cursor-pointer hover:border-primary hover:shadow-md transition-all p-4",
                                isComplete && "border-green-500/50 bg-green-500/5"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                  isComplete ? "bg-green-500/20" : "bg-primary/10"
                                )}>
                                  {isComplete ? (
                                    <Check className="w-6 h-6 text-green-500" />
                                  ) : (
                                    <BookOpen className="w-6 h-6 text-primary" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate">{story.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {story.sentences.length} sentences • {allWords.length} words
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-xs">
                                    <span className="text-blue-600">{newCount} new</span>
                                    <span className="text-green-600">{knownCount} known</span>
                                    <span className="flex items-center gap-1 text-primary ml-auto">
                                      <Star className="w-3 h-3 fill-current" />
                                      {story.xpReward} XP
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </AnimatedItem>
                        );
                      })}
                    </div>
                  </div>
                </AnimatedItem>
              );
            })}
          </main>
        </div>
      </PageTransition>
    );
  }

  // Reading view
  const currentSentence = selectedStory.sentences[currentSentenceIndex];
  const progress = ((currentSentenceIndex + 1) / selectedStory.sentences.length) * 100;
  const isLastSentence = currentSentenceIndex >= selectedStory.sentences.length - 1;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex">
        {/* Main content */}
        <div className={cn("flex-1 flex flex-col", showVocabPanel && "mr-80")}>
          {/* Header */}
          <div className="bg-card border-b sticky top-0 z-10">
            <div className="px-4 py-3">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBackToList}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-lg font-bold flex items-center gap-2">
                    {selectedStory.title}
                    <Badge variant="outline" className={levelColors[selectedStory.level]}>
                      {selectedStory.level}
                    </Badge>
                  </h1>
                </div>
                
                {/* View mode toggle */}
                <div className="flex items-center gap-2 border rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("sentence")}
                    className={cn(
                      "p-2 rounded",
                      viewMode === "sentence" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                    title="Sentence mode"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("page")}
                    className={cn(
                      "p-2 rounded",
                      viewMode === "page" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                    title="Page mode"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                </div>

                {/* Settings */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRomanization(!showRomanization)}
                    className={cn(
                      "p-2 rounded-lg border",
                      showRomanization ? "bg-primary/10 border-primary" : "hover:bg-muted"
                    )}
                    title="Toggle romanization"
                  >
                    {showRomanization ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowVocabPanel(!showVocabPanel)}
                    className={cn(
                      "p-2 rounded-lg border",
                      showVocabPanel ? "bg-primary/10 border-primary" : "hover:bg-muted"
                    )}
                    title="Toggle vocabulary panel"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-2xl">🦝</span>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Sentence {currentSentenceIndex + 1} of {selectedStory.sentences.length}</span>
                  <StoryStats {...storyWordStats} />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {showQuiz && selectedStory.questions ? (
              // Comprehension Quiz
              <div className="p-6">
                <ComprehensionQuiz
                  questions={selectedStory.questions}
                  onComplete={handleQuizComplete}
                  storyTitle={selectedStory.title}
                />
              </div>
            ) : isCompleted ? (
              // Completion screen
              <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full text-center p-8 animate-bounce-in">
                  <span className="text-8xl block mb-4">🎉</span>
                  <h2 className="text-2xl font-bold mb-2">Story Complete!</h2>
                  <p className="text-muted-foreground mb-4">
                    You've read through "{selectedStory.title}"
                  </p>
                  <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary mb-6">
                    <Sparkles className="w-8 h-8" />
                    +{selectedStory.xpReward} XP
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{storyWordStats.newWords}</div>
                      <div className="text-xs text-muted-foreground">New Words</div>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{storyWordStats.learningWords}</div>
                      <div className="text-xs text-muted-foreground">Learning</div>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{storyWordStats.knownWords}</div>
                      <div className="text-xs text-muted-foreground">Known</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleBackToList} className="flex-1">
                      More Stories
                    </Button>
                    <Button onClick={() => {
                      setCurrentSentenceIndex(0);
                      setIsCompleted(false);
                    }} className="flex-1">
                      Read Again
                    </Button>
                  </div>
                </Card>
              </div>
            ) : viewMode === "sentence" ? (
              // Sentence mode
              <div className="max-w-3xl mx-auto p-6">
                <Card className="p-8 mb-6">
                  {/* Current sentence */}
                  <div className="text-center mb-6">
                    <p className="text-3xl font-bold leading-relaxed">
                      {currentSentence.map((word, idx) => (
                        <span key={idx}>
                          <LingqWord
                            word={word.bulgarian}
                            translation={word.meaning}
                            romanization={word.romanized}
                            existingVocab={getWordStatus(word.bulgarian)}
                            onSave={handleWordSave}
                            onUpdateStatus={updateWordStatus}
                            onMarkKnown={markAsKnown}
                            onDelete={deleteWord}
                            onPlayAudio={handlePlayWord}
                          />
                          {idx < currentSentence.length - 1 && " "}
                        </span>
                      ))}
                    </p>
                    {showRomanization && (
                      <p className="text-xl text-muted-foreground italic mt-4">
                        {currentSentence.map(w => w.romanized).join(" ")}
                      </p>
                    )}
                  </div>

                  {/* Sentence player */}
                  <SentencePlayer
                    currentSentence={currentSentenceIndex}
                    totalSentences={selectedStory.sentences.length}
                    onPrevious={handlePrevSentence}
                    onNext={handleNextSentence}
                    onPlayAudio={handlePlaySentence}
                  />

                  {/* Instructions */}
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Click any word to see translation and save to vocabulary
                  </p>
                </Card>

                {/* Next/Complete button */}
                {isLastSentence ? (
                  <Button onClick={handleComplete} className="w-full gap-2" size="lg">
                    <Check className="w-5 h-5" />
                    Complete Story
                  </Button>
                ) : (
                  <Button onClick={handleNextSentence} className="w-full gap-2" size="lg">
                    Next Sentence
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </div>
            ) : (
              // Page mode - show all sentences
              <div className="max-w-3xl mx-auto p-6">
                <Card className="p-8 mb-6">
                  <div className="space-y-6">
                    {selectedStory.sentences.map((sentence, sentenceIdx) => (
                      <div 
                        key={sentenceIdx}
                        className={cn(
                          "p-4 rounded-lg transition-all",
                          sentenceIdx === currentSentenceIndex && "bg-primary/5 ring-2 ring-primary/20"
                        )}
                        onClick={() => setCurrentSentenceIndex(sentenceIdx)}
                      >
                        <p className="text-xl leading-relaxed">
                          {sentence.map((word, idx) => (
                            <span key={idx}>
                              <LingqWord
                                word={word.bulgarian}
                                translation={word.meaning}
                                romanization={word.romanized}
                                existingVocab={getWordStatus(word.bulgarian)}
                                onSave={saveWord}
                                onUpdateStatus={updateWordStatus}
                                onMarkKnown={markAsKnown}
                                onDelete={deleteWord}
                                onPlayAudio={handlePlayWord}
                              />
                              {idx < sentence.length - 1 && " "}
                            </span>
                          ))}
                        </p>
                        {showRomanization && (
                          <p className="text-muted-foreground italic mt-2">
                            {sentence.map(w => w.romanized).join(" ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-center text-sm text-muted-foreground mt-6">
                    Click any word to see translation and save to vocabulary
                  </p>
                </Card>

                <Button onClick={handleComplete} className="w-full gap-2" size="lg">
                  <Check className="w-5 h-5" />
                  Complete Story
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Vocabulary sidebar */}
        {showVocabPanel && !isCompleted && (
          <div className="fixed right-0 top-0 bottom-0 w-80 z-20">
            <VocabularyPanel
              vocabulary={vocabulary}
              onUpdateStatus={updateWordStatus}
              onMarkKnown={markAsKnown}
              onDelete={deleteWord}
              onPlayAudio={handlePlayWord}
            />
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default LingqReader;
