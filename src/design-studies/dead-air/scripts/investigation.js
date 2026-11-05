/**
 * @file Ermittlungsnotizen, einmaliger Fremdträger und beobachtbare Signalspuren.
 * @description Verknüpft vorhandene Storyzustände mit lokalen Hinweisen und einer
 * gemeinsamen Licht-/Tonuhr. Besitzt keine zweite Story-Zustandsmaschine.
 * @author Benjamin Bennewitz
 */
import { MORSE_DIGITS, RELAY_PATTERNS, createMorseTimeline, isMorseOn } from './signal-patterns.js';

const COPY = Object.freeze({
  de: {
    notes: 'NOTIZEN', notesTitle: 'EMPFANGSPROTOKOLL', notesEmpty: 'Noch keine ungewöhnlichen Beobachtungen gesichert.',
    reference: 'ZAHLENCODE', referenceTitle: 'LICHTTELEGRAFIE', referenceBody: 'NCBS / WARTUNGSKARTE · Kurzer Impuls = Punkt. Langer Impuls = Strich. Fünf Impulse ergeben eine Ziffer; die längere Pause trennt die Ziffern.',
    source: 'Klicken. Ein gepresster Atemzug direkt am Mikrofon.', sourceLost: 'Die Stimme bricht ab. Der Träger bleibt leer.', lost: 'TRÄGER VERLOREN',
    sourceNote: '90.2 MHz: Sechs Sekunden Atem, Stöhnen und ein wiederkehrendes Klickmuster. Danach kein Träger. Die Aufnahme ließ sich nicht wiederholen.',
    sourceInterrupted: '90.2 MHz: Ein Atemzug und drei ungleichmäßige Klicks. Beim Verlassen brach der Träger endgültig ab.',
    morseNote: 'Die Notiz nennt 91 / 3. Auf CAM 01 pulst der Mast in kurzen und langen Abständen. Die Wartungskarte am Empfänger erklärt Zahlencodes.',
    alexNote: 'Alex bittet um die drei Relais. Hinter seiner Stimme ist ein trockenes, wiederkehrendes Klicken zu hören. Die Senderkennung ist nicht verifiziert.',
    matchedNote: 'Das Klicken hinter Alex klingt wie die Folge auf dem inzwischen verstummten 90.2-MHz-Träger. Gleiche Quelle – oder nur dieselbe Störung?',
    relay1: 'Erstes Relais verbunden: Im Rücksignal taucht erneut das trockene Klickmuster auf.',
    relay2: 'Zweites Relais verbunden: Die Station meldet eine Bildabweichung auf CAM 01.',
    windows: 'CAM 01: Nach der zweiten Verbindung gingen die Fenster nacheinander aus und wieder an. Das sah nach einer Antwort aus.',
    relay3: 'Alex: „Ich sehe die drei Bojen wieder.“ Die Antwort kam unmittelbar nach der dritten Verbindung. Eine Bestätigung wurde von hier noch gar nicht gesendet.',
    syncNote: 'Jede Boje wiederholt eine Dreierkennung. Die kurzen Gruppen im Oszilloskop sehen ähnlich aus; erst die Pausen zeigen, welche Gruppe zur gespeicherten Kennung gehört.',
    warningNote: 'Nach dem Abgleich erlischt der Leuchtkegel auf CAM 01. Der Mast sendet wieder einen Zahlencode. Alex wartet auf den Rückkanal.',
    localNote: 'Beide bekannten Kameras sind offline. Ein nicht registrierter lokaler Eingang hat sich danach selbst angemeldet.',
    signature: 'KENNUNG / {id}', signatureAria: 'Gespeicherte Klickkennung von Relais {id} anhören', signatureMissing: 'Noch nicht aufgezeichnet',
    signaturePlaying: 'Dreierkennung {id}: {pattern}. Pausen: {intervals}.',
    local: 'CAM 03 / LOCAL', localReady: 'UNREGISTRIERTER EINGANG / CAM 03', localFeed: 'LOKALER FEED · KEINE SENDERKENNUNG',
    offline: 'CAM 01 / 02 · OFFLINE', creak: 'Ein langsames Quietschen. Die Schaukel bewegt sich.', laugh: 'Die Frau lacht. Trockenes Klicken zwischen den Atemzügen.',
    localAria: 'Lokale Überwachungskamera: eine erwachsene Frau lächelt auf einer langsam schaukelnden Schaukel im leeren Stationshof.',
    match: 'GLEICHER RHYTHMUS', different: 'ANDERE FOLGE', comparePrompt: 'Vergleiche beide gespeicherten Klickspuren. Stammt der Rhythmus aus derselben Quelle?', compareRetry: 'Höre besonders auf die kurze und die längere Pause zwischen den Klicks.', compareDone: 'Übereinstimmung im Protokoll gesichert. Die Identität des Senders bleibt ungeklärt.',
    compare: 'FUNKSPUREN VERGLEICHEN', compareHint: 'Gesicherte Beobachtungen bleiben hier lesbar. Ein Hinweis ist noch kein Beweis.',
  },
  en: {
    notes: 'NOTES', notesTitle: 'RECEPTION LOG', notesEmpty: 'No unusual observations recorded yet.',
    reference: 'NUMBER CODE', referenceTitle: 'LIGHT TELEGRAPHY', referenceBody: 'NCBS / SERVICE CARD · Short pulse = dot. Long pulse = dash. Five pulses form a digit; the longer gap separates digits.',
    source: 'Clicking. A strained breath right against the microphone.', sourceLost: 'The voice cuts out. The carrier remains empty.', lost: 'CARRIER LOST',
    sourceNote: '90.2 MHz: Six seconds of breath, moaning and a recurring click pattern. Then no carrier. The recording could not be repeated.',
    sourceInterrupted: '90.2 MHz: A breath and three uneven clicks. Leaving the frequency permanently cut the carrier.',
    morseNote: 'The note mentions 91 / 3. On CAM 01 the mast pulses in short and long intervals. The receiver service card explains number codes.',
    alexNote: 'Alex asks for the three relays. Dry, recurring clicks can be heard behind his voice. The station ID is unverified.',
    matchedNote: 'The clicks behind Alex sound like the sequence on the now silent 90.2-MHz carrier. The same source – or just the same interference?',
    relay1: 'First relay linked: The dry click pattern returns in the response.',
    relay2: 'Second relay linked: The station reports an image discrepancy on CAM 01.',
    windows: 'CAM 01: After the second connection, the windows went dark and lit up in sequence. It looked like a response.',
    relay3: 'Alex: “I can see the three buoys again.” The response arrived immediately after the third connection. No confirmation has been sent from here yet.',
    syncNote: 'Each buoy repeats a three-click ID. Short groups in the scope look alike; the gaps identify the group that matches the stored signature.',
    warningNote: 'After alignment, the beam on CAM 01 goes out. The mast sends another number code. Alex is waiting for the return channel.',
    localNote: 'Both known cameras are offline. An unregistered local input has subsequently connected itself.',
    signature: 'SIGNATURE / {id}', signatureAria: 'Play stored click signature of relay {id}', signatureMissing: 'Not recorded yet',
    signaturePlaying: 'Three-click signature {id}: {pattern}. Gaps: {intervals}.',
    local: 'CAM 03 / LOCAL', localReady: 'UNREGISTERED INPUT / CAM 03', localFeed: 'LOCAL FEED · NO STATION ID',
    offline: 'CAM 01 / 02 · OFFLINE', creak: 'A slow creak. The swing is moving.', laugh: 'The woman laughs. Dry clicking between breaths.',
    localAria: 'Local surveillance camera: an adult woman smiles on a slowly moving swing in the empty station courtyard.',
    match: 'SAME RHYTHM', different: 'DIFFERENT SEQUENCE', comparePrompt: 'Compare both stored click traces. Does the rhythm come from the same source?', compareRetry: 'Listen closely to the short and the longer gap between the clicks.', compareDone: 'Match recorded in the log. The identity of the sender remains unknown.',
    compare: 'COMPARE RADIO TRACES', compareHint: 'Recorded observations remain available here. A clue is not proof.',
  },
});

