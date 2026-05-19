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
  /** Label der Suchleiste. */
  readonly searchLabel: string;
  /** Platzhalter der Suchleiste. */
  readonly searchPlaceholder: string;
  /** Label für die Ergebnisanzahl. */
  readonly searchResultLabel: string;
  /** Text, wenn keine Suche treffer liefert. */
  readonly emptySearchText: string;
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
  /** Label für den Vorschau-Bereich. */
  readonly previewLabel: string;
  /** Erklärung für Flex-Vorschau. */
  readonly previewFlexText: string;
  /** Erklärung für Grid-Vorschau. */
  readonly previewGridText: string;
  /** Erklärung für klassische Zähl-Vorschau. */
  readonly previewNthChildText: string;
  /** Erklärung für moderne Zähl-Vorschau. */
  readonly previewSiblingText: string;
  /** Erklärung für normales Native-Select als Ausgangszustand. */
  readonly previewDefaultSelectText: string;
  /** Erklärung für native Select-Vorschau. */
  readonly previewNativeSelectText: string;
  /** Label für alte Code-Variante. */
  readonly oldCodeLabel: string;
  /** Label für neue Code-Variante. */
  readonly newCodeLabel: string;
  /** Label für den Demo-Download. */
  readonly demoLabel: string;
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
  /** Klassische oder alte Code-Variante. */
  readonly oldCode: string;
  /** Moderne oder neue Code-Variante. */
  readonly newCode: string;
  /** Optionales Label für die linke Vergleichsspalte. */
  readonly oldCodeLabel?: string;
  /** Optionales Label für die rechte Vergleichsspalte. */
  readonly newCodeLabel?: string;
  /** Optionaler Downloadpfad für eine eigenständige Demo-Datei. */
  readonly demoHref?: string;
  /** Visueller Vorschau-Typ des Eintrags. */
  readonly previewType: 'layout' | 'count' | 'select' | 'spinner' | 'signals' | 'console';
  /** Kurze Hinweise zum Eintrag. */
  readonly notes: readonly string[];
}

/** Indexierter Blogeintrag für die performante Frontend-Suche. */
interface IndexedBlogEntry {
  /** Originaler Blogeintrag. */
  readonly entry: BlogEntry;
  /** Normalisierter Suchtext über Titel, Kategorie, Tags und Inhalt. */
  readonly searchText: string;
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

  /** Aktuelle Suchanfrage der Blog-Navigation. */
  readonly searchQuery = signal<string>('');

  /** Aktuell geöffnete Blog-Fenster. */
  readonly openWindows = signal<readonly BlogWindowState[]>([
    { slug: 'flex-vs-grid', zIndex: 21, x: 18, y: 18 },
    { slug: 'css-can-count-elements', zIndex: 22, x: 62, y: 62 },
    { slug: 'native-select', zIndex: 23, x: 106, y: 106 },
  ]);

  /** Übersetzte Texte der aktuellen Sprache. */
  readonly texts = computed<BlogPageTexts>(() => BLOG_PAGE_TEXTS[this.languageService.language()]);

  /** Vorberechneter Suchindex für schnelle Filterung auch bei deutlich mehr Einträgen. */
  readonly searchIndex = computed<readonly IndexedBlogEntry[]>(() => this.texts().entries.map((entry) => ({
    entry,
    searchText: this.normalizeSearchText([
      entry.index,
      entry.title,
      entry.subtitle,
      entry.category,
      entry.summary,
      entry.support,
      entry.demoHref ?? '',
      ...entry.tags,
      ...entry.notes,
    ].join(' ')),
  })));

  /** Gefilterte Einträge der Sidebar. */
  readonly filteredEntries = computed<readonly BlogEntry[]>(() => {
    const queryParts = this.normalizeSearchText(this.searchQuery()).split(' ').filter(Boolean);

    if (!queryParts.length) {
      return this.texts().entries;
    }

    return this.searchIndex()
      .filter((item) => queryParts.every((part) => item.searchText.includes(part)))
      .map((item) => item.entry);
  });

