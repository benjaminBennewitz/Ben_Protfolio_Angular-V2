/** @file dom.js — Gekapselter Teilbereich der SCOOP!-Studie. */

export /**
 * Sucht das erste passende Element im angegebenen DOM-Bereich.
 *
 * @param {string} selector - CSS-Selektor.
 * @param {ParentNode} root - Suchbereich (standardmäßig document).
 * @returns {Element|null} Gefundenes Element oder null.
 */
  const $ = (selector, root = document) => {
    return root.querySelector(selector);
  };
export /**
 * Ermittelt alle passenden DOM-Elemente als Array.
 *
 * @param {string} selector - CSS-Selektor.
 * @param {ParentNode} root - Suchbereich (standardmäßig document).
 * @returns {Element[]} Passende Elemente.
 */
  const $$ = (selector, root = document) => {
    return [...root.querySelectorAll(selector)];
  };

/**
 * Liest einen JSON-Wert aus dem optionalen Demo-Speicher.
 *
 * @param {string} key - Schlüssel im lokalen Speicher.
 * @returns {*} Wert oder null bei fehlendem beziehungsweise gesperrtem Speicher.
 */
export function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

/**
 * Speichert einen JSON-Wert, ohne die Demo bei gesperrtem Storage zu unterbrechen.
 *
 * @param {string} key - Schlüssel im lokalen Speicher.
 * @param {*} value - Zu speichernder Wert.
 * @returns {void} Kein Rückgabewert.
 */
export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { }
}

/**
 * Erzeugt DOM-Elemente mit sicherem Textinhalt statt HTML-Injektion.
 *
 * @param {string} tag - HTML-Tag.
 * @param {string} className - Optionale CSS-Klasse.
 * @param {*} text - Optionaler Textinhalt.
 * @returns {HTMLElement} Erzeugtes Element.
 */
export function element(tag, className, text) {
  // Aktuell bearbeitetes DOM-Element.
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
