import { useCallback, useRef } from "react";

// Audio context for better performance
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Generate sound programmatically for better performance
const playTone = (frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.log("Audio not available");
  }
};

export const useSoundEffects = () => {
  const playCorrect = useCallback(() => {
    // Happy ascending tone
    playTone(523.25, 0.1, "sine", 0.3); // C5
    setTimeout(() => playTone(659.25, 0.1, "sine", 0.3), 100); // E5
    setTimeout(() => playTone(783.99, 0.15, "sine", 0.3), 200); // G5
  }, []);

  const playIncorrect = useCallback(() => {
    // Sad descending tone
    playTone(311.13, 0.15, "square", 0.2); // Eb4
    setTimeout(() => playTone(261.63, 0.2, "square", 0.2), 150); // C4
  }, []);

  const playComplete = useCallback(() => {
    // Victory fanfare
    playTone(523.25, 0.1, "sine", 0.3); // C5
    setTimeout(() => playTone(659.25, 0.1, "sine", 0.3), 100); // E5
    setTimeout(() => playTone(783.99, 0.1, "sine", 0.3), 200); // G5
    setTimeout(() => playTone(1046.50, 0.3, "sine", 0.4), 300); // C6
  }, []);

  const playSkip = useCallback(() => {
    // Neutral whoosh sound
    playTone(400, 0.1, "triangle", 0.2);
    setTimeout(() => playTone(300, 0.1, "triangle", 0.15), 50);
  }, []);

  return {
    playCorrect,
    playIncorrect,
    playComplete,
    playSkip,
  };
};
