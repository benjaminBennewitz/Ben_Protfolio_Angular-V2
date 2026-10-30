/* src/app/pages/project-detail-page/catalog-reader.ts */

/** @file Katalogzustand, decodierte Seitenwechsel, Hover-Lupe und zugängliches Inhaltsverzeichnis. */

import { computed, signal, type Signal } from '@angular/core';
import type { PortfolioProject } from '../../core/models/projects.models';
import type { PortfolioLanguage } from '../../core/models/shared.models';
import type { ProjectCatalogPage, ProjectCatalogSpread } from '../../core/models/catalog.models';

/** Stabile Reader-Seite mit fertig berechnetem Bild-Asset für Angular-Bindings. */
interface CatalogReaderPage extends ProjectCatalogPage {
  readonly asset?: string; // Fertiger Asset-Pfad für die decodierbare Katalogseite.
}

/** Stabile Reader-Doppelseite mit vorbereiteten Seiten-ViewModels. */
interface CatalogReaderSpread extends Omit<ProjectCatalogSpread, 'pages'> {
  readonly pages: readonly CatalogReaderPage[]; // Vorbereitete Seiten mit stabilen Asset-Bindings.
  readonly pageLabel: string;                   // Sichtbarer Seitenbereich für die Overlay-Navigation.
}

/** Beweglicher Lupenzustand für den WebP-Katalogreader. */
interface CatalogLoupeState {
  readonly isVisible: boolean;         // Sichtbarkeit der Kataloglupe.
  readonly pageNumber: string;         // Seitenkennung der aktuell vergrößerten Katalogseite.
  readonly x: number;                  // Aktueller X-Wert innerhalb der Katalogseite.
  readonly y: number;                  // Aktueller Y-Wert innerhalb der Katalogseite.
  readonly width: number;              // Breite des Lupenfensters.
  readonly height: number;             // Höhe des Lupenfensters.
  readonly asset: string;              // Vergrößertes Hintergrundbild der aktuellen Katalogseite.
  readonly backgroundSize: string;     // Berechnete Hintergrundgröße passend zur echten Seitengröße.
  readonly backgroundPosition: string; // Berechnete Hintergrundposition passend zur Mausposition.
}

/** Lokaler Reader-Zustand pro Detailseite; besitzt Seitenvorladen, Lupe und Menüfokus. */
export class CatalogReader {
  private readonly catalogAssetPreloadTasks = new Map<string, Promise<void>>();                                                                                                    // Laufende und abgeschlossene Preload-Tasks der Katalogseiten-Assets.
  private catalogSpreadSwitchToken = 0;                                                                                                                                            // Wechsel-Token gegen veraltete async Katalog-Navigationswechsel.
  private catalogMenuFocusFrameId = 0;                                                                                                                                             // Geplanter Fokus-Frame für das Katalog-Inhaltsverzeichnis.
  readonly activeCatalogSpreadIndex = signal<number>(0);                                                                                                                           // Aktuell ausgewählte Doppelseite im Designkatalog.
  readonly catalogSpreadDirection = signal<1 | -1 | 0>(0);                                                                                                                         // Bewegungsrichtung der aktuellen Katalogseiten-Animation.
  readonly isCatalogReaderBusy = signal<boolean>(false);                                                                                                                           // Ladezustand während eine Ziel-Doppelseite vor dem sichtbaren Wechsel decodiert wird.
  readonly isCatalogLoupeEnabled = signal(true); // Aktivierung der optionalen Kataloglupe.
  readonly isCatalogMenuOpen = signal<boolean>(false);                                                                                                                             // Sichtbarkeit des Inhaltsverzeichnis-Overlays im Designkatalog.
  readonly catalogLoupe = signal<CatalogLoupeState>({ isVisible: false, pageNumber: '', x: 0, y: 0, width: 0, height: 0, asset: '', backgroundSize: '', backgroundPosition: '' }); // Bewegliche Hover-Lupe für echte Katalogseitenbilder.
  readonly activeCatalogSpread = computed<CatalogReaderSpread | undefined>(                                                                                                        // Aktive Doppelseite des digitalen Designkatalogs mit stabilen Asset-Bindings.
    /** Aktive Doppelseite des digitalen Designkatalogs mit stabilen Asset-Bindings. */
    () => {

      const showcase = this.project()?.catalogShowcase;        // Katalog-Konfiguration des aktiven Projekts.
      const spreads = showcase?.spreads ?? [];                // Für den Reader aufbereitete Doppelseiten.
      const index = this.getNormalizedCatalogSpreadIndex(); // Aktueller Eintrags- oder Schleifenindex.
      const spread = spreads[index] ?? spreads[0];           // Aktuell betrachtete Katalog-Doppelseite.

      return spread ? this.createCatalogReaderSpread(spread) : undefined;
    }
  );

