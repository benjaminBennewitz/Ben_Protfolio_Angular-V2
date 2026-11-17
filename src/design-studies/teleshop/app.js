/**
 * @file TELESHOP: Lokalisierung, Layoutverwandlung, Analyse und Demo-Warenkorb.
 * @description Ein gemeinsamer DOM-Baum bleibt in allen Gestaltungssystemen erhalten.
 * @author Benjamin Bennewitz
 */

/** @typedef {'de' | 'en'} Language */
/** @typedef {'layout' | 'type' | 'focus'} Layer */
/** @typedef {{layout: boolean, type: boolean, focus: boolean}} DesignState */

/** Stabile Elementreferenzen und zustandsarme Produktdaten. Preise in Cent. */
const byId = (id) => document.getElementById(id);
const store = byId('store');
const dialog = byId('basket-dialog');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const layers = ['layout', 'type', 'focus'];
let language = /** @type {Language} */ ('de');
let design = /** @type {DesignState} */ ({ layout: false, type: false, focus: false });
let busy = false;
let activeTransition = null;
let activeAnimations = [];
let toastTimeout;
let selectedNote = 'hierarchy';
let slideIndex = 0;
let analysisFrame = 0;
let analysisTrigger = null;
let infoKey = 'about';
const cart = new Map();
const products = {
  trainer: { price: 3990, de: 'Bauchwunder 3000', en: 'Ab Wonder 3000' },
  egg: { price: 1490, de: 'Eierschalensollbruchstellenverursacher', en: 'Precision eggshell cracker' },
  candle: { price: 1990, de: 'Duftkerzen »Leitungswasser«', en: '“Tap Water” scented candles' },
};

/** Englische Texte; die deutschen Originale werden einmal aus dem HTML übernommen. */
const english = {
  skip: 'Skip to shop', analysis: 'Analysis', dark: 'Dark', light: 'Light',
  eyebrow: 'MAIL-ORDER MEETS THE PRESENT', title: 'Same goods. New rules.',
  intro: 'Three things nobody needs.<br>One shop you can rearrange.',
  controls: 'Experiment controls', individual: 'OR ONE BY ONE:', grid: 'Grid', type: 'Typography', focus: 'Hierarchy', slow: 'Slow motion',
  editionOld: 'ONLINE CATALOGUE · 1998 EDITION', editionNew: 'ONLINE STORE · 2026 EDITION', editionMix: 'DESIGN LAB · MIXED EDITION',
  brandline: 'Your direct line to good things!', promise: 'Practical. Affordable. Phenomenal.', basket: 'Basket',
  strip: '★ THE GREAT HOUSEHOLD SENSATION ★', stripDetail: 'Little helpers. Big performances.',
  categories: 'Product categories', catalog: 'OUR CATALOGUE', fitness: 'Fitness & leisure', kitchen: 'Kitchen & home', living: 'Living & comfort',
  orderline: 'ORDER HOTLINE', hotlineNote: 'Fictional number · please do not call',
  trainerCode: 'ITEM 001 · FITNESS & LEISURE', trainerTitle: 'Less belly.<br>Same sofa.', trainerArt: 'THE ORIGINAL. SINCE WHAT FEELS LIKE FOREVER.',
  trainerCopy: 'The home trainer for big intentions and small living rooms. Foldable, padded and surprisingly good at holding your laundry.',
  feature1: 'Padded headrest', feature2: 'Fits behind almost any sofa', feature3: 'Motivation sold separately', burst: 'AS SEEN<br>ON TV!',
  trainerAlt: 'Illustration of a red abdominal trainer with a curved steel frame',
  priceLabel: 'OUR PRICE', stock: '● In stock', shipping: 'Incl. VAT · plus €4.90 shipping per order', add: 'Add to basket', delivery: 'Delivery: 3–5 working days · 30-day returns',
  noteHierarchy: 'Analysis: visual hierarchy', noteAction: 'Analysis: purchase decision', noteTrust: 'Analysis: trust and advertising',
  more: 'YOU NEED THESE TOO!', moreAside: 'Discovered on the shopping channel.',
  eggCode: 'ITEM 002 · KITCHEN', eggTitle: 'One small crack.<br>One perfect egg.', eggCopy: 'Precision eggshell cracker. A very long name for a very small job.', eggAlt: 'Illustration of a breakfast egg and a precision eggshell cracker',
  addShort: 'Bag it ↗', candleCode: 'ITEM 003 · LIVING', candleTitle: 'Smells like<br>absolutely nothing.', candleCopy: '“Tap Water” scented candles. Three pieces of quiet enthusiasm.', candleAlt: 'Illustration of three cream-coloured pillar candles',
  returns: 'day returns', nonsense: 'unnecessarily good', ideas: 'good intentions',
  fiction: 'Fictional shop · no real sales · identical prices in both views.',
  lab: 'THE STUDY WITHIN THE STUDY', analysisTitle: 'Newer is not<br>an argument.',
  analysisIntro: 'Choose a number in the shop or explore a design decision here. These are hypotheses, not measured test results.', topics: 'Analysis topics', hierarchy: 'Hierarchy', decision: 'Decision', trust: 'Trust',
  testLabel: 'TRY IT YOURSELF / NOT A BENCHMARK', testTitle: 'One egg. One price. One purchase.',
  testCopy: 'Find the egg tool, work out the total including shipping and add it to your basket. Repeat in the other layout. Where did you have to search? Your second attempt already benefits from knowing the shop.',
  archive: '↖ Back to the archive', footer: 'A design interpretation. Not a reconstruction of historical brand websites.',
  basketTitle: 'All packed up.', close: 'Close ×', demo: 'A demo basket. Your order remains an idea.', total: 'Total including shipping', clear: 'Empty basket',
};
const german = {
  editionNew: 'ONLINESHOP · AUSGABE 2026', editionMix: 'DESIGNLABOR · GEMISCHTE AUSGABE', light: 'Hell',
};

