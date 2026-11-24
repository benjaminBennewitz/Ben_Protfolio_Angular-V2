/**
 * @file Sprache, Farbschema und Seitennavigation für Casa al Detewitz.
 * @author Benjamin Bennewitz
 */

/** Englische Entsprechungen der deutschen HTML-Inhalte und Metadaten. */
const english = {
  "hero.cta": "Explore the menu",
  "nav.visit": "Visit",
  "imageCredit": "AI portrait",
  "hero.slides.0.alt": "Set tables and tubular steel chairs in front of a round red doorway",
  "hero.slides.1.alt": "Handmade tortello with herbs on a light-coloured plate",
  "hero.slides.2.alt": "Negroni with orange zest on a cobalt-blue bar counter at dusk",
  "heroSlide1": "The dining room",
  "heroSlide2": "On the plate",
  "heroSlide3": "Before the first course",
  "previousImage": "Previous image",
  "nextImage": "Next image",
  "menu.pages.0.dishes.0.notes": "Rosemary · whipped porcini butter",
  "menu.pages.0.dishes.1.name": "Beetroot",
  "menu.pages.0.dishes.1.notes": "Stracciatella · blood orange · hazelnut",
  "menu.pages.0.dishes.2.notes": "Pumpkin · brown butter · sage",
  "menu.pages.0.note": "To begin",
  "menu.pages.0.title": "First bites",
  "menu.pages.1.dishes.0.name": "Pike-perch",
  "menu.pages.1.dishes.0.notes": "Celeriac · verjuice · capers",
  "menu.pages.1.dishes.1.name": "Veal",
  "menu.pages.1.dishes.1.notes": "Salsify · polenta · Marsala",
  "menu.pages.1.dishes.2.name": "Lower Rhine cheeses",
  "menu.pages.1.dishes.2.notes": "Quince · walnut bread",
  "menu.pages.1.note": "Between the Rhine and the Po",
  "menu.pages.1.title": "Main courses",
  "menu.pages.2.dishes.0.name": "Pear al Marsala",
  "menu.pages.2.dishes.0.notes": "Vanilla · buckwheat · fior di latte",
  "menu.pages.2.dishes.1.notes": "Amaretti · dark chocolate",
  "menu.pages.2.dishes.2.name": "Espresso or amaro",
  "menu.pages.2.dishes.2.notes": "Alcohol-free option on request",
  "menu.pages.2.note": "Something sweet",
  "menu.pages.2.title": "To finish",
  "previousChapter": "Previous chapter",
  "nextChapter": "Next chapter",
  "footer.days": "Thursday to Sunday",
  "footer.time": "6–10 pm",
  "archive": "Back to archive",
  "navLabel": "Main navigation",
  "galleryLabel": "Views of the restaurant",
  "menu.label": "Menu chapter",
  "footer.top": "Back to top",
  "about.alt": "Julius Benenwitz and Paula Detering stand back to back, fold their arms and look into the camera.",
  "space.outside.alt": "White modernist building with a lit circular window and a brick-red entrance at dusk",
  "space.inside.alt": "View through a brick-red circular portal towards set tables in warm evening light",
  "skip": "Skip to content",
  "nav.house": "The house",
  "nav.impressions": "At the table",
  "nav.menu": "Menu",
  "hero.intro": "Two culinary traditions, one signature. An evening of Italian ease and German seasonal cooking.",
  "about.heading": "Two chefs.\nOne casa.",
  "about.text": "Julius Benenwitz and Paula Detering cook side by side. Their surnames became Detewitz. Their cooking brings Italian craft and Lower Rhine produce to the same table.",
  "impressions.heading": "An evening at Casa.",
  "menu.heading": "The menu.",
  "menu.intro": "From the first bite to the last glass. Leaf through our seasonal menu.",
  "menu.cover": "Winter menu",
  "menu.price": "€135 per person",
  "space.heading": "Form and space.",
  "space.outside.title": "A red entrance.",
  "space.outside.text": "The entrance draws a red rectangle in the white building. Beside it, the circular window forms a second frame. At dusk it opens a view of the set tables.",
  "space.inside.title": "Through the circle.",
  "space.inside.text": "The dining room opens up behind the circular doorway. Slim tubular chairs keep sightlines clear. In the evening, the lamps cast pools of light on the tables.",
  "footer.hours": "Dinner service",
  "footer.place": "Lower Rhine, Germany",
  "footer.fiction": "Fictional restaurant · Design study",
  "hero.category": "Italian–German fine dining",
  "about.kicker": "The house",
  "impressions.kicker": "Impressions",
  "menu.kicker": "Tasting menu",
  "space.kicker": "Architecture",
  "darkTheme": "Dark theme",
  "title": "Casa al Detewitz | Italian–German fine dining",
  "description": "Casa al Detewitz. A fictional restaurant study on Italian–German fine dining and Bauhaus design.",
  "ogDescription": "Italian–German fine dining. Two chefs under one roof.",
  "about.julius.role": "Head chef · Pasta and sauces",
  "about.julius.bio": "After training in the Lower Rhine region, Julius spent several years working in Bologna. He learned to roll different pasta doughs by hand and developed a taste for slow-cooked sauces. At Casa he applies those techniques to regional ingredients.",
  "about.paula.role": "Head chef · Vegetables and seasonality",
  "about.paula.bio": "Paula trained in Düsseldorf. Time in South Tyrol and the Rhineland shaped her approach to vegetables and preserving. She plans the menu around what local farms have available and adds contrast with preserves, ferments and fresh herbs.",
  "gallery.food.alt": "Handmade tortello in brown butter with sage",
  "gallery.food.title": "Tortello al burro",
  "gallery.bar.alt": "Bar with a blue counter, round pendants and illuminated bottles",
  "gallery.bar.title": "The bar",
  "gallery.dessert.alt": "Marsala-poached pear with fior di latte and crisp buckwheat",
  "gallery.dessert.title": "Pear al Marsala",
  "gallery.evening.alt": "Candlelit tables and guests with a slight motion blur",
  "gallery.evening.title": "Evening in the dining room",
  "gallery.kitchen.alt": "Chefs and servers in motion at the illuminated kitchen pass",
  "gallery.kitchen.title": "The open kitchen",
  "gallery.wine.alt": "A glass of white wine being poured in warm light",
  "gallery.wine.title": "Wine at the table",
  "gallery.drink.alt": "Negroni with orange zest on the bar counter",
  "gallery.drink.title": "Negroni della Casa",
  "gallery.pasta.alt": "A hand dusting fresh pasta with flour",
  "gallery.pasta.title": "Pasta by hand",
  "gallery.hero.alt": "A set table and tubular steel chairs in the sunlight",
  "gallery.hero.title": "Before service",
  "menu.info": "Reservations & allergens",
  "menu.sheet": "Tasting menu courses",
  "menu.booking.title": "Reservations",
  "menu.booking.text": "Fictional restaurant. Bookings cannot be made on this website.",
  "menu.allergens.title": "Allergens & intolerances",
  "menu.allergens.text": "This sample menu does not list all allergens or possible traces."
};

