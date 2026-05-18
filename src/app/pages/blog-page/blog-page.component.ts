/* src/app/pages/blog-page/blog-page.component.ts */

/**
 * @file Blog-Seite mit überlagernden Retro-Fenstern.
 * @description Rendert kurze CSS-, Angular- und DevTools-Snippets als stapelbare MS-DOS-/Win95-Fenster.
 */

import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { SystemToastService } from '../../core/services/system-toast.service';

/** Übersetzte Blog-Seitentexte. */
interface BlogPageTexts {
  /** Meta-Titel der Blog-Route. */
  readonly metaTitle: string;
  /** Meta-Description der Blog-Route. */
  readonly metaDescription: string;
  /** Linklabel zurück zur Startseite. */
  readonly backLabel: string;
  /** Kleine technische Beschriftung. */
  readonly eyebrow: string;
  /** Hauptüberschrift der Seite. */
  readonly title: string;
  /** Einleitung unter der Hauptüberschrift. */
  readonly intro: string;
  /** Titel der linken Eintragsliste. */
  readonly listTitle: string;
  /** Label für den Button, der alle Fenster öffnet. */
  readonly openAllLabel: string;
  /** Label für den Button, der alle Fenster schließt. */
  readonly closeAllLabel: string;
  /** Label für das Kopieren eines Code-Snippets. */
  readonly copyLabel: string;
  /** Meldung nach erfolgreichem Kopieren. */
  readonly copySuccess: string;
  /** Meldung, wenn keine Fenster geöffnet sind. */
  readonly emptyTitle: string;
  /** Hinweistext, wenn keine Fenster geöffnet sind. */
  readonly emptyText: string;
  /** Label für Browser-Support-Informationen. */
  readonly supportLabel: string;
  /** Label für den Notizbereich. */
  readonly notesLabel: string;
  /** Blogeinträge der aktuellen Sprache. */
  readonly entries: readonly BlogEntry[];
}

/** Einzelner kurzer Blog- oder Snippet-Eintrag. */
interface BlogEntry {
  /** Stabiler technischer Schlüssel. */
  readonly slug: string;
  /** Nummer zur visuellen Sortierung. */
  readonly index: string;
  /** Fenstertitel und Listentitel. */
  readonly title: string;
  /** Kurzer Untertitel im Fenster. */
  readonly subtitle: string;
  /** Kategorie des Eintrags. */
  readonly category: string;
  /** Kurzbeschreibung des Snippets. */
  readonly summary: string;
  /** Kleine technische Tags. */
  readonly tags: readonly string[];
  /** Lesbares Browser- oder Tool-Support-Label. */
  readonly support: string;
  /** Tonalität des Support-Badges. */
  readonly supportTone: 'stable' | 'experimental' | 'workflow';
  /** Sprache des Code-Beispiels. */
  readonly codeLanguage: string;
  /** Code-Beispiel des Eintrags. */
  readonly code: string;
  /** Kurze Hinweise zum Eintrag. */
  readonly notes: readonly string[];
}

/** Zustandsdaten eines geöffneten Blog-Fensters. */
interface BlogWindowState {
  /** Slug des gerenderten Eintrags. */
  readonly slug: string;
  /** Layer-Reihenfolge des Fensters. */
  readonly zIndex: number;
  /** Horizontale Offset-Position im Board. */
  readonly x: number;
  /** Vertikale Offset-Position im Board. */
  readonly y: number;
}

/** Gerendertes Fenster mit aufgelöstem Eintrag. */
interface RenderedBlogWindow {
  /** Fensterzustand. */
  readonly window: BlogWindowState;
  /** Zugehöriger Blogeintrag. */
  readonly entry: BlogEntry;
}

/** Blog-Ansicht mit stapelbaren Snippet-Fenstern. */
@Component({
  selector: 'bp-blog-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog-page.component.html',
  styleUrl: './blog-page.component.scss',
})
export class BlogPageComponent {
  /** Sprachservice für übersetzte Seitentexte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für routebezogene Meta-Daten. */
  private readonly seoService = inject(SeoService);

  /** Toast-Service für kleine Kopier- und Systemmeldungen. */
  private readonly toastService = inject(SystemToastService);

  /** Laufender Z-Index-Zähler für aktive Fenster. */
  private readonly zCounter = signal<number>(24);

  /** Aktuell geöffnete Blog-Fenster. */
  readonly openWindows = signal<readonly BlogWindowState[]>([
    { slug: 'flex-vs-grid', zIndex: 21, x: 18, y: 20 },
    { slug: 'css-can-count-elements', zIndex: 22, x: 70, y: 78 },
    { slug: 'native-select', zIndex: 23, x: 122, y: 136 },
  ]);

