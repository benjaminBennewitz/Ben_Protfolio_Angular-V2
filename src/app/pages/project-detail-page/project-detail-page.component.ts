/* src/app/pages/project-detail-page/project-detail-page.component.ts */

/**
 * @file Projekt-Detailseite.
 * @description Rendert SEO-freundliche Detailseiten mit projektspezifischen Deep-Dive-, App-Stack- und Evidence-Modulen.
 */

import { Component, ElementRef, HostListener, NgZone, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PORTFOLIO_PROJECTS } from '../../core/data/portfolio-projects';
import type { ProjectAppModule, ProjectGalleryItem } from '../../core/models/projects.models';
import type { ProjectBloodGuideModeKey } from '../../core/models/blood.models';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { SystemDialogComponent } from '../../shared/system-dialog/system-dialog.component';
import { ProjectTelemetryComponent } from '../../shared/project-telemetry/project-telemetry.component';
import { CarlyMascotPreviewComponent } from '../../shared/carly-mascot-preview/carly-mascot-preview.component';
import { LanguageService } from '../../core/services/language.service';
import { AchievementService } from '../../core/services/achievement.service';
import { SeoService } from '../../core/services/seo.service';
import { CatalogFlow } from './catalog-flow';
import { CatalogReader } from './catalog-reader';

