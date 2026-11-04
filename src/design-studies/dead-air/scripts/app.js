/**
 * @file Interaktive Rundfunkkonsole für DEAD//AIR.
 * @description Steuert die fotografische Szene, den analogen FM-Frequenzregler,
 * Kamera, Wiedergabe, Licht und ereignisgesteuerte Story-Artefakte.
 * @author Benjamin Bennewitz
 */

/** @typedef {'normal' | 'interference' | 'unknown'} SignalState */
/** @typedef {'artwork' | 'video'} SceneSource */
/** @typedef {'routine' | 'message-found' | 'morse-active' | 'windows-event'} StoryStage */

/** Fest definierte Frequenzen und ihre Bildstörung. */
const CHANNELS = Object.freeze({
  normal: { frequency: 87.6, channel: '01', reception: 76, interference: 15, label: 'STABLE FEED' },
  interference: { frequency: 91.3, channel: '02', reception: 38, interference: 60, label: 'SIGNAL DRIFT' },
  unknown: { frequency: 103.7, channel: '03', reception: 8, interference: 91, label: 'SOURCE UNKNOWN' },
});

const FM_MIN = 87.5;
const FM_MAX = 108;
const TUNING_TOLERANCE = 0.35;
const BOTTLE_APPEAR_AFTER_MS = 15_000;
const BOTTLE_GLITCH_MS = 2_000;

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
const compactViewport = window.matchMedia('(max-width: 750px), (max-height: 520px)');