/** Die Gegenüberstellung bewertet konkrete Entscheidungen statt pauschal eine Epoche. */
const notes = {
  hierarchy: {
    de: ['Wenn alles ruft, was hörst du zuerst?', 'Rubriken, Angebotsband und roter Titel schaffen viele Einstiegspunkte. Das dichte Raster hält mehrere Angebote gleichzeitig im Blick – lässt sie aber um Aufmerksamkeit konkurrieren.', 'Das Produktbild bekommt Raum. Titel, Beschreibung und Preis bilden eine klarere Reihenfolge. Ruhigere Flächen lassen den Kaufbutton stärker hervortreten.', 'Die Kehrseite: Mehr Weißraum bedeutet weniger Angebote pro Bildschirm und mehr Scrollen. Dichte kann bei gezieltem Vergleichen nützlich sein.'],
    en: ['When everything shouts, what do you hear first?', 'Categories, an offer banner and a red heading create many entry points. The dense grid keeps several offers in view, but makes them compete for attention.', 'The product image gets room. Heading, description and price form a clearer sequence. Calmer surfaces make the purchase button stand out.', 'The trade-off: more whitespace means fewer offers per screen and more scrolling. Density can help deliberate comparison.'],
  },
  action: {
    de: ['Ein Button braucht einen klaren Auftrag.', 'Die Bestellung ist direkt benannt und der Preis deutlich. Rahmen und Signalfarben machen die Aktion erkennbar. Diese grundlegenden UX-Prinzipien sind keine neue Erfindung.', 'Der rote Hauptbutton ist auf einer ruhigen Fläche leichter zu isolieren. Preis, Versand und Lieferzeit bleiben beieinander. Der Warenkorb behält seine Position und seinen Inhalt beim Umbau.', 'Die Kehrseite: Ein schöner Button löst keine unklaren Kosten. Versand und Rückgabe stehen deshalb bewusst in beiden Versionen. Eine bessere Erfolgsquote müsste man mit Nutzertests prüfen.'],
    en: ['A button needs a clear job.', 'The order action is explicitly named and the price is prominent. Borders and signal colours identify the action. These basic UX principles are not a new invention.', 'The red primary button is easier to isolate on a calm surface. Price, shipping and delivery stay together. The basket keeps its location and content during the redesign.', 'The trade-off: a beautiful button does not solve unclear costs. Shipping and returns are deliberately present in both versions. A higher success rate would need user testing.'],
  },
  trust: {
    de: ['Ist das Information oder nur ein Versprechen?', 'Hotline, Artikelnummern und Versandhaus-Rubriken übertragen vertraute Katalogmuster ins Web. Der TV-Stern betont Bekanntheit, sagt aber nichts über Qualität aus.', 'Serviceinformationen werden ruhiger gruppiert. Die Werbung drängt weniger nach vorn. Auch heute kann eine schlichte Oberfläche mit großen Zahlen unbewiesene Sicherheit suggerieren.', 'Die Kehrseite: Minimalismus ist kein Vertrauensbeweis. »100 % unnötig gut« ist in beiden Versionen ein Werbespruch. Beide Ansichten behalten moderne Tastaturbedienung und mobile Anpassungen.'],
    en: ['Is that information or just a promise?', 'A hotline, item numbers and mail-order categories bring familiar catalogue patterns to the web. The TV badge emphasises recognition, but says nothing about quality.', 'Service information is grouped more calmly. Advertising is less prominent. Even today, a simple surface with large numbers can suggest unproven reassurance.', 'The trade-off: minimalism does not prove trustworthiness. “100% unnecessarily good” is advertising in both versions. Both views retain modern keyboard access and mobile adaptations.'],
  },
};

