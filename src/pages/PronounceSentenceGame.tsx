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

interface Sentence {
  bulgarian: string;
  romanized: string;
  english: string;
}

const sentencesByTier: Record<Difficulty, Sentence[]> = {
  beginner: [
    { bulgarian: "Здравей, как си?", romanized: "Zdravey, kak si?", english: "Hello, how are you?" },
    { bulgarian: "Аз съм добре.", romanized: "Az sam dobre.", english: "I am fine." },
    { bulgarian: "Благодаря много.", romanized: "Blagodarya mnogo.", english: "Thank you very much." },
    { bulgarian: "Довиждане!", romanized: "Dovizhdane!", english: "Goodbye!" },
    { bulgarian: "Как се казваш?", romanized: "Kak se kazvash?", english: "What is your name?" },
    { bulgarian: "Казвам се Иван.", romanized: "Kazvam se Ivan.", english: "My name is Ivan." },
    { bulgarian: "Приятно ми е.", romanized: "Priyatno mi e.", english: "Nice to meet you." },
    { bulgarian: "Искам вода.", romanized: "Iskam voda.", english: "I want water." },
  ],
  intermediate: [
    { bulgarian: "Колко струва това?", romanized: "Kolko struva tova?", english: "How much does this cost?" },
    { bulgarian: "Къде е ресторантът?", romanized: "Kade e restorantat?", english: "Where is the restaurant?" },
    { bulgarian: "Говорите ли английски?", romanized: "Govorite li angliyski?", english: "Do you speak English?" },
    { bulgarian: "Не разбирам български.", romanized: "Ne razbiram balgarski.", english: "I don't understand Bulgarian." },
    { bulgarian: "Моля, говорете по-бавно.", romanized: "Molya, govorete po-bavno.", english: "Please speak slower." },
    { bulgarian: "Искам да поръчам.", romanized: "Iskam da poracham.", english: "I want to order." },
    { bulgarian: "Сметката, моля.", romanized: "Smetkata, molya.", english: "The bill, please." },
    { bulgarian: "Много е вкусно!", romanized: "Mnogo e vkusno!", english: "It's very delicious!" },
  ],
  advanced: [
    { bulgarian: "Бихте ли могли да ми помогнете?", romanized: "Bihte li mogli da mi pomognete?", english: "Could you help me?" },
    { bulgarian: "Имате ли свободна маса за двама?", romanized: "Imate li svobodna masa za dvama?", english: "Do you have a free table for two?" },
    { bulgarian: "Предпочитам място до прозореца.", romanized: "Predpochitam myasto do prozoretsa.", english: "I prefer a seat by the window." },
    { bulgarian: "Какво бихте препоръчали?", romanized: "Kakvo bihte preporachali?", english: "What would you recommend?" },
    { bulgarian: "Алергичен съм към ядки.", romanized: "Alergichen sam kam yadki.", english: "I am allergic to nuts." },
    { bulgarian: "Може ли да платя с карта?", romanized: "Mozhe li da platya s karta?", english: "Can I pay by card?" },
    { bulgarian: "Къде мога да намеря банкомат?", romanized: "Kade moga da namerya bankomat?", english: "Where can I find an ATM?" },
    { bulgarian: "Резервирал съм маса за осем часа.", romanized: "Rezerviral sam masa za osem chasa.", english: "I have reserved a table for eight o'clock." },
  ],
};

const tierConfig: Record<Difficulty, { title: string; color: string; points: number }> = {
  beginner: { title: "Beginner", color: "green", points: 15 },
  intermediate: { title: "Intermediate", color: "yellow", points: 25 },
  advanced: { title: "Advanced", color: "red", points: 35 },
};

