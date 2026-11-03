/* src/app/pages/archive-page/archive-page.component.ts */

/**
 * @file Interaktives Archiv der eigenständigen Designstudien.
 * @description Stellt die vorhandenen Microsites als filterbare, verschiebbare und skalierbare Fenster auf einer freien Arbeitsfläche dar.
 */

import { afterNextRender, Component, computed, effect, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DESIGN_STUDIES, DESIGN_STUDY_TRANSLATIONS_DE } from '../../core/data/design-studies';
import type { DesignStudy, DesignStudyCategory } from '../../core/models/projects.models';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';

/** Kategorieauswahl einschließlich des ungefilterten Archivs. */
type ArchiveCategory = 'all' | DesignStudyCategory;

/** Konfiguration einer Filterkategorie. */
interface ArchiveCategoryOption {
  readonly id: ArchiveCategory; // Stabile Filterkennung.
  readonly de: string;          // Deutsche Beschriftung.
  readonly en: string;          // Englische Beschriftung.
}

/** Individuelle Geometrie und Ebenenposition eines Fensters. */
interface ArchiveWindowState {
  readonly id: string;          // Studienkennung aus der zentralen Datenquelle.
  readonly x: number;           // Linker Abstand innerhalb der Arbeitsfläche in Pixeln.
  readonly y: number;           // Oberer Abstand innerhalb der Arbeitsfläche in Pixeln.
  readonly width: number;       // Fensterbreite in Pixeln.
  readonly height: number;      // Fensterhöhe in Pixeln.
  readonly zIndex: number;      // Reihenfolge bei Überlagerungen.
  readonly closed: boolean;     // Fenster ist vorübergehend geschlossen und über die Liste wieder erreichbar.
  readonly maximized: boolean;  // Fenster nimmt die gesamte Arbeitsfläche ein.
}

/** Startgeometrie eines maximierten Fensters für die Wiederherstellung. */
type WindowGeometry = Pick<ArchiveWindowState, 'x' | 'y' | 'width' | 'height'>;

/** Aktive Maus-, Stift- oder Touch-Interaktion. */
interface ArchivePointerInteraction {
  readonly id: string;                           // Kennung des bearbeiteten Fensters.
  readonly pointerId: number;                    // Identifikator des Pointers.
  readonly mode: 'drag' | 'resize';              // Verschieben oder Skalieren.
  readonly startClientX: number;                 // Ausgangspunkt horizontal im Viewport.
  readonly startClientY: number;                 // Ausgangspunkt vertikal im Viewport.
  readonly startingWindow: ArchiveWindowState;   // Unveränderte Ausgangsgeometrie.
}

/** Archivfenster mit zugehörigem lokalisiertem Datensatz. */
interface ArchiveVisibleWindow {
  readonly state: ArchiveWindowState; // Position und Fensterzustand.
  readonly study: DesignStudy;        // Zugehörige Designstudie.
  readonly number: string;           // Stabile laufende Archivnummer.
}

/** Deutsche und englische Kategorien aus einem gemeinsamen Vokabular. */
const ARCHIVE_CATEGORIES: readonly ArchiveCategoryOption[] = [
  { id: 'all', de: 'Alle Studien', en: 'All studies' },
  { id: 'editorial', de: 'Editorial', en: 'Editorial' },
  { id: 'retro', de: 'Retro / Y2K', en: 'Retro / Y2K' },
  { id: 'typography', de: 'Typografie', en: 'Typography' },
  { id: 'playful', de: 'Playful / Game', en: 'Playful / Game' },
  { id: 'spatial', de: 'Raum / 3D', en: 'Spatial / 3D' },
  { id: 'generative', de: 'Generativ', en: 'Generative' },
];

