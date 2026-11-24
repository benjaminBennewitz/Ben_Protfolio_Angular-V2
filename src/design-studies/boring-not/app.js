/**
 * @file Kollektion, Dialoge und Markenanimationen für BORING:NOT.
 * @author Benjamin Bennewitz
 */

const root = document.documentElement;
const languageButton = document.querySelector('#language');
const themeButton = document.querySelector('#theme');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
const heroShapes = [...hero.querySelectorAll('.shape')];
const backToTop = document.querySelector('#back-to-top');
const footerWordmark = document.querySelector('.footer-wordmark');
const pageTop = document.querySelector('#top');

const mobileViewport = window.matchMedia('(max-width: 800px)');
const menuToggle = pageTop.querySelector('.menu-toggle');
const toolbar = pageTop.querySelector('.toolbar');
const brandNav = pageTop.querySelector('#brand-nav');
const archiveLink = pageTop.querySelector('.archive-link');
const menuDialog = document.querySelector('#mobile-menu');
const menuLinks = menuDialog.querySelector('.menu-links');
const winterDialog = document.querySelector('#winter-promo');
const winterSessionKey = 'boring-not-winter-aw26-shown';

const collectionControls = document.querySelector('.collection-controls');
const collectionCount = document.querySelector('.collection-count');
const arrivalGrid = document.querySelector('.arrival-grid');
const arrivals = [...arrivalGrid.querySelectorAll('.arrival')];
const filterButtons = [...collectionControls.querySelectorAll('[data-filter]')];
const productDialog = document.querySelector('#product-dialog');
const productImage = productDialog.querySelector('.product-image');
const productTitle = productDialog.querySelector('#product-title');
const productColor = productDialog.querySelector('.product-color');
const productDescription = productDialog.querySelector('#product-description');

