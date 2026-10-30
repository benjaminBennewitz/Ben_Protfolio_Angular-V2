/** @file Übersetzungen, Auswahlzustände und zugängliche Beschriftungen. */
import { SPECIMENS, DEFAULT_SETTINGS } from './organisms.js';
import { texts } from './content.js';

/** Synchronisiert Oberfläche und Dokument mit dem aktuellen Bedienzustand. */
export function renderView(state) {
  const t = texts[state.language];
  document.documentElement.lang = state.language;
  document.documentElement.dataset.theme = state.theme;
  translateStatic(t);
  renderButtons(state, t);
  renderSpecimen(state);
  renderArchive(state);
  document.querySelector('#fallback').textContent = t.error;
  document.title = state.language === 'de' ? 'PHASE. — Generative Studie' : 'PHASE. — Generative Study';
}

/** Übersetzt alle statischen Textknoten, einschließlich des Footers. */
function translateStatic(t) {
  for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = t[element.dataset.i18n];
}

/** Setzt Buttontexte und deren sprachabhängige zugängliche Namen. */
function renderButtons(state, t) {
  const pause = document.querySelector('#pause');
  const theme = document.querySelector('#theme');
  const language = document.querySelector('#language');
  pause.textContent = state.paused ? t.play : t.pause;
  pause.setAttribute('aria-pressed', String(state.paused));
  theme.textContent = state.theme === 'dark' ? t.light : t.dark;
  theme.setAttribute('aria-label', state.theme === 'dark' ? t.themeLight : t.themeDark);
  language.textContent = state.language === 'de' ? 'EN' : 'DE';
  language.setAttribute('aria-label', state.language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln');
}

/** Zeigt Beschreibung, Parametername und Canvas-Alternative der aktiven Probe. */
function renderSpecimen(state) {
  const copy = state.specimen[state.language];
  document.querySelector('#stage').setAttribute('aria-label', copy.canvas);
  document.querySelector('[data-i18n="frequency"]').textContent = copy.parameter;
  document.querySelector('#specimen-name').textContent = copy.name;
  document.querySelector('#specimen-description').textContent = copy.description;
  document.querySelector('.specimen').textContent = `SPECIMEN ${state.specimen.number}`;
}

/** Aktualisiert ausschließlich Texte und Auswahlmarkierungen vorhandener Buttons. */
function renderArchive(state) {
  for (const button of document.querySelectorAll('[data-specimen]')) {
    const item = SPECIMENS.find(matchesButton);
    /** Vergleicht die Probenkennung des aktuellen Buttons. */
    function matchesButton(entry) {
      return entry.id === button.dataset.specimen;
    }
    button.querySelector('.specimen-label').textContent = item[state.language].name;
    button.setAttribute('aria-pressed', String(item.id === state.specimen.id));
  }
}

/** Aktualisiert die sichtbare Zahl und Einheit eines einzelnen Reglers. */
export function renderRange(input) {
  const number = Number(input.value);
  document.getElementById(`${input.id}-value`).value =
    input.id === 'amplitude' ? `${Math.round(number * 100)}%` : `${number.toFixed(2)}${input.id === 'speed' ? '×' : ''}`;
}

/** Stellt alle Regler auf ihre zentral definierten Anfangswerte. */
export function resetRanges() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const input = document.getElementById(key);
    input.value = value;
    renderRange(input);
  }
}

/** Zeigt eine lokalisierte Fehleranzeige und sperrt die Zeichensteuerung. */
export function showFailure(error) {
  document.querySelector('#fallback').hidden = false;
  for (const input of document.querySelectorAll('.controls button, .controls input, .archive button')) input.disabled = true;
  console.error('PHASE:', error);
}
