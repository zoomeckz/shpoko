import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LessonComplete } from "@/components/LessonComplete";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useLessonKeyboardNavigation } from "@/hooks/useLessonKeyboardNavigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Particle {
  particle: string;
  romanized: string;
  meaning: string;
  usage: string;
  examples: { bulgarian: string; romanized: string; english: string }[];
}

interface Question {
  sentence: string;
  romanized: string;
  english: string;
  correctParticle: string;
  options: string[];
  explanation: string;
}

const LESSON_ID = "particles-beginner";
const XP_REWARD = 70;

const particles: Particle[] = [
  {
    particle: "на",
    romanized: "na",
    meaning: "to, on, at, of",
    usage: "Used for possession, direction, location on surfaces, and indirect objects",
    examples: [
      { bulgarian: "Книгата на Иван", romanized: "Knigata na Ivan", english: "Ivan's book" },
      { bulgarian: "Отивам на работа", romanized: "Otivam na rabota", english: "I go to work" },
    ],
  },
  {
    particle: "в",
    romanized: "v",
    meaning: "in, into",
    usage: "Used for being inside something or entering",
    examples: [
      { bulgarian: "Аз съм в къщи", romanized: "Az sam v kashti", english: "I am at home" },
      { bulgarian: "Влизам в стаята", romanized: "Vlizam v stayata", english: "I enter the room" },
    ],
  },
  {
    particle: "от",
    romanized: "ot",
    meaning: "from, of, by",
    usage: "Used for origin, source, or agent in passive constructions",
    examples: [
      { bulgarian: "Аз съм от България", romanized: "Az sam ot Bulgaria", english: "I am from Bulgaria" },
      { bulgarian: "Чаша от стъкло", romanized: "Chasha ot staklo", english: "A glass made of glass" },
    ],
  },
  {
    particle: "за",
    romanized: "za",
    meaning: "for, about",
    usage: "Used for purpose, destination, or topic",
    examples: [
      { bulgarian: "Това е за теб", romanized: "Tova e za teb", english: "This is for you" },
      { bulgarian: "Говоря за работата", romanized: "Govorya za rabotata", english: "I talk about work" },
    ],
  },
  {
    particle: "с",
    romanized: "s",
    meaning: "with",
    usage: "Used for accompaniment or instrument",
    examples: [
      { bulgarian: "Идвам с приятел", romanized: "Idvam s priyatel", english: "I come with a friend" },
      { bulgarian: "Пиша с химикал", romanized: "Pisha s himikal", english: "I write with a pen" },
    ],
  },
  {
    particle: "до",
    romanized: "do",
    meaning: "to, until, next to",
    usage: "Used for proximity or limit",
    examples: [
      { bulgarian: "До утре", romanized: "Do utre", english: "Until tomorrow" },
      { bulgarian: "До магазина", romanized: "Do magazina", english: "Next to the store" },
    ],
  },
  {
    particle: "по",
    romanized: "po",
    meaning: "along, on, by",
    usage: "Used for movement along or distribution",
    examples: [
      { bulgarian: "Вървя по улицата", romanized: "Varvya po ulitsata", english: "I walk along the street" },
      { bulgarian: "По един", romanized: "Po edin", english: "One each" },
    ],
  },
  {
    particle: "при",
    romanized: "pri",
    meaning: "at, by, near",
    usage: "Used for location near someone or visiting",
    examples: [
      { bulgarian: "Аз съм при лекар", romanized: "Az sam pri lekar", english: "I am at the doctor" },
      { bulgarian: "Ела при мен", romanized: "Ela pri men", english: "Come to me" },
    ],
  },
  {
    particle: "без",
    romanized: "bez",
    meaning: "without",
    usage: "Used for absence or lack",
    examples: [
      { bulgarian: "Кафе без захар", romanized: "Kafe bez zahar", english: "Coffee without sugar" },
      { bulgarian: "Без проблем", romanized: "Bez problem", english: "No problem" },
    ],
  },
  {
    particle: "след",
    romanized: "sled",
    meaning: "after, behind",
    usage: "Used for sequence in time or position",
    examples: [
      { bulgarian: "След обяд", romanized: "Sled obyad", english: "After lunch" },
      { bulgarian: "След мен", romanized: "Sled men", english: "After me" },
    ],
  },
];