  /** Sichtbare Fenster mit zugehörigem Eintrag. */
  readonly visibleWindows = computed<readonly RenderedBlogWindow[]>(() => this.openWindows()
    .map((window) => {
      const entry = this.findEntry(window.slug);
      return entry ? { window, entry } : null;
    })
    .filter((item): item is RenderedBlogWindow => item !== null));

  /** Synchronisiert Meta-Daten mit der aktuellen Sprache. */
  constructor() {
    effect(() => this.seoService.setPageSeo(this.texts().metaTitle, this.texts().metaDescription, '/blog'));
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
        x: 18 + positionIndex * 44,
        y: 18 + positionIndex * 44,
      },
    ]);
  }

  /** Öffnet alle aktuell sichtbaren Einträge als bewusst überlagerte Fenster. */
  openAllEntries(): void {
    const windows = this.filteredEntries().map((entry, index) => ({
      slug: entry.slug,
      zIndex: this.nextZIndex(),
      x: 18 + index * 38,
      y: 18 + index * 38,
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

  /** Übernimmt den Suchbegriff aus dem Eingabefeld. */
  setSearchQuery(event: Event): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    this.searchQuery.set(input?.value ?? '');
  }

  /** Leert die Blog-Suche. */
  clearSearch(): void {
    this.searchQuery.set('');
  }

  /** Kopiert das Code-Beispiel eines Eintrags in die Zwischenablage. */
  async copyCode(entry: BlogEntry, event: Event): Promise<void> {
    event.stopPropagation();

    if (!navigator.clipboard) {
      return;
    }

    const oldLabel = entry.oldCodeLabel ?? this.texts().oldCodeLabel;
    const newLabel = entry.newCodeLabel ?? this.texts().newCodeLabel;

    await navigator.clipboard.writeText(`${oldLabel}\n${entry.oldCode}\n\n${newLabel}\n${entry.newCode}`);
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

  /** Normalisiert Suchtexte für stabile Frontend-Filterung. */
  private normalizeSearchText(value: string): string {
    return value
      .toLocaleLowerCase('de-DE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9äöüß\s#.+%-]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
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
    eyebrow: 'blog_index.exe',
    title: 'Code-Blog.',
    intro: 'Kurze Web-Notes, CSS-Neuerungen und kleine Workflow-Fenster mit Code, Vorschau und Support-Hinweis.',
    listTitle: 'Blog-Index',
    searchLabel: 'Blog durchsuchen',
    searchPlaceholder: 'Suche nach CSS, Angular, Spinner ...',
    searchResultLabel: 'Treffer',
    emptySearchText: 'Keine passenden Einträge gefunden.',
    openAllLabel: 'Alle Fenster öffnen',
    closeAllLabel: 'Alles schließen',
    copyLabel: 'Code kopieren',
    copySuccess: 'Alt- und Neu-Beispiel wurden kopiert.',
    emptyTitle: 'Kein Fenster aktiv.',
    emptyText: 'Wähle links einen Blogeintrag aus.',
    supportLabel: 'Support',
    previewLabel: 'Vorschau',
    previewFlexText: 'Eine Linie, flexible Verteilung.',
    previewGridText: 'Eine Fläche, geplante Zellen.',
    previewNthChildText: 'Jede Position muss manuell definiert werden.',
    previewSiblingText: 'Index und Anzahl kommen aus dem DOM.',
    previewDefaultSelectText: 'Funktioniert zuverlässig, bleibt aber visuell stark vom Browser und Betriebssystem geprägt.',
    previewNativeSelectText: 'Mehr Gestaltungsspielraum, ohne das Element komplett selbst nachzubauen.',
    oldCodeLabel: 'Alt / klassisch',
    newCodeLabel: 'Neu / besser',
    demoLabel: 'Demo-Datei',
    notesLabel: 'Merken',
    entries: [
      {
        slug: 'flex-vs-grid',
        index: '01',
        title: 'Flex vs. Grid',
        subtitle: 'Nicht neuer gegen älter, sondern Achse gegen Fläche.',
        category: 'CSS Layout',
        summary: 'Flexbox löst Verteilung entlang einer Linie: Navigationen, Button-Gruppen, Inhaltszeilen. Grid löst geplante Flächen: Kartenraster, Dashboards und Layouts, bei denen Reihen und Spalten gleichzeitig wichtig sind.',
        tags: ['CSS', 'SCSS', 'Layout'],
        support: 'Sehr stabil',
        supportTone: 'stable',
        codeLanguage: 'scss',
        previewType: 'layout',
        code: `.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
}`,
        oldCodeLabel: 'Flex: eine Achse',
        newCodeLabel: 'Grid: Fläche',
        oldCode: `.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .75rem;
}

.toolbar__spacer {
  margin-left: auto;
}`,
        newCode: `.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(7rem, auto);
  gap: 1rem;
}`,
        demoHref: 'assets/blog-demos/flex-vs-grid.html',
        notes: [
          'Flexbox ist ideal, wenn Inhalte auf einer Hauptachse verteilt werden müssen.',
          'Grid ist ideal, wenn die Gesamtfläche geplant wird und Spalten sowie Reihen zusammenarbeiten.',
          'In echten UIs ist die Kombination stark: Grid für das Grundlayout, Flex für Inhalt innerhalb einzelner Bereiche.',
        ],
      },
      {
        slug: 'css-can-count-elements',
        index: '02',
        title: 'CSS kann Elemente zählen',
        subtitle: 'sibling-index() und sibling-count() für positionierte UI-Muster.',
        category: 'CSS Values Level 5',
        summary: 'Der praktische Use-Case ist nicht nur ein Effekt: Karten können ihre Position und die Gesamtanzahl kennen. Dadurch lassen sich Stagger, Abstufungen, Zellenbreiten oder visuelle Gewichtungen ohne manuelle nth-child-Ketten erzeugen.',
        tags: ['CSS', 'Experimental', 'No JS'],
        support: 'Modern Chromium, Fallback planen',
        supportTone: 'experimental',
        codeLanguage: 'css',
        previewType: 'count',
        code: `.metric-grid > * {
  --i: sibling-index();
  --count: sibling-count();
  transition-delay: calc(var(--i) * 70ms);
}`,
        oldCode: `.metric-grid > *:nth-child(1) { --i: 1; }
.metric-grid > *:nth-child(2) { --i: 2; }
.metric-grid > *:nth-child(3) { --i: 3; }
.metric-grid > *:nth-child(4) { --i: 4; }`,
        newCode: `.metric-grid > * {
  --i: sibling-index();
  --count: sibling-count();
  background: rgba(167, 255, 25, calc(.20 + var(--i) / var(--count) * .70));
  transition-delay: calc(var(--i) * 70ms);
}`,
        demoHref: 'assets/blog-demos/css-can-count-elements.html',
        notes: [
          'sibling-index() liefert die Position des aktuellen Elements und startet bei 1.',
          'sibling-count() liefert die Anzahl der Geschwisterelemente inklusive aktuellem Element.',
          'Guter Use-Case: Kartenraster, gestaffelte Reveal-Animationen, dynamische Verläufe oder Gewichtungen ohne JavaScript.',
          'Für produktive Projekte aktuell mit @supports-Fallback denken.',
        ],
      },
      {
        slug: 'native-select',
        index: '03',
        title: 'Native Select 2.0',
        subtitle: 'Vom System-Select zum stärker gestaltbaren Native-Control.',
        category: 'CSS UI',
        summary: 'Der Vergleich ist wichtig: Ein normales Select ist robust, aber optisch begrenzt. appearance: base-select öffnet Button, Picker und Optionen für mehr Custom Styling, ohne direkt ein eigenes Dropdown mit JavaScript nachzubauen.',
        tags: ['CSS', 'Forms', 'A11y'],
        support: 'Eingeschränkter Support, progressiv einsetzen',
        supportTone: 'experimental',
        codeLanguage: 'css',
        previewType: 'select',
        code: `select.custom-select,
select.custom-select::picker(select) {
  appearance: base-select;
}`,
        oldCodeLabel: 'Vorher: normales Select',
        newCodeLabel: 'Nachher: base-select',
        oldCode: `<label>Projektart
  <select>
    <option>Website</option>
    <option>Web-App</option>
  </select>
</label>`,
        newCode: `select.custom-select,
select.custom-select::picker(select) {
  appearance: base-select;
}

select.custom-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid currentColor;
  border-radius: 999px;
  background: #101010;
  color: #a7ff19;
}

select.custom-select::picker-icon {
  color: currentColor;
}

select.custom-select:hover,
select.custom-select:open {
  background: #a7ff19;
  color: #101010;
}`,
        demoHref: 'assets/blog-demos/native-select.html',
        notes: [
          'Spannend für eigene Form-Designs ohne komplett selbst gebautes Dropdown.',
          'Der Picker landet im Top Layer und verhält sich eher wie ein Popover.',
          'Noch nicht blind als universelles Formularfundament einsetzen, sondern progressiv verbessern.',
        ],
      },
      {
        slug: 'simple-css-spinner',
        index: '04',
        title: 'CSS Loading Spinner',
        subtitle: 'Ein Loader ohne Library',
        category: 'Micro Interaction',
        summary: 'Ein kleiner Spinner braucht keine Abhängigkeit. Eine Border, ein Keyframe und ein Reduced-Motion-Fallback reichen für viele UI-Zustände völlig aus.',
        tags: ['CSS', 'Animation', 'A11y'],
        support: 'Sehr stabil',
        supportTone: 'stable',
        codeLanguage: 'css',
        previewType: 'spinner',
        code: `.spinner {\n  width: 2.5rem;\n  aspect-ratio: 1;\n  border: 3px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: spin 720ms linear infinite;\n}`,
        oldCode: `import Spinner from 'some-loader-package';\n\nexport function Loader() {\n  return <Spinner />;\n}`,
        newCode: `.spinner {\n  width: 2.5rem;\n  aspect-ratio: 1;\n  border: 3px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: spin 720ms linear infinite;\n}`,
        demoHref: 'assets/blog-demos/simple-css-spinner.html',
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
        previewType: 'signals',
        code: `readonly count = signal<number>(0);\nreadonly doubled = computed<number>(() => this.count() * 2);`,
        oldCode: `readonly count$ = new BehaviorSubject(0);\nreadonly doubled$ = this.count$.pipe(\n  map((value) => value * 2),\n);`,
        newCode: `readonly count = signal<number>(0);\nreadonly doubled = computed<number>(() => this.count() * 2);\n\nincrement(): void {\n  this.count.update((value) => value + 1);\n}`,
        demoHref: 'assets/blog-demos/angular-signals-workflow.ts',
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
        previewType: 'console',
        code: `console.log('%cDEVMODE ACTIVATED', style);`,
        oldCode: `console.log('devmode activated');\nconsole.log('feature flag enabled');`,
        newCode: `const style = [\n  'background:#101010',\n  'color:#a7ff19',\n  'border:2px solid #a7ff19',\n  'padding:8px 12px'\n].join(';');\n\nconsole.log('%cDEVMODE ACTIVATED', style);`,
        demoHref: 'assets/blog-demos/devmode-console-style.html',
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
    eyebrow: 'blog_index.exe',
    title: 'Code Blog.',
    intro: 'Short web notes, CSS updates and workflow windows with code, preview and support hints.',
    listTitle: 'Blog index',
    searchLabel: 'Search blog',
    searchPlaceholder: 'Search for CSS, Angular, spinner ...',
    searchResultLabel: 'Results',
    emptySearchText: 'No matching entries found.',
    openAllLabel: 'Open all windows',
    closeAllLabel: 'Close all',
    copyLabel: 'Copy code',
    copySuccess: 'Old and new example copied.',
    emptyTitle: 'No active window.',
    emptyText: 'Pick a blog entry on the left.',
    supportLabel: 'Support',
    previewLabel: 'Preview',
    previewFlexText: 'One line, flexible distribution.',
    previewGridText: 'One surface, planned cells.',
    previewNthChildText: 'Every position has to be defined manually.',
    previewSiblingText: 'Index and count come from the DOM.',
    previewDefaultSelectText: 'Reliable functionality, but the visual result is still strongly shaped by the browser and operating system.',
    previewNativeSelectText: 'More visual control without rebuilding the entire dropdown yourself.',
    oldCodeLabel: 'Old / classic',
    newCodeLabel: 'New / better',
    demoLabel: 'Demo file',
    notesLabel: 'Remember',
    entries: [
      {
        slug: 'flex-vs-grid',
        index: '01',
        title: 'Flex vs. Grid',
        subtitle: 'Not old versus new, but axis versus surface.',
        category: 'CSS Layout',
        summary: 'Flexbox solves distribution along one line: navigations, button groups and content rows. Grid solves planned surfaces: card grids, dashboards and layouts where rows and columns matter at the same time.',
        tags: ['CSS', 'SCSS', 'Layout'],
        support: 'Very stable',
        supportTone: 'stable',
        codeLanguage: 'scss',
        previewType: 'layout',
        code: `.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
}`,
        oldCodeLabel: 'Flex: one axis',
        newCodeLabel: 'Grid: surface',
        oldCode: `.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .75rem;
}

.toolbar__spacer {
  margin-left: auto;
}`,
        newCode: `.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(7rem, auto);
  gap: 1rem;
}`,
        demoHref: 'assets/blog-demos/flex-vs-grid.html',
        notes: ['Flexbox is ideal when content is distributed on one main axis.', 'Grid is ideal when the whole area is planned and columns plus rows work together.', 'In real interfaces, combining both is strong: Grid for the layout, Flex for content inside areas.'],
      },
      {
        slug: 'css-can-count-elements',
        index: '02',
        title: 'CSS can count elements',
        subtitle: 'sibling-index() and sibling-count() for position-aware UI patterns.',
        category: 'CSS Values Level 5',
        summary: 'The practical use case is not just an effect: cards can know their position and the total amount of siblings. That enables stagger, intensity, cell width or visual weighting without manual nth-child chains.',
        tags: ['CSS', 'Experimental', 'No JS'],
        support: 'Modern Chromium, plan fallback',
        supportTone: 'experimental',
        codeLanguage: 'css',
        previewType: 'count',
        code: `.metric-grid > * {
  --i: sibling-index();
  --count: sibling-count();
  transition-delay: calc(var(--i) * 70ms);
}`,
        oldCode: `.metric-grid > *:nth-child(1) { --i: 1; }
.metric-grid > *:nth-child(2) { --i: 2; }
.metric-grid > *:nth-child(3) { --i: 3; }
.metric-grid > *:nth-child(4) { --i: 4; }`,
        newCode: `.metric-grid > * {
  --i: sibling-index();
  --count: sibling-count();
  background: rgba(167, 255, 25, calc(.20 + var(--i) / var(--count) * .70));
  transition-delay: calc(var(--i) * 70ms);
}`,
        demoHref: 'assets/blog-demos/css-can-count-elements.html',
        notes: ['sibling-index() returns the current element position and starts at 1.', 'sibling-count() returns the number of sibling elements including the current one.', 'Good use case: card grids, staggered reveals, dynamic gradients or weighting without JavaScript.', 'For production work, keep an @supports fallback for now.'],
      },
      {
        slug: 'native-select',
        index: '03',
        title: 'Native Select 2.0',
        subtitle: 'From system select to a more styleable native control.',
        category: 'CSS UI',
        summary: 'The comparison matters: a normal select is robust, but visually limited. appearance: base-select opens the button, picker and options to more custom styling without immediately rebuilding a dropdown in JavaScript.',
        tags: ['CSS', 'Forms', 'A11y'],
        support: 'Limited availability, use progressively',
        supportTone: 'experimental',
        codeLanguage: 'css',
        previewType: 'select',
        code: `select.custom-select,
select.custom-select::picker(select) {
  appearance: base-select;
}`,
        oldCodeLabel: 'Before: normal select',
        newCodeLabel: 'After: base-select',
        oldCode: `<label>Project type
  <select>
    <option>Website</option>
    <option>Web app</option>
  </select>
</label>`,
        newCode: `select.custom-select,
select.custom-select::picker(select) {
  appearance: base-select;
}

select.custom-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid currentColor;
  border-radius: 999px;
  background: #101010;
  color: #a7ff19;
}

select.custom-select::picker-icon {
  color: currentColor;
}

select.custom-select:hover,
select.custom-select:open {
  background: #a7ff19;
  color: #101010;
}`,
        demoHref: 'assets/blog-demos/native-select.html',
        notes: ['Interesting for custom form design without a fully custom dropdown.', 'The picker is rendered in the top layer and behaves more like a popover.', 'Use it as progressive enhancement instead of blindly relying on it everywhere.'],
      },
      {
        slug: 'simple-css-spinner',
        index: '04',
        title: 'CSS Loading Spinner',
        subtitle: 'A loader without a library',
        category: 'Micro Interaction',
        summary: 'A small spinner does not need a dependency. A border, one keyframe and a reduced-motion fallback are enough for many UI states.',
        tags: ['CSS', 'Animation', 'A11y'],
        support: 'Very stable',
        supportTone: 'stable',
        codeLanguage: 'css',
        previewType: 'spinner',
        code: `.spinner {\n  width: 2.5rem;\n  aspect-ratio: 1;\n  border: 3px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: spin 720ms linear infinite;\n}`,
        oldCode: `import Spinner from 'some-loader-package';\n\nexport function Loader() {\n  return <Spinner />;\n}`,
        newCode: `.spinner {\n  width: 2.5rem;\n  aspect-ratio: 1;\n  border: 3px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: spin 720ms linear infinite;\n}`,
        demoHref: 'assets/blog-demos/simple-css-spinner.html',
        notes: ['For real status feedback, add text or aria-live.', 'Do not forget reduced motion.', 'For skeletons or progress states, smaller movement is often enough.'],
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
        previewType: 'signals',
        code: `readonly count = signal<number>(0);\nreadonly doubled = computed<number>(() => this.count() * 2);`,
        oldCode: `readonly count$ = new BehaviorSubject(0);\nreadonly doubled$ = this.count$.pipe(\n  map((value) => value * 2),\n);`,
        newCode: `readonly count = signal<number>(0);\nreadonly doubled = computed<number>(() => this.count() * 2);\n\nincrement(): void {\n  this.count.update((value) => value + 1);\n}`,
        demoHref: 'assets/blog-demos/angular-signals-workflow.ts',
        notes: ['State is read where Angular can track it.', 'computed() is ideal for pure derived values.', 'Use effect() carefully: for localStorage, titles or external APIs.'],
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
        previewType: 'console',
        code: `console.log('%cDEVMODE ACTIVATED', style);`,
        oldCode: `console.log('devmode activated');\nconsole.log('feature flag enabled');`,
        newCode: `const style = [\n  'background:#101010',\n  'color:#a7ff19',\n  'border:2px solid #a7ff19',\n  'padding:8px 12px'\n].join(';');\n\nconsole.log('%cDEVMODE ACTIVATED', style);`,
        demoHref: 'assets/blog-demos/devmode-console-style.html',
        notes: ['Good for local debug hints, but not a replacement for logging architecture.', 'Do not write sensitive data into the console.', 'Visual console markers help a lot in complex frontends.'],
      },
    ],
  },
};
