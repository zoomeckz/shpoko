import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedAudio, setCachedAudio } from "@/lib/audioCache";

export const useTextToSpeechCached = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState({ loaded: 0, total: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playQueueRef = useRef<string[]>([]);
  const isPlayingQueueRef = useRef(false);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    playQueueRef.current = [];
    isPlayingQueueRef.current = false;
    setIsPlaying(false);
  }, []);

  const playPronunciation = useCallback(async (text: string, lang: string = "bg") => {
    if (isPlaying || isLoading) return;

    setIsLoading(true);

    try {
      const cacheKey = `${lang}:${text}`;
      let audioContent = await getCachedAudio(cacheKey);
      
      if (!audioContent) {
        const { data, error } = await supabase.functions.invoke("text-to-speech", {
          body: { text, lang },
        });

        if (error) throw error;
        audioContent = data?.audioContent;
        if (!audioContent) throw new Error("No audio content received");
        await setCachedAudio(cacheKey, audioContent);
      }

      const audioUrl = `data:audio/mpeg;base64,${audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
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

  // Play multiple sentences in sequence
  const playSequence = useCallback(async (texts: string[], lang: string = "bg") => {
    if (isPlayingQueueRef.current) {
      stop();
      return;
    }

    playQueueRef.current = [...texts];
    isPlayingQueueRef.current = true;
    setIsPlaying(true);

    for (const text of texts) {
      if (!isPlayingQueueRef.current) break;

      try {
        const cacheKey = `${lang}:${text}`;
        let audioContent = await getCachedAudio(cacheKey);
        
        if (!audioContent) {
          const { data, error } = await supabase.functions.invoke("text-to-speech", {
            body: { text, lang },
          });
          if (error) throw error;
          audioContent = data?.audioContent;
          if (audioContent) await setCachedAudio(cacheKey, audioContent);
        }

        if (audioContent && isPlayingQueueRef.current) {
          const audioUrl = `data:audio/mpeg;base64,${audioContent}`;
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          await new Promise<void>((resolve) => {
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            audio.play().catch(() => resolve());
          });
        }
      } catch (error) {
        console.error("TTS sequence error:", error);
      }
    }

    isPlayingQueueRef.current = false;
    setIsPlaying(false);
  }, [stop]);

  // Preload audio for multiple texts
  const preload = useCallback(async (texts: string[], lang: string = "bg") => {
    setPreloadProgress({ loaded: 0, total: texts.length });
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const cacheKey = `${lang}:${text}`;
      const cached = await getCachedAudio(cacheKey);
      
      if (!cached) {
        try {
          const { data, error } = await supabase.functions.invoke("text-to-speech", {
            body: { text, lang },
          });
          if (!error && data?.audioContent) {
            await setCachedAudio(cacheKey, data.audioContent);
          }
        } catch (e) {
          console.error(`Failed to preload: ${text}`, e);
        }
      }
      
      setPreloadProgress({ loaded: i + 1, total: texts.length });
    }
  }, []);

  return { 
    isPlaying, 
    isLoading, 
    playPronunciation, 
    playSequence, 
    preload, 
    preloadProgress,
    stop 
  };
};
