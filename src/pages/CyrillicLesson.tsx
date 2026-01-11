import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useLessonKeyboardNavigation } from "@/hooks/useLessonKeyboardNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Volume2, ArrowLeft, ArrowRight, Check, X, Plus, BookOpen, Keyboard, MousePointer, GraduationCap, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLessonNavigation } from "@/hooks/useLessonNavigation";
import { useTextToSpeechCached } from "@/hooks/useTextToSpeechCached";
import { useAuth } from "@/contexts/AuthContext";
import { LessonComplete } from "@/components/LessonComplete";
import { getLessonNavigation } from "@/lib/lessonNavigation";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useLingqVocabulary } from "@/hooks/useLingqVocabulary";
import { motion, AnimatePresence } from "framer-motion";

interface CyrillicLetter {
  cyrillic: string;
  latin: string;
  pronunciation: string;
  exampleWord: string;
  exampleRomanized: string;
  exampleEnglish: string;
  emoji: string;
}

// First 12 letters for Section 1, Lesson 1 (with simple vocabulary words)
const cyrillicAlphabet: CyrillicLetter[] = [
  { cyrillic: "А", latin: "A", pronunciation: "ah", exampleWord: "ябълка", exampleRomanized: "yabalka", exampleEnglish: "apple", emoji: "🍎" },
  { cyrillic: "Б", latin: "B", pronunciation: "beh", exampleWord: "банан", exampleRomanized: "banan", exampleEnglish: "banana", emoji: "🍌" },
  { cyrillic: "В", latin: "V", pronunciation: "veh", exampleWord: "вода", exampleRomanized: "voda", exampleEnglish: "water", emoji: "💧" },
  { cyrillic: "Г", latin: "G", pronunciation: "geh", exampleWord: "гора", exampleRomanized: "gora", exampleEnglish: "forest", emoji: "🌲" },
  { cyrillic: "Д", latin: "D", pronunciation: "deh", exampleWord: "дом", exampleRomanized: "dom", exampleEnglish: "house", emoji: "🏠" },
  { cyrillic: "Е", latin: "E", pronunciation: "eh", exampleWord: "елха", exampleRomanized: "elha", exampleEnglish: "fir tree", emoji: "🎄" },
  { cyrillic: "Ж", latin: "Zh", pronunciation: "zheh", exampleWord: "жаба", exampleRomanized: "zhaba", exampleEnglish: "frog", emoji: "🐸" },
  { cyrillic: "З", latin: "Z", pronunciation: "zeh", exampleWord: "заек", exampleRomanized: "zaek", exampleEnglish: "rabbit", emoji: "🐰" },
  { cyrillic: "И", latin: "I", pronunciation: "ee", exampleWord: "игра", exampleRomanized: "igra", exampleEnglish: "game", emoji: "🎮" },
  { cyrillic: "Й", latin: "Y", pronunciation: "ee kratko", exampleWord: "йогурт", exampleRomanized: "yogurt", exampleEnglish: "yogurt", emoji: "🥛" },
  { cyrillic: "К", latin: "K", pronunciation: "kah", exampleWord: "котка", exampleRomanized: "kotka", exampleEnglish: "cat", emoji: "🐱" },
  { cyrillic: "Л", latin: "L", pronunciation: "leh", exampleWord: "лимон", exampleRomanized: "limon", exampleEnglish: "lemon", emoji: "🍋" },
];

type LessonPhase = "learn" | "type" | "select" | "test-intro" | "test";
type TestMode = "type" | "select" | "mixed";

