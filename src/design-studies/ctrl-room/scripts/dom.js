/** @file dom.js — Gekapselter Bereich der CTRL//ROOM-Studie. */

export /**
 * Sucht das erste passende Element innerhalb eines DOM-Bereichs.
 * @param {string} selector - CSS-Selektor für die DOM-Suche.
 * @param {HTMLElement} [parent] - DOM-Bereich, innerhalb dessen gesucht wird.
 * @returns {Element|null} Ergebnis der beschriebenen Operation.
 */
    const select = (selector, parent = document) => parent.querySelector(selector);
export /**
 * Liefert passende Elemente eines DOM-Bereichs als Array.
 * @param {string} selector - CSS-Selektor für die DOM-Suche.
 * @param {HTMLElement} [parent] - DOM-Bereich, innerhalb dessen gesucht wird.
 * @returns {Element[]} Ergebnis der beschriebenen Operation.
 */
    const selectAll = (selector, parent = document) => [...parent.querySelectorAll(selector)];