const questions: Omit<Question, 'options'>[] = [
  { sentence: "Книгата ___ Мария", romanized: "Knigata ___ Maria", english: "Maria's book", correctParticle: "на", explanation: "'На' shows possession - the book belongs to Maria" },
  { sentence: "Аз живея ___ София", romanized: "Az zhiveya ___ Sofia", english: "I live in Sofia", correctParticle: "в", explanation: "'В' indicates being inside a city/place" },
  { sentence: "Той е ___ Пловдив", romanized: "Toy e ___ Plovdiv", english: "He is from Plovdiv", correctParticle: "от", explanation: "'От' shows origin - where someone comes from" },
  { sentence: "Това е подарък ___ теб", romanized: "Tova e podarak ___ teb", english: "This is a gift for you", correctParticle: "за", explanation: "'За' indicates purpose or recipient" },
  { sentence: "Отивам ___ приятели", romanized: "Otivam ___ priyateli", english: "I go with friends", correctParticle: "с", explanation: "'С' shows accompaniment - with someone" },
  { sentence: "Чакам ___ пет часа", romanized: "Chakam ___ pet chasa", english: "I wait until five o'clock", correctParticle: "до", explanation: "'До' indicates a time limit - until" },
  { sentence: "Разхождам се ___ парка", romanized: "Razhozhdam se ___ parka", english: "I walk along the park", correctParticle: "по", explanation: "'По' shows movement along a path" },
  { sentence: "Отивам ___ лекар", romanized: "Otivam ___ lekar", english: "I go to the doctor", correctParticle: "при", explanation: "'При' indicates visiting someone or being at their place" },
  { sentence: "Чай ___ захар", romanized: "Chay ___ zahar", english: "Tea without sugar", correctParticle: "без", explanation: "'Без' indicates absence - without something" },
  { sentence: "___ работа ще почивам", romanized: "___ rabota shte pochivam", english: "After work I will rest", correctParticle: "след", explanation: "'След' shows sequence - after something" },
  { sentence: "Поставям книгата ___ масата", romanized: "Postavyam knigata ___ masata", english: "I put the book on the table", correctParticle: "на", explanation: "'На' indicates location on a surface" },
  { sentence: "Влизам ___ стаята", romanized: "Vlizam ___ stayata", english: "I enter the room", correctParticle: "в", explanation: "'В' shows entering inside something" },
  { sentence: "Направено ___ дърво", romanized: "Napraveno ___ darvo", english: "Made of wood", correctParticle: "от", explanation: "'От' indicates material - made from something" },
  { sentence: "Говорим ___ времето", romanized: "Govorim ___ vremeto", english: "We talk about the weather", correctParticle: "за", explanation: "'За' indicates the topic of conversation" },
  { sentence: "Пиша ___ молив", romanized: "Pisha ___ moliv", english: "I write with a pencil", correctParticle: "с", explanation: "'С' shows the instrument used" },
  { sentence: "Седни ___ мен", romanized: "Sedni ___ men", english: "Sit next to me", correctParticle: "до", explanation: "'До' indicates proximity - next to" },
  { sentence: "Вървя ___ пътеката", romanized: "Varvya ___ patekata", english: "I walk along the path", correctParticle: "по", explanation: "'По' shows following a path" },
  { sentence: "Ела ___ нас", romanized: "Ela ___ nas", english: "Come to us", correctParticle: "при", explanation: "'При' indicates moving toward someone" },
  { sentence: "Живея ___ семейство", romanized: "Zhiveya ___ semeystvo", english: "I live without family", correctParticle: "без", explanation: "'Без' indicates lacking something" },
  { sentence: "___ обяд имам среща", romanized: "___ obyad imam sreshta", english: "After lunch I have a meeting", correctParticle: "след", explanation: "'След' shows time sequence" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const ParticlesBeginnerLesson = () => {
  const [phase, setPhase] = useState<'learn' | 'quiz'>('learn');
  const [currentParticleIndex, setCurrentParticleIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isRevision, setIsRevision] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateXP } = useAuth();
  const { canEarnXP, isLessonCompleted, refetch } = useUserProgress();

  useEffect(() => {
    setIsRevision(isLessonCompleted(LESSON_ID));
  }, []);

  const startQuiz = () => {
    const shuffledQuestions = shuffleArray(questions).slice(0, 20).map(q => ({
      ...q,
      options: shuffleArray([q.correctParticle, ...shuffleArray(particles.filter(p => p.particle !== q.correctParticle).map(p => p.particle)).slice(0, 3)]),
    }));
    setQuizQuestions(shuffledQuestions);
    setPhase('quiz');
  };

  const currentParticle = particles[currentParticleIndex];
  const currentQuestion = quizQuestions[currentStep];
  const progress = phase === 'learn' 
    ? ((currentParticleIndex + 1) / particles.length) * 100 
    : ((currentStep + 1) / quizQuestions.length) * 100;

  const handleSelect = (answer: string) => {
    if (isCorrect !== null) return;
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctParticle;
    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const nextQuestion = async () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      const canEarn = canEarnXP(LESSON_ID);
      let xpEarned = 0;
      
      if (canEarn && !isRevision && user?.id) {
        const baseXP = Math.round((correctAnswers / quizQuestions.length) * XP_REWARD);
        xpEarned = baseXP;
        await updateXP(xpEarned);
        
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_id: LESSON_ID,
          completed: true,
          score: xpEarned,
          correct_answers: correctAnswers,
          total_answers: quizQuestions.length,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
        
        refetch();
      }
      
      setEarnedXP(xpEarned);
      setIsComplete(true);
    }
  };

  useLessonKeyboardNavigation({
    isAnswered: isCorrect !== null,
    onNext: nextQuestion,
    disabled: isComplete || phase === 'learn',
  });

  const handleBack = () => {
    navigate("/", { state: { selectedCategory: location.state?.selectedCategory || "lessons" } });
  };

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey={LESSON_ID}
        score={earnedXP}
        xpEarned={earnedXP}
        correctAnswers={correctAnswers}
        totalQuestions={quizQuestions.length}
        isRevision={isRevision}
      />
    );
  }

  // Learning phase
  if (phase === 'learn') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <Progress value={progress} className="h-3" />
            </div>
            <span className="text-sm font-medium">{currentParticleIndex + 1}/{particles.length}</span>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                Learn Bulgarian Particles
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-5 h-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Hover over examples to see translations</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-6xl font-bold mb-2">{currentParticle.particle}</p>
                <p className="text-xl text-muted-foreground mb-1">{currentParticle.romanized}</p>
                <p className="text-2xl font-semibold text-primary">{currentParticle.meaning}</p>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Usage:</p>
                <p className="text-muted-foreground">{currentParticle.usage}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Examples:</p>
                {currentParticle.examples.map((example, idx) => (
                  <div key={idx} className="bg-card border rounded-lg p-3">
                    <p className="font-medium">{example.bulgarian}</p>
                    <p className="text-sm text-muted-foreground">{example.romanized}</p>
                    <p className="text-sm text-primary mt-1">{example.english}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                {currentParticleIndex > 0 && (
                  <Button variant="outline" onClick={() => setCurrentParticleIndex(currentParticleIndex - 1)} className="flex-1">
                    Previous
                  </Button>
                )}
                {currentParticleIndex < particles.length - 1 ? (
                  <Button onClick={() => setCurrentParticleIndex(currentParticleIndex + 1)} className="flex-1">
                    Next Particle
                  </Button>
                ) : (
                  <Button onClick={startQuiz} className="flex-1">
                    Start Quiz (20 Questions)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz phase
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <Progress value={progress} className="h-3" />
          </div>
          <span className="text-sm font-medium">{currentStep + 1}/{quizQuestions.length}</span>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Choose the correct particle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">{currentQuestion.sentence}</p>
              <p className="text-lg text-muted-foreground">{currentQuestion.romanized}</p>
              <p className="text-sm text-primary">{currentQuestion.english}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "h-14 text-xl font-bold",
                    isCorrect !== null && option === currentQuestion.correctParticle && "bg-green-500 text-white border-green-500",
                    isCorrect === false && selectedAnswer === option && "bg-red-500 text-white border-red-500"
                  )}
                  onClick={() => handleSelect(option)}
                  disabled={isCorrect !== null}
                >
                  {option}
                </Button>
              ))}
            </div>

            {isCorrect !== null && (
              <div className={cn(
                "p-4 rounded-lg animate-fade-in",
                isCorrect ? "bg-green-500/20" : "bg-red-500/20"
              )}>
                <div className={cn(
                  "flex items-center justify-center gap-2 mb-2",
                  isCorrect ? "text-green-500" : "text-red-500"
                )}>
                  {isCorrect ? (
                    <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
                  ) : (
                    <><X className="w-6 h-6" /><span className="font-bold">Incorrect</span></>
                  )}
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {isCorrect !== null && (
              <Button onClick={nextQuestion} className="w-full">
                {currentStep < quizQuestions.length - 1 ? "Next" : "Complete Lesson"}
              </Button>
            )}
          </CardContent>
        </Card>
        <div className="text-center text-muted-foreground">
          <p>Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default ParticlesBeginnerLesson;