  /** Verbindet den Reader mit Projekt, Sprache und den DOM-Referenzen seines Menüs. */
  constructor(
    private readonly project: Signal<PortfolioProject | undefined>, // Aktives Projekt mit optionalen Katalogdaten.
    private readonly language: Signal<PortfolioLanguage>,           // Aktive Sprache zur Auswahl der Katalogdateien.
    private readonly menuTrigger: () => HTMLElement | undefined,    // Aktueller Trigger für die Fokusrückführung.
    private readonly menuDialog: () => HTMLElement | undefined,     // Aktuell gerendertes Inhaltsverzeichnis.
  ) { }

  /** Wählt eine konkrete Katalog-Doppelseite aus. */
  selectCatalogSpread(index: number): void {
    this.hideCatalogLoupe();

    const currentIndex = this.getNormalizedCatalogSpreadIndex();                   // Index des aktuell nächsten Panels oder Eintrags.
    const direction = index > currentIndex ? 1 : index < currentIndex ? -1 : 0; // Bewegungsrichtung des aktuellen Wechsels.

    void this.setCatalogSpreadIndex(index, direction);
  }

  /** Öffnet oder schließt das Inhaltsverzeichnis des Designkatalogs. */
  toggleCatalogMenu(): void {
    this.hideCatalogLoupe();

    if (this.isCatalogMenuOpen()) {
      this.closeCatalogMenu();
      return;
    }

    this.isCatalogMenuOpen.set(true);
    this.scheduleCatalogMenuInitialFocus();
  }

  /** Schließt das Inhaltsverzeichnis des Designkatalogs und setzt den Fokus zurück. */
  closeCatalogMenu(): void {
    if (!this.isCatalogMenuOpen()) {
      return;
    }

    this.isCatalogMenuOpen.set(false);
    this.scheduleCatalogMenuFocusReturn();
  }

  /** Wechselt zur vorherigen oder nächsten Katalog-Doppelseite. */
  selectAdjacentCatalogSpread(direction: 1 | -1): void {
    this.hideCatalogLoupe();
    void this.setCatalogSpreadIndex(this.getNormalizedCatalogSpreadIndex() + direction, direction);
  }

  /** Schaltet die Lupe um und entfernt eine noch sichtbare Vergrößerung. */
  toggleCatalogLoupe(): void {
    this.isCatalogLoupeEnabled.update(enabled => !enabled);
    this.hideCatalogLoupe();
  }

  /** Aktualisiert die rechteckige Hover-Lupe innerhalb einer Katalogseite. */
  updateCatalogLoupe(event: PointerEvent, page: CatalogReaderPage): void {
    if (!this.isCatalogLoupeEnabled() || !page.asset || event.pointerType === 'touch' || this.isCatalogMenuOpen()) {
      this.hideCatalogLoupe();
      return;
    }

    const element = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined; // Gerendertes Element der aktuellen Interaktion.

    if (!element) {
      this.hideCatalogLoupe();
      return;
    }

    const rect = element.getBoundingClientRect(); // Gemessene Grenzen des aktuellen Elements.
    const x = event.clientX - rect.left;       // Horizontale Position oder berechneter Versatz.
    const y = event.clientY - rect.top;        // Vertikale Position oder berechneter Versatz.

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      this.hideCatalogLoupe();
      return;
    }

