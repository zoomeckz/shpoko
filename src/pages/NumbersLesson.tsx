import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BulgarianNumber {
  number: number;
  bulgarian: string;
  pronunciation: string;
}

const numbers: BulgarianNumber[] = [
  { number: 1, bulgarian: "едно", pronunciation: "edno" },
  { number: 2, bulgarian: "две", pronunciation: "dve" },
  { number: 3, bulgarian: "три", pronunciation: "tri" },
  { number: 4, bulgarian: "четири", pronunciation: "chetiri" },
  { number: 5, bulgarian: "пет", pronunciation: "pet" },
  { number: 6, bulgarian: "шест", pronunciation: "shest" },
  { number: 7, bulgarian: "седем", pronunciation: "sedem" },
  { number: 8, bulgarian: "осем", pronunciation: "osem" },
  { number: 9, bulgarian: "девет", pronunciation: "devet" },
  { number: 10, bulgarian: "десет", pronunciation: "deset" },
  { number: 11, bulgarian: "единадесет", pronunciation: "edinadeset" },
  { number: 12, bulgarian: "дванадесет", pronunciation: "dvanadeset" },
  { number: 13, bulgarian: "тринадесет", pronunciation: "trinadeset" },
  { number: 14, bulgarian: "четиринадесет", pronunciation: "chetirinadeset" },
  { number: 15, bulgarian: "петнадесет", pronunciation: "petnadeset" },
  { number: 16, bulgarian: "шестнадесет", pronunciation: "shestnadeset" },
  { number: 17, bulgarian: "седемнадесет", pronunciation: "sedemnadeset" },
  { number: 18, bulgarian: "осемнадесет", pronunciation: "osemnadeset" },
  { number: 19, bulgarian: "деветнадесет", pronunciation: "devetnadeset" },
  { number: 20, bulgarian: "двадесет", pronunciation: "dvadeset" },
];

export const NumbersLesson = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const currentNumber = numbers[currentStep];
  const progress = ((currentStep + 1) / numbers.length) * 100;

  const playPronunciation = async (text: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key to hear pronunciations.",
        variant: "destructive",
      });
      return;
    }

    setIsPlaying(true);
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pFZP5JQG7iQjIQuC4Bku', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      });

      if (!response.ok) throw new Error('Failed to generate speech');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      toast({
        title: "Pronunciation Error",
        description: "Failed to play pronunciation. Please check your API key.",
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  const nextStep = () => {
    if (currentStep < numbers.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: "Lesson Complete! 🎉",
        description: "You've learned to count to 20 in Bulgarian! +60 XP",
      });
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
            <h1 className="text-3xl font-bold">Numbers 1-20</h1>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Number {currentStep + 1} of {numbers.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {!apiKey && (
            <Card className="p-4 mb-6 border-warning">
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 text-warning" />
                <div className="flex-1">
                  <h3 className="font-medium">Enable Pronunciation</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your ElevenLabs API key to hear pronunciations
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  />
                  <Button size="sm" onClick={() => toast({ title: "API Key saved!" })}>
                    Save
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 text-center animate-fade-in">
            <div className="mb-6">
              <div className={cn(
                "text-8xl font-bold mb-4 transition-all duration-300 text-primary",
                isPlaying && "animate-bounce-gentle"
              )}>
                {currentNumber.number}
              </div>
              <div className={cn(
                "text-5xl font-bold mb-4 transition-all duration-300",
                isPlaying && "animate-bounce-gentle text-primary"
              )}>
                {currentNumber.bulgarian}
              </div>
              <div className="text-2xl text-muted-foreground">
                {currentNumber.pronunciation}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => playPronunciation(currentNumber.bulgarian)}
                disabled={isPlaying || !apiKey}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isPlaying ? "Playing..." : "Hear Number"}
              </Button>
              
              <Button variant="outline" onClick={() => playPronunciation(currentNumber.bulgarian)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Repeat
              </Button>
            </div>
          </Card>

          <Card className="p-8 animate-fade-in">
            <h3 className="text-2xl font-bold mb-6">Number Pattern</h3>
            
            {currentNumber.number <= 10 ? (
              <div className="p-6 bg-muted/50 rounded-lg mb-6">
                <p className="text-lg">
                  Numbers 1-10 are base numbers. Memorize these to build larger numbers!
                </p>
              </div>
            ) : (
              <div className="p-6 bg-muted/50 rounded-lg mb-6">
                <p className="text-lg mb-2">
                  Teen numbers (11-19) follow a pattern:
                </p>
                <p className="text-primary font-medium">
                  {numbers[currentNumber.number - 11].bulgarian} + надесет = {currentNumber.bulgarian}
                </p>
              </div>
            )}

            <div className="grid grid-cols-5 gap-2">
              {[...Array(currentNumber.number)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  •
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-8">
          <Button onClick={prevStep} disabled={currentStep === 0} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentNumber.number} = {currentNumber.bulgarian}
          </div>

          <Button onClick={nextStep} className="bg-gradient-primary hover:opacity-90">
            {currentStep === numbers.length - 1 ? "Complete Lesson" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <Card className="p-6 mt-8">
          <h3 className="text-lg font-bold mb-4">Numbers Progress</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {numbers.map((num, index) => (
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
                {num.number}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