  /** Übersetzte Texte der aktuellen Sprache. */
  readonly texts = computed<BlogPageTexts>(() => BLOG_PAGE_TEXTS[this.languageService.language()]);

  /** Sichtbare Fenster mit zugehörigem Eintrag. */
  readonly visibleWindows = computed<readonly RenderedBlogWindow[]>(() => this.openWindows()
    .map((window) => {
      const entry = this.findEntry(window.slug);
      return entry ? { window, entry } : null;
    })
    .filter((item): item is RenderedBlogWindow => item !== null));

  /** Synchronisiert Meta-Daten mit der aktuellen Sprache. */
  constructor() {
    effect(() => this.seoService.setPageSeo(this.texts().metaTitle, this.texts().metaDescription));
  }

  /** Öffnet ein Blog-Fenster oder bringt es nach vorne. */
  openEntry(slug: string): void {
    if (this.isEntryOpen(slug)) {
      this.focusWindow(slug);
      return;
    }

    const openCount = this.openWindows().length;
    const positionIndex = openCount % this.texts().entries.length;

    this.openWindows.update((windows) => [
      ...windows,
      {
        slug,
        zIndex: this.nextZIndex(),
        x: 20 + positionIndex * 52,
        y: 24 + positionIndex * 58,
      },
    ]);
  }

  /** Öffnet alle Einträge als bewusst überlagerte Fenster. */
  openAllEntries(): void {
    const windows = this.texts().entries.map((entry, index) => ({
      slug: entry.slug,
      zIndex: this.nextZIndex(),
      x: 18 + index * 46,
      y: 20 + index * 48,
    }));

    this.openWindows.set(windows);
  }

  /** Schließt alle geöffneten Fenster. */
  closeAllEntries(): void {
    this.openWindows.set([]);
  }

  /** Schließt ein einzelnes Fenster. */
  closeEntry(slug: string, event?: Event): void {
    event?.stopPropagation();
    this.openWindows.update((windows) => windows.filter((window) => window.slug !== slug));
  }

  /** Bringt ein Fenster in den Vordergrund. */
  focusWindow(slug: string): void {
    this.openWindows.update((windows) => windows.map((window) => window.slug === slug
      ? { ...window, zIndex: this.nextZIndex() }
      : window));
  }