export class Investigation {
  constructor({ scene, root, soundscape, refreshFrequency, isRunning }) {
    this.scene = scene;
    this.root = root;
    this.soundscape = soundscape;
    this.refreshFrequency = refreshFrequency;
    this.isRunning = isRunning;
    this.observations = new Set();
    this.tracesPlayed = new Set();
    this.strangerStartedAt = null;
    this.strangerSpent = false;
    this.relayFlashPending = false;
    this.relayFlashAt = null;
    this.localOpenedAt = null;
    this.localLaughed = false;
    this.morseFrame = 0;
    this.timelines = { first: createMorseTimeline('1037'), warning: createMorseTimeline('1024') };
    this.notesDialog = document.querySelector('#notes-dialog');
    this.referenceDialog = document.querySelector('#morse-dialog');
    this.caption = document.querySelector('#signal-caption');
  }

  /** Bindet nur lokale Hinweise; alle eigentlichen Fortschrittssperren bleiben in app.js. */
  attach() {
    document.querySelector('#notes-toggle').addEventListener('click', () => this.notesDialog.showModal());
    document.querySelector('#morse-toggle').addEventListener('click', () => this.referenceDialog.showModal());
    for (const id of ['notes', 'morse']) {
      const dialog = document.querySelector(`#${id}-dialog`);
      document.querySelector(`#${id}-close`).addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    }
    for (const dialog of document.querySelectorAll('dialog')) {
      dialog.addEventListener('close', () => {
        this.scene.story.lastTick = performance.now();
        this.refreshMorse();
      });
    }
    document.querySelectorAll('[data-signature]').forEach(button => {
      button.addEventListener('click', () => this.playSignature(button.dataset.signature));
    });
    document.querySelectorAll('[data-trace]').forEach(button => {
      button.addEventListener('click', () => {
        if (button.dataset.trace === 'stranger') void this.soundscape.play('sourceClicks', .26);
        else if (this.observations.has('alexNote')) void this.soundscape.play('sourceClicks', .12);
        this.tracesPlayed.add(button.dataset.trace);
        this.renderComparison();
      });
    });
    document.querySelector('#trace-match').addEventListener('click', () => {
      if (this.tracesPlayed.size !== 2) return;
      this.record('matchedNote');
      document.querySelector('#trace-status').textContent = this.copy.compareDone;
    });
    document.querySelector('#trace-different').addEventListener('click', () => {
      document.querySelector('#trace-status').textContent = this.copy.compareRetry;
    });
    this.audioObserver = new MutationObserver(() => {
      this.updateStrangerAudio();
      this.refreshMorse();
    });
    for (const dialog of document.querySelectorAll('dialog')) {
      this.audioObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
    }
    const table = document.querySelector('#morse-digits');
    MORSE_DIGITS.forEach((code, digit) => {
      const row = document.createElement('div');
      const number = document.createElement('strong');
      number.textContent = String(digit);
      const value = document.createElement('code');
      value.textContent = code.replaceAll('.', '·').replaceAll('-', '−');
      row.append(number, value);
      table.append(row);
    });
    this.render();
  }

