import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getCachedAudio, setCachedAudio } from "@/lib/audioCache";

export const useTextToSpeechCached = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const playPronunciation = useCallback(async (text: string) => {
    if (isPlaying || isLoading) return;
    
    setIsLoading(true);
    try {
      // Check cache first
      let audioContent = await getCachedAudio(text);
      
      if (!audioContent) {
        // Fetch from API if not cached
        const { data, error } = await supabase.functions.invoke("text-to-speech", {
          body: { text },
        });

        if (error) throw error;
        if (!data?.audioContent) throw new Error("No audio received");
        
        audioContent = data.audioContent;
        // Cache for future use
        await setCachedAudio(text, audioContent);
      }

      const audioBlob = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
      const blob = new Blob([audioBlob], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      setIsPlaying(true);
      setIsLoading(false);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Pronunciation error:", error);
      toast({
        title: "Pronunciation Error",
        description: "Failed to play pronunciation. Please try again.",
        variant: "destructive",
      });
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [isPlaying, isLoading, toast]);

  return { isPlaying, isLoading, playPronunciation };
};
