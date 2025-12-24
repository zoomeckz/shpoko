import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseCachedTTSOptions {
  voice?: string;
  language?: string;
}

export const useCachedTTS = (options: UseCachedTTSOptions = {}) => {
  const { voice = "alloy", language = "bg" } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());

  const speak = useCallback(async (text: string): Promise<boolean> => {
    if (!text || text.trim().length === 0) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Check local memory cache first
      const cacheKey = `${language}_${voice}_${text.toLowerCase().trim()}`;
      let audioUrl = audioCache.current.get(cacheKey);

      if (!audioUrl) {
        // Fetch from edge function (which checks DB cache)
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech-cached`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text, voice, language }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate speech");
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        // Create audio URL from base64
        audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        
        // Store in local memory cache
        audioCache.current.set(cacheKey, audioUrl);
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Play the audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      await audio.play();
      
      // Wait for audio to finish
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
      });

      setIsLoading(false);
      return true;

    } catch (err) {
      console.error("TTS error:", err);
      setError(err instanceof Error ? err.message : "Failed to play audio");
      setIsLoading(false);
      return false;
    }
  }, [voice, language]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const preload = useCallback(async (texts: string[]): Promise<void> => {
    // Preload multiple texts in parallel for faster playback later
    const uniqueTexts = [...new Set(texts.filter(t => t && t.trim()))];
    
    await Promise.all(
      uniqueTexts.slice(0, 10).map(async (text) => {
        const cacheKey = `${language}_${voice}_${text.toLowerCase().trim()}`;
        if (audioCache.current.has(cacheKey)) return;

        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech-cached`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ text, voice, language }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.audioContent) {
              audioCache.current.set(cacheKey, `data:audio/mpeg;base64,${data.audioContent}`);
            }
          }
        } catch (err) {
          console.warn("Preload failed for:", text.substring(0, 20));
        }
      })
    );
  }, [voice, language]);

  return {
    speak,
    stop,
    preload,
    isLoading,
    error,
  };
};
