/** @file artwork-mount.js — Gekapselter Teilbereich der SCOOP!-Studie. */

/**
 * Erstellt die SVG-Verwaltung mit eindeutigen IDs und einem gemeinsamen Figurenregister.
 * @param {object} context - Explizite Abhängigkeiten dieses Bereichs.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createArtworkMount({ $, $$, actors, visibilityObserver }) {

  let mountIndex = 0; // Fortlaufende Nummer für eindeutige SVG-Instanzen.

  /**
   * Entfernt ein zuvor beobachtetes SVG aus der Figurenverwaltung.
   *
   * @param {HTMLElement} host - Container der SVG-Grafik.
   * @returns {void} Kein Rückgabewert.
   */
  function unmountArtwork(host) {
    // Bisher eingebundene SVG-Instanz.
    const oldSvg = $('svg[data-character]', host);
    // Bisherige Figur des zu ersetzenden SVGs.
    const oldActor = [...actors].find(

      /**
       * Prüft die Kennung des gesuchten Eintrags.
       * @param {unknown} item - Registrierte SVG-Figur.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      item => {
        return item.svg === oldSvg;
      },
    );
    if (oldActor) {
      visibilityObserver?.unobserve(oldSvg);
      actors.delete(oldActor);
    }
  }

  /**
   * Vergibt eindeutige IDs und korrigiert interne SVG-Referenzen.
   *
   * @param {SVGElement} svg - Eingelesene SVG-Grafik.
   * @returns {void} Kein Rückgabewert.
   */
  function rewriteSvgIds(svg) {
    // Eindeutiges Präfix der aktuellen SVG-Instanz.
    const prefix = `scoop-${++mountIndex}-`;
    // Zuordnung alter SVG-IDs zu eindeutigen Instanz-IDs.
    const idMap = new Map();
    [svg, ...$$('[id]', svg)].forEach(

      /**
       * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
       * @param {unknown} node - Aktuell bearbeitetes DOM-Element.
       * @returns {void} Kein Rückgabewert.
       */
      node => {
        if (node.id) {
          // Ursprüngliche SVG-ID vor dem Präfix.
          const old = node.id;
          idMap.set(old, prefix + old);
          node.id = prefix + old;
        }
      },
    );
    [svg, ...$$('*', svg)].forEach(

      /**
       * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
       * @param {unknown} node - Aktuell bearbeitetes DOM-Element.
       * @returns {void} Kein Rückgabewert.
       */
      node => {
        for (const attr of [...node.attributes]) {
          // Aktuell umgeschriebener SVG-Attributwert.
          let value = attr.value.replace(
            /url\(#([^)]+)\)/g,

            /**
             * Führt den zeit- oder zustandsabhängigen Callback aus.
             * @param {unknown} _ - Eingabewert des Callbacks.
             * @param {unknown} id - Stabile Kennung der aktuellen Position oder Sorte.
             * @returns {unknown} Ergebnis der Verarbeitung.
             */
            (_, id) => {
              return `url(#${idMap.get(id) || id})`;
            },
          );
          if ((attr.name === 'href' || attr.name === 'xlink:href') && value.startsWith('#'))
            value = `#${idMap.get(value.slice(1)) || value.slice(1)}`;
          if (value !== attr.value) node.setAttribute(attr.name, value);
        }
      },
    );
  }

  /**
   * Erfasst Stützpunkte und ursprünglichen Handwinkel einer SVG-Armkontur.
   * @param {object} actor - Animierbarer Zustand einer SVG-Figur.
   * @param {object} path - Aktuell bearbeitete SVG-Pfadkontur.
   * @returns {void} Kein Rückgabewert.
   */
  function addArtworkArm(actor, path) {
    // Gemessene Gesamtlänge des SVG-Pfads.
    const length = path.getTotalLength();
    // Stützpunkte für die aktuelle SVG-Geometrie.
    const points = [0, 1 / 3, 2 / 3, 1].map(

      /**
       * Berechnet den Zielwert für den aktuellen Listeneintrag.
       * @param {unknown} t - Normierter Interpolationswert.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      t => {
        // Berechneter Punkt oder normierter Animationsfortschritt.
        const p = path.getPointAtLength(t * length);
        return {
          x: p.x,
          y: p.y,
        };
      },
    );
    // Zur Armkontur gehörendes Hand-Element.
    const hand = $('[data-hand]', path.parentElement);
    // Arm-Abtastpunkt unmittelbar vor der Hand.
    const nearEnd = path.getPointAtLength(length - 1);
    // Zielrechteck beziehungsweise letzter Armanker.
    const end = points[3];
    actor.arms.push({
      path,
      hand,
      points,
      phase: actor.arms.length * 2.4,
      angle: Math.atan2(end.y - nearEnd.y, end.x - nearEnd.x),
    });
  }

  /**
   * Erfasst Augen- und Armanker einer interaktiven SVG-Figur.
   *
   * @param {SVGElement} svg - Eingebundene SVG-Grafik.
   * @param {string} key - Grafikkennung.
   * @returns {object} Interaktiver Figuren-Zustand.
   */
  function createArtworkActor(svg, key) {
    // Animierbarer Zustand einer SVG-Figur.
    const actor = {
      svg,
      gazePhase: mountIndex * 0.65,
      visible: !visibilityObserver,
      eyes: $$('[data-eye]', svg).map(

        /**
         * Berechnet den Zielwert für den aktuellen Listeneintrag.
         * @param {unknown} eye - Augenanker mit beweglicher Pupille.
         * @returns {unknown} Ergebnis der Verarbeitung.
         */
        eye => {
          return {
            white: $('[data-eye-white]', eye),
            mover: $('[data-pupil]', eye),
            base: null,
            x: 0,
            y: 0,
          };
        },
      ),
      arms: [],
    };
    if (key === 'jochen-scoop') {
      $$('[data-arm]', svg).forEach(

        /**
         * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
         * @param {unknown} path - Aktuell bearbeitete SVG-Pfadkontur.
         * @returns {void} Kein Rückgabewert.
         */
        path => {
          addArtworkArm(actor, path);
        },
      );
    }
    return actor;
  }

  /**
   * Bindet eine SVG-Grafik als interaktives DOM-Element ein.
   *
   * @param {string} key - Schlüssel im SVG-Katalog.
   * @param {HTMLElement} host - Zielcontainer.
   * @returns {SVGElement|null} Eingebundenes SVG oder null bei unbekanntem Schlüssel.
   */
  function mountArtwork(key, host) {
    unmountArtwork(host);
    // Vertrauenswürdige SVG-Vorlage aus dem Artwork-Katalog.
    const text = window.SCOOP_ARTWORKS[key];
    if (!text) return null;
    // Aktuell eingebundene oder bearbeitete SVG-Instanz.
    const svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
    rewriteSvgIds(svg);
    svg.dataset.character = key;
    host.replaceChildren(svg);
    // Animierbarer Zustand einer SVG-Figur.
    const actor = createArtworkActor(svg, key);
    actors.add(actor);
    visibilityObserver?.observe(svg);
    return svg;
  }
  return {
    mountArtwork,
  };
}
