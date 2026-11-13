/* src/design-studies/terra/scripts/app.js */

/**
 * @file Bedienoberfläche der eigenständigen Studie TERRA.
 * @description Verbindet Szenen, Sprache, Theme und zugängliche Bewegungssteuerung.
 * @author Benjamin Bennewitz
 */

import { SCENARIOS, TEXTS } from './content.js';

/** DOM-Referenzen werden einmalig und nach demselben Muster wie im Rootcode gesammelt. */
const elements = {
  identity: document.querySelector('.identity'),
  wallpaper: document.querySelector('#wallpaper'),
  interfaceNodes: [...document.querySelectorAll('.header, .stage, .footer, .skip-link')],
  settingsToggle: document.querySelector('#settings-toggle'), settingsBody: document.querySelector('#panel-body'),
  settingsScene: document.querySelector('#settings-scene'),
  canvas: document.querySelector('#world'), loading: document.querySelector('#loading'),
  scenes: [...document.querySelectorAll('[data-scene]')],
  sceneNumber: document.querySelector('#scene-number'), description: document.querySelector('#scene-description'),
  frost: document.querySelector('#frost'), frostValue: document.querySelector('#frost-value'),
  moisture: document.querySelector('#moisture'), moistureValue: document.querySelector('#moisture-value'),
  grid: document.querySelector('#grid'), pause: document.querySelector('#pause'),
  theme: document.querySelector('#theme'), language: document.querySelector('#language'),
  info: document.querySelector('#info'), about: document.querySelector('#about'),
  status: document.querySelector('#motion-status'), announcement: document.querySelector('#announcement'),
};
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = matchMedia('(max-width: 760px)');
const events = new AbortController();
const state = { scene: 0, paused: false, grid: true, language: 'de', theme: 'light', error: null, settingsOpen: false, wallpaper: false, wallpaperWasPaused: false };
let experience = null;
let resizeObserver = null;

