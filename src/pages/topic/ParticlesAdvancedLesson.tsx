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
  bulgarian: string;
  english: string;
  correctVerb: string;
  correctVerbRomanized: string;
  correctParticle: string;
  correctParticleRomanized: string;
  hint: string;
  explanation: string;
}

const LESSON_ID = "particles-advanced";
const XP_REWARD = 100;

const particles: Particle[] = [
  {
    particle: "на",
    romanized: "na",
    meaning: "to, on, at, of",
    usage: "Used for possession, direction, location on surfaces, and indirect objects",
    examples: [
      { bulgarian: "Давам на Иван", romanized: "Davam na Ivan", english: "I give to Ivan" },
      { bulgarian: "Гледам на телевизия", romanized: "Gledam na televizia", english: "I watch on TV" },
    ],
  },
  {
    particle: "в",
    romanized: "v",
    meaning: "in, into",
    usage: "Used for being inside something or entering",
    examples: [
      { bulgarian: "Влизам в стаята", romanized: "Vlizam v stayata", english: "I enter the room" },
      { bulgarian: "Работя в офиса", romanized: "Rabotya v ofisa", english: "I work in the office" },
    ],
  },
  {
    particle: "от",
    romanized: "ot",
    meaning: "from, of, by",
    usage: "Used for origin, source, or agent in passive constructions",
    examples: [
      { bulgarian: "Идвам от училище", romanized: "Idvam ot uchilishte", english: "I come from school" },
      { bulgarian: "Боя се от кучета", romanized: "Boya se ot kucheta", english: "I am afraid of dogs" },
    ],
  },
  {
    particle: "за",
    romanized: "za",
    meaning: "for, about",
    usage: "Used for purpose, destination, or topic",
    examples: [
      { bulgarian: "Мисля за теб", romanized: "Mislya za teb", english: "I think about you" },
      { bulgarian: "Тръгвам за работа", romanized: "Tragvam za rabota", english: "I leave for work" },
    ],
  },
  {
    particle: "с",
    romanized: "s",
    meaning: "with",
    usage: "Used for accompaniment or instrument",
    examples: [
      { bulgarian: "Играя с деца", romanized: "Igraya s detsa", english: "I play with children" },
      { bulgarian: "Режа с нож", romanized: "Rezha s nozh", english: "I cut with a knife" },
    ],
  },
  {
    particle: "до",
    romanized: "do",
    meaning: "to, until, next to",
    usage: "Used for proximity or limit",
    examples: [
      { bulgarian: "Стоя до вратата", romanized: "Stoya do vratata", english: "I stand by the door" },
      { bulgarian: "Чакам до три", romanized: "Chakam do tri", english: "I wait until three" },
    ],
  },
  {
    particle: "по",
    romanized: "po",
    meaning: "along, on, by",
    usage: "Used for movement along or distribution",
    examples: [
      { bulgarian: "Тичам по улицата", romanized: "Ticham po ulitsata", english: "I run along the street" },
      { bulgarian: "Говоря по телефона", romanized: "Govorya po telefona", english: "I talk on the phone" },
    ],
  },
  {
    particle: "при",
    romanized: "pri",
    meaning: "at, by, near",
    usage: "Used for location near someone or visiting",
    examples: [
      { bulgarian: "Живея при родители", romanized: "Zhiveya pri roditeli", english: "I live with parents" },
      { bulgarian: "Отивам при приятел", romanized: "Otivam pri priyatel", english: "I go to a friend" },
    ],
  },
  {
    particle: "без",
    romanized: "bez",
    meaning: "without",
    usage: "Used for absence or lack",
    examples: [
      { bulgarian: "Живея без страх", romanized: "Zhiveya bez strah", english: "I live without fear" },
      { bulgarian: "Работя без почивка", romanized: "Rabotya bez pochivka", english: "I work without a break" },
    ],
  },
  {
    particle: "след",
    romanized: "sled",
    meaning: "after, behind",
    usage: "Used for sequence in time or position",
    examples: [
      { bulgarian: "Тръгвам след теб", romanized: "Tragvam sled teb", english: "I leave after you" },
      { bulgarian: "Вървя след групата", romanized: "Varvya sled grupata", english: "I walk behind the group" },
    ],
  },
];

