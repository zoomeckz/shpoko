import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Volume2, Loader2, RotateCcw } from "lucide-react";
import { useTextToSpeechCached } from "@/hooks/useTextToSpeechCached";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { preloadAudio } from "@/lib/audioCache";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Difficulty = "beginner" | "intermediate" | "advanced";

interface Word {
  bulgarian: string;
  romanized: string;
  english: string;
}

const wordsByTier: Record<Difficulty, Word[]> = {
  beginner: [
    { bulgarian: "здравей", romanized: "zdravey", english: "hello" },
    { bulgarian: "благодаря", romanized: "blagodarya", english: "thank you" },
    { bulgarian: "да", romanized: "da", english: "yes" },
    { bulgarian: "не", romanized: "ne", english: "no" },
    { bulgarian: "вода", romanized: "voda", english: "water" },
    { bulgarian: "хляб", romanized: "hlyab", english: "bread" },
    { bulgarian: "котка", romanized: "kotka", english: "cat" },
    { bulgarian: "куче", romanized: "kuche", english: "dog" },
    { bulgarian: "къща", romanized: "kashta", english: "house" },
    { bulgarian: "добро утро", romanized: "dobro utro", english: "good morning" },
  ],
  intermediate: [
    { bulgarian: "ресторант", romanized: "restorant", english: "restaurant" },
    { bulgarian: "университет", romanized: "universitet", english: "university" },
    { bulgarian: "сметката", romanized: "smetkata", english: "the bill" },
    { bulgarian: "понеделник", romanized: "ponedelnik", english: "Monday" },
    { bulgarian: "библиотека", romanized: "biblioteka", english: "library" },
    { bulgarian: "пътуване", romanized: "patuvane", english: "travel" },
    { bulgarian: "вълнуващ", romanized: "valnuvasht", english: "exciting" },
    { bulgarian: "удоволствие", romanized: "udovolstvie", english: "pleasure" },
    { bulgarian: "разбирам", romanized: "razbiram", english: "I understand" },
    { bulgarian: "съжалявам", romanized: "sazhalyavam", english: "I'm sorry" },
  ],
  advanced: [
    { bulgarian: "предприемач", romanized: "predpriemach", english: "entrepreneur" },
    { bulgarian: "застраховка", romanized: "zastrahovka", english: "insurance" },
    { bulgarian: "съобщение", romanized: "saobshtenie", english: "message" },
    { bulgarian: "произношение", romanized: "proiznoshenie", english: "pronunciation" },
    { bulgarian: "правителство", romanized: "pravitelstvo", english: "government" },
    { bulgarian: "възможност", romanized: "vazmozhnost", english: "opportunity" },
    { bulgarian: "съществуване", romanized: "sashtestvuvane", english: "existence" },
    { bulgarian: "отговорност", romanized: "otgovornost", english: "responsibility" },
    { bulgarian: "преживяване", romanized: "prezhivyavane", english: "experience" },
    { bulgarian: "международен", romanized: "mezhdunaroden", english: "international" },
  ],
};

const tierConfig: Record<Difficulty, { title: string; color: string; points: number }> = {
  beginner: { title: "Beginner", color: "green", points: 10 },
  intermediate: { title: "Intermediate", color: "yellow", points: 15 },
  advanced: { title: "Advanced", color: "red", points: 20 },
};

const PronounceWordGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isPlaying, isLoading, playPronunciation } = useTextToSpeechCached();
  const { playCorrect, playIncorrect } = useSoundEffects();
  
  const [selectedTier, setSelectedTier] = useState<Difficulty | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect" | "partial"; score: number; transcript?: string } | null>(null);
  const [score, setScore] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<Word[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (selectedTier) {
      const words = [...wordsByTier[selectedTier]].sort(() => Math.random() - 0.5).slice(0, 5);
      setShuffledWords(words);
      setIsPreloading(true);
      preloadAudio(words.map(w => w.bulgarian), (loaded, total) => {
        setPreloadProgress(Math.round((loaded / total) * 100));
      }).then(() => setIsPreloading(false));
    }
  }, [selectedTier]);

  const currentWord = shuffledWords[currentIndex];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 5000);
    } catch (error) {
      toast({ title: "Microphone Error", description: "Please allow microphone access", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        
        const { data, error } = await supabase.functions.invoke("voice-to-text", {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        const transcript = data.text?.toLowerCase().trim() || "";
        const target = currentWord.bulgarian.toLowerCase();
        const targetRomanized = currentWord.romanized.toLowerCase();
        
        // Calculate similarity score
        const similarity = Math.max(
          calculateSimilarity(transcript, target),
          calculateSimilarity(transcript, targetRomanized)
        );

        let points = 0;
        let feedbackType: "correct" | "incorrect" | "partial" = "incorrect";

        if (similarity >= 0.85) {
          points = tierConfig[selectedTier!].points;
          feedbackType = "correct";
          playCorrect();
        } else if (similarity >= 0.5) {
          points = Math.floor(tierConfig[selectedTier!].points * similarity);
          feedbackType = "partial";
          playCorrect();
        } else {
          playIncorrect();
        }

        setScore(prev => prev + points);
        setFeedback({ type: feedbackType, score: points, transcript });
        setIsProcessing(false);
      };
    } catch (error) {
      setIsProcessing(false);
      toast({ title: "Error", description: "Failed to process audio", variant: "destructive" });
    }
  };

  const calculateSimilarity = (a: string, b: string): number => {
    if (a === b) return 1;
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    const distance = matrix[b.length][a.length];
    return 1 - distance / Math.max(a.length, b.length);
  };

  const nextWord = useCallback(() => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFeedback(null);
    } else {
      setGameComplete(true);
    }
  }, [currentIndex, shuffledWords.length]);

  const handleBack = useCallback(() => {
    if (selectedTier && !gameComplete) {
      setSelectedTier(null);
      setCurrentIndex(0);
      setScore(0);
      setFeedback(null);
    } else {
      const returnCategory = location.state?.returnCategory || "games";
      navigate("/", { state: { returnCategory } });
    }
  }, [navigate, location.state, selectedTier, gameComplete]);

  // Tier Selection
  if (!selectedTier) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/", { state: { returnCategory: "games" } })}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold ml-4">Word Pronunciation</h1>
          </div>

          <p className="text-muted-foreground mb-6 text-center">
            Practice pronouncing Bulgarian words. Listen, then speak into your microphone:
          </p>

          <div className="grid gap-4">
            {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((tier) => (
              <Card 
                key={tier} 
                className={`cursor-pointer hover:shadow-lg transition-all border-2 ${
                  tier === "beginner" ? "border-green-500 hover:bg-green-500/10" :
                  tier === "intermediate" ? "border-yellow-500 hover:bg-yellow-500/10" :
                  "border-red-500 hover:bg-red-500/10"
                }`}
                onClick={() => setSelectedTier(tier)}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{tierConfig[tier].title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tier === "beginner" && "Common everyday words"}
                      {tier === "intermediate" && "Useful vocabulary words"}
                      {tier === "advanced" && "Complex multi-syllable words"}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${
                    tier === "beginner" ? "text-green-500" :
                    tier === "intermediate" ? "text-yellow-500" : "text-red-500"
                  }`}>
                    +{tierConfig[tier].points} pts
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isPreloading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-2">Loading Audio...</h2>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${preloadProgress}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">🎤 Great Speaking!</h2>
            <p className="text-muted-foreground mb-2">{tierConfig[selectedTier].title} Level</p>
            <p className="text-3xl font-bold mb-6 text-primary">{score} points</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setSelectedTier(null); setGameComplete(false); setScore(0); setCurrentIndex(0); }}>
                Choose Tier
              </Button>
              <Button onClick={() => navigate("/", { state: { returnCategory: "games" } })}>Back to Games</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="text-center">
            <h1 className="text-xl font-bold">Word Pronunciation</h1>
            <span className={`text-xs ${
              selectedTier === "beginner" ? "text-green-500" :
              selectedTier === "intermediate" ? "text-yellow-500" : "text-red-500"
            }`}>{tierConfig[selectedTier].title}</span>
          </div>
          <div className="text-sm font-medium">{currentIndex + 1}/{shuffledWords.length}</div>
        </div>

        <div className="text-lg font-semibold mb-6 text-center">Score: {score}</div>

        <Card className={`mb-6 transition-colors ${
          feedback?.type === "correct" ? "border-green-500 bg-green-500/10" : 
          feedback?.type === "partial" ? "border-yellow-500 bg-yellow-500/10" :
          feedback?.type === "incorrect" ? "border-red-500 bg-red-500/10" : ""
        }`}>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">{currentWord?.bulgarian}</h2>
              <p className="text-lg text-muted-foreground mb-1">{currentWord?.romanized}</p>
              <p className="text-sm text-muted-foreground">({currentWord?.english})</p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <Button size="lg" variant="outline" className="w-16 h-16 rounded-full" onClick={() => playPronunciation(currentWord?.bulgarian)} disabled={isPlaying || isLoading}>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Volume2 className={`h-6 w-6 ${isPlaying ? "animate-pulse text-primary" : ""}`} />}
              </Button>
              
              <Button 
                size="lg" 
                variant={isRecording ? "destructive" : "default"}
                className="w-16 h-16 rounded-full" 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || !!feedback}
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                 isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mb-4">
              {isRecording ? "Recording... Click to stop" : isProcessing ? "Processing..." : "Click microphone to record"}
            </p>

            {feedback && (
              <div className={`text-center p-4 rounded-lg ${
                feedback.type === "correct" ? "bg-green-500/20" : 
                feedback.type === "partial" ? "bg-yellow-500/20" : "bg-red-500/20"
              }`}>
                <p className="font-bold">
                  {feedback.type === "correct" ? "✓ Excellent!" : 
                   feedback.type === "partial" ? "◐ Good try!" : "✗ Try again"}
                </p>
                {feedback.transcript && <p className="text-sm">You said: "{feedback.transcript}"</p>}
                <p className="text-sm">+{feedback.score} points</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setFeedback(null)} disabled={!feedback}>
            <RotateCcw className="h-4 w-4 mr-2" />Try Again
          </Button>
          <Button className="flex-1" onClick={nextWord} disabled={!feedback}>
            {currentIndex < shuffledWords.length - 1 ? "Next Word" : "Finish"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PronounceWordGame;