/** Englische Entsprechungen der statischen deutschen HTML-Texte. */
const english = {
  skip: "Skip to content",
  archive: "← Archive",
  brandNav: "Collection and brand",
  arrivalsNav: "New arrivals",
  lookbookNav: "Lookbook",
  aboutNav: "About",
  dark: "Dark",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  menuTitle: "Menu",
  edition: "Autumn / Winter 2026 · Drop 01",
  heroClaim: "Gray is yesterday.",
  intro: "Colorful jackets and outdoor pants for autumn and winter.",
  start: "Explore the collection ↓",
  heroAlt: "Three laughing children in colorful autumn jackets on a playground",
  arrivalsLabel: "Autumn / Winter 2026",
  arrivalsTitle: "New Arrivals",
  arrivalsText: "Ten pieces for gray days, from quilted jackets to colorful mittens.",
  filterLabel: "Filter the collection",
  filterAll: "All",
  filterJackets: "Jackets",
  filterVests: "Vests",
  filterAccessories: "Accessories",
  filterPants: "Pants",
  productAlt1: "Pink and yellow hooded puffer jacket with turquoise zips",
  product1: "Pop Puffer · Puffer jacket",
  productColor1: "Pink / Yellow / Turquoise",
  productAlt2: "Blue cargo pants with turquoise panels and lime details",
  product2: "Wave Cargo · Outdoor pants",
  productColor2: "Blue / Turquoise / Lime",
  productAlt3: "Lilac fleece jacket with turquoise panels and colorful Memphis patterns",
  product3: "Wiggle Fleece · Fleece jacket",
  productColor3: "Lilac / Turquoise / Confetti",
  productAlt4: "Orange pants with pink color blocks",
  product4: "Sunset Pants · Outdoor pants",
  productColor4: "Orange / Pink",
  aiImage: "AI image",
  reviewsNav: "Reviews",
  stars4: "4 out of 5 stars",
  stars5: "5 out of 5 stars",
  satisfactionTitle: "Your satisfaction matters.",
  satisfactionText: "A favorite is as fun to put on as it is to wear outside. We show each piece on its own and style it in the lookbook so you can see which colors and layers work together for you.",
  satisfactionLink: "What people say ↓",
  reviewsTitle: "What people say",
  reviewsNote: "Fictional sample reviews for this design study.",
  product5: "Sunburst Vest · Quilted vest",
  productColor5: "Yellow / Pink / Turquoise",
  productAlt5: "Yellow and pink quilted vest with a turquoise zipper",
  product6: "Splash Shell · Hooded jacket",
  productColor6: "Cobalt / Mint / Pink",
  productAlt6: "Blue hooded jacket with mint and pink panels",
  product7: "Kick Beanie · Pom-pom hat",
  productColor7: "Cobalt / Lime",
  productAlt7: "Cobalt ribbed knit hat with a lime cuff and a multicolored pom-pom",
  product8: "Pop Mittens · Mittens",
  productColor8: "Pink / Turquoise / Yellow",
  productAlt8: "Pair of pink and turquoise mittens with yellow cuffs",
  product9: "Sherpa Pop · Fleece vest",
  productColor9: "Orange / Purple / Lime",
  productAlt9: "Orange and purple fleece vest with a large lime pocket",
  product10: "Tilt Beanie · Knit hat",
  productColor10: "Lilac / Coral / Turquoise",
  productAlt10: "Lilac and coral knit hat with a turquoise detail",
  review1: "The pink and yellow brighten up any gray outfit.",
  review2: "These pants look best with a plain sweater. The turquoise panels do plenty on their own.",
  review3: "I like the vest best over a fleece, especially with that turquoise zipper.",
  review4: "The hat is our favorite. The colorful pom-pom goes really well with the green cuff.",
  fictional: "Fictional collection · Not for sale",
  lookbookAlt: "Two children in colorful autumn outfits on a path covered in leaves",
  compositionLabel: "Lookbook · Autumn / Winter 2026",
  compositionTitle: "Outside we go!",
  compositionText: "Puffer or fleece? The lookbook pairs both with pants in bold contrasting colors.",
  coldLook: "For cold mornings",
  mildLook: "For mild afternoons",
  manifestoLabel: "About BORING:NOT",
  manifestoTitle: "Childhood isn’t beige.",
  manifestoText: "Puddles, piles of leaves, chalk on the pavement. Our kidswear starts with what kids do outdoors. Bold colors make getting outside feel a little brighter, even on gray days.",
  manifestoDetail: "The idea comes from 1980s Memphis design. We bring its squiggles, grids and color blocks straight onto jackets and pants. The puffer or the cargos become the piece you build the whole look around.",
  seeLooks: "Explore the looks ↑",
  closeProduct: "Close product details",
  footerClaim: "Stay colorful.",
  footerText: "Kidswear with personality. A fictional label and design study by [B²].",
  footerBrand: "BORING:NOT – back to top",
  legal: "Collection and legal information",
  imprint: "Legal notice",
  privacy: "Privacy policy",
  backToTop: "Back to top",
  winterTitle: "15% winter discount",
  winterDescription: "A winter promotion for the autumn and winter collection. The code is part of the fictional campaign.",
  winterCode: "Promo code",
  winterCta: "Explore the collection ↓",
  closeWinter: "Close winter promotion",
};

/** Unveränderte deutsche Ausgangstexte und zugängliche Beschriftungen. */
const localized = Array.from(document.querySelectorAll('[data-copy], [data-label], [data-alt]'), (element) => ({
  element,
  key: element.dataset.copy ?? element.dataset.label ?? element.dataset.alt,
  attribute: element.hasAttribute('data-label') ? 'aria-label' : element.hasAttribute('data-alt') ? 'alt' : null,
  original: element.hasAttribute('data-label') ? element.getAttribute('aria-label') : element.hasAttribute('data-alt') ? element.getAttribute('alt') : element.textContent,
}));