const questions: Question[] = [
  { bulgarian: "_____ _____ Иван", english: "I give to Ivan", correctVerb: "давам", correctVerbRomanized: "davam", correctParticle: "на", correctParticleRomanized: "na", hint: "give + to", explanation: "'Давам на' (davam na) = give to" },
  { bulgarian: "_____ _____ стаята", english: "I enter the room", correctVerb: "влизам", correctVerbRomanized: "vlizam", correctParticle: "в", correctParticleRomanized: "v", hint: "enter + into", explanation: "'Влизам в' (vlizam v) = enter into" },
  { bulgarian: "_____ _____ училище", english: "I come from school", correctVerb: "идвам", correctVerbRomanized: "idvam", correctParticle: "от", correctParticleRomanized: "ot", hint: "come + from", explanation: "'Идвам от' (idvam ot) = come from" },
  { bulgarian: "_____ _____ теб", english: "I think about you", correctVerb: "мисля", correctVerbRomanized: "mislya", correctParticle: "за", correctParticleRomanized: "za", hint: "think + about", explanation: "'Мисля за' (mislya za) = think about" },
  { bulgarian: "_____ _____ деца", english: "I play with children", correctVerb: "играя", correctVerbRomanized: "igraya", correctParticle: "с", correctParticleRomanized: "s", hint: "play + with", explanation: "'Играя с' (igraya s) = play with" },
  { bulgarian: "_____ _____ вратата", english: "I stand by the door", correctVerb: "стоя", correctVerbRomanized: "stoya", correctParticle: "до", correctParticleRomanized: "do", hint: "stand + by", explanation: "'Стоя до' (stoya do) = stand by/near" },
  { bulgarian: "_____ _____ улицата", english: "I run along the street", correctVerb: "тичам", correctVerbRomanized: "ticham", correctParticle: "по", correctParticleRomanized: "po", hint: "run + along", explanation: "'Тичам по' (ticham po) = run along" },
  { bulgarian: "_____ _____ родители", english: "I live with parents", correctVerb: "живея", correctVerbRomanized: "zhiveya", correctParticle: "при", correctParticleRomanized: "pri", hint: "live + at/with (someone)", explanation: "'Живея при' (zhiveya pri) = live with (at someone's place)" },
  { bulgarian: "_____ _____ страх", english: "I live without fear", correctVerb: "живея", correctVerbRomanized: "zhiveya", correctParticle: "без", correctParticleRomanized: "bez", hint: "live + without", explanation: "'Живея без' (zhiveya bez) = live without" },
  { bulgarian: "_____ _____ теб", english: "I leave after you", correctVerb: "тръгвам", correctVerbRomanized: "tragvam", correctParticle: "след", correctParticleRomanized: "sled", hint: "leave + after", explanation: "'Тръгвам след' (tragvam sled) = leave after" },
  { bulgarian: "_____ _____ работа", english: "I leave for work", correctVerb: "тръгвам", correctVerbRomanized: "tragvam", correctParticle: "за", correctParticleRomanized: "za", hint: "leave + for", explanation: "'Тръгвам за' (tragvam za) = leave for (destination)" },
  { bulgarian: "_____ _____ офиса", english: "I work in the office", correctVerb: "работя", correctVerbRomanized: "rabotya", correctParticle: "в", correctParticleRomanized: "v", hint: "work + in", explanation: "'Работя в' (rabotya v) = work in" },
  { bulgarian: "_____ _____ телефона", english: "I talk on the phone", correctVerb: "говоря", correctVerbRomanized: "govorya", correctParticle: "по", correctParticleRomanized: "po", hint: "talk + on", explanation: "'Говоря по' (govorya po) = talk on (the phone)" },
  { bulgarian: "_____ _____ кучета", english: "I am afraid of dogs", correctVerb: "боя се", correctVerbRomanized: "boya se", correctParticle: "от", correctParticleRomanized: "ot", hint: "fear + of", explanation: "'Боя се от' (boya se ot) = afraid of" },
  { bulgarian: "_____ _____ нож", english: "I cut with a knife", correctVerb: "режа", correctVerbRomanized: "rezha", correctParticle: "с", correctParticleRomanized: "s", hint: "cut + with", explanation: "'Режа с' (rezha s) = cut with" },
  { bulgarian: "_____ _____ три", english: "I wait until three", correctVerb: "чакам", correctVerbRomanized: "chakam", correctParticle: "до", correctParticleRomanized: "do", hint: "wait + until", explanation: "'Чакам до' (chakam do) = wait until" },
  { bulgarian: "_____ _____ приятел", english: "I go to a friend", correctVerb: "отивам", correctVerbRomanized: "otivam", correctParticle: "при", correctParticleRomanized: "pri", hint: "go + to (a person)", explanation: "'Отивам при' (otivam pri) = go to (visit someone)" },
  { bulgarian: "_____ _____ почивка", english: "I work without a break", correctVerb: "работя", correctVerbRomanized: "rabotya", correctParticle: "без", correctParticleRomanized: "bez", hint: "work + without", explanation: "'Работя без' (rabotya bez) = work without" },
  { bulgarian: "_____ _____ групата", english: "I walk behind the group", correctVerb: "вървя", correctVerbRomanized: "varvya", correctParticle: "след", correctParticleRomanized: "sled", hint: "walk + behind", explanation: "'Вървя след' (varvya sled) = walk behind" },
  { bulgarian: "_____ _____ телевизия", english: "I watch on TV", correctVerb: "гледам", correctVerbRomanized: "gledam", correctParticle: "на", correctParticleRomanized: "na", hint: "watch + on", explanation: "'Гледам на' (gledam na) = watch on (TV)" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const ParticlesAdvancedLesson = () => {
  const [phase, setPhase] = useState<'learn' | 'quiz'>('learn');
  const [currentParticleIndex, setCurrentParticleIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [verbAnswer, setVerbAnswer] = useState("");
  const [particleAnswer, setParticleAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isRevision, setIsRevision] = useState(false);
  const verbInputRef = useRef<HTMLInputElement>(null);
  const particleInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateXP } = useAuth();
  const { canEarnXP, isLessonCompleted, refetch } = useUserProgress();

  useEffect(() => {
    setIsRevision(isLessonCompleted(LESSON_ID));
  }, []);

  useEffect(() => {
    if (phase === 'quiz') {
      const timer = setTimeout(() => verbInputRef.current?.focus(), 50);
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
    const verbNormalized = verbAnswer.toLowerCase().trim();
    const particleNormalized = particleAnswer.toLowerCase().trim();
    
    const verbCorrect = verbNormalized === currentQuestion.correctVerbRomanized || verbNormalized === currentQuestion.correctVerb;
    const particleCorrect = particleNormalized === currentQuestion.correctParticleRomanized || particleNormalized === currentQuestion.correctParticle;
    
    const correct = verbCorrect && particleCorrect;
    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const nextQuestion = async () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      setVerbAnswer("");
      setParticleAnswer("");
      setIsCorrect(null);
      setShowHint(false);
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
                Verb + Particle Combinations
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-5 h-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You'll type both verb and particle in the quiz</p>
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
                <p className="text-sm font-medium mb-2">Usage with verbs:</p>
                <p className="text-muted-foreground">{currentParticle.usage}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Verb + Particle examples (hover to see meaning):</p>
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
            <CardTitle className="text-center">Type both verb and particle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">{currentQuestion.bulgarian}</p>
              <p className="text-lg text-primary">{currentQuestion.english}</p>
              {showHint && (
                <p className="text-sm text-muted-foreground animate-fade-in">
                  Hint: {currentQuestion.hint}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Verb</label>
                <Input
                  ref={verbInputRef}
                  type="text"
                  placeholder="e.g., davam"
                  value={verbAnswer}
                  onChange={(e) => setVerbAnswer(e.target.value)}
                  disabled={isCorrect !== null}
                  className={cn(
                    "text-center text-lg py-4",
                    isCorrect === true && "border-green-500 bg-green-500/10",
                    isCorrect === false && "border-red-500 bg-red-500/10"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      particleInputRef.current?.focus();
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Particle</label>
                <Input
                  ref={particleInputRef}
                  type="text"
                  placeholder="e.g., na"
                  value={particleAnswer}
                  onChange={(e) => setParticleAnswer(e.target.value)}
                  disabled={isCorrect !== null}
                  className={cn(
                    "text-center text-lg py-4",
                    isCorrect === true && "border-green-500 bg-green-500/10",
                    isCorrect === false && "border-red-500 bg-red-500/10"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isCorrect === null && verbAnswer.trim() && particleAnswer.trim()) {
                      checkAnswer();
                    }
                  }}
                />
              </div>
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
                    <><X className="w-6 h-6" /><span className="font-bold">Answer: {currentQuestion.correctVerbRomanized} + {currentQuestion.correctParticleRomanized}</span></>
                  )}
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {isCorrect === null ? (
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShowHint(true)} disabled={showHint} className="flex-1">
                  Show Hint
                </Button>
                <Button onClick={checkAnswer} disabled={!verbAnswer.trim() || !particleAnswer.trim()} className="flex-1">
                  Check
                </Button>
              </div>
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

export default ParticlesAdvancedLesson;