    this.catalogLoupe.set(this.createCatalogLoupeState(page, rect, x, y));
  }

  /** Blendet die Kataloglupe aus. */
  hideCatalogLoupe(): void {
    if (!this.catalogLoupe().isVisible) {
      return;
    }

    this.catalogLoupe.set({ isVisible: false, pageNumber: '', x: 0, y: 0, width: 0, height: 0, asset: '', backgroundSize: '', backgroundPosition: '' });
  }

  /** Setzt den Fokus nach dem Öffnen auf den Schließen-Button des Katalogmenüs. */
  private scheduleCatalogMenuInitialFocus(): void {
    this.cancelCatalogMenuFocusFrame();
    this.catalogMenuFocusFrameId = window.requestAnimationFrame(/** Fokussiert nach dem Rendern das erste verfügbare Bedienelement. */() => {
      this.catalogMenuFocusFrameId = 0;
      this.menuDialog()?.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true });
    });
  }

  /** Gibt den Fokus nach dem Schließen an den stabilen Katalogmenü-Trigger zurück. */
  private scheduleCatalogMenuFocusReturn(): void {
    this.cancelCatalogMenuFocusFrame();
    this.catalogMenuFocusFrameId = window.requestAnimationFrame(/** Gibt den Fokus nach dem Schließen an den stabilen Katalogmenü-Trigger zurück. */() => {
      this.catalogMenuFocusFrameId = 0;
      this.menuTrigger()?.focus({ preventScroll: true });
    });
  }

  /** Hält Tab-Navigation innerhalb des geöffneten Katalog-Inhaltsverzeichnisses. */
  trapCatalogMenuFocus(event: KeyboardEvent): void {

    const panel = this.menuDialog(); // Gerenderter Bereich für Messung oder Fokussteuerung.

    if (!panel) {
      return;
    }

    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')) as HTMLElement[]; // Innerhalb des Dialogs erreichbare Bedienelemente.

    if (!focusableElements.length) {
      event.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }

    const first = focusableElements[0];                           // Erstes fokussierbares Element im Dialog.
    const last = focusableElements[focusableElements.length - 1]; // Letztes fokussierbares Element im Dialog.
    const activeElement = document.activeElement;                 // Aktuell fokussiertes Element des Dokuments.

    if (event.shiftKey && (activeElement === first || !panel.contains(activeElement))) {
      event.preventDefault();
      last.focus({ preventScroll: true });
      return;
    }

    if (!event.shiftKey && (activeElement === last || !panel.contains(activeElement))) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  /** Bricht einen noch offenen Fokus-Frame des Katalogmenüs ab. */
  private cancelCatalogMenuFocusFrame(): void {
    if (!this.catalogMenuFocusFrameId) {
      return;
    }

    window.cancelAnimationFrame(this.catalogMenuFocusFrameId);
    this.catalogMenuFocusFrameId = 0;
  }

  /** Baut den stabilen Lupenzustand aus Seitengröße und Mausposition. */
  private createCatalogLoupeState(page: CatalogReaderPage, rect: DOMRect, x: number, y: number): CatalogLoupeState {

    const zoom = 1.8;                         // Vergrößerungsfaktor der Kataloglupe.
    const width = this.getCatalogLoupeWidth(); // Berechnete Breite in CSS-Pixeln.
    const height = Math.round(width * 0.68);    // Berechnete Höhe in CSS-Pixeln.
    const bgX = -(x * zoom - width / 2);     // Horizontaler Hintergrundversatz der Lupe.
    const bgY = -(y * zoom - height / 2);    // Vertikaler Hintergrundversatz der Lupe.

    return {
      isVisible: true,
      pageNumber: page.number,
      x,
      y,
      width,
      height,
      asset: page.asset ?? '',
      backgroundSize: `${rect.width * zoom}px ${rect.height * zoom}px`,
      backgroundPosition: `${bgX}px ${bgY}px`,
    };
  }

  /** Ermittelt eine responsive Lupenbreite ohne Layout-Messung im Template. */
  private getCatalogLoupeWidth(): number {
    if (typeof window === 'undefined') {
      return 230;
    }

    return Math.round(Math.min(Math.max(window.innerWidth * 0.189, 189), 336));
  }

  /** Erstellt eine stabile Reader-Doppelseite ohne Template-Methoden für Resource-URLs. */
  private createCatalogReaderSpread(spread: ProjectCatalogSpread): CatalogReaderSpread {

    const pages = spread.pages.map(/** Überträgt den Eintrag in die benötigte Seiten- oder Fensterdarstellung. */(page) => this.createCatalogReaderPage(page)); // Aufbereitete Seiten einer Katalog-Doppelseite.
    const pageLabel = this.getCatalogSpreadPageLabel(pages);                                                                                                         // Lesbare Seitenkennung der Doppelseite.

    return { ...spread, pages, pageLabel };
  }

  /** Erstellt eine stabile Reader-Seite mit decodierbarem Bild-Asset. */
  private createCatalogReaderPage(page: ProjectCatalogPage): CatalogReaderPage {

    const asset = this.getCatalogPageAsset(page); // Aufgelöster Bild- oder Dateipfad der Katalogseite.

    return { ...page, asset };
  }

  /** Gibt den passenden Katalogseiten-Pfad für den einsprachigen WebP-Katalog zurück. */
  private getCatalogPageAsset(page: ProjectCatalogPage): string | undefined {

    const language = this.language(); // Aktive Sprache für lokalisierte Katalogdateien.

    return page.imageByLanguage?.[language] ?? page.image;
  }

  /** Gibt den sichtbaren Seitenbereich der aktuellen Reader-Ansicht zurück. */
  private getCatalogSpreadPageLabel(pages: readonly CatalogReaderPage[]): string {

    const numbers = pages.map(/** Überträgt den Eintrag in die benötigte Seiten- oder Fensterdarstellung. */(page) => page.number); // Sichtbare Seitenzahlen der Doppelseite.

    if (!numbers.length) {
      return '';
    }

    const total = this.project()?.catalogShowcase?.spreads.at(-1)?.pages.at(-1)?.number ?? numbers.at(-1) ?? ''; // Letzte Seitenkennung des gesamten Katalogs.
    const range = numbers.length === 1 ? numbers[0] : `${numbers[0]}–${numbers.at(-1)}`;                         // Sichtbarer Seitenbereich der ausgewählten Doppelseite.

    return `${range} / ${total}`;
  }

  /** Setzt den Reader-Index erst nach fertig decodierten Zielseiten. */
  private async setCatalogSpreadIndex(index: number, direction: 1 | -1 | 0 = 0): Promise<void> {

    const spreads = this.project()?.catalogShowcase?.spreads ?? []; // Für den Reader aufbereitete Doppelseiten.

    if (!spreads.length) {
      return;
    }

    const normalizedIndex = (index + spreads.length) % spreads.length; // Auf den gültigen Bereich begrenzter Doppelseitenindex.

    if (normalizedIndex === this.getNormalizedCatalogSpreadIndex()) {
      this.catalogSpreadDirection.set(0);
      return;
    }

    const switchToken = ++this.catalogSpreadSwitchToken; // Kennung gegen überholte asynchrone Wechsel.

    this.isCatalogReaderBusy.set(true);

    try {
      await this.preloadCatalogSpreadAssets(normalizedIndex);

      if (switchToken !== this.catalogSpreadSwitchToken) {
        return;
      }

      this.catalogSpreadDirection.set(direction);
      this.activeCatalogSpreadIndex.set(normalizedIndex);
    } finally {
      if (switchToken === this.catalogSpreadSwitchToken) {
        this.isCatalogReaderBusy.set(false);
      }
    }
  }

  /** Lädt die ersten Katalogseiten und Nachbarspreads leise in den Browser-Cache. */
  preloadCatalogAssetsAroundActiveSpread(): void {

    const showcase = this.project()?.catalogShowcase; // Katalog-Konfiguration des aktiven Projekts.

    if (!showcase || typeof window === 'undefined') {
      return;
    }

    const activeIndex = this.getNormalizedCatalogSpreadIndex(); // Aktuell sichtbarer Doppelseitenindex.
    const preloadPages = [                                        // Beim Wechsel vorab zu ladende Doppelseiten.
      ...showcase.spreads.slice(0, 4).flatMap(/** Lädt die ersten Katalogseiten und Nachbarspreads leise in den Browser-Cache. */(spread) => spread.pages),
      ...showcase.spreads.slice(Math.max(activeIndex - 1, 0), activeIndex + 4).flatMap(/** Lädt die ersten Katalogseiten und Nachbarspreads leise in den Browser-Cache. */(spread) => spread.pages),
    ];

    preloadPages.forEach(/** Lädt die ersten Katalogseiten und Nachbarspreads leise in den Browser-Cache. */(page) => void this.preloadCatalogAsset(this.getCatalogPageAsset(page)));
  }

  /** Lädt eine konkrete Doppelseite vollständig vor dem sichtbaren Wechsel. */
  private async preloadCatalogSpreadAssets(index: number): Promise<void> {

    const spreads = this.project()?.catalogShowcase?.spreads ?? []; // Für den Reader aufbereitete Doppelseiten.
    const spread = spreads[index];                                 // Aktuell betrachtete Katalog-Doppelseite.

    if (!spread) {
      return;
    }

    await Promise.all(spread.pages.map(/** Überträgt den Eintrag in die benötigte Seiten- oder Fensterdarstellung. */(page) => this.preloadCatalogAsset(this.getCatalogPageAsset(page))));
  }

  /** Lädt ein einzelnes Katalogseiten-Asset ohne sichtbare UI-Auswirkung vor. */
  private preloadCatalogAsset(asset: string | undefined): Promise<void> {
    if (!asset || typeof window === 'undefined') {
      return Promise.resolve();
    }

    const existingTask = this.catalogAssetPreloadTasks.get(asset); // Bereits laufender oder abgeschlossener Ladeauftrag.

    if (existingTask) {
      return existingTask;
    }

    const task = this.isCatalogImageAsset(asset) ? this.preloadCatalogImageAsset(asset) : this.preloadCatalogFileAsset(asset); // Neu angelegter Ladeauftrag für das Asset.
    const safeTask = task.catch(/** Fängt Ladefehler ab, damit die Navigation weiterhin bedienbar bleibt. */() => undefined); // Abgefangener Ladeauftrag ohne unbehandelte Ablehnung.

    this.catalogAssetPreloadTasks.set(asset, safeTask);

    return safeTask;
  }

  /** Lädt ein Bild und wartet, bis es sicher decodiert ist. */
  private preloadCatalogImageAsset(asset: string): Promise<void> {
    return new Promise(/** Beendet den asynchronen Lade- oder Warteauftrag. */(resolve) => {

      const image = new Image(); // Bildobjekt für das Laden und Decodieren des Assets.

      image.decoding = 'async';
      image.loading = 'eager';

      /** Beendet den asynchronen Lade- oder Warteauftrag. */
      const resolveDecodedImage = () => {
        if (image.decode) {
          void image.decode().then(resolve).catch(resolve);
          return;
        }

        resolve();
      };

      image.onload = resolveDecodedImage;
      image.onerror = /** Beendet den asynchronen Lade- oder Warteauftrag. */ () => resolve();
      image.src = asset;

      if (image.complete) {
        resolveDecodedImage();
      }
    });
  }

  /** Lädt Nicht-Bild-Dateien in den Browser-Cache vor. */
  private async preloadCatalogFileAsset(asset: string): Promise<void> {
    await fetch(asset, { cache: 'force-cache' });
  }

  /** Prüft, ob ein Katalog-Asset direkt als Bild decodiert werden kann. */
  private isCatalogImageAsset(asset: string): boolean {
    return /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(asset);
  }

  /** Ermittelt den gültigen Katalog-Index für aktuelle Projektdaten. */
  private getNormalizedCatalogSpreadIndex(): number {

    const spreads = this.project()?.catalogShowcase?.spreads ?? []; // Für den Reader aufbereitete Doppelseiten.

    if (!spreads.length) {
      return 0;
    }

    return Math.min(Math.max(this.activeCatalogSpreadIndex(), 0), spreads.length - 1);
  }

  /** Verwirft laufende Seitenwechsel und setzt den Reader für das nächste Projekt zurück. */
  reset(): void {
    this.catalogSpreadSwitchToken += 1;
    this.activeCatalogSpreadIndex.set(0);
    this.catalogSpreadDirection.set(0);
    this.isCatalogReaderBusy.set(false);
    this.isCatalogMenuOpen.set(false);
    this.cancelCatalogMenuFocusFrame();
    this.hideCatalogLoupe();
  }

  /** Verwirft ausstehende Seitenwechsel und Fokus-Frames beim Verlassen der Seite. */
  destroy(): void {
    this.catalogSpreadSwitchToken += 1;
    this.cancelCatalogMenuFocusFrame();
  }
}
