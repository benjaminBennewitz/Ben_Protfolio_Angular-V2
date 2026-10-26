/** @file Kleine, gemeinsame DLC-Benachrichtigung der eigenständigen Studien. */
import { STUDY_ACHIEVEMENTS } from './achievement-catalog.js';
import { STUDY_STORAGE_PREFIX, unlockStudyAchievement } from './achievement-progress.js';

const queue = [];
let current = null;
let timer = null;
let layer = null;
let dialog = null;
let previousFocus = null;
let language = 'de';
try { language = localStorage.getItem('bp-language') === 'en' ? 'en' : 'de'; } catch { /* Standardsprache beibehalten. */ }

/** Verwendet die Top-Layer nur ohne Modalität: Spiel und Tastatur bleiben bedienbar. */
function prepareToast() {
  if (layer) return;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('./achievements.css', import.meta.url).href;
  document.head.append(css);
  layer = document.createElement('div');
  layer.className = 'bp-study-trophy-live';
  layer.setAttribute('role', 'status');
  layer.setAttribute('aria-live', 'polite');
  layer.setAttribute('aria-atomic', 'true');
  document.body.append(layer);
  dialog = document.createElement('aside');
  dialog.className = 'bp-study-trophy';
  if ('showPopover' in dialog) dialog.setAttribute('popover', 'manual');
  const copy = document.createElement('div');
  const label = document.createElement('p');
  label.textContent = language === 'de' ? 'Design Studies · DLC — Trophäe freigeschaltet' : 'Design Studies · DLC — Trophy unlocked';
  copy.append(label, document.createElement('h2'), document.createElement('span'));
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', language === 'de' ? 'Benachrichtigung schließen' : 'Close notification');
  close.addEventListener('click', dismiss);
  dialog.append(copy, close);
  document.body.append(dialog);
}

/** Zeigt jeden Erfolg einmal und wartet bei Hintergrund-Tabs auf die Rückkehr. */
function next() {
  if (current || !queue.length || document.hidden) return;
  try { language = localStorage.getItem('bp-language') === 'en' ? 'en' : 'de'; } catch { /* Bisherige Sprache beibehalten. */ }
  prepareToast();
  dialog.querySelector('p').textContent = language === 'de' ? 'Design Studies · DLC — Trophäe freigeschaltet' : 'Design Studies · DLC — Trophy unlocked';
  dialog.querySelector('button').setAttribute('aria-label', language === 'de' ? 'Benachrichtigung schließen' : 'Close notification');
  current = queue.shift();
  const text = current[language];
  dialog.querySelector('h2').textContent = text.title;
  dialog.querySelector('span').textContent = text.description;
  layer.textContent = `${language === 'de' ? 'Trophäe freigeschaltet' : 'Trophy unlocked'}: ${text.title}. ${text.description}`;
  previousFocus = document.activeElement;
  dialog.hidden = false;
  dialog.showPopover?.();
  /** Popover darf weder Canvas-Steuerung noch ein geöffnetes Dialogfeld unfokussieren. */
  if (document.activeElement !== previousFocus && previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
  timer = setTimeout(dismiss, 6000);
}

/** Räumt den Hinweis auf und lässt den nächsten Erfolg aus der Warteschlange folgen. */
function dismiss() {
  clearTimeout(timer);
  if (dialog) {
    const hadFocus = dialog.contains(document.activeElement);
    dialog.hidePopover?.();
    dialog.hidden = true;
    if (hadFocus && previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
  }
  current = null;
  setTimeout(next, 180);
}

document.addEventListener('bp:study-achievement', event => unlockStudyAchievement(event.detail));
document.addEventListener('bp:study-unlocked', event => {
  const trophy = STUDY_ACHIEVEMENTS.find(item => item.id === event.detail);
  if (trophy) { queue.push(trophy); next(); }
});
document.addEventListener('visibilitychange', next);
document.addEventListener('bp:study-reset', () => { queue.length = 0; dismiss(); });
window.addEventListener('storage', event => { if (event.key === null || (event.key.startsWith(STUDY_STORAGE_PREFIX) && event.newValue === null)) { queue.length = 0; dismiss(); } });
