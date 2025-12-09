import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LessonComplete } from "@/components/LessonComplete";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

interface Animal {
  emoji: string;
  english: string;
  bulgarian: string;
  romanized: string;
}

const ANIMALS: Animal[] = [
  { emoji: "🐕", english: "Dog", bulgarian: "куче", romanized: "kuche" },
  { emoji: "🐈", english: "Cat", bulgarian: "котка", romanized: "kotka" },
  { emoji: "🐦", english: "Bird", bulgarian: "птица", romanized: "ptitsa" },
  { emoji: "🐟", english: "Fish", bulgarian: "риба", romanized: "riba" },
  { emoji: "🐎", english: "Horse", bulgarian: "кон", romanized: "kon" },
  { emoji: "🐄", english: "Cow", bulgarian: "крава", romanized: "krava" },
  { emoji: "🐖", english: "Pig", bulgarian: "прасе", romanized: "prase" },
  { emoji: "🐑", english: "Sheep", bulgarian: "овца", romanized: "ovtsa" },
  { emoji: "🐐", english: "Goat", bulgarian: "коза", romanized: "koza" },
  { emoji: "🐓", english: "Rooster", bulgarian: "петел", romanized: "petel" },
  { emoji: "🦆", english: "Duck", bulgarian: "патица", romanized: "patitsa" },
  { emoji: "🐇", english: "Rabbit", bulgarian: "заек", romanized: "zaek" },
  { emoji: "🐻", english: "Bear", bulgarian: "мечка", romanized: "mechka" },
  { emoji: "🦊", english: "Fox", bulgarian: "лисица", romanized: "lisitsa" },
  { emoji: "🐺", english: "Wolf", bulgarian: "вълк", romanized: "valk" },
];

const AnimalsLesson = () => {
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
  const { toast } = useToast();
  const { playCorrect, playIncorrect, playComplete } = useSoundEffects();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const currentAnimal = ANIMALS[currentStep];
  const progress = ((currentStep + 1) / ANIMALS.length) * 100;

  const checkAnswer = () => {
    const normalizedInput = userInput.toLowerCase().trim();
    const isCorrect = normalizedInput === currentAnimal.romanized.toLowerCase();
    
    setFeedback(isCorrect ? "correct" : "incorrect");
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      playCorrect();
      setScore(prev => prev + (attempts === 0 ? 10 : 5));
    } else {
      playIncorrect();
    }
  };

  const nextStep = async () => {
    if (currentStep < ANIMALS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUserInput("");
      setFeedback(null);
      setAttempts(0);
    } else {
      // Complete lesson
      playComplete();
      
      if (user) {
        await updateXP(score);
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_id: "animals-topic",
          completed: true,
          score,
          correct_answers: ANIMALS.length,
          total_answers: ANIMALS.length,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
      }
      
      toast({
        title: "Lesson Complete!",
        description: `You earned ${score} XP!`,
      });
      setIsComplete(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (feedback === "correct") {
        nextStep();
      } else if (!feedback) {
        checkAnswer();
      }
    }
  };

  if (isComplete) {
    return <LessonComplete lessonKey="animals-topic" score={score} xpEarned={score} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Animals 🐾</h1>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {ANIMALS.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="p-8 text-center">
          <div className="text-9xl mb-4">{currentAnimal.emoji}</div>
          <h2 className="text-3xl font-bold mb-2">{currentAnimal.english}</h2>
          <p className="text-lg text-muted-foreground mb-6">
            {currentAnimal.bulgarian}
          </p>
          
          <div className="space-y-4">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type the romanized Bulgarian..."
              className={cn(
                "text-center text-lg",
                feedback === "correct" && "border-green-500 bg-green-500/10",
                feedback === "incorrect" && "border-red-500 bg-red-500/10"
              )}
              disabled={feedback === "correct"}
              autoFocus
            />
            
            {feedback === "incorrect" && (
              <p className="text-sm text-destructive">
                Try again! The answer is: <span className="font-bold">{currentAnimal.romanized}</span>
              </p>
            )}
            
            {feedback === "correct" ? (
              <Button onClick={nextStep} className="w-full">
                {currentStep === ANIMALS.length - 1 ? "Complete Lesson" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={checkAnswer} className="w-full" disabled={!userInput.trim()}>
                <Check className="w-4 h-4 mr-2" />
                Check Answer
              </Button>
            )}
          </div>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Score: {score} XP
        </div>
      </div>
    </div>
  );
};

export default AnimalsLesson;
