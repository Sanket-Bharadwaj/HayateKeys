
class SoundManager {
  private context: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer } = {};
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  private createTone(frequency: number, duration: number, volume: number = 0.1): AudioBuffer | null {
    if (!this.context) return null;
    
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * volume;
    }
    
    return buffer;
  }
  
  async initialize() {
    if (!this.context) return;
    
    // Create different sound effects
    this.sounds.keypress = this.createTone(800, 0.05, 0.05) || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.correct = this.createTone(600, 0.1, 0.1) || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.error = this.createTone(200, 0.2, 0.15) || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.combo = this.createTone(1000, 0.15, 0.1) || new AudioBuffer({ length: 1, sampleRate: 44100 });
    this.sounds.complete = this.createTone(800, 0.3, 0.1) || new AudioBuffer({ length: 1, sampleRate: 44100 });
  }
  
  play(soundName: string) {
    if (!this.context || !this.sounds[soundName]) return;
    
    const source = this.context.createBufferSource();
    source.buffer = this.sounds[soundName];
    source.connect(this.context.destination);
    source.start();
  }
}

export const soundManager = new SoundManager();
