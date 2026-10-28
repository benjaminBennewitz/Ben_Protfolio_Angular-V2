/**
 * @file achievements.js
 * @description Zeigt gemeinsame Achievement-Benachrichtigungen in eigenständigen Designstudien.
 * Nutzt Shadow DOM, damit die jeweiligen Studien-Styles das Popup nicht beeinflussen.
 */

import { STUDY_ACHIEVEMENTS } from './achievement-catalog.js';
import { STUDY_STORAGE_PREFIX, unlockStudyAchievement } from './achievement-progress.js';

/* ===========================================================================
   INHALTSVERZEICHNIS

   01   Warteschlange und Anzeigezustand
   02   Einstellungen und Schriftdateien
   03   Popup-Struktur und Ressourcen initialisieren
   04   Benachrichtigungen anzeigen und schließen
   05   Ereignisse und Synchronisierung
   ========================================================================== */

/* ===========================================================================
   01   Warteschlange und Anzeigezustand
   ========================================================================== */

/** @type {import('./achievement-catalog.js').StudyAchievement[]} Wartende Trophäen. */
const queue = [];

/** @type {import('./achievement-catalog.js').StudyAchievement | null} Aktuell angezeigte Trophäe. */
let current = null;

/** @type {number | null} Timer für die sichtbare Anzeigedauer. */
let timer = null;

/** @type {number | null} Timer bis zur nächsten Benachrichtigung. */
let nextTimer = null;

/** @type {HTMLDivElement | null} Isolierter Container für das Popup. */
let host = null;

/** @type {ShadowRoot | null} Kapselt die Popup-Styles vom restlichen Dokument ab. */
let shadow = null;

/** @type {HTMLDivElement | null} Ebene für die Achievement-Karte. */
let layer = null;

/** @type {Element | null} Zuvor fokussiertes Element. */
let previousFocus = null;

/** @type {Promise<unknown[]> | null} Abschluss der einmaligen Ressourceninitialisierung. */
let ready = null;

/** @type {boolean} Verhindert parallele Vorbereitungen derselben Anzeige. */
let preparing = false;

/* ===========================================================================
   02   Einstellungen und Schriftdateien
   ========================================================================== */

/**
 * Liest eine Einstellung auch bei blockiertem LocalStorage sicher aus.
 *
 * @param {string} key - Schlüssel der gespeicherten Einstellung.
 * @returns {string | null} Gespeicherter Wert oder `null`.
 */
function setting(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Übernimmt Theme und Bewegungspräferenzen für den isolierten Popup-Container.
 *
 * @returns {void} Kein Rückgabewert.
 */
function syncPreferences() {
  if (!host) return;

  const theme = setting('bp-theme');
  host.dataset.theme = theme === 'light' || theme === 'dark'
    ? theme
    : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  host.style.colorScheme = host.dataset.theme;

  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const preferences = JSON.parse(setting('bp-accessibility-preferences-v1') || 'null');
    reduced ||= Boolean(preferences && (preferences.motion !== 'full' || preferences.comfort === 'simple'));
  } catch {
    // Bei unvollständigen Einstellungen gilt die Browserpräferenz.
  }

  layer.toggleAttribute('data-reduced-motion', reduced);
}

/**
 * Lädt eine lokale Schriftdatei für die vom Portfolio unabhängige Benachrichtigung.
 * Fehler beim Laden dürfen die Anzeige der Trophäe nicht verhindern.
 *
 * @param {string} family - CSS-Schriftfamilie.
 * @param {string} file - Dateiname im gemeinsamen Font-Verzeichnis.
 * @param {FontFaceDescriptors} descriptors - Optionale Font-Face-Eigenschaften.
 * @returns {Promise<FontFaceSet | undefined>} Ergebnis des Ladeversuchs.
 */
function loadFont(family, file, descriptors = {}) {
  const url = new URL('../../assets/fonts/' + file, import.meta.url);
  const face = new FontFace(family, `url("${url.href}")`, descriptors);
  return face.load().then(font => document.fonts.add(font)).catch(() => undefined);
}

/* ===========================================================================
   03   Popup-Struktur und Ressourcen initialisieren
   ========================================================================== */

/**
 * Erstellt den isolierten Host für das Achievement-Popup.
 *
 * @returns {void} Kein Rückgabewert.
 */
function createToastHost() {
  host = document.createElement('div');
  host.style.cssText = 'all:initial;position:fixed;inset:0;margin:0;padding:0;border:0;z-index:98;pointer-events:none;display:none';
  if ('showPopover' in host) host.setAttribute('popover', 'manual');
  shadow = host.attachShadow({ mode: 'open' });
}

/**
 * Bindet das isolierte Stylesheet in das Shadow DOM ein.
 * Auch bei einem Ladefehler kann die Anzeige fortgesetzt werden.
 *
 * @returns {Promise<unknown>} Abschluss des Stylesheet-Ladeversuchs.
 */
function loadToastStyles() {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('./achievements.css', import.meta.url).href;

  const styled = new Promise(resolve => {
    css.onload = resolve;
    css.onerror = resolve;
  });

  shadow.append(css);
  return styled;
}

/**
 * Erstellt das dekorative Trophäen-Symbol.
 *
 * @returns {HTMLDivElement} Icon-Container mit Material-Symbol.
 */
function createToastIcon() {
  const icon = document.createElement('div');
  icon.className = 'achievement-toast__icon';
  icon.setAttribute('aria-hidden', 'true');

  const symbol = document.createElement('span');
  symbol.className = 'material-symbols-outlined';
  symbol.textContent = 'emoji_events';
  icon.append(symbol);
  return icon;
}

