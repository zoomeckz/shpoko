import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, X, Trophy, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { lessons } from "@/data/lessons";

// Comprehensive question banks for each tier
const beginnerQuestions = [
  { type: "typing", question: "Type the Latin equivalent for: А", answer: "a" },
  { type: "typing", question: "Type the Latin equivalent for: Б", answer: "b" },
  { type: "typing", question: "Type the transliteration: Здравей", answer: "zdravey" },
  { type: "typing", question: "Type the transliteration: Благодаря", answer: "blagodarya" },
  { type: "typing", question: "Type the transliteration for 5: пет", answer: "pet" },
  { type: "typing", question: "Type the transliteration for 10: десет", answer: "deset" },
  { type: "mcq", question: "What does 'Добро утро' mean?", options: ["Good night", "Good morning", "Goodbye", "Thank you"], answer: "Good morning" },
  { type: "mcq", question: "Which color is 'червено'?", options: ["Blue", "Green", "Red", "Yellow"], answer: "Red" },
  { type: "mcq", question: "What is 'куче' in English?", options: ["Cat", "Dog", "Bird", "Fish"], answer: "Dog" },
  { type: "typing", question: "Type the Bulgarian number for 3: три", answer: "tri" },
  { type: "mcq", question: "What shape is 'кръг'?", options: ["Square", "Triangle", "Circle", "Rectangle"], answer: "Circle" },
  { type: "typing", question: "Type 'Hello (informal)' in transliteration", answer: "zdravey" },
  { type: "mcq", question: "What does 'Моля' mean?", options: ["Sorry", "Please/You're welcome", "Hello", "Goodbye"], answer: "Please/You're welcome" },
  { type: "typing", question: "Type the color 'green' in Bulgarian transliteration", answer: "zeleno" },
  { type: "mcq", question: "What animal is 'котка'?", options: ["Dog", "Cat", "Horse", "Bird"], answer: "Cat" },
];

const intermediateQuestions = [
  { type: "typing", question: "Type the transliteration for 20+: двадесет", answer: "dvadeset" },
  { type: "typing", question: "Type 'Monday' in transliteration: понеделник", answer: "ponedelnik" },
  { type: "mcq", question: "What does 'вкусно' mean?", options: ["Expensive", "Delicious", "Cheap", "Hot"], answer: "Delicious" },
  { type: "typing", question: "Type 'bread' in transliteration: хляб", answer: "hlyab" },
  { type: "mcq", question: "What profession is 'лекар'?", options: ["Teacher", "Doctor", "Engineer", "Chef"], answer: "Doctor" },
  { type: "typing", question: "Type 'sister' in transliteration: сестра", answer: "sestra" },
  { type: "mcq", question: "What does 'Искам да поръчам' mean?", options: ["I want to pay", "I want to order", "I want to leave", "I want water"], answer: "I want to order" },
  { type: "typing", question: "Type 'Friday' in transliteration: петък", answer: "petak" },
  { type: "mcq", question: "What is 'баща' in English?", options: ["Mother", "Father", "Brother", "Uncle"], answer: "Father" },
  { type: "typing", question: "Type 'water' in transliteration: вода", answer: "voda" },
  { type: "mcq", question: "What job is 'учител'?", options: ["Student", "Teacher", "Doctor", "Driver"], answer: "Teacher" },
  { type: "typing", question: "Type 'coffee' in transliteration: кафе", answer: "kafe" },
  { type: "mcq", question: "What does 'сметката, моля' mean?", options: ["More food please", "The bill please", "Water please", "Menu please"], answer: "The bill please" },
  { type: "typing", question: "Type 'brother' in transliteration: брат", answer: "brat" },
  { type: "mcq", question: "What day is 'събота'?", options: ["Sunday", "Saturday", "Friday", "Monday"], answer: "Saturday" },
];

