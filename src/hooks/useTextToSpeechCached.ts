import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedAudio, setCachedAudio } from "@/lib/audioCache";
import { useToast } from "@/hooks/use-toast";

export const useTextToSpeechCached = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const playPronunciation = useCallback(async (text: string) => {
    if (isPlaying || isLoading) return;

    setIsLoading(true);

    try {
      // Check cache first
      const cachedAudio = await getCachedAudio(text);
      if (cachedAudio) {
        const audio = new Audio(cachedAudio);
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        await audio.play();
        setIsLoading(false);
        return;
      }

      // Fetch from edge function
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text },
      });

      if (error) throw error;

      const audioContent = data?.audioContent;
      if (!audioContent) throw new Error("No audio content received");

      const audioUrl = `data:audio/mp3;base64,${audioContent}`;
      
      // Save to cache
      await setCachedAudio(text, audioContent);

      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      toast({
        title: "Audio Error",
        description: "Could not play pronunciation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, isLoading, toast]);

  return { isPlaying, isLoading, playPronunciation };
};
