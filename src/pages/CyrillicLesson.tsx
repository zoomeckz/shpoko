import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface CyrillicLetter {
  cyrillic: string;
  latin: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}

const cyrillicAlphabet: CyrillicLetter[] = [
  { cyrillic: "А", latin: "A", pronunciation: "ah", example: "автобус", exampleTranslation: "bus" },
  { cyrillic: "Б", latin: "B", pronunciation: "beh", example: "банан", exampleTranslation: "banana" },
  { cyrillic: "В", latin: "V", pronunciation: "veh", example: "вода", exampleTranslation: "water" },
  { cyrillic: "Г", latin: "G", pronunciation: "geh", example: "гора", exampleTranslation: "forest" },
  { cyrillic: "Д", latin: "D", pronunciation: "deh", example: "дом", exampleTranslation: "house" },
  { cyrillic: "Е", latin: "E", pronunciation: "eh", example: "елха", exampleTranslation: "fir tree" },
  { cyrillic: "Ж", latin: "Zh", pronunciation: "zheh", example: "жаба", exampleTranslation: "frog" },
  { cyrillic: "З", latin: "Z", pronunciation: "zeh", example: "заек", exampleTranslation: "rabbit" },
  { cyrillic: "И", latin: "I", pronunciation: "ee", example: "игра", exampleTranslation: "game" },
  { cyrillic: "Й", latin: "Y", pronunciation: "ee kratko", example: "май", exampleTranslation: "May" },
  { cyrillic: "К", latin: "K", pronunciation: "kah", example: "кот", exampleTranslation: "cat" },
  { cyrillic: "Л", latin: "L", pronunciation: "leh", example: "лимон", exampleTranslation: "lemon" }
];

export const CyrillicLesson = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isPlaying, playPronunciation } = useTextToSpeech();
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentLetter = cyrillicAlphabet[currentStep];
  const progress = ((currentStep + 1) / cyrillicAlphabet.length) * 100;

  const nextStep = () => {
    if (currentStep < cyrillicAlphabet.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: "Lesson Complete! 🎉",
        description: "You've mastered the Cyrillic alphabet! +50 XP",
      });
      navigate("/");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const repeatStep = () => {
    playPronunciation(currentLetter.cyrillic);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
            <h1 className="text-3xl font-bold">Cyrillic Alphabet</h1>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Letter {currentStep + 1} of {cyrillicAlphabet.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Main Lesson Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Letter Display */}
          <Card className="p-8 text-center animate-fade-in">
            <div className="mb-6">
              <div 
                className={cn(
                  "text-9xl font-bold mb-4 transition-all duration-300",
                  isPlaying && "animate-bounce-gentle text-primary"
                )}
              >
                {currentLetter.cyrillic}
              </div>
              <div className="text-4xl text-muted-foreground mb-2">
                {currentLetter.latin}
              </div>
              <div className="text-lg text-muted-foreground">
                Pronounced: "{currentLetter.pronunciation}"
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => playPronunciation(currentLetter.cyrillic)}
                disabled={isPlaying}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isPlaying ? "Playing..." : "Hear Letter"}
              </Button>
              
              <Button variant="outline" onClick={repeatStep} disabled={isPlaying}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Repeat
              </Button>
            </div>
          </Card>

          {/* Example Word */}
          <Card className="p-8 animate-fade-in">
            <h3 className="text-2xl font-bold mb-6">Example Word</h3>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-4 text-primary">
                {currentLetter.example}
              </div>
              <div className="text-xl text-muted-foreground mb-2">
                "{currentLetter.exampleTranslation}"
              </div>
            </div>

            <Button
              onClick={() => playPronunciation(currentLetter.example)}
              disabled={isPlaying}
              variant="outline"
              className="w-full"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              {isPlaying ? "Playing..." : "Hear Example"}
            </Button>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> The letter <strong>{currentLetter.cyrillic}</strong> 
                {" "}appears at the beginning of <strong>{currentLetter.example}</strong> 
                {" "}and sounds like "{currentLetter.pronunciation}".
              </p>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Letter: {currentLetter.cyrillic} ({currentLetter.latin})
          </div>

          <Button
            onClick={nextStep}
            className="bg-gradient-primary hover:opacity-90"
          >
            {currentStep === cyrillicAlphabet.length - 1 ? "Complete Lesson" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Alphabet Overview */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-bold mb-4">Alphabet Progress</h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
            {cyrillicAlphabet.map((letter, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-12 h-12 rounded-lg border-2 font-bold transition-all duration-200",
                  index === currentStep 
                    ? "border-primary bg-primary text-primary-foreground animate-glow" 
                    : index < currentStep
                    ? "border-success bg-success/10 text-success"
                    : "border-border bg-background hover:border-primary/50"
                )}
              >
                {letter.cyrillic}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
