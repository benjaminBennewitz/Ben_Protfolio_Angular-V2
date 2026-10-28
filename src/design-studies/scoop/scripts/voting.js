/** @file voting.js — Gekapselter Teilbereich der SCOOP!-Studie. */

import { $, $$, readStorage, writeStorage } from './dom.js';

/**
 * Registriert das Voting und stellt eine gespeicherte gültige Stimme wieder her.
 * @returns {void} Kein Rückgabewert.
 */
export function initVoting() {

  const voteKey = 'scoop-demo-vote-v1'; // Schlüssel der browserlokalen Geschmacksabstimmung.

  // Erlaubte Voting-Kennungen mit Anzeigenamen.
  const voteNames = {
    blaubeere: 'Blaubeere',
    caramel: 'Salted Caramel',
    schoko: 'Schoko',
  };

  /**
   * Zeigt eine zuvor gültig gespeicherte Geschmacksabstimmung an.
   *
   * @param {string} value - Kennung der gewählten Sorte.
   * @returns {void} Kein Rückgabewert.
   */
  function displayVote(value) {
    if (!Object.hasOwn(voteNames, value)) return;
    $(`input[value="${value}"]`, $('#vote-form')).checked = true;
    $('#vote-result').textContent =
      `Deine Stimme: ${voteNames[value]}. Nur in diesem Browser gespeichert; keine echte Umfrage.`;
  }

  const voteDialog = $('#vote-dialog'); // Ergebnisdialog der Geschmacksabstimmung.
  let voteTrigger = null;               // Voting-Auslöser für die Fokus-Rückgabe.

  $('#vote-form').addEventListener(
    'submit',

    /**
     * Verarbeitet das Ereignis „submit“ für diese Interaktion.
     * @param {Event} event - Eingabewert des Callbacks.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      event.preventDefault();

      // Aktuell gewählte Voting-Option.
      const checked = $('input:checked', event.currentTarget);

      if (!checked) return;
      writeStorage(voteKey, checked.value);
      displayVote(checked.value);
      if (voteDialog.showModal && !voteDialog.open) {
        voteTrigger = $('button[type="submit"]', event.currentTarget);
        document.body.classList.add('modal-open');
        voteDialog.showModal();
        $('#close-vote').focus();
      }
    },
  );
  ['#close-vote', '#vote-done'].forEach(

    /**
     * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
     * @param {unknown} selector - Eingabewert des Callbacks.
     * @returns {unknown} Ergebnis der Verarbeitung.
     */
    selector => {
      return $(selector).addEventListener(
        'click',

        /**
         * Verarbeitet das Ereignis „click“ für diese Interaktion.
         * @returns {unknown} Ergebnis der Verarbeitung.
         */
        () => {
          return voteDialog.close();
        },
      );
    },
  );
  voteDialog.addEventListener(
    'close',

    /**
     * Verarbeitet das Ereignis „close“ für diese Interaktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      document.body.classList.remove('modal-open');
      voteTrigger?.focus({
        preventScroll: true,
      });
    },
  );
  voteDialog.addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für diese Interaktion.
     * @param {Event} event - Eingabewert des Callbacks.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (event.target === voteDialog) {
        // Dialogrechteck zur Erkennung von Backdrop-Klicks.
        const r = voteDialog.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          voteDialog.close();
      }
    },
  );
  displayVote(readStorage(voteKey));
}
