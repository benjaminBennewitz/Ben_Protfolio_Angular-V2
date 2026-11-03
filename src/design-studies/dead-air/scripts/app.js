/**
 * @file Interaktive Rundfunkkonsole für DEAD//AIR.
 * @description Steuert die fotografische Szene, drei Empfangsfrequenzen, Bildquelle,
 * Signalintensität, Wiedergabe, Sprachwechsel und den Informationsdialog.
 * @author Benjamin Bennewitz
 */

/** @typedef {'normal' | 'interference' | 'unknown'} SignalState */
/** @typedef {'artwork' | 'video'} SceneSource */

/** Empfangbare Kanäle als zentrale Datenquelle statt verteilter Sonderfälle. */
const CHANNELS = Object.freeze({
  normal: { frequency: '87.6', unit: 'MHz', reception: 76, label: 'STABLE FEED' },
  interference: { frequency: '91.3', unit: 'MHz', reception: 38, label: 'SIGNAL DRIFT' },
  unknown: { frequency: '???.?', unit: 'MHz', reception: 8, label: 'SOURCE UNKNOWN' },
});

/** Sämtliche sichtbaren UI- und Status-Texte der Microsite. */
const TRANSLATIONS = Object.freeze({
  de: {
    skip: 'Zum Empfangsbereich springen', back: 'ZURÜCK ZUM ARCHIV',
    eyebrow: 'NCBS / EMPFANGSSTATION 01',
    intro: 'Eine verlassene Küstenstation. Drei Signale. Eine Übertragung, die nicht existieren dürfte.',
    channels: 'GESPEICHERTE FREQUENZEN', normal: 'NORMAL', signal: 'STÖRINTENSITÄT',
    clear: 'KLARES BILD', distortion: 'SIGNALVERLUST',
    transmitting: 'ÜBERTRAGUNG AKTIV', artwork: 'STATION / CAM 01', footage: 'KÜSTE / CAM 02',
    pause: 'PAUSE', resume: 'FORTSETZEN', sceneStatus: 'AKTUELLER SIGNALZUSTAND',
    imprint: 'Impressum', privacy: 'Datenschutz', credits: 'Video: Pexels ↗',
    sourceAria: 'Kamera wählen', topNavAria: 'Informationen, Sprache und Archiv',
    info: 'INFO', close: 'Schließen', receiverButton: 'EMPFANG', openReceiver: 'Empfangsregler öffnen', closeReceiver: 'SCHLIESSEN ×', legalNav: 'Rechtliches und Bildnachweise',
    infoDescription: 'North Coast Broadcasting System. Die Küste sendet noch immer.',
    sceneArtworkAria: 'Küstenkamera mit Leuchtturm, Sendestation, Nebel und Signalstörungen',
    sceneVideoAria: 'Küstenkamera mit felsigem Ufer, Brandung und Signalstörungen',
    stateDescriptions: {
      normal: 'Ein gewöhnlicher Küstenfeed. Leuchtfeuer und Wetter bleiben stabil.',
      interference: 'Die Übertragung verliert an Klarheit. Nebel und Störungen nehmen zu.',
      unknown: 'Eine fremde Frequenz greift in die Übertragung ein. Der Ursprung ist unbekannt.',
    },
  },
  en: {
    skip: 'Skip to receiver', back: 'BACK TO ARCHIVE',
    eyebrow: 'NCBS / RECEIVER STATION 01',
    intro: 'An abandoned coastal station. Three signals. A transmission that should not exist.',
    channels: 'PRESET FREQUENCIES', normal: 'NORMAL', signal: 'INTERFERENCE LEVEL',
    clear: 'CLEAR PICTURE', distortion: 'SIGNAL LOSS',
    transmitting: 'TRANSMISSION ACTIVE', artwork: 'STATION / CAM 01', footage: 'COAST / CAM 02',
    pause: 'PAUSE', resume: 'RESUME', sceneStatus: 'CURRENT SIGNAL STATE',
    imprint: 'Legal notice', privacy: 'Privacy', credits: 'Footage: Pexels ↗',
    sourceAria: 'Choose camera', topNavAria: 'Information, language and archive',
    info: 'INFO', close: 'Close', receiverButton: 'RECEIVER', openReceiver: 'Open receiver controls', closeReceiver: 'CLOSE ×', legalNav: 'Legal information and image credits',
    infoDescription: 'North Coast Broadcasting System. The coast is still transmitting.',
    sceneArtworkAria: 'Coastal station camera with a lighthouse, transmitter, fog and interference',
    sceneVideoAria: 'Coastal camera with a rocky shoreline, rolling waves and signal interference',
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
const infoDialog = document.querySelector('#info-dialog');
const infoToggle = document.querySelector('#info-toggle');
const pauseLabel = document.querySelector('#pause-label');
const signalInput = document.querySelector('#signal-strength');
const signalOutput = document.querySelector('#signal-strength-output');
const receiverPanel = document.querySelector('#receiver-panel');
const receiverToggle = document.querySelector('#receiver-toggle');
const receiverClose = document.querySelector('#receiver-close');
const compactViewport = window.matchMedia('(max-width: 750px), (max-height: 520px)');

/** Laufzeitzustand der Microsite ohne unnötige Persistenz. */
const scene = {
  channel: /** @type {SignalState} */ ('normal'),
  source: /** @type {SceneSource} */ ('artwork'),
  language: 'de',
  paused: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  strength: 24,
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
  document.querySelector('#state-description').textContent = texts.stateDescriptions[scene.channel];
  languageToggle.textContent = scene.language === 'de' ? 'EN' : 'DE';
  languageToggle.setAttribute('aria-label', scene.language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln');
  document.querySelector('#top-nav').setAttribute('aria-label', texts.topNavAria);
  document.querySelector('#source-switch').setAttribute('aria-label', texts.sourceAria);
  updateSourceDescription();
  updatePlaybackLabel();
}

/** Stellt den gewählten Empfangskanal und dessen Anzeige ein. */
function setChannel(channel) {
  if (!Object.hasOwn(CHANNELS, channel)) return;

  scene.channel = channel;
  const config = CHANNELS[channel];
  root.dataset.state = channel;
  document.querySelector('#frequency-output').textContent = config.frequency;
  document.querySelector('#frequency-unit').textContent = config.unit;
  document.querySelector('#status-output').textContent = config.label;
  document.querySelector('#scene-state').textContent = `${channel.toUpperCase()} / ${config.frequency} ${config.unit}`;
  document.querySelector('#screen-frequency').textContent = `${config.frequency} ${config.unit}`;
  document.querySelector('#rx-output').textContent = `${config.reception}%`;
  document.querySelectorAll('[data-channel]').forEach(button => {
    const active = button.dataset.channel === channel;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  stateDescription.textContent = TRANSLATIONS[scene.language].stateDescriptions[channel];
}

/** Verändert ausschließlich die Darstellung, nicht den Zustand der Geschichte. */
function setSignalStrength(value) {
  scene.strength = Math.max(0, Math.min(100, Number(value) || 0));
  signalOutput.value = `${scene.strength}%`;
  root.style.setProperty('--noise-opacity', String(scene.strength / 260));
  root.style.setProperty('--flicker-opacity', String(scene.strength / 180));
  signalInput.style.setProperty('--range-progress', `${scene.strength}%`);
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
  document.querySelectorAll('[data-channel]').forEach(button => {
    button.addEventListener('click', () => {
      setChannel(button.dataset.channel);
      if (compactViewport.matches) setReceiverOpen(false);
    });
  });
  document.querySelectorAll('[data-source]').forEach(button => {
    button.addEventListener('click', () => setSource(button.dataset.source));
  });
  signalInput.addEventListener('input', () => setSignalStrength(signalInput.value));
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
  document.addEventListener('visibilitychange', () => void syncVideo());
  window.addEventListener('pagehide', () => coastVideo.pause());

  setSignalStrength(signalInput.value);
  setChannel(scene.channel);
  setSource(scene.source);
  updateTranslations();
  setReceiverOpen(false);
}

init();