/** Sprachabhängige Texte und Accessibility-Beschriftungen des Archivarbeitsplatzes. */
const ARCHIVE_TEXTS = {
  de: {
    metaTitle: 'Designarchiv | Design. Code. Repeat.',
    metaDescription: 'Experimentelles Designarchiv von Benjamin Bennewitz: Webstudien, Typografie, Y2K, Editorial Design, WebGL und generative Kunst.',
    eyebrow: 'B² / EXPERIMENTAL ARCHIVE — VOL. 01',
    title: 'THE DESIGN ARCHIVE.',
    intro: 'Ein wachsendes Archiv eigenständiger Web-Designstudien. Unterschiedliche Stile, ungewöhnliche Themen und die Frage: Wie weit lässt sich Gestaltung übertragen?',
    back: 'Zurück zu den Case Studies',
    filterTitle: 'Archiv durchsuchen',
    searchLabel: 'Designstudien suchen',
    searchPlaceholder: 'Name, Stil, Thema, Technik …',
    categoryLabel: 'Nach Gestaltungsrichtung filtern',
    results: 'Treffer',
    catalogTitle: 'Archivindex',
    catalogHint: 'Studie auswählen, um ihr Fenster in den Vordergrund zu holen.',
    canvasTitle: 'Workspace / Studies',
    canvasHint: 'Fenster ziehen, skalieren und in den Vordergrund holen.',
    scatter: 'Neu verteilen',
    tile: 'Anordnen',
    reset: 'Zurücksetzen',
    controls: 'Fensteranordnung',
    active: 'Aktive Studie',
    concept: 'Designkonzept',
    subject: 'Thema',
    idea: 'Leitgedanke',
    tech: 'Schwerpunkte',
    open: 'Studie öffnen',
    newTab: 'Öffnet in einem neuen Tab',
    minimized: 'Fenster schließen',
    maximize: 'Fenster maximieren',
    restore: 'Fenster wiederherstellen',
    drag: 'Fenster verschieben: mit Maus ziehen oder Pfeiltasten verwenden',
    resize: 'Fenstergröße ändern: ziehen oder Pfeiltasten verwenden',
    empty: 'Keine Studien für diese Filter gefunden.',
    clear: 'Filter zurücksetzen',
    emptyCanvas: 'Keine Fenster geöffnet. Wähle eine Studie im Archivindex oder setze die Anordnung zurück.',
    mobileHint: 'Auf kleinen Bildschirmen erscheint das Archiv als bedienbare Galerie.',
    featured: 'LIVE / STANDALONE',
  },
  en: {
    metaTitle: 'Design Archive | Design. Code. Repeat.',
    metaDescription: 'Experimental design archive by Benjamin Bennewitz: web studies, typography, Y2K, editorial design, WebGL and generative art.',
    eyebrow: 'B² / EXPERIMENTAL ARCHIVE — VOL. 01',
    title: 'THE DESIGN ARCHIVE.',
    intro: 'A growing collection of independent web design studies. Different styles, unexpected subjects and one question: How far can a visual language travel?',
    back: 'Back to case studies',
    filterTitle: 'Explore the archive',
    searchLabel: 'Search design studies',
    searchPlaceholder: 'Name, style, subject, tech …',
    categoryLabel: 'Filter by design direction',
    results: 'Results',
    catalogTitle: 'Archive index',
    catalogHint: 'Select a study to bring its window to the front.',
    canvasTitle: 'Workspace / Studies',
    canvasHint: 'Drag, resize and focus the windows.',
    scatter: 'Shuffle windows',
    tile: 'Tile windows',
    reset: 'Reset layout',
    controls: 'Window arrangement',
    active: 'Active study',
    concept: 'Design concept',
    subject: 'Subject',
    idea: 'Guiding idea',
    tech: 'Focus',
    open: 'Open study',
    newTab: 'Opens in a new tab',
    minimized: 'Close window',
    maximize: 'Maximize window',
    restore: 'Restore window',
    drag: 'Move window: drag with pointer or use arrow keys',
    resize: 'Resize window: drag with pointer or use arrow keys',
    empty: 'No studies match these filters.',
    clear: 'Reset filters',
    emptyCanvas: 'No windows open. Choose a study in the index or reset the layout.',
    mobileHint: 'On smaller screens, the archive becomes an accessible gallery.',
    featured: 'LIVE / STANDALONE',
  },
} as const;

/** Interaktive Archivseite mit getrennten Such-, Fenster- und Layoutzuständen. */
@Component({
  selector: 'bp-archive-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './archive-page.component.html',
  styleUrl: './archive-page.component.scss',
})
export class ArchivePageComponent {
  @ViewChild('archiveCanvas') private readonly canvas?: ElementRef<HTMLElement>; // Arbeitsfläche zur geometrischen Begrenzung.