/** Zusätzliche Startseiteninhalte bleiben im selben kleinen Laufzeitmodul. */
Object.assign(english, {
  aiImage: 'AI-generated product image', utility: 'Your mail-order store on the world wide web!', newLink: 'NEW arrivals', serviceLink: 'Customer service',
  searchLabel: 'Search the catalogue', searchPlaceholder: 'What is missing from your happiness?', search: 'Search ↗', newNav: '★ NEW ARRIVALS ★',
  sideHeadline: 'STOP WAITING.<br>START WONDERING!', sideCopy: 'Our daily programme: small problems, surprisingly big solutions.', sideCta: 'See our recommendations »',
  visitor: 'YOU ARE VISITOR NO.', counterNote: 'Decoration. No tracking.', campaignLabel: 'Teleshop offers', chooseOffer: 'Choose an offer', previousOffer: 'Previous offer', nextOffer: 'Next offer', onAir: '● OUR SHOP WINDOW',
  promoLabel: 'Small problems, big offers', promo1Tag: 'THE SOFA REVOLUTION', promo1Title: 'Big ambitions?<br>Small living room.', promo1Copy: 'Ab Wonder 3000 · €39.90 ↗',
  promo2Tag: 'BREAKFAST AT LAST!', promo2Title: 'No more shells<br>in your happiness.', promo2Copy: 'Our egg helper · €14.90 ↗',
  promo3Tag: 'FOR ALL THE SENSES. ALMOST.', promo3Title: 'More atmosphere.<br>Less aroma.', promo3Copy: 'Three candles · €19.90 ↗',
  newSticker: 'NE<br>W!', newEyebrow: 'SMALL INVENTION. GREAT BREAKFAST.', newTitle: 'Had enough<br>of the shell game?',
  newLead: 'Does breakfast already raise the big questions of life? Why does the shell splinter? Why always on my fingers?',
  newCopy: 'Try the precision eggshell cracker! Place the bell on the egg, lift the ball and let go. Breakfast now has a predetermined breaking point. Your Monday, unfortunately, does not.',
  step1: 'Position. No diploma required.', step2: 'Lift. Keep your composure.', step3: 'Click. Enjoy your breakfast.', newCta: 'Pack some egg happiness ↗',
  footerPitch: 'Life is complicated.<br>Shopping can be simple.', footerStory: 'Since what feels like 1998, we have found solutions to problems you never knew you had. With heart, homeware and a healthy dose of shopping television.',
  footerSeal: 'YOUR TRUST IS WORTH AN OFFER.', range: 'Product range', shopHome: 'Home', shippingLink: 'Shipping & delivery', returnsLink: 'Returns & satisfaction', aboutLink: 'About telekauf.',
  newsletterTitle: 'Offers instead of boredom.', newsletterCopy: 'The newsletter for things you never knew you did not need.', email: 'Your email address', subscribe: 'Sign me up ↗', newsletterDemo: 'A demo only. Nothing is sent or stored.',
  imageCredits: 'Image disclosure: AI-generated product photos', inspectorLabel: 'B² / LIVE UX INSPECTOR', inspectorTitle: 'THIS DESIGN UNDER THE MICROSCOPE',
  inspectorNote: 'Design hypotheses, not measured test results. The line follows the highlighted element as you scroll.', closeAnalysis: 'Close analysis',
  noteDensity: 'Analysis: information density', noteImagery: 'Analysis: product imagery', noteNavigation: 'Analysis: navigation', density: 'Information density', imagery: 'Imagery', navigation: 'Navigation',
});
german.searchPlaceholder = 'Was fehlt Ihnen noch zum Glück?';

/** Drei manuell bedienbare Kampagnen; keine automatische Bewegung oder Zeitknappheit. */
const campaigns = [
  { product: 'egg', target: '#new-arrivals',
    de: ['JETZT NEU IM SORTIMENT!', 'Schluss mit<br>der Eierkrise.', 'Tut Ihnen vom Eierklopfen schon der Zeigefinger weh?', 'Die Schale splittert. Der Löffel rutscht. Muss das sein? Entdecken Sie den Eierschalensollbruchstellenverursacher. Ein Zug. Ein Klack. Frühstück!', 'Jetzt unkompliziert genießen ↗', 'DAS EI<br>DES KOLUMBUS!'],
    en: ['JUST ADDED TO OUR RANGE!', 'End the<br>egg crisis.', 'Is tapping breakfast eggs giving your finger a workout?', 'The shell splinters. The spoon slips. Must it be this way? Discover the precision eggshell cracker. One pull. One click. Breakfast!', 'Enjoy the easy way ↗', 'AN EGG-<br>CELLENT IDEA!'] },
  { product: 'trainer', target: '#hero-product',
    de: ['UNSER FITNESS-KLASSIKER!', 'Ihr Sofa ruft.<br>Ihr Bauch auch.', 'Sie möchten etwas bewegen – aber bitte nicht die Möbel?', 'Bauchwunder 3000 ist da! Gepolsterte Griffe, große Versprechen und ein Ehrenplatz im Wohnzimmer. Trainieren Sie Ihren Ehrgeiz. Oder legen Sie erst mal Ihre Jacke ab.', 'Das Bauchgefühl entdecken ↗', 'GROSSE<br>VORSÄTZE!'],
    en: ['OUR FITNESS CLASSIC!', 'Your sofa calls.<br>So do your abs.', 'Want to get something moving – preferably not the furniture?', 'Meet Ab Wonder 3000! Padded grips, big promises and pride of place in your living room. Exercise your ambition. Or put your jacket on it first.', 'Discover that gut feeling ↗', 'BIG<br>INTENTIONS!'] },
  { product: 'candle', target: '#candle-product',
    de: ['WOHLFÜHLEN IM 3ER-SET!', 'Riechen Sie<br>schon nichts?', 'Zu viel Vanille? Zu viel Lavendel? Zu viel von allem?', 'Gönnen Sie Ihrer Nase eine Pause. Unsere Duftkerzen »Leitungswasser« bringen warmes Licht und die aufregende Duftnote: nichts. Jetzt dreifach unaufdringlich.', 'Atmosphäre einpacken ↗', 'DUFTNOTE:<br>NICHTS!'],
    en: ['COMFORT IN A SET OF THREE!', 'Smell<br>nothing yet?', 'Too much vanilla? Too much lavender? Too much everything?', 'Give your nose a break. Our “Tap Water” candles bring warm light and the exciting fragrance of nothing. Now three times as unobtrusive.', 'Pack some atmosphere ↗', 'SCENT:<br>NOTHING!'] },
];