/** Beschreibung der sichtbaren Gestaltungsmerkmale je Kleidungsstück. */
const descriptions = {
  'pop-puffer': {
    de: 'Rosa Steppbahnen, eine gelbe Vorderpartie und eine gefütterte Kapuze. Türkise Reißverschlüsse setzen Akzente an Front und Taschen.',
    en: 'Pink quilting, a yellow front panel and a lined hood. Turquoise zips add contrast at the front and pockets.',
  },
  'wave-cargo': {
    de: 'Kobaltblau trifft auf türkise Einsätze an den Beinen. Limettengrüne Zugbänder und Laschen setzen Akzente am Bund und an den Cargotaschen.',
    en: 'Cobalt blue meets turquoise leg panels. Lime drawstrings and tabs add contrast at the waist and cargo pockets.',
  },
  'wiggle-fleece': {
    de: 'Eine fliederfarbene Fleecejacke mit türkisen Ärmeln. Schwarze und pinke Wellen sowie ein gelbes Dreieck greifen typische Memphis-Motive auf.',
    en: 'A lilac fleece jacket with turquoise sleeves. Black and pink squiggles and a yellow triangle pick up classic Memphis motifs.',
  },
  'sunset-pants': {
    de: 'Orangefarbene Outdoorhose mit diagonalen pinken Einsätzen, elastischen Beinabschlüssen und schwarzem Gürtel.',
    en: 'Orange outdoor pants with diagonal pink panels, elasticated cuffs and a black belt.',
  },
  'sunburst-vest': {
    de: "Breite Steppbahnen in Gelb und Pink setzen die Weste in Szene. Ein türkiser Reißverschluss zieht sich durch die Mitte.",
    en: "Broad yellow and pink quilting gives this vest its look. A turquoise zipper runs down the front.",
  },
  'splash-shell': {
    de: "Kobaltblau trifft auf Mint und pinke Farbflächen. Der orange Reißverschluss setzt einen Kontrast zur kühlen Farbpalette.",
    en: "Cobalt meets mint and pink color blocks. The orange zipper contrasts with the cooler colors.",
  },
  'kick-beanie': {
    de: "Ein limettengrüner Umschlag rahmt den kobaltblauen Rippenstrick ein. Oben sitzt ein bunter Bommel.",
    en: "A lime cuff frames the cobalt ribbed knit. A multicolored pom-pom sits on top.",
  },
  'pop-mittens': {
    de: "Pink und Türkis teilen sich die Fläche. Gelbe Bündchen greifen den Farbkontrast am Handgelenk auf.",
    en: "Pink and turquoise share the surface. Yellow cuffs bring a contrasting color to the wrist.",
  },
  'sherpa-vest': {
    de: "Flauschige orange und violette Flächen treffen auf eine große limettengrüne Fronttasche.",
    en: "Plush orange and purple panels meet a large lime front pocket.",
  },
  'tilt-beanie': {
    de: "Ein korallfarbener Umschlag setzt einen warmen Akzent zum fliederfarbenen Strick. Ein kleines türkises Dreieck greift das Memphis-Motiv auf.",
    en: "A coral cuff adds a warm accent to the lilac knit. A small turquoise triangle picks up the Memphis motif.",
  },
};

// Sprache und Theme übernehmen bei Bedarf die Einstellungen des Portfolios.
let language = readPreference('boring-not-language', 'bp-language') === 'en' ? 'en' : 'de';
let dark = readPreference('boring-not-theme', 'bp-theme') === 'dark';

// Bewegungszustand der Kampagne.
let frame = 0;
let pointerX = 0;
let pointerY = 0;
let checkWinterOnFrame = false;
let winterShown = wasWinterShown();

// Auslöser für die Fokusrückgabe nach dem Produktdialog.
let productTrigger = null;

/**
 * Liest eine studienspezifische Einstellung mit Portfolio-Fallback.
 * @param {string} key Lokaler Schlüssel.
 * @param {string} fallbackKey Schlüssel des Portfolios.
 * @returns {string|null} Gespeicherter Wert, falls verfügbar.
 */
function readPreference(key, fallbackKey) {
  try {
    return localStorage.getItem(key) ?? localStorage.getItem(fallbackKey);
  } catch {
    return null;
  }
}

