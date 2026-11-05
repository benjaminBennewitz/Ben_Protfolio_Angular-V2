/**
 * @file Lokale Soundeffekte und analoger Audiomix für DEAD//AIR.
 * @description Lädt synthetisierte Audiodateien bedarfsorientiert, bündelt
 * Spielereignisse und berücksichtigt Browser-Autoplay, Sprache, Pause und Stummschaltung.
 * @author Benjamin Bennewitz
 */

const SOUND_FILES = Object.freeze({
  radio: 'sfx-radio-bed.mp3',
  tune: 'sfx-tune-click.mp3',
  scan: 'sfx-auto-scan.mp3',
  ping: 'sfx-ping-send.mp3',
  echo: 'sfx-ping-echo.mp3',
  miss: 'sfx-ping-miss.mp3',
  relay: 'sfx-relay-activated.mp3',
  activated: 'sfx-signal-activated.mp3',
  glitch: 'sfx-signal-glitch.mp3',
  anomaly: 'sfx-anomaly.mp3',
  charge: 'sfx-portal-charge.mp3',
  opening: 'sfx-portal-opening.mp3',
  hum: 'sfx-portal-hum.mp3',
  isolated: 'sfx-signal-isolated.mp3',
});

const EFFECT_VOLUMES = Object.freeze({
  tune: .30,
  scan: .38,
  ping: .55,
  echo: .47,
  miss: .32,
  relay: .53,
  activated: .41,
  glitch: .37,
  anomaly: .34,
  charge: .45,
  opening: .55,
  isolated: .46,
});

/** Ein isolierter Audiobus für UI-Geräusche, Funkechos und Finalatmosphäre. */
class Soundscape {
  constructor() {
    this.context = null;
    this.output = null;
    this.fxBus = null;
    this.bedBus = null;
    this.buffers = new Map();
    this.loading = new Map();
    this.active = new Map();
    this.bed = null;
    this.bedName = null;
    this.bedLevel = 0.035;
    this.lastTuneAt = 0;
    this.paused = false;
    this.muted = false;
    this.voicePlaying = false;
    this.scanning = false;
    this.finale = false;
    this.disposed = false;
    this.voiceAudio = null;
  }

  /** Schaltet den AudioContext erst nach einer echten Nutzereingabe frei. */
  async unlock() {
    if (this.disposed || this.context?.state === 'running') return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;

    if (!this.context) {
      this.context = new Context();
      this.output = this.context.createGain();
      this.fxBus = this.context.createGain();
      this.bedBus = this.context.createGain();
      this.output.gain.value = .65;
      this.fxBus.gain.value = 1;
      this.bedBus.gain.value = 0;
      this.fxBus.connect(this.output);
      this.bedBus.connect(this.output);
      this.output.connect(this.context.destination);
      // Kurze UI-Ereignisse haben Priorität. Die langen Atmosphären werden nachgeladen.
      void Promise.all(Object.keys(SOUND_FILES).map(name => this.load(name)));
    }

    if (this.paused || this.muted || document.hidden) return;
    try {
      await this.context.resume();
      this.updateBed();
    } catch {
      // Browser ohne nutzeraktivierten Audiokontext bleiben geräuschlos.
    }
  }

  /** Lädt einen Effekt genau einmal als dekodierten PCM-Puffer. */
  load(name) {
    if (!SOUND_FILES[name] || !this.context) return Promise.resolve(null);
    if (this.buffers.has(name)) return Promise.resolve(this.buffers.get(name));
    if (this.loading.has(name)) return this.loading.get(name);
    const location = new URL(`../assets/${SOUND_FILES[name]}`, import.meta.url);
    const promise = fetch(location)
      .then(response => {
        if (!response.ok) throw new Error(`Sounddatei fehlt: ${name}`);
        return response.arrayBuffer();
      })
      .then(bytes => this.context.decodeAudioData(bytes))
      .then(buffer => {
        this.buffers.set(name, buffer);
        return buffer;
      })
      .catch(() => null)
      .finally(() => this.loading.delete(name));
    this.loading.set(name, promise);
    return promise;
  }

  /** Spielt einen einzelnen, lokal gespeicherten Effekt mit begrenzter Lautstärke. */
  async play(name, volume = EFFECT_VOLUMES[name] ?? .4) {
    if (this.disposed || this.paused || this.muted || document.hidden || !this.context) return;
    const context = this.context;
    const buffer = await this.load(name);
    if (!buffer || context.state !== 'running' || this.paused || this.muted || this.disposed
      || document.hidden) return;

    // Ein erneuter Trigger ersetzt den älteren gleichnamigen Effekt.
    this.stop(name);
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.fxBus);
    this.active.set(name, source);
    source.onended = () => {
      if (this.active.get(name) === source) this.active.delete(name);
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  }

  /** Stoppt eine laufende Effektinstanz ohne ausstehende Story-Timer zu verändern. */
  stop(name) {
    const source = this.active.get(name);
    if (!source) return;
    this.active.delete(name);
    try { source.stop(); } catch { /* Bereits gestoppte Quellen sind unkritisch. */ }
  }