/** Zusätzliche Analyseziele vergleichen konkrete Muster der Shop-Startseite. */
Object.assign(notes, {
  density: {
    de: ['Drei Angebote. Drei Lautstärken.', 'Gelb, Cyan und Magenta, viele Rahmen und mehrere Schlagzeilen simulieren die Konkurrenz eines Versandhauskatalogs. Man sieht viel auf einmal, hat aber wenig visuelle Ruhe.', 'Die drei Angebote teilen sich dieselbe ruhige Fläche. Abstand, Schriftgröße und Trennlinien übernehmen die Ordnung. Die Hauptkampagne bleibt leichter als Einstieg erkennbar.', 'Weniger Reize sind nicht automatisch mehr Orientierung. Wer mehrere Preise vergleichen will, kann von einem dichten Raster profitieren.'],
    en: ['Three offers. Three volumes.', 'Yellow, cyan and magenta, multiple frames and headlines simulate a competing mail-order catalogue. A lot is visible at once, with little visual rest.', 'The offers share a calm surface. Spacing, type scale and separators provide order. The main campaign remains easier to identify as an entry point.', 'Fewer stimuli do not automatically mean better orientation. People comparing several prices may benefit from a dense grid.'],
  },
  imagery: {
    de: ['Dasselbe Sortiment. Ein anderer Auftritt.', 'Direktblitz, bunte Stoffbahnen und hartes Licht simulieren billige Katalogfotografie. Das Produkt ist erkennbar, konkurriert aber mit seinem Hintergrund.', 'Weiches Licht, ein ruhiger Hintergrund und bewusste Materialdarstellung konzentrieren den Blick auf das Produkt. Die Fotos verändern die wahrgenommene Wertigkeit.', 'Beide Bildserien sind KI-generierte Inszenierungen. Sie sind keine dokumentarischen Fotos oder Nachweise realer Produkte; einzelne Formen können zwischen den Motiven abweichen.'],
    en: ['Same range. A different presence.', 'Direct flash, coloured fabric and hard light simulate cheap catalogue photography. The product is recognisable but competes with its background.', 'Soft light, a quiet backdrop and careful material rendering focus attention on the object. The photos change perceived value.', 'Both image sets are AI-generated interpretations, not documentary photography or evidence of real products. Individual shapes may vary between shots.'],
  },
  navigation: {
    de: ['Ein Katalog braucht Wegweiser.', 'Die linke Rubrikenspalte, blaue Links und Bestellhotline simulieren frühe tabellarische Seiten. Vertraute Katalogkategorien geben Orientierung; zusätzliche Werbung beansprucht denselben Platz.', 'Die Rubriken wandern in eine horizontale Navigation. Eine Suche im Kopf und Serviceinformationen im Footer verteilen die Aufgaben klarer.', 'Das alte Tabellengefühl wird mit modernem semantischem HTML und CSS simuliert. Layouttabellen, blinkende Texte und unbedienbare Links sind dafür nicht erforderlich.'],
    en: ['A catalogue needs signposts.', 'A left category column, blue links and a hotline simulate early table-based pages. Familiar catalogue categories offer orientation, while extra advertising competes for the same space.', 'Categories move into a horizontal navigation. Header search and footer service information distribute the tasks more clearly.', 'The old table-based atmosphere is simulated with modern semantic HTML and CSS. Layout tables, blinking text and inaccessible links are not required.'],
  },
});

/** Alle sechs kleinen WebP-Dateien vor einem Bildwechsel decodieren. */
const photosReady = Promise.all(Object.keys(products).flatMap((product) => ['retro', 'modern'].map((era) => {
  const image = new Image();
  image.src = `assets/${product}-${era}.webp`;
  return typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve();
})));

/**
 * Eine gemeinsame Verzögerungstabelle hält native Snapshots und FLIP synchron.
 * Rahmen und Navigation rasten zuerst ein, Bilder folgen, dann Texte und Aktionen.
 */
const MORPH_DELAYS = Object.freeze({
  brand: 0, strip: 30, navigation: 60,
  'campaign-art': 140, promos: 160, 'trainer-art': 180, 'new-photo': 220,
  egg: 220, 'campaign-copy': 240, heading: 280, candle: 300,
  description: 320, 'new-copy': 360, search: 360, basket: 380,
  'campaign-controls': 400, service: 420, purchase: 440, footer: 480,
});
const segmentedEasing = 'linear(0, 0 9%, .15 22%, .15 28%, .9 68%, 1.025 85%, 1)';
const pieceEasing = window.CSS?.supports?.('animation-timing-function', segmentedEasing)
  ? segmentedEasing : 'cubic-bezier(.4,0,.25,1.18)';
document.documentElement.style.setProperty('--piece-easing', pieceEasing);
const timingStyle = document.createElement('style');
timingStyle.dataset.morphTiming = '';
timingStyle.textContent = Object.entries(MORPH_DELAYS).map(([name, delay]) => `
  ::view-transition-group(shop-${name}),
  ::view-transition-old(shop-${name}),
  ::view-transition-new(shop-${name}) { animation-delay: ${delay}ms; animation-fill-mode: both; }
`).join('');
document.head.append(timingStyle);

/** Erfasst nur feste, vom Projekt gelieferte Texte; keine Nutzereingaben als HTML. */
for (const element of document.querySelectorAll('[data-i18n]')) {
  german[element.dataset.i18n] = element.innerHTML;
}
for (const element of document.querySelectorAll('[data-i18n-aria]')) {
  german[element.dataset.i18nAria] = element.getAttribute('aria-label');
}
for (const element of document.querySelectorAll('[data-morph]')) {
  element.style.viewTransitionName = `shop-${element.dataset.morph}`;
}

/** Liefert einen kontrollierten Übersetzungstext. */
function text(key) {
  return (language === 'de' ? german : english)[key] ?? key;
}