/**
 * Speichert eine Einstellung, sofern der Browser lokalen Speicher zulässt.
 * @param {string} key Lokaler Schlüssel.
 * @param {string} value Neuer Wert.
 */
function writePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Die aktuelle Sitzung bleibt auch ohne lokalen Speicher bedienbar.
  }
}

/**
 * Liest den Status der Winteraktion für diesen Tab.
 * @returns {boolean} Ob die Aktion in der Sitzung bereits angezeigt wurde.
 */
function wasWinterShown() {
  try {
    return sessionStorage.getItem(winterSessionKey) === 'true';
  } catch {
    return false;
  }
}

/** Zeigt die Winteraktion einmal ab der Hälfte der verfügbaren Scrollstrecke. */
function checkWinterPromo() {
  if (winterShown || typeof winterDialog.showModal !== 'function' || document.querySelector('dialog[open]')) {
    return;
  }
  const page = document.scrollingElement;
  const distance = page.scrollHeight - page.clientHeight;
  if (distance <= 0 || window.scrollY < distance / 2) {
    return;
  }
  winterDialog.showModal();
  winterShown = true;
  try {
    sessionStorage.setItem(winterSessionKey, 'true');
  } catch {
    // Der Schutz vor erneutem Öffnen gilt weiterhin bis zum nächsten Seitenaufruf.
  }
}

/** Aktualisiert alle sichtbaren und zugänglichen Sprachtexte. */
function applyLanguage() {
  root.lang = language;
  document.title = language === 'en' ? 'BORING:NOT — Colorful kidswear / AW26' : 'BORING:NOT — Bunte Kindermode / AW26';
  for (const item of localized) {
    const value = language === 'en' ? english[item.key] ?? item.original : item.original;
    if (item.attribute) {
      item.element.setAttribute(item.attribute, value);
    } else {
      item.element.textContent = value;
    }
  }
  languageButton.textContent = language === 'en' ? 'DE' : 'EN';
  languageButton.lang = language === 'en' ? 'de' : 'en';
  languageButton.setAttribute('aria-label', language === 'en' ? 'Auf Deutsch wechseln' : 'Switch to English');
  applyTheme();
  updateCollectionCount();
}

/** Aktualisiert Farbschema und Schalterbeschriftung. */
function applyTheme() {
  root.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.textContent = language === 'en' ? (dark ? 'Light' : 'Dark') : (dark ? 'Hell' : 'Dunkel');
}

/** Aktualisiert die sichtbare Trefferzahl und die Screenreader-Rückmeldung. */
function updateCollectionCount() {
  const count = arrivals.filter((arrival) => !arrival.hidden).length;
  collectionCount.textContent = language === 'en' ? `${count} pieces` : `${count} Teile`;
}

/**
 * Filtert die Neuheiten nach Kleidungsart und aktualisiert die Schalterzustände.
 * @param {string} category gewählte Kleidungsart oder "all".
 */
function applyFilter(category) {
  for (const arrival of arrivals) {
    arrival.hidden = category !== 'all' && arrival.dataset.category !== category;
  }
  for (const button of filterButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  }
  updateCollectionCount();
}

/**
 * Übernimmt Bild, Name und Farbvariante aus der Produktkarte.
 * @param {HTMLElement} arrival Produktkarte des ausgewählten Kleidungsstücks.
 * @param {HTMLElement} trigger Element, das den Dialog geöffnet hat.
 */
function openProduct(arrival, trigger) {
  const image = arrival.querySelector('img');
  productTitle.textContent = arrival.querySelector('h3').textContent;
  productColor.textContent = arrival.querySelector('figcaption p').textContent;
  productDescription.textContent = descriptions[arrival.id][language];
  productImage.alt = image.alt;
  productImage.width = image.width;
  productImage.height = image.height;
  productImage.sizes = '(max-width: 560px) calc(100vw - 2rem), (max-width: 960px) 53vw, 502px';
  productImage.srcset = image.srcset;
  productImage.src = image.src;
  productTrigger = trigger;
  productDialog.showModal();
}