// Dokumentelemente für Einstellungen und Übersetzungen.
const root = document.documentElement;
const languageButton = document.querySelector('#language');
const themeButton = document.querySelector('#theme');
const description = document.querySelector('meta[name="description"]');
const socialDescription = document.querySelector('meta[property="og:description"]');
const themeColor = document.querySelector('meta[name="theme-color"]');
const germanMetadata = {
  title: document.title,
  description: description.content,
  ogDescription: socialDescription.content,
};
const localized = [
  ...collectTranslations('copy'),
  ...collectTranslations('alt', 'alt'),
  ...collectTranslations('label', 'aria-label'),
];

// Elemente für Hero und Speisekarte.
const heroSlides = [...document.querySelectorAll('[data-slide]')];
const transitionShapes = [...document.querySelectorAll('.hero-transition span')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const sliderControls = document.querySelector('.hero-controls');
const slideCount = sliderControls.querySelector('.hero-count');
const slideTitle = sliderControls.querySelector('.hero-title');
const slideButtons = sliderControls.querySelectorAll('[data-slide-step]');
const menuSheet = document.querySelector('#menuseite');
const menuPages = [...menuSheet.querySelectorAll('[data-menu-page]')];
const menuControls = document.querySelector('.menu-controls');
const menuTabs = [...menuControls.querySelectorAll('[data-menu-index]')];
const menuPrevious = menuControls.querySelector('[data-menu-step="-1"]');
const menuNext = menuControls.querySelector('[data-menu-step="1"]');
const menuStatus = document.querySelector('.menu-status');
const menuNotes = document.querySelector('#menue-hinweise');
const menuNoteToggle = document.querySelector('.menu-note-toggle');
const mobileViewport = window.matchMedia('(max-width: 39rem)');

// Lokale Wahl mit Rückgriff auf die Einstellungen des Portfolios.
const languageKey = 'casa-al-detewitz-language';
const themeKey = 'casa-al-detewitz-theme';
let language = readPreference(languageKey, 'bp-language') === 'en' ? 'en' : 'de';
let dark = readPreference(themeKey, 'bp-theme') === 'dark';
let activeSlide = 0;
let requestedSlide = 0;
let sliderBusy = false;
let activePage = 0;

/**
 * Speichert die deutschen Ausgangstexte für den Sprachwechsel.
 * @param {'copy'|'alt'|'label'} hook Übersetzungsschlüssel im data-Attribut.
 * @param {string} [attribute] Attribut, falls der Text nicht direkt im Element steht.
 * @returns {{element: Element, key: string, original: string|null, attribute?: string}[]} Übersetzbare Einträge.
 */
function collectTranslations(hook, attribute) {
  return [...document.querySelectorAll(`[data-${hook}]`)].map((element) => ({
    element,
    key: element.getAttribute(`data-${hook}`),
    original: attribute ? element.getAttribute(attribute) : element.textContent,
    attribute,
  }));
}

/**
 * Liest eine lokale Einstellung mit Rückgriff auf das Portfolio.
 * @param {string} key Schlüssel der Studie.
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
 * Speichert die Auswahl für spätere Aufrufe.
 * @param {string} key Schlüssel der Studie.
 * @param {string} value Gewählter Wert.
 */
function writePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sprach- und Farbwechsel bleiben für den aktuellen Aufruf verfügbar.
  }
}

