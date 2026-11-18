/**
 * @file Sprache, Theme, Bildansicht und Interaktionen des Künstlerporträts.
 * @description Verbindet die statische Designstudie mit ihrem lokalen Ansichts- und Animationszustand.
 * @author Benjamin Bennewitz
 */

/**
 * @typedef {object} HoldGesture
 * @property {number} x Horizontale Startposition im Viewport.
 * @property {number} y Vertikale Startposition im Viewport.
 * @property {number} pointerId Kennung der auslösenden Mausinteraktion.
 * @property {number} timer Startzeitgeber für das Aufblasen.
 * @property {HTMLSpanElement | null} gum Laufende Blase bis zum Platzen oder Abbruch.
 */

const root = document.documentElement; // Gemeinsamer Bezug für Sprache, Theme und Motion-Klassen.
const languageButton = /** @type {HTMLButtonElement} */ (document.querySelector('#language'));
const themeButton = /** @type {HTMLButtonElement} */ (document.querySelector('#theme'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)'); // Aktuelle Bewegungsvorgabe des Browsers.

const viewer = /** @type {HTMLDialogElement} */ (document.querySelector('#image-viewer')); // Gemeinsamer Dialog der beiden Werke.
const viewerImage = /** @type {HTMLImageElement} */ (viewer.querySelector('img'));
const viewerTitle = /** @type {HTMLElement} */ (viewer.querySelector('#image-title'));
const galleryLinks = /** @type {NodeListOf<HTMLAnchorElement>} */ (document.querySelectorAll('a[data-gallery]'));

const sprayFigure = /** @type {HTMLElement} */ (document.querySelector('.feature-image')); // Bühne für das Mural.
const replay = /** @type {HTMLButtonElement} */ (document.querySelector('.spray-replay'));
const sprayLayer = /** @type {SVGSVGElement} */ (sprayFigure.querySelector('.spray-layer'));
const lastSprayStroke = /** @type {SVGPathElement} */ (sprayLayer.querySelector('.spray-stroke:last-child'));

/** Englische Entsprechungen der deutschen Begleittexte und Bedienbeschriftungen. */
const english = {
  skip: 'Skip to content',
  archive: '← Archive',
  back: 'Back to the archive ↗︎',
  dark: 'Dark',
  nav: 'Portrait',
  footerNav: 'Footer navigation',
  top: 'Back to top ↑',
  bio: 'Bio',
  work: 'Work',
  bioLead: '“I’m immortal. Monday can fuck off.”',
  bioText: 'PP is from Yokohama. She started out scribbling letters in self-published zines, then took them onto concrete and steel. She keeps asking who the city belongs to. Her answer: the people who live there. Even the ones who look too young, make too much noise and were never asked.',
  pieceText: 'Two cyan Ps lock together on white concrete. A black outline wraps around both. Pink hearts and a sliver of checkerboard break the symmetry.',
  medium: 'Spray paint on concrete',
  sprayReplay: 'Spray again ↻',
  trainHorn: 'TOOT TOOT!',
  trainCaption: '“NO GODS, NO BEDTIME” · Mural on a retired railway carriage.',
  cans: 'PP’s cans for fills, outlines and hits of hot pink.',
  maskTitle: 'Respirator',
  mask: 'The half-face respirator is a fixture in PP’s kit.',
  caps: 'From broad fills to fine lines and small details.',
  book: 'Where PP runs through the PポP tag until every line feels right.',
  credits: 'PP and her story are fictional. The imagery is AI-generated. The study is independent of the brands it mentions.',
  legalNav: 'Legal information',
  privacy: 'Privacy policy',
  imprint: 'Legal notice',
  close: 'Close',
  portraitAlt: 'PP with a black bob, a pink bubblegum bubble and a spray can against a pink halftone.',
  wallAlt: 'Two interlocking cyan Ps with a heavy black outline and pink details on concrete.',
  trainAlt: 'Side view of a retired orange railway carriage with a pink and cyan mural and a grinning rabbit.',
  kitAlt: 'Two spray cans, a half-face respirator, spray nozzles and a black sketchbook with a pink marker.',
  openWall: 'Open a large view of Sugar Static',
  openTrain: 'Open a large view of Train Bomb',
};

/** Hält die deutschen HTML-Texte als Ausgangswerte für den Sprachwechsel fest. */
const localizedElements = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('[data-copy], [data-label]'));
const localized = Array.from(localizedElements, (element) => {
  const attribute = element.hasAttribute('data-label')
    ? (element instanceof HTMLImageElement ? 'alt' : 'aria-label')
    : null;
  return {
    element,
    attribute,
    key: /** @type {keyof typeof english} */ (element.dataset.copy ?? element.dataset.label),
    original: (attribute ? element.getAttribute(attribute) : element.textContent) ?? '',
  };
});