/**
 * Begrenzt einen Wert auf den normierten Bewegungsbereich.
 * @param {number} value Ausgangswert.
 * @param {number} min Untergrenze.
 * @param {number} max Obergrenze.
 * @returns {number} Begrenzter Wert.
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Bewegt die Memphis-Formen innerhalb der sichtbaren Kampagne. */
function updateMotion() {
  frame = 0;
  const offset = window.scrollY;
  const viewportHeight = window.innerHeight;
  backToTop.classList.toggle('is-visible', offset > viewportHeight * .7);
  if (checkWinterOnFrame) {
    checkWinterOnFrame = false;
    checkWinterPromo();
  }
  if (reducedMotion.matches || offset > hero.offsetHeight + pageTop.offsetHeight) {
    return;
  }
  const progress = clamp(offset / hero.offsetHeight, 0, 1);
  const distance = window.innerWidth <= 800 ? 30 : 85;
  for (const [index, shape] of heroShapes.entries()) {
    const direction = index % 2 === 0 ? 1 : -1;
    const weight = .45 + (index % 5) * .15;
    shape.style.setProperty('--motion-x', `${(progress * distance * .4 + pointerX * 20) * weight * direction}px`);
    shape.style.setProperty('--motion-y', `${(progress * distance * direction + pointerY * 18) * weight}px`);
    shape.style.setProperty('--motion-turn', `${progress * 24 * direction * weight}deg`);
  }
}

/** Plant höchstens eine Aktualisierung der Kampagnenformen pro Renderframe. */
function scheduleMotion() {
  if (!frame) {
    frame = requestAnimationFrame(updateMotion);
  }
}

/**
 * Normalisiert die Pointerposition für eine kleine zusätzliche Parallaxe.
 * @param {PointerEvent} event Aktuelle Pointerposition.
 */
function updateHeroPointer(event) {
  if (reducedMotion.matches || event.pointerType !== 'mouse') {
    return;
  }
  const bounds = hero.getBoundingClientRect();
  pointerX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
  pointerY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
  scheduleMotion();
}

/** Setzt die Pointer-Parallaxe beim Verlassen der Bühne zurück. */
function resetHeroPointer() {
  pointerX = 0;
  pointerY = 0;
  scheduleMotion();
}

/** Berechnet die Rasterhöhe pro Kachel bei Filter-, Text- oder Größenänderungen. */
function initializeMasonry() {
  if (!('ResizeObserver' in window)) {
    return;
  }
  const observer = new ResizeObserver((entries) => {
    const gridStyle = getComputedStyle(arrivalGrid);
    const rowHeight = Number.parseFloat(gridStyle.getPropertyValue('--masonry-unit'));
    const gap = Number.parseFloat(gridStyle.columnGap);
    for (const { target, borderBoxSize } of entries) {
      const height = borderBoxSize?.[0]?.blockSize ?? target.offsetHeight;
      if (height > 0) {
        target.style.setProperty('--masonry-rows', String(Math.ceil((height + gap) / rowHeight)));
      }
    }
    arrivalGrid.classList.add('is-masonry');
  });
  arrivals.forEach((arrival) => observer.observe(arrival));
}

/** Verbindet Filter, Produktkarten und die Lookbook-Links mit dem Katalog. */
function initializeCollection() {
  for (const button of filterButtons) {
    button.addEventListener('click', () => applyFilter(button.dataset.filter));
  }
  collectionControls.hidden = false;
  initializeMasonry();

  if (typeof productDialog.showModal !== 'function') {
    return;
  }
  for (const arrival of arrivals) {
    const button = arrival.querySelector('.arrival-detail');
    button.addEventListener('click', () => openProduct(arrival, button));
    button.hidden = false;
  }
  for (const link of document.querySelectorAll('[data-product-link]')) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return;
      }
      event.preventDefault();
      openProduct(document.getElementById(link.dataset.productLink), link);
    });
  }

  productDialog.addEventListener('close', () => {
    productTrigger?.focus({ preventScroll: true });
    productTrigger = null;
  });

  enableBackdropDismiss(productDialog);
}

