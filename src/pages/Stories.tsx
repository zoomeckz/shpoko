import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Star, Check, X } from "lucide-react";
import { Header } from "@/components/Header";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
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
}

const stories: Story[] = [
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
      {
        question: "What does the person drink in the morning?",
        options: ["Tea", "Coffee", "Water", "Juice"],
        correctIndex: 1,
      },
      {
        question: "Where does the person go?",
        options: ["School", "Home", "Work", "Market"],
        correctIndex: 2,
      },
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
      {
        question: "What fruit is bought at the market?",
        options: ["Oranges", "Bananas", "Apples", "Grapes"],
        correctIndex: 2,
      },
      {
        question: "What color are the apples?",
        options: ["Green", "Yellow", "Red", "Blue"],
        correctIndex: 2,
      },
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
      {
        question: "How is the family described?",
        options: ["Small", "Big", "Happy", "Sad"],
        correctIndex: 1,
      },
      {
        question: "Who does the person have?",
        options: ["Two brothers", "Two sisters", "A brother and a sister", "No siblings"],
        correctIndex: 2,
      },
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
      {
        question: "What is the weather like today?",
        options: ["Rainy", "Cloudy", "Sunny", "Snowy"],
        correctIndex: 2,
      },
      {
        question: "How does the person feel?",
        options: ["Sad", "Angry", "Tired", "Happy"],
        correctIndex: 3,
      },
    ],
  },
];

const levelColors = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/30",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  advanced: "bg-red-500/10 text-red-600 border-red-500/30",
};

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

const Stories = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const { profile, user, updateXP } = useAuth();
  const { toast } = useToast();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [phase, setPhase] = useState<"reading" | "questions" | "complete">("reading");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Auto-select story if storyId is in URL
  useEffect(() => {
    if (storyId) {
      const story = stories.find(s => s.id === storyId);
      if (story) {
        setSelectedStory(story);
        setPhase("reading");
      }
    }
  }, [storyId]);

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
    setPhase("reading");
    setCurrentQuestion(0);
    setCorrectAnswers(0);
  };

  const handleStartQuestions = () => {
    setPhase("questions");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleSelectAnswer = (index: number) => {
    if (isCorrect !== null || !selectedStory) return;
    
    setSelectedAnswer(index);
    const correct = index === selectedStory.questions[currentQuestion].correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (!selectedStory) return;
    
    if (currentQuestion < selectedStory.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Complete story
      const earnedXP = Math.round(selectedStory.xpReward * (correctAnswers / selectedStory.questions.length));
      
      if (user && earnedXP > 0) {
        await updateXP(earnedXP);
        
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_id: `story-${selectedStory.id}`,
          completed: true,
          score: earnedXP,
          correct_answers: correctAnswers,
          total_answers: selectedStory.questions.length,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
      }
      
      toast({
        title: "Story Complete!",
        description: `You earned ${earnedXP} XP!`,
      });
      
      setPhase("complete");
    }
  };

  const handleBackToList = () => {
    setSelectedStory(null);
    setPhase("reading");
  };

  // Story list view
  if (!selectedStory) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          streak={profile?.streak || 0}
          hearts={5}
          xp={profile?.xp || 0}
          dailyGoalProgress={65}
        />
        <main className="max-w-4xl mx-auto p-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Short Stories</h1>
              <p className="text-muted-foreground">Read stories and answer questions to earn XP</p>
            </div>
            <ShpokoMascot expression="studying" size="sm" className="ml-auto" />
          </div>

          {["beginner", "intermediate", "advanced"].map((level) => {
            const levelStories = stories.filter(s => s.level === level);
            if (levelStories.length === 0) return null;
            
            return (
              <div key={level} className="mb-8">
                <h2 className="text-xl font-semibold capitalize mb-4">{level}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {levelStories.map((story) => (
                    <Card
                      key={story.id}
                      onClick={() => handleStorySelect(story)}
                      className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{story.title}</CardTitle>
                          <Badge variant="outline" className={levelColors[story.level]}>
                            {story.level}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="w-4 h-4" />
                            <span>{story.sentences.length} sentences</span>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-0">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            {story.xpReward} XP
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    );
  }

  // Reading phase
  if (phase === "reading") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{selectedStory.title}</h1>
              <Badge variant="outline" className={levelColors[selectedStory.level]}>
                {selectedStory.level}
              </Badge>
            </div>
            <ShpokoMascot expression="studying" size="sm" />
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4 text-xl leading-relaxed text-center">
                {selectedStory.sentences.map((sentence, sentenceIndex) => (
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

              <p className="text-sm text-muted-foreground mt-6 italic">
                Hover over any word to see its romanization and meaning.
              </p>
            </CardContent>
          </Card>

          <Button onClick={handleStartQuestions} className="w-full gap-2">
            <Star className="w-4 h-4" />
            Answer Questions to Earn {selectedStory.xpReward} XP
          </Button>
        </div>
      </div>
    );
  }

  // Questions phase
  if (phase === "questions") {
    const question = selectedStory.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedStory.questions.length) * 100;

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <Progress value={progress} className="h-3" />
            </div>
            <span className="text-sm font-medium">
              {currentQuestion + 1}/{selectedStory.questions.length}
            </span>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question about "{selectedStory.title}"</CardTitle>
                <ShpokoMascot 
                  expression={isCorrect === true ? "correct" : isCorrect === false ? "wrong" : "question"} 
                  size="sm" 
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xl font-medium text-center">{question.question}</p>

              <div className="grid grid-cols-1 gap-3">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSelectAnswer(index)}
                    disabled={isCorrect !== null}
                    className={cn(
                      "py-4 text-lg justify-start transition-all",
                      selectedAnswer === index && isCorrect && "bg-green-500 text-white border-green-500",
                      selectedAnswer === index && !isCorrect && "bg-red-500 text-white border-red-500",
                      isCorrect !== null && index === question.correctIndex && selectedAnswer !== index && "border-green-500 border-2"
                    )}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {isCorrect !== null && (
                <div className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-lg animate-fade-in",
                  isCorrect ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                )}>
                  {isCorrect ? (
                    <>
                      <Check className="w-6 h-6" />
                      <span className="font-bold">Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-6 h-6" />
                      <span className="font-bold">
                        The answer is: {question.options[question.correctIndex]}
                      </span>
                    </>
                  )}
                </div>
              )}

              {isCorrect !== null && (
                <Button onClick={handleNextQuestion} className="w-full">
                  {currentQuestion < selectedStory.questions.length - 1 ? "Next Question" : "Complete Story"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Complete phase
  const earnedXP = Math.round(selectedStory.xpReward * (correctAnswers / selectedStory.questions.length));

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <ShpokoMascot expression="celebrating" size="lg" className="mx-auto mb-4" />
          <CardTitle className="text-2xl">Story Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold text-primary">+{earnedXP} XP</div>
          <p className="text-muted-foreground">
            You got {correctAnswers}/{selectedStory.questions.length} questions correct!
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleBackToList} className="flex-1">
              More Stories
            </Button>
            <Button onClick={() => navigate("/")} className="flex-1">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stories;