/** Formatiert Geld aus Cent, ohne Fließkomma-Arithmetik im Warenkorb. */
function money(cents) {
  return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

/** Aktualisiert Sprachen und abhängige UI-Texte; Shop-Elemente bleiben erhalten. */
function renderLanguage() {
  document.documentElement.lang = language;
  for (const element of document.querySelectorAll('[data-i18n]')) element.innerHTML = text(element.dataset.i18n);
  for (const element of document.querySelectorAll('[data-i18n-aria]')) element.setAttribute('aria-label', text(element.dataset.i18nAria));
  for (const element of document.querySelectorAll('[data-i18n-placeholder]')) element.placeholder = text(element.dataset.i18nPlaceholder);
  byId('campaign').setAttribute('aria-roledescription', language === 'de' ? 'Karussell' : 'carousel');
  for (const element of document.querySelectorAll('[data-price]')) element.textContent = money(products[element.dataset.price].price);
  renderSlide(false);
  renderPhotoAlts();
  byId('newsletter-status').textContent = '';
  byId('search-results').hidden = true;
  if (byId('info-dialog').open) renderInfo();
  byId('language-toggle').textContent = language === 'de' ? 'EN' : 'DE';
  byId('language-toggle').lang = language === 'de' ? 'en' : 'de';
  byId('language-toggle').setAttribute('aria-label', language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln');
  document.title = language === 'de' ? 'TELESHOP — Gleiche Ware. Neue Regeln.' : 'TELESHOP — Same goods. New rules.';
  document.querySelector('.product-name').textContent = products.trainer[language];
  const prices = [byId('hero-product').querySelector('.hero-price'), byId('egg-product').querySelector('.small-buy strong'), byId('candle-product').querySelector('.small-buy strong')];
  Object.values(products).forEach((product, index) => { prices[index].textContent = money(product.price); });
  renderState();
  renderNote();
  renderCart();
  renderTheme();
}

/** Spiegelt ausschließlich den aktuellen Gestaltungszustand in Attribute und Controls. */
function renderState() {
  const count = layers.filter((key) => design[key]).length;
  const era = count === 0 ? '1998' : count === 3 ? '2026' : 'MIX';
  for (const key of layers) {
    store.dataset[key] = design[key] ? 'new' : 'old';
  }
  document.documentElement.dataset.progress = count === 0 ? 'old' : count === 3 ? 'modern' : 'mix';
  byId('era-output').value = era;
  for (const modal of document.querySelectorAll('dialog')) modal.dataset.era = design.focus ? 'modern' : 'retro';
  byId('frame-era').textContent = text(count === 0 ? 'editionOld' : count === 3 ? 'editionNew' : 'editionMix');
  byId('store-year').textContent = era === 'MIX' ? '1998 / 2026' : era;
  byId('transform').setAttribute('aria-pressed', String(count === 3));
  byId('transform').innerHTML = `${language === 'de' ? (count === 3 ? 'Zurück nach 1998' : 'Ab ins Jetzt') : (count === 3 ? 'Back to 1998' : 'Into the present')} <span aria-hidden="true">${count === 3 ? '↶' : '↗'}</span>`;
}

/** Sperrt nur zustandsändernde Laborcontrols während eines laufenden Umbaus. */
function lockControls(locked) {
  busy = locked;
  byId('transform').setAttribute('aria-busy', String(locked));
  store.toggleAttribute('inert', locked);
  store.setAttribute('aria-busy', String(locked));
  for (const control of document.querySelectorAll('#transform, #language-toggle, #theme-toggle')) control.disabled = locked;
}

/**
 * Animiert dieselben Elemente zwischen zwei Rasterzuständen.
 * Native View Transitions staffeln benannte Elemente nach MORPH_DELAYS. Ohne Unterstützung
 * interpoliert FLIP ihre Position und Größe über die Web Animations API.
 * Bei reduzierter Bewegung wird ausschließlich der Endzustand gesetzt.
 * @param {DesignState} next Nächster Zustand aller drei Gestaltungsebenen.
 */
async function transform(next) {
  if (busy) return;
  lockControls(true);
  const duration = 400;
  document.documentElement.style.setProperty('--morph-duration', `${duration}ms`);
  const update = () => { design = next; renderState(); };
  document.documentElement.dataset.morphing = 'true';
  scheduleAnalysis();
  try {
    await photosReady;
    if (reducedMotion.matches || document.hidden) {
      update();
    } else if (typeof document.startViewTransition === 'function') {
      activeTransition = document.startViewTransition(update);
      await activeTransition.finished;
    } else {
      const elements = [...document.querySelectorAll('[data-morph]')];
      const before = elements.map((element) => element.getBoundingClientRect());
      update();
      activeAnimations = elements.flatMap((element, index) => {
        const previous = before[index];
        const current = element.getBoundingClientRect();
        if (!previous.width || !previous.height || !current.width || !current.height || typeof element.animate !== 'function') return [];
        return [element.animate([
          { transform: `translate(${previous.left - current.left}px, ${previous.top - current.top}px) scale(${previous.width / current.width}, ${previous.height / current.height})`, transformOrigin: 'top left' },
          { transform: 'none', transformOrigin: 'top left' },
        ], { duration, delay: MORPH_DELAYS[element.dataset.morph] || 0, easing: pieceEasing, fill: 'backwards' })];
      });
      await Promise.allSettled(activeAnimations.map((animation) => animation.finished));
    }
  } catch {
    /* Ein abgebrochener Browserübergang darf den Zielzustand nicht verhindern. */
    update();
  } finally {
    activeTransition = null;
    activeAnimations = [];
    lockControls(false);
    document.documentElement.dataset.morphing = 'false';
    scheduleAnalysis();
    byId('state-announcement').textContent = `${language === 'de' ? 'Ansicht' : 'View'}: ${byId('era-output').value}.`;
  }
}

/** Bricht laufende Bewegung ab, wenn sich Nutzerpräferenz oder Sichtbarkeit ändert. */
function stopMotion() {
  activeTransition?.skipTransition();
  for (const animation of activeAnimations) animation.cancel();
}
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stopMotion(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopMotion(); });
window.addEventListener('resize', stopMotion);

/** Zeigt eine konkrete Vorher-/Nachher-Beobachtung samt Gegenargument. */
function renderNote() {
  const [title, before, after, tradeoff] = notes[selectedNote][language];
  byId('note-title').textContent = title;
  byId('note-before').textContent = before;
  byId('note-after').textContent = after;
  byId('note-tradeoff').textContent = tradeoff;
  for (const button of document.querySelectorAll('.note-tabs button')) button.setAttribute('aria-pressed', String(button.dataset.note === selectedNote));
  scheduleAnalysis();
}

/** Analyse bleibt optional und verändert keine Produkt- oder Warenkorbdaten. */
function setAnalysis(open) {
  byId('analysis-toggle').setAttribute('aria-pressed', String(open));
  byId('analysis-panel').hidden = !open;
  document.documentElement.dataset.analysis = String(open);
  byId('analysis-dimmer').hidden = !open;
  byId('analysis-connector').hidden = !open;
  byId('analysis-highlight').hidden = !open;
  if (open) scheduleAnalysis();
}

/** Theme wechselt die Studienoberfläche und die modernisierte Shop-Farbwelt. */
function renderTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  byId('theme-toggle').textContent = text(dark ? 'light' : 'dark');
  byId('theme-toggle').setAttribute('aria-pressed', String(dark));
}