/**
 * Schließt den Dialog erst bei einem vollständigen Klick auf seinen Hintergrund.
 * @param {HTMLDialogElement} dialog Dialog mit abgesetztem Inhaltsbereich.
 */
function enableBackdropDismiss(dialog) {
  let pressedBackdrop = false;
  dialog.addEventListener('pointerdown', (event) => {
    pressedBackdrop = event.target === dialog;
  });
  dialog.addEventListener('click', (event) => {
    if (pressedBackdrop && event.target === dialog) {
      dialog.close();
    }
    pressedBackdrop = false;
  });
}

/**
 * Schließt den Dialog vor dem regulären Sprung zum verlinkten Seitenabschnitt.
 * @param {HTMLDialogElement} dialog Dialog mit internen Ankerlinks.
 */
function enableDialogNavigation(dialog) {
  dialog.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
      return;
    }
    if (event.target.closest('a[href^="#"]')) {
      dialog.close();
    }
  });
}

/** Verschiebt die bestehende Navigation zwischen Header und mobilem Overlay. */
function updateMenuLayout() {
  const isMobile = mobileViewport.matches;
  const menuWasOpen = menuDialog.open;
  if (isMobile) {
    menuLinks.append(brandNav, archiveLink);
  } else {
    if (menuWasOpen) {
      menuDialog.close();
    }
    pageTop.prepend(archiveLink);
    toolbar.before(brandNav);
  }
  pageTop.classList.toggle('has-mobile-menu', isMobile);
  menuToggle.hidden = !isMobile;
  if (!isMobile && menuWasOpen) {
    brandNav.querySelector('a').focus({ preventScroll: true });
  }
}

/** Aktiviert das mobile Menü mit nativer Fokusführung und Schließen per Escape. */
function initializeMenu() {
  if (typeof menuDialog.showModal !== 'function') {
    return;
  }

  menuToggle.addEventListener('click', () => {
    menuDialog.showModal();
    menuToggle.setAttribute('aria-expanded', 'true');
  });
  menuDialog.addEventListener('close', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
  });
  enableBackdropDismiss(menuDialog);
  enableDialogNavigation(menuDialog);
  mobileViewport.addEventListener('change', updateMenuLayout);
  updateMenuLayout();
}

/** Startet die lokalen Interaktionen und beobachtet einmalige Scroll-Reveals. */
function initialize() {
  applyLanguage();
  initializeCollection();
  initializeMenu();
  enableBackdropDismiss(winterDialog);
  enableDialogNavigation(winterDialog);
  root.classList.add('motion-ready');
  backToTop.hidden = false;

  backToTop.addEventListener('click', (event) => {
    event.preventDefault();
    pageTop.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  languageButton.addEventListener('click', () => {
    language = language === 'de' ? 'en' : 'de';
    writePreference('boring-not-language', language);
    applyLanguage();
  });
  themeButton.addEventListener('click', () => {
    dark = !dark;
    writePreference('boring-not-theme', dark ? 'dark' : 'light');
    applyTheme();
  });

  window.addEventListener('scroll', () => {
    checkWinterOnFrame = !winterShown;
    scheduleMotion();
  }, { passive: true });
  window.addEventListener('resize', scheduleMotion);
  reducedMotion.addEventListener('change', resetHeroPointer);
  hero.addEventListener('pointermove', updateHeroPointer, { passive: true });
  hero.addEventListener('pointerleave', resetHeroPointer);
  scheduleMotion();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: .2 });
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));

    const footerObserver = new IntersectionObserver(([entry]) => {
      footerWordmark.classList.toggle('is-rolling', entry.isIntersecting);
    }, { threshold: .45 });
    footerObserver.observe(footerWordmark);
  }
}

initialize();