/** Laufzeitzustand der Microsite ohne unnötige Persistenz. */
const scene = {
  channel: /** @type {SignalState | null} */ ('normal'),
  frequency: CHANNELS.normal.frequency,
  source: /** @type {SceneSource} */ ('artwork'),
  language: 'de',
  paused: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  story: {
    stage: /** @type {StoryStage} */ ('routine'),
    elapsedMs: 0,
    lastTick: 0,
    bottleVisible: false,
    bottleOpened: false,
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
  stateDescription.textContent = scene.channel ? texts.stateDescriptions[scene.channel] : texts.offAirDescription;
  languageToggle.textContent = scene.language === 'de' ? 'EN' : 'DE';
  languageToggle.setAttribute('aria-label', scene.language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln');
  document.querySelector('#top-nav').setAttribute('aria-label', texts.topNavAria);
  document.querySelector('#source-switch').setAttribute('aria-label', texts.sourceAria);

  bottleArtifact.setAttribute('aria-label', texts.examineBottle);
  messageClose.setAttribute('aria-label', texts.close);
  document.querySelector('#message-meta').textContent = texts.messageMeta;
  document.querySelector('#message-subtitle').textContent = texts.messageSubtitle;
  document.querySelector('#message-title').textContent = texts.messageTitle;
  document.querySelector('#message-body-1').textContent = texts.messageBody1;
  document.querySelector('#message-body-2').textContent = texts.messageBody2;
  document.querySelector('#message-body-3').textContent = texts.messageBody3;
  document.querySelector('#message-footer').textContent = texts.messageFooter;

  updateSourceDescription();
  updatePlaybackLabel();
  const label = scene.channel ? CHANNELS[scene.channel].label : texts.offAir;
  frequencyInput.setAttribute('aria-valuetext', `${scene.frequency.toFixed(1)} MHz – ${label}`);
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
  if (channel === 'unknown') return scene.story.stage === 'morse-active' || scene.story.stage === 'windows-event';
  return true;
}

/** Nur freigeschaltete Story-Ereignisse dürfen die Kameraoptik verändern. */
function syncSignalVisuals() {
  const activeStage = scene.story.stage;
  root.dataset.story = activeStage;
  root.dataset.state = (activeStage === 'morse-active' || activeStage === 'windows-event')
    ? (scene.channel ?? 'normal')
    : 'normal';
}

/** Fortschritt wird durch Fundstück, Kamera und korrekt abgestimmte Frequenz ausgelöst. */
function progressStory() {
  const previous = scene.story.stage;
  if (previous === 'message-found' && scene.source === 'artwork' && scene.channel === 'interference') {
    scene.story.stage = 'morse-active';
  } else if (previous === 'morse-active' && scene.source === 'artwork' && scene.channel === 'unknown') {
    scene.story.stage = 'windows-event';
  }
  syncSignalVisuals();
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
function setFrequency(value) {
  const frequency = Math.round(Math.max(FM_MIN, Math.min(FM_MAX, Number(value))) * 10) / 10;
  if (!Number.isFinite(frequency)) return;

  const detectedChannel = findChannel(frequency);
  const channel = isChannelAvailable(detectedChannel) ? detectedChannel : null;
  const previousChannel = scene.channel;
  const config = channel ? CHANNELS[channel] : null;
  const texts = TRANSLATIONS[scene.language];
  scene.frequency = frequency;
  scene.channel = channel;
  frequencyInput.value = frequency.toFixed(1);
  frequencyInput.style.setProperty('--range-progress', `${(frequency - FM_MIN) / (FM_MAX - FM_MIN) * 100}%`);
  frequencyInput.setAttribute('aria-valuetext', `${frequency.toFixed(1)} MHz – ${config?.label ?? texts.offAir}`);

  const display = frequency.toFixed(1);
  document.querySelector('#frequency-output').textContent = display;
  document.querySelector('#frequency-unit').textContent = 'MHz';
  document.querySelector('#status-output').textContent = config?.label ?? texts.offAir;
  document.querySelector('#scene-state').textContent = `${channel?.toUpperCase() ?? 'OFF AIR'} / ${display} MHz`;
  document.querySelector('#screen-frequency').textContent = `${display} MHz`;
  document.querySelector('#screen-channel').textContent = `NCBS / CH-${config?.channel ?? '--'}`;
  document.querySelector('#readout-channel').textContent = `CH–${config?.channel ?? '--'}`;
  document.querySelector('#rx-output').textContent = `${config?.reception ?? 0}%`;
  stateDescription.textContent = channel ? texts.stateDescriptions[channel] : texts.offAirDescription;
  progressStory();
  applyInterference(['routine', 'message-found'].includes(scene.story.stage) ? 0 : (config?.interference ?? 15));

  const detail = { frequency, channel, reception: config?.reception ?? 0, interference: config?.interference ?? 91 };
  window.dispatchEvent(new CustomEvent('deadair:frequencychange', { detail }));
  if (channel && channel !== previousChannel) {
    window.dispatchEvent(new CustomEvent('deadair:signalacquired', { detail }));
  }
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

/** Wechselt zwischen Stationskamera und bewegtem Küstenfeed. */
function setSource(source) {
  if (source !== 'artwork' && source !== 'video') return;

  scene.source = source;
  root.dataset.source = source;
  document.querySelectorAll('[data-source]').forEach(button => {
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
    : (scene.story.bottleMaterializing ? 'materializing' :
      (scene.story.bottleOpened ? 'opened' : (scene.story.bottleMaterialized ? 'visible' : 'waiting')));
}

/** Spielt den kurzen dimensionalen Reveal erst ab, wenn CAM 02 tatsächlich sichtbar ist. */
function maybeStartBottleReveal() {
  if (!scene.story.bottleVisible || scene.story.bottleMaterialized || scene.story.bottleMaterializing || scene.source !== 'video') return;

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
  bottleArtifact.hidden = false;
  syncStoryState();
  maybeStartBottleReveal();

  window.dispatchEvent(new CustomEvent('deadair:bottleappeared', {
    detail: { elapsedMs: scene.story.elapsedMs },
  }));
}

/** Öffnet die gefundene Flaschenpost und erschließt die erste Story-Frequenz. */
function openBottleMessage() {
  if (!scene.story.bottleVisible) return;

  if (scene.story.bottleMaterializing) {
    window.clearTimeout(scene.story.revealTimeoutId);
    scene.story.bottleMaterializing = false;
    scene.story.bottleMaterialized = true;
    bottleArtifact.classList.remove('is-materializing');
    syncStoryState();
  }

  if (!scene.story.bottleOpened) {
    scene.story.bottleOpened = true;
    if (scene.story.stage === 'routine') {
      scene.story.stage = 'message-found';
      window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
    }
    setFrequency(scene.frequency);
  }
  syncStoryState();
  setReceiverOpen(false);
  messageDialog.showModal();
  window.dispatchEvent(new CustomEvent('deadair:bottleopened', {
    detail: { channel: scene.channel, source: scene.source, frequency: scene.frequency },
  }));
}

/** Wartet ressourcenschonend auf 15 Sekunden aktive Untersuchungszeit. */
function runStoryClock() {
  const now = performance.now();
  if (scene.story.lastTick && !scene.paused && !document.hidden) {
    scene.story.elapsedMs += now - scene.story.lastTick;
  }
  scene.story.lastTick = now;

  if (scene.story.elapsedMs >= BOTTLE_APPEAR_AFTER_MS) {
    revealBottle();
    return;
  }

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

  frequencyInput.addEventListener('input', () => setFrequency(frequencyInput.value));
  document.querySelectorAll('[data-source]').forEach(button => {
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
  messageClose.addEventListener('click', () => messageDialog.close());
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
  });

  setFrequency(scene.frequency);
  setSource(scene.source);
  updateTranslations();
  updatePlaybackLabel();
  setReceiverOpen(false);
  syncStoryState();
  runStoryClock();
}

init();
