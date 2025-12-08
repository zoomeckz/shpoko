import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface Greeting {
  bulgarian: string;
  pronunciation: string;
  english: string;
  usage: string;
}

const greetings: Greeting[] = [
  { bulgarian: "Здравей", pronunciation: "Zdravey", english: "Hello (informal)", usage: "Use with friends and people your age" },
  { bulgarian: "Здравейте", pronunciation: "Zdraveyte", english: "Hello (formal)", usage: "Use with strangers, elders, or in professional settings" },
  { bulgarian: "Добро утро", pronunciation: "Dobro utro", english: "Good morning", usage: "Use in the morning until around noon" },
  { bulgarian: "Добър ден", pronunciation: "Dobar den", english: "Good day/afternoon", usage: "Use from noon until evening" },
  { bulgarian: "Добър вечер", pronunciation: "Dobar vecher", english: "Good evening", usage: "Use in the evening" },
  { bulgarian: "Лека нощ", pronunciation: "Leka nosht", english: "Good night", usage: "Use when saying goodbye before sleep" },
  { bulgarian: "Довиждане", pronunciation: "Dovizhdane", english: "Goodbye", usage: "Formal way to say goodbye" },
  { bulgarian: "Чао", pronunciation: "Chao", english: "Bye", usage: "Informal, borrowed from Italian" },
  { bulgarian: "Благодаря", pronunciation: "Blagodarya", english: "Thank you", usage: "Express gratitude in any situation" },
  { bulgarian: "Моля", pronunciation: "Molya", english: "Please / You're welcome", usage: "Can mean both 'please' and 'you're welcome'" },
  { bulgarian: "Извинете", pronunciation: "Izvinete", english: "Excuse me / Sorry", usage: "Use to get attention or apologize" },
  { bulgarian: "Как сте?", pronunciation: "Kak ste?", english: "How are you? (formal)", usage: "Formal way to ask how someone is" },
];

export const GreetingsLesson = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isPlaying, playPronunciation } = useTextToSpeech();
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentGreeting = greetings[currentStep];
  const progress = ((currentStep + 1) / greetings.length) * 100;

  const nextStep = () => {
    if (currentStep < greetings.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: "Lesson Complete! 🎉",
        description: "You've mastered basic greetings! +75 XP",
      });
      navigate("/");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
            <h1 className="text-3xl font-bold">Basic Greetings</h1>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Phrase {currentStep + 1} of {greetings.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 text-center animate-fade-in">
            <div className="mb-6">
              <div className={cn(
                "text-5xl font-bold mb-4 transition-all duration-300",
                isPlaying && "animate-bounce-gentle text-primary"
              )}>
                {currentGreeting.bulgarian}
              </div>
              <div className="text-2xl text-muted-foreground mb-2">
                {currentGreeting.pronunciation}
              </div>
              <div className="text-xl font-medium text-primary">
                {currentGreeting.english}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => playPronunciation(currentGreeting.bulgarian)}
                disabled={isPlaying}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isPlaying ? "Playing..." : "Hear Phrase"}
              </Button>
              
              <Button variant="outline" onClick={() => playPronunciation(currentGreeting.bulgarian)} disabled={isPlaying}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Repeat
              </Button>
            </div>
          </Card>

          <Card className="p-8 animate-fade-in">
            <h3 className="text-2xl font-bold mb-6">When to Use</h3>
            
            <div className="p-6 bg-muted/50 rounded-lg mb-6">
              <p className="text-lg">{currentGreeting.usage}</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Bulgarian</p>
                <p className="text-xl font-bold">{currentGreeting.bulgarian}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Pronunciation</p>
                <p className="text-xl">{currentGreeting.pronunciation}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-8">
          <Button onClick={prevStep} disabled={currentStep === 0} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentGreeting.english}
          </div>

          <Button onClick={nextStep} className="bg-gradient-primary hover:opacity-90">
            {currentStep === greetings.length - 1 ? "Complete Lesson" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <Card className="p-6 mt-8">
          <h3 className="text-lg font-bold mb-4">Phrases Progress</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {greetings.map((greeting, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "p-2 rounded-lg border-2 text-xs font-medium transition-all duration-200",
                  index === currentStep 
                    ? "border-primary bg-primary text-primary-foreground animate-glow" 
                    : index < currentStep
                    ? "border-success bg-success/10 text-success"
                    : "border-border bg-background hover:border-primary/50"
                )}
              >
                {greeting.english.split(" ")[0]}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
