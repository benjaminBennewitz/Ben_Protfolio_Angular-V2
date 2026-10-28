/** @file archive.js — Gekapselter Bereich der CTRL//ROOM-Studie. */

import { records } from './records.js';

/**
 * Kapselt Archivfilter, Textsuche, Datensatzdarstellung und Detaildialog.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createArchive({
  select,
  selectAll,
  audio,
  motionPreference,
  dialog,
  search,
  archiveBody,
  results,
  togglePlayback,
}) {

  let activeFilter = 'all';  // Aktuell ausgewählte Archivkategorie.
  let dialogTrigger = null;  // Auslöser zur Fokus-Rückgabe nach Dialogschluss.

  /**
   * Erstellt die beschriftete Detailschaltfläche einer Archivzeile.
   * @param {object} record - Lokaler Demo-Datensatz mit stabiler Kennung.
   * @returns {HTMLTableCellElement} Ergebnis der beschriebenen Operation.
   */
  function createRecordAction(record) {

    const actionCell = document.createElement('td');  // Tabellenzelle für die Datensatzaktion.
    const action = document.createElement('button');  // Detailschaltfläche der aktuellen Archivzeile.

    action.className = 'record-button';
    action.dataset.record = record.id;
    action.setAttribute('aria-label', `Explore ${record.title}`);
    action.textContent = '↗';
    actionCell.append(action);
    return actionCell;
  }

  /**
   * Erstellt eine Archivzeile ausschließlich aus sicheren Textknoten.
   * @param {object} record - Lokaler Demo-Datensatz mit stabiler Kennung.
   * @returns {HTMLTableRowElement} Ergebnis der beschriebenen Operation.
   */
  function createRecordRow(record) {

    const row = document.createElement('tr');       // Aktuell aufgebaute Archivzeile.
    const typeCell = document.createElement('td');  // Tabellenzelle für die Datensatzkategorie.
    const tag = document.createElement('span');     // Sicher beschriftete Kategorie-Markierung der Archivzeile.

    tag.className = 'type-tag';
    tag.dataset.type = record.type;
    tag.textContent = record.type.toUpperCase();
    typeCell.append(tag);
    row.append(typeCell);
    [
      record.title,
      record.creator,
      record.location,
      record.date.split('-').reverse().join('.'),
    ].forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {string} value - Ganzzahliger Zeitwert beziehungsweise Textinhalt einer Archivzelle.
       * @returns {void} Kein Rückgabewert.
       */
      value => {

        const cell = document.createElement('td');  // Sicher mit Text befüllte Archivzelle.

        cell.textContent = value;
        row.append(cell);
      },
    );

    const actionCell = createRecordAction(record);  // Tabellenzelle für die Datensatzaktion.

    row.append(actionCell);
    return row;
  }

  /**
   * Erstellt eine verständlich beschriftete Leerzustandszeile des Archivs.
   * @returns {HTMLTableRowElement} Ergebnis der beschriebenen Operation.
   */
  function createEmptyRow() {

    const row = document.createElement('tr');   // Aktuell aufgebaute Archivzeile.
    const cell = document.createElement('td');  // Sicher mit Text befüllte Archivzelle.

    cell.colSpan = 6;
    cell.className = 'empty-state';
    cell.textContent = 'NO SIGNAL FOUND. TRY ANOTHER SEARCH OR FILTER.';
    row.append(cell);
    return row;
  }

  /**
   * Filtert die lokalen Datensätze und aktualisiert Zeilen und Ergebnisanzeige.
   * @returns {void} Kein Rückgabewert.
   */
  function renderArchive() {

    const term = search.value.trim().toLocaleLowerCase();  // Getrimmter und normalisierter Suchtext.
    const matching = records.filter(

      /**
       * Synchronisiert die Seitendarstellung mit dem aktuellen Seitenzustand.
       * @param {object} record - Lokaler Demo-Datensatz mit stabiler Kennung.
       * @returns {unknown} Ergebnis der beschriebenen Operation.
       */
      record =>
        (activeFilter === 'all' || record.type === activeFilter) &&
        `${record.title} ${record.creator} ${record.location} ${record.type} ${record.date}`
          .toLocaleLowerCase()
          .includes(term),
    );                                                     // Nach Kategorie und Suchbegriff gefilterte Datensätze.

    archiveBody.replaceChildren();

    const fragment = document.createDocumentFragment();    // Gemeinsam eingesetzte neue Archivzeilen.

    matching.forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {object} record - Lokaler Demo-Datensatz mit stabiler Kennung.
       * @returns {void} Kein Rückgabewert.
       */
      record => {
        fragment.append(createRecordRow(record));
      },
    );
    if (!matching.length) {
      fragment.append(createEmptyRow());
    }
    archiveBody.append(fragment);
    results.textContent = `${String(matching.length).padStart(2, '0')} OF ${records.length} RECORDS / ${activeFilter.toUpperCase()} / DEMO COLLECTION`;
  }

  /**
   * Normalisiert den Archivfilter und setzt bei Bedarf den Suchtext zurück.
   * @param {string} filter - Gewünschte Archivkategorie.
   * @param {boolean} [resetSearch] - Suchtext beim Wechsel der Kategorie zurücksetzen.
   * @returns {void} Kein Rückgabewert.
   */
  function setFilter(filter, resetSearch = false) {

    const allowedFilters = ['all', 'music', 'visuals', 'people', 'places', 'events'];  // Bekannte und erlaubte Archivkategorien.

    activeFilter = allowedFilters.includes(filter) ? filter : 'all';
    if (resetSearch) search.value = '';
    selectAll('[data-filter]').forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {HTMLElement} button - Aktuell registrierte oder aktualisierte Schaltfläche.
       * @returns {unknown} Ergebnis der beschriebenen Operation.
       */
      button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)),
    );
    renderArchive();
  }

  /**
   * Öffnet den beschrifteten Demo-Datensatz und registriert gegebenenfalls das Empfangs-Achievement.
   * @param {object} record - Lokaler Demo-Datensatz mit stabiler Kennung.
   * @param {HTMLElement} trigger - Betätigte Detailschaltfläche oder Dialogauslöser.
   * @returns {void} Kein Rückgabewert.
   */
  function openRecord(record, trigger) {
    if (!record || !dialog.showModal) return;
    dialogTrigger = trigger;
    select('#dialog-type').textContent = `${record.id} / ${record.type.toUpperCase()}`;
    select('#dialog-title').textContent = record.title;
    select('#dialog-meta').textContent = `${record.creator} / ${record.location} / ${record.date}`;

    const description = select('#dialog-description');  // Container der Absatztexte im Detaildialog.

    description.replaceChildren();
    record.description.forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {string} text - Anzuzeigender Status- oder Beschreibungstext.
       * @returns {void} Kein Rückgabewert.
       */
      text => {

        const paragraph = document.createElement('p');  // Sicher mit Text befüllter Absatz des Detaildialogs.

        paragraph.textContent = text;
        description.append(paragraph);
      },
    );
    select('#dialog-play').hidden = !record.playable;
    document.body.classList.add('dialog-open');
    dialog.showModal();
    if (!audio.paused && !audio.ended && audio.readyState >= 2)
      document.dispatchEvent(
        new CustomEvent('bp:study-achievement', {
          detail: 'study-ctrl-reception',
        }),
      );
    select('.dialog-close', dialog).focus();
  }
  selectAll('[data-filter]').forEach(

    /**
     * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
     * @param {HTMLElement} button - Aktuell registrierte oder aktualisierte Schaltfläche.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    button =>
      button.addEventListener(
        'click',

        /**
         * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
         * @returns {unknown} Ergebnis der beschriebenen Operation.
         */
        () => setFilter(button.dataset.filter),
      ),
  );
  selectAll('[data-filter-link]').forEach(

    /**
     * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
     * @param {HTMLElement} link - Aktueller Navigations- oder Filterverweis.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    link =>
      link.addEventListener(
        'click',

        /**
         * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
         * @returns {unknown} Ergebnis der beschriebenen Operation.
         */
        () => setFilter(link.dataset.filterLink, true),
      ),
  );
  search.addEventListener('input', renderArchive);
  archiveBody.addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
     * @param {Event} event - Eingabewert „event“.
     * @returns {void} Kein Rückgabewert.
     */
    event => {

      const trigger = event.target.closest('[data-record]');  // Betätigte Detailschaltfläche oder Dialogauslöser.

      if (trigger)
        openRecord(
          records.find(

            /**
             * Synchronisiert die Seitendarstellung mit dem aktuellen Seitenzustand.
             * @param {object} record - Lokaler Demo-Datensatz mit stabiler Kennung.
             * @returns {unknown} Ergebnis der beschriebenen Operation.
             */
            record => record.id === trigger.dataset.record,
          ),
          trigger,
        );
    },
  );
  select('#interview-button').addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
     * @param {Event} event - Eingabewert „event“.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    event =>
      openRecord(
        records.find(

          /**
           * Synchronisiert die Seitendarstellung mit dem aktuellen Seitenzustand.
           * @param {object} record - Lokaler Demo-Datensatz mit stabiler Kennung.
           * @returns {unknown} Ergebnis der beschriebenen Operation.
           */
          record => record.id === 'CR-003',
        ),
        event.currentTarget,
      ),
  );
  select('.dialog-close', dialog).addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    () => dialog.close(),
  );
  dialog.addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
     * @param {Event} event - Eingabewert „event“.
     * @returns {void} Kein Rückgabewert.
     */
    event => {

      const rect = dialog.getBoundingClientRect();  // Aktuelles Rechteck des betrachteten Canvas-, Hero- oder Dialogbereichs.

      if (
        event.target === dialog &&
        (event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom)
      )
        dialog.close();
    },
  );
  dialog.addEventListener(
    'close',

    /**
     * Verarbeitet das Ereignis „close“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      document.body.classList.remove('dialog-open');
      dialogTrigger?.focus();
    },
  );
  select('#dialog-play').addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      dialog.close();
      if (audio.paused) togglePlayback();
      select('#artist').scrollIntoView({
        behavior: motionPreference.matches ? 'instant' : 'smooth',
      });
    },
  );
  return {
    renderArchive,
  };
}
