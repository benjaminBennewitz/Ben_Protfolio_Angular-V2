/**
 * @file Interaktive Rundfunkkonsole für DEAD//AIR.
 * @description Steuert die fotografische Szene, den analogen FM-Frequenzregler,
 * Kamera, Wiedergabe, Licht und ereignisgesteuerte Story-Artefakte.
 * @author Benjamin Bennewitz
 */

/** @typedef {'normal' | 'interference' | 'unknown'} SignalState */
/** @typedef {'artwork' | 'video'} SceneSource */
/** @typedef {'routine' | 'message-found' | 'morse-active' | 'windows-event' | 'frequency-scan' | 'transmission-ready'} StoryStage */

/** Fest definierte Frequenzen und ihre Bildstörung. */
const CHANNELS = Object.freeze({
  normal: { frequency: 87.6, channel: '01', reception: 76, interference: 15, label: 'STABLE FEED' },
  interference: { frequency: 91.3, channel: '02', reception: 38, interference: 60, label: 'SIGNAL DRIFT' },
  unknown: { frequency: 103.7, channel: '03', reception: 8, interference: 91, label: 'SOURCE UNKNOWN' },
  voice: { frequency: 96.4, channel: '04', reception: 24, interference: 63, label: 'VOICE CARRIER' },
});

const FM_MIN = 87.5;
const FM_MAX = 108;
const TUNING_TOLERANCE = 0.35;
const BOTTLE_APPEAR_AFTER_MS = 15_000;
const BOTTLE_GLITCH_MS = 2_000;
const CAMERA_BLACKOUT_MS = 320;
const WINDOWS_TO_SCAN_MS = 2_800;
const AUTO_SCAN_DURATION_MS = 4_800;
const AUTO_SCAN_POINTS = Object.freeze([
  { time: 0, frequency: 103.7 },
  { time: .24, frequency: 93.8 },
  { time: .47, frequency: 102.6 },
  { time: .76, frequency: 89.9 },
  { time: 1, frequency: CHANNELS.voice.frequency },
]);

