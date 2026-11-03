/**
 * @file Einfacher Broadcast-Prototyp für DEAD//AIR.
 * @description Steuert die fotografische Szene, drei Testfrequenzen, Bildquelle,
 * Signalintensität, Wiedergabe und Sprachwechsel ohne externe Abhängigkeiten.
 * Die eigentliche Erzählung, Event-Engine und Asset-Komposition folgen später.
 * @author Benjamin Bennewitz
 */

/** @typedef {'normal' | 'interference' | 'unknown'} SignalState */
/** @typedef {'artwork' | 'video'} SceneSource */

/** Testkanäle als zentrale Datenquelle statt verteilter Sonderfälle. */
const CHANNELS = Object.freeze({
  normal: { frequency: '87.6', unit: 'MHz', reception: 76, label: 'STABLE FEED' },
  interference: { frequency: '91.3', unit: 'MHz', reception: 38, label: 'SIGNAL DRIFT' },
  unknown: { frequency: '???.?', unit: 'MHz', reception: 8, label: 'SOURCE UNKNOWN' },
});

/** Sämtliche sichtbaren UI- und Status-Texte der Microsite. */
const TRANSLATIONS = Object.freeze({
  de: {
    skip: 'Zum Empfangsbereich springen', back: 'ZURÜCK ZUM ARCHIV',
    eyebrow: 'SIGNAL LABORATORY / PROTOTYP 0.1',
    intro: 'Eine verlassene Küstenstation. Drei Signale. Eine Übertragung, die nicht existieren dürfte.',
    channels: 'TESTFREQUENZEN', normal: 'NORMAL', signal: 'STÖRINTENSITÄT',
    clear: 'KLARES BILD', distortion: 'SIGNALVERLUST',
    experimentLabel: 'GESTALTUNGSEXPERIMENT / DS–010',
    experiment: 'Fotografische Küstenlandschaft trifft auf analoge Broadcast-Ästhetik. Die Zustände sind vorläufige Szenentests, noch keine fertige Erzählung.',
    transmitting: 'ÜBERTRAGUNG AKTIV', artwork: 'SZENENENTWURF', footage: 'ORIGINALAUFNAHME',
    pause: 'PAUSE', resume: 'FORTSETZEN', sceneStatus: 'AKTUELLER SIGNALZUSTAND',
    prototype: 'INTERAKTIVER SZENENPROTOTYP — STORY UND EREIGNISSE FOLGEN IN DER NÄCHSTEN PHASE.',
    imprint: 'Impressum', privacy: 'Datenschutz', credits: 'Video: Pexels ↗',
    artworkCredit: 'KI-GENERIERT / SZENENENTWURF', footageCredit: 'REALAUFNAHME / PEXELS',
    sourceAria: 'Bildquelle wählen', topNavAria: 'Portfolio und Sprache',
    sceneArtworkAria: 'Fotografisch gestalteter Küstenentwurf mit Leuchtturm, Sendestation, Nebel und Signalstörungen',
    sceneVideoAria: 'Originalaufnahme einer felsigen Küste mit bewegtem Meer und Signalstörungen',
    stateDescriptions: {
      normal: 'Ein gewöhnlicher Küstenfeed. Leuchtfeuer und Wetter bleiben stabil.',
      interference: 'Die Übertragung verliert an Klarheit. Nebel und Störungen nehmen zu.',
      unknown: 'Eine fremde Frequenz greift in die Übertragung ein. Der Ursprung ist unbekannt.',
    },
  },
  en: {
    skip: 'Skip to receiver', back: 'BACK TO ARCHIVE',
    eyebrow: 'SIGNAL LABORATORY / PROTOTYPE 0.1',
    intro: 'An abandoned coastal station. Three signals. A transmission that should not exist.',
    channels: 'TEST FREQUENCIES', normal: 'NORMAL', signal: 'INTERFERENCE LEVEL',
    clear: 'CLEAR PICTURE', distortion: 'SIGNAL LOSS',
    experimentLabel: 'DESIGN EXPERIMENT / DS–010',
    experiment: 'Photographic coastal scenery meets analogue broadcast design. These states are scene experiments, not a finished narrative.',
    transmitting: 'TRANSMISSION ACTIVE', artwork: 'ART DIRECTION', footage: 'ORIGINAL FOOTAGE',
    pause: 'PAUSE', resume: 'RESUME', sceneStatus: 'CURRENT SIGNAL STATE',
    prototype: 'INTERACTIVE SCENE PROTOTYPE — STORY AND EVENTS WILL BE DEVELOPED IN THE NEXT PHASE.',
    imprint: 'Legal notice', privacy: 'Privacy', credits: 'Footage: Pexels ↗',
    artworkCredit: 'AI GENERATED / SCENE CONCEPT', footageCredit: 'LIVE-ACTION / PEXELS',
    sourceAria: 'Choose picture source', topNavAria: 'Portfolio and language',
    sceneArtworkAria: 'Photographic coastal concept artwork with a lighthouse, broadcast station, fog and interference',
    sceneVideoAria: 'Original live-action footage of a rocky coastline with moving ocean and signal interference',
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
const signalInput = document.querySelector('#signal-strength');
const signalOutput = document.querySelector('#signal-strength-output');

/** Laufzeitzustand der Microsite; keine Persistenz für diese erste Testphase. */
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

  document.querySelector('#state-description').textContent = texts.stateDescriptions[scene.channel];
  languageToggle.textContent = scene.language === 'de' ? 'EN' : 'DE';
  languageToggle.setAttribute('aria-label', scene.language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln');
  document.querySelector('#top-nav').setAttribute('aria-label', texts.topNavAria);
  document.querySelector('#source-switch').setAttribute('aria-label', texts.sourceAria);
  updateSourceDescription();
  updatePlaybackLabel();
}

/** Wechselt zwischen den drei reinen Testzuständen ohne Storylogik. */
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
  document.querySelector('#visual-credit').textContent = texts[scene.source === 'artwork' ? 'artworkCredit' : 'footageCredit'];
  document.querySelector('#scene').setAttribute('aria-label', texts[scene.source === 'artwork' ? 'sceneArtworkAria' : 'sceneVideoAria']);
}

/** Wählt entweder die fotografische Art Direction oder die reale Wasseraufnahme. */
function setSource(source) {
  if (source !== 'artwork' && source !== 'video') return;

  scene.source = source;
  root.dataset.source = source;
  document.querySelectorAll('[data-source]').forEach(button => {
    const active = button.dataset.source === source;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
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

/** Bindet schlanke native Controls ohne Fremdbibliotheken. */
function init() {
  document.querySelectorAll('[data-channel]').forEach(button => {
    button.addEventListener('click', () => setChannel(button.dataset.channel));
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
  document.addEventListener('visibilitychange', () => void syncVideo());
  window.addEventListener('pagehide', () => coastVideo.pause());

  setSignalStrength(signalInput.value);
  setChannel(scene.channel);
  setSource(scene.source);
  updateTranslations();
}

init();
