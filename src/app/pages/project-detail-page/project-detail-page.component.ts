/* src/app/pages/project-detail-page/project-detail-page.component.ts */

/**
 * @file Projekt-Detailseite.
 * @description Rendert SEO-freundliche Detailseiten mit projektspezifischen Deep-Dive-, App-Stack- und Evidence-Modulen.
 */

import { Component, ElementRef, HostListener, NgZone, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PORTFOLIO_PROJECTS } from '../../core/data/portfolio-projects';
import { ProjectAppModule, ProjectBloodGuideModeKey, ProjectCatalogPage, ProjectCatalogSpread, ProjectGalleryItem } from '../../core/models/portfolio.models';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { SystemDialogComponent } from '../../shared/system-dialog/system-dialog.component';
import { ProjectTelemetryComponent } from '../../shared/project-telemetry/project-telemetry.component';
import { CarlyMascotPreviewComponent } from '../../shared/carly-mascot-preview/carly-mascot-preview.component';
import { LanguageService } from '../../core/services/language.service';
import { AchievementService } from '../../core/services/achievement.service';
import { SeoService } from '../../core/services/seo.service';

/** Stabile Reader-Seite mit fertig berechnetem Bild-Asset für Angular-Bindings. */
interface CatalogReaderPage extends ProjectCatalogPage {
  /** Fertiger Asset-Pfad für die decodierbare Katalogseite. */
  readonly asset?: string;
}

/** Stabile Reader-Doppelseite mit vorbereiteten Seiten-ViewModels. */
interface CatalogReaderSpread extends Omit<ProjectCatalogSpread, 'pages'> {
  /** Vorbereitete Seiten mit stabilen Asset-Bindings. */
  readonly pages: readonly CatalogReaderPage[];
  /** Sichtbarer Seitenbereich für die Overlay-Navigation. */
  readonly pageLabel: string;
}

interface CatalogFlowParticle {
  /** Aktuelle X-Position auf dem Canvas. */
  x: number;
  /** Aktuelle Y-Position auf dem Canvas. */
  y: number;
  /** Individuelle Bewegungsgeschwindigkeit. */
  speed: number;
  /** Individueller Phasenversatz für weicheres Noise-Verhalten. */
  phase: number;
}