  private readonly languageService = inject(LanguageService); // Gemeinsame Sprachsteuerung des Portfolios.
  private readonly seoService = inject(SeoService);           // Gemeinsame Meta-/Canonical-Konfiguration.
  private readonly originalGeometry = new Map<string, WindowGeometry>(); // Fensterpositionen vor dem Maximieren.
  private readonly pointerInteraction = signal<ArchivePointerInteraction | null>(null); // Laufende Drag-/Resize-Aktion.
  private zCounter = DESIGN_STUDIES.length + 10; // Steigende Zeichenreihenfolge für fokussierte Fenster.
  private scatterSequence = 0;                    // Verändert die reproduzierbaren Ausgangspositionen.
  private wasDesktop = false;                   // Merkt den Modus für ein sauberes Layout beim Breakpoint-Wechsel.

  readonly searchQuery = signal<string>('');                        // Textsuche über sämtliche lokalisierten Felder.
  readonly selectedCategory = signal<ArchiveCategory>('all');      // Aktiver Kategorienfilter.
  readonly activeId = signal<string>(DESIGN_STUDIES[2]?.id ?? DESIGN_STUDIES[0].id); // Inspector-Auswahl.
  readonly windows = signal<readonly ArchiveWindowState[]>([]);    // Geöffnete und geschlossene Archivfenster.
  readonly isTiled = signal<boolean>(false);                      // Anordnung als Raster statt freier Collage.
  readonly categories = ARCHIVE_CATEGORIES;                       // Statisches Filtervokabular.
  readonly texts = computed(                                      // Sichtbare Texte in der gewählten Sprache.
    /** Aktualisiert sämtliche Beschriftungen bei einem Sprachwechsel. */
    () => ARCHIVE_TEXTS[this.languageService.language()]
  );

  readonly studies = computed<readonly DesignStudy[]>(             // Zentral gepflegte Studien samt lokalisierter Archivinformationen.
    /** Übersetzt die Archivinformationen ohne die Originaldaten zu verändern. */
    () => this.languageService.language() === 'de'
      ? DESIGN_STUDIES.map(study => ({ ...study, ...DESIGN_STUDY_TRANSLATIONS_DE[study.id] }))
      : DESIGN_STUDIES
  );

  readonly filteredStudies = computed<readonly DesignStudy[]>(     // Kombinierte Suche und Kategorisierung.
    /** Filtert zuerst nach Kategorie, dann nach allen Suchbegriffen. */
    () => {
      const parts = this.normalize(this.searchQuery()).split(' ').filter(Boolean); // Einzelne Teilbegriffe der Suche.
      const category = this.selectedCategory();                                     // Ausgewählte Gestaltungsrichtung.

      return this.studies().filter(study => {
        if (category !== 'all' && study.category !== category) {
          return false;
        }

        const index = this.normalize([
          study.name, study.subtitle, study.archive.concept, study.archive.subject,
          study.archive.idea, ...study.tags,
          this.categoryLabel(study.category),
        ].join(' ')); // Durchsuchbarer, übersetzter Text des Eintrags.

        return parts.every(part => index.includes(part));
      });
    }
  );

  readonly visibleWindows = computed<readonly ArchiveVisibleWindow[]>( // Fenster, die dem aktuellen Such- und Kategorienfilter entsprechen.
    /** Verbindet die gefilterten Datensätze mit geöffneten Fenstern. */
    () => {
      const byId = new Map(this.filteredStudies().map(study => [study.id, study])); // Treffer nach stabiler Studienkennung.

      return this.windows()
        .filter(state => !state.closed && byId.has(state.id))
        .map(state => ({ state, study: byId.get(state.id)!, number: this.studyNumber(state.id) }));
    }
  );

  readonly activeStudy = computed<DesignStudy | null>( // Inhalt des Inspector-Panels.
    /** Liefert den aktiven Eintrag nur, solange er dem aktuellen Filter entspricht. */
    () => this.filteredStudies().find(study => study.id === this.activeId()) ?? this.filteredStudies()[0] ?? null
  );

  readonly activeNumber = computed<string>( // Archivnummer des ausgewählten Eintrags.
    /** Gibt die stabile Kennnummer des ausgewählten Eintrags aus. */
    () => this.activeStudy() ? this.studyNumber(this.activeStudy()!.id) : '--'
  );

  /** Registriert SEO-Daten und initialisiert die Fensterauslage nach dem Rendern. */
  constructor() {
    effect(/** Synchronisiert die Suchmaschinen-Metadaten mit der globalen Sprache. */() =>
      this.seoService.setPageSeo(this.texts().metaTitle, this.texts().metaDescription, '/archive'));

    afterNextRender(/** Erst nach DOM-Initialisierung stehen die realen Canvas-Maße fest. */() => {
      this.wasDesktop = window.matchMedia('(min-width: 1001px)').matches;
      this.resetLayout();
    });
  }

