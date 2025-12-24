import { useCallback, useRef, useEffect } from "react";

// Audio context for better performance
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playTone = (frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3, delay = 0) => {
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

// Play a sequence of notes
const playMelody = (notes: Array<{ freq: number; dur: number; delay: number }>, type: OscillatorType = "sine", volume = 0.25) => {
  notes.forEach(({ freq, dur, delay }) => {
    playTone(freq, dur, type, volume, delay);
  });
};

export const useWorldMapSounds = () => {
  const ambientInterval = useRef<number | null>(null);
  
  // Character movement step sound
  const playStep = useCallback(() => {
    playTone(200, 0.05, "square", 0.1);
    setTimeout(() => playTone(180, 0.05, "square", 0.08), 60);
  }, []);
  
  // Character arrives at node
  const playArrival = useCallback(() => {
    playMelody([
      { freq: 392, dur: 0.1, delay: 0 },    // G4
      { freq: 523, dur: 0.15, delay: 0.1 }, // C5
    ], "sine", 0.3);
  }, []);

  // Node selection sound
  const playSelect = useCallback(() => {
    playMelody([
      { freq: 523, dur: 0.08, delay: 0 },   // C5
      { freq: 659, dur: 0.08, delay: 0.06 }, // E5
      { freq: 784, dur: 0.12, delay: 0.12 }, // G5
    ], "sine", 0.25);
  }, []);

  // Enter level/dungeon
  const playEnterLevel = useCallback(() => {
    playMelody([
      { freq: 262, dur: 0.1, delay: 0 },    // C4
      { freq: 330, dur: 0.1, delay: 0.08 }, // E4
      { freq: 392, dur: 0.1, delay: 0.16 }, // G4
      { freq: 523, dur: 0.2, delay: 0.24 }, // C5
    ], "square", 0.2);
  }, []);

  // Can't enter (locked)
  const playLocked = useCallback(() => {
    playTone(150, 0.15, "sawtooth", 0.15);
    setTimeout(() => playTone(120, 0.2, "sawtooth", 0.12), 150);
  }, []);

  // Dungeon entrance dramatic sound
  const playDungeonEntrance = useCallback(() => {
    playMelody([
      { freq: 196, dur: 0.2, delay: 0 },    // G3
      { freq: 185, dur: 0.2, delay: 0.15 }, // F#3
      { freq: 175, dur: 0.2, delay: 0.3 },  // F3
      { freq: 165, dur: 0.4, delay: 0.45 }, // E3
    ], "sawtooth", 0.2);
  }, []);

  // Victory fanfare
  const playVictory = useCallback(() => {
    playMelody([
      { freq: 523, dur: 0.15, delay: 0 },    // C5
      { freq: 523, dur: 0.15, delay: 0.15 }, // C5
      { freq: 523, dur: 0.15, delay: 0.3 },  // C5
      { freq: 659, dur: 0.3, delay: 0.45 },  // E5
      { freq: 784, dur: 0.4, delay: 0.75 },  // G5
      { freq: 1047, dur: 0.5, delay: 1.1 },  // C6
    ], "square", 0.25);
  }, []);

  // Ambient background "ping" - creates atmosphere
  const playAmbientPing = useCallback(() => {
    const freq = 800 + Math.random() * 400;
    playTone(freq, 0.3, "sine", 0.03);
  }, []);

  // Start ambient sounds (subtle background)
  const startAmbient = useCallback(() => {
    if (ambientInterval.current) return;
    
    // Random ambient pings every 3-6 seconds
    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 3000;
      ambientInterval.current = window.setTimeout(() => {
        playAmbientPing();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }, [playAmbientPing]);

  // Stop ambient sounds
  const stopAmbient = useCallback(() => {
    if (ambientInterval.current) {
      clearTimeout(ambientInterval.current);
      ambientInterval.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, [stopAmbient]);

  // Correct answer in dungeon
  const playCorrect = useCallback(() => {
    playMelody([
      { freq: 523, dur: 0.1, delay: 0 },    // C5
      { freq: 659, dur: 0.1, delay: 0.1 },  // E5
      { freq: 784, dur: 0.15, delay: 0.2 }, // G5
    ], "sine", 0.3);
  }, []);

  // Incorrect answer
  const playIncorrect = useCallback(() => {
    playMelody([
      { freq: 311, dur: 0.15, delay: 0 },   // Eb4
      { freq: 262, dur: 0.2, delay: 0.15 }, // C4
    ], "square", 0.2);
  }, []);

  // Powerup collected
  const playPowerup = useCallback(() => {
    playMelody([
      { freq: 523, dur: 0.1, delay: 0 },    // C5
      { freq: 659, dur: 0.1, delay: 0.08 }, // E5
      { freq: 784, dur: 0.1, delay: 0.16 }, // G5
      { freq: 1047, dur: 0.1, delay: 0.24 },// C6
      { freq: 1319, dur: 0.15, delay: 0.32 },// E6
    ], "triangle", 0.25);
  }, []);

  // Lose a life
  const playLoseLife = useCallback(() => {
    playMelody([
      { freq: 392, dur: 0.1, delay: 0 },    // G4
      { freq: 262, dur: 0.15, delay: 0.1 }, // C4
      { freq: 196, dur: 0.25, delay: 0.25 },// G3
    ], "sawtooth", 0.2);
  }, []);

  return {
    playStep,
    playArrival,
    playSelect,
    playEnterLevel,
    playLocked,
    playDungeonEntrance,
    playVictory,
    playCorrect,
    playIncorrect,
    playPowerup,
    playLoseLife,
    startAmbient,
    stopAmbient,
  };
};