  get copy() { return COPY[this.scene.language]; }

  /** Die Verbindung der beiden Quellen muss der Spieler selbst bestätigen. */
  renderComparison() {
    const available = this.tracesPlayed.size === 2 && !this.observations.has('matchedNote');
    document.querySelector('#trace-comparison').hidden = !available;
    document.querySelector('#trace-prompt').textContent = this.copy.comparePrompt;
    document.querySelector('#trace-match').textContent = this.copy.match;
    document.querySelector('#trace-different').textContent = this.copy.different;
  }


  /** Sichert Beobachtungen genau einmal, ohne Lösungen nachträglich zu erfinden. */
  record(key) {
    if (this.observations.has(key)) return;
    this.observations.add(key);
    this.render();
  }

  /** Ein Fremdsignal kann nur einmal empfangen werden; Verlassen beendet den Versuch. */
  tune(channel) {
    if (this.scene.finale.mode) return;
    if (this.strangerStartedAt !== null && channel !== 'stranger') this.finishStranger(true);
    if (channel === 'stranger' && !this.strangerSpent && this.strangerStartedAt === null) {
      this.strangerStartedAt = this.scene.anomaly.activeMs;
      this.root.dataset.stranger = 'live';
      this.showCaption('source');
      this.updateStrangerAudio();
    }
    if (Math.abs(this.scene.frequency - 90.2) > .11 && this.root.dataset.stranger === 'lost') {
      delete this.root.dataset.stranger;
      this.showCaption(null);
    }
    this.refreshMorse();
  }