/** Sämtliche sichtbaren UI- und Status-Texte der Microsite. */
const TRANSLATIONS = Object.freeze({
  de: {
    skip: 'Zum Empfangsbereich springen',
    back: 'ZURÜCK ZUM ARCHIV',
    eyebrow: 'NCBS / EMPFANGSSTATION 01',
    intro: 'Die letzte Schicht verschwand nach einem Hilferuf. Das Kamerasystem ist noch aktiv.',
    tune: 'FREQUENZ EINSTELLEN',
    offAir: 'KEIN EMPFANG',
    offAirDescription: 'Nur Rauschen. Auf dieser Frequenz antwortet niemand.',
    transmitting: 'ÜBERTRAGUNG AKTIV',
    artwork: 'STATION / CAM 01',
    footage: 'KÜSTE / CAM 02',
    pause: 'PAUSE',
    resume: 'FORTSETZEN',
    sceneStatus: 'AKTUELLER SIGNALZUSTAND',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    credits: 'Video: Pexels ↗',
    sourceAria: 'Kamera wählen',
    topNavAria: 'Informationen, Sprache und Archiv',
    info: 'INFO',
    close: 'Schließen',
    receiverButton: 'EMPFANG',
    openReceiver: 'Empfangsregler öffnen',
    closeReceiver: 'SCHLIESSEN ×',
    legalNav: 'Rechtliches und Bildnachweise',
    infoDescription: 'North Coast Broadcasting System. Die Küste sendet noch immer.',
    sceneArtworkAria: 'Küstenkamera mit Leuchtturm, Sendestation, Nebel und Signalstörungen',
    sceneVideoAria: 'Küstenkamera mit felsigem Ufer, Brandung und Signalstörungen',
    examineBottle: 'Flaschenpost untersuchen',
    cameraBlocked: 'Signal unterbrochen. Kamera 01 bleibt aktiv.',
    anomalyMeter: 'Anomalieaktivität in der aktuellen Kamera',
    evidenceLog: 'AKTE / 01',
    evidenceLogAria: 'Gesicherte Flaschenpost erneut lesen',
    scanStatus: 'FREMDSTEUERUNG / SUCHLAUF',
    scanDescription: 'Der Empfänger verändert die Frequenz ohne Eingabe.',
    transmissionStatus: 'AUDIO-SIGNAL ERKANNT',
    transmissionDescription: 'Eine fremde Übertragung wurde auf 96.4 MHz empfangen.',
    transmissionButton: 'AUDIO / 001',
    transmissionButtonAria: 'Empfangene Tonübertragung 001 untersuchen',
    transmissionMeta: 'NCBS / UNBEKANNTER EMPFANG',
    transmissionTitle: 'EINE STIMME IM RAUSCHEN.',
    transmissionFrequency: '96.4 MHz / AUFZEICHNUNG 001',
    transmissionTranscriptLabel: 'TRANSKRIPT / EMPFANGENES FRAGMENT',
    transmissionLine1: '…hier ist die Küstenleitstelle. Ist noch jemand an der Station?',
    transmissionLine2: 'Wir haben den letzten Funkspruch gefunden. Es fehlt nur die Rückmeldung.',
    transmissionLine3: 'Halten Sie die Frequenz frei. Wir versuchen, den Rest zu übertragen.',
    transmissionFooter: 'ABSENDER UNBESTÄTIGT · TRANSKRIPT REKONSTRUIERT',
    transmissionReceivedAnnouncement: 'Neue Tonübertragung auf 96.4 Megahertz empfangen.',
    messageMeta: 'FUNDSTÜCK / 001',
    messageSubtitle: 'FUNDSTÜCK / FLASCHENPOST',
    messageTitle: 'EINE MINUTE FEHLT.',
    messageBody1: 'Der Mitschnitt endet zu früh. Nach dem Hilferuf lief das Band noch weiter.',
    messageBody2: 'Ich habe den Rest nur einmal gehört. Am Rand des Protokolls steht eine Kennung: 91 / 3.',
    messageBody3: 'Vielleicht findet sich dort endlich eine Antwort darauf, wohin sie verschwunden sind.',
    messageFooter: 'KEIN DATUM · KEINE UNTERSCHRIFT',
    stateDescriptions: {
      normal: 'Ein gewöhnlicher Küstenfeed. Leuchtfeuer und Wetter bleiben stabil.',
      interference: 'Die Übertragung verliert an Klarheit. Nebel und Störungen nehmen zu.',
      unknown: 'Eine fremde Frequenz greift in die Übertragung ein. Der Ursprung ist unbekannt.',
      voice: 'Eine unbekannte Stimme wurde auf dieser Frequenz aufgezeichnet.',
    },
  },
  en: {
    skip: 'Skip to receiver',
    back: 'BACK TO ARCHIVE',
    eyebrow: 'NCBS / RECEIVER STATION 01',
    intro: 'The last shift vanished after a distress call. The camera system is still active.',
    tune: 'TUNE FREQUENCY',
    offAir: 'NO CARRIER',
    offAirDescription: 'Only static. No one answers on this frequency.',
    transmitting: 'TRANSMISSION ACTIVE',
    artwork: 'STATION / CAM 01',
    footage: 'COAST / CAM 02',
    pause: 'PAUSE',
    resume: 'RESUME',
    sceneStatus: 'CURRENT SIGNAL STATE',
    imprint: 'Legal notice',
    privacy: 'Privacy',
    credits: 'Footage: Pexels ↗',
    sourceAria: 'Choose camera',
    topNavAria: 'Information, language and archive',
    info: 'INFO',
    close: 'Close',
    receiverButton: 'RECEIVER',
    openReceiver: 'Open receiver controls',
    closeReceiver: 'CLOSE ×',
    legalNav: 'Legal information and image credits',
    infoDescription: 'North Coast Broadcasting System. The coast is still transmitting.',
    sceneArtworkAria: 'Coastal station camera with a lighthouse, transmitter, fog and interference',
    sceneVideoAria: 'Coastal camera with a rocky shoreline, rolling waves and signal interference',
    examineBottle: 'Inspect the message bottle',
    cameraBlocked: 'Signal lost. Camera 01 remains active.',
    anomalyMeter: 'Anomaly activity in the current camera',
    evidenceLog: 'FILE / 01',
    evidenceLogAria: 'Read the recovered message again',
    scanStatus: 'REMOTE OVERRIDE / SCANNING',
    scanDescription: 'The receiver is tuning itself without input.',
    transmissionStatus: 'VOICE SIGNAL DETECTED',
    transmissionDescription: 'An unidentified transmission was received on 96.4 MHz.',
    transmissionButton: 'AUDIO / 001',
    transmissionButtonAria: 'Inspect incoming voice transmission 001',
    transmissionMeta: 'NCBS / UNKNOWN RECEPTION',
    transmissionTitle: 'A VOICE IN THE STATIC.',
    transmissionFrequency: '96.4 MHz / RECORDING 001',
    transmissionTranscriptLabel: 'TRANSCRIPT / RECEIVED FRAGMENT',
    transmissionLine1: '…coast control here. Is anyone still at the station?',
    transmissionLine2: 'We found the last distress call. All that is missing is the reply.',
    transmissionLine3: 'Keep this frequency clear. We are trying to send the rest through.',
    transmissionFooter: 'SENDER UNVERIFIED · TRANSCRIPT RECONSTRUCTED',
    transmissionReceivedAnnouncement: 'New voice transmission received on 96.4 megahertz.',
    messageMeta: 'RECOVERED OBJECT / 001',
    messageSubtitle: 'RECOVERED / MESSAGE BOTTLE',
    messageTitle: 'ONE MINUTE IS MISSING.',
    messageBody1: 'The recording ends too soon. The tape kept running after the distress call.',
    messageBody2: 'I only heard the rest once. A code was written in the margin of the log: 91 / 3.',
    messageBody3: 'Perhaps it holds an answer to where they went.',
    messageFooter: 'NO DATE · NO SIGNATURE',
    stateDescriptions: {
      normal: 'An ordinary coastal feed. The beacon and weather remain stable.',
      interference: 'The transmission loses clarity. Fog and interference increase.',
      unknown: 'An unknown frequency interferes with the transmission. Its origin is unclear.',
      voice: 'An unidentified voice was recorded on this frequency.',
    },
  },
});

