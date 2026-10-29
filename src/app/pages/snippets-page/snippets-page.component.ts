/* src/app/pages/snippets-page/snippets-page.component.ts */

/**
 * @file Snippet-Seite mit überlagernden Retro-Fenstern.
 * @description Rendert kurze CSS-, Angular- und DevTools-Snippets als stapelbare MS-DOS-/Win95-Fenster.
 */

import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { SystemToastService } from '../../core/services/system-toast.service';
import { SNIPPET_PAGE_TEXTS } from '../../core/data/snippets-data';
import type { SnippetPageTexts, SnippetEntry } from '../../core/models/page-content.models';

/** Indexierter Snippeteintrag für die performante Frontend-Suche. */
interface IndexedSnippetEntry {
  readonly entry: SnippetEntry; // Originaler Snippeteintrag.
  readonly searchText: string;  // Normalisierter Suchtext über Titel, Kategorie, Tags und Inhalt.
}

/** Zustandsdaten eines geöffneten Snippet-Fensters. */
interface SnippetWindowState {
  readonly slug: string;    // Slug des gerenderten Eintrags.
  readonly zIndex: number;  // Layer-Reihenfolge des Fensters.
  readonly x: number;       // Horizontale Offset-Position im Board.
  readonly y: number;       // Vertikale Offset-Position im Board.
  readonly width?: number;  // Optional manuell gesetzte Fensterbreite.
  readonly height?: number; // Optional manuell gesetzte Fensterhöhe.
}

/** Laufende Pointer-Interaktion eines Snippet-Fensters. */
interface SnippetWindowInteraction {
  readonly slug: string;            // Betroffenes Fenster.
  readonly mode: 'drag' | 'resize'; // Art der Interaktion.
  readonly pointerId: number;       // Pointer-ID für stabile Maus-/Stiftinteraktion.
  readonly startPointerX: number;   // Pointer-X beim Start.
  readonly startPointerY: number;   // Pointer-Y beim Start.
  readonly startX: number;          // Fenster-X beim Start.
  readonly startY: number;          // Fenster-Y beim Start.
  readonly startWidth: number;      // Tatsächliche Fensterbreite beim Start.
  readonly startHeight: number;     // Tatsächliche Fensterhöhe beim Start.
  readonly topOffset: number;       // Fester Abstand der Fensterposition zur Desktop-Titelleiste.
  readonly desktopWidth: number;    // Verfügbare Desktop-Breite.
  readonly desktopHeight: number;   // Verfügbare Desktop-Höhe.
}

/** Gerendertes Fenster mit aufgelöstem Eintrag. */
interface RenderedSnippetWindow {
  readonly window: SnippetWindowState; // Fensterzustand.
  readonly entry: SnippetEntry;        // Zugehöriger Snippeteintrag.
}

/** Snippet-Ansicht mit stapelbaren Snippet-Fenstern. */
@Component({
  selector: 'bp-snippets-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './snippets-page.component.html',
  styleUrl: './snippets-page.component.scss',
})
export class SnippetsPageComponent {
  private readonly languageService = inject(LanguageService);                         // Sprachservice für übersetzte Seitentexte.
  private readonly seoService = inject(SeoService);                                   // SEO-Service für routebezogene Meta-Daten.
  private readonly toastService = inject(SystemToastService);                         // Toast-Service für kleine Kopier- und Systemmeldungen.
  private readonly zCounter = signal<number>(24);                                     // Laufender Z-Index-Zähler für aktive Fenster.
  private readonly windowInteraction = signal<SnippetWindowInteraction | null>(null); // Aktuell laufende Drag- oder Resize-Interaktion.
  readonly searchQuery = signal<string>('');                                          // Aktuelle Suchanfrage der Snippet-Navigation.
  readonly openWindows = signal<readonly SnippetWindowState[]>([                      // Aktuell geöffnete Snippet-Fenster.
    { slug: 'flex-vs-grid', zIndex: 21, x: 18, y: 18 },
    { slug: 'css-can-count-elements', zIndex: 22, x: 62, y: 62 },
    { slug: 'native-select', zIndex: 23, x: 106, y: 106 },
  ]);

  readonly texts = computed<SnippetPageTexts>(                                        // Übersetzte Texte der aktuellen Sprache.
    /** Übersetzte Texte der aktuellen Sprache. */
    () => SNIPPET_PAGE_TEXTS[this.languageService.language()]
  );