  /** Liefert die lokalisierte Bezeichnung einer Gestaltungsrichtung. */
  categoryLabel(category: ArchiveCategory): string {
    const option = this.categories.find(entry => entry.id === category); // Gefundene Filterdefinition.

    return option?.[this.languageService.language()] ?? category;
  }

  /** Ermittelt die unveränderliche, menschenlesbare Archivnummer. */
  studyNumber(id: string): string {
    const index = DESIGN_STUDIES.findIndex(study => study.id === id); // Position in der ursprünglichen Kuratierung.

    return `DS/${String(index + 1).padStart(3, '0')}`;
  }

  /** Anzahl der Einträge in einer Kategorie unabhängig von der aktuellen Suche. */
  categoryCount(category: ArchiveCategory): number {
    return category === 'all' ? DESIGN_STUDIES.length : DESIGN_STUDIES.filter(study => study.category === category).length;
  }

  /** Aktualisiert die Suche und wechselt bei Bedarf auf einen sichtbaren Eintrag. */
  setSearch(query: string): void {
    this.searchQuery.set(query);
    this.selectFirstMatch();
  }

  /** Aktualisiert die Kategorie und synchronisiert die Inspector-Auswahl. */
  setCategory(category: ArchiveCategory): void {
    this.selectedCategory.set(category);
    this.selectFirstMatch();
  }