/** Übersetzt Inhalte, Bedienhinweise und Dokumentmetadaten. */
function applyLanguage() {
  const isEnglish = language === 'en';
  root.lang = language;
  const metadata = isEnglish ? english : germanMetadata;
  document.title = metadata.title;
  description.content = metadata.description;
  socialDescription.content = metadata.ogDescription;

  for (const { element, key, original, attribute } of localized) {
    const value = isEnglish ? english[key] : original;
    if (attribute) {
      element.setAttribute(attribute, value);
    } else {
      element.textContent = value;
    }
  }

  languageButton.textContent = isEnglish ? 'DE' : 'EN';
  languageButton.lang = isEnglish ? 'de' : 'en';
  languageButton.setAttribute('aria-label', isEnglish ? 'Auf Deutsch wechseln' : 'Switch to English');
  updateSlide();
  updateMenu();
}

/** Passt das Farbschema der Seite und die Rückmeldung des Schalters an. */
function applyTheme() {
  root.dataset.theme = dark ? 'dark' : 'light';
  themeColor.content = dark ? '#1d1a17' : '#f3ede1';
  themeButton.setAttribute('aria-pressed', String(dark));
}

/** Zeigt das gewählte Bild und setzt den Titel für die Statusansage. */
function updateSlide() {
  for (const [index, slide] of heroSlides.entries()) {
    slide.hidden = index !== activeSlide;
  }
  slideCount.textContent = `0${activeSlide + 1} / 0${heroSlides.length}`;
  slideTitle.textContent = language === 'en'
    ? english[`heroSlide${activeSlide + 1}`]
    : heroSlides[activeSlide].dataset.caption;
}

/**
 * Lässt die Formen mit versetzten Startzeiten wachsen oder sich zurückziehen.
 * @param {boolean} cover Ob die Formen das Bild bedecken sollen.
 * @returns {Animation[]} Animationen der einzelnen Formen.
 */
