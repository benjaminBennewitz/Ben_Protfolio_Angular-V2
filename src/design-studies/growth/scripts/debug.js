/** @file debug.js — Bindet die Autorenwerkzeuge nur bei vorhandenem debug-URL-Parameter ein. */

import { normalizeConfig } from './config.js';

/**
 * Bindet die Autorenwerkzeuge nur bei vorhandenem debug-URL-Parameter ein.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {void} Kein Rückgabewert.
 */
export function mountDebug({ world, config }) {
  if (!new URLSearchParams(location.search).has('debug')) return;

  const panel = createDebugPanel();                              // Container der Autorenwerkzeuge.
  const content = panel.querySelector('.growth-debug-content');  // Inhaltscontainer des Debug-Panels.
  const textarea = createConfigEditor(config);                   // JSON-Editor der Generator-Konfiguration.
  const actions = document.createElement('div');                 // Container der Debug-Aktionen.

  content.append(createLayerControls(world), textarea);
  actions.className = 'growth-debug-actions';
  addDebugButton(
    actions,
    'Apply / Reload',

    /**
     * Validiert Editor-JSON und lädt die Szene mit den neuen URL-Parametern.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    () => applyConfig(textarea),
  );
  addDebugButton(
    actions,
    'Export JSON',

    /**
     * Lädt den aktuellen Editorinhalt als JSON-Datei herunter.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    () => exportConfig(textarea),
  );
  addDebugButton(
    actions,
    'Copy JSON',

    /**
     * Kopiert den aktuellen Konfigurationsinhalt in die Zwischenablage.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    () => navigator.clipboard?.writeText(textarea.value),
  );
  content.append(actions);
  document.body.append(panel);
}

/**
 * Erstellt die zugängliche Grundstruktur des aufklappbaren Debug-Panels.
 * @returns {HTMLElement} Ergebnis der beschriebenen Operation.
 */
function createDebugPanel() {

  const panel = document.createElement('aside');      // Container der Autorenwerkzeuge.
  const details = document.createElement('details');  // Aufklappbarer Bereich des Debug-Panels.
  const summary = document.createElement('summary');  // Beschriftung des aufklappbaren Debug-Bereichs.
  const content = document.createElement('div');      // Inhaltscontainer des Debug-Panels.
  const intro = document.createElement('p');          // Hinweistext zu Seeds und reproduzierbaren Neustarts.

  panel.className = 'growth-debug';
  panel.setAttribute('aria-label', 'Tree authoring tools');
  details.open = true;
  summary.textContent = 'GROWTH / DEBUG 2.0';
  content.className = 'growth-debug-content';
  intro.textContent =
    'Layer an-/ausschalten; Seeds und Parameter für einen reproduzierbaren Neustart exportieren.';
  content.append(intro);
  details.append(summary, content);
  panel.append(details);
  return panel;
}

/**
 * Erstellt die Sichtbarkeitsschalter aller registrierten Welt-Layer.
 * @param {object} world - Öffentliche Zustände und Aktionen der prozeduralen Welt.
 * @returns {HTMLElement} Ergebnis der beschriebenen Operation.
 */
function createLayerControls(world) {

  const controls = document.createElement('div');  // Container der Layer-Sichtbarkeitsschalter.

  controls.className = 'growth-debug-layers';
  for (const [name, layer] of Object.entries(world.layers)) {
    controls.append(createLayerToggle(world, name, layer));
  }
  return controls;
}

/**
 * Erstellt einen beschrifteten Sichtbarkeitsschalter für einen Welt-Layer.
 * @param {object} world - Öffentliche Zustände und Aktionen der prozeduralen Welt.
 * @param {string} name - Kennung des aktuellen Welt-Layers.
 * @param {object} layer - Aktueller Welt-Layer oder Wolken-Bewegungszustand.
 * @returns {HTMLElement} Ergebnis der beschriebenen Operation.
 */
function createLayerToggle(world, name, layer) {

  const label = document.createElement('label');     // Beschriftung des aktuellen Steuerelements.
  const checkbox = document.createElement('input');  // Sichtbarkeitsschalter des aktuellen Layers.

  checkbox.type = 'checkbox';
  checkbox.checked = true;
  checkbox.addEventListener(
    'change',

    /**
     * Verarbeitet das Ereignis „change“ für die zugehörige Interaktion.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    () => world.setLayerVisible(name, checkbox.checked),
  );
  label.append(checkbox, document.createTextNode(` ${name} (${layer.size})`));
  return label;
}

/**
 * Erstellt den JSON-Editor mit der aktuellen Generator-Konfiguration.
 * @param {object} config - Validierte Generatorparameter und Seeds.
 * @returns {HTMLTextAreaElement} Ergebnis der beschriebenen Operation.
 */
function createConfigEditor(config) {

  const textarea = document.createElement('textarea');  // JSON-Editor der Generator-Konfiguration.

  textarea.setAttribute('aria-label', 'Generator-Konfiguration als JSON');
  textarea.spellcheck = false;
  textarea.value = JSON.stringify(config, null, 2);
  return textarea;
}

/**
 * Registriert eine Aktion als Schaltfläche im Debug-Panel.
 * @param {object} actions - Container der Debug-Aktionen.
 * @param {string} label - Beschriftung des aktuellen Steuerelements.
 * @param {Function} action - Bei Betätigung auszuführende Aktion.
 * @returns {void} Kein Rückgabewert.
 */
function addDebugButton(actions, label, action) {

  const element = document.createElement('button');  // Schaltfläche der aktuellen Debug-Aktion.

  element.type = 'button';
  element.textContent = label;
  element.addEventListener('click', action);
  actions.append(element);
}

/**
 * Validiert Editor-JSON und lädt die Szene mit den neuen URL-Parametern.
 * @param {HTMLTextAreaElement} textarea - JSON-Editor der Generator-Konfiguration.
 * @returns {void} Kein Rückgabewert.
 */
function applyConfig(textarea) {
  try {

    const parsed = JSON.parse(textarea.value);   // Als JSON eingelesener Editorinhalt.
    const normalized = normalizeConfig(parsed);  // Auf gültige Werte begrenzte Generator-Konfiguration.
    const url = new URL(location.href);          // Zieladresse mit serialisierter Konfiguration.

    url.searchParams.set('growth', encodeURIComponent(JSON.stringify(normalized)));
    url.searchParams.set('debug', '1');
    location.assign(url.href);
  } catch (error) {
    alert(`Ungültiges JSON: ${error.message}`);
  }
}

/**
 * Lädt den aktuellen Editorinhalt als JSON-Datei herunter.
 * @param {HTMLTextAreaElement} textarea - JSON-Editor der Generator-Konfiguration.
 * @returns {void} Kein Rückgabewert.
 */
function exportConfig(textarea) {

  const blob = new Blob([textarea.value], {
    type: 'application/json',
  });                                          // Exportdatei beziehungsweise sichtbares Atmosphärenobjekt.
  const anchor = document.createElement('a');  // Ankerpunkt der aktuellen Geometrie oder Download-Link.

  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'growth-2-preset.json';
  anchor.click();
  setTimeout(

    /**
     * Gibt die temporäre Exportadresse nach dem Download wieder frei.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    () => URL.revokeObjectURL(anchor.href),
    1000,
  );
}
