import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playPronunciation = useCallback(async (text: string, lang: string = "bg") => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text, lang },
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error("No audio received");

      // Use data URI for proper decoding
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);

      await audio.play();
    } catch (error) {
      console.error("Pronunciation error:", error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return { isPlaying, playPronunciation };
};
