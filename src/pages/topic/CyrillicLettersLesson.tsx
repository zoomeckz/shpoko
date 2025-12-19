import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LessonComplete } from "@/components/LessonComplete";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useLessonKeyboardNavigation } from "@/hooks/useLessonKeyboardNavigation";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface CyrillicLetter {
  cyrillic: string;
  romanized: string;
  pronunciation: string;
  example: string;
  exampleRomanized: string;
  exampleEnglish: string;
}

const LESSON_ID = "cyrillic-letters";
const XP_REWARD = 80;

const cyrillicLetters: CyrillicLetter[] = [
  { cyrillic: "А", romanized: "A", pronunciation: "ah", example: "Ана", exampleRomanized: "Ana", exampleEnglish: "Anna (name)" },
  { cyrillic: "Б", romanized: "B", pronunciation: "buh", example: "баба", exampleRomanized: "baba", exampleEnglish: "grandmother" },
  { cyrillic: "В", romanized: "V", pronunciation: "vuh", example: "вода", exampleRomanized: "voda", exampleEnglish: "water" },
  { cyrillic: "Г", romanized: "G", pronunciation: "guh", example: "град", exampleRomanized: "grad", exampleEnglish: "city" },
  { cyrillic: "Д", romanized: "D", pronunciation: "duh", example: "дом", exampleRomanized: "dom", exampleEnglish: "home" },
  { cyrillic: "Е", romanized: "E", pronunciation: "eh", example: "едно", exampleRomanized: "edno", exampleEnglish: "one" },
  { cyrillic: "Ж", romanized: "Zh", pronunciation: "zhuh", example: "жена", exampleRomanized: "zhena", exampleEnglish: "woman" },
  { cyrillic: "З", romanized: "Z", pronunciation: "zuh", example: "зима", exampleRomanized: "zima", exampleEnglish: "winter" },
  { cyrillic: "И", romanized: "I", pronunciation: "ee", example: "име", exampleRomanized: "ime", exampleEnglish: "name" },
  { cyrillic: "Й", romanized: "Y", pronunciation: "y (short)", example: "йогурт", exampleRomanized: "yogurt", exampleEnglish: "yogurt" },
  { cyrillic: "К", romanized: "K", pronunciation: "kuh", example: "кола", exampleRomanized: "kola", exampleEnglish: "car" },
  { cyrillic: "Л", romanized: "L", pronunciation: "luh", example: "лято", exampleRomanized: "lyato", exampleEnglish: "summer" },
  { cyrillic: "М", romanized: "M", pronunciation: "muh", example: "мама", exampleRomanized: "mama", exampleEnglish: "mom" },
  { cyrillic: "Н", romanized: "N", pronunciation: "nuh", example: "нос", exampleRomanized: "nos", exampleEnglish: "nose" },
  { cyrillic: "О", romanized: "O", pronunciation: "oh", example: "око", exampleRomanized: "oko", exampleEnglish: "eye" },
  { cyrillic: "П", romanized: "P", pronunciation: "puh", example: "папа", exampleRomanized: "papa", exampleEnglish: "dad" },
  { cyrillic: "Р", romanized: "R", pronunciation: "ruh (rolled)", example: "риба", exampleRomanized: "riba", exampleEnglish: "fish" },
  { cyrillic: "С", romanized: "S", pronunciation: "suh", example: "сол", exampleRomanized: "sol", exampleEnglish: "salt" },
  { cyrillic: "Т", romanized: "T", pronunciation: "tuh", example: "там", exampleRomanized: "tam", exampleEnglish: "there" },
  { cyrillic: "У", romanized: "U", pronunciation: "oo", example: "ухо", exampleRomanized: "uho", exampleEnglish: "ear" },
  { cyrillic: "Ф", romanized: "F", pronunciation: "fuh", example: "филм", exampleRomanized: "film", exampleEnglish: "film" },
  { cyrillic: "Х", romanized: "H", pronunciation: "huh (guttural)", example: "хляб", exampleRomanized: "hlyab", exampleEnglish: "bread" },
  { cyrillic: "Ц", romanized: "Ts", pronunciation: "ts", example: "цвете", exampleRomanized: "tsvete", exampleEnglish: "flower" },
  { cyrillic: "Ч", romanized: "Ch", pronunciation: "ch", example: "чай", exampleRomanized: "chay", exampleEnglish: "tea" },
  { cyrillic: "Ш", romanized: "Sh", pronunciation: "sh", example: "шоколад", exampleRomanized: "shokolad", exampleEnglish: "chocolate" },
  { cyrillic: "Щ", romanized: "Sht", pronunciation: "sht", example: "щастие", exampleRomanized: "shtastie", exampleEnglish: "happiness" },
  { cyrillic: "Ъ", romanized: "A (schwa)", pronunciation: "uh (schwa)", example: "ъгъл", exampleRomanized: "agal", exampleEnglish: "corner" },
  { cyrillic: "Ь", romanized: "' (soft sign)", pronunciation: "(softens preceding consonant)", example: "учител", exampleRomanized: "uchitel'", exampleEnglish: "teacher" },
  { cyrillic: "Ю", romanized: "Yu", pronunciation: "yoo", example: "юни", exampleRomanized: "yuni", exampleEnglish: "June" },
  { cyrillic: "Я", romanized: "Ya", pronunciation: "yah", example: "ябълка", exampleRomanized: "yabalka", exampleEnglish: "apple" },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const CyrillicLettersLesson = () => {
  const [phase, setPhase] = useState<'learn' | 'quiz' | 'match'>('learn');
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [quizLetters, setQuizLetters] = useState<CyrillicLetter[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isRevision, setIsRevision] = useState(false);
  
  // Matching game state
  const [matchPairs, setMatchPairs] = useState<CyrillicLetter[]>([]);
  const [selectedCyrillic, setSelectedCyrillic] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongMatch, setWrongMatch] = useState<{cyrillic: string; romanized: string} | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateXP } = useAuth();
  const { canEarnXP, isLessonCompleted, refetch } = useUserProgress();
  const { playPronunciation } = useTextToSpeech();

  useEffect(() => {
    setIsRevision(isLessonCompleted(LESSON_ID));
  }, []);

  const startQuiz = () => {
    const shuffled = shuffleArray(cyrillicLetters).slice(0, 15);
    setQuizLetters(shuffled);
    setPhase('quiz');
    setCurrentStep(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const startMatchingGame = () => {
    const shuffled = shuffleArray(cyrillicLetters).slice(0, 8);
    setMatchPairs(shuffled);
    setSelectedCyrillic(null);
    setMatchedPairs(new Set());
    setWrongMatch(null);
    setPhase('match');
  };

  const currentLetter = cyrillicLetters[currentLetterIndex];
  const currentQuizLetter = quizLetters[currentStep];
  
  const progress = phase === 'learn' 
    ? ((currentLetterIndex + 1) / cyrillicLetters.length) * 100 
    : phase === 'quiz'
    ? ((currentStep + 1) / quizLetters.length) * 100
    : (matchedPairs.size / matchPairs.length) * 100;

  const handleQuizSelect = (answer: string) => {
    if (isCorrect !== null) return;
    setSelectedAnswer(answer);
    const correct = answer === currentQuizLetter.romanized;
    setIsCorrect(correct);
    if (correct) setCorrectAnswers(prev => prev + 1);
  };

  const getQuizOptions = () => {
    if (!currentQuizLetter) return [];
    const otherOptions = cyrillicLetters
      .filter(l => l.romanized !== currentQuizLetter.romanized)
      .map(l => l.romanized);
    const shuffledOthers = shuffleArray(otherOptions).slice(0, 3);
    return shuffleArray([currentQuizLetter.romanized, ...shuffledOthers]);
  };

  const nextQuestion = () => {
    if (currentStep < quizLetters.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      startMatchingGame();
    }
  };

  // Matching game logic
  const handleCyrillicClick = (cyrillic: string) => {
    if (matchedPairs.has(cyrillic)) return;
    setSelectedCyrillic(cyrillic);
    setWrongMatch(null);
  };

  const handleRomanizedClick = (romanized: string) => {
    if (!selectedCyrillic) return;
    
    const pair = matchPairs.find(p => p.cyrillic === selectedCyrillic);
    if (!pair) return;
    
    if (pair.romanized === romanized) {
      setMatchedPairs(new Set([...matchedPairs, selectedCyrillic]));
      setMatchScore(prev => prev + 1);
      setSelectedCyrillic(null);
      
      // Check if all matched
      if (matchedPairs.size + 1 === matchPairs.length) {
        completeLesson();
      }
    } else {
      setWrongMatch({ cyrillic: selectedCyrillic, romanized });
      setTimeout(() => {
        setWrongMatch(null);
        setSelectedCyrillic(null);
      }, 800);
    }
  };

  const completeLesson = async () => {
    const canEarn = canEarnXP(LESSON_ID);
    let xpEarned = 0;
    
    const totalScore = correctAnswers + matchScore;
    const totalQuestions = quizLetters.length + matchPairs.length;
    
    if (canEarn && !isRevision && user?.id) {
      const baseXP = Math.round((totalScore / totalQuestions) * XP_REWARD);
      xpEarned = baseXP;
      await updateXP(xpEarned);
      
      await supabase.from("user_progress").upsert({
        user_id: user.id,
        lesson_id: LESSON_ID,
        completed: true,
        score: xpEarned,
        correct_answers: totalScore,
        total_answers: totalQuestions,
        completed_at: new Date().toISOString(),
      }, { onConflict: "user_id,lesson_id" });
      
      refetch();
    }
    
    setEarnedXP(xpEarned);
    setIsComplete(true);
  };

  useLessonKeyboardNavigation({
    isAnswered: isCorrect !== null,
    onNext: nextQuestion,
    disabled: isComplete || phase !== 'quiz',
  });

  const handleBack = () => {
    navigate("/", { state: { selectedCategory: location.state?.selectedCategory || "lessons" } });
  };

  const playLetter = (text: string) => {
    playPronunciation(text);
  };

  if (isComplete) {
    const totalQuestions = quizLetters.length + matchPairs.length;
    const totalCorrect = correctAnswers + matchScore;
    return (
      <LessonComplete
        lessonKey={LESSON_ID}
        score={earnedXP}
        xpEarned={earnedXP}
        correctAnswers={totalCorrect}
        totalQuestions={totalQuestions}
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
            <span className="text-sm font-medium">{currentLetterIndex + 1}/{cyrillicLetters.length}</span>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">Learn the Cyrillic Alphabet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <p className="text-8xl font-bold">{currentLetter.cyrillic}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => playLetter(currentLetter.example)}
                  >
                    <Volume2 className="h-6 w-6" />
                  </Button>
                </div>
                <p className="text-3xl font-semibold text-primary mb-2">{currentLetter.romanized}</p>
                <p className="text-xl text-muted-foreground">Pronounced: "{currentLetter.pronunciation}"</p>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Example Word:</p>
                <div className="text-center">
                  <p className="text-2xl font-bold">{currentLetter.example}</p>
                  <p className="text-lg text-muted-foreground">{currentLetter.exampleRomanized}</p>
                  <p className="text-primary">{currentLetter.exampleEnglish}</p>
                </div>
              </div>

              <div className="flex gap-4">
                {currentLetterIndex > 0 && (
                  <Button variant="outline" onClick={() => setCurrentLetterIndex(currentLetterIndex - 1)} className="flex-1">
                    Previous
                  </Button>
                )}
                {currentLetterIndex < cyrillicLetters.length - 1 ? (
                  <Button onClick={() => setCurrentLetterIndex(currentLetterIndex + 1)} className="flex-1">
                    Next Letter
                  </Button>
                ) : (
                  <Button onClick={startQuiz} className="flex-1">
                    Start Quiz
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
  if (phase === 'quiz') {
    if (!currentQuizLetter) return null;
    const options = getQuizOptions();

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
            <span className="text-sm font-medium">{currentStep + 1}/{quizLetters.length}</span>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">What is this letter?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-8xl font-bold mb-4">{currentQuizLetter.cyrillic}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={cn(
                      "h-16 text-2xl font-bold",
                      isCorrect !== null && option === currentQuizLetter.romanized && "bg-green-500 text-white border-green-500",
                      isCorrect === false && selectedAnswer === option && "bg-red-500 text-white border-red-500"
                    )}
                    onClick={() => handleQuizSelect(option)}
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
                    {isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                    <span className="font-bold">{isCorrect ? "Correct!" : "Incorrect"}</span>
                  </div>
                  {!isCorrect && (
                    <p className="text-center text-sm">
                      The correct answer is <span className="font-bold">{currentQuizLetter.romanized}</span>
                    </p>
                  )}
                  <p className="text-center text-sm text-muted-foreground mt-1">
                    {currentQuizLetter.cyrillic} is pronounced "{currentQuizLetter.pronunciation}"
                  </p>
                </div>
              )}

              {isCorrect !== null && (
                <Button onClick={nextQuestion} className="w-full">
                  {currentStep < quizLetters.length - 1 ? "Next Letter" : "Start Matching Game"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Matching game phase
  if (phase === 'match') {
    const shuffledCyrillic = shuffleArray([...matchPairs].filter(p => !matchedPairs.has(p.cyrillic)));
    const shuffledRomanized = shuffleArray([...matchPairs].filter(p => !matchedPairs.has(p.cyrillic)));

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <Progress value={progress} className="h-3" />
            </div>
            <span className="text-sm font-medium">{matchedPairs.size}/{matchPairs.length} matched</span>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">Match the Letters!</CardTitle>
              <p className="text-center text-muted-foreground">
                Click a Cyrillic letter, then click its romanization
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                {/* Cyrillic column */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-center mb-2">Cyrillic</p>
                  {shuffledCyrillic.map((letter) => (
                    <Button
                      key={letter.cyrillic}
                      variant="outline"
                      className={cn(
                        "w-full h-14 text-3xl font-bold transition-all",
                        selectedCyrillic === letter.cyrillic && "ring-2 ring-primary bg-primary/10",
                        wrongMatch?.cyrillic === letter.cyrillic && "bg-red-500/20 border-red-500",
                        matchedPairs.has(letter.cyrillic) && "opacity-30 pointer-events-none"
                      )}
                      onClick={() => handleCyrillicClick(letter.cyrillic)}
                      disabled={matchedPairs.has(letter.cyrillic)}
                    >
                      {letter.cyrillic}
                    </Button>
                  ))}
                </div>

                {/* Romanized column */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-center mb-2">Romanized</p>
                  {shuffledRomanized.map((letter) => (
                    <Button
                      key={letter.romanized}
                      variant="outline"
                      className={cn(
                        "w-full h-14 text-xl font-bold transition-all",
                        wrongMatch?.romanized === letter.romanized && "bg-red-500/20 border-red-500",
                        matchedPairs.has(letter.cyrillic) && "opacity-30 pointer-events-none"
                      )}
                      onClick={() => handleRomanizedClick(letter.romanized)}
                      disabled={matchedPairs.has(letter.cyrillic) || !selectedCyrillic}
                    >
                      {letter.romanized}
                    </Button>
                  ))}
                </div>
              </div>

              {matchedPairs.size > 0 && matchedPairs.size < matchPairs.length && (
                <div className="mt-6 p-3 bg-green-500/10 rounded-lg text-center">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Great job! {matchedPairs.size} of {matchPairs.length} matched
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};