/** Erzeugt den Warenkorb mit DOM-Methoden; Artikelnamen sind keine HTML-Templates. */
function renderCart() {
  const list = byId('basket-items');
  list.replaceChildren();
  let count = 0;
  let subtotal = 0;
  for (const [id, quantity] of cart) {
    const product = products[id];
    count += quantity;
    subtotal += quantity * product.price;
    const row = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = `${quantity} × ${product[language]}`;
    const price = document.createElement('strong');
    price.textContent = money(product.price * quantity);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '−';
    remove.dataset.remove = id;
    remove.setAttribute('aria-label', `${language === 'de' ? 'Ein Stück entfernen:' : 'Remove one:'} ${product[language]}`);
    row.append(name, price, remove);
    list.append(row);
  }
  if (!count) {
    const empty = document.createElement('li');
    empty.textContent = language === 'de' ? 'Noch keine Wunder im Warenkorb.' : 'No wonders in your basket yet.';
    list.append(empty);
  } else {
    const shipping = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = language === 'de' ? 'Versand pro Bestellung' : 'Shipping per order';
    const price = document.createElement('strong');
    price.textContent = money(490);
    shipping.append(name, price);
    list.append(shipping);
  }
  byId('basket-count').textContent = String(count);
  byId('basket-total').textContent = money(subtotal + (count ? 490 : 0));
  byId('basket-clear').disabled = count === 0;
}

/** Kündigt die letzte Warenkorbänderung an, ohne den Tastaturfokus zu verschieben. */
function announceAdded() {
  clearTimeout(toastTimeout);
  byId('toast').textContent = language === 'de' ? 'Eingepackt. Nur im Demo-Warenkorb.' : 'Packed. In the demo basket only.';
  byId('toast').classList.add('visible');
  toastTimeout = setTimeout(() => byId('toast').classList.remove('visible'), 2600);
}

/** Liefert lokalisierte Fotobeschreibungen; die KI-Kennzeichnung bleibt im Bildrahmen sichtbar. */
function photoAlt(product) {
  const labels = language === 'de'
    ? { trainer: 'Roter Bauchtrainer mit Stahlrahmen', egg: 'Eierhelfer aus Edelstahl mit Frühstücksei', candle: 'Drei Stumpenkerzen mit Wasserglas' }
    : { trainer: 'Red abdominal trainer with a steel frame', egg: 'Stainless steel egg topper beside a breakfast egg', candle: 'Three pillar candles beside a glass of water' };
  return labels[product];
}

/** CSS blendet jeweils eine Fotoepoche aus; nur die sichtbare gelangt in den Accessibility Tree. */
function renderPhotoAlts() {
  for (const image of document.querySelectorAll('[data-photo-alt]')) image.alt = photoAlt(image.dataset.photoAlt);
}

/** Tauscht Kampagnentexte und Motive, ohne Controls oder Fokus neu zu erzeugen. */
function renderSlide(announce = true) {
  const campaign = campaigns[slideIndex];
  const ids = ['campaign-kicker', 'campaign-title', 'campaign-problem', 'campaign-copy', 'campaign-link', 'campaign-stamp'];
  ids.forEach((id, index) => { byId(id).innerHTML = campaign[language][index]; });
  byId('campaign-link').href = campaign.target;
  for (const era of ['retro', 'modern']) {
    const image = document.querySelector(`.campaign-art .photo-${era}`);
    const source = `assets/${campaign.product}-${era}.webp`;
    if (image.getAttribute('src') !== source) image.src = source;
    image.dataset.photoAlt = campaign.product;
    image.alt = photoAlt(campaign.product);
  }
  for (const button of document.querySelectorAll('[data-slide]')) {
    button.setAttribute('aria-pressed', String(Number(button.dataset.slide) === slideIndex));
    button.setAttribute('aria-label', `${language === 'de' ? 'Angebot' : 'Offer'} ${Number(button.dataset.slide) + 1}: ${products[campaigns[Number(button.dataset.slide)].product][language]}`);
  }
  if (announce) byId('slide-status').textContent = `${slideIndex + 1} / 3: ${products[campaign.product][language]}`;
  scheduleAnalysis();
}

