/**
 * Synthesized Ambient & Acoustic Audio Engine for Rasel Babu Track Previews
 * Generates smooth melodic tones, tanpura hums, and acoustic chord arpeggios
 * using the HTML5 Web Audio API so preview music genuinely plays anywhere.
 */

class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;
  private intervalId: any = null;
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTrack(trackId: string, baseFreq: number = 220) {
    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.currentTrackId = trackId;

    // Scale notes in Bengali Raag Bhairavi / Bilawal mode (Hz relative to baseFreq)
    // Root, Minor 2nd, Major 3rd, Perfect 4th, Perfect 5th, Minor 6th, Minor 7th
    const ragaScale = [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.875, 2.0];
    let noteIndex = 0;

    // Drone / Tanpura fundamental sound
    const droneOsc = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(baseFreq * 0.5, this.ctx.currentTime);
    droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    droneOsc.connect(droneGain);
    droneGain.connect(this.masterGain);
    droneOsc.start();

    // Harmonics drone
    const droneOsc5th = this.ctx.createOscillator();
    const droneGain5th = this.ctx.createGain();
    droneOsc5th.type = 'sine';
    droneOsc5th.frequency.setValueAtTime(baseFreq * 0.75, this.ctx.currentTime);
    droneGain5th.gain.setValueAtTime(0.04, this.ctx.currentTime);
    droneOsc5th.connect(droneGain5th);
    droneGain5th.connect(this.masterGain);
    droneOsc5th.start();

    // Melodic arpeggio player
    this.intervalId = setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const freq = baseFreq * ragaScale[noteIndex % ragaScale.length];
      this.playNote(freq, 0.9);
      // subtle natural rhythm alternation
      noteIndex = (noteIndex + (Math.random() > 0.4 ? 1 : 2)) % ragaScale.length;
    }, 450);
  }

  private playNote(frequency: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    // Plucked string acoustic resonator
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now);

    // Filter for warm wooden acoustic instrument timbre
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

    // Natural plucked decay envelope
    noteGain.gain.setValueAtTime(0.2, now);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume * 0.4)), this.ctx.currentTime);
    }
  }

  public stop() {
    this.isPlaying = false;
    this.currentTrackId = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      // suspend gently
      this.ctx.suspend().catch(() => {});
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): string | null {
    return this.currentTrackId;
  }
}

export const audioSynth = new AudioSynthEngine();