/** Detailseite für einzelne Projekte. */
@Component({
  selector: 'bp-project-detail-page',
  standalone: true,
  imports: [RouterLink, RevealOnScrollDirective, SystemDialogComponent, ProjectTelemetryComponent, CarlyMascotPreviewComponent],
  templateUrl: './project-detail-page.component.html',
  styleUrls: [
    './project-detail-page.component.scss',
    '../../../styles/project-detail-blood.scss',
    '../../../styles/project-detail-carly.scss',
    '../../../styles/project-detail-catalog.scss',
  ],
})
export class ProjectDetailPageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);                                             // Aktive Route mit Projekt-Slug.
  private readonly languageService = inject(LanguageService);                                  // Sprachservice für Inhalte.
  private readonly seoService = inject(SeoService);                                            // SEO-Service für Detailseiten-Meta-Daten.
  private readonly achievementService = inject(AchievementService);                            // Achievement-Service für geschlossene MS-DOS-Fenster.
  private lightboxScrollTop = 0;                                                               // Scrollposition vor dem Öffnen der Lightbox.
  private galleryLightboxReturnFocus: HTMLElement | null = null;                               // Element, das vor dem Öffnen der Lightbox fokussiert war.
  private galleryLightboxFocusFrameId = 0;                                                     // Geplanter Fokus-Frame für Öffnen und Schließen der Lightbox.

  @ViewChild('catalogMenuTrigger') private catalogMenuTrigger?: ElementRef<HTMLButtonElement>; // Trigger des Katalog-Inhaltsverzeichnisses für den Fokus-Rücksprung.

  @ViewChild('catalogMenuDialog') private catalogMenuDialog?: ElementRef<HTMLElement>;         // Modales Inhaltsverzeichnis des Designkatalogs.
  private isLightboxScrollLocked = false;                                                      // Gibt an, ob der Body-Scroll wegen einer offenen Lightbox gesperrt ist.
  private galleryLightboxSwitchToken = 0;                                                      // Wechsel-Token gegen veraltete async Lightbox-Navigationen.
  private pendingGalleryLightboxIndex: number | null = null;                                   // Zielindex während schneller Lightbox-Navigationswechsel.
  private galleryLightboxSwitchTimeoutId: ReturnType<typeof setTimeout> | undefined;           // Timeout-ID für das Zurücksetzen der Lightbox-Fade-Phase.
  private readonly projectScrollResetFrameIds: number[] = [];                                  // Geplante Animation-Frames für das zuverlässige Zurücksetzen der Detailseiten-Scrollposition.
  private readonly galleryLightboxFadeOutDuration = 120;                                       // Dauer der ausblendenden Lightbox-Wechselphase in Millisekunden.
  private readonly galleryLightboxFadeInDuration = 220;                                        // Dauer der einblendenden Lightbox-Wechselphase in Millisekunden.
  private readonly slug = signal<string>('');                                                  // Aktueller Slug aus der Route.
  private readonly selectedArchitectureNodeId = signal<string>('');                            // Ausgewählter Architektur-Knoten im Deep-Dive-Modul.
  private readonly selectedAppModuleId = signal<string>('');                                   // Ausgewählte App-Karte im gestapelten Hero-Modul.
  private readonly closedTerminalWidgetIds = signal<readonly string[]>([]);                    // Geschlossene Terminalfenster im Hero.
  readonly isTerminalVisible = signal<boolean>(true);                                          // Sichtbarkeit des Fallback-MS-DOS-Terminalfensters im Hero.
  readonly isCaseNoteVisible = signal<boolean>(true);                                          // Sichtbarkeit des technischen Hinweisfensters im Deep-Dive.
  readonly bloodGuideMode = signal<ProjectBloodGuideModeKey>('scale');                         // Aktiver Diagrammstil im Werte-Guide der Daten-Dashboard-Seite.
  readonly activeGalleryLightboxIndex = signal<number | null>(null);                           // Aktuell geöffneter Projektgalerie-Eintrag in der gemeinsamen Lightbox.
  readonly galleryLightboxSwitchPhase = signal<'idle' | 'fade-out' | 'fade-in'>('idle');       // Aktuelle Animationsphase beim Durchschalten der Design-Lightbox.
  readonly galleryLightboxSwitchDirection = signal<1 | -1>(1);                                 // Bewegungsrichtung der aktuellen Lightbox-Wechselanimation.
  readonly galleryLightboxBackground = signal<string>('#0a070d');                              // Stabiler sichtbarer Hintergrund der Lightbox, entkoppelt vom gerade wechselnden Inhalt.

  /** Canvas-Referenz der generativen Katalog-Hero-Fläche. */
  @ViewChild('catalogFlowCanvas')
  set catalogFlowCanvasRef(canvasRef: ElementRef<HTMLCanvasElement> | undefined) {
    this.catalogFlow.setCanvas(canvasRef?.nativeElement);
  }

  readonly catalogLoupeLabel = computed(/** Übersetzte Beschriftung des Lupenschalters. */
    () => this.languageService.language() === 'de' ? 'Lupe' : 'Magnifier'
  );
  readonly content = computed(                                                   // Übersetzter Inhalt der aktuellen Sprache.
    /** Übersetzter Inhalt der aktuellen Sprache. */
    () => this.languageService.content()
  );

  readonly project = computed(                                                   // Ausgewähltes Projekt passend zum Route-Slug.
    /** Ausgewähltes Projekt passend zum Route-Slug. */
    () => PORTFOLIO_PROJECTS[this.languageService.language()].find(/** Ausgewähltes Projekt passend zum Route-Slug. */(project) => project.slug === this.slug())
  );

  readonly catalogFlow = new CatalogFlow(this.project, inject(NgZone));          // Canvas-Animation des Katalog-Heros.
  readonly catalogReader = new CatalogReader(                                    // Katalogzustand mit Navigation, Lupe und Menüfokus.
    this.project,
    this.languageService.language,
    /** Liefert den aktuell gerenderten Menü-Trigger für den Fokus-Rücksprung. */
    () => this.catalogMenuTrigger?.nativeElement,
    /** Liefert das aktuell gerenderte Inhaltsverzeichnis für die Fokussteuerung. */
    () => this.catalogMenuDialog?.nativeElement,
  );

  readonly activeArchitectureNode = computed(                                    // Aktiver Architektur-Knoten mit Fallback auf den ersten Eintrag.
    /** Aktiver Architektur-Knoten mit Fallback auf den ersten Eintrag. */
    () => {

      const nodes = this.project()?.architecture ?? []; // Architekturknoten des aktiven Projekts.
      const selectedId = this.selectedArchitectureNodeId();  // Aktuell ausgewählte Kennung im Detailbereich.

      return nodes.find(/** Aktiver Architektur-Knoten mit Fallback auf den ersten Eintrag. */(node) => node.id === selectedId) ?? nodes[0];
    }
  );

  readonly activeAppModule = computed<ProjectAppModule | undefined>(             // Aktive App-Karte im Hero mit Fallback auf die erste Karte.
    /** Aktive App-Karte im Hero mit Fallback auf die erste Karte. */
    () => {

      const modules = this.project()?.appModules ?? []; // App-Module des aktiven Projekts.
      const selectedId = this.selectedAppModuleId();       // Aktuell ausgewählte Kennung im Detailbereich.

      return modules.find(/** Aktive App-Karte im Hero mit Fallback auf die erste Karte. */(module) => module.id === selectedId) ?? modules[0];
    }
  );

  readonly activeAppModuleIndex = computed(                                      // Index der aktiven App-Karte für Stack-Offset und Pagination.
    /** Index der aktiven App-Karte für Stack-Offset und Pagination. */
    () => {

      const modules = this.project()?.appModules ?? [];                                                                                            // App-Module des aktiven Projekts.
      const selectedId = this.activeAppModule()?.id;                                                                                                  // Aktuell ausgewählte Kennung im Detailbereich.
      const index = modules.findIndex(/** Index der aktiven App-Karte für Stack-Offset und Pagination. */(module) => module.id === selectedId); // Aktueller Eintrags- oder Schleifenindex.

      return Math.max(index, 0);
    }
  );

  readonly primaryDetailFragment = computed(                                     // Fragmentziel für den primären Hero-CTA der Detailseite.
    /** Fragmentziel für den primären Hero-CTA der Detailseite. */
    () => {

      const project = this.project(); // Aktives Projekt für Zustandswechsel oder Metadaten.

      if (project?.boardShowcase) {
        return 'project-board-workflow';
      }

      if (project?.bloodShowcase) {
        return 'project-blood-workflow';
      }

      if (project?.catalogShowcase) {
        return 'project-catalog-spread';
      }

      if (project?.telemetry) {
        return 'project-telemetry';
      }

      return 'project-deep-dive';
    }
  );

  readonly activeGalleryLightboxItem = computed<ProjectGalleryItem | undefined>( // Aktiver Galerieeintrag für die gemeinsame Projekt-Lightbox.
    /** Aktiver Galerieeintrag für die gemeinsame Projekt-Lightbox. */
    () => {

      const index = this.activeGalleryLightboxIndex(); // Aktueller Eintrags- oder Schleifenindex.

      if (index === null) {
        return undefined;
      }

      return this.project()?.gallery[index];
    }
  );

  /** Initialisiert Route- und SEO-Reaktionen. */
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(/** Verarbeitet den aktuellen Schritt des Routenwechsels. */(params) => this.updateSlug(params.get('slug') ?? ''));

    effect(/** Synchronisiert Meta-Daten und abhängige Seitenzustände. */() => this.updateSeo());
    effect(/** Synchronisiert Meta-Daten und abhängige Seitenzustände. */() => this.catalogFlow.toggleCatalogFlow());
    effect(/** Synchronisiert Meta-Daten und abhängige Seitenzustände. */() => this.catalogReader.preloadCatalogAssetsAroundActiveSpread());
    effect(/** Synchronisiert Meta-Daten und abhängige Seitenzustände. */() => this.toggleGalleryLightboxScrollLock());
  }

  /** Stoppt laufende Browser-APIs beim Verlassen der Detailseite. */
  ngOnDestroy(): void {
    this.catalogFlow.destroy();
    this.catalogReader.destroy();
    this.galleryLightboxSwitchToken += 1;
    this.resetGalleryLightboxSwitch();
    this.unlockGalleryLightboxScroll();
    this.cancelGalleryLightboxFocusFrame();
    this.galleryLightboxReturnFocus = null;
    this.clearProjectScrollResetFrames();
  }

  /** Setzt den aktuell sichtbaren Architektur-Knoten. */
  selectArchitectureNode(nodeId: string): void {
    this.selectedArchitectureNodeId.set(nodeId);
  }

  /** Setzt die aktive App-Karte im Hero-Stack. */
  selectAppModule(moduleId: string): void {
    this.selectedAppModuleId.set(moduleId);
  }

  /** Wechselt im Hero-Stack zur nächsten oder vorherigen App-Karte. */
  selectAdjacentAppModule(direction: 1 | -1): void {

    const modules = this.project()?.appModules ?? []; // App-Module des aktiven Projekts.

    if (!modules.length) {
      return;
    }

    const currentIndex = this.activeAppModuleIndex();                                  // Index des aktuell nächsten Panels oder Eintrags.
    const nextIndex = (currentIndex + direction + modules.length) % modules.length; // Berechneter Index des nächsten Eintrags.

    this.selectAppModule(modules[nextIndex]?.id ?? modules[0].id);
  }

  /** Reagiert auf Tastaturbefehle innerhalb der modalen Projekt-Overlays. */
  @HostListener('window:keydown', ['$event'])
  handleWindowKeydown(event: KeyboardEvent): void {
    if (this.catalogReader.isCatalogMenuOpen()) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.catalogReader.closeCatalogMenu();
        return;
      }

      if (event.key === 'Tab') {
        this.catalogReader.trapCatalogMenuFocus(event);
        return;
      }
    }

    if (this.activeGalleryLightboxIndex() === null) {
      return;
    }

    if (event.key === 'Tab') {
      this.trapGalleryLightboxFocus(event);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeGalleryLightbox();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.selectAdjacentGalleryItem(-1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.selectAdjacentGalleryItem(1);
    }
  }

  /** Öffnet einen Eintrag der aktuellen Projektgalerie in der Lightbox. */
  openGalleryLightbox(index: number): void {

    const items = this.project()?.gallery ?? []; // Galerieeinträge des aktiven Projekts.

    if (!items[index]) {
      return;
    }

    this.resetGalleryLightboxSwitch();
    this.pendingGalleryLightboxIndex = index;
    this.galleryLightboxReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.galleryLightboxBackground.set(items[index].backgroundColor ?? '#0a070d');
    this.activeGalleryLightboxIndex.set(index);
    this.scheduleGalleryLightboxInitialFocus();
  }

  /** Schließt die gemeinsame Projekt-Lightbox. */
  closeGalleryLightbox(): void {

    const returnFocus = this.galleryLightboxReturnFocus; // Vor dem Öffnen aktives Element für die Fokusrückführung.

    this.galleryLightboxSwitchToken += 1;
    this.resetGalleryLightboxSwitch();
    this.activeGalleryLightboxIndex.set(null);
    this.galleryLightboxReturnFocus = null;
    this.scheduleGalleryLightboxReturnFocus(returnFocus);
  }

  /** Setzt den Tastaturfokus nach dem Öffnen auf den Schließen-Button der Lightbox. */
  private scheduleGalleryLightboxInitialFocus(): void {
    this.cancelGalleryLightboxFocusFrame();
    this.galleryLightboxFocusFrameId = window.requestAnimationFrame(/** Fokussiert nach dem Rendern das erste verfügbare Bedienelement. */() => {
      this.galleryLightboxFocusFrameId = 0;
      document.querySelector<HTMLButtonElement>('.project-detail__lightbox-close')?.focus({ preventScroll: true });
    });
  }

  /** Gibt den Fokus nach dem Schließen an den auslösenden Button zurück. */
  private scheduleGalleryLightboxReturnFocus(target: HTMLElement | null): void {
    this.cancelGalleryLightboxFocusFrame();

    if (!target) {
      return;
    }

    this.galleryLightboxFocusFrameId = window.requestAnimationFrame(/** Gibt den Fokus nach dem Schließen an den auslösenden Button zurück. */() => {
      this.galleryLightboxFocusFrameId = 0;

      if (target.isConnected) {
        target.focus({ preventScroll: true });
      }
    });
  }

  /** Hält Tab-Navigation innerhalb der geöffneten Lightbox. */
  private trapGalleryLightboxFocus(event: KeyboardEvent): void {

    const panel = document.querySelector<HTMLElement>('.project-detail__lightbox-panel'); // Gerenderter Bereich für Messung oder Fokussteuerung.

    if (!panel) {
      return;
    }

    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')); // Innerhalb des Dialogs erreichbare Bedienelemente.

    if (!focusableElements.length) {
      event.preventDefault();
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

  /** Bricht einen noch offenen Fokus-Frame der Lightbox ab. */
  private cancelGalleryLightboxFocusFrame(): void {
    if (!this.galleryLightboxFocusFrameId) {
      return;
    }

    window.cancelAnimationFrame(this.galleryLightboxFocusFrameId);
    this.galleryLightboxFocusFrameId = 0;
  }

  /** Wechselt in der gemeinsamen Projekt-Lightbox zum vorherigen oder nächsten Bild. */
  selectAdjacentGalleryItem(direction: 1 | -1): void {

    const items = this.project()?.gallery ?? [];                                         // Galerieeinträge des aktiven Projekts.
    const index = this.pendingGalleryLightboxIndex ?? this.activeGalleryLightboxIndex(); // Aktueller Eintrags- oder Schleifenindex.

    if (!items.length || index === null) {
      return;
    }

    const nextIndex = (index + direction + items.length) % items.length; // Berechneter Index des nächsten Eintrags.

    this.pendingGalleryLightboxIndex = nextIndex;
    void this.switchGalleryLightboxItem(nextIndex, direction);
  }

  /** Wechselt die Lightbox per ruhigem Crossfade, damit Hintergrundfarben nicht hart blitzen. */
  private async switchGalleryLightboxItem(nextIndex: number, direction: 1 | -1): Promise<void> {

    const items = this.project()?.gallery ?? [];     // Galerieeinträge des aktiven Projekts.
    const currentIndex = this.activeGalleryLightboxIndex(); // Index des aktuell nächsten Panels oder Eintrags.
    const nextItem = items[nextIndex];                  // Galerieeintrag des angeforderten Bildwechsels.
    const switchToken = ++this.galleryLightboxSwitchToken; // Kennung gegen überholte asynchrone Wechsel.

    if (!nextItem || currentIndex === null) {
      return;
    }

    this.clearGalleryLightboxSwitchTimeout();
    this.galleryLightboxSwitchDirection.set(direction);
    this.galleryLightboxSwitchPhase.set('fade-out');

    await Promise.all([
      this.wait(this.galleryLightboxFadeOutDuration),
      this.preloadGalleryLightboxImage(nextItem.image),
    ]);

    if (switchToken !== this.galleryLightboxSwitchToken) {
      return;
    }

    this.galleryLightboxBackground.set(nextItem.backgroundColor ?? '#0a070d');
    this.activeGalleryLightboxIndex.set(nextIndex);
    this.galleryLightboxSwitchPhase.set('fade-in');

    this.galleryLightboxSwitchTimeoutId = setTimeout(/** Wechselt die Lightbox per ruhigem Crossfade, damit Hintergrundfarben nicht hart blitzen. */() => {
      if (switchToken !== this.galleryLightboxSwitchToken) {
        return;
      }

      this.galleryLightboxSwitchPhase.set('idle');
    }, this.galleryLightboxFadeInDuration);
  }

  /** Lädt ein Lightbox-Bild vor dem sichtbaren Wechsel in den Browser-Decoder. */
  private preloadGalleryLightboxImage(asset: string | undefined): Promise<void> {
    if (!asset) {
      return Promise.resolve();
    }

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

  /** Wartet eine definierte Animationsdauer, ohne die UI zu blockieren. */
  private wait(duration: number): Promise<void> {
    return new Promise(/** Registriert Abschluss und Fehlerbehandlung des asynchronen Auftrags. */(resolve) => setTimeout(resolve, duration));
  }

  /** Setzt alle transienten Lightbox-Wechselzustände zurück. */
  private resetGalleryLightboxSwitch(): void {
    this.clearGalleryLightboxSwitchTimeout();
    this.pendingGalleryLightboxIndex = null;
    this.galleryLightboxSwitchPhase.set('idle');
  }

  /** Stoppt einen geplanten Lightbox-Animationsabschluss. */
  private clearGalleryLightboxSwitchTimeout(): void {
    if (!this.galleryLightboxSwitchTimeoutId) {
      return;
    }

    clearTimeout(this.galleryLightboxSwitchTimeoutId);
    this.galleryLightboxSwitchTimeoutId = undefined;
  }

  /** Aktiviert oder deaktiviert den globalen Scroll-Lock passend zur Lightbox. */
  private toggleGalleryLightboxScrollLock(): void {
    if (this.activeGalleryLightboxIndex() === null) {
      this.unlockGalleryLightboxScroll();
      return;
    }

    this.lockGalleryLightboxScroll();
  }

  /** Sperrt den Body-Scroll ohne Fixed-Body-Sprung. */
  private lockGalleryLightboxScroll(): void {
    if (this.isLightboxScrollLocked || typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    this.lightboxScrollTop = window.scrollY;
    this.isLightboxScrollLocked = true;

    document.documentElement.classList.add('bp-lightbox-open');
    document.body.classList.add('bp-lightbox-open');
  }

  /** Gibt den Body-Scroll nach dem Schließen der Lightbox wieder frei. */
  private unlockGalleryLightboxScroll(): void {
    if (!this.isLightboxScrollLocked || typeof document === 'undefined') {
      return;
    }

    this.isLightboxScrollLocked = false;
    this.lightboxScrollTop = 0;

    document.documentElement.classList.remove('bp-lightbox-open');
    document.body.classList.remove('bp-lightbox-open');
  }

  /** Blockiert einfache Browser-Aktionen zum Speichern geschützter Katalog-Assets. */
  blockProtectedAssetEvent(event: Event): false {
    event.preventDefault();
    event.stopPropagation();

    return false;
  }

  /** Prüft, ob ein Terminalfenster im Hero noch sichtbar ist. */
  isTerminalWidgetVisible(widgetId: string): boolean {
    return !this.closedTerminalWidgetIds().includes(widgetId);
  }

  /** Schließt ein einzelnes Terminalfenster im Hero. */
  closeTerminalWidget(widgetId: string): void {
    this.achievementService.unlock('nostalgia-hater');
    this.closedTerminalWidgetIds.update(/** Schließt ein einzelnes Terminalfenster im Hero. */(ids) => (ids.includes(widgetId) ? ids : [...ids, widgetId]));
  }

  /** Schließt das Fallback-MS-DOS-Terminalfenster im Hero. */
  closeTerminal(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isTerminalVisible.set(false);
  }

  /** Schließt das technische Hinweisfenster im Deep-Dive. */
  closeCaseNote(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isCaseNoteVisible.set(false);
  }

  /** Wechselt den Diagrammstil im Werte-Guide. */
  selectBloodGuideMode(mode: ProjectBloodGuideModeKey): void {
    this.bloodGuideMode.set(mode);
  }

  /** Prüft, ob der Diagrammstil im Werte-Guide aktiv ist. */
  isBloodGuideMode(mode: ProjectBloodGuideModeKey): boolean {
    return this.bloodGuideMode() === mode;
  }

  /** Liefert den numerischen Schalter-Index für die animierte Werte-Guide-Markierung. */
  bloodGuideModeIndex(): number {

    const mode = this.bloodGuideMode(); // Ausgewählter Diagrammstil des Werte-Guides.

    return mode === 'bar' ? 1 : mode === 'chart' ? 2 : 0;
  }

  /** Aktualisiert den Slug und setzt Detailseiten-Zustände zurück. */
  private updateSlug(slug: string): void {
    this.scrollProjectToTop();
    this.slug.set(slug);
    this.selectedArchitectureNodeId.set('');
    this.selectedAppModuleId.set('');
    this.closedTerminalWidgetIds.set([]);
    this.galleryLightboxSwitchToken += 1;
    this.resetGalleryLightboxSwitch();
    this.activeGalleryLightboxIndex.set(null);
    this.catalogReader.reset();
    this.isTerminalVisible.set(true);
    this.isCaseNoteVisible.set(true);
  }

  /** Setzt die Body-Scrollposition beim Öffnen oder Wechseln einer Case Study zuverlässig zurück. */
  private scrollProjectToTop(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.clearProjectScrollResetFrames();

    /** Setzt Browser- und Dokument-Scrollposition sofort zurück. */
    const resetScroll = (): void => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();

    const firstFrameId = window.requestAnimationFrame(/** Plant den nächsten Layout- oder Animationsschritt der Seite. */() => { // Erster geplanter Frame zum Zurücksetzen der Scrollposition.
      resetScroll();

      const secondFrameId = window.requestAnimationFrame(resetScroll); // Zweiter Layout-Frame für den abschließenden Scroll-Reset.

      this.projectScrollResetFrameIds.push(secondFrameId);
    });

    this.projectScrollResetFrameIds.push(firstFrameId);
  }

  /** Verwirft noch ausstehende Scroll-Reset-Frames bei schnellen Routenwechseln. */
  private clearProjectScrollResetFrames(): void {
    if (typeof window === 'undefined') {
      return;
    }

    for (const frameId of this.projectScrollResetFrameIds) {
      window.cancelAnimationFrame(frameId);
    }

    this.projectScrollResetFrameIds.length = 0;
  }

  /** Schreibt SEO-Daten für Treffer oder Missing-State. */
  private updateSeo(): void {

    const project = this.project(); // Aktives Projekt für Zustandswechsel oder Metadaten.

    if (project) {
      this.seoService.setProjectSeo(project);
      return;
    }

    this.seoService.setNotFoundSeo(this.content().notFoundTitle, this.content().notFoundText);
  }
}