  readonly searchIndex = computed<readonly IndexedSnippetEntry[]>(                    // Vorberechneter Suchindex für schnelle Filterung auch bei deutlich mehr Einträgen.
    /** Vorberechneter Suchindex für schnelle Filterung auch bei deutlich mehr Einträgen. */
    () => this.texts().entries.map(/** Überträgt den Eintrag in die benötigte Seiten- oder Fensterdarstellung. */(entry) => ({ // Vorberechneter Suchindex für schnelle Filterung auch bei deutlich mehr Einträgen.
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
    }))
  );

  readonly filteredEntries = computed<readonly SnippetEntry[]>(                       // Gefilterte Einträge der Sidebar.
    /** Gefilterte Einträge der Sidebar. */
    () => {

      const queryParts = this.normalizeSearchText(this.searchQuery()).split(' ').filter(Boolean); // Normalisierte einzelne Suchbegriffe.

      if (!queryParts.length) {
        return this.texts().entries;
      }

      return this.searchIndex()
        .filter(/** Prüft, ob der Eintrag die Auswahlbedingung erfüllt. */(item) => queryParts.every(/** Prüft die Bedingung für jeden Suchbegriff oder Eintrag. */(part) => item.searchText.includes(part)))
        .map(/** Überträgt den Eintrag in die benötigte Seiten- oder Fensterdarstellung. */(item) => item.entry);
    }
  );

  readonly visibleWindows = computed<readonly RenderedSnippetWindow[]>(               // Sichtbare Fenster mit zugehörigem Eintrag.
    /** Sichtbare Fenster mit zugehörigem Eintrag. */
    () => this.openWindows() // Sichtbare Fenster mit zugehörigem Eintrag.
      .map(/** Überträgt den Eintrag in die benötigte Seiten- oder Fensterdarstellung. */(window) => {

        const entry = this.findEntry(window.slug); // Zum Slug gehörender Snippet-Eintrag.

        return entry ? { window, entry } : null;
      })
      .filter(/** Prüft, ob der Eintrag die Auswahlbedingung erfüllt. */(item): item is RenderedSnippetWindow => item !== null)
  );

  /** Synchronisiert Meta-Daten mit der aktuellen Sprache. */
  constructor() {
    effect(/** Synchronisiert Meta-Daten und abhängige Seitenzustände. */() => this.seoService.setPageSeo(this.texts().metaTitle, this.texts().metaDescription, '/snippets'));
  }