/** Beweglicher Lupenzustand für den WebP-Katalogreader. */
interface CatalogLoupeState {
  /** Sichtbarkeit der Kataloglupe. */
  readonly isVisible: boolean;
  /** Seitenkennung der aktuell vergrößerten Katalogseite. */
  readonly pageNumber: string;
  /** Aktueller X-Wert innerhalb der Katalogseite. */
  readonly x: number;
  /** Aktueller Y-Wert innerhalb der Katalogseite. */
  readonly y: number;
  /** Breite des Lupenfensters. */
  readonly width: number;
  /** Höhe des Lupenfensters. */
  readonly height: number;
  /** Vergrößertes Hintergrundbild der aktuellen Katalogseite. */
  readonly asset: string;
  /** Berechnete Hintergrundgröße passend zur echten Seitengröße. */
  readonly backgroundSize: string;
  /** Berechnete Hintergrundposition passend zur Mausposition. */
  readonly backgroundPosition: string;
}

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
  /** Angular-Zone für performante Canvas-Animationen außerhalb der Change Detection. */
  private readonly zone = inject(NgZone);

  /** Aktive Route mit Projekt-Slug. */
  private readonly route = inject(ActivatedRoute);

  /** Sprachservice für Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für Detailseiten-Meta-Daten. */
  private readonly seoService = inject(SeoService);

  /** Achievement-Service für geschlossene MS-DOS-Fenster. */
  private readonly achievementService = inject(AchievementService);

  /** Canvas-Element der generativen Design-Archiv-Hero-Fläche. */
  private catalogFlowCanvas?: HTMLCanvasElement;

  /** Zeichenkontext der generativen Design-Archiv-Hero-Fläche. */
  private catalogFlowContext?: CanvasRenderingContext2D;

  /** Aktive Animation-Frame-ID für sauberes Stoppen. */
  private catalogFlowAnimationId = 0;

  /** Laufende und abgeschlossene Preload-Tasks der Katalogseiten-Assets. */
  private readonly catalogAssetPreloadTasks = new Map<string, Promise<void>>();

  /** Abbruchfunktion für das stille Hintergrund-Preloading des Katalogs. */
  private cancelCatalogBackgroundPreload?: () => void;

  /** Aktiver Schlüssel für das laufende Hintergrund-Preloading. */
  private activeCatalogBackgroundPreloadKey = '';

  /** Wechsel-Token gegen veraltete async Katalog-Navigationswechsel. */
  private catalogSpreadSwitchToken = 0;

  /** Scrollposition vor dem Öffnen der Lightbox. */
  private lightboxScrollTop = 0;

  /** Element, das vor dem Öffnen der Lightbox fokussiert war. */
  private galleryLightboxReturnFocus: HTMLElement | null = null;

  /** Geplanter Fokus-Frame für Öffnen und Schließen der Lightbox. */
  private galleryLightboxFocusFrameId = 0;

  /** Trigger des Katalog-Inhaltsverzeichnisses für den Fokus-Rücksprung. */
  @ViewChild('catalogMenuTrigger') private catalogMenuTrigger?: ElementRef<HTMLButtonElement>;

  /** Modales Inhaltsverzeichnis des Designkatalogs. */
  @ViewChild('catalogMenuDialog') private catalogMenuDialog?: ElementRef<HTMLElement>;

  /** Geplanter Fokus-Frame für das Katalog-Inhaltsverzeichnis. */
  private catalogMenuFocusFrameId = 0;

  /** Gibt an, ob der Body-Scroll wegen einer offenen Lightbox gesperrt ist. */
  private isLightboxScrollLocked = false;

  /** Wechsel-Token gegen veraltete async Lightbox-Navigationen. */
  private galleryLightboxSwitchToken = 0;

  /** Zielindex während schneller Lightbox-Navigationswechsel. */
  private pendingGalleryLightboxIndex: number | null = null;

  /** Timeout-ID für das Zurücksetzen der Lightbox-Fade-Phase. */
  private galleryLightboxSwitchTimeoutId: ReturnType<typeof setTimeout> | undefined;

  /** Geplante Animation-Frames für das zuverlässige Zurücksetzen der Detailseiten-Scrollposition. */
  private readonly projectScrollResetFrameIds: number[] = [];

  /** Dauer der ausblendenden Lightbox-Wechselphase in Millisekunden. */
  private readonly galleryLightboxFadeOutDuration = 120;

  /** Dauer der einblendenden Lightbox-Wechselphase in Millisekunden. */
  private readonly galleryLightboxFadeInDuration = 220;

  /** Resize-Observer für responsive Canvas-Abmessungen. */
  private catalogFlowResizeObserver?: ResizeObserver;

  /** Sichtbarkeits-Observer für die Hero-gebundene Canvas-Animation. */
  private catalogFlowVisibilityObserver?: IntersectionObserver;

  /** Zeitwert der Flow-Field-Bewegung. */
  private catalogFlowTime = 0;

  /** Bewegliche Flow-Partikel für die Canvas-Linien. */
  private readonly catalogFlowParticles: CatalogFlowParticle[] = [];

  /** Anzahl der Flow-Partikel als Performance-Limit. */
  private readonly catalogFlowParticleCount = 180;

  /** Gibt an, ob die Design-Archiv-Hero-Fläche sichtbar genug für Animation ist. */
  readonly isCatalogFlowHeroVisible = signal<boolean>(false);

  /** Aktueller Slug aus der Route. */
  private readonly slug = signal<string>('');

  /** Ausgewählter Architektur-Knoten im Deep-Dive-Modul. */
  private readonly selectedArchitectureNodeId = signal<string>('');

  /** Ausgewählte App-Karte im gestapelten Hero-Modul. */
  private readonly selectedAppModuleId = signal<string>('');

  /** Geschlossene Terminalfenster im Hero. */
  private readonly closedTerminalWidgetIds = signal<readonly string[]>([]);

  /** Sichtbarkeit des Fallback-MS-DOS-Terminalfensters im Hero. */
  readonly isTerminalVisible = signal<boolean>(true);

  /** Sichtbarkeit des technischen Hinweisfensters im Deep-Dive. */
  readonly isCaseNoteVisible = signal<boolean>(true);

  /** Aktiver Diagrammstil im Werte-Guide der Daten-Dashboard-Seite. */
  readonly bloodGuideMode = signal<ProjectBloodGuideModeKey>('scale');

  /** Aktuell ausgewählte Doppelseite im Designkatalog. */
  readonly activeCatalogSpreadIndex = signal<number>(0);

  /** Bewegungsrichtung der aktuellen Katalogseiten-Animation. */
  readonly catalogSpreadDirection = signal<1 | -1 | 0>(0);

  /** Ladezustand während eine Ziel-Doppelseite vor dem sichtbaren Wechsel decodiert wird. */
  readonly isCatalogReaderBusy = signal<boolean>(false);

  /** Aktuell geöffneter Projektgalerie-Eintrag in der gemeinsamen Lightbox. */
  readonly activeGalleryLightboxIndex = signal<number | null>(null);

  /** Aktuelle Animationsphase beim Durchschalten der Design-Lightbox. */
  readonly galleryLightboxSwitchPhase = signal<'idle' | 'fade-out' | 'fade-in'>('idle');

  /** Bewegungsrichtung der aktuellen Lightbox-Wechselanimation. */
  readonly galleryLightboxSwitchDirection = signal<1 | -1>(1);

  /** Stabiler sichtbarer Hintergrund der Lightbox, entkoppelt vom gerade wechselnden Inhalt. */
  readonly galleryLightboxBackground = signal<string>('#0a070d');

  /** Sichtbarkeit des Inhaltsverzeichnis-Overlays im Designkatalog. */
  readonly isCatalogMenuOpen = signal<boolean>(false);

  /** Bewegliche Hover-Lupe für echte Katalogseitenbilder. */
  readonly catalogLoupe = signal<CatalogLoupeState>({ isVisible: false, pageNumber: '', x: 0, y: 0, width: 0, height: 0, asset: '', backgroundSize: '', backgroundPosition: '' });

  /** Canvas-Referenz der generativen Katalog-Hero-Fläche. */
  @ViewChild('catalogFlowCanvas')
  set catalogFlowCanvasRef(canvasRef: ElementRef<HTMLCanvasElement> | undefined) {
    this.catalogFlowCanvas = canvasRef?.nativeElement;
    this.connectCatalogFlowVisibilityObserver();
  }

  /** Übersetzter Inhalt der aktuellen Sprache. */
  readonly content = computed(() => this.languageService.content());

  /** Ausgewähltes Projekt passend zum Route-Slug. */
  readonly project = computed(() => PORTFOLIO_PROJECTS[this.languageService.language()].find((project) => project.slug === this.slug()));

  /** Aktiver Architektur-Knoten mit Fallback auf den ersten Eintrag. */
  readonly activeArchitectureNode = computed(() => {
    const nodes      = this.project()?.architecture ?? [];
    const selectedId = this.selectedArchitectureNodeId();

    return nodes.find((node) => node.id === selectedId) ?? nodes[0];
  });

  /** Aktive App-Karte im Hero mit Fallback auf die erste Karte. */
  readonly activeAppModule = computed<ProjectAppModule | undefined>(() => {
    const modules    = this.project()?.appModules ?? [];
    const selectedId = this.selectedAppModuleId();

    return modules.find((module) => module.id === selectedId) ?? modules[0];
  });

  /** Index der aktiven App-Karte für Stack-Offset und Pagination. */
  readonly activeAppModuleIndex = computed(() => {
    const modules    = this.project()?.appModules ?? [];
    const selectedId = this.activeAppModule()?.id;
    const index      = modules.findIndex((module) => module.id === selectedId);

    return Math.max(index, 0);
  });

  /** Aktive Doppelseite des digitalen Designkatalogs mit stabilen Asset-Bindings. */
  readonly activeCatalogSpread = computed<CatalogReaderSpread | undefined>(() => {
    const showcase = this.project()?.catalogShowcase;
    const spreads  = showcase?.spreads ?? [];
    const index    = this.getNormalizedCatalogSpreadIndex();
    const spread   = spreads[index] ?? spreads[0];

    return spread ? this.createCatalogReaderSpread(spread) : undefined;
  });

  /** Fragmentziel für den primären Hero-CTA der Detailseite. */
  readonly primaryDetailFragment = computed(() => {
    const project = this.project();

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
  });

  /** Aktiver Galerieeintrag für die gemeinsame Projekt-Lightbox. */
  readonly activeGalleryLightboxItem = computed<ProjectGalleryItem | undefined>(() => {
    const index = this.activeGalleryLightboxIndex();

    if (index === null) {
      return undefined;
    }

    return this.project()?.gallery[index];
  });

  /** Initialisiert Route- und SEO-Reaktionen. */
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => this.updateSlug(params.get('slug') ?? ''));

    effect(() => this.updateSeo());
    effect(() => this.toggleCatalogFlow());
    effect(() => this.preloadCatalogAssetsAroundActiveSpread());
    effect(() => this.toggleGalleryLightboxScrollLock());
  }

  /** Stoppt laufende Browser-APIs beim Verlassen der Detailseite. */
  ngOnDestroy(): void {
    this.stopCatalogFlow();
    this.catalogFlowVisibilityObserver?.disconnect();
    this.cancelCatalogBackgroundPreload?.();
    this.galleryLightboxSwitchToken += 1;
    this.resetGalleryLightboxSwitch();
    this.unlockGalleryLightboxScroll();
    this.cancelGalleryLightboxFocusFrame();
    this.galleryLightboxReturnFocus = null;
    this.cancelCatalogMenuFocusFrame();
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
    const modules = this.project()?.appModules ?? [];

    if (!modules.length) {
      return;
    }

    const currentIndex = this.activeAppModuleIndex();
    const nextIndex    = (currentIndex + direction + modules.length) % modules.length;

    this.selectAppModule(modules[nextIndex]?.id ?? modules[0].id);
  }

  /** Wählt eine konkrete Katalog-Doppelseite aus. */
  selectCatalogSpread(index: number): void {
    this.hideCatalogLoupe();

    const currentIndex = this.getNormalizedCatalogSpreadIndex();
    const direction    = index > currentIndex ? 1 : index < currentIndex ? -1 : 0;

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

  /** Aktualisiert die rechteckige Hover-Lupe innerhalb einer Katalogseite. */
  updateCatalogLoupe(event: PointerEvent, page: CatalogReaderPage): void {
    if (!page.asset || event.pointerType === 'touch' || this.isCatalogMenuOpen()) {
      this.hideCatalogLoupe();
      return;
    }

    const element = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;

    if (!element) {
      this.hideCatalogLoupe();
      return;
    }

    const rect = element.getBoundingClientRect();
    const x    = event.clientX - rect.left;
    const y    = event.clientY - rect.top;

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

  /** Reagiert auf Tastaturbefehle innerhalb der modalen Projekt-Overlays. */
  @HostListener('window:keydown', ['$event'])
  handleWindowKeydown(event: KeyboardEvent): void {
    if (this.isCatalogMenuOpen()) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeCatalogMenu();
        return;
      }

      if (event.key === 'Tab') {
        this.trapCatalogMenuFocus(event);
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
    const items = this.project()?.gallery ?? [];

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
    const returnFocus = this.galleryLightboxReturnFocus;

    this.galleryLightboxSwitchToken += 1;
    this.resetGalleryLightboxSwitch();
    this.activeGalleryLightboxIndex.set(null);
    this.galleryLightboxReturnFocus = null;
    this.scheduleGalleryLightboxReturnFocus(returnFocus);
  }

  /** Setzt den Fokus nach dem Öffnen auf den Schließen-Button des Katalogmenüs. */
  private scheduleCatalogMenuInitialFocus(): void {
    this.cancelCatalogMenuFocusFrame();
    this.catalogMenuFocusFrameId = window.requestAnimationFrame(() => {
      this.catalogMenuFocusFrameId = 0;
      this.catalogMenuDialog?.nativeElement.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true });
    });
  }

  /** Gibt den Fokus nach dem Schließen an den stabilen Katalogmenü-Trigger zurück. */
  private scheduleCatalogMenuFocusReturn(): void {
    this.cancelCatalogMenuFocusFrame();
    this.catalogMenuFocusFrameId = window.requestAnimationFrame(() => {
      this.catalogMenuFocusFrameId = 0;
      this.catalogMenuTrigger?.nativeElement.focus({ preventScroll: true });
    });
  }

  /** Hält Tab-Navigation innerhalb des geöffneten Katalog-Inhaltsverzeichnisses. */
  private trapCatalogMenuFocus(event: KeyboardEvent): void {
    const panel = this.catalogMenuDialog?.nativeElement;

    if (!panel) {
      return;
    }

    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')) as HTMLElement[];

    if (!focusableElements.length) {
      event.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

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

  /** Setzt den Tastaturfokus nach dem Öffnen auf den Schließen-Button der Lightbox. */
  private scheduleGalleryLightboxInitialFocus(): void {
    this.cancelGalleryLightboxFocusFrame();
    this.galleryLightboxFocusFrameId = window.requestAnimationFrame(() => {
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

    this.galleryLightboxFocusFrameId = window.requestAnimationFrame(() => {
      this.galleryLightboxFocusFrameId = 0;

      if (target.isConnected) {
        target.focus({ preventScroll: true });
      }
    });
  }

  /** Hält Tab-Navigation innerhalb der geöffneten Lightbox. */
  private trapGalleryLightboxFocus(event: KeyboardEvent): void {
    const panel = document.querySelector<HTMLElement>('.project-detail__lightbox-panel');

    if (!panel) {
      return;
    }

    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));

    if (!focusableElements.length) {
      event.preventDefault();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

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
    const items = this.project()?.gallery ?? [];
    const index = this.pendingGalleryLightboxIndex ?? this.activeGalleryLightboxIndex();

    if (!items.length || index === null) {
      return;
    }

    const nextIndex = (index + direction + items.length) % items.length;

    this.pendingGalleryLightboxIndex = nextIndex;
    void this.switchGalleryLightboxItem(nextIndex, direction);
  }

  /** Baut den stabilen Lupenzustand aus Seitengröße und Mausposition. */
  private createCatalogLoupeState(page: CatalogReaderPage, rect: DOMRect, x: number, y: number): CatalogLoupeState {
    const zoom   = 1.8;
    const width  = this.getCatalogLoupeWidth();
    const height = Math.round(width * 0.68);
    const bgX    = -(x * zoom - width / 2);
    const bgY    = -(y * zoom - height / 2);

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

  /** Wechselt die Lightbox per ruhigem Crossfade, damit Hintergrundfarben nicht hart blitzen. */
  private async switchGalleryLightboxItem(nextIndex: number, direction: 1 | -1): Promise<void> {
    const items        = this.project()?.gallery ?? [];
    const currentIndex = this.activeGalleryLightboxIndex();
    const nextItem     = items[nextIndex];
    const switchToken  = ++this.galleryLightboxSwitchToken;

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

    this.galleryLightboxSwitchTimeoutId = setTimeout(() => {
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

    return new Promise((resolve) => {
      const image = new Image();

      image.decoding = 'async';
      image.loading = 'eager';

      const resolveDecodedImage = () => {
        if (image.decode) {
          void image.decode().then(resolve).catch(resolve);
          return;
        }

        resolve();
      };

      image.onload = resolveDecodedImage;
      image.onerror = () => resolve();
      image.src = asset;

      if (image.complete) {
        resolveDecodedImage();
      }
    });
  }

  /** Wartet eine definierte Animationsdauer, ohne die UI zu blockieren. */
  private wait(duration: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration));
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

  /** Erstellt eine stabile Reader-Doppelseite ohne Template-Methoden für Resource-URLs. */
  private createCatalogReaderSpread(spread: ProjectCatalogSpread): CatalogReaderSpread {
    const pages     = spread.pages.map((page) => this.createCatalogReaderPage(page));
    const pageLabel = this.getCatalogSpreadPageLabel(pages);

    return { ...spread, pages, pageLabel };
  }

  /** Erstellt eine stabile Reader-Seite mit decodierbarem Bild-Asset. */
  private createCatalogReaderPage(page: ProjectCatalogPage): CatalogReaderPage {
    const asset = this.getCatalogPageAsset(page);

    return { ...page, asset };
  }

  /** Gibt den passenden Katalogseiten-Pfad für den einsprachigen WebP-Katalog zurück. */
  private getCatalogPageAsset(page: ProjectCatalogPage): string | undefined {
    const language = this.languageService.language();

    return page.imageByLanguage?.[language] ?? page.image;
  }

  /** Gibt den sichtbaren Seitenbereich der aktuellen Reader-Ansicht zurück. */
  private getCatalogSpreadPageLabel(pages: readonly CatalogReaderPage[]): string {
    const numbers = pages.map((page) => page.number);

    if (!numbers.length) {
      return '';
    }

    const total = this.project()?.catalogShowcase?.spreads.at(-1)?.pages.at(-1)?.number ?? numbers.at(-1) ?? '';
    const range = numbers.length === 1 ? numbers[0] : `${numbers[0]}–${numbers.at(-1)}`;

    return `${range} / ${total}`;
  }

  /** Setzt den Reader-Index erst nach fertig decodierten Zielseiten. */
  private async setCatalogSpreadIndex(index: number, direction: 1 | -1 | 0 = 0): Promise<void> {
    const spreads = this.project()?.catalogShowcase?.spreads ?? [];

    if (!spreads.length) {
      return;
    }

    const normalizedIndex = (index + spreads.length) % spreads.length;

    if (normalizedIndex === this.getNormalizedCatalogSpreadIndex()) {
      this.catalogSpreadDirection.set(0);
      return;
    }

    const switchToken = ++this.catalogSpreadSwitchToken;

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
  private preloadCatalogAssetsAroundActiveSpread(): void {
    const showcase = this.project()?.catalogShowcase;

    if (!showcase || typeof window === 'undefined') {
      return;
    }

    const activeIndex   = this.getNormalizedCatalogSpreadIndex();
    const preloadPages = [
      ...showcase.spreads.slice(0, 4).flatMap((spread) => spread.pages),
      ...showcase.spreads.slice(Math.max(activeIndex - 1, 0), activeIndex + 4).flatMap((spread) => spread.pages),
    ];

    preloadPages.forEach((page) => void this.preloadCatalogAsset(this.getCatalogPageAsset(page)));
  }

  /** Lädt eine konkrete Doppelseite vollständig vor dem sichtbaren Wechsel. */
  private async preloadCatalogSpreadAssets(index: number): Promise<void> {
    const spreads = this.project()?.catalogShowcase?.spreads ?? [];
    const spread  = spreads[index];

    if (!spread) {
      return;
    }

    await Promise.all(spread.pages.map((page) => this.preloadCatalogAsset(this.getCatalogPageAsset(page))));
  }

  /** Startet ein stilles Hintergrund-Preloading für den kompletten aktuellen Sprachkatalog. */
  private scheduleCatalogBackgroundPreload(): void {
    const project  = this.project();
    const showcase = project?.catalogShowcase;

    if (!project || !showcase || typeof window === 'undefined') {
      this.cancelCatalogBackgroundPreload?.();
      this.activeCatalogBackgroundPreloadKey = '';
      return;
    }

    const preloadKey = `${project.slug}:${this.languageService.language()}`;

    if (this.activeCatalogBackgroundPreloadKey === preloadKey) {
      return;
    }

    this.cancelCatalogBackgroundPreload?.();
    this.activeCatalogBackgroundPreloadKey = preloadKey;

    const assets = showcase.spreads
      .flatMap((spread) => spread.pages)
      .map((page) => this.getCatalogPageAsset(page))
      .filter((asset): asset is string => Boolean(asset));

    let assetIndex = 0;

    const preloadNextAsset = () => {
      const asset = assets[assetIndex];

      if (!asset) {
        this.cancelCatalogBackgroundPreload = undefined;
        return;
      }

      assetIndex += 1;

      void this.preloadCatalogAsset(asset).finally(() => this.requestCatalogIdleTask(preloadNextAsset));
    };

    this.requestCatalogIdleTask(preloadNextAsset);
  }

  /** Plant einen einzelnen leisen Preload-Schritt mit IdleCallback-Fallback. */
  private requestCatalogIdleTask(callback: () => void): void {
    const idleWindow = window as Window & {
      requestIdleCallback?: (handler: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
      const handle = idleWindow.requestIdleCallback(callback, { timeout: 1500 });

      this.cancelCatalogBackgroundPreload = () => idleWindow.cancelIdleCallback?.(handle);
      return;
    }

    const handle = window.setTimeout(callback, 140);

    this.cancelCatalogBackgroundPreload = () => window.clearTimeout(handle);
  }

  /** Lädt ein einzelnes Katalogseiten-Asset ohne sichtbare UI-Auswirkung vor. */
  private preloadCatalogAsset(asset: string | undefined): Promise<void> {
    if (!asset || typeof window === 'undefined') {
      return Promise.resolve();
    }

    const existingTask = this.catalogAssetPreloadTasks.get(asset);

    if (existingTask) {
      return existingTask;
    }

    const task = this.isCatalogImageAsset(asset) ? this.preloadCatalogImageAsset(asset) : this.preloadCatalogFileAsset(asset);
    const safeTask = task.catch(() => undefined);

    this.catalogAssetPreloadTasks.set(asset, safeTask);

    return safeTask;
  }

  /** Lädt ein Bild und wartet, bis es sicher decodiert ist. */
  private preloadCatalogImageAsset(asset: string): Promise<void> {
    return new Promise((resolve) => {
      const image = new Image();

      image.decoding = 'async';
      image.loading = 'eager';
      const resolveDecodedImage = () => {
        if (image.decode) {
          void image.decode().then(resolve).catch(resolve);
          return;
        }

        resolve();
      };

      image.onload = resolveDecodedImage;
      image.onerror = () => resolve();
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
    this.closedTerminalWidgetIds.update((ids) => (ids.includes(widgetId) ? ids : [...ids, widgetId]));
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
    const mode = this.bloodGuideMode();

    return mode === 'bar' ? 1 : mode === 'chart' ? 2 : 0;
  }

  /** Aktualisiert den Slug und setzt Detailseiten-Zustände zurück. */
  private updateSlug(slug: string): void {
    this.scrollProjectToTop();
    this.slug.set(slug);
    this.selectedArchitectureNodeId.set('');
    this.selectedAppModuleId.set('');
    this.closedTerminalWidgetIds.set([]);
    this.catalogSpreadSwitchToken += 1;
    this.galleryLightboxSwitchToken += 1;
    this.activeCatalogSpreadIndex.set(0);
    this.catalogSpreadDirection.set(0);
    this.isCatalogReaderBusy.set(false);
    this.resetGalleryLightboxSwitch();
    this.activeGalleryLightboxIndex.set(null);
    this.isCatalogMenuOpen.set(false);
    this.cancelCatalogMenuFocusFrame();
    this.hideCatalogLoupe();
    this.isTerminalVisible.set(true);
    this.isCaseNoteVisible.set(true);
  }


  /** Setzt die Body-Scrollposition beim Öffnen oder Wechseln einer Case Study zuverlässig zurück. */
  private scrollProjectToTop(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.clearProjectScrollResetFrames();

    const resetScroll = (): void => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();

    const firstFrameId = window.requestAnimationFrame(() => {
      resetScroll();

      const secondFrameId = window.requestAnimationFrame(resetScroll);
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

  /** Ermittelt den gültigen Katalog-Index für aktuelle Projektdaten. */
  private getNormalizedCatalogSpreadIndex(): number {
    const spreads = this.project()?.catalogShowcase?.spreads ?? [];

    if (!spreads.length) {
      return 0;
    }

    return Math.min(Math.max(this.activeCatalogSpreadIndex(), 0), spreads.length - 1);
  }

  /** Startet oder stoppt die generative Katalog-Hero-Fläche passend zu Projekt und Viewport. */
  private toggleCatalogFlow(): void {
    if (this.project()?.slug !== 'grafikdesign-katalog' || !this.isCatalogFlowHeroVisible()) {
      this.stopCatalogFlow();
      return;
    }

    queueMicrotask(() => this.restartCatalogFlow());
  }

  /** Initialisiert die Canvas-Animation neu. */
  private restartCatalogFlow(): void {
    this.stopCatalogFlow();

    if (!this.catalogFlowCanvas || this.project()?.slug !== 'grafikdesign-katalog' || !this.isCatalogFlowHeroVisible()) {
      return;
    }

    const context = this.catalogFlowCanvas.getContext('2d', { alpha: true });

    if (!context) {
      return;
    }

    this.catalogFlowContext = context;
    this.catalogFlowResizeObserver = new ResizeObserver(() => this.resizeCatalogFlow());
    this.catalogFlowResizeObserver.observe(this.catalogFlowCanvas);
    this.resizeCatalogFlow();
    this.seedCatalogFlowParticles();

    if (this.isCatalogMotionReduced()) {
      this.drawCatalogFlowFrame();
      return;
    }

    this.zone.runOutsideAngular(() => {
      const draw = () => {
        this.drawCatalogFlowFrame();

        if (!this.catalogFlowContext || !this.isCatalogFlowHeroVisible()) {
          return;
        }

        this.catalogFlowAnimationId = requestAnimationFrame(draw);
      };

      this.catalogFlowAnimationId = requestAnimationFrame(draw);
    });
  }

  /** Verbindet die Katalog-Hero-Animation mit der echten Hero-Sichtbarkeit. */
  private connectCatalogFlowVisibilityObserver(): void {
    this.catalogFlowVisibilityObserver?.disconnect();
    this.catalogFlowVisibilityObserver = undefined;
    this.isCatalogFlowHeroVisible.set(false);

    if (!this.catalogFlowCanvas || typeof window === 'undefined') {
      this.stopCatalogFlow();
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.isCatalogFlowHeroVisible.set(true);
      return;
    }

    const heroElement = this.catalogFlowCanvas.closest('.project-detail__hero') ?? this.catalogFlowCanvas;

    this.catalogFlowVisibilityObserver = new IntersectionObserver((entries) => {
      const isVisible = Boolean(entries[0]?.isIntersecting);

      this.isCatalogFlowHeroVisible.set(isVisible);

      if (!isVisible) {
        this.stopCatalogFlow();
      }
    }, { threshold: [0, 0.08, 0.2] });

    this.catalogFlowVisibilityObserver.observe(heroElement);
  }

  /** Stoppt Canvas-Animation und Observer. */
  private stopCatalogFlow(): void {
    if (this.catalogFlowAnimationId) {
      cancelAnimationFrame(this.catalogFlowAnimationId);
      this.catalogFlowAnimationId = 0;
    }

    this.catalogFlowResizeObserver?.disconnect();
    this.catalogFlowResizeObserver = undefined;
    this.catalogFlowContext = undefined;
  }

  /** Passt die Canvas-Auflösung an die echte Darstellungsgröße an. */
  private resizeCatalogFlow(): void {
    if (!this.catalogFlowCanvas || !this.catalogFlowContext) {
      return;
    }

    const rect       = this.catalogFlowCanvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width      = Math.max(1, Math.floor(rect.width * pixelRatio));
    const height     = Math.max(1, Math.floor(rect.height * pixelRatio));

    if (this.catalogFlowCanvas.width === width && this.catalogFlowCanvas.height === height) {
      return;
    }

    this.catalogFlowCanvas.width = width;
    this.catalogFlowCanvas.height = height;
    this.catalogFlowContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.seedCatalogFlowParticles();
  }

  /** Verteilt die Flow-Partikel neu über die gesamte Fläche. */
  private seedCatalogFlowParticles(): void {
    if (!this.catalogFlowCanvas) {
      return;
    }

    const rect = this.catalogFlowCanvas.getBoundingClientRect();

    this.catalogFlowParticles.length = 0;

    for (let index = 0; index < this.catalogFlowParticleCount; index += 1) {
      this.catalogFlowParticles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        speed: 0.35 + Math.random() * 1.15,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /** Zeichnet eine Flow-Field-ähnliche Animationsstufe. */
  private drawCatalogFlowFrame(): void {
    if (!this.catalogFlowCanvas || !this.catalogFlowContext) {
      return;
    }

    if (!this.isCatalogFlowHeroVisible()) {
      this.stopCatalogFlow();
      return;
    }

    const rect = this.catalogFlowCanvas.getBoundingClientRect();
    const ctx  = this.catalogFlowContext;

    this.catalogFlowTime += 0.006;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.045)';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 0.85;

    for (const particle of this.catalogFlowParticles) {
      const previousX = particle.x;
      const previousY = particle.y;
      const angle     = this.getCatalogFlowAngle(particle);

      particle.x += Math.cos(angle) * particle.speed;
      particle.y += Math.sin(angle) * particle.speed;

      if (particle.x < -20 || particle.x > rect.width + 20 || particle.y < -20 || particle.y > rect.height + 20) {
        this.resetCatalogFlowParticle(particle, rect.width, rect.height);
        continue;
      }

      ctx.strokeStyle = this.getCatalogFlowStroke(particle, rect.width);
      ctx.beginPath();
      ctx.moveTo(previousX, previousY);
      ctx.lineTo(particle.x, particle.y);
      ctx.stroke();
    }
  }

  /** Erzeugt einen weichen Winkel aus trigonometrischem Pseudo-Noise. */
  private getCatalogFlowAngle(particle: CatalogFlowParticle): number {
    const xWave = Math.sin(particle.x * 0.0065 + this.catalogFlowTime + particle.phase);
    const yWave = Math.cos(particle.y * 0.0075 - this.catalogFlowTime * 0.9);
    const zWave = Math.sin((particle.x + particle.y) * 0.0028 + this.catalogFlowTime * 1.6);

    return (xWave + yWave + zWave) * Math.PI;
  }

  /** Setzt ein Partikel am Rand neu ein, ohne harte Wrap-Linien zu zeichnen. */
  private resetCatalogFlowParticle(particle: CatalogFlowParticle, width: number, height: number): void {
    const side = Math.floor(Math.random() * 4);

    particle.x = side === 0 ? 0 : side === 1 ? width : Math.random() * width;
    particle.y = side === 2 ? 0 : side === 3 ? height : Math.random() * height;
    particle.speed = 0.35 + Math.random() * 1.15;
    particle.phase = Math.random() * Math.PI * 2;
  }

  /** Ermittelt die Linienfarbe mit leichter Positionsvariation. */
  private getCatalogFlowStroke(particle: CatalogFlowParticle, width: number): string {
    const progress = width > 0 ? particle.x / width : 0;
    const alpha    = 0.16 + Math.sin(progress * Math.PI) * 0.22;

    return `rgba(255, 79, 216, ${alpha.toFixed(3)})`;
  }

  /** Prüft reduzierte Motion-Einstellungen für den Canvas. */
  private isCatalogMotionReduced(): boolean {
    const motionMode = document.documentElement.dataset['motion'];

    return motionMode === 'off' || motionMode === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Schreibt SEO-Daten für Treffer oder Missing-State. */
  private updateSeo(): void {
    const project = this.project();

    if (project) {
      this.seoService.setProjectSeo(project);
      return;
    }

    this.seoService.setNotFoundSeo(this.content().notFoundTitle, this.content().notFoundText);
  }
}
