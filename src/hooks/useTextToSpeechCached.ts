import { useState, useCallback } from "react";

// Now uses free Web Speech API instead of paid ElevenLabs
export const useTextToSpeechCached = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const playPronunciation = useCallback(async (text: string, lang: string = "bg-BG") => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      return;
    }

    setIsLoading(true);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const langVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (langVoice) {
      utterance.voice = langVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isPlaying]);

  return { isPlaying, isLoading, playPronunciation };
};