const root = document.documentElement;
const coastVideo = document.querySelector('#coast-video');
const stateDescription = document.querySelector('#state-description');
const languageToggle = document.querySelector('#language-toggle');
const pauseButton = document.querySelector('#pause-toggle');
const pauseLabel = document.querySelector('#pause-label');
const infoDialog = document.querySelector('#info-dialog');
const infoToggle = document.querySelector('#info-toggle');
const frequencyInput = document.querySelector('#frequency-tuning');
const receiverPanel = document.querySelector('#receiver-panel');
const receiverToggle = document.querySelector('#receiver-toggle');
const receiverClose = document.querySelector('#receiver-close');
const messageDialog = document.querySelector('#message-dialog');
const messageClose = document.querySelector('#message-close');
const bottleArtifact = document.querySelector('#bottle-artifact');
const evidenceLog = document.querySelector('#evidence-log');
const cameraBlackout = document.querySelector('#camera-blackout');
const cameraStatus = document.querySelector('#camera-status');
const anomalyMeter = document.querySelector('#anomaly-meter');
const anomalyBars = [...document.querySelectorAll('.readout-bars i')];
const transmissionToggle = document.querySelector('#transmission-toggle');
const transmissionDialog = document.querySelector('#transmission-dialog');
const transmissionClose = document.querySelector('#transmission-close');
const receiverEventStatus = document.querySelector('#receiver-event-status');
const compactViewport = window.matchMedia('(max-width: 750px), (max-height: 520px)');

/** Laufzeitzustand der Microsite ohne unnötige Persistenz. */
const scene = {
  channel: /** @type {SignalState | null} */ ('normal'),
  frequency: CHANNELS.normal.frequency,
  source: /** @type {SceneSource} */ ('artwork'),
  language: 'de',
  paused: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  cameraBlackoutTimerId: 0,
  anomaly: {
    activeMs: 0,
    displayedLevel: -1,
    appearanceAtMs: 0,
    morseStartedAtMs: 0,
    windowsStartedAtMs: 0,
    transmissionStartedAtMs: 0,
  },
  autoScan: {
    startedAtMs: 0,
  },
  story: {
    stage: /** @type {StoryStage} */ ('routine'),
    elapsedMs: 0,
    lastTick: 0,
    bottleVisible: false,
    bottleOpened: false,
    bottleCollected: false,
    bottleMaterializing: false,
    bottleMaterialized: false,
    clockTimeoutId: 0,
    revealTimeoutId: 0,
  },
};