  /** Öffnet ein Snippet-Fenster oder bringt es nach vorne. */
  openEntry(slug: string): void {
    if (this.isEntryOpen(slug)) {
      this.focusWindow(slug);
      return;
    }

    const openCount = this.openWindows().length;                   // Anzahl bereits geöffneter Snippet-Fenster.
    const positionIndex = openCount % this.texts().entries.length; // Index für die versetzte Anfangsposition eines Fensters.

    this.openWindows.update(/** Öffnet ein Snippet-Fenster oder bringt es nach vorne. */(windows) => [
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

    const windows = this.filteredEntries().map(/** Überträgt den Eintrag in die benötigte Seiten- oder Fensterdarstellung. */(entry, index) => ({ // Neu erzeugte oder vorhandene Snippet-Fenster.
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
    this.openWindows.update(/** Schließt ein einzelnes Fenster. */(windows) => windows.filter(/** Prüft, ob der Eintrag die Auswahlbedingung erfüllt. */(window) => window.slug !== slug));
  }

  /** Bringt ein Fenster in den Vordergrund. */
  focusWindow(slug: string): void {
    this.openWindows.update(/** Bringt ein Fenster in den Vordergrund. */(windows) => windows.map(/** Überträgt den Eintrag in die benötigte Seiten- oder Fensterdarstellung. */(window) => window.slug === slug
      ? { ...window, zIndex: this.nextZIndex() }
      : window));
  }

  /** Startet das freie Verschieben eines Snippet-Fensters über seine Titelleiste. */
  startWindowDrag(slug: string, event: PointerEvent): void {
    if (window.innerWidth <= 720 || event.button !== 0 || this.pointerStartedOnControl(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.startWindowInteraction(slug, 'drag', event);
  }

  /** Startet das manuelle Skalieren eines Snippet-Fensters am unteren rechten Griff. */
  startWindowResize(slug: string, event: PointerEvent): void {
    if (window.innerWidth <= 720 || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.startWindowInteraction(slug, 'resize', event);
  }

  /** Führt Drag und Resize während einer aktiven Pointer-Interaktion fort. */
  @HostListener('document:pointermove', ['$event'])
  updateWindowInteraction(event: PointerEvent): void {

    const interaction = this.windowInteraction(); // Aktive Drag- oder Resize-Interaktion.

    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const deltaX = event.clientX - interaction.startPointerX; // Horizontale Pointer-Bewegung seit Interaktionsbeginn.
    const deltaY = event.clientY - interaction.startPointerY; // Vertikale Pointer-Bewegung seit Interaktionsbeginn.

    if (interaction.mode === 'drag') {

      const maxX = Math.max(0, interaction.desktopWidth - interaction.startWidth - 8);                           // Maximaler horizontaler Fensterversatz im Desktop.
      const maxY = Math.max(0, interaction.desktopHeight - interaction.topOffset - interaction.startHeight - 8); // Maximaler vertikaler Fensterversatz im Desktop.
      const x = this.clamp(interaction.startX + deltaX, 0, maxX);                                                // Horizontale Position oder berechneter Versatz.
      const y = this.clamp(interaction.startY + deltaY, 0, maxY);                                                // Vertikale Position oder berechneter Versatz.

      this.updateWindow(interaction.slug, /** Führt Drag und Resize während einer aktiven Pointer-Interaktion fort. */(windowState) => ({ ...windowState, x, y }));
      return;
    }

    const maxWidth = Math.max(280, interaction.desktopWidth - interaction.startX - 8);                           // Maximale Fensterbreite innerhalb des Desktops.
    const maxHeight = Math.max(260, interaction.desktopHeight - interaction.topOffset - interaction.startY - 8); // Maximale Fensterhöhe innerhalb des Desktops.
    const minWidth = Math.min(420, maxWidth);                                                                    // An den verfügbaren Platz angepasste Mindestbreite.
    const minHeight = Math.min(320, maxHeight);                                                                  // An den verfügbaren Platz angepasste Mindesthöhe.
    const width = this.clamp(interaction.startWidth + deltaX, minWidth, maxWidth);                               // Berechnete Breite in CSS-Pixeln.
    const height = this.clamp(interaction.startHeight + deltaY, minHeight, maxHeight);                           // Berechnete Höhe in CSS-Pixeln.

    this.updateWindow(interaction.slug, /** Führt Drag und Resize während einer aktiven Pointer-Interaktion fort. */(windowState) => ({ ...windowState, width, height }));
  }

  /** Beendet eine laufende Pointer-Interaktion. */
  @HostListener('document:pointerup', ['$event'])
  @HostListener('document:pointercancel', ['$event'])
  endWindowInteraction(event: PointerEvent): void {
    if (this.windowInteraction()?.pointerId === event.pointerId) {
      this.windowInteraction.set(null);
    }
  }

  /** Ermöglicht feines Resizing des fokussierbaren Handles per Pfeiltasten. */
  resizeWindowWithKeyboard(slug: string, event: KeyboardEvent): void {

    const horizontal = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0; // Horizontale Richtung der betätigten Pfeiltaste.
    const vertical = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;      // Vertikale Richtung der betätigten Pfeiltaste.

    if (!horizontal && !vertical) {
      return;
    }

    const element = this.snippetWindowElement(slug);                         // Gerendertes Element der aktuellen Interaktion.
    const desktop = element?.closest<HTMLElement>('.snippet-page__desktop'); // Gerenderte Arbeitsfläche der Snippet-Fenster.

    if (!element || !desktop) {
      return;
    }

    event.preventDefault();
    this.focusWindow(slug);

    const step = event.shiftKey ? 32 : 12;                                                                                                                           // Pixel-Schrittweite der Tastatur-Skalierung.
    const state = this.openWindows().find(/** Ermöglicht feines Resizing des fokussierbaren Handles per Pfeiltasten. */(windowState) => windowState.slug === slug); // Aktueller Zustand des betroffenen Snippet-Fensters.

    if (!state) {
      return;
    }

    const elementRect = element.getBoundingClientRect();                                                     // Gemessene Grenzen des Snippet-Fensters.
    const desktopRect = desktop.getBoundingClientRect();                                                     // Gemessene Grenzen der Arbeitsfläche.
    const topOffset = elementRect.top - desktopRect.top - state.y;                                           // Fester vertikaler Abstand zur Desktop-Titelleiste.
    const maxWidth = Math.max(280, desktopRect.width - state.x - 8);                                         // Maximale Fensterbreite innerhalb des Desktops.
    const maxHeight = Math.max(260, desktopRect.height - topOffset - state.y - 8);                           // Maximale Fensterhöhe innerhalb des Desktops.
    const minWidth = Math.min(420, maxWidth);                                                                // An den verfügbaren Platz angepasste Mindestbreite.
    const minHeight = Math.min(320, maxHeight);                                                              // An den verfügbaren Platz angepasste Mindesthöhe.
    const width = this.clamp((state.width ?? elementRect.width) + horizontal * step, minWidth, maxWidth);    // Berechnete Breite in CSS-Pixeln.
    const height = this.clamp((state.height ?? elementRect.height) + vertical * step, minHeight, maxHeight); // Berechnete Höhe in CSS-Pixeln.

    this.updateWindow(slug, /** Ermöglicht feines Resizing des fokussierbaren Handles per Pfeiltasten. */(windowState) => ({ ...windowState, width, height }));
  }

  /** Übernimmt den Suchbegriff aus dem Eingabefeld. */
  setSearchQuery(event: Event): void {

    const input = event.target instanceof HTMLInputElement ? event.target : null; // Eingabefeld der Suchanfrage oder null.

    this.searchQuery.set(input?.value ?? '');
  }

  /** Leert die Snippet-Suche. */
  clearSearch(): void {
    this.searchQuery.set('');
  }

  /** Kopiert das Code-Beispiel eines Eintrags in die Zwischenablage. */
  async copyCode(entry: SnippetEntry, event: Event): Promise<void> {
    event.stopPropagation();

    if (!navigator.clipboard) {
      return;
    }

    const oldLabel = entry.oldCodeLabel ?? this.texts().oldCodeLabel; // Beschriftung der klassischen Code-Variante.
    const newLabel = entry.newCodeLabel ?? this.texts().newCodeLabel; // Beschriftung der modernen Code-Variante.

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
    return this.openWindows().some(/** Prüft, ob ein Eintrag bereits geöffnet ist. */(window) => window.slug === slug);
  }

  /** Liefert einen eindeutigen TrackBy-Wert für Fenster. */
  trackWindow(item: RenderedSnippetWindow): string {
    return item.entry.slug;
  }

  /** Initialisiert gemeinsame Messwerte für Drag- und Resize-Interaktionen. */
  private startWindowInteraction(slug: string, mode: 'drag' | 'resize', event: PointerEvent): void {

    const element = this.snippetWindowElement(slug);                                                                                                                 // Gerendertes Element der aktuellen Interaktion.
    const desktop = element?.closest<HTMLElement>('.snippet-page__desktop');                                                                                         // Gerenderte Arbeitsfläche der Snippet-Fenster.
    const state = this.openWindows().find(/** Initialisiert gemeinsame Messwerte für Drag- und Resize-Interaktionen. */(windowState) => windowState.slug === slug); // Aktueller Zustand des betroffenen Snippet-Fensters.

    if (!element || !desktop || !state) {
      return;
    }

    this.focusWindow(slug);

    const elementRect = element.getBoundingClientRect(); // Gemessene Grenzen des Snippet-Fensters.
    const desktopRect = desktop.getBoundingClientRect(); // Gemessene Grenzen der Arbeitsfläche.

    this.windowInteraction.set({
      slug,
      mode,
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: state.x,
      startY: state.y,
      startWidth: elementRect.width,
      startHeight: elementRect.height,
      topOffset: elementRect.top - desktopRect.top - state.y,
      desktopWidth: desktopRect.width,
      desktopHeight: desktopRect.height,
    });
  }

  /** Aktualisiert genau ein Fenster, ohne Zustände der übrigen Fenster anzufassen. */
  private updateWindow(slug: string, updater: (windowState: SnippetWindowState) => SnippetWindowState): void {
    this.openWindows.update(/** Aktualisiert genau ein Fenster, ohne Zustände der übrigen Fenster anzufassen. */(windows) => windows.map(/** Überträgt den Eintrag in die benötigte Seiten- oder Fensterdarstellung. */(windowState) => windowState.slug === slug
      ? updater(windowState)
      : windowState));
  }

  /** Liefert das gerenderte Fenster anhand seines stabilen Slugs. */
  private snippetWindowElement(slug: string): HTMLElement | null {

    const escapedSlug = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(slug) : slug; // Für den CSS-Selektor maskierte Snippet-Kennung.

    return document.querySelector<HTMLElement>(`.snippet-window[data-window-slug="${escapedSlug}"]`);
  }

  /** Erkennt Controls in der Titelleiste, die kein Drag starten dürfen. */
  private pointerStartedOnControl(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && Boolean(target.closest('button, a, input, select, textarea'));
  }

  /** Begrenzt Positions- und Größenwerte auf einen sicheren Bereich. */
  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  /** Sucht einen Eintrag in der aktiven Sprache. */
  private findEntry(slug: string): SnippetEntry | undefined {
    return this.texts().entries.find(/** Sucht einen Eintrag in der aktiven Sprache. */(entry) => entry.slug === slug);
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

    const nextIndex = this.zCounter() + 1; // Berechneter Index des nächsten Eintrags.

    this.zCounter.set(nextIndex);
    return nextIndex;
  }
}