// Die Studie übernimmt die Portfolio-Vorgaben, bis eine eigene Einstellung gespeichert ist.
let language = readPreference('pon-pulse-language', 'bp-language') === 'en' ? 'en' : 'de';
let dark = readPreference('pon-pulse-theme', 'bp-theme') === 'dark';

// Die Sprühanimation setzt zwei dekodierte Bildlagen voraus.
let sprayReady = false;
let sprayLoading = false;

/** @type {HTMLSpanElement | undefined} Der aktuell sichtbare kurze Klick-Pop. */
let activeBubble;
/** @type {HoldGesture | null} Laufender oder vorgemerkter Halteklick. */
let hold = null;
let suppressHeldClick = false; // Eine sichtbare Haltegeste übernimmt die anschließende Klickaktion.

/**
 * Liest zuerst die Studieneinstellung, danach die Portfolio-Vorgabe.
 * @param {string} key Schlüssel der Studie.
 * @param {string} fallbackKey Schlüssel des Portfolios.
 * @returns {string | null} Gespeicherter Wert, falls verfügbar.
 */
function readPreference(key, fallbackKey) {
  try {
    return localStorage.getItem(key) ?? localStorage.getItem(fallbackKey);
  } catch {
    return null;
  }
}

/**
 * Speichert die Studieneinstellung, sofern der Browser Zugriff gewährt.
 * @param {string} key Schlüssel der Studie.
 * @param {string} value Neuer Wert.
 */
function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Die aktuelle Ansicht bleibt ohne Zugriff auf den Speicher bedienbar.
  }
}