/** Synchronisiert die übersetzten Texte ohne doppelte Markup-Strukturen. */
function updateTranslations() {
  const texts = TRANSLATIONS[scene.language];
  root.lang = scene.language;

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    if (typeof texts[key] === 'string') {
      element.textContent = texts[key];
    }
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(element => {
    const key = element.dataset.i18nAria;
    if (typeof texts[key] === 'string') {
      element.setAttribute('aria-label', texts[key]);
    }
  });

  infoToggle.setAttribute('aria-label', scene.language === 'de' ? 'Informationen und Rechtliches' : 'Information and legal notices');
  infoToggle.title = infoToggle.getAttribute('aria-label');
  stateDescription.textContent = getStateDescription(texts);
  languageToggle.textContent = scene.language === 'de' ? 'EN' : 'DE';
  languageToggle.setAttribute('aria-label', scene.language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln');
  document.querySelector('#top-nav').setAttribute('aria-label', texts.topNavAria);
  document.querySelector('#source-switch').setAttribute('aria-label', texts.sourceAria);

  bottleArtifact.setAttribute('aria-label', texts.examineBottle);
  evidenceLog.textContent = texts.evidenceLog;
  evidenceLog.setAttribute('aria-label', texts.evidenceLogAria);
  messageClose.setAttribute('aria-label', texts.close);
  anomalyMeter.setAttribute('aria-label', texts.anomalyMeter);
  transmissionToggle.textContent = texts.transmissionButton;
  transmissionToggle.setAttribute('aria-label', texts.transmissionButtonAria);
  transmissionClose.setAttribute('aria-label', texts.close);
  document.querySelector('#transmission-meta').textContent = texts.transmissionMeta;
  document.querySelector('#transmission-title').textContent = texts.transmissionTitle;
  document.querySelector('#transmission-frequency').textContent = texts.transmissionFrequency;
  document.querySelector('#transmission-transcript-label').textContent = texts.transmissionTranscriptLabel;
  document.querySelector('#transmission-line-1').textContent = texts.transmissionLine1;
  document.querySelector('#transmission-line-2').textContent = texts.transmissionLine2;
  document.querySelector('#transmission-line-3').textContent = texts.transmissionLine3;
  document.querySelector('#transmission-footer').textContent = texts.transmissionFooter;
  document.querySelector('#message-meta').textContent = texts.messageMeta;
  document.querySelector('#message-subtitle').textContent = texts.messageSubtitle;
  document.querySelector('#message-title').textContent = texts.messageTitle;
  document.querySelector('#message-body-1').textContent = texts.messageBody1;
  document.querySelector('#message-body-2').textContent = texts.messageBody2;
  document.querySelector('#message-body-3').textContent = texts.messageBody3;
  document.querySelector('#message-footer').textContent = texts.messageFooter;

  updateSourceDescription();
  updatePlaybackLabel();
  const label = scene.story.stage === 'frequency-scan' ? texts.scanStatus : (scene.channel ? CHANNELS[scene.channel].label : texts.offAir);
  frequencyInput.setAttribute('aria-valuetext', `${scene.frequency.toFixed(1)} MHz – ${label}`);
}

/** Liefert zum aktiven Story-Ereignis passende Empfangstexte. */
function getStateDescription(texts) {
  if (scene.story.stage === 'frequency-scan') return texts.scanDescription;
  if (scene.story.stage === 'transmission-ready' && scene.channel === 'voice') return texts.transmissionDescription;
  return scene.channel ? texts.stateDescriptions[scene.channel] : texts.offAirDescription;
}

/** Ordnet einer manuell gewählten Frequenz höchstens einen tatsächlichen Empfang zu. */
function findChannel(frequency) {
  return Object.keys(CHANNELS).find(channel =>
    Math.abs(CHANNELS[channel].frequency - frequency) <= TUNING_TOLERANCE
  ) ?? null;
}

/** Verhindert, dass spätere Story-Frequenzen vor ihrer Entdeckung verraten werden. */
function isChannelAvailable(channel) {
  if (channel === 'interference') return scene.story.stage !== 'routine';
  if (channel === 'unknown') return ['morse-active', 'windows-event', 'frequency-scan', 'transmission-ready'].includes(scene.story.stage);
  if (channel === 'voice') return scene.story.stage === 'transmission-ready';
  return true;
}

/** Nur freigeschaltete Story-Ereignisse dürfen die Kameraoptik verändern. */
function syncSignalVisuals() {
  const activeStage = scene.story.stage;
  root.dataset.story = activeStage;
  root.dataset.state = activeStage === 'frequency-scan'
    ? 'unknown'
    : (['morse-active', 'windows-event'].includes(activeStage)
      ? (scene.channel ?? 'normal')
      : (activeStage === 'transmission-ready' && scene.channel === 'voice' ? 'interference' : 'normal'));
}

/** Glättet einen Wert zwischen 0 und 1, ohne abrupte Intensitätssprünge. */
function smoothStep(value) {
  const progress = Math.max(0, Math.min(1, value));
  return progress * progress * (3 - 2 * progress);
}

/** Reagiert ausschließlich auf Präsenz im aktuell sichtbaren Kamerabild.
 * Die erreichte Story-Stufe ist nur Voraussetzung für bestimmte Ereignisse,
 * niemals eine dauerhaft erhöhte Anzeige des Spielfortschritts. */
function getAnomalyProfile() {
  const { stage, elapsedMs, bottleVisible, bottleCollected } = scene.story;

  if (scene.source === 'video') {
    if (!bottleVisible) {
      const approach = smoothStep(elapsedMs / BOTTLE_APPEAR_AFTER_MS);
      return {
        level: 0.04 + approach * 0.55,
        amplitude: 0.015 + approach * 0.1,
        speed: 0.4 + approach * 1.4,
      };
    }

    if (!bottleCollected) {
      const ageMs = Math.max(0, scene.anomaly.activeMs - scene.anomaly.appearanceAtMs);
      const apparition = Math.exp(-ageMs / 3200);
      return {
        level: 0.19 + 0.65 * apparition,
        amplitude: 0.04 + 0.13 * apparition,
        speed: 0.75 + apparition * 2.25,
      };
    }

    return { level: 0, amplitude: 0, speed: 0 };
  }

  if (stage === 'morse-active' && scene.channel === 'interference') {
    const time = (scene.anomaly.activeMs - scene.anomaly.morseStartedAtMs) / 1000;
    const pulse = (1 + Math.sin(time * 2.8)) / 2;
    return { level: 0.47 + pulse * 0.26, amplitude: 0.15, speed: 2.4 };
  }

  if (stage === 'frequency-scan') {
    const phase = (scene.anomaly.activeMs - scene.autoScan.startedAtMs) / 1000;
    return { level: 0.66 + (Math.sin(phase * 6) + 1) * .13, amplitude: .12, speed: 3.4 };
  }

  if (stage === 'transmission-ready' && scene.channel === 'voice') {
    const ageMs = Math.max(0, scene.anomaly.activeMs - scene.anomaly.transmissionStartedAtMs);
    const burst = Math.exp(-ageMs / 4500);
    return { level: .2 + .62 * burst, amplitude: .045 + .1 * burst, speed: 1.2 + 1.8 * burst };
  }

  if (stage === 'windows-event') {
    const ageMs = Math.max(0, scene.anomaly.activeMs - scene.anomaly.windowsStartedAtMs);
    const burst = Math.exp(-ageMs / 5500);
    return {
      level: 0.37 + 0.53 * burst,
      amplitude: 0.09 + 0.11 * burst,
      speed: 1.75 + burst * 1.1,
    };
  }

  return { level: 0, amplitude: 0, speed: 0 };
}

/** Zeichnet die Monitorbalken als ruhige oder leicht fluktuierende Anomalieanzeige.
 * Keine Zufallswerte und keine frei laufende CSS-Animation: Pause und verdeckte Tabs
 * halten dadurch sowohl Story-Zeit als auch den visuellen Zustand an. */
function updateAnomalyMeter() {
  const { level, amplitude, speed } = getAnomalyProfile();
  const time = scene.anomaly.activeMs / 1000;
  const isIdle = level === 0;

  anomalyBars.forEach((bar, index) => {
    const weight = 0.38 + ((index * 7) % 11) / 18;
    const wave = Math.sin(time * speed + index * 0.79) * 0.72
      + Math.sin(time * speed * 0.47 + index * 1.83) * 0.28;
    const activity = Math.max(0, level * weight + amplitude * wave);
    const height = isIdle ? 7 + ((index * 3) % 5) : Math.min(96, 8 + activity * 88);
    bar.style.height = `${height.toFixed(1)}%`;
  });

  const percent = Math.round(level * 100);
  if (scene.anomaly.displayedLevel !== percent) {
    anomalyMeter.setAttribute('aria-valuenow', String(percent));
    root.dataset.anomaly = level >= 0.7 ? 'high' : (level >= 0.28 ? 'active' : 'quiet');
    scene.anomaly.displayedLevel = percent;
  }
}

/** Fortschritt wird durch das gesicherte Fundstück, Kamera und korrekt abgestimmte
 * Frequenz ausgelöst. Die Übergänge sind einmalig und erzwingen keinen Kamerawechsel. */
function progressStory() {
  const previous = scene.story.stage;
  if (previous === 'message-found' && scene.source === 'artwork' && scene.channel === 'interference') {
    scene.story.stage = 'morse-active';
  } else if (previous === 'morse-active' && scene.source === 'artwork' && scene.channel === 'unknown') {
    scene.story.stage = 'windows-event';
  }
  if (previous !== scene.story.stage) {
    if (scene.story.stage === 'morse-active') {
      scene.anomaly.morseStartedAtMs = scene.anomaly.activeMs;
    } else if (scene.story.stage === 'windows-event') {
      scene.anomaly.windowsStartedAtMs = scene.anomaly.activeMs;
    }
  }
  syncSignalVisuals();
  updateAnomalyMeter();
  if (previous !== scene.story.stage) {
    window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
  }
}

/** Leitet die sichtbare Störung ausschließlich aus dem Empfangszustand ab. */
function applyInterference(amount) {
  const strength = Math.max(0, Math.min(100, amount));
  root.style.setProperty('--noise-opacity', String(strength / 260));
  root.style.setProperty('--flicker-opacity', String(strength / 180));
}

/** Aktualisiert Empfänger, Bild und Telemetrie bei jeder Frequenzänderung. */
function setFrequency(value, { automated = false } = {}) {
  if (scene.story.stage === 'frequency-scan' && !automated) return;

  const frequency = Math.round(Math.max(FM_MIN, Math.min(FM_MAX, Number(value))) * 10) / 10;
  if (!Number.isFinite(frequency)) return;

  const detectedChannel = (automated && scene.story.stage === 'frequency-scan') ? null : findChannel(frequency);
  const channel = isChannelAvailable(detectedChannel) ? detectedChannel : null;
  const previousChannel = scene.channel;
  const config = channel ? CHANNELS[channel] : null;
  const texts = TRANSLATIONS[scene.language];
  scene.frequency = frequency;
  scene.channel = channel;
  frequencyInput.value = frequency.toFixed(1);
  frequencyInput.style.setProperty('--range-progress', `${(frequency - FM_MIN) / (FM_MAX - FM_MIN) * 100}%`);
  const displayStatus = scene.story.stage === 'frequency-scan'
    ? texts.scanStatus
    : (scene.story.stage === 'transmission-ready' && channel === 'voice' ? texts.transmissionStatus : (config?.label ?? texts.offAir));
  frequencyInput.setAttribute('aria-valuetext', `${frequency.toFixed(1)} MHz – ${displayStatus}`);

  const display = frequency.toFixed(1);
  document.querySelector('#frequency-output').textContent = display;
  document.querySelector('#frequency-unit').textContent = 'MHz';
  document.querySelector('#status-output').textContent = displayStatus;
  document.querySelector('#scene-state').textContent = `${channel?.toUpperCase() ?? 'OFF AIR'} / ${display} MHz`;
  document.querySelector('#screen-frequency').textContent = `${display} MHz`;
  document.querySelector('#screen-channel').textContent = `NCBS / CH-${config?.channel ?? '--'}`;
  document.querySelector('#readout-channel').textContent = `CH–${config?.channel ?? '--'}`;
  document.querySelector('#rx-output').textContent = `${config?.reception ?? 0}%`;
  stateDescription.textContent = getStateDescription(texts);
  if (automated) {
    syncSignalVisuals();
  } else {
    progressStory();
  }
  applyInterference(scene.story.stage === 'frequency-scan'
    ? 75
    : (['routine', 'message-found'].includes(scene.story.stage) ? 0 : (config?.interference ?? 15)));
  if (automated) return;

  const detail = { frequency, channel, reception: config?.reception ?? 0, interference: config?.interference ?? 91 };
  window.dispatchEvent(new CustomEvent('deadair:frequencychange', { detail }));
  if (channel && channel !== previousChannel) {
    window.dispatchEvent(new CustomEvent('deadair:signalacquired', { detail }));
  }
}

/** Startet die selbstständige Frequenzsuche nach dem ersten Fensterereignis.
 * Drei Richtungswechsel simulieren einen fremden Zugriff auf die Funkkonsole. */
function startAutoScan() {
  if (scene.story.stage !== 'windows-event' || scene.source !== 'artwork' || scene.channel !== 'unknown') return;

  scene.story.stage = 'frequency-scan';
  scene.autoScan.startedAtMs = scene.anomaly.activeMs;
  frequencyInput.disabled = true;
  root.dataset.autoscan = 'active';
  setFrequency(CHANNELS.unknown.frequency, { automated: true });
  updateAnomalyMeter();
  window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
  window.dispatchEvent(new CustomEvent('deadair:autoscanstarted', {
    detail: { from: CHANNELS.unknown.frequency, target: CHANNELS.voice.frequency },
  }));
}

/** Interpoliert die Frequenz zwischen den vorgegebenen Wendepunkten. */
function getAutoScanFrequency(progress) {
  for (let index = 1; index < AUTO_SCAN_POINTS.length; index += 1) {
    const previous = AUTO_SCAN_POINTS[index - 1];
    const next = AUTO_SCAN_POINTS[index];
    if (progress > next.time) continue;

    const local = smoothStep((progress - previous.time) / (next.time - previous.time));
    return previous.frequency + (next.frequency - previous.frequency) * local;
  }

  return CHANNELS.voice.frequency;
}

/** Beendet die Frequenzübernahme und legt die erste Übertragung zum Abruf bereit. */
function finishAutoScan() {
  if (scene.story.stage !== 'frequency-scan') return;

  scene.story.stage = 'transmission-ready';
  scene.anomaly.transmissionStartedAtMs = scene.anomaly.activeMs;
  frequencyInput.disabled = false;
  root.dataset.autoscan = 'received';
  setFrequency(CHANNELS.voice.frequency, { automated: true });
  transmissionToggle.hidden = false;
  receiverEventStatus.textContent = TRANSLATIONS[scene.language].transmissionReceivedAnnouncement;
  updateAnomalyMeter();

  window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
  window.dispatchEvent(new CustomEvent('deadair:transmissionreceived', {
    detail: { frequency: CHANNELS.voice.frequency, recording: '001' },
  }));
}

/** Bewegt den Regler ausschließlich während aktiver Spielzeit. */
function updateAutoScan() {
  if (scene.story.stage !== 'frequency-scan') return;
  const elapsed = scene.anomaly.activeMs - scene.autoScan.startedAtMs;
  const progress = Math.max(0, Math.min(1, elapsed / AUTO_SCAN_DURATION_MS));

  if (progress >= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishAutoScan();
    return;
  }

  setFrequency(getAutoScanFrequency(progress), { automated: true });
}

/** Öffnet das empfangene Transkript; Audio bleibt bis zur echten Aufnahme deaktiviert. */
function openTransmission() {
  setReceiverOpen(false);
  if (!transmissionDialog.open) transmissionDialog.showModal();
}

/** Lädt das reale Video erst bei Auswahl der Kameraquelle. */
async function syncVideo() {
  const shouldPlay = scene.source === 'video' && !scene.paused && !document.hidden;
  if (!shouldPlay) {
    coastVideo.pause();
    return;
  }

  try {
    await coastVideo.play();
  } catch {
    // Autoplay kann durch Browserrichtlinien unterbunden sein; der Poster-Fallback bleibt sichtbar.
  }
}

/** Kennzeichnet Bildquelle und Inhalt für Sehende und Assistenztechnologien. */
function updateSourceDescription() {
  const texts = TRANSLATIONS[scene.language];
  document.querySelector('#scene').setAttribute('aria-label', texts[scene.source === 'artwork' ? 'sceneArtworkAria' : 'sceneVideoAria']);
}

/** Übernimmt die Quellenumschaltung ohne sichtbaren Übergang. */
function applySource(source) {
  scene.source = source;
  root.dataset.source = source;
  document.querySelectorAll('#source-switch button[data-source]').forEach(button => {
    const active = button.dataset.source === source;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#screen-location').textContent = source === 'artwork' ? 'NORTH COAST / STATION' : 'NORTH COAST / SHORE';
  updateSourceDescription();
  progressStory();
  maybeStartBottleReveal();
  void syncVideo();
}

/** Zeigt bei unterbrochenem CAM-02-Signal kurz ein vollständig schwarzes Bild.
 * Die tatsächliche Bildquelle wird bewusst nicht geändert, damit keine
 * Video-/Artefaktreste entstehen und der Morsecode aktiv bleibt. */
function showBlockedCamera() {
  if (cameraBlackout.classList.contains('is-active')) return;

  cameraStatus.textContent = TRANSLATIONS[scene.language].cameraBlocked;
  cameraBlackout.classList.add('is-active');
  window.clearTimeout(scene.cameraBlackoutTimerId);
  scene.cameraBlackoutTimerId = window.setTimeout(() => {
    cameraBlackout.classList.remove('is-active');
    scene.cameraBlackoutTimerId = 0;
  }, CAMERA_BLACKOUT_MS);
}

/** Wechselt nur dann die Kamera, wenn die Story das Signal freigibt.
 * Während des aktiven Morsecodes auf 91.3 MHz wird CAM 02 abgefangen. */
function setSource(source) {
  if (source !== 'artwork' && source !== 'video') return;

  const morseLocksCamera = scene.story.stage === 'morse-active'
    && scene.channel === 'interference'
    && scene.source === 'artwork';

  if (source === 'video' && (morseLocksCamera || scene.story.stage === 'frequency-scan')) {
    showBlockedCamera();
    return;
  }

  if (source === scene.source && root.dataset.source === source) return;
  cameraStatus.textContent = '';
  applySource(source);
}

/** Spiegelt den Wiedergabezustand im Button und für Assistenztechnologien. */
function updatePlaybackLabel() {
  pauseButton.setAttribute('aria-pressed', String(scene.paused));
  pauseLabel.textContent = TRANSLATIONS[scene.language][scene.paused ? 'resume' : 'pause'];
  document.querySelector('#pause-icon').textContent = scene.paused ? '▶' : 'Ⅱ';
  root.dataset.paused = String(scene.paused);
}

/** Stoppt beziehungsweise aktiviert die visuellen Bewegungen und das Video. */
function togglePause() {
  scene.paused = !scene.paused;
  scene.story.lastTick = performance.now();
  updatePlaybackLabel();
  updateAnomalyMeter();
  void syncVideo();
}

/** Öffnet die kompakten Empfangsregler als fokusführende Vollbild-Bedienfläche. */
function setReceiverOpen(open) {
  const isCompact = compactViewport.matches;
  const shouldOpen = isCompact && open;
  receiverPanel.classList.toggle('is-open', shouldOpen);
  receiverToggle.setAttribute('aria-expanded', String(shouldOpen));
  receiverPanel.toggleAttribute('inert', isCompact && !shouldOpen);

  if (shouldOpen) {
    receiverPanel.setAttribute('role', 'dialog');
    receiverPanel.setAttribute('aria-modal', 'true');
    receiverClose.focus();
  } else {
    receiverPanel.removeAttribute('role');
    receiverPanel.removeAttribute('aria-modal');
    if (open === false && isCompact && document.activeElement && receiverPanel.contains(document.activeElement)) {
      receiverToggle.focus();
    }
  }
}

/** Spiegelt den Fundzustand im DOM, ohne die Kameraquelle umzuschalten. */
function syncStoryState() {
  root.dataset.bottle = !scene.story.bottleVisible
    ? 'hidden'
    : (scene.story.bottleCollected ? 'collected' :
      (scene.story.bottleMaterializing ? 'materializing' :
        (scene.story.bottleOpened ? 'opened' : (scene.story.bottleMaterialized ? 'visible' : 'waiting'))));
}

/** Spielt den kurzen dimensionalen Reveal erst ab, wenn CAM 02 tatsächlich sichtbar ist. */
function maybeStartBottleReveal() {
  if (!scene.story.bottleVisible || scene.story.bottleCollected || scene.story.bottleMaterialized || scene.story.bottleMaterializing || scene.source !== 'video') return;

  scene.story.bottleMaterializing = true;
  bottleArtifact.classList.add('is-materializing');
  syncStoryState();

  window.clearTimeout(scene.story.revealTimeoutId);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scene.story.revealTimeoutId = window.setTimeout(() => {
    scene.story.bottleMaterializing = false;
    scene.story.bottleMaterialized = true;
    bottleArtifact.classList.remove('is-materializing');
    syncStoryState();
  }, reduceMotion ? 0 : BOTTLE_GLITCH_MS);
}

/** Schaltet die Flaschenpost nach 15 Sekunden aktiver Laufzeit für CAM 02 frei. */
function revealBottle() {
  if (scene.story.bottleVisible) return;

  scene.story.bottleVisible = true;
  scene.anomaly.appearanceAtMs = scene.anomaly.activeMs;
  bottleArtifact.hidden = false;
  syncStoryState();
  maybeStartBottleReveal();

  window.dispatchEvent(new CustomEvent('deadair:bottleappeared', {
    detail: { elapsedMs: scene.story.elapsedMs },
  }));
}

/** Öffnet die Fundnotiz; bereits gesicherte Hinweise bleiben über die Akte lesbar. */
function openBottleMessage() {
  if (!scene.story.bottleVisible || messageDialog.open) return;

  if (scene.story.bottleMaterializing) {
    window.clearTimeout(scene.story.revealTimeoutId);
    scene.story.bottleMaterializing = false;
    scene.story.bottleMaterialized = true;
    bottleArtifact.classList.remove('is-materializing');
    syncStoryState();
  }

  const firstRead = !scene.story.bottleOpened;
  scene.story.bottleOpened = true;
  setReceiverOpen(false);
  messageDialog.showModal();

  if (firstRead) {
    window.dispatchEvent(new CustomEvent('deadair:bottleopened', {
      detail: { channel: scene.channel, source: scene.source, frequency: scene.frequency },
    }));
  }
}

/** Der Hinweis wird erst nach dem Schließen des Dialogs als aufgenommen markiert.
 * Dadurch bleibt der Fund beim Lesen im Dialog, verschwindet aber danach
 * vollständig aus CAM 02; über AKTE / 01 ist der Text weiterhin abrufbar. */
function collectBottle() {
  if (!scene.story.bottleOpened || scene.story.bottleCollected) return;

  scene.story.bottleCollected = true;
  scene.story.bottleMaterializing = false;
  scene.story.bottleMaterialized = true;
  window.clearTimeout(scene.story.revealTimeoutId);
  bottleArtifact.classList.remove('is-materializing');
  bottleArtifact.hidden = true;
  evidenceLog.hidden = false;
  syncStoryState();

  if (scene.story.stage === 'routine') {
    scene.story.stage = 'message-found';
    window.dispatchEvent(new CustomEvent('deadair:storychanged', {
      detail: { stage: scene.story.stage },
    }));
  }

  setFrequency(scene.frequency);
  evidenceLog.focus();
  window.dispatchEvent(new CustomEvent('deadair:bottlecollected', {
    detail: { stage: scene.story.stage },
  }));
}

/** Taktet die Story-Uhr und die sichtbare Anomalie sparsam mit 200 ms.
 * Jede Kamera zeigt nur ihre gegenwärtige Aktivität und keine Fortschrittsstufe. */
function runStoryClock() {
  const now = performance.now();
  if (scene.story.lastTick && !scene.paused && !document.hidden && !messageDialog.open && !infoDialog.open && !transmissionDialog.open) {
    const deltaMs = Math.max(0, now - scene.story.lastTick);
    scene.anomaly.activeMs += deltaMs;
    if (!scene.story.bottleVisible) {
      scene.story.elapsedMs += deltaMs;
    }
  }
  scene.story.lastTick = now;

  if (!scene.story.bottleVisible && scene.story.elapsedMs >= BOTTLE_APPEAR_AFTER_MS) {
    revealBottle();
  }

  if (!scene.paused && !document.hidden && !messageDialog.open && !infoDialog.open && !transmissionDialog.open) {
    if (scene.story.stage === 'windows-event'
      && scene.source === 'artwork'
      && scene.channel === 'unknown'
      && scene.anomaly.activeMs - scene.anomaly.windowsStartedAtMs >= WINDOWS_TO_SCAN_MS) {
      startAutoScan();
    }
    updateAutoScan();
  }

  updateAnomalyMeter();
  scene.story.clockTimeoutId = window.setTimeout(runStoryClock, 200);
}

/** Hält den Tastaturfokus innerhalb des mobilen Empfangspanels. */
function handleReceiverKeyboard(event) {
  if (!compactViewport.matches || !receiverPanel.classList.contains('is-open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    setReceiverOpen(false);
  }
  if (event.key !== 'Tab') return;

  const controls = [...receiverPanel.querySelectorAll('button:not(:disabled), input:not(:disabled)')];
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/** Bindet schlanke native Controls ohne Fremdbibliotheken. */
function init() {
  root.dataset.bottle = 'hidden';
  root.dataset.story = 'routine';
  root.dataset.autoscan = 'idle';

  frequencyInput.addEventListener('input', () => setFrequency(frequencyInput.value));
  document.querySelectorAll('#source-switch button[data-source]').forEach(button => {
    button.addEventListener('click', () => setSource(button.dataset.source));
  });
  languageToggle.addEventListener('click', () => {
    scene.language = scene.language === 'de' ? 'en' : 'de';
    updateTranslations();
  });
  pauseButton.addEventListener('click', togglePause);
  receiverToggle.addEventListener('click', () => setReceiverOpen(true));
  receiverClose.addEventListener('click', () => setReceiverOpen(false));
  receiverPanel.addEventListener('keydown', handleReceiverKeyboard);
  compactViewport.addEventListener('change', () => setReceiverOpen(false));
  infoToggle.addEventListener('click', () => {
    setReceiverOpen(false);
    infoDialog.showModal();
  });
  document.querySelector('#info-close').addEventListener('click', () => infoDialog.close());
  infoDialog.addEventListener('click', event => {
    if (event.target === infoDialog) infoDialog.close();
  });

  bottleArtifact.addEventListener('click', openBottleMessage);
  evidenceLog.addEventListener('click', openBottleMessage);
  messageClose.addEventListener('click', () => messageDialog.close());
  messageDialog.addEventListener('close', collectBottle);
  transmissionToggle.addEventListener('click', openTransmission);
  transmissionClose.addEventListener('click', () => transmissionDialog.close());
  transmissionDialog.addEventListener('click', event => {
    if (event.target === transmissionDialog) transmissionDialog.close();
  });
  messageDialog.addEventListener('click', event => {
    if (event.target === messageDialog) messageDialog.close();
  });

  document.addEventListener('visibilitychange', () => {
    scene.story.lastTick = performance.now();
    void syncVideo();
  });
  window.addEventListener('pagehide', () => {
    coastVideo.pause();
    window.clearTimeout(scene.story.clockTimeoutId);
    window.clearTimeout(scene.story.revealTimeoutId);
    window.clearTimeout(scene.cameraBlackoutTimerId);
  });

  setFrequency(scene.frequency);
  applySource(scene.source);
  updateTranslations();
  updatePlaybackLabel();
  setReceiverOpen(false);
  syncStoryState();
  updateAnomalyMeter();
  runStoryClock();
}

init();