  /** Der einmalige Empfang folgt auch beim Lesen von Notizen der aktiven Spielzeit. */
  updateStrangerAudio() {
    if (this.strangerStartedAt === null) return;
    if (!this.isRunning() || this.scene.soundMuted) {
      this.soundscape.stop('stranger');
      return;
    }
    if (!this.soundscape.active.has('stranger')) {
      const offset = Math.max(0, (this.scene.anomaly.activeMs - this.strangerStartedAt) / 1000);
      void this.soundscape.play('stranger', .65, offset);
    }
  }

  /** Nach dem Abriss bleibt der Sender leer; der Regler springt manuell nicht. */
  finishStranger(interrupted = false) {
    if (this.strangerStartedAt === null) return;
    this.strangerStartedAt = null;
    this.strangerSpent = true;
    this.soundscape.stop('stranger');
    this.record(interrupted ? 'sourceInterrupted' : 'sourceNote');
    if (!interrupted) {
      this.root.dataset.stranger = 'lost';
      this.refreshFrequency();
      document.querySelector('#status-output').textContent = this.copy.lost;
      this.showCaption('sourceLost');
    } else {
      delete this.root.dataset.stranger;
      this.showCaption(null);
    }
  }

  /** Die Reaktion hängt von der Anzahl ab, nicht von der Reihenfolge der Relais. */
  linked(count) {
    this.record(`relay${count}`);
    if (count === 1) void this.soundscape.play('sourceClicks', .32);
    if (count === 2) this.relayFlashPending = true;
    if (count === 3) this.record('syncNote');
    this.render();
  }

  /** Der Referenzton ist eine gespeicherte Kennung und verrät keine Zielfrequenz. */
  playSignature(id) {
    if (!this.scene.relays.linked.has(id) || this.scene.paused) return;
    const pattern = RELAY_PATTERNS[id];
    const caption = this.copy.signaturePlaying.replace('{id}', id)
      .replace('{pattern}', pattern.short).replace('{intervals}', pattern.intervals);
    for (const id of ['signature-status', 'relay-signature-status']) document.querySelector(`#${id}`).textContent = caption;
    this.soundscape.stop('signatureA');
    this.soundscape.stop('signatureB');
    this.soundscape.stop('signatureC');
    void this.soundscape.play(`signature${id}`, .65);
  }

  showCaption(key) {
    this.caption.dataset.key = key ?? '';
    this.caption.hidden = !key;
    this.caption.textContent = key ? this.copy[key] : '';
  }

  /** Taktet einmalige Ereignisse aus der pausierbaren Hauptuhr. */
  tick() {
    const now = this.scene.anomaly.activeMs;
    this.updateStrangerAudio();
    if (this.strangerStartedAt !== null && now - this.strangerStartedAt >= 6000) this.finishStranger();
    if (this.relayFlashPending && this.scene.source === 'artwork' && !this.scene.finale.mode) {
      this.relayFlashPending = false;
      this.relayFlashAt = now;
      this.root.dataset.relayFlash = 'true';
      this.record('windows');
    }
    if (this.relayFlashAt !== null && now - this.relayFlashAt >= 6000) {
      this.relayFlashAt = null;
      delete this.root.dataset.relayFlash;
    }
    if (this.scene.finale.mode) {
      this.soundscape.setMorseGate(false);
      delete this.root.dataset.relayFlash;
      if (this.strangerStartedAt !== null) this.finishStranger(true);
    }
    if (this.localOpenedAt !== null && !this.localLaughed && now - this.localOpenedAt >= 4200) {
      this.localLaughed = true;
      this.showCaption('laugh');
      void this.soundscape.play('localLaugh', .7);
    }
    this.refreshMorse();
  }

  /** Für beide Codes wird dieselbe Uhr und dieselbe Impulsliste verwendet. */
  morseState() {
    if (this.scene.source !== 'artwork' || this.scene.finale.mode) return null;
    if (this.scene.story.stage === 'morse-active' && this.scene.channel === 'interference') {
      return { timeline: this.timelines.first, start: this.scene.anomaly.morseStartedAtMs };
    }
    if (this.scene.story.stage === 'synchronized') {
      return { timeline: this.timelines.warning, start: this.scene.anomaly.syncStartedAtMs };
    }
    return null;
  }