  /** Entfernt beide Filter, ohne die individuell verschobenen Fenster zurückzusetzen. */
  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.selectFirstMatch();
  }

  /** Aktiviert ein Archivfenster oder öffnet einen zuvor geschlossenen Eintrag erneut. */
  focusStudy(id: string): void {
    this.activeId.set(id);
    this.windows.update(states => states.map(state => state.id === id
      ? { ...state, closed: false, zIndex: ++this.zCounter }
      : state));
  }

  /** Entfernt ein Fenster von der Arbeitsfläche, lässt es aber im Archivindex verfügbar. */
  closeWindow(id: string, event: Event): void {
    event.stopPropagation();
    this.originalGeometry.delete(id);
    this.windows.update(states => states.map(state => state.id === id
      ? { ...state, closed: true, maximized: false }
      : state));
  }

  /** Schaltet zwischen ursprünglicher Fenstergröße und Canvas-Vollansicht um. */
  toggleMaximize(id: string, event: Event): void {
    event.stopPropagation();
    const current = this.windows().find(state => state.id === id); // Aktueller Fensterzustand.
    const canvas = this.canvas?.nativeElement;                       // Arbeitsfläche für die Vollansicht.

    if (!current || !canvas) {
      return;
    }

    if (current.maximized) {
      const original = this.originalGeometry.get(id); // Geometrie vor dem Maximieren.

      this.windows.update(states => states.map(state => state.id === id
        ? { ...state, ...(original ?? {}), maximized: false }
        : state));
      this.originalGeometry.delete(id);
    } else {
      this.originalGeometry.set(id, {
        x: current.x, y: current.y, width: current.width, height: current.height,
      });
      this.windows.update(states => states.map(state => state.id === id
        ? { ...state, x: 8, y: 8, width: canvas.clientWidth - 16, height: canvas.clientHeight - 16, maximized: true }
        : state));
    }

    this.focusStudy(id);
  }

  /** Räumt eine abgebrochene Pointer-Interaktion beim Fensterwechsel auf. */
  @HostListener('window:blur')
  cancelInteraction(): void {
    this.pointerInteraction.set(null);
  }

  /** Ordnet sämtliche Studien in einer kuratiert unregelmäßigen Fenster-Collage an. */
  resetLayout(): void {
    this.scatterSequence = 0;
    this.setScatteredLayout();
  }

  /** Verteilt die geöffneten Fenster auf neue, reproduzierbare Zufallspositionen. */
  shuffleLayout(): void {
    this.scatterSequence += 1;
    this.setScatteredLayout();
  }

  /** Legt die Fenster ohne Überlappungen in ein Raster und passt die Bühne an. */
  tileLayout(): void {
    const canvas = this.canvas?.nativeElement; // Messbare Arbeitsfläche.

    if (!canvas) {
      return;
    }

    const gap = 14;                                                        // Rasterabstand in Pixeln.
    const columns = Math.max(1, Math.floor((canvas.clientWidth - gap) / 310)); // Anzahl sinnvoller Fenster pro Reihe.
    const width = Math.floor((canvas.clientWidth - gap * (columns + 1)) / columns); // Gleichmäßige Fensterbreite.
    const height = Math.max(185, Math.round(width * 0.65));                 // Höhe mit ausreichend Bildfläche.
    const rowCount = Math.ceil(this.filteredStudies().length / columns);     // Benötigte Reihen.

    canvas.style.minHeight = `${Math.max(680, rowCount * (height + gap) + gap)}px`;
    this.originalGeometry.clear();
    this.isTiled.set(true);

    const position = new Map(this.filteredStudies().map((study, index) => [study.id, index])); // Rasterposition der Treffer.

    this.windows.update(states => states.map(state => {
      const index = position.get(state.id); // Index innerhalb der gefilterten Reihe.

      return index === undefined ? { ...state, maximized: false }
        : {
          ...state,
          x: gap + (index % columns) * (width + gap),
          y: gap + Math.floor(index / columns) * (height + gap),
          width, height, closed: false, maximized: false,
        };
    }));
  }

  /** Beginnt eine Pointer-Interaktion ausschließlich auf großen Ansichten. */
  startInteraction(id: string, mode: 'drag' | 'resize', event: PointerEvent): void {
    if (event.button !== 0 || !window.matchMedia('(min-width: 1001px)').matches ||
      (event.target instanceof Element && event.target.closest('button, a'))) {
      return;
    }

    const current = this.windows().find(state => state.id === id); // Aktueller Zustand des Fensters.

    if (!current || current.maximized) {
      return;
    }

    event.preventDefault();
    this.focusStudy(id);
    this.pointerInteraction.set({
      id, pointerId: event.pointerId, mode, startClientX: event.clientX,
      startClientY: event.clientY, startingWindow: current,
    });
  }

  /** Führt Verschieben und Skalieren begrenzt auf die sichtbare Arbeitsfläche aus. */
  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    const interaction = this.pointerInteraction(); // Noch aktive Interaktion.
    const canvas = this.canvas?.nativeElement;       // Canvas-Grenzen.

    if (!interaction || !canvas || interaction.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const deltaX = event.clientX - interaction.startClientX; // Horizontale Bewegung.
    const deltaY = event.clientY - interaction.startClientY; // Vertikale Bewegung.
    const start = interaction.startingWindow;                 // Vor dem Drag gemessener Zustand.

    if (interaction.mode === 'drag') {
      this.updateWindow(interaction.id, {
        x: this.clamp(start.x + deltaX, 0, Math.max(0, canvas.clientWidth - start.width)),
        y: this.clamp(start.y + deltaY, 0, Math.max(0, canvas.clientHeight - start.height)),
      });
      return;
    }

    this.updateWindow(interaction.id, {
      width: this.clamp(start.width + deltaX, Math.min(250, canvas.clientWidth - start.x), canvas.clientWidth - start.x),
      height: this.clamp(start.height + deltaY, Math.min(180, canvas.clientHeight - start.y), canvas.clientHeight - start.y),
    });
  }

  /** Beendet eine Pointer-Interaktion bei Loslassen oder Abbruch. */
  @HostListener('document:pointerup', ['$event'])
  @HostListener('document:pointercancel', ['$event'])
  endInteraction(event: PointerEvent): void {
    if (this.pointerInteraction()?.pointerId === event.pointerId) {
      this.pointerInteraction.set(null);
    }
  }

  /** Verschiebt oder skaliert ein Fenster barrierearm über die Pfeiltasten. */
  onWindowKeydown(id: string, mode: 'drag' | 'resize', event: KeyboardEvent): void {
    const dx = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0; // Horizontale Richtung.
    const dy = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;  // Vertikale Richtung.
    const canvas = this.canvas?.nativeElement;                                      // Canvas für Grenzen.
    const current = this.windows().find(state => state.id === id);                 // Ausgangsfenster.

    if ((!dx && !dy) || !canvas || !current || current.maximized || event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    this.focusStudy(id);
    const step = event.shiftKey ? 40 : 14; // Beschleunigter Schritt bei gedrückter Umschalttaste.

    if (mode === 'drag') {
      this.updateWindow(id, {
        x: this.clamp(current.x + dx * step, 0, Math.max(0, canvas.clientWidth - current.width)),
        y: this.clamp(current.y + dy * step, 0, Math.max(0, canvas.clientHeight - current.height)),
      });
    } else {
      this.updateWindow(id, {
        width: this.clamp(current.width + dx * step, Math.min(250, canvas.clientWidth - current.x), canvas.clientWidth - current.x),
        height: this.clamp(current.height + dy * step, Math.min(180, canvas.clientHeight - current.y), canvas.clientHeight - current.y),
      });
    }
  }

  /** Hält die Fenster beim Wechsel der Viewportgröße innerhalb des Canvas. */
  @HostListener('window:resize')
  onResize(): void {
    const canvas = this.canvas?.nativeElement; // Arbeitsfläche nach dem Resize.

    if (!canvas) {
      return;
    }

    const isDesktop = window.matchMedia('(min-width: 1001px)').matches; // Aktueller Interaktionsmodus.

    if (isDesktop !== this.wasDesktop) {
      this.wasDesktop = isDesktop;
      if (isDesktop) this.resetLayout();
      return;
    }

    if (this.isTiled()) {
      this.tileLayout();
      return;
    }

    this.windows.update(states => states.map(state => state.maximized
      ? { ...state, x: 8, y: 8, width: canvas.clientWidth - 16, height: canvas.clientHeight - 16 }
      : {
        ...state,
        width: Math.min(state.width, canvas.clientWidth),
        height: Math.min(state.height, canvas.clientHeight),
        x: this.clamp(state.x, 0, Math.max(0, canvas.clientWidth - Math.min(state.width, canvas.clientWidth))),
        y: this.clamp(state.y, 0, Math.max(0, canvas.clientHeight - Math.min(state.height, canvas.clientHeight))),
      }));
  }

  /** Verteilt sämtliche Fenster auf eine begrenzte, absichtlich lockere Arbeitsfläche. */
  private setScatteredLayout(): void {
    const canvas = this.canvas?.nativeElement; // Gemessene Arbeitsfläche.

    if (!canvas) {
      return;
    }

    canvas.style.minHeight = '';
    this.isTiled.set(false);
    this.originalGeometry.clear();
    const width = Math.min(390, Math.max(260, canvas.clientWidth * 0.43)); // Einheitliche Startbreite.
    const height = Math.min(295, Math.max(210, width * 0.72));           // Einheitliche Starthöhe.
    const spaceX = Math.max(0, canvas.clientWidth - width - 18);        // Verfügbarer horizontaler Versatz.
    const spaceY = Math.max(0, canvas.clientHeight - height - 18);      // Verfügbarer vertikaler Versatz.
    const previous = new Map(this.windows().map(state => [state.id, state])); // Vorherige Sichtbarkeit für Shuffle.

    this.windows.set(DESIGN_STUDIES.map((study, index) => ({
      id: study.id,
      x: 9 + this.randomizedOffset(index, 0) * spaceX,
      y: 9 + this.randomizedOffset(index, 1) * spaceY,
      width, height,
      zIndex: index + 1,
      closed: this.scatterSequence > 0 ? (previous.get(study.id)?.closed ?? false) : false,
      maximized: false,
    })));
    this.focusStudy(this.filteredStudies()[0]?.id ?? DESIGN_STUDIES[0].id);
  }

  /** Liefert eine stabile zufallsähnliche Position ohne flackernde Neuverteilung bei Change Detection. */
  private randomizedOffset(index: number, axis: number): number {
    const seed = Math.sin((index + 1) * 127.1 + axis * 311.7 + this.scatterSequence * 79.3) * 43758.5453; // Deterministischer Versatz.

    return seed - Math.floor(seed);
  }

  /** Wendet nur geänderte Geometriefelder auf ein Fenster an. */
  private updateWindow(id: string, changes: Partial<WindowGeometry>): void {
    this.windows.update(states => states.map(state => state.id === id ? { ...state, ...changes } : state));
  }

  /** Wählt bei einem Filterwechsel den ersten gültigen Eintrag aus. */
  private selectFirstMatch(): void {
    if (!this.filteredStudies().some(study => study.id === this.activeId())) {
      const first = this.filteredStudies()[0]; // Erster Treffer nach der Filteränderung.

      if (first) this.focusStudy(first.id);
      else this.activeId.set('');
    }

    if (this.isTiled()) {
      this.tileLayout();
    }
  }

  /** Vereinheitlicht Suchtexte ohne Groß-/Klein- und Akzentunterschiede. */
  private normalize(text: string): string {
    return text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  /** Begrenzt einen Zahlenwert auf eine gültige Minimum-/Maximum-Strecke. */
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(min, max), Math.max(min, value));
  }
}
