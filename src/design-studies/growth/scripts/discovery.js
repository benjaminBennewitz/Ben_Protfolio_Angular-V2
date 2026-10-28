/** @file discovery.js — Kapselt Marker, Verdeckungsprüfung und informative Pflanzen-Popover. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Kapselt Marker, Verdeckungsprüfung und informative Pflanzen-Popover.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createDiscovery({ world, camera }) {

  const speciesInfo = {
    bromeliad: {
      label: 'KAPITEL 03 / BROMELIEN',
      title: 'Ein Teich zwischen Ästen.',
      type: 'EPIPHYT',
      role: 'WASSERSPEICHER',
      copy: 'Epiphytische Bromelien sammeln Regenwasser in ihren Blattrosetten. So entstehen kleine Wasserreservoire, in denen winzige Ökosysteme leben können.',
    },
    leaves: {
      label: 'KAPITEL 02 / AUFSITZER',
      title: 'Leben über dem Boden.',
      type: 'EPIPHYT',
      role: 'LICHTSUCHER',
      copy: 'Aufsitzerpflanzen nutzen den Baum als Lebensraum, ohne ihm direkt Nährstoffe zu entziehen. So erreichen sie mehr Licht als am Boden.',
    },
    fungi: {
      label: 'KAPITEL 01 / PILZE',
      title: 'Aus Ende wird Anfang.',
      type: 'FUNGI',
      role: 'ZERSETZER',
      copy: 'Baumpilze und andere Zersetzer bauen organisches Material ab und führen Nährstoffe in den Kreislauf des Waldbodens zurück.',
    },
    symbiosis: {
      label: 'KAPITEL 04 / VERFLECHTUNGEN',
      title: 'Eine Stadt aus Lebensformen.',
      type: 'GEMEINSCHAFT',
      role: 'ZUSAMMENLEBEN',
      copy: 'Moose, Flechten, Pilze und Aufsitzerpflanzen nutzen unterschiedliche Nischen am Baum. Gemeinsam bilden sie ein komplexes Mosaik aus Lebensräumen.',
    },
    air: {
      label: 'KAPITEL 07 / ATMOSPHÄRE',
      title: 'Die Krone atmet mit.',
      type: 'ÖKOSYSTEMLEISTUNG',
      role: 'LUFTREINIGUNG',
      copy: 'Die Krone bindet Kohlenstoff, gibt Sauerstoff ab und beeinflusst durch Verdunstung das lokale Klima. Ein einzelner Baum wirkt weit über seine Äste hinaus.',
    },
  };                                                                // Redaktionelle Beschreibungen der entdeckbaren Lebensformen.
  const markerRoot = document.querySelector('#discovery-markers');  // DOM-Container der Discovery-Schaltflächen.
  const popup = document.querySelector('#discovery-popover');       // Informations-Popover des ausgewählten Discovery-Punkts.
  const popupLine = document.querySelector('#discovery-line');      // Verbindungslinie zwischen Marker und Popover.
  let selectedMarker = null;                                        // Aktuell geöffnetes Discovery-Exemplar.
  const discoveredPoints = new Set();                               // Bereits aufgerufene Discovery-Punkte.
  const markerButtons = world.infoPoints.map(

    /**
     * Berechnet den Zielwert für den aktuellen Geometrie- oder Dateneintrag.
     * @param {object} point - Aktueller räumlicher Anker- oder Abtastpunkt.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    point => {

      const button = document.createElement('button');  // Schaltfläche des aktuellen Discovery-Punkts.

      button.type = 'button';
      button.className = 'discovery-point';
      button.dataset.species = point.type;
      button.setAttribute('aria-label', point.label + ' entdecken');
      button.title = point.label;
      button.innerHTML = '<span aria-hidden="true"></span>';
      markerRoot.append(button);
      button.addEventListener(
        'click',

        /**
         * Verarbeitet das Ereignis „click“ für die zugehörige Interaktion.
         * @returns {unknown} Ergebnis der beschriebenen Operation.
         */
        () =>
          toggleDiscovery({
            point,
            button,
          }),
      );
      return {
        point,
        button,
      };
    },
  );                                                                // Discovery-Punkte mit ihren zugehörigen Schaltflächen.
  const markerRay = new THREE.Raycaster();                          // Wiederverwendeter Strahl für Verdeckungsprüfungen.
  const markerProjected = new THREE.Vector3();                      // In den Bildschirmraum projizierte Markerposition.
  const markerVector = new THREE.Vector3();                         // Wiederverwendeter Richtungsvektor zwischen Marker und Kamera.
  const markerOccluders = [...(world.layers.trunk || []), ...(world.layers.buttress || [])].filter(

    /**
     * Prüft, ob der aktuelle Eintrag in der Auswahl verbleibt.
     * @param {object} object - Aktuell registriertes oder ausgewähltes Szeneobjekt.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    object => object.isMesh && !object.isInstancedMesh,
  );                                                                // Nicht instanziierte Stamm- und Brettwurzelmeshes zur Verdeckungsprüfung.

  /**
   * Schließt den Discovery-Popover und seine Verbindungslinie.
   * @returns {void} Kein Rückgabewert.
   */
  function closeDiscovery() {
    selectedMarker = null;
    popup.hidden = true;
    popupLine.hidden = true;
  }

  /**
   * Öffnet oder schließt einen Pflanzen-Popover und registriert die Entdeckung.
   * @param {object} entry - Discovery-Punkt mit zugehöriger Schaltfläche.
   * @returns {void} Kein Rückgabewert.
   */
  function toggleDiscovery(entry) {
    if (selectedMarker?.point === entry.point) {
      closeDiscovery();
      return;
    }
    selectedMarker = entry;
    discoveredPoints.add(entry.point);
    if (discoveredPoints.size === markerButtons.length)
      document.dispatchEvent(
        new CustomEvent('bp:study-achievement', {
          detail: 'study-growth-discovery',
        }),
      );

    const data = speciesInfo[entry.point.type];  // Anzeigetexte der ausgewählten Lebensform.

    popup.querySelector('[data-bubble-label]').textContent = data.label;
    popup.querySelector('[data-bubble-title]').textContent = data.title;
    popup.querySelector('[data-bubble-copy]').textContent = data.copy;
    popup.hidden = false;
    popupLine.hidden = false;
    positionDiscoveryBubble(entry.button);
  }

  /**
   * Positioniert Popover und Verbindungslinie innerhalb des sichtbaren Viewports.
   * @param {object} button - Schaltfläche des aktuellen Discovery-Punkts.
   * @returns {void} Kein Rückgabewert.
   */
  function positionDiscoveryBubble(button) {

    const x = (parseFloat(button.style.left) * innerWidth) / 100;                                  // Horizontale X-Koordinate des aktuellen Punkts.
    const y = (parseFloat(button.style.top) * innerHeight) / 100;                                  // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
    const bubbleWidth = Math.min(330, innerWidth - 24);                                            // Auf den Viewport begrenzte Popover-Breite.
    const bubbleHeight = 230;                                                                      // Für die Positionierung angesetzte Popover-Höhe.
    const side = selectedMarker?.point?.bubbleSide || (x < innerWidth * 0.56 ? 'right' : 'left');  // Horizontale Ausrichtung des Popovers zum Marker.
    const vertical =
      selectedMarker?.point?.bubbleVertical || (y < innerHeight * 0.45 ? 'down' : 'up');           // Vertikale Ausrichtung des Popovers zum Marker.
    const desiredX = x + (side === 'right' ? 64 : -bubbleWidth - 64);                              // Unbegrenzte horizontale Zielposition des Popovers.
    const desiredY = y + (vertical === 'down' ? 36 : -bubbleHeight + 22);                          // Unbegrenzte vertikale Zielposition des Popovers.
    const px = Math.max(12, Math.min(innerWidth - bubbleWidth - 12, desiredX));                    // An den Viewport angepasste horizontale Popover-Position.
    const py = Math.max(80, Math.min(innerHeight - bubbleHeight - 18, desiredY));                  // An den Viewport angepasste vertikale Popover-Position.

    popup.style.left = px + 'px';
    popup.style.top = py + 'px';

    const bx = side === 'right' ? px : px + bubbleWidth;                                           // Horizontaler Anschluss der Verbindungslinie am Popover.
    const by = py + (vertical === 'down' ? 28 : bubbleHeight - 38);                                // Vertikaler Anschluss der Verbindungslinie am Popover.
    const length = Math.hypot(bx - x, by - y);                                                     // Länge des aktuellen Vektors oder Geometrieabschnitts.

    popupLine.style.left = x + 'px';
    popupLine.style.top = y + 'px';
    popupLine.style.width = length + 'px';
    popupLine.style.transform = `rotate(${Math.atan2(by - y, bx - x)}rad)`;
  }

  /**
   * Aktualisiert Sichtbarkeit und Bildschirmposition eines Discovery-Punkts.
   * @param {object} entry - Discovery-Punkt mit zugehöriger Schaltfläche.
   * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
   * @returns {void} Kein Rückgabewert.
   */
  function updateDiscoveryMarker(entry, height) {

    const { point, button } = entry;                                          // Benötigte Werte und Aktionen dieses Teilbereichs.
    const active = height >= point.chapterMin && height <= point.chapterMax;  // Aktives Kapitel beziehungsweise freigegebener Höhenbereich.

    if (point.screenAnchor) {
      button.hidden = !active;
      if (active) {
        button.style.left = point.screenAnchor.x * 100 + '%';
        button.style.top = point.screenAnchor.y * 100 + '%';
      } else if (selectedMarker?.point === point) closeDiscovery();
      return;
    }
    markerProjected.copy(point.position).project(camera);

    const toCamera = markerVector.copy(camera.position).sub(point.position);  // Richtungsvektor vom Discovery-Punkt zur Kamera.
    const front = point.normal.dot(toCamera) > 0.15;                          // Der Discovery-Punkt zeigt zur Kamera.
    let visible =
      active &&
      front &&
      markerProjected.z > -1 &&
      markerProjected.z < 1 &&
      Math.abs(markerProjected.x) < 0.89 &&
      Math.abs(markerProjected.y) < 0.86;                                     // Der Marker liegt sichtbar im freigegebenen Höhenbereich.

    if (visible) {

      const direction = point.position.clone().sub(camera.position);  // Richtungsvektor zwischen zwei räumlichen Positionen.
      const distance = direction.length();                            // Abstand zwischen den aktuellen räumlichen Positionen.

      markerRay.set(camera.position, direction.normalize());
      markerRay.far = Math.max(0, distance - 0.22);
      visible =
        point.skipOcclusion || markerRay.intersectObjects(markerOccluders, false).length === 0;
    }
    button.hidden = !visible;
    if (visible) {
      button.style.left = (markerProjected.x + 1) * 50 + '%';
      button.style.top = (1 - markerProjected.y) * 50 + '%';
    }
    if (!visible && selectedMarker?.point === point) closeDiscovery();
  }

  /**
   * Synchronisiert alle Discovery-Marker und den geöffneten Popover.
   * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
   * @returns {void} Kein Rückgabewert.
   */
  function updateDiscoveryMarkers(height) {
    for (const entry of markerButtons) {
      updateDiscoveryMarker(entry, height);
    }
    if (selectedMarker) positionDiscoveryBubble(selectedMarker.button);
  }
  document.querySelector('#discovery-close').addEventListener('click', closeDiscovery);
  document.addEventListener(
    'keydown',

    /**
     * Verarbeitet das Ereignis „keydown“ für die zugehörige Interaktion.
     * @param {object} event - Eingabewert „event“.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (event.key === 'Escape') closeDiscovery();
    },
  );
  return {
    update: updateDiscoveryMarkers,
  };
}
