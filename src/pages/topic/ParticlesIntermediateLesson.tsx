import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  correctRomanized: string;
  explanation: string;
}

const LESSON_ID = "particles-intermediate";
const XP_REWARD = 85;

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

const questions: Question[] = [
  { sentence: "Книгата ___ Мария", romanized: "Knigata ___ Maria", english: "Maria's book", correctParticle: "на", correctRomanized: "na", explanation: "'На' (na) shows possession" },
  { sentence: "Аз живея ___ София", romanized: "Az zhiveya ___ Sofia", english: "I live in Sofia", correctParticle: "в", correctRomanized: "v", explanation: "'В' (v) indicates being inside a place" },
  { sentence: "Той е ___ Пловдив", romanized: "Toy e ___ Plovdiv", english: "He is from Plovdiv", correctParticle: "от", correctRomanized: "ot", explanation: "'От' (ot) shows origin" },
  { sentence: "Това е подарък ___ теб", romanized: "Tova e podarak ___ teb", english: "This is a gift for you", correctParticle: "за", correctRomanized: "za", explanation: "'За' (za) indicates recipient" },
  { sentence: "Отивам ___ приятели", romanized: "Otivam ___ priyateli", english: "I go with friends", correctParticle: "с", correctRomanized: "s", explanation: "'С' (s) shows accompaniment" },
  { sentence: "Чакам ___ пет часа", romanized: "Chakam ___ pet chasa", english: "I wait until five o'clock", correctParticle: "до", correctRomanized: "do", explanation: "'До' (do) indicates time limit" },
  { sentence: "Разхождам се ___ парка", romanized: "Razhozhdam se ___ parka", english: "I walk along the park", correctParticle: "по", correctRomanized: "po", explanation: "'По' (po) shows movement along" },
  { sentence: "Отивам ___ лекар", romanized: "Otivam ___ lekar", english: "I go to the doctor", correctParticle: "при", correctRomanized: "pri", explanation: "'При' (pri) indicates visiting someone" },
  { sentence: "Чай ___ захар", romanized: "Chay ___ zahar", english: "Tea without sugar", correctParticle: "без", correctRomanized: "bez", explanation: "'Без' (bez) indicates absence" },
  { sentence: "___ работа ще почивам", romanized: "___ rabota shte pochivam", english: "After work I will rest", correctParticle: "след", correctRomanized: "sled", explanation: "'След' (sled) shows time sequence" },
  { sentence: "Поставям книгата ___ масата", romanized: "Postavyam knigata ___ masata", english: "I put the book on the table", correctParticle: "на", correctRomanized: "na", explanation: "'На' (na) indicates surface location" },
  { sentence: "Влизам ___ стаята", romanized: "Vlizam ___ stayata", english: "I enter the room", correctParticle: "в", correctRomanized: "v", explanation: "'В' (v) shows entering inside" },
  { sentence: "Направено ___ дърво", romanized: "Napraveno ___ darvo", english: "Made of wood", correctParticle: "от", correctRomanized: "ot", explanation: "'От' (ot) indicates material" },
  { sentence: "Говорим ___ времето", romanized: "Govorim ___ vremeto", english: "We talk about the weather", correctParticle: "за", correctRomanized: "za", explanation: "'За' (za) indicates topic" },
  { sentence: "Пиша ___ молив", romanized: "Pisha ___ moliv", english: "I write with a pencil", correctParticle: "с", correctRomanized: "s", explanation: "'С' (s) shows the instrument" },
  { sentence: "Седни ___ мен", romanized: "Sedni ___ men", english: "Sit next to me", correctParticle: "до", correctRomanized: "do", explanation: "'До' (do) indicates proximity" },
  { sentence: "Вървя ___ пътеката", romanized: "Varvya ___ patekata", english: "I walk along the path", correctParticle: "по", correctRomanized: "po", explanation: "'По' (po) shows following a path" },
  { sentence: "Ела ___ нас", romanized: "Ela ___ nas", english: "Come to us", correctParticle: "при", correctRomanized: "pri", explanation: "'При' (pri) indicates moving toward" },
  { sentence: "Живея ___ семейство", romanized: "Zhiveya ___ semeystvo", english: "I live without family", correctParticle: "без", correctRomanized: "bez", explanation: "'Без' (bez) indicates lack of" },
  { sentence: "___ обяд имам среща", romanized: "___ obyad imam sreshta", english: "After lunch I have a meeting", correctParticle: "след", correctRomanized: "sled", explanation: "'След' (sled) shows time sequence" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const ParticlesIntermediateLesson = () => {
  const [phase, setPhase] = useState<'learn' | 'quiz'>('learn');
  const [currentParticleIndex, setCurrentParticleIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isRevision, setIsRevision] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateXP } = useAuth();
  const { canEarnXP, isLessonCompleted, refetch } = useUserProgress();

  useEffect(() => {
    setIsRevision(isLessonCompleted(LESSON_ID));
  }, []);

  useEffect(() => {
    if (phase === 'quiz') {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [currentStep, phase]);

  const startQuiz = () => {
    setQuizQuestions(shuffleArray(questions).slice(0, 20));
    setPhase('quiz');
  };

  const currentParticle = particles[currentParticleIndex];
  const currentQuestion = quizQuestions[currentStep];
  const progress = phase === 'learn' 
    ? ((currentParticleIndex + 1) / particles.length) * 100 
    : ((currentStep + 1) / quizQuestions.length) * 100;

  const checkAnswer = () => {
    const normalized = userAnswer.toLowerCase().trim();
    const correct = normalized === currentQuestion.correctRomanized || normalized === currentQuestion.correctParticle;
    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const nextQuestion = async () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserAnswer("");
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
                Learn Bulgarian Particles (Type Mode)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-5 h-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>In the quiz you'll type the particle</p>
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
                <p className="text-sm font-medium">Examples (hover to see meaning):</p>
                {currentParticle.examples.map((example, idx) => (
                  <TooltipProvider key={idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-card border rounded-lg p-3 cursor-help hover:bg-accent/30 transition-colors">
                          <p className="font-medium">{example.bulgarian}</p>
                          <p className="text-sm text-muted-foreground">{example.romanized}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{example.english}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
            <CardTitle className="text-center">Type the correct particle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">{currentQuestion.sentence}</p>
              <p className="text-lg text-muted-foreground">{currentQuestion.romanized}</p>
              <p className="text-sm text-primary">{currentQuestion.english}</p>
            </div>

            <Input
              ref={inputRef}
              type="text"
              placeholder="Type the particle (e.g., na, v, ot...)"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isCorrect !== null}
              className={cn(
                "text-center text-xl py-6",
                isCorrect === true && "border-green-500 bg-green-500/10",
                isCorrect === false && "border-red-500 bg-red-500/10"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isCorrect === null && userAnswer.trim()) checkAnswer();
              }}
            />

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
                    <><X className="w-6 h-6" /><span className="font-bold">The answer is: {currentQuestion.correctParticle} ({currentQuestion.correctRomanized})</span></>
                  )}
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {isCorrect === null ? (
              <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="w-full">
                Check
              </Button>
            ) : (
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

export default ParticlesIntermediateLesson;
