import { useCallback, useRef } from "react";

// Web Audio API based sound effects - Duolingo style
// Bright, cheerful, game-like sounds

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.3,
  delay: number = 0
) => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

  gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  oscillator.start(ctx.currentTime + delay);
  oscillator.stop(ctx.currentTime + delay + duration);
};

export const useAudioFeedback = () => {
  const enabled = useRef(true);

  const setEnabled = useCallback((value: boolean) => {
    enabled.current = value;
  }, []);

  // Correct answer - bright ascending arpeggio (Duolingo style)
  const playCorrect = useCallback(() => {
    if (!enabled.current) return;
    
    // Bright major chord arpeggio
    playTone(523.25, 0.15, "sine", 0.25, 0);      // C5
    playTone(659.25, 0.15, "sine", 0.25, 0.08);   // E5
    playTone(783.99, 0.2, "sine", 0.3, 0.16);     // G5
    playTone(1046.50, 0.25, "sine", 0.25, 0.24);  // C6 (high, triumphant)
  }, []);

  // Incorrect answer - soft descending notes
  const playIncorrect = useCallback(() => {
    if (!enabled.current) return;
    
    playTone(392, 0.15, "triangle", 0.2, 0);    // G4
    playTone(349.23, 0.2, "triangle", 0.15, 0.1); // F4
  }, []);

  // Lesson complete - victory fanfare
  const playComplete = useCallback(() => {
    if (!enabled.current) return;
    
    // Celebratory ascending scale
    playTone(523.25, 0.12, "sine", 0.2, 0);      // C5
    playTone(587.33, 0.12, "sine", 0.2, 0.1);    // D5
    playTone(659.25, 0.12, "sine", 0.2, 0.2);    // E5
    playTone(783.99, 0.12, "sine", 0.25, 0.3);   // G5
    playTone(1046.50, 0.3, "sine", 0.3, 0.4);    // C6
    
    // Add a sparkle on top
    playTone(2093, 0.1, "sine", 0.15, 0.5);      // High sparkle
    playTone(2637, 0.15, "sine", 0.1, 0.55);     // Higher sparkle
  }, []);

  // Button click - soft pop
  const playClick = useCallback(() => {
    if (!enabled.current) return;
    
    playTone(800, 0.05, "sine", 0.15, 0);
  }, []);

  // Level up / XP gained
  const playLevelUp = useCallback(() => {
    if (!enabled.current) return;
    
    // Magical ascending glissando
    for (let i = 0; i < 8; i++) {
      playTone(400 + (i * 100), 0.1, "sine", 0.15 + (i * 0.02), i * 0.05);
    }
    // Final chord
    playTone(800, 0.3, "sine", 0.2, 0.4);
    playTone(1000, 0.3, "sine", 0.15, 0.4);
    playTone(1200, 0.3, "sine", 0.15, 0.4);
  }, []);

  // Streak milestone
  const playStreak = useCallback(() => {
    if (!enabled.current) return;
    
    // Fire crackle effect
    playTone(200, 0.1, "sawtooth", 0.1, 0);
    playTone(400, 0.15, "sine", 0.2, 0.05);
    playTone(600, 0.2, "sine", 0.25, 0.15);
    playTone(800, 0.25, "sine", 0.2, 0.25);
  }, []);

  // Skip / pass
  const playSkip = useCallback(() => {
    if (!enabled.current) return;
    
    playTone(600, 0.08, "triangle", 0.15, 0);
    playTone(500, 0.1, "triangle", 0.1, 0.05);
  }, []);

  // Open chest / reward
  const playReward = useCallback(() => {
    if (!enabled.current) return;
    
    // Magical sparkle cascade
    playTone(523.25, 0.1, "sine", 0.2, 0);
    playTone(784, 0.1, "sine", 0.2, 0.1);
    playTone(1047, 0.15, "sine", 0.25, 0.2);
    playTone(1319, 0.15, "sine", 0.2, 0.3);
    playTone(1568, 0.2, "sine", 0.15, 0.4);
    
    // Coin sounds
    playTone(2000, 0.05, "sine", 0.1, 0.5);
    playTone(2400, 0.05, "sine", 0.1, 0.55);
    playTone(2800, 0.05, "sine", 0.1, 0.6);
  }, []);

  // Notification / ping
  const playNotification = useCallback(() => {
    if (!enabled.current) return;
    
    playTone(880, 0.1, "sine", 0.2, 0);
    playTone(1100, 0.15, "sine", 0.15, 0.1);
  }, []);

  return {
    playCorrect,
    playIncorrect,
    playComplete,
    playClick,
    playLevelUp,
    playStreak,
    playSkip,
    playReward,
    playNotification,
    setEnabled,
  };
};