/**
 * Erstellt die Textelemente für Kategorie, Titel und Beschreibung.
 *
 * @returns {HTMLDivElement} Textcontainer der Benachrichtigung.
 */
function createToastCopy() {
  const copy = document.createElement('div');
  copy.className = 'achievement-toast__copy';
  copy.append(document.createElement('p'), document.createElement('h2'), document.createElement('span'));
  return copy;
}

/**
 * Erstellt die Schließen-Schaltfläche einschließlich Click-Handler.
 *
 * @returns {HTMLButtonElement} Bedienelement zum Schließen des Popups.
 */
function createToastCloseButton() {
  const close = document.createElement('button');
  close.type = 'button';

  const closeIcon = document.createElement('span');
  closeIcon.className = 'material-symbols-outlined';
  closeIcon.setAttribute('aria-hidden', 'true');
  closeIcon.textContent = 'close';
  close.append(closeIcon);
  close.addEventListener('click', dismiss);
  return close;
}

/**
 * Stellt die Achievement-Karte aus ihren Bestandteilen zusammen.
 *
 * @returns {HTMLElement} Fertige Benachrichtigungskarte.
 */
function createToastCard() {
  const toast = document.createElement('section');
  toast.className = 'achievement-toast bp-card';
  toast.setAttribute('role', 'status');
  toast.append(createToastIcon(), createToastCopy(), createToastCloseButton());
  return toast;
}

/**
 * Erstellt die barrierefreie Popup-Ebene im Shadow DOM.
 *
 * @returns {void} Kein Rückgabewert.
 */
function createToastLayer() {
  layer = document.createElement('div');
  layer.className = 'achievement-toast-layer';
  layer.setAttribute('aria-live', 'polite');
  layer.setAttribute('aria-atomic', 'true');
  layer.append(createToastCard());
  shadow.append(layer);
}

/**
 * Initialisiert die Popup-Struktur und lädt die benötigten Ressourcen einmalig.
 *
 * @returns {Promise<unknown[]>} Abschluss der Style- und Font-Initialisierung.
 */
function prepareToast() {
  if (ready) return ready;

  createToastHost();
  const styled = loadToastStyles();
  createToastLayer();
  document.body.append(host);

  ready = Promise.all([
    styled,
    loadFont('Material Symbols Outlined', 'material-symbols-portfolio.woff2', { weight: '100 700' }),
    loadFont('Inter', 'inter-variable.woff2', { weight: '100 900' }),
    loadFont('JetBrains Mono', 'jetbrains-mono-variable.woff2', { weight: '100 800' }),
  ]);
  return ready;
}

/* ===========================================================================
   04   Benachrichtigungen anzeigen und schließen
   ========================================================================== */

/**
 * Zeigt den nächsten Erfolg nach abgeschlossener Ressourceninitialisierung.
 * Verhindert parallele Popups und pausiert bei unsichtbarem Dokument.
 *
 * @returns {Promise<void>} Abschluss des Anzeigeversuchs.
 */
async function next() {
  if (current || preparing || !queue.length || document.hidden) return;
  preparing = true;
  await prepareToast();
  preparing = false;
  if (!queue.length || document.hidden) return;

  current = queue.shift();
  const language = setting('bp-language') === 'en' ? 'en' : 'de';
  const text = current[language];
  syncPreferences();

  const copy = shadow.querySelector('.achievement-toast__copy');
  copy.querySelector('p').textContent = language === 'de' ? 'trophäe freigeschaltet' : 'achievement unlocked';
  copy.querySelector('h2').textContent = text.title;
  copy.querySelector('span').textContent = text.description;
  shadow.querySelector('button').setAttribute('aria-label', language === 'de' ? 'Achievement-Notification schließen' : 'Close achievement notification');

  previousFocus = document.activeElement;
  host.style.display = 'block';
  host.showPopover?.();
  if (document.activeElement !== previousFocus && previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
  timer = setTimeout(dismiss, 4200);
}

/**
 * Schließt die aktuelle Trophäe und stellt bei Bedarf den vorherigen Fokus wieder her.
 * Plant nach kurzer Pause die nächste Benachrichtigung ein.
 *
 * @returns {void} Kein Rückgabewert.
 */
function dismiss() {
  clearTimeout(timer);
  clearTimeout(nextTimer);
  if (host) {
    const hadFocus = shadow.activeElement !== null;
    host.hidePopover?.();
    host.style.display = 'none';
    if (hadFocus && previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
  }
  current = null;
  nextTimer = setTimeout(next, 160);
}

/**
 * Leert die Benachrichtigungswarteschlange nach einem Fortschritts-Reset.
 *
 * @returns {void} Kein Rückgabewert.
 */
function reset() {
  queue.length = 0;
  dismiss();
}

/* ===========================================================================
   05   Ereignisse und Synchronisierung
   ========================================================================== */

// Freischaltungen werden im gemeinsamen Fortschrittsmodul verarbeitet.
document.addEventListener('bp:study-achievement', event => unlockStudyAchievement(event.detail));

document.addEventListener('bp:study-unlocked', event => {
  const trophy = STUDY_ACHIEVEMENTS.find(item => item.id === event.detail);
  if (trophy) { queue.push(trophy); next(); }
});

document.addEventListener('visibilitychange', next);
document.addEventListener('bp:study-reset', reset);
window.addEventListener('focus', syncPreferences);

// Änderungen aus anderen Tabs aktualisieren die Anzeige und gespeicherte Präferenzen.
window.addEventListener('storage', event => {
  if (event.key === null || (event.key.startsWith(STUDY_STORAGE_PREFIX) && event.newValue === null)) reset();
  if (event.key === null || event.key === 'bp-theme' || event.key === 'bp-accessibility-preferences-v1') syncPreferences();
});