/** Übersetzt Bedienelemente, Bildbeschreibungen und redaktionelle Texte. */
function renderLanguage() {
  root.lang = language;
  localized.forEach(({ element, attribute, key, original }) => {
    const value = language === 'en' ? english[key] : original;
    if (attribute) {
      element.setAttribute(attribute, value);
    } else {
      element.textContent = value;
    }
  });
  languageButton.lang = language === 'de' ? 'en' : 'de';
  languageButton.textContent = languageButton.lang.toUpperCase();
  languageButton.setAttribute('aria-label', language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln');
}

/** Schaltet das Theme des redaktionellen Rahmens um. */
function renderTheme() {
  root.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  const themeColor = /** @type {HTMLMetaElement} */ (document.querySelector('meta[name="theme-color"]'));
  themeColor.content = dark ? '#000000' : '#ffffff';
}

/**
 * Öffnet das verlinkte Werk im Dialog. Modifizierte Klicks verwenden das normale Linkverhalten.
 * @param {MouseEvent} event Klick auf einen Werklink.
 */
function openArtwork(event) {
  if (typeof viewer.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return;
  }

  const link = /** @type {HTMLAnchorElement} */ (event.currentTarget);
  const image = /** @type {HTMLImageElement} */ (link.querySelector('img'));
  event.preventDefault();
  viewerImage.src = link.href;
  viewerImage.alt = image.alt;
  viewerTitle.textContent = link.dataset.gallery ?? '';
  viewer.showModal();
}

/**
 * Lädt die saubere Wand, wartet auf beide Bilder und bereitet die SVG-Maske vor.
 * @returns {Promise<void>} Wird nach der Vorbereitung oder dem Rückfall auf das statische Bild erfüllt.
 */
async function prepareSpray() {
  if (sprayLoading) {
    return;
  }

  sprayLoading = true;
  const wall = /** @type {SVGImageElement} */ (sprayLayer.querySelector('.spray-wall'));
  const art = /** @type {SVGImageElement} */ (sprayLayer.querySelector('.spray-art'));
  const mural = /** @type {HTMLImageElement} */ (sprayFigure.querySelector('img'));
  const cleanWall = new Image();
  cleanWall.src = wall.getAttribute('data-src') ?? '';
  try {
    await Promise.all([cleanWall.decode(), mural.decode()]);
    wall.setAttribute('href', cleanWall.src);
    art.setAttribute('href', mural.currentSrc);
    sprayReady = true;
    replay.hidden = reducedMotion.matches;
    requestAnimationFrame(playSpray);
  } catch {
    finishSpray();
  } finally {
    sprayLoading = false;
  }
}

/** Startet die drei Sprühzüge, sobald beide Bildlagen geladen sind. */
function playSpray() {
  if (!sprayReady || reducedMotion.matches || sprayFigure.classList.contains('is-spraying')) {
    return;
  }

  sprayFigure.classList.add('is-spraying');
  replay.setAttribute('aria-disabled', 'true');
}

/** Gibt nach Ende oder Abbruch des Sprühens das statische Mural und die Bedienung frei. */
function finishSpray() {
  sprayFigure.classList.remove('is-spraying', 'is-spray-pending');
  replay.removeAttribute('aria-disabled');
}

/** Synchronisiert die Sprühsteuerung und bricht Haltegesten bei reduzierter Bewegung ab. */
function updateMotionPreference() {
  replay.hidden = !sprayReady || reducedMotion.matches;
  if (reducedMotion.matches) {
    if (sprayFigure.classList.contains('is-spraying')) {
      finishSpray();
    }
    stopHold();
    return;
  }

  if (sprayFigure.matches('.is-revealed.is-spray-pending')) {
    if (sprayReady) {
      playSpray();
    } else {
      void prepareSpray();
    }
  }
}

/** Registriert frühe Text-Reveals und später auslösende Bildszenen. */
function initializeReveals() {
  if (!('IntersectionObserver' in window)) {
    return;
  }

  root.classList.add('has-scroll-motion');
  sprayFigure.classList.add('is-spray-pending');
  const revealObserver = new IntersectionObserver(
    /** @param {IntersectionObserverEntry[]} entries Beobachtete Textabschnitte. */
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.14 },
  );
  document.querySelectorAll('[data-reveal]').forEach((section) => revealObserver.observe(section));

  const pendingScenes = new Set(document.querySelectorAll('[data-scene]'));
  /** @type {IntersectionObserver | undefined} Beobachter für Mural und Waggon. */
  let sceneObserver;

  /** Berechnet die Startlinie für Hochformat, Querformat und kleine Fenster neu. */
  function observeScenes() {
    sceneObserver?.disconnect();
    const observer = new IntersectionObserver(
      /**
       * Verarbeitet jede Bildszene genau einmal.
       * @param {IntersectionObserverEntry[]} entries Beobachtete Bildszenen.
       * @param {IntersectionObserver} currentObserver Auslösender Beobachter.
       */
      (entries, currentObserver) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || !pendingScenes.delete(entry.target)) {
            continue;
          }

          entry.target.classList.add('is-revealed');
          currentObserver.unobserve(entry.target);
          if (entry.target === sprayFigure && !reducedMotion.matches) {
            void prepareSpray();
          }
        }

        if (!pendingScenes.size) {
          window.removeEventListener('resize', observeScenes);
        }
      },
      { rootMargin: `0px 0px -${Math.round(innerHeight * 0.44)}px 0px` },
    );
    sceneObserver = observer;
    pendingScenes.forEach((scene) => observer.observe(scene));
  }

  window.addEventListener('resize', observeScenes);
  observeScenes();
}

/** Bläst die große Kaugummiblase vom Klickpunkt zur Fenstermitte auf. */
function inflateHold() {
  if (!hold) {
    return;
  }

  suppressHeldClick = true;
  const gum = document.createElement('span');
  gum.className = 'gum-hold';
  gum.setAttribute('aria-hidden', 'true');
  gum.style.setProperty('--gum-origin-x', `${hold.x}px`);
  gum.style.setProperty('--gum-origin-y', `${hold.y}px`);
  hold.gum = gum;
  (viewer.open ? viewer : document.body).append(gum);
  gum.addEventListener('animationend', burstHeldGum, { once: true });
}

/**
 * Löst nach dem Aufblasen das Platzen und die kurze Erschütterung aus.
 * @param {AnimationEvent} event Ende der Wachstumsanimation.
 */
function burstHeldGum(event) {
  if (!hold?.gum || event.currentTarget !== hold.gum) {
    return;
  }

  const gum = hold.gum;
  hold.gum = null;
  gum.classList.add('is-bursting');
  document.body.classList.add('is-gum-shaking');
  window.setTimeout(() => {
    gum.remove();
    document.body.classList.remove('is-gum-shaking');
  }, 420);
}

/** Beendet einen begonnenen oder vorgemerkten Halteklick. */
function stopHold() {
  if (!hold) {
    return;
  }

  window.clearTimeout(hold.timer);
  hold.gum?.remove();
  hold = null;
}

/**
 * Merkt einen primären Mausklick als mögliche Haltegeste vor.
 * @param {PointerEvent} event Gedrückte Maustaste und Startposition.
 */