  /** Lässt Radio- und Portalatmosphäre unabhängig von UI-Sounds loopen. */
  async startBed(name) {
    if (!this.context || this.bedName === name || this.disposed) return;
    const requested = name;
    this.bedName = name;
    const buffer = await this.load(name);
    if (!buffer || !this.context || this.bedName !== requested || this.disposed) return;
    if (this.bed) {
      try { this.bed.stop(); } catch { /* Quelle wurde bereits beendet. */ }
      this.bed.disconnect();
    }
    this.bed = this.context.createBufferSource();
    this.bed.buffer = buffer;
    this.bed.loop = true;
    this.bed.connect(this.bedBus);
    this.bed.start();
    this.updateBed();
  }

  /** Dämpft das atmosphärische Rauschen, damit Sprachaufnahmen verständlich bleiben. */
  updateBed() {
    if (!this.context || !this.bedBus) return;
    const target = this.paused || this.muted || document.hidden ? 0
      : this.bedLevel * (this.voicePlaying ? .16 : 1);
    this.bedBus.gain.setTargetAtTime(target, this.context.currentTime, .10);
    if (!this.bedName && !this.finale) void this.startBed('radio');
  }

  /** FM-Zustand beeinflusst nur das leise Grundrauschen, nicht die Rätsellösung. */
  setReception(channel) {
    if (this.finale || this.scanning) return;
    this.bedLevel = channel === null ? .13
      : channel === 'warning' ? .09
        : channel === 'interference' || channel === 'unknown' ? .075 : .025;
    this.updateBed();
  }

  /** Begrenzt mechanisches Reglerrauschen auf wenige Impulse pro Sekunde. */
  tune() {
    const now = performance.now();
    if (now - this.lastTuneAt < 100 || this.finale) return;
    this.lastTuneAt = now;
    void this.play('tune');
  }

  /** Reguliert UI-FX, Funkaufnahmen und Atmosphären gemeinsam. */
  setMuted(value) {
    this.muted = Boolean(value);
    if (this.voiceAudio) this.voiceAudio.muted = this.muted;
    if (!this.context) return;
    this.output.gain.setTargetAtTime(this.muted ? 0 : .65, this.context.currentTime, .04);
    if (!this.muted && !this.paused && !document.hidden) void this.unlock();
    this.updateBed();
  }

  /** Pausen und Hintergrund-Tabs stoppen auch lange Soundflächen. */
  setPaused(value) {
    this.paused = Boolean(value);
    if (!this.context) return;
    if (this.paused || document.hidden) void this.context.suspend().catch(() => {});
    else if (!this.muted) void this.unlock();
    this.updateBed();
  }

  /** Spielzustandsereignisse steuern die Soundeffekte ohne Duplikatlogik in app.js. */
  attach(voiceAudio) {
    this.voiceAudio = voiceAudio;
    const tryUnlock = () => { void this.unlock(); };
    window.addEventListener('pointerdown', tryUnlock, { passive: true });
    window.addEventListener('keydown', tryUnlock);

    voiceAudio.addEventListener('play', () => {
      this.voicePlaying = true;
      this.updateBed();
    });
    for (const event of ['pause', 'ended']) {
      voiceAudio.addEventListener(event, () => {
        this.voicePlaying = false;
        this.updateBed();
      });
    }

    window.addEventListener('deadair:frequencychange', event => {
      this.setReception(event.detail.channel);
      this.tune();
    });
    window.addEventListener('deadair:autoscanstarted', () => {
      this.scanning = true;
      this.bedLevel = .11;
      this.updateBed();
      void this.play('scan');
    });
    window.addEventListener('deadair:transmissionreceived', () => {
      this.scanning = false;
      this.stop('scan');
      this.bedLevel = .035;
      this.updateBed();
    });
    window.addEventListener('deadair:relayping', () => { void this.play('ping'); });
    window.addEventListener('deadair:relayecho', event => {
      void this.play(event.detail.result === 'none' ? 'miss' : 'echo');
    });
    window.addEventListener('deadair:relaylinked', () => { void this.play('relay'); });
    window.addEventListener('deadair:relayaligned', () => { void this.play('activated'); });
    window.addEventListener('deadair:warningreceived', () => { void this.play('anomaly', .23); });
    window.addEventListener('deadair:storychanged', event => {
      if (event.detail.stage === 'windows-event') void this.play('anomaly', .26);
    });
    window.addEventListener('deadair:finalestarted', event => {
      this.finale = true;
      this.scanning = false;
      this.stop('scan');
      this.bedLevel = 0;
      this.updateBed();
      if (event.detail.mode === 'isolate') void this.play('isolated');
      else void this.play('charge');
    });
    window.addEventListener('deadair:finalephase', event => {
      if (event.detail.phase === 'opening') void this.play('opening');
      if (event.detail.phase === 'open') {
        void this.startBed('hum');
        this.bedLevel = .18;
        this.updateBed();
      }
      if (event.detail.phase === 'sealed') {
        this.bedLevel = 0;
        this.updateBed();
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (!this.context) return;
      if (document.hidden) void this.context.suspend().catch(() => {});
      else if (!this.paused && !this.muted) void this.unlock();
      this.updateBed();
    });
    window.addEventListener('pagehide', () => this.dispose(), { once: true });
  }

  /** Gibt Soundquellen bei einem Seitenwechsel vollständig frei. */
  dispose() {
    this.disposed = true;
    this.active.forEach(source => {
      try { source.stop(); } catch { /* Quelle wurde bereits beendet. */ }
    });
    this.active.clear();
    if (this.bed) {
      try { this.bed.stop(); } catch { /* Quelle wurde bereits beendet. */ }
    }
    if (this.context) void this.context.close().catch(() => {});
  }
}

export const soundscape = new Soundscape();
