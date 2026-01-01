import { useCallback, useRef } from "react";

// Singleton AudioContext for performance
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// Play a tone with given parameters
const playTone = (
  frequency: number, 
  duration: number, 
  type: OscillatorType = "sine", 
  volume = 0.3,
  delay = 0
) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
    
    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  } catch (error) {
    console.log("Audio not available");
  }
};

export const useDuolingoSounds = () => {
  const enabledRef = useRef(true);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  // Correct answer - pleasant ascending chime
  const playCorrect = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(523.25, 0.12, "sine", 0.25); // C5
    playTone(659.25, 0.12, "sine", 0.25, 0.08); // E5
    playTone(783.99, 0.15, "sine", 0.3, 0.16); // G5
  }, []);

  // Wrong answer - descending buzz
  const playIncorrect = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(220, 0.15, "square", 0.15); // A3
    playTone(196, 0.2, "square", 0.12, 0.12); // G3
  }, []);

  // Lesson complete - triumphant fanfare
  const playComplete = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(523.25, 0.1, "sine", 0.2); // C5
    playTone(659.25, 0.1, "sine", 0.2, 0.1); // E5
    playTone(783.99, 0.1, "sine", 0.25, 0.2); // G5
    playTone(1046.50, 0.3, "sine", 0.35, 0.3); // C6
    playTone(783.99, 0.15, "sine", 0.2, 0.5); // G5
    playTone(1046.50, 0.4, "sine", 0.3, 0.6); // C6
  }, []);

  // Button click - subtle tap
  const playClick = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(800, 0.05, "sine", 0.1);
  }, []);

  // Streak milestone - celebration
  const playStreak = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(659.25, 0.1, "sine", 0.2); // E5
    playTone(783.99, 0.1, "sine", 0.2, 0.1); // G5
    playTone(987.77, 0.15, "sine", 0.25, 0.2); // B5
    playTone(1174.66, 0.25, "sine", 0.3, 0.3); // D6
  }, []);

  // XP gain sound
  const playXP = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(880, 0.08, "sine", 0.15);
    playTone(1108.73, 0.1, "sine", 0.2, 0.06);
  }, []);

  // Heart lost sound
  const playHeartLost = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(349.23, 0.15, "sine", 0.2); // F4
    playTone(293.66, 0.2, "sine", 0.18, 0.12); // D4
  }, []);

  // Skip sound
  const playSkip = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(400, 0.08, "triangle", 0.12);
    playTone(350, 0.08, "triangle", 0.1, 0.05);
  }, []);

  return {
    playCorrect,
    playIncorrect,
    playComplete,
    playClick,
    playStreak,
    playXP,
    playHeartLost,
    playSkip,
    setEnabled,
  };
};
