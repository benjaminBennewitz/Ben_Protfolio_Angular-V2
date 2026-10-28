/** @file scroll-path.js — Gekapselter Teilbereich der SCOOP!-Studie. */

/**
 * Erstellt die Steuerung für Geometrie und Fortschritt des Scroll-Pfads.
 * @param {object} context - Explizite Abhängigkeiten dieses Bereichs.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createScrollPath({ $, $$, motion, requestFrame }) {

  let pathReady = false;      // Die Hero-Sequenz hat den Scroll-Pfad freigegeben.
  let pathCurrentLength = 0;  // Aktuell gezeichnete Bogenlänge.
  let pathTargetLength = 0;   // Aus der Scrollposition bestimmte Zielbogenlänge.
  let pathArcLength = 0;      // Tatsächliche Gesamtlänge des Scroll-Pfads.
  let pathSamples = [];       // Abtastpunkte für Höhe und Bogenlänge.

  /**
   * Tastet den Pfad ab und ergänzt beide Seiten des gezeichneten Bands.
   * @param {SVGPathElement} reveal - SVG-Kontur für die animierte Pfadfreigabe.
   * @param {boolean} mobile - Der Pfad verwendet die schmale Bildschirmvariante.
   * @param {number} length - Gemessene Gesamtlänge des SVG-Pfads.
   * @param {number} count - Anzahl der Abtastschritte des SVG-Pfads.
   * @param {number} i - Laufender Index der aktuellen Berechnung.
   * @param {Array<object>} points - Stützpunkte für die aktuelle SVG-Geometrie.
   * @returns {void} Kein Rückgabewert.
   */
  function sampleRibbonPoint(reveal, mobile, length, count, i, points) {
    // Abstand des Abtastpunkts vom Pfadanfang.
    const distance = (length * i) / count;
    // Abgetastete Mitte des SVG-Pfads.
    const center = reveal.getPointAtLength(distance);
    pathSamples.push({
      y: center.y,
      distance,
    });

    const before = reveal.getPointAtLength(Math.max(0, distance - 1));      // Vorheriger Abtastpunkt.
    const after = reveal.getPointAtLength(Math.min(length, distance + 1));  // Nachfolgender Abtastpunkt.
    const dx = after.x - before.x;                                          // Horizontaler Richtungsvektor.
    const dy = after.y - before.y;                                          // Vertikaler Richtungsvektor.
    const magnitude = Math.hypot(dx, dy) || 1;                              // Länge des Richtungsvektors zur Normalisierung.

    // Lokal variierende halbe Breite des Pfadbands.
    const radius =
      (mobile ? 3.8 : 6) *
      (1 + 0.32 * Math.sin((i / count) * Math.PI * 12) + 0.15 * Math.sin((i / count) * Math.PI * 29));
    points.push({
      left: [center.x - (dy / magnitude) * radius, center.y + (dx / magnitude) * radius],
      right: [center.x + (dy / magnitude) * radius, center.y - (dx / magnitude) * radius],
    });
  }

  /**
   * Erzeugt die geschlossene Bandkontur und aktualisiert die Scroll-Abtastpunkte.
   * @param {SVGPathElement} reveal - SVG-Kontur für die animierte Pfadfreigabe.
   * @param {boolean} mobile - Der Pfad verwendet die schmale Bildschirmvariante.
   * @returns {string} Ergebnis der beschriebenen Operation.
   */
  function createRibbon(reveal, mobile) {
    
    const length = reveal.getTotalLength();               // Gemessene Gesamtlänge des SVG-Pfads.
    const points = [];                                    // Stützpunkte für die aktuelle SVG-Geometrie.
    const count = Math.max(180, Math.ceil(length / 12));  // Anzahl der Abtastschritte des SVG-Pfads.

    pathArcLength = length;
    pathSamples = [];
    for (let i = 0; i <= count; i++) {
      sampleRibbonPoint(reveal, mobile, length, count, i, points);
    }

    // Geschlossener Umriss aus beiden Pfadseiten.
    const outline = [
      ...points.map(

        /**
         * Berechnet den Zielwert für den aktuellen Listeneintrag.
         * @param {unknown} point - Berechneter Punkt im lokalen Koordinatensystem.
         * @returns {unknown} Ergebnis der Verarbeitung.
         */
        point => {
          return point.left;
        },
      ),
      ...points.reverse().map(

        /**
         * Berechnet den Zielwert für den aktuellen Listeneintrag.
         * @param {unknown} point - Berechneter Punkt im lokalen Koordinatensystem.
         * @returns {unknown} Ergebnis der Verarbeitung.
         */
        point => {
          return point.right;
        },
      ),
    ];

    // Geschlossene SVG-Kontur des gezeichneten Bands.
    const ribbon =
      outline
        .map(

          /**
           * Berechnet den Zielwert für den aktuellen Listeneintrag.
           * @param {unknown} point - Berechneter Punkt im lokalen Koordinatensystem.
           * @param {number} i - Laufender Index der aktuellen Berechnung.
           * @returns {unknown} Ergebnis der Verarbeitung.
           */
          (point, i) => {
            return `${i ? 'L' : 'M'}${point[0].toFixed(2)},${point[1].toFixed(2)}`;
          },
        )
        .join(' ') + ' Z';
    return ribbon;
  }

  /**
   * Berechnet den SVG-Pfad anhand der aktuellen Section-Abmessungen.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function layoutPath() {
    
    const region = $('#path-region');           // DOM-Bereich beziehungsweise Rechteck des Scroll-Pfads.
    const svg = $('#scroll-path');              // Aktuell eingebundene oder bearbeitete SVG-Instanz.
    const width = region.clientWidth;           // Breite des Pfadbereichs.
    const height = region.offsetHeight;         // Höhe des Pfadbereichs.
    const heroEnd = $('#sorten').offsetTop;     // Beginn des Sortenbereichs als Pfadanker.
    const productsEnd = $('#mix').offsetTop;    // Beginn des Mix-Bereichs als Pfadanker.
    const mixEnd = $('#idee').offsetTop;        // Beginn des Ideenbereichs als Pfadanker.
    const storyEnd = $('#vote').offsetTop;      // Beginn des Voting-Bereichs als Pfadanker.
    const mobile = width <= 600;                // Der Pfad verwendet die schmale Bildschirmvariante.

    // Aufgebaute SVG-Pfaddaten.
    const d = mobile
      ? `M${width * 0.8},0 C${width + 40},${heroEnd * 0.4} ${width - 10},${heroEnd * 0.6} ${width - 10},${heroEnd} S8,${heroEnd + 60} 8,${(heroEnd + productsEnd) / 2} S${width - 8},${productsEnd - 100} ${width - 8},${productsEnd + 20} S8,${mixEnd - 50} 8,${mixEnd + 30} S${width - 8},${storyEnd - 60} ${width - 8},${storyEnd + 25}`
      : `M${width * 0.55},-30 C${width * 0.7},${heroEnd * 0.3} ${width * 1.1},${heroEnd * 0.4} ${width * 0.94},${heroEnd * 0.7} S${width * 0.1},${heroEnd - 30} ${width * 0.03},${heroEnd + 120} S${width * 0.8},${productsEnd - 80} ${width * 0.97},${productsEnd + 20} S${width * 0.6},${mixEnd - 70} ${width * 0.25},${mixEnd + 40} S${width * 0.05},${storyEnd - 40} ${width * 0.02},${storyEnd + 20}`;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // SVG-Kontur für die animierte Pfadfreigabe.
    const reveal = $('.path-reveal');
    reveal.setAttribute('d', d);
    reveal.removeAttribute('pathLength');

    // SVG-Maske zur Freigabe des Scroll-Pfads.
    const mask = $('#path-reveal-mask');
    mask.setAttribute('width', width);
    mask.setAttribute('height', height);

    // Geschlossene SVG-Kontur des gezeichneten Bands.
    const ribbon = createRibbon(reveal, mobile);
    $$('.path-guide, .path-color').forEach(

      /**
       * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
       * @param {unknown} path - Aktuell bearbeitete SVG-Pfadkontur.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      path => {
        return path.setAttribute('d', ribbon);
      },
    );
    updatePath();
  }

  /**
   * Ermittelt die sichtbare Bogenlänge aus den abgetasteten SVG-Punkten.
   *
   * @param {number} visibleY - Aktuelle sichtbare Höhe im Pfadkoordinatensystem.
   * @returns {number} Sichtbare Bogenlänge.
   */
  function revealedPathLength(visibleY) {
    if (!pathSamples.length || visibleY <= pathSamples[0].y) return 0;
    for (let i = 1; i < pathSamples.length; i++) {
      
      const after = pathSamples[i];       // Nachfolgender Abtastpunkt.
      const before = pathSamples[i - 1];  // Vorheriger Abtastpunkt.

      if (after.y > visibleY) {
        // Normierter Anteil zwischen zwei Abtastpunkten.
        const ratio = Math.max(0, Math.min(1, (visibleY - before.y) / (after.y - before.y || 1)));
        return before.distance + (after.distance - before.distance) * ratio;
      }
    }
    return pathArcLength;
  }

  /**
   * Aktualisiert den Ziel-Fortschritt des Scroll-Pfads.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function updatePath() {
    
    const region = $('#path-region').getBoundingClientRect(); // DOM-Bereich beziehungsweise Rechteck des Scroll-Pfads.
    const visibleY = innerHeight * 0.76 - region.top;         // Sichtbare Höhe im lokalen Pfadkoordinatensystem.

    pathTargetLength = motion.matches ? pathArcLength : pathReady ? revealedPathLength(visibleY) : 0;
    if (motion.matches) pathCurrentLength = pathTargetLength;
    pathCurrentLength = Math.min(pathCurrentLength, pathArcLength);

    // Aktuell bearbeitete SVG-Pfadkontur.
    const path = $('.path-reveal');
    path.style.strokeDasharray = `${pathArcLength} ${pathArcLength}`;
    path.style.strokeDashoffset = String(Math.max(0, pathArcLength - pathCurrentLength));
    if (Math.abs(pathTargetLength - pathCurrentLength) > 0.1) requestFrame();
  }

  /**
   * Nähert die gezeichnete Pfadlänge weich dem Zielwert an.
   *
   * @returns {boolean} Ob der Pfad weiter animiert werden muss.
   */
  function advancePath() {
    
    const difference = pathTargetLength - pathCurrentLength;  // Abstand zwischen Ziel und gezeichneter Pfadlänge.
    const moving = Math.abs(difference) > 0.1;                // Die aktuelle Bewegung ist noch nicht abgeschlossen.

    pathCurrentLength = moving ? pathCurrentLength + difference * 0.12 : pathTargetLength;
    $('.path-reveal').style.strokeDashoffset = String(Math.max(0, pathArcLength - pathCurrentLength));
    return moving;
  }
  
  // ID des vorgemerkten Scroll-Updates.
  let scrollFrame = 0;
  window.addEventListener(
    'scroll',

    /**
     * Verarbeitet das Ereignis „scroll“ für diese Interaktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      if (!scrollFrame)
        scrollFrame = requestAnimationFrame(

          /**
           * Führt den zeit- oder zustandsabhängigen Callback aus.
           * @returns {void} Kein Rückgabewert.
           */
          () => {
            scrollFrame = 0;
            updatePath();
            requestFrame();
          },
        );
    },
    {
      passive: true,
    },
  );
  if ('ResizeObserver' in window) new ResizeObserver(layoutPath).observe($('#path-region'));
  else window.addEventListener('resize', layoutPath);
  document.fonts?.ready.then(layoutPath);

  /**
   * Gibt den Scroll-Pfad nach dem Hero frei oder setzt seine sichtbare Länge zurück.
   * @param {boolean} ready - Freigabezustand nach der Hero-Sequenz.
   * @returns {void} Kein Rückgabewert.
   */
  function setReady(ready) {
    pathReady = ready;
    if (!ready) pathCurrentLength = 0;
  }
  return {
    layoutPath,
    updatePath,
    advancePath,
    setReady,
  };
}
