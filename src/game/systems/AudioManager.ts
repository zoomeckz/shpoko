import { AudioEvent } from '../types';

// Web Audio API-based sound system for responsive, soft sounds
class AudioManagerClass {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = true;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.5;
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = enabled ? 0.5 : 0;
    }
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.3,
    delay = 0
  ) {
    if (!this.enabled) return;
    
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain!);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  }

  private playNoise(duration: number, volume = 0.1, delay = 0) {
    if (!this.enabled) return;
    
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain!);

    source.start(ctx.currentTime + delay);
  }

  play(event: AudioEvent) {
    if (!this.enabled) return;

    switch (event) {
      case 'footstep_walk':
        this.playTone(150, 0.05, 'triangle', 0.1);
        this.playNoise(0.03, 0.05);
        break;

      case 'footstep_run':
        this.playTone(180, 0.04, 'triangle', 0.15);
        this.playNoise(0.03, 0.08);
        break;

      case 'jump_start':
        this.playTone(300, 0.1, 'sine', 0.25);
        this.playTone(450, 0.1, 'sine', 0.15, 0.02);
        break;

      case 'jump_land':
        this.playTone(120, 0.08, 'triangle', 0.2);
        this.playNoise(0.05, 0.1);
        break;

      case 'stomp':
        this.playTone(200, 0.08, 'square', 0.3);
        this.playTone(150, 0.1, 'triangle', 0.25, 0.02);
        this.playNoise(0.08, 0.15);
        break;

      case 'enemy_defeat':
        this.playTone(400, 0.1, 'sine', 0.25);
        this.playTone(600, 0.1, 'sine', 0.2, 0.05);
        this.playTone(800, 0.15, 'sine', 0.15, 0.1);
        break;

      case 'word_popup':
        this.playTone(523, 0.12, 'sine', 0.2); // C5
        this.playTone(659, 0.12, 'sine', 0.15, 0.06); // E5
        this.playTone(784, 0.15, 'sine', 0.12, 0.12); // G5
        break;

      case 'node_unlock':
        this.playTone(392, 0.15, 'sine', 0.25); // G4
        this.playTone(494, 0.15, 'sine', 0.2, 0.1); // B4
        this.playTone(587, 0.2, 'sine', 0.2, 0.2); // D5
        this.playTone(784, 0.25, 'sine', 0.15, 0.3); // G5
        break;

      case 'button_click':
        this.playTone(440, 0.05, 'square', 0.15);
        this.playTone(550, 0.05, 'square', 0.1, 0.02);
        break;

      case 'rocket_launch':
        this.playNoise(0.3, 0.2);
        for (let i = 0; i < 5; i++) {
          this.playTone(100 + i * 50, 0.4 - i * 0.05, 'sawtooth', 0.15 - i * 0.02, i * 0.05);
        }
        break;

      case 'hurt':
        this.playTone(200, 0.1, 'sawtooth', 0.3);
        this.playTone(150, 0.15, 'sawtooth', 0.25, 0.05);
        break;

      case 'victory':
        const notes = [523, 587, 659, 784, 880, 1047]; // C5 to C6
        notes.forEach((freq, i) => {
          this.playTone(freq, 0.2, 'sine', 0.2 - i * 0.02, i * 0.08);
        });
        break;
    }
  }
}

export const AudioManager = new AudioManagerClass();
