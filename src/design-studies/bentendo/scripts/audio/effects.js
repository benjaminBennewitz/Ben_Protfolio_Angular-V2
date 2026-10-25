/** Erzeugt kurze Bediengeräusche über denselben Lautstärkepfad. */
export class Effects {
  /** Bereitet den Audiozustand vor. */
  constructor() { this.context = null; this.gain = null; }
  /** Aktiviert Audio ausschließlich nach einer Benutzereingabe. */
  async unlock() {
    if (!this.context) this.create();
    if (this.context?.state === 'suspended') await this.context.resume();
  }
  /** Erstellt AudioContext und Ausgang. */
  create() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    this.context = new Audio();
    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);
    this.gain.gain.value = 0;
  }
  /** Übernimmt Lautstärke und Stummschaltung. @param {number} volume Gesamtlautstärke. */
  volume(volume) {
    if (this.gain) this.gain.gain.setTargetAtTime(volume * 0.2, this.context.currentTime, 0.02);
  }
  /** Spielt eine kurze Pulsnote. @param {number} frequency Tonhöhe. @param {number} duration Länge. */
  tone(frequency = 220, duration = 0.06) {
    if (this.context?.state !== 'running') return;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    const at = this.context.currentTime;
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0.4, at);
    envelope.gain.exponentialRampToValueAtTime(0.001, at + duration);
    oscillator.connect(envelope); envelope.connect(this.gain);
    oscillator.addEventListener('ended', this.disconnect.bind(this, oscillator, envelope), { once: true });
    oscillator.start(at); oscillator.stop(at + duration);
  }
  /** Trennt fertige Klangknoten. @param {AudioNode} source Quelle. @param {AudioNode} envelope Hüllkurve. */
  disconnect(source, envelope) { source.disconnect(); envelope.disconnect(); }
  /** Erzeugt ein kurzes Pustegeräusch. */
  blow() {
    if (this.context?.state !== 'running') return;
    const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.6, this.context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.sin(i / samples.length * Math.PI) * 0.3;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 1300;
    source.buffer = buffer; source.connect(filter); filter.connect(this.gain);
    source.addEventListener('ended', this.disconnect.bind(this, source, filter), { once: true });
    source.start();
  }
}