function animateSlideShapes(cover) {
  return transitionShapes.map((shape, index) => {
    const radius = getComputedStyle(shape).getPropertyValue('--shape-radius').trim();
    const collapsed = { transform: 'scale(0)', borderRadius: radius, opacity: 0 };
    const expanded = { transform: 'scale(1)', borderRadius: '0%', opacity: 1 };
    const frames = cover ? [collapsed, expanded] : [expanded, collapsed];
    return shape.animate(frames, {
      duration: cover ? 320 : 270,
      delay: cover ? 28 * index : 70 + 28 * (transitionShapes.length - index - 1),
      easing: cover ? 'cubic-bezier(.25, .65, .27, 1)' : 'cubic-bezier(.48, 0, .72, .46)',
      fill: 'both',
    });
  });
}

/** Wechselt das Motiv erst unter voller Abdeckung und berücksichtigt weitere Bildwünsche. */
async function showRequestedSlide() {
  if (sliderBusy) {
    return;
  }

  sliderBusy = true;
  try {
    while (activeSlide !== requestedSlide) {
      const nextIndex = requestedSlide;
      if (reducedMotion.matches || typeof transitionShapes[0].animate !== 'function') {
        activeSlide = nextIndex;
        updateSlide();
        continue;
      }

      const nextImage = heroSlides[nextIndex];
      nextImage.loading = 'eager';
      const decoded = await nextImage.decode().then(() => true, () => false);
      if (nextIndex !== requestedSlide) {
        continue;
      }
      if (!decoded) {
        requestedSlide = activeSlide;
        continue;
      }

      const enter = animateSlideShapes(true);
      await Promise.all(enter.map((animation) => animation.finished));
      activeSlide = nextIndex;
      updateSlide();

      const leave = animateSlideShapes(false);
      enter.forEach((animation) => animation.cancel());
      await Promise.all(leave.map((animation) => animation.finished));
      leave.forEach((animation) => animation.cancel());
    }
  } finally {
    sliderBusy = false;
  }
}

/** Zeigt das gewählte Menükapitel und aktualisiert seine Bedienelemente. */
function updateMenu() {
  const chapterChanged = menuPages[activePage].hidden;
  for (const [index, page] of menuPages.entries()) {
    page.hidden = index !== activePage;
    menuTabs[index].setAttribute('aria-current', index === activePage ? 'page' : 'false');
  }
  if (chapterChanged) {
    menuSheet.scrollTop = 0;
  }
  menuPrevious.setAttribute('aria-disabled', String(activePage === 0));
  menuNext.setAttribute('aria-disabled', String(activePage === menuPages.length - 1));
  const heading = menuPages[activePage].querySelector('h3').textContent;
  menuStatus.textContent = `${heading}. ${activePage + 1} / ${menuPages.length}`;
}

/** Zeigt Menühinweise auf schmalen Displays in einem nativen Popover. */
function applyMenuNotesLayout() {
  const canOpenPopover = mobileViewport.matches && typeof menuNotes.showPopover === 'function';
  if (canOpenPopover) {
    menuNotes.setAttribute('popover', 'auto');
  } else {
    menuNotes.removeAttribute('popover');
  }
  menuNoteToggle.hidden = !canOpenPopover;
}

/** Initialisiert interaktive Bedienelemente und gibt sie nach der Einrichtung frei. */
function initialize() {
  languageButton.addEventListener('click', () => {
    language = language === 'de' ? 'en' : 'de';
    writePreference(languageKey, language);
    applyLanguage();
  });
  themeButton.addEventListener('click', () => {
    dark = !dark;
    writePreference(themeKey, dark ? 'dark' : 'light');
    applyTheme();
  });

  for (const button of slideButtons) {
    button.addEventListener('click', () => {
      requestedSlide = (requestedSlide + Number(button.dataset.slideStep) + heroSlides.length) % heroSlides.length;
      void showRequestedSlide();
    });
  }

  for (const button of [menuPrevious, menuNext]) {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') === 'true') {
        return;
      }
      activePage += Number(button.dataset.menuStep);
      updateMenu();
    });
  }
  for (const [index, button] of menuTabs.entries()) {
    button.addEventListener('click', () => {
      activePage = index;
      updateMenu();
    });
  }

  mobileViewport.addEventListener('change', applyMenuNotesLayout);
  applyMenuNotesLayout();
  applyTheme();
  applyLanguage();
  menuSheet.classList.add('is-interactive');
  menuSheet.tabIndex = 0;
  for (const control of [languageButton, themeButton, sliderControls, menuControls]) {
    control.hidden = false;
  }
}

initialize();