const LESSON_ID = "cyrillic-alphabet";
const XP_REWARD = 100;
const PASS_THRESHOLD = 0.9; // 90% to pass

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const CyrillicLesson = () => {
  // Phase management
  const [phase, setPhase] = useState<LessonPhase>("learn");
  const [testMode, setTestMode] = useState<TestMode>("mixed");
  
  // Learn phase
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  
  // Practice phases (type & select)
  const [practiceQuestions, setPracticeQuestions] = useState<CyrillicLetter[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  // Test phase
  const [testQuestions, setTestQuestions] = useState<Array<CyrillicLetter & { questionType: "type" | "select" }>>([]);
  const [testCorrect, setTestCorrect] = useState(0);
  const [testFailed, setTestFailed] = useState(false);
  
  // Completion
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  
  const { isPlaying, playPronunciation } = useTextToSpeechCached();
  const { toast } = useToast();
  const { handleBack, navigate } = useLessonNavigation();
  const { user, updateXP } = useAuth();
  const { saveProgress, isLessonCompleted } = useUserProgress();
  const { saveWord, canAddWord, getRemainingSlots } = useLingqVocabulary();
  const inputRef = useRef<HTMLInputElement>(null);

  const isRevision = isLessonCompleted(LESSON_ID);
  const nav = getLessonNavigation("cyrillic-alphabet");
  
  const currentLetter = cyrillicAlphabet[currentLetterIndex];
  const currentPracticeQuestion = practiceQuestions[currentStep];
  const currentTestQuestion = testQuestions[currentStep];

  // Calculate progress based on phase
  const getProgress = () => {
    const learnProgress = (currentLetterIndex / cyrillicAlphabet.length) * 25;
    const typeProgress = phase === "type" ? 25 + ((currentStep + 1) / practiceQuestions.length) * 25 : 0;
    const selectProgress = phase === "select" ? 50 + ((currentStep + 1) / practiceQuestions.length) * 25 : 0;
    const testProgress = phase === "test" ? 75 + ((currentStep + 1) / testQuestions.length) * 25 : 0;
    
    if (phase === "learn") return learnProgress;
    if (phase === "type") return 25 + typeProgress - 25;
    if (phase === "select") return 50 + selectProgress - 50;
    if (phase === "test-intro") return 75;
    if (phase === "test") return 75 + testProgress - 75;
    return 0;
  };

  // Start practice phases
  const startTypePractice = () => {
    const shuffled = shuffleArray(cyrillicAlphabet);
    setPracticeQuestions(shuffled);
    setCurrentStep(0);
    setCorrectAnswers(0);
    setUserAnswer("");
    setIsCorrect(null);
    setPhase("type");
  };

  const startSelectPractice = () => {
    const shuffled = shuffleArray(cyrillicAlphabet);
    setPracticeQuestions(shuffled);
    setCurrentStep(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setPhase("select");
  };

  const startTestIntro = () => {
    setPhase("test-intro");
  };

  const startTest = () => {
    // Generate test questions based on selected mode
    const letters = shuffleArray(cyrillicAlphabet);
    let questions: Array<CyrillicLetter & { questionType: "type" | "select" }> = [];
    
    if (testMode === "type") {
      questions = letters.map(l => ({ ...l, questionType: "type" as const }));
    } else if (testMode === "select") {
      questions = letters.map(l => ({ ...l, questionType: "select" as const }));
    } else {
      // Mixed: alternate between type and select
      questions = letters.map((l, i) => ({ ...l, questionType: (i % 2 === 0 ? "type" : "select") as "type" | "select" }));
    }
    
    setTestQuestions(questions);
    setCurrentStep(0);
    setTestCorrect(0);
    setTestFailed(false);
    setUserAnswer("");
    setSelectedAnswer(null);
    setIsCorrect(null);
    setPhase("test");
  };

  // Check answers
  const checkTypeAnswer = () => {
    const question = phase === "test" ? currentTestQuestion : currentPracticeQuestion;
    const correct = userAnswer.toLowerCase().trim() === question.latin.toLowerCase();
    setIsCorrect(correct);
    
    if (phase === "test") {
      if (correct) setTestCorrect(prev => prev + 1);
    } else {
      if (correct) setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (isCorrect !== null) return;
    
    const question = phase === "test" ? currentTestQuestion : currentPracticeQuestion;
    const correct = answer === question.latin;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    
    if (phase === "test") {
      if (correct) setTestCorrect(prev => prev + 1);
    } else {
      if (correct) setCorrectAnswers(prev => prev + 1);
    }
  };

  // Get options for select questions
  const getSelectOptions = () => {
    const question = phase === "test" ? currentTestQuestion : currentPracticeQuestion;
    if (!question) return [];
    
    const otherOptions = cyrillicAlphabet
      .filter(l => l.latin !== question.latin)
      .map(l => l.latin);
    const shuffledOthers = shuffleArray(otherOptions).slice(0, 3);
    return shuffleArray([question.latin, ...shuffledOthers]);
  };

  // Navigation
  const nextStep = useCallback(async () => {
    if (phase === "type" || phase === "select") {
      if (currentStep < practiceQuestions.length - 1) {
        setCurrentStep(prev => prev + 1);
        setUserAnswer("");
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        // Move to next phase
        if (phase === "type") {
          startSelectPractice();
        } else {
          startTestIntro();
        }
      }
    } else if (phase === "test") {
      if (currentStep < testQuestions.length - 1) {
        setCurrentStep(prev => prev + 1);
        setUserAnswer("");
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        // Check if passed
        const passRate = testCorrect / testQuestions.length;
        if (passRate >= PASS_THRESHOLD) {
          // Passed! Complete the lesson
          let xpEarned = 0;
          
          if (!isRevision && user?.id) {
            xpEarned = XP_REWARD;
            await updateXP(xpEarned);
            await saveProgress(LESSON_ID, xpEarned, testCorrect, testQuestions.length);
          }
          
          setEarnedXP(xpEarned);
          toast({
            title: isRevision ? "Revision Complete!" : "🎉 Assessment Passed!",
            description: isRevision 
              ? "Great practice!" 
              : `You scored ${Math.round(passRate * 100)}%! +${xpEarned} XP`,
          });
          setIsComplete(true);
        } else {
          // Failed - need to retry
          setTestFailed(true);
        }
      }
    }
  }, [phase, currentStep, practiceQuestions.length, testQuestions.length, testCorrect, isRevision, user?.id, updateXP, saveProgress, toast]);

  // Add word to vocabulary
  const handleAddToVocabulary = async (letter: CyrillicLetter) => {
    if (!canAddWord()) {
      toast({
        title: "Vocabulary limit reached",
        description: "Upgrade to premium for unlimited vocabulary",
        variant: "destructive",
      });
      return;
    }
    
    const result = await saveWord(
      letter.exampleWord,
      letter.exampleEnglish,
      letter.exampleRomanized
    );
    
    if (result) {
      setSavedWords(prev => new Set([...prev, letter.exampleWord]));
    }
  };

  // Auto-focus input
  useEffect(() => {
    if ((phase === "type" || (phase === "test" && currentTestQuestion?.questionType === "type")) && isCorrect === null) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [phase, currentStep, isCorrect, currentTestQuestion]);

  useLessonKeyboardNavigation({
    isAnswered: isCorrect !== null,
    onNext: nextStep,
    disabled: phase === "learn" || phase === "test-intro" || isComplete,
  });

  if (isComplete) {
    return (
      <LessonComplete
        lessonKey="cyrillic"
        score={earnedXP}
        xpEarned={earnedXP}
        correctAnswers={testCorrect}
        totalQuestions={testQuestions.length}
        isRevision={isRevision}
      />
    );
  }

  // Failed test - retry screen
  if (testFailed) {
    const passRate = testCorrect / testQuestions.length;
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Almost There!</h2>
            <p className="text-muted-foreground mb-4">
              You scored {Math.round(passRate * 100)}% but need 90% to pass.
            </p>
            <div className="text-sm text-muted-foreground">
              Correct: {testCorrect}/{testQuestions.length}
            </div>
          </div>
          
          <div className="space-y-3">
            <Button onClick={startTest} className="w-full">
              <GraduationCap className="w-4 h-4 mr-2" />
              Retry Assessment
            </Button>
            <Button variant="outline" onClick={() => setPhase("learn")} className="w-full">
              Review Letters First
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold flex-1">Cyrillic Alphabet</h1>
            {isRevision && (
              <Badge variant="secondary">Revision</Badge>
            )}
          </div>

          {/* Phase indicator */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Badge variant={phase === "learn" ? "default" : "outline"} className="gap-1">
              <BookOpen className="w-3 h-3" /> Learn
            </Badge>
            <Badge variant={phase === "type" ? "default" : "outline"} className="gap-1">
              <Keyboard className="w-3 h-3" /> Type
            </Badge>
            <Badge variant={phase === "select" ? "default" : "outline"} className="gap-1">
              <MousePointer className="w-3 h-3" /> Select
            </Badge>
            <Badge variant={phase === "test" || phase === "test-intro" ? "default" : "outline"} className="gap-1">
              <GraduationCap className="w-3 h-3" /> Test
            </Badge>
          </div>
          
          <Progress value={getProgress()} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          {/* LEARN PHASE */}
          {phase === "learn" && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-center">Learn the Letter</CardTitle>
                  <p className="text-center text-sm text-muted-foreground">
                    Letter {currentLetterIndex + 1} of {cyrillicAlphabet.length}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Letter display */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <span 
                        className={cn(
                          "text-9xl font-bold transition-all",
                          isPlaying && "animate-pulse text-primary"
                        )}
                      >
                        {currentLetter.cyrillic}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12"
                        onClick={() => playPronunciation(currentLetter.exampleWord)}
                      >
                        <Volume2 className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="text-3xl font-semibold text-primary mb-2">
                      {currentLetter.latin}
                    </div>
                    <p className="text-lg text-muted-foreground">
                      Pronounced: "<span className="font-medium">{currentLetter.pronunciation}</span>"
                    </p>
                  </div>

                  {/* Example word with emoji */}
                  <div className="bg-accent/50 rounded-xl p-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <span className="text-4xl">{currentLetter.emoji}</span>
                      <div className="text-left">
                        <p className="text-2xl font-bold">{currentLetter.exampleWord}</p>
                        <p className="text-lg text-muted-foreground">{currentLetter.exampleRomanized}</p>
                        <p className="text-primary">{currentLetter.exampleEnglish}</p>
                      </div>
                    </div>
                    
                    {/* Add to vocabulary button */}
                    <div className="flex justify-center mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToVocabulary(currentLetter)}
                        disabled={savedWords.has(currentLetter.exampleWord)}
                      >
                        {savedWords.has(currentLetter.exampleWord) ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Vocabulary ({getRemainingSlots()} slots left)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-4">
                    {currentLetterIndex > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentLetterIndex(prev => prev - 1)}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    )}
                    {currentLetterIndex < cyrillicAlphabet.length - 1 ? (
                      <Button 
                        onClick={() => setCurrentLetterIndex(prev => prev + 1)}
                        className="flex-1"
                      >
                        Next Letter
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={startTypePractice} className="flex-1">
                        Start Practice
                        <Keyboard className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* TYPE PHASE */}
          {phase === "type" && currentPracticeQuestion && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2">
                    <Keyboard className="w-5 h-5" />
                    Type the Latin Letter
                  </CardTitle>
                  <p className="text-center text-sm text-muted-foreground">
                    Question {currentStep + 1} of {practiceQuestions.length}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-8xl font-bold mb-4">{currentPracticeQuestion.cyrillic}</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {currentPracticeQuestion.emoji} {currentPracticeQuestion.exampleWord} = {currentPracticeQuestion.exampleEnglish}
                    </p>
                  </div>

                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Type the Latin letter..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={isCorrect !== null}
                    maxLength={2}
                    className={cn(
                      "text-center text-2xl py-6 uppercase",
                      isCorrect === true && "border-green-500 bg-green-500/10",
                      isCorrect === false && "border-red-500 bg-red-500/10"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (isCorrect !== null) nextStep();
                        else if (userAnswer.trim()) checkTypeAnswer();
                      }
                    }}
                  />

                  {isCorrect !== null && (
                    <div className={cn(
                      "flex items-center justify-center gap-2 p-4 rounded-lg",
                      isCorrect ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                    )}>
                      {isCorrect ? (
                        <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
                      ) : (
                        <><X className="w-6 h-6" /><span className="font-bold">The answer is: {currentPracticeQuestion.latin}</span></>
                      )}
                    </div>
                  )}

                  {isCorrect === null ? (
                    <Button onClick={checkTypeAnswer} disabled={!userAnswer.trim()} className="w-full">
                      Check Answer
                    </Button>
                  ) : (
                    <Button onClick={nextStep} className="w-full">
                      {currentStep < practiceQuestions.length - 1 ? "Next" : "Continue to Select Practice"}
                    </Button>
                  )}

                  <div className="text-center text-sm text-muted-foreground">
                    Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* SELECT PHASE */}
          {phase === "select" && currentPracticeQuestion && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2">
                    <MousePointer className="w-5 h-5" />
                    Select the Correct Letter
                  </CardTitle>
                  <p className="text-center text-sm text-muted-foreground">
                    Question {currentStep + 1} of {practiceQuestions.length}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-8xl font-bold mb-4">{currentPracticeQuestion.cyrillic}</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {currentPracticeQuestion.emoji} {currentPracticeQuestion.exampleWord} = {currentPracticeQuestion.exampleEnglish}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {getSelectOptions().map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className={cn(
                          "h-16 text-2xl font-bold",
                          isCorrect !== null && option === currentPracticeQuestion.latin && "bg-green-500 text-white border-green-500",
                          isCorrect === false && selectedAnswer === option && "bg-red-500 text-white border-red-500"
                        )}
                        onClick={() => handleSelectAnswer(option)}
                        disabled={isCorrect !== null}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>

                  {isCorrect !== null && (
                    <div className={cn(
                      "flex items-center justify-center gap-2 p-4 rounded-lg",
                      isCorrect ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                    )}>
                      {isCorrect ? (
                        <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
                      ) : (
                        <><X className="w-6 h-6" /><span className="font-bold">The answer is: {currentPracticeQuestion.latin}</span></>
                      )}
                    </div>
                  )}

                  {isCorrect !== null && (
                    <Button onClick={nextStep} className="w-full">
                      {currentStep < practiceQuestions.length - 1 ? "Next" : "Continue to Assessment"}
                    </Button>
                  )}

                  <div className="text-center text-sm text-muted-foreground">
                    Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* TEST INTRO PHASE */}
          {phase === "test-intro" && (
            <motion.div
              key="test-intro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2">
                    <GraduationCap className="w-6 h-6" />
                    Final Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-accent/50 rounded-xl p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">Ready to test your knowledge?</h3>
                    <p className="text-muted-foreground mb-4">
                      This assessment will test all {cyrillicAlphabet.length} letters you've learned.
                      You need to score <span className="font-bold text-primary">90% or higher</span> to pass and unlock the next lesson.
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Don't worry - you can retry as many times as needed!
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-medium text-center">Choose your answer style:</p>
                    <div className="grid gap-3">
                      <Button
                        variant={testMode === "type" ? "default" : "outline"}
                        className="h-auto py-4 flex-col gap-1"
                        onClick={() => setTestMode("type")}
                      >
                        <div className="flex items-center gap-2">
                          <Keyboard className="w-5 h-5" />
                          <span className="font-bold">Type Only</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Type the Latin letter for each Cyrillic letter</span>
                      </Button>
                      <Button
                        variant={testMode === "select" ? "default" : "outline"}
                        className="h-auto py-4 flex-col gap-1"
                        onClick={() => setTestMode("select")}
                      >
                        <div className="flex items-center gap-2">
                          <MousePointer className="w-5 h-5" />
                          <span className="font-bold">Select Only</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Choose from multiple choice options</span>
                      </Button>
                      <Button
                        variant={testMode === "mixed" ? "default" : "outline"}
                        className="h-auto py-4 flex-col gap-1"
                        onClick={() => setTestMode("mixed")}
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5" />
                          <span className="font-bold">Mixed (Recommended)</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Combination of typing and selecting</span>
                      </Button>
                    </div>
                  </div>

                  <Button onClick={startTest} className="w-full" size="lg">
                    Start Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* TEST PHASE */}
          {phase === "test" && currentTestQuestion && (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Assessment - {currentTestQuestion.questionType === "type" ? "Type" : "Select"}
                  </CardTitle>
                  <p className="text-center text-sm text-muted-foreground">
                    Question {currentStep + 1} of {testQuestions.length} • Need 90% to pass
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-8xl font-bold mb-4">{currentTestQuestion.cyrillic}</div>
                  </div>

                  {currentTestQuestion.questionType === "type" ? (
                    <>
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Type the Latin letter..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={isCorrect !== null}
                        maxLength={2}
                        className={cn(
                          "text-center text-2xl py-6 uppercase",
                          isCorrect === true && "border-green-500 bg-green-500/10",
                          isCorrect === false && "border-red-500 bg-red-500/10"
                        )}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (isCorrect !== null) nextStep();
                            else if (userAnswer.trim()) checkTypeAnswer();
                          }
                        }}
                      />
                      {isCorrect === null && (
                        <Button onClick={checkTypeAnswer} disabled={!userAnswer.trim()} className="w-full">
                          Check Answer
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {getSelectOptions().map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={cn(
                            "h-16 text-2xl font-bold",
                            isCorrect !== null && option === currentTestQuestion.latin && "bg-green-500 text-white border-green-500",
                            isCorrect === false && selectedAnswer === option && "bg-red-500 text-white border-red-500"
                          )}
                          onClick={() => handleSelectAnswer(option)}
                          disabled={isCorrect !== null}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}

                  {isCorrect !== null && (
                    <>
                      <div className={cn(
                        "flex items-center justify-center gap-2 p-4 rounded-lg",
                        isCorrect ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                      )}>
                        {isCorrect ? (
                          <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
                        ) : (
                          <><X className="w-6 h-6" /><span className="font-bold">The answer is: {currentTestQuestion.latin}</span></>
                        )}
                      </div>
                      <Button onClick={nextStep} className="w-full">
                        {currentStep < testQuestions.length - 1 ? "Next" : "Finish Assessment"}
                      </Button>
                    </>
                  )}

                  <div className="text-center text-sm text-muted-foreground">
                    Score: {testCorrect}/{currentStep + (isCorrect !== null ? 1 : 0)} 
                    ({currentStep + (isCorrect !== null ? 1 : 0) > 0 
                      ? Math.round((testCorrect / (currentStep + (isCorrect !== null ? 1 : 0))) * 100) 
                      : 0}%)
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next/Prev lesson navigation */}
        {phase === "learn" && (
          <div className="flex justify-between mt-6 max-w-2xl mx-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => nav.prevRoute && navigate(nav.prevRoute)}
              disabled={!nav.hasPrev}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {nav.prevTitle || "Previous"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => nav.nextRoute && navigate(nav.nextRoute)}
              disabled={!nav.hasNext}
            >
              {nav.nextTitle || "Next"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