const advancedQuestions = [
  { type: "typing", question: "Type 'big/large' in transliteration: голям", answer: "golyam" },
  { type: "mcq", question: "What does 'Обичам' mean?", options: ["I hate", "I love", "I want", "I need"], answer: "I love" },
  { type: "typing", question: "Type 'to go' in transliteration: отивам", answer: "otivam" },
  { type: "mcq", question: "What direction is 'наляво'?", options: ["Right", "Left", "Straight", "Back"], answer: "Left" },
  { type: "typing", question: "Type 'cold (weather)' in transliteration: студено", answer: "studeno" },
  { type: "mcq", question: "What does 'Вали дъжд' mean?", options: ["It's snowing", "It's raining", "It's sunny", "It's windy"], answer: "It's raining" },
  { type: "typing", question: "Type 'beautiful' in transliteration: красив", answer: "krasiv" },
  { type: "mcq", question: "What verb is 'ям'?", options: ["To drink", "To eat", "To sleep", "To run"], answer: "To eat" },
  { type: "typing", question: "Type 'straight ahead' in transliteration: направо", answer: "napravo" },
  { type: "mcq", question: "What does 'Слънчево е' mean?", options: ["It's cloudy", "It's rainy", "It's sunny", "It's cold"], answer: "It's sunny" },
  { type: "typing", question: "Type 'to speak' in transliteration: говоря", answer: "govorya" },
  { type: "mcq", question: "What adjective is 'бърз'?", options: ["Slow", "Fast", "Big", "Small"], answer: "Fast" },
  { type: "typing", question: "Type 'interesting' in transliteration: интересен", answer: "interesen" },
  { type: "mcq", question: "What does 'Къде е...' mean?", options: ["What is...", "Where is...", "Who is...", "When is..."], answer: "Where is..." },
  { type: "typing", question: "Type 'to read' in transliteration: чета", answer: "cheta" },
];

const tierConfig = {
  beginner: { title: "Beginner Assessment", questions: beginnerQuestions, xpReward: 150 },
  intermediate: { title: "Intermediate Assessment", questions: intermediateQuestions, xpReward: 200 },
  advanced: { title: "Advanced Assessment", questions: advancedQuestions, xpReward: 250 },
};

