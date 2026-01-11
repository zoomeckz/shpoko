import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedAudio, setCachedAudio } from "@/lib/audioCache";

export const useTextToSpeechCached = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const playPronunciation = useCallback(async (text: string, lang: string = "bg") => {
    if (isPlaying || isLoading) return;

    setIsLoading(true);

    try {
      // Check cache first
      const cacheKey = `${lang}:${text}`;
      const cachedAudio = await getCachedAudio(cacheKey);
      if (cachedAudio) {
        const audioUrl = `data:audio/mpeg;base64,${cachedAudio}`;
        const audio = new Audio(audioUrl);
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        await audio.play();
        setIsLoading(false);
        return;
      }

      // Fetch from edge function (uses Google Translate TTS - free!)
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text, lang },
      });

      if (error) throw error;

      const audioContent = data?.audioContent;
      if (!audioContent) throw new Error("No audio content received");

      // Save to cache
      await setCachedAudio(cacheKey, audioContent);

      const audioUrl = `data:audio/mpeg;base64,${audioContent}`;
      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, isLoading]);

  return { isPlaying, isLoading, playPronunciation };
};