/** Ein einzelner geplanter Frame bündelt Scroll-, Resize- und Größenänderungen. */
function scheduleAnalysis() {
  if (analysisFrame || byId('analysis-panel').hidden) return;
  analysisFrame = requestAnimationFrame(() => { analysisFrame = 0; positionAnalysis(); });
}

/**
 * Verankert den Infokasten am gewählten Element und aktualisiert die SVG-Verbindung.
 * Der Kasten bleibt im Viewport; außerhalb liegende Ziele werden am Rand verankert.
 * Keine automatische Themenumschaltung: eine bewusste Auswahl bleibt beim Scrollen erhalten.
 */
function positionAnalysis() {
  const panel = byId('analysis-panel');
  if (panel.hidden) return;
  const target = document.querySelector(`[data-inspect='${selectedNote}']`);
  const rect = target.getBoundingClientRect();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const margin = 12;
  const panelWidth = Math.min(370, width - margin * 2);
  const topLimit = Math.min(height * .35, Math.max(76, document.querySelector('.lab-bar').getBoundingClientRect().bottom + 12));
  panel.style.width = `${panelWidth}px`;
  panel.style.maxHeight = `${height - topLimit - margin}px`;
  const panelHeight = Math.min(panel.offsetHeight || 470, height - topLimit - margin);
  const rightSpace = width - rect.right;
  const leftSpace = rect.left;
  const onRight = rightSpace >= panelWidth + 24 || (leftSpace < panelWidth + 24 && rect.left < width * .5);
  let x = onRight ? rect.right + 24 : rect.left - panelWidth - 24;
  x = Math.max(margin, Math.min(width - panelWidth - margin, x));
  let y = Math.max(topLimit, Math.min(height - panelHeight - margin, rect.top));
  if (width < 700) { x = width - panelWidth - margin; y = height - panelHeight - margin; }
  panel.style.left = `${x}px`;
  panel.style.top = `${Math.max(margin, y)}px`;
  const morphing = document.documentElement.dataset.morphing === 'true';
  const visible = rect.bottom > topLimit && rect.top < height && rect.width > 0;
  const left = Math.max(0, rect.left - 5);
  const top = Math.max(topLimit, rect.top - 5);
  const right = Math.min(width, rect.right + 5);
  const bottom = Math.min(height, rect.bottom + 5);
  const shade = `M 0 0 H ${width} V ${height} H 0 Z`;
  const spotlight = visible && !morphing ? ` M ${left} ${top} H ${right} V ${bottom} H ${left} Z` : '';
  byId('analysis-shade').setAttribute('d', shade + spotlight);
  byId('analysis-connector').hidden = morphing || !visible;
  byId('analysis-highlight').hidden = morphing || !visible;
  if (!visible || morphing) return;
  const targetX = Math.max(4, Math.min(width - 4, onRight ? rect.right : rect.left));
  const targetY = Math.max(topLimit, Math.min(height - margin, rect.top + Math.min(rect.height / 2, 120)));
  const panelX = onRight ? x : x + panelWidth;
  const panelY = Math.max(y + 20, Math.min(y + panelHeight - 20, targetY));
  const elbow = targetX + (panelX - targetX) * .5;
  byId('connector-path').setAttribute('d', `M ${targetX} ${targetY} H ${elbow} V ${panelY} H ${panelX}`);
  byId('connector-dot').setAttribute('cx', String(targetX));
  byId('connector-dot').setAttribute('cy', String(targetY));
  Object.assign(byId('analysis-highlight').style, {
    left: `${rect.left - 3}px`, top: `${Math.max(topLimit, rect.top - 3)}px`, width: `${rect.width + 6}px`,
    height: `${Math.max(0, Math.min(height, rect.bottom + 3) - Math.max(topLimit, rect.top - 3))}px`,
  });
}

/** Schließt den nichtmodalen Inspector mit Fokus-Rückgabe an seinen Auslöser. */
function closeAnalysis() {
  setAnalysis(false);
  (analysisTrigger || byId('analysis-toggle')).focus({ preventScroll: true });
}