const PronounceSentenceGame = () => {
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
  const [shuffledSentences, setShuffledSentences] = useState<Sentence[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (selectedTier) {
      const sentences = [...sentencesByTier[selectedTier]].sort(() => Math.random() - 0.5).slice(0, 5);
      setShuffledSentences(sentences);
      setIsPreloading(true);
      preloadAudio(sentences.map(s => s.bulgarian), (loaded, total) => {
        setPreloadProgress(Math.round((loaded / total) * 100));
      }).then(() => setIsPreloading(false));
    }
  }, [selectedTier]);

  const currentSentence = shuffledSentences[currentIndex];

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
      
      // Auto-stop after 10 seconds for sentences
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 10000);
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
        const targetWords = currentSentence.bulgarian.toLowerCase().replace(/[?!.,]/g, "").split(" ");
        const transcriptWords = transcript.replace(/[?!.,]/g, "").split(" ");
        
        // Calculate word match percentage
        let matchedWords = 0;
        targetWords.forEach(targetWord => {
          if (transcriptWords.some(tw => calculateSimilarity(tw, targetWord) > 0.7)) {
            matchedWords++;
          }
        });
        
        const wordMatchRate = matchedWords / targetWords.length;
        
        let points = 0;
        let feedbackType: "correct" | "incorrect" | "partial" = "incorrect";

        if (wordMatchRate >= 0.8) {
          points = tierConfig[selectedTier!].points;
          feedbackType = "correct";
          playCorrect();
        } else if (wordMatchRate >= 0.5) {
          points = Math.floor(tierConfig[selectedTier!].points * wordMatchRate);
          feedbackType = "partial";
          playCorrect();
        } else {
          points = Math.floor(tierConfig[selectedTier!].points * wordMatchRate * 0.5);
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

  const nextSentence = useCallback(() => {
    if (currentIndex < shuffledSentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFeedback(null);
    } else {
      setGameComplete(true);
    }
  }, [currentIndex, shuffledSentences.length]);

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
            <h1 className="text-xl font-bold ml-4">Sentence Pronunciation</h1>
          </div>

          <p className="text-muted-foreground mb-6 text-center">
            Practice speaking full Bulgarian sentences. Listen, then repeat:
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
                      {tier === "beginner" && "Simple greetings and phrases"}
                      {tier === "intermediate" && "Everyday conversations"}
                      {tier === "advanced" && "Complex situational sentences"}
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
            <h2 className="text-2xl font-bold mb-4">🎙️ Great Speaking!</h2>
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
            <h1 className="text-xl font-bold">Sentence Pronunciation</h1>
            <span className={`text-xs ${
              selectedTier === "beginner" ? "text-green-500" :
              selectedTier === "intermediate" ? "text-yellow-500" : "text-red-500"
            }`}>{tierConfig[selectedTier].title}</span>
          </div>
          <div className="text-sm font-medium">{currentIndex + 1}/{shuffledSentences.length}</div>
        </div>

        <div className="text-lg font-semibold mb-6 text-center">Score: {score}</div>

        <Card className={`mb-6 transition-colors ${
          feedback?.type === "correct" ? "border-green-500 bg-green-500/10" : 
          feedback?.type === "partial" ? "border-yellow-500 bg-yellow-500/10" :
          feedback?.type === "incorrect" ? "border-red-500 bg-red-500/10" : ""
        }`}>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">{currentSentence?.bulgarian}</h2>
              <p className="text-md text-muted-foreground mb-1">{currentSentence?.romanized}</p>
              <p className="text-sm text-muted-foreground italic">"{currentSentence?.english}"</p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <Button size="lg" variant="outline" className="w-16 h-16 rounded-full" onClick={() => playPronunciation(currentSentence?.bulgarian)} disabled={isPlaying || isLoading}>
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
                  {feedback.type === "correct" ? "✓ Excellent pronunciation!" : 
                   feedback.type === "partial" ? "◐ Good effort!" : "✗ Keep practicing"}
                </p>
                {feedback.transcript && <p className="text-sm mt-1">Heard: "{feedback.transcript}"</p>}
                <p className="text-sm mt-1">+{feedback.score} points</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setFeedback(null)} disabled={!feedback}>
            <RotateCcw className="h-4 w-4 mr-2" />Try Again
          </Button>
          <Button className="flex-1" onClick={nextSentence} disabled={!feedback}>
            {currentIndex < shuffledSentences.length - 1 ? "Next Sentence" : "Finish"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PronounceSentenceGame;