const TierAssessment = () => {
  const { tier } = useParams<{ tier: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, updateXP } = useAuth();
  const { progress, isLessonCompleted, saveProgress } = useUserProgress();
  
  const handleBack = () => {
    const returnTo = location.state?.returnCategory;
    if (returnTo) {
      navigate("/", { state: { selectedCategory: returnTo } });
    } else {
      navigate("/");
    }
  };
  
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const config = tierConfig[tier as keyof typeof tierConfig];
  const assessmentId = `assessment-${tier}`;
  const isRevision = isLessonCompleted(assessmentId);

  // Check if tier is unlocked
  const tierLessons = lessons.filter(l => l.difficulty === tier && !l.isPremium);
  const completedTierLessons = tierLessons.filter(l => progress[l.id]?.completed).length;
  const isUnlocked = completedTierLessons >= tierLessons.length;

  // Generate random 10 questions
  const questions = useMemo(() => {
    if (!config) return [];
    const shuffled = [...config.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, [config]);

  const currentQuestion = questions[currentStep];
  const progressPercent = ((currentStep + 1) / questions.length) * 100;

  useEffect(() => {
    if (!config) {
      navigate("/");
    }
  }, [config, navigate]);

  if (!config) return null;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" size="sm" onClick={handleBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <Card className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-4">{config.title} Locked</h2>
            <p className="text-muted-foreground mb-4">
              Complete all {tier} lessons to unlock this assessment.
            </p>
            <p className="text-sm">
              Progress: {completedTierLessons}/{tierLessons.length} lessons completed
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const checkAnswer = () => {
    const isTyping = currentQuestion.type === "typing";
    const userInput = isTyping ? userAnswer.toLowerCase().trim() : selectedOption?.toLowerCase();
    const correct = userInput === currentQuestion.answer.toLowerCase();
    
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUserAnswer("");
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      let xpEarned = 0;
      
      if (!isRevision && user?.id) {
        const baseXP = Math.round((correctAnswers / questions.length) * config.xpReward);
        xpEarned = baseXP > 0 ? baseXP : config.xpReward;
        await updateXP(xpEarned);
        await saveProgress(assessmentId, xpEarned, correctAnswers, questions.length);
      }
      
      toast({
        title: isRevision ? "Assessment Revision Complete!" : "Assessment Complete!",
        description: isRevision 
          ? `Score: ${correctAnswers}/${questions.length}` 
          : `You earned ${xpEarned} XP! Score: ${correctAnswers}/${questions.length}`,
      });
      setIsComplete(true);
    }
  };

  if (isComplete) {
    const passed = correctAnswers >= questions.length * 0.7;
    
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Trophy className={cn("w-20 h-20 mx-auto mb-4", passed ? "text-yellow-500" : "text-muted-foreground")} />
            <h2 className="text-3xl font-bold mb-4">
              {passed ? "Assessment Passed!" : "Keep Practicing!"}
            </h2>
            <p className="text-xl mb-2">
              Score: {correctAnswers}/{questions.length} ({Math.round((correctAnswers/questions.length)*100)}%)
            </p>
            <p className="text-muted-foreground mb-6">
              {passed ? "Great job! You've mastered this tier." : "You need 70% to pass. Review the lessons and try again!"}
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleBack}>
                Back to Home
              </Button>
              {!passed && (
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            {isRevision && <span className="text-xs bg-muted px-2 py-1 rounded">Revision</span>}
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Question {currentStep + 1} of {questions.length}</span>
              <span className="text-sm font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        <Card className="p-8">
          <h2 className="text-xl font-bold text-center mb-6">{currentQuestion.question}</h2>
          
          {currentQuestion.type === "typing" ? (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Type your answer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isCorrect !== null}
                className={cn(
                  "text-center text-xl py-6",
                  isCorrect === true && "border-green-500 bg-green-500/10",
                  isCorrect === false && "border-red-500 bg-red-500/10"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (isCorrect !== null) nextQuestion();
                    else if (userAnswer.trim()) checkAnswer();
                  }
                }}
                autoFocus
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => !isCorrect && setSelectedOption(option)}
                  disabled={isCorrect !== null}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all",
                    selectedOption === option && isCorrect === null && "border-primary bg-primary/10",
                    isCorrect !== null && option === currentQuestion.answer && "border-green-500 bg-green-500/10",
                    isCorrect === false && selectedOption === option && option !== currentQuestion.answer && "border-red-500 bg-red-500/10",
                    isCorrect === null && selectedOption !== option && "border-border hover:border-primary/50"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {isCorrect !== null && (
            <div className={cn(
              "flex items-center justify-center gap-2 p-4 rounded-lg mt-4 animate-fade-in",
              isCorrect ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
            )}>
              {isCorrect ? (
                <><Check className="w-6 h-6" /><span className="font-bold">Correct!</span></>
              ) : (
                <><X className="w-6 h-6" /><span className="font-bold">The answer is: {currentQuestion.answer}</span></>
              )}
            </div>
          )}

          <div className="mt-6">
            {isCorrect === null ? (
              <Button 
                onClick={checkAnswer} 
                disabled={currentQuestion.type === "typing" ? !userAnswer.trim() : !selectedOption} 
                className="w-full"
              >
                Check Answer
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="w-full">
                {currentStep < questions.length - 1 ? "Next" : "Complete Assessment"}
              </Button>
            )}
          </div>

          <div className="text-center text-muted-foreground mt-4">
            Correct: {correctAnswers}/{currentStep + (isCorrect !== null ? 1 : 0)}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TierAssessment;