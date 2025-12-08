import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const playPronunciation = async (text: string) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text },
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error("No audio received");

      const audioBlob = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
      const blob = new Blob([audioBlob], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

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
    }
  };

  return { isPlaying, playPronunciation };
};
