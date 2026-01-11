import { useCallback } from "react";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";

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
  const { soundEnabled } = useSoundSettings();

  // Correct answer - pleasant ascending chime
  const playCorrect = useCallback(() => {
    if (!soundEnabled) return;
    playTone(523.25, 0.12, "sine", 0.25); // C5
    playTone(659.25, 0.12, "sine", 0.25, 0.08); // E5
    playTone(783.99, 0.15, "sine", 0.3, 0.16); // G5
  }, [soundEnabled]);

  // Wrong answer - descending buzz
  const playIncorrect = useCallback(() => {
    if (!soundEnabled) return;
    playTone(220, 0.15, "square", 0.15); // A3
    playTone(196, 0.2, "square", 0.12, 0.12); // G3
  }, [soundEnabled]);

  // Lesson complete - triumphant fanfare
  const playComplete = useCallback(() => {
    if (!soundEnabled) return;
    playTone(523.25, 0.1, "sine", 0.2); // C5
    playTone(659.25, 0.1, "sine", 0.2, 0.1); // E5
    playTone(783.99, 0.1, "sine", 0.25, 0.2); // G5
    playTone(1046.50, 0.3, "sine", 0.35, 0.3); // C6
    playTone(783.99, 0.15, "sine", 0.2, 0.5); // G5
    playTone(1046.50, 0.4, "sine", 0.3, 0.6); // C6
  }, [soundEnabled]);

  // Button click - subtle tap
  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    playTone(800, 0.05, "sine", 0.1);
  }, [soundEnabled]);

  // Streak milestone - celebration
  const playStreak = useCallback(() => {
    if (!soundEnabled) return;
    playTone(659.25, 0.1, "sine", 0.2); // E5
    playTone(783.99, 0.1, "sine", 0.2, 0.1); // G5
    playTone(987.77, 0.15, "sine", 0.25, 0.2); // B5
    playTone(1174.66, 0.25, "sine", 0.3, 0.3); // D6
  }, [soundEnabled]);

  // XP gain sound
  const playXP = useCallback(() => {
    if (!soundEnabled) return;
    playTone(880, 0.08, "sine", 0.15);
    playTone(1108.73, 0.1, "sine", 0.2, 0.06);
  }, [soundEnabled]);

  // Heart lost sound
  const playHeartLost = useCallback(() => {
    if (!soundEnabled) return;
    playTone(349.23, 0.15, "sine", 0.2); // F4
    playTone(293.66, 0.2, "sine", 0.18, 0.12); // D4
  }, [soundEnabled]);

  // Skip sound
  const playSkip = useCallback(() => {
    if (!soundEnabled) return;
    playTone(400, 0.08, "triangle", 0.12);
    playTone(350, 0.08, "triangle", 0.1, 0.05);
  }, [soundEnabled]);

  // Promotion celebration - epic fanfare
  const playPromotion = useCallback(() => {
    if (!soundEnabled) return;
    playTone(523.25, 0.1, "sine", 0.25); // C5
    playTone(659.25, 0.1, "sine", 0.25, 0.1); // E5
    playTone(783.99, 0.1, "sine", 0.3, 0.2); // G5
    playTone(1046.50, 0.2, "sine", 0.35, 0.3); // C6
    playTone(1318.51, 0.15, "sine", 0.3, 0.45); // E6
    playTone(1567.98, 0.3, "sine", 0.35, 0.55); // G6
    playTone(2093.00, 0.5, "sine", 0.4, 0.7); // C7
  }, [soundEnabled]);

  // Demotion sad sound
  const playDemotion = useCallback(() => {
    if (!soundEnabled) return;
    playTone(392, 0.2, "sine", 0.2); // G4
    playTone(349.23, 0.2, "sine", 0.18, 0.15); // F4
    playTone(311.13, 0.25, "sine", 0.15, 0.3); // Eb4
    playTone(293.66, 0.4, "sine", 0.12, 0.45); // D4
  }, [soundEnabled]);

  // Achievement unlock - magical chime
  const playAchievement = useCallback(() => {
    if (!soundEnabled) return;
    playTone(659.25, 0.1, "sine", 0.2); // E5
    playTone(783.99, 0.1, "sine", 0.25, 0.08); // G5
    playTone(987.77, 0.1, "sine", 0.3, 0.16); // B5
    playTone(1174.66, 0.15, "sine", 0.35, 0.24); // D6
    playTone(1318.51, 0.2, "sine", 0.3, 0.35); // E6
    playTone(1567.98, 0.25, "sine", 0.35, 0.45); // G6
  }, [soundEnabled]);

  // Level up sound
  const playLevelUp = useCallback(() => {
    if (!soundEnabled) return;
    playTone(440, 0.08, "sine", 0.2); // A4
    playTone(554.37, 0.08, "sine", 0.25, 0.06); // C#5
    playTone(659.25, 0.08, "sine", 0.3, 0.12); // E5
    playTone(880, 0.15, "sine", 0.35, 0.18); // A5
    playTone(1108.73, 0.2, "sine", 0.3, 0.28); // C#6
    playTone(1318.51, 0.3, "sine", 0.35, 0.38); // E6
  }, [soundEnabled]);

  // Coin/reward sound
  const playCoin = useCallback(() => {
    if (!soundEnabled) return;
    playTone(1318.51, 0.06, "sine", 0.2); // E6
    playTone(1567.98, 0.08, "sine", 0.25, 0.05); // G6
  }, [soundEnabled]);

  return {
    playCorrect,
    playIncorrect,
    playComplete,
    playClick,
    playStreak,
    playXP,
    playHeartLost,
    playSkip,
    playPromotion,
    playDemotion,
    playAchievement,
    playLevelUp,
    playCoin,
    soundEnabled,
  };
};
