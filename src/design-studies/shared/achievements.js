/** @file Bindet das bestehende Portfolio-Trophy-Popup in eigenständige Studien ein. */
import { STUDY_ACHIEVEMENTS } from './achievement-catalog.js';
import { STUDY_STORAGE_PREFIX, unlockStudyAchievement } from './achievement-progress.js';

const queue = [];
let current = null;
let timer = null;
let nextTimer = null;
let host = null;
let shadow = null;
let layer = null;
let previousFocus = null;
let ready = null;
let preparing = false;

/** Liest Portfolio-Einstellungen auch dann sicher, wenn der Browser Speicher blockiert. */
function setting(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

/** Übernimmt Sprache, Theme und Motion-Einstellung des Portfolios. */
function syncPreferences() {
  if (!host) return;
  const theme = setting('bp-theme');
  host.dataset.theme = theme === 'light' || theme === 'dark' ? theme : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  host.style.colorScheme = host.dataset.theme;
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const preferences = JSON.parse(setting('bp-accessibility-preferences-v1') || 'null');
    reduced ||= Boolean(preferences && (preferences.motion !== 'full' || preferences.comfort === 'simple'));
  } catch { /* Bei unvollständigen Einstellungen gilt die Browserpräferenz. */ }
  layer.toggleAttribute('data-reduced-motion', reduced);
}

/** Lädt dieselben lokalen Schriftdateien wie das bisherige Portfolio-Popup. */
function loadFont(family, file, descriptors = {}) {
  const url = new URL('../../assets/fonts/' + file, import.meta.url);
  const face = new FontFace(family, `url("${url.href}")`, descriptors);
  return face.load().then(font => document.fonts.add(font)).catch(() => undefined);
}

/** Erstellt dieselbe Kartenstruktur; Shadow DOM schützt sie vor fremden Studien-Styles. */
function prepareToast() {
  if (ready) return ready;
  host = document.createElement('div');
  host.style.cssText = 'all:initial;position:fixed;inset:0;margin:0;padding:0;border:0;z-index:98;pointer-events:none;display:none';
  if ('showPopover' in host) host.setAttribute('popover', 'manual');
  shadow = host.attachShadow({ mode: 'open' });
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('./achievements.css', import.meta.url).href;
  const styled = new Promise(resolve => { css.onload = resolve; css.onerror = resolve; });
  shadow.append(css);
  layer = document.createElement('div');
  layer.className = 'achievement-toast-layer';
  layer.setAttribute('aria-live', 'polite');
  layer.setAttribute('aria-atomic', 'true');
  const toast = document.createElement('section');
  toast.className = 'achievement-toast bp-card';
  toast.setAttribute('role', 'status');
  const icon = document.createElement('div');
  icon.className = 'achievement-toast__icon';
  icon.setAttribute('aria-hidden', 'true');
  const symbol = document.createElement('span');
  symbol.className = 'material-symbols-outlined';
  symbol.textContent = 'emoji_events';
  icon.append(symbol);
  const copy = document.createElement('div');
  copy.className = 'achievement-toast__copy';
  copy.append(document.createElement('p'), document.createElement('h2'), document.createElement('span'));
  const close = document.createElement('button');
  close.type = 'button';
  const closeIcon = document.createElement('span');
  closeIcon.className = 'material-symbols-outlined';
  closeIcon.setAttribute('aria-hidden', 'true');
  closeIcon.textContent = 'close';
  close.append(closeIcon);
  close.addEventListener('click', dismiss);
  toast.append(icon, copy, close);
  layer.append(toast);
  shadow.append(layer);
  document.body.append(host);
  ready = Promise.all([
    styled,
    loadFont('Material Symbols Outlined', 'material-symbols-portfolio.woff2', { weight: '100 700' }),
    loadFont('Inter', 'inter-variable.woff2', { weight: '100 900' }),
    loadFont('JetBrains Mono', 'jetbrains-mono-variable.woff2', { weight: '100 800' }),
  ]);
  return ready;
}

/** Bewahrt Beschriftung, Position, Einblendung und Anzeigedauer des bisherigen Popups. */
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

/** Schließt ohne Fokusverlust und plant die nächste Trophäe wie im Hauptsystem. */
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

/** Entfernt wartende Hinweise, wenn der Fortschritt zurückgesetzt wurde. */
function reset() { queue.length = 0; dismiss(); }

document.addEventListener('bp:study-achievement', event => unlockStudyAchievement(event.detail));
document.addEventListener('bp:study-unlocked', event => {
  const trophy = STUDY_ACHIEVEMENTS.find(item => item.id === event.detail);
  if (trophy) { queue.push(trophy); next(); }
});
document.addEventListener('visibilitychange', next);
document.addEventListener('bp:study-reset', reset);
window.addEventListener('focus', syncPreferences);
window.addEventListener('storage', event => {
  if (event.key === null || (event.key.startsWith(STUDY_STORAGE_PREFIX) && event.newValue === null)) reset();
  if (event.key === null || event.key === 'bp-theme' || event.key === 'bp-accessibility-preferences-v1') syncPreferences();
});