  /** Kopiert das Code-Beispiel eines Eintrags in die Zwischenablage. */
  async copyCode(entry: BlogEntry, event: Event): Promise<void> {
    event.stopPropagation();

    if (!navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(entry.code);
    this.toastService.show({
      icon: 'content_copy',
      title: 'snippet copied',
      message: this.texts().copySuccess,
      tone: 'system',
    });
  }

  /** Prüft, ob ein Eintrag bereits geöffnet ist. */
  isEntryOpen(slug: string): boolean {
    return this.openWindows().some((window) => window.slug === slug);
  }

  /** Liefert einen eindeutigen TrackBy-Wert für Fenster. */
  trackWindow(item: RenderedBlogWindow): string {
    return item.entry.slug;
  }

  /** Sucht einen Eintrag in der aktiven Sprache. */
  private findEntry(slug: string): BlogEntry | undefined {
    return this.texts().entries.find((entry) => entry.slug === slug);
  }

  /** Erzeugt den nächsten sichtbaren Layer-Wert. */
  private nextZIndex(): number {
    const nextIndex = this.zCounter() + 1;
    this.zCounter.set(nextIndex);
    return nextIndex;
  }
}

/** Übersetzte Blog-Inhalte. */
const BLOG_PAGE_TEXTS: Record<'de' | 'en', BlogPageTexts> = {
  de: {
    metaTitle: 'Blog | CSS, Angular und Web-Snippets | Benjamin Bennewitz',
    metaDescription: 'Kleine visuelle Blogeinträge mit CSS-, SCSS-, Angular-, Django- und DevTools-Snippets im überlagernden Retro-Fenster-Look.',
    backLabel: 'Zurück zur Experience',
    eyebrow: 'blog_windows.exe',
    title: 'Snippet-Blog im Fenster-Chaos.',
    intro: 'Kleine Beispiele, Browser-Checks und Frontend-Experimente. Kein Magazin, eher ein Stapel digitaler Notizzettel mit Code, Support-Hinweis und Retro-Overload.',
    listTitle: 'Einträge',
    openAllLabel: 'Alle Fenster öffnen',
    closeAllLabel: 'Alles schließen',
    copyLabel: 'Code kopieren',
    copySuccess: 'Code-Snippet wurde kopiert.',
    emptyTitle: 'Kein Fenster geöffnet.',
    emptyText: 'Wähle links einen Eintrag aus oder öffne direkt alle Fenster.',
    supportLabel: 'Support',
    notesLabel: 'Merken',
    entries: [
      {
        slug: 'flex-vs-grid',
        index: '01',
        title: 'Flex vs. Grid',
        subtitle: 'Wann Linie, wann Fläche?',
        category: 'CSS Layout',
        summary: 'Flexbox ist stark, wenn Inhalte in einer Achse fließen. Grid ist stärker, wenn ein echtes zweidimensionales Layout geplant wird.',
        tags: ['CSS', 'SCSS', 'Layout'],
        support: 'Sehr stabil',
        supportTone: 'stable',
        codeLanguage: 'scss',
        code: `.layout-flex {\n  display: flex;\n  gap: 1rem;\n  flex-wrap: wrap;\n}\n\n.layout-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}`,
        notes: [
          'Flexbox denkt in Haupt- und Querachse.',
          'Grid eignet sich besser für Kartenraster, Dashboardflächen und bewusst geplante Spalten.',
          'Beides darf kombiniert werden: Grid für die Fläche, Flex für Inhalte in der Karte.',
        ],
      },
      {
        slug: 'css-can-count-elements',
        index: '02',
        title: 'CSS kann Elemente zählen',
        subtitle: 'sibling-index() und sibling-count()',
        category: 'CSS Values Level 5',
        summary: 'Neue CSS-Funktionen können Position und Anzahl von Geschwisterelementen direkt in Berechnungen verwenden. Ideal für Stagger, Farbverläufe und dynamische Breiten ohne JavaScript.',
        tags: ['CSS', 'Experimental', 'No JS'],
        support: 'Modern Chromium, Fallback planen',
        supportTone: 'experimental',
        codeLanguage: 'css',
        code: `.stack > * {\n  --i: sibling-index();\n  --count: sibling-count();\n  width: calc(100% / var(--count));\n  transition-delay: calc(var(--i) * 70ms);\n}\n\n@supports not (width: calc(100% / sibling-count())) {\n  .stack > * {\n    width: auto;\n    transition-delay: 0ms;\n  }\n}`,
        notes: [
          'sibling-index() liefert die Position des aktuellen Elements.',
          'sibling-count() liefert die Anzahl der Geschwisterelemente inklusive aktuellem Element.',
          'Für produktive Projekte aktuell mit Fallback denken.',
        ],
      },
      {
        slug: 'native-select',
        index: '03',
        title: 'New native select',
        subtitle: 'appearance: base-select',
        category: 'CSS UI',
        summary: 'Native Selects werden deutlich besser stylbar. Mit base-select und ::picker(select) kann der sichtbare Button und der Picker stärker gestaltet werden.',
        tags: ['CSS', 'Forms', 'A11y'],
        support: 'Chromium zuerst, andere prüfen',
        supportTone: 'experimental',
        codeLanguage: 'css',
        code: `select.custom-select,\n::picker(select) {\n  appearance: base-select;\n}\n\nselect.custom-select {\n  border: 2px solid currentColor;\n  padding: 0.75rem 1rem;\n  background: Canvas;\n  color: CanvasText;\n}\n\n::picker(select) {\n  border: 2px solid currentColor;\n  padding: 0.5rem;\n}`,
        notes: [
          'Spannend für eigene Form-Designs ohne komplett custom Dropdown.',
          'Der Picker landet im Top Layer und verhält sich eher wie ein Popover.',
          'Noch nicht blind als universelles Formularfundament einsetzen.',
        ],
      },
      {
        slug: 'simple-css-spinner',
        index: '04',
        title: 'Simple CSS Loading Spinner',
        subtitle: 'Ein Loader ohne Library',
        category: 'Micro Interaction',
        summary: 'Ein kleiner Spinner braucht keine Abhängigkeit. Eine Border, ein Keyframe und ein Reduced-Motion-Fallback reichen für viele UI-Zustände völlig aus.',
        tags: ['CSS', 'Animation', 'A11y'],
        support: 'Sehr stabil',
        supportTone: 'stable',
        codeLanguage: 'css',
        code: `.spinner {\n  width: 2.5rem;\n  aspect-ratio: 1;\n  border: 3px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: spin 720ms linear infinite;\n}\n\n@keyframes spin {\n  to {\n    transform: rotate(1turn);\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .spinner {\n    animation: none;\n  }\n}`,
        notes: [
          'Für echte Statusmeldungen zusätzlich Text oder aria-live nutzen.',
          'Reduced Motion nicht vergessen.',
          'Für Skeletons oder Progress-States reicht oft eine kleinere Bewegung.',
        ],
      },
      {
        slug: 'angular-signals-workflow',
        index: '05',
        title: 'Signals Workflow',
        subtitle: 'Angular State ohne unnötiges Rauschen',
        category: 'Angular',
        summary: 'Signals halten lokalen UI-State sehr lesbar: signal() speichert, computed() leitet ab, effect() reagiert auf Änderungen außerhalb des Templates.',
        tags: ['Angular', 'Signals', 'State'],
        support: 'Aktueller Angular-Workflow',
        supportTone: 'workflow',
        codeLanguage: 'ts',
        code: `readonly count = signal<number>(0);\nreadonly doubled = computed<number>(() => this.count() * 2);\n\nincrement(): void {\n  this.count.update((value) => value + 1);\n}\n\nconstructor() {\n  effect(() => {\n    console.log('count changed', this.count());\n  });\n}`,
        notes: [
          'State wird dort gelesen, wo Angular ihn tracken kann.',
          'computed() eignet sich für reine Ableitungen.',
          'effect() sparsam nutzen: zum Beispiel für LocalStorage, Titel oder externe APIs.',
        ],
      },
      {
        slug: 'devmode-console-style',
        index: '06',
        title: 'DevMode activated',
        subtitle: 'Chrome-Konsole stylen',
        category: 'DevTools',
        summary: 'Mit %c lassen sich console.log-Ausgaben in Chrome DevTools gestalten. Praktisch für Debug-Banner, Feature-Flags oder interne Statusmeldungen.',
        tags: ['Chrome', 'DevTools', 'Debug'],
        support: 'Chrome DevTools',
        supportTone: 'workflow',
        codeLanguage: 'js',
        code: `const title = 'DEVMODE ACTIVATED';\nconst style = [\n  'background:#101010',\n  'color:#a7ff19',\n  'border:2px solid #a7ff19',\n  'padding:8px 12px',\n  'font-weight:900',\n  'letter-spacing:0.12em'\n].join(';');\n\nconsole.log('%c' + title, style);`,
        notes: [
          'Gut für lokale Debug-Hinweise, aber kein Ersatz für Logging-Konzept.',
          'Keine sensiblen Daten in die Konsole schreiben.',
          'Optische Konsolenmarker helfen bei komplexen Frontends enorm.',
        ],
      },
    ],
  },
  en: {
    metaTitle: 'Blog | CSS, Angular and Web Snippets | Benjamin Bennewitz',
    metaDescription: 'Small visual blog entries with CSS, SCSS, Angular, Django and DevTools snippets in an overloaded retro window interface.',
    backLabel: 'Back to the experience',
    eyebrow: 'blog_windows.exe',
    title: 'Snippet blog in window chaos.',
    intro: 'Small examples, browser checks and frontend experiments. Not a magazine, more like a stack of digital notes with code, support hints and retro overload.',
    listTitle: 'Entries',
    openAllLabel: 'Open all windows',
    closeAllLabel: 'Close all',
    copyLabel: 'Copy code',
    copySuccess: 'Code snippet copied.',
    emptyTitle: 'No window open.',
    emptyText: 'Pick an entry on the left or open all windows at once.',
    supportLabel: 'Support',
    notesLabel: 'Remember',
    entries: [
      {
        slug: 'flex-vs-grid',
        index: '01',
        title: 'Flex vs. Grid',
        subtitle: 'Line or surface?',
        category: 'CSS Layout',
        summary: 'Flexbox is strong when content flows along one axis. Grid is stronger when the layout needs a real two-dimensional structure.',
        tags: ['CSS', 'SCSS', 'Layout'],
        support: 'Very stable',
        supportTone: 'stable',
        codeLanguage: 'scss',
        code: `.layout-flex {\n  display: flex;\n  gap: 1rem;\n  flex-wrap: wrap;\n}\n\n.layout-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}`,
        notes: [
          'Flexbox works with a main and cross axis.',
          'Grid is better for card grids, dashboard areas and consciously planned columns.',
          'Both can be combined: Grid for the area, Flex for card content.',
        ],
      },
      {
        slug: 'css-can-count-elements',
        index: '02',
        title: 'CSS can count elements',
        subtitle: 'sibling-index() and sibling-count()',
        category: 'CSS Values Level 5',
        summary: 'New CSS functions can use the position and amount of sibling elements directly in calculations. Useful for stagger effects, color steps and dynamic widths without JavaScript.',
        tags: ['CSS', 'Experimental', 'No JS'],
        support: 'Modern Chromium, plan fallback',
        supportTone: 'experimental',
        codeLanguage: 'css',
        code: `.stack > * {\n  --i: sibling-index();\n  --count: sibling-count();\n  width: calc(100% / var(--count));\n  transition-delay: calc(var(--i) * 70ms);\n}\n\n@supports not (width: calc(100% / sibling-count())) {\n  .stack > * {\n    width: auto;\n    transition-delay: 0ms;\n  }\n}`,
        notes: [
          'sibling-index() returns the current element position.',
          'sibling-count() returns the number of sibling elements including the current one.',
          'For production work, keep a fallback for now.',
        ],
      },
      {
        slug: 'native-select',
        index: '03',
        title: 'New native select',
        subtitle: 'appearance: base-select',
        category: 'CSS UI',
        summary: 'Native selects are becoming much more styleable. With base-select and ::picker(select), both the visible control and picker can be customized further.',
        tags: ['CSS', 'Forms', 'A11y'],
        support: 'Chromium first, check others',
        supportTone: 'experimental',
        codeLanguage: 'css',
        code: `select.custom-select,\n::picker(select) {\n  appearance: base-select;\n}\n\nselect.custom-select {\n  border: 2px solid currentColor;\n  padding: 0.75rem 1rem;\n  background: Canvas;\n  color: CanvasText;\n}\n\n::picker(select) {\n  border: 2px solid currentColor;\n  padding: 0.5rem;\n}`,
        notes: [
          'Interesting for custom form design without a fully custom dropdown.',
          'The picker is rendered in the top layer and behaves more like a popover.',
          'Do not use it blindly as a universal form foundation yet.',
        ],
      },
      {
        slug: 'simple-css-spinner',
        index: '04',
        title: 'Simple CSS Loading Spinner',
        subtitle: 'A loader without a library',
        category: 'Micro Interaction',
        summary: 'A small spinner does not need a dependency. A border, one keyframe and a reduced-motion fallback are enough for many UI states.',
        tags: ['CSS', 'Animation', 'A11y'],
        support: 'Very stable',
        supportTone: 'stable',
        codeLanguage: 'css',
        code: `.spinner {\n  width: 2.5rem;\n  aspect-ratio: 1;\n  border: 3px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: spin 720ms linear infinite;\n}\n\n@keyframes spin {\n  to {\n    transform: rotate(1turn);\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .spinner {\n    animation: none;\n  }\n}`,
        notes: [
          'For real status feedback, add text or aria-live.',
          'Do not forget reduced motion.',
          'For skeletons or progress states, smaller movement is often enough.',
        ],
      },
      {
        slug: 'angular-signals-workflow',
        index: '05',
        title: 'Signals Workflow',
        subtitle: 'Angular state without unnecessary noise',
        category: 'Angular',
        summary: 'Signals keep local UI state readable: signal() stores, computed() derives and effect() reacts to changes outside the template.',
        tags: ['Angular', 'Signals', 'State'],
        support: 'Current Angular workflow',
        supportTone: 'workflow',
        codeLanguage: 'ts',
        code: `readonly count = signal<number>(0);\nreadonly doubled = computed<number>(() => this.count() * 2);\n\nincrement(): void {\n  this.count.update((value) => value + 1);\n}\n\nconstructor() {\n  effect(() => {\n    console.log('count changed', this.count());\n  });\n}`,
        notes: [
          'State is read where Angular can track it.',
          'computed() is ideal for pure derived values.',
          'Use effect() carefully: for localStorage, titles or external APIs.',
        ],
      },
      {
        slug: 'devmode-console-style',
        index: '06',
        title: 'DevMode activated',
        subtitle: 'Style the Chrome console',
        category: 'DevTools',
        summary: 'With %c, console.log output can be styled in Chrome DevTools. Useful for debug banners, feature flags or internal status messages.',
        tags: ['Chrome', 'DevTools', 'Debug'],
        support: 'Chrome DevTools',
        supportTone: 'workflow',
        codeLanguage: 'js',
        code: `const title = 'DEVMODE ACTIVATED';\nconst style = [\n  'background:#101010',\n  'color:#a7ff19',\n  'border:2px solid #a7ff19',\n  'padding:8px 12px',\n  'font-weight:900',\n  'letter-spacing:0.12em'\n].join(';');\n\nconsole.log('%c' + title, style);`,
        notes: [
          'Good for local debug hints, but not a replacement for logging architecture.',
          'Do not write sensitive data into the console.',
          'Visual console markers help a lot in complex frontends.',
        ],
      },
    ],
  },
};