/** Sucht in Produktnamen und sichtbaren Artikeltexten statt eine zweite Produktliste zu pflegen. */
function searchCatalogue() {
  const query = byId('search-input').value.trim().toLocaleLowerCase(language);
  const results = byId('search-results');
  results.replaceChildren();
  results.hidden = false;
  const ids = { trainer: 'hero-product', egg: 'egg-product', candle: 'candle-product' };
  const matches = query ? Object.keys(products).filter((id) => `${products[id][language]} ${byId(ids[id]).textContent}`.toLocaleLowerCase(language).includes(query)) : [];
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = query ? `${matches.length} ${language === 'de' ? 'Treffer im Katalog' : 'catalogue results'}` : (language === 'de' ? 'Bitte einen Suchbegriff eingeben.' : 'Please enter a search term.');
  results.append(status);
  for (const id of matches) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${products[id][language]} · ${money(products[id].price)} ↗`;
    button.addEventListener('click', () => {
      results.hidden = true;
      const target = byId(ids[id]);
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
    });
    results.append(button);
  }
}

/** Sichtbare Service-Dialoge bleiben ausdrücklich Informationen über einen Demo-Shop. */
function renderInfo() {
  const copy = {
    delivery: { de: ['Versand & Lieferung', 'Demo-Konditionen: 4,90 € Versand pro Bestellung, unabhängig von der Artikelzahl. Die angegebenen 3–5 Werktage gehören zum fiktiven Shop. Es wird nichts verschickt.'], en: ['Shipping & delivery', 'Demo terms: €4.90 shipping per order, regardless of item count. The stated 3–5 working days belong to the fictional shop. Nothing will be shipped.'] },
    returns: { de: ['Rückgabe & Zufriedenheit', '30 Tage Rückgabe sind Teil der fiktiven Shop-Kommunikation. Da kein Kauf stattfindet, entstehen hier weder eine Bestellung noch ein Rücksendevorgang.'], en: ['Returns & satisfaction', '30-day returns are part of the fictional shop communication. Since no purchase takes place, no order or return process is created.'] },
    about: { de: ['Über telekauf.', 'Ein frei erfundenes Versandhaus in einer Designstudie von Benjamin Bennewitz. Werbetexte sind Satire. Die 90er-Stimmung wird mit modernem HTML und CSS simuliert; sie rekonstruiert keine konkrete historische Website.'], en: ['About telekauf.', 'An entirely fictional mail-order retailer in a design study by Benjamin Bennewitz. Advertising copy is satire. The 1990s atmosphere is simulated with modern HTML and CSS, not a reconstruction of a specific historical website.'] },
    images: { de: ['KI-generierte Produktfotos', 'Alle sechs Produktmotive wurden mit KI erzeugt: drei bewusst billige Retro-Kataloginszenierungen und drei moderne Studioinszenierungen. Die Bilder zeigen fiktive Produkte, keine historischen Aufnahmen oder dokumentarischen Produktnachweise.'], en: ['AI-generated product photos', 'All six product images were generated with AI: three deliberately low-budget retro catalogue interpretations and three contemporary studio interpretations. They depict fictional products, not historical photographs or documentary product evidence.'] },
  };
  const [title, body] = copy[infoKey][language];
  byId('info-title').textContent = title;
  byId('info-copy').textContent = body;
}

byId('slide-prev').addEventListener('click', () => { slideIndex = (slideIndex + 2) % 3; renderSlide(); });
byId('slide-next').addEventListener('click', () => { slideIndex = (slideIndex + 1) % 3; renderSlide(); });
for (const button of document.querySelectorAll('[data-slide]')) button.addEventListener('click', () => { slideIndex = Number(button.dataset.slide); renderSlide(); });
byId('campaign').addEventListener('keydown', (event) => {
  if (!event.target.closest('.campaign-controls') || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  slideIndex = (slideIndex + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
  renderSlide();
  document.querySelector(`[data-slide='${slideIndex}']`).focus();
});
byId('shop-search').addEventListener('submit', (event) => { event.preventDefault(); searchCatalogue(); });
byId('newsletter').addEventListener('submit', (event) => {
  event.preventDefault();
  byId('newsletter-status').textContent = language === 'de' ? 'Vorgemerkt – nur als Demo. Keine Anmeldung, kein Versand.' : 'Noted – as a demo only. No subscription, no email.';
  byId('newsletter').reset();
});
for (const button of document.querySelectorAll('[data-info]')) button.addEventListener('click', () => { infoKey = button.dataset.info; renderInfo(); byId('info-dialog').showModal(); });
byId('info-close').addEventListener('click', () => byId('info-dialog').close());
window.addEventListener('scroll', scheduleAnalysis, { passive: true });
window.addEventListener('resize', scheduleAnalysis);
if (typeof ResizeObserver === 'function') {
  const observer = new ResizeObserver(scheduleAnalysis);
  observer.observe(store);
  observer.observe(byId('analysis-panel'));
}
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!byId('analysis-panel').hidden && !dialog.open && !byId('info-dialog').open) closeAnalysis();
  byId('search-results').hidden = true;
});

byId('transform').addEventListener('click', () => {
  const modern = !layers.every((key) => design[key]);
  void transform({ layout: modern, type: modern, focus: modern });
});
byId('language-toggle').addEventListener('click', () => { language = language === 'de' ? 'en' : 'de'; renderLanguage(); });
byId('theme-toggle').addEventListener('click', () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  renderTheme();
});
byId('analysis-toggle').addEventListener('click', () => {
  analysisTrigger = byId('analysis-toggle');
  setAnalysis(byId('analysis-panel').hidden);
  if (!byId('analysis-panel').hidden) byId('analysis-close').focus({ preventScroll: true });
});
byId('analysis-close').addEventListener('click', closeAnalysis);
for (const button of document.querySelectorAll('[data-note]')) {
  button.addEventListener('click', () => {
    selectedNote = button.dataset.note;
    setAnalysis(true);
    renderNote();
    if (button.classList.contains('annotation')) {
      analysisTrigger = button;
      byId('analysis-close').focus({ preventScroll: true });
    } else {
      document.querySelector(`[data-inspect='${selectedNote}']`).scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
    }
  });
}
for (const button of document.querySelectorAll('[data-add]')) {
  button.addEventListener('click', () => {
    const id = button.dataset.add;
    cart.set(id, (cart.get(id) || 0) + 1);
    renderCart();
    announceAdded();
  });
}
byId('basket-open').addEventListener('click', () => { renderCart(); dialog.showModal(); });
byId('basket-close').addEventListener('click', () => dialog.close());
byId('basket-clear').addEventListener('click', () => { cart.clear(); renderCart(); byId('basket-close').focus(); });
byId('basket-items').addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  const id = button.dataset.remove;
  const quantity = cart.get(id);
  if (quantity > 1) cart.set(id, quantity - 1);
  else cart.delete(id);
  renderCart();
  const next = [...byId('basket-items').querySelectorAll('[data-remove]')].find((element) => element.dataset.remove === id);
  (next || byId('basket-close')).focus();
});
renderLanguage();