  refreshMorse() {
    const state = this.morseState();
    if (!state || !this.isRunning()) {
      cancelAnimationFrame(this.morseFrame);
      this.morseFrame = 0;
      this.soundscape.setMorseGate(false);
      this.root.dataset.morsePulse = state ? 'off' : 'idle';
      return;
    }
    if (this.morseFrame) return;
    let lastDraw = 0;
    const draw = timestamp => {
      this.morseFrame = 0;
      if (timestamp - lastDraw < 32) {
        this.morseFrame = requestAnimationFrame(draw);
        return;
      }
      lastDraw = timestamp;
      const current = this.morseState();
      if (!current || !this.isRunning()) { this.refreshMorse(); return; }
      const elapsed = this.scene.anomaly.activeMs
        + Math.min(250, Math.max(0, performance.now() - this.scene.story.lastTick)) - current.start;
      const on = isMorseOn(current.timeline, elapsed);
      const pulse = on ? 'on' : 'off';
      if (this.root.dataset.morsePulse !== pulse) this.root.dataset.morsePulse = pulse;
      this.soundscape.setMorseGate(on);
      this.morseFrame = requestAnimationFrame(draw);
    };
    this.morseFrame = requestAnimationFrame(draw);
  }

  openLocal() {
    if (this.localOpenedAt !== null) return;
    this.localOpenedAt = this.scene.anomaly.activeMs;
    this.showCaption('creak');
    this.soundscape.bedLevel = .25;
    void this.soundscape.startBed('swingCreak');
    this.record('localNote');
  }

  /** Rendert nur bekannte Hinweise und übersetzt auch bereits gesicherte Notizen. */
  render() {
    const texts = this.copy;
    for (const [id, key] of [['notes-title','notesTitle'], ['morse-title','referenceTitle'],
      ['morse-description','referenceBody'], ['notes-description','compareHint'],
      ['morse-toggle','reference'], ['local-camera','local'], ['local-offline','offline']]) {
      document.querySelector(`#${id}`).textContent = texts[key];
    }
    document.querySelector('#notes-toggle').textContent = `${texts.notes} / ${this.observations.size}`;
    for (const id of ['notes-close', 'morse-close']) {
      document.querySelector(`#${id}`).setAttribute('aria-label', this.scene.language === 'de' ? 'Schließen' : 'Close');
    }
    document.querySelector('#local-scene').setAttribute('aria-label', texts.localAria);
    const list = document.querySelector('#notes-list');
    list.replaceChildren();
    for (const key of this.observations) {
      const item = document.createElement('li');
      item.textContent = texts[key];
      list.append(item);
    }
    if (!this.observations.size) {
      const item = document.createElement('li');
      item.textContent = texts.notesEmpty;
      list.append(item);
    }
    document.querySelectorAll('[data-signature]').forEach(button => {
      const id = button.dataset.signature;
      button.disabled = !this.scene.relays.linked.has(id) || this.scene.paused;
      button.textContent = `${texts.signature.replace('{id}', id)} · ${this.scene.relays.linked.has(id) ? RELAY_PATTERNS[id].short : '—'}`;
      button.setAttribute('aria-label', texts.signatureAria.replace('{id}', id) + ' · ' + RELAY_PATTERNS[id].intervals);
    });
    document.querySelectorAll('[data-trace]').forEach(button => {
      const first = button.dataset.trace === 'stranger';
      button.hidden = first
        ? !this.observations.has('sourceNote') && !this.observations.has('sourceInterrupted')
        : !this.observations.has('alexNote');
      button.textContent = `${first ? '90.2 MHz' : 'ALEX'} / ${texts.compare} · ••   •`;
    });
    if (this.caption.dataset.key) this.caption.textContent = texts[this.caption.dataset.key];
    for (const id of ['signature-status', 'relay-signature-status']) document.querySelector(`#${id}`).textContent = '';
    this.renderComparison();
    this.refreshMorse();
  }

  dispose() {
    cancelAnimationFrame(this.morseFrame);
    this.audioObserver?.disconnect();
    this.soundscape.setMorseGate(false);
  }
}
