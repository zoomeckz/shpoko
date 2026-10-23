import { useEffect } from "react";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import { playSpeech } from "@/lib/speech";

/**
 * Says a new word or phrase once when it appears, like a teacher would.
 * Stays quiet when the learner has turned sounds off.
 */
export function useAutoSpeech(text?: string) {
  const { soundEnabled } = useSoundSettings();
  useEffect(() => {
    if (!soundEnabled || !text) return;
    const timer = setTimeout(() => playSpeech(text), 350);
    return () => clearTimeout(timer);
    // Only when the text changes, not when sounds are switched on mid-card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
}
