import { useState, useCallback } from "react";

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);

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

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [isPlaying]);

  return { isPlaying, playPronunciation };
};