function startHold(event) {
  if (event.pointerType !== 'mouse' || event.button !== 0) {
    return;
  }

  suppressHeldClick = false;
  if (reducedMotion.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  stopHold();
  hold = {
    x: event.clientX,
    y: event.clientY,
    pointerId: event.pointerId,
    timer: window.setTimeout(inflateHold, 220),
    gum: null,
  };
}

/**
 * Bricht die vorgemerkte Geste ab, wenn die Maustaste losgelassen oder die Maus zum Ziehen bewegt wird.
 * @param {PointerEvent} event Aktuelle Mausposition und Tastenstatus.
 */
function trackHold(event) {
  if (!hold || event.pointerId !== hold.pointerId) {
    return;
  }

  const distance = Math.hypot(event.clientX - hold.x, event.clientY - hold.y);
  if (!(event.buttons & 1) || (!suppressHeldClick && distance > 9)) {
    stopHold();
  }
}

/**
 * Beendet nur die Haltegeste des losgelassenen oder abgebrochenen Pointers.
 * @param {PointerEvent} event Ende der Pointer-Interaktion.
 */
function releaseHold(event) {
  if (event.pointerId === hold?.pointerId) {
    stopHold();
  }
}

/**
 * Unterdrückt den Folge-Klick einer Haltegeste, bevor der Link oder Button aktiviert wird.
 * @param {MouseEvent} event Klick nach dem Loslassen der Maustaste.
 */
function suppressLongPressClick(event) {
  if (!suppressHeldClick || !event.detail) {
    return;
  }

  suppressHeldClick = false;
  event.preventDefault();
  event.stopImmediatePropagation();
}

/**
 * Platziert den kurzen Pop am Klickpunkt oder zentriert auf dem per Tastatur aktivierten Element.
 * @param {MouseEvent} event Klick auf der Seite.
 */
function showClickPop(event) {
  if (reducedMotion.matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const rect = target.getBoundingClientRect();
  const x = event.detail ? event.clientX : rect.left + rect.width / 2;
  const y = event.detail ? event.clientY : rect.top + rect.height / 2;
  const bubble = document.createElement('span');
  bubble.className = 'gum-pop';
  bubble.setAttribute('aria-hidden', 'true');
  bubble.style.left = `${Math.max(28, Math.min(innerWidth - 28, x))}px`;
  bubble.style.top = `${Math.max(28, Math.min(innerHeight - 28, y))}px`;
  activeBubble?.remove();
  activeBubble = bubble;

  // Der geöffnete Dialog liegt über der Seite. Beim Schließen erscheint der Pop wieder auf der Seite.
  const closeButton = target.closest('form[method="dialog"] button');
  const layer = viewer.open && !closeButton ? viewer : document.body;
  layer.append(bubble);

  /** Entfernt den Pop und gibt nur seine eigene Referenz frei. */
  function clearBubble() {
    bubble.remove();
    if (activeBubble === bubble) {
      activeBubble = undefined;
    }
  }

  bubble.addEventListener('animationend', clearBubble, { once: true });
  window.setTimeout(clearBubble, 540);
}

/** Wechselt und speichert die Studiensprache. */
function toggleLanguage() {
  language = language === 'de' ? 'en' : 'de';
  renderLanguage();
  savePreference('pon-pulse-language', language);
}

/** Wechselt und speichert das Theme der Studie. */
function toggleTheme() {
  dark = !dark;
  renderTheme();
  savePreference('pon-pulse-theme', dark ? 'dark' : 'light');
}

// Werklinks, Motion-Einstellungen und globale Zeigerinteraktionen der Studie.
galleryLinks.forEach((link) => link.addEventListener('click', openArtwork));
replay.addEventListener('click', playSpray);
lastSprayStroke.addEventListener('animationend', finishSpray);
reducedMotion.addEventListener('change', updateMotionPreference);
document.addEventListener('pointerdown', startHold);
document.addEventListener('pointermove', trackHold);
document.addEventListener('pointerup', releaseHold);
document.addEventListener('pointercancel', releaseHold);
document.addEventListener('dragstart', stopHold);
viewer.addEventListener('close', stopHold);
window.addEventListener('blur', stopHold);
document.addEventListener('click', suppressLongPressClick, true);
document.addEventListener('click', showClickPop);
languageButton.addEventListener('click', toggleLanguage);
themeButton.addEventListener('click', toggleTheme);

initializeReveals();
renderLanguage();
renderTheme();