/** Liest optionale Einstellungen ohne Abbruch bei gesperrtem Browserspeicher. */
function readPreferences() {
  try {
    state.language = localStorage.getItem('bp-language') === 'en' ? 'en' : 'de';
    const savedTheme = localStorage.getItem('bp-theme');
    state.theme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch {
    state.language = 'de';
  }
}

/** Speichert nur die bereits im Portfolio verwendeten Darstellungspräferenzen. */
function savePreferences() {
  try {
    localStorage.setItem('bp-language', state.language);
    localStorage.setItem('bp-theme', state.theme);
  } catch {
    /* Die Studie bleibt auch ohne beschreibbaren LocalStorage vollständig bedienbar. */
  }
}

/** Synchronisiert Texte, Metadaten und assistive Zustände nach jeder UI-Änderung. */
function updateInterface() {
  const text = TEXTS[state.language];
  document.documentElement.lang = state.language;
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.paused = String(state.paused || motionQuery.matches);
  document.title = text.title;
  document.querySelector('meta[name="theme-color"]').content = state.theme === 'dark' ? '#17231c' : '#eeeee2';
  for (const element of document.querySelectorAll('[data-text]')) element.textContent = text[element.dataset.text];
  for (const element of document.querySelectorAll('[data-scene-name]')) element.textContent = text.names[Number(element.dataset.sceneName)];
  elements.canvas.setAttribute('aria-label', state.wallpaper ? `${text.canvas}. ${text.wallpaperHint}` : text.canvas);
  elements.wallpaper.setAttribute('aria-label', text.wallpaper);
  elements.wallpaper.title = text.wallpaperHint;
  elements.wallpaper.setAttribute('aria-pressed', String(state.wallpaper));
  elements.language.textContent = state.language === 'de' ? 'EN' : 'DE';
  for (const key of ['theme', 'language', 'info']) elements[key].setAttribute('aria-label', text[key]);
  elements.grid.setAttribute('aria-label', text.gridToggle);
  elements.grid.setAttribute('aria-pressed', String(state.grid));
  elements.pause.setAttribute('aria-label', state.paused ? text.play : text.pause);
  elements.pause.setAttribute('aria-pressed', String(state.paused));
  elements.pause.firstElementChild.textContent = state.paused ? '▷' : 'Ⅱ';
  elements.description.textContent = text.descriptions[state.scene];
  const settingsExpanded = !mobileQuery.matches || state.settingsOpen;
  elements.settingsBody.hidden = !settingsExpanded;
  elements.settingsToggle.setAttribute('aria-expanded', String(settingsExpanded));
  elements.settingsToggle.setAttribute('aria-label', `${settingsExpanded ? text.settingsCollapse : text.settingsExpand}: ${text.names[state.scene]}`);
  elements.settingsScene.textContent = text.names[state.scene];
  elements.sceneNumber.textContent = `${SCENARIOS[state.scene].number} / 03`;
  elements.status.textContent = state.error ? text.unavailable : state.paused ? text.paused : motionQuery.matches ? text.reduced : text.live;
  for (const button of elements.scenes) button.setAttribute('aria-pressed', String(Number(button.dataset.scene) === state.scene));
  if (state.error) elements.loading.textContent = text[state.error];
}

/** Blendet die gesamte Oberfläche aus und erhält einen zugänglichen Rückweg zur Bedienung. */
function setWallpaper(enabled) {
  if (enabled && (!experience || state.error)) return;
  if (enabled === state.wallpaper) return;
  state.wallpaper = enabled;
  if (enabled) {
    state.wallpaperWasPaused = state.paused;
    state.paused = false;
    if (elements.about.open) elements.about.close();
  } else {
    state.paused = state.wallpaperWasPaused;
  }
  document.documentElement.dataset.wallpaper = String(enabled);
  for (const element of elements.interfaceNodes) element.inert = enabled;
  experience?.setWallpaper(enabled);
  experience?.setMotion({ paused: state.paused });
  updateInterface();
  if (enabled) {
    elements.canvas.tabIndex = 0;
    elements.canvas.focus({ preventScroll: true });
  } else {
    elements.canvas.removeAttribute('tabindex');
    (state.error ? elements.info : elements.wallpaper).focus({ preventScroll: true });
  }
}

/** Zeigt einen übersetzten Fehler, ohne Navigation und Kontextinformationen zu blockieren. */
function showError(key) {
  state.error = key;
  experience?.dispose();
  experience = null;
  if (state.wallpaper) setWallpaper(false);
  elements.loading.hidden = false;
  elements.loading.classList.add('loading--error');
  elements.loading.setAttribute('role', 'alert');
  for (const control of [...elements.scenes, elements.frost, elements.moisture, elements.grid, elements.pause, elements.wallpaper]) control.disabled = true;
  updateInterface();
}

/** Registriert alle Eingaben mit gemeinsamem, später freigebbarem Lebenszyklus. */
function bindControls() {
  const options = { signal: events.signal };
  elements.wallpaper.addEventListener('click', () => setWallpaper(true), options);
  document.addEventListener('click', (event) => {
    if (!state.wallpaper) return;
    event.preventDefault();
    event.stopPropagation();
    setWallpaper(false);
  }, { ...options, capture: true });
  document.addEventListener('keydown', (event) => {
    if (state.wallpaper && event.key === 'Escape') {
      event.preventDefault();
      setWallpaper(false);
    }
  }, options);
  for (const button of elements.scenes) {
    button.addEventListener('click', () => {
      state.scene = Number(button.dataset.scene);
      experience?.selectScene(state.scene);
      updateInterface();
      elements.announcement.textContent = `${TEXTS[state.language].names[state.scene]}. ${TEXTS[state.language].descriptions[state.scene]}`;
    }, options);
  }
  elements.frost.addEventListener('input', () => {
    elements.frostValue.value = `${elements.frost.value}%`;
    experience?.setMaterial('uFrost', Number(elements.frost.value) / 100);
  }, options);
  elements.moisture.addEventListener('input', () => {
    elements.moistureValue.value = `${elements.moisture.value}%`;
    experience?.setMaterial('uMoisture', Number(elements.moisture.value) / 100);
  }, options);
  elements.grid.addEventListener('click', () => {
    state.grid = !state.grid;
    experience?.setMaterial('uGrid', Number(state.grid));
    updateInterface();
  }, options);
  elements.pause.addEventListener('click', () => {
    state.paused = !state.paused;
    experience?.setMotion({ paused: state.paused });
    updateInterface();
  }, options);
  elements.language.addEventListener('click', () => {
    state.language = state.language === 'de' ? 'en' : 'de';
    savePreferences();
    updateInterface();
  }, options);
  elements.theme.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    experience?.setTheme(state.theme);
    savePreferences();
    updateInterface();
  }, options);
  document.querySelector('.skip-link').addEventListener('click', () => {
    state.settingsOpen = true;
    updateInterface();
  }, options);
  elements.settingsToggle.addEventListener('click', () => {
    state.settingsOpen = !state.settingsOpen;
    updateInterface();
  }, options);
  mobileQuery.addEventListener('change', () => {
    if (!mobileQuery.matches && document.activeElement === elements.settingsToggle) {
      (elements.frost.disabled ? elements.info : elements.frost).focus();
    }
    if (mobileQuery.matches && !state.settingsOpen && elements.settingsBody.contains(document.activeElement)) elements.settingsToggle.focus();
    updateInterface();
  }, options);
  elements.info.addEventListener('click', () => elements.about.showModal(), options);
  elements.about.addEventListener('close', () => elements.info.focus(), options);
  document.addEventListener('pointermove', (event) => {
    elements.identity.classList.add('identity--compact');
    if (event.pointerType !== 'touch') experience?.setPointer(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
  }, { ...options, passive: true });
  document.addEventListener('pointerdown', () => elements.identity.classList.add('identity--compact'), { ...options, once: true, passive: true });
  elements.canvas.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') experience?.setPointer(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
  }, { ...options, passive: true });
  document.documentElement.addEventListener('pointerleave', () => experience?.setPointer(0, 0), options);
  document.addEventListener('visibilitychange', () => experience?.setMotion({ suspended: document.hidden }), options);
  motionQuery.addEventListener('change', () => {
    experience?.setMotion({ reduced: motionQuery.matches });
    updateInterface();
  }, options);
  elements.canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    showError('lost');
  }, options);
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) {
      experience?.setMotion({ suspended: true });
    } else {
      resizeObserver?.disconnect();
      experience?.dispose();
      events.abort();
    }
  }, options);
  window.addEventListener('pageshow', () => experience?.setMotion({ suspended: document.hidden }), options);
}

/** Startet die Bedienoberfläche vor dem WebGL-Modul, damit auch Importfehler sichtbar bleiben. */
async function start() {
  readPreferences();
  updateInterface();
  bindControls();
  try {
    const { GlassExperience } = await import('./experience.js');
    experience = new GlassExperience(elements.canvas, state.theme);
    if (state.scene !== 0) experience.selectScene(state.scene);
    experience.setMaterial('uFrost', Number(elements.frost.value) / 100);
    experience.setMaterial('uMoisture', Number(elements.moisture.value) / 100);
    experience.setMaterial('uGrid', Number(state.grid));
    experience.setMotion({ paused: state.paused });
    resizeObserver = new ResizeObserver(() => experience?.resize());
    resizeObserver.observe(elements.canvas);
    elements.loading.hidden = true;
    elements.wallpaper.disabled = false;
  } catch (error) {
    console.error('[TERRA] Initialisierung fehlgeschlagen.', error);
    showError('error');
  }
}

void start();
