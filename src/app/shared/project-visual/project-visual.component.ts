/* src/app/shared/project-visual/project-visual.component.ts */

/**
 * @file Visuelles Projektmotiv.
 * @description Erzeugt dekorative Projekt-Previews mit CSS-Flächen und gezielten Halftone-Assets.
 */

import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import type { PortfolioProject, ProjectsContent } from '../../core/models/projects.models';
import { AchievementService } from '../../core/services/achievement.service';

/** Zustand der interaktiven Bombe. */
type BombState = 'idle' | 'charging' | 'boom' | 'gone';

/** Zustand der Blutanalyse-Interaktion. */
type BloodAnalysisState = 'idle' | 'running' | 'complete';

/** Native Assetgröße für stabile Bild-Seitenverhältnisse. */
interface VisualAssetSize {
  readonly width: number;  // Native Bildbreite.
  readonly height: number; // Native Bildhöhe.
}

/** Dekorative Preview-Fläche für Projektkarten und Detailseiten. */
@Component({
  selector: 'bp-project-visual',
  standalone: true,
  templateUrl: './project-visual.component.html',
  styleUrl: './project-visual.component.scss',
})
export class ProjectVisualComponent implements AfterViewInit, OnDestroy {
  private readonly achievementService = inject(AchievementService);                                                                // Achievement-Service für interaktive Projekt-Trophäen.

  @Input({ required: true }) project!: PortfolioProject;                                                                           // Projekt, aus dem Name, Typ und Accent gezogen werden.

  @ViewChild('visualShell') private visualShell?: ElementRef<HTMLElement>;                                                         // Root-Element der Visual-Bühne für viewportnahe Blutanalyse-Offsets.

  @Input() large = false;                                                                                                          // Große Detailvariante der Preview.

  @Input() hideAssets = false;                                                                                                     // Versteckt Assets, wenn sie außerhalb der Preview-Bühne gerendert werden.

  @Input() showTaskStatus = false;                                                                                                 // Zeigt das zusätzliche Status-Asset innerhalb der Preview-Bühne.

  @Input() taskStatusSaved = false;                                                                                                // Wechselt das Status-Asset in den erfolgreichen Saved-State.

  @Input() labels?: ProjectsContent;                                                                                               // Übersetzte ARIA-Labels für interaktive Projektassets.

  /** Zugängliche Beschriftung für das interaktive Auge. */
  readonly eyeButtonLabel = () => this.labels?.eyeButtonLabel ?? 'Auge anstupsen';

  /** Zugängliche Beschriftung für die interaktive Bombe. */
  readonly bombButtonLabel = () => this.labels?.bombButtonLabel ?? 'Bombe zünden';

  /** Zugängliche Beschriftung für die Blutanalyse-Interaktion. */
  readonly bloodButtonLabel = () => this.labels?.bloodButtonLabel ?? 'Dashboard starten';

  private readonly eyeResetDelayMs = 2800;                                                                                         // Dauer, bis Auge und Träne wieder zurückgesetzt werden.
  private readonly bombChargeDelayMs = 4000;                                                                                       // Dauer der Bomben-Countdown-Animation.
  private readonly boomRemoveDelayMs = 760;                                                                                        // Dauer der sichtbaren Boom-Grafik.
  private readonly bloodStatuses = ['CALIBRATING', 'LEECHES ATTACHED', 'EXTRACTING VALUES', 'NO ABNORMALITIES DETECTED'] as const; // Schrittfolge der Blutanalyse.
  private readonly eyeHurt = signal(false);                                                                                        // Aktueller Trefferzustand des Auges.
  private readonly eyeTearVisible = signal(false);                                                                                 // Sichtbarkeit der animierten Träne.
  private readonly bombState = signal<BombState>('idle');                                                                          // Aktueller Zustand der interaktiven Bombe.
  private readonly bloodState = signal<BloodAnalysisState>('idle');                                                                // Aktueller Gesamtzustand der Blutanalyse.
  private readonly bloodArmVisible = signal(false);                                                                                // Sichtbarkeit des Arms der Blutanalyse-Szene.
  private readonly bloodLeechesVisible = signal(false);                                                                            // Sichtbarkeit der Blutegel.
  private readonly bloodLeechesSatisfied = signal(false);                                                                          // Wechsel der Blutegel in den sattgesaugten Zustand.
  private readonly bloodAnalysisVisible = signal(false);                                                                           // Sichtbarkeit der Analysebox.
  private readonly bloodStatusIndex = signal(0);                                                                                   // Aktiver Fortschrittsschritt der Analyse.
  private readonly bloodLeftOffset = signal(0);                                                                                    // Abstand der Visual-Bühne zum linken Viewport-Rand.
  private eyeResetTimer: ReturnType<typeof setTimeout> | null = null;                                                              // Timer für das Zurücksetzen des Auges.
  private bombChargeTimer: ReturnType<typeof setTimeout> | null = null;                                                            // Timer für den Wechsel von Bombe zu Explosion.
  private bombRemoveTimer: ReturnType<typeof setTimeout> | null = null;                                                            // Timer für das Entfernen der Explosion.
  private readonly bloodTimers: ReturnType<typeof setTimeout>[] = [];                                                              // Sammelcontainer für die Blutanalyse-Timer.
  private readonly visualAssetMap: Readonly<Record<string, readonly string[]>> = {                                                 // Zuordnung dekorativer Halftone-Assets zu den Projekt-Slugs.
    intranet: ['assets/images/project-stack/eyeball-green.webp', 'assets/images/project-stack/bomb.webp'],
    'kanban-klon': ['assets/images/project-stack/trash-red.webp', 'assets/images/project-stack/paper-crumpled-pink.webp'],
    'grafikdesign-katalog': ['assets/images/project-stack/thumb-lime.webp'],
  };

  private readonly visualAssetSizeMap: Readonly<Record<string, VisualAssetSize>> = {                                               // Native Assetgrößen für dynamische Bildquellen.
    'assets/images/project-stack/eyeball-green.webp': { width: 240, height: 366 },
    'assets/images/project-stack/eyball-green-hurt.webp': { width: 847, height: 1250 },
    'assets/images/project-stack/bomb.webp': { width: 360, height: 374 },
    'assets/images/project-stack/boom.webp': { width: 1201, height: 1055 },
    'assets/images/project-stack/trash-red.webp': { width: 360, height: 486 },
    'assets/images/project-stack/paper-crumpled-pink.webp': { width: 240, height: 239 },
    'assets/images/project-stack/thumb-lime.webp': { width: 220, height: 275 },
    'assets/images/project-stack/planet-saved.webp': { width: 1112, height: 1161 },
    'assets/images/project-stack/egle1-idle.webp': { width: 1195, height: 422 },
    'assets/images/project-stack/egle1-satisfied.webp': { width: 1197, height: 590 },
    'assets/images/project-stack/egle2-idle.webp': { width: 1186, height: 517 },
    'assets/images/project-stack/egle2-satisfied.webp': { width: 1192, height: 591 },
  };

  /** Misst nach dem Rendern den linken Viewport-Abstand für die externe Blutanalyse-Bühne. */
  ngAfterViewInit(): void {
    this.updateBloodLeftOffsetLater();
  }

  /** Räumt laufende Timer beim Entfernen der Komponente auf. */
  ngOnDestroy(): void {
    this.clearEyeTimer();
    this.clearBombTimers();
    this.clearBloodTimers();
  }

  /** Liefert das primäre Asset der Projektvorschau. */
  primaryAssetSrc(): string | null {
    if (this.hideAssets) {
      return null;
    }

    if (this.isIntranetProject() && this.eyeHurt()) {
      return 'assets/images/project-stack/eyball-green-hurt.webp';
    }

    return this.visualAssetMap[this.project.slug]?.[0] ?? null;
  }

  /** Liefert das sekundäre Asset der Projektvorschau. */
  secondaryAssetSrc(): string | null {
    if (this.hideAssets || this.isBloodAnalysisProject()) {
      return null;
    }

    if (!this.isIntranetProject()) {
      return this.visualAssetMap[this.project.slug]?.[1] ?? null;
    }

    if (this.bombState() === 'gone') {
      return null;
    }

    if (this.bombState() === 'boom') {
      return 'assets/images/project-stack/boom.webp';
    }

    return this.visualAssetMap[this.project.slug]?.[1] ?? null;
  }

  /** Gibt an, ob die Preview interaktive Assets enthält. */
  hasInteractiveAssets(): boolean {
    return this.isIntranetProject() || this.isBloodAnalysisProject();
  }

  /** Liefert das Status-Asset für die Carly-Preview. */
  taskStatusSrc(): string | null {
    return this.taskStatusSaved ? 'assets/images/project-stack/planet-saved.webp' : null;
  }

  /** Gibt an, ob das Auge geklickt werden darf. */
  isEyeInteractive(): boolean {
    return this.isIntranetProject();
  }

  /** Gibt an, ob das Auge im Hurt-State steht. */
  isEyeHurt(): boolean {
    return this.eyeHurt();
  }

  /** Gibt an, ob die Träne sichtbar ist. */
  isEyeTearVisible(): boolean {
    return this.eyeTearVisible();
  }

  /** Gibt an, ob die Bombe als Button gerendert wird. */
  isBombInteractive(): boolean {
    return this.isIntranetProject() && this.bombState() !== 'gone';
  }

  /** Gibt an, ob die Bombe noch ausgelöst werden kann. */
  isBombIdle(): boolean {
    return this.bombState() === 'idle';
  }

  /** Gibt an, ob der Bomben-Countdown läuft. */
  isBombCharging(): boolean {
    return this.bombState() === 'charging';
  }

  /** Gibt an, ob die Boom-Grafik sichtbar ist. */
  isBombBoom(): boolean {
    return this.bombState() === 'boom';
  }

  /** Gibt an, ob die Ökosystem-Simulation gerendert wird. */
  isFootprintProject(): boolean {
    return this.project.slug === 'dein-fussabdruck';
  }

  /** Gibt an, ob die Blutanalyse-Variante gerendert wird. */
  isBloodAnalysisProject(): boolean {
    return this.project.slug === 'blutanalyse';
  }

  /** Liefert den linken Viewport-Abstand als CSS-Wert. */
  bloodLeftOffsetStyle(): string {
    return `${this.bloodLeftOffset()}px`;
  }

  /** Aktualisiert den linken Viewport-Abstand bei Größenänderungen. */
  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateBloodLeftOffsetLater();
  }

  /** Gibt an, ob der Start-Sticker deaktiviert sein muss. */
  isBloodButtonDisabled(): boolean {
    return this.bloodState() === 'running';
  }

  /** Gibt an, ob der Erfolgssticker sichtbar ist. */
  bloodSuccessVisible(): boolean {
    return this.bloodState() === 'complete';
  }

  /** Gibt an, ob aktuell die Analyse läuft. */
  isBloodRunning(): boolean {
    return this.bloodState() === 'running';
  }

  /** Gibt an, ob die Analyse abgeschlossen ist. */
  isBloodComplete(): boolean {
    return this.bloodState() === 'complete';
  }

  /** Gibt an, ob der Arm bereits sichtbar ist. */
  isBloodArmVisible(): boolean {
    return this.bloodArmVisible();
  }

  /** Gibt an, ob die Blutegel sichtbar sind. */
  isBloodLeechesVisible(): boolean {
    return this.bloodLeechesVisible();
  }

  /** Gibt an, ob die Blutegel in den Saugzustand gewechselt haben. */
  isBloodLeechesSatisfied(): boolean {
    return this.bloodLeechesSatisfied();
  }

  /** Gibt an, ob die Analysebox sichtbar ist. */
  isBloodAnalysisVisible(): boolean {
    return this.bloodAnalysisVisible();
  }

  /** Liefert das Asset für den ersten Blutegel. */
  bloodLeechOneSrc(): string {
    return this.bloodLeechesSatisfied() ? 'assets/images/project-stack/egle1-satisfied.webp' : 'assets/images/project-stack/egle1-idle.webp';
  }

  /** Liefert das Asset für den zweiten Blutegel. */
  bloodLeechTwoSrc(): string {
    return this.bloodLeechesSatisfied() ? 'assets/images/project-stack/egle2-satisfied.webp' : 'assets/images/project-stack/egle2-idle.webp';
  }

  /** Liefert die native Breite einer dynamischen Assetquelle. */
  assetWidth(src: string): number {
    return this.visualAssetSizeMap[src]?.width ?? 1;
  }

  /** Liefert die native Höhe einer dynamischen Assetquelle. */
  assetHeight(src: string): number {
    return this.visualAssetSizeMap[src]?.height ?? 1;
  }

  /** Gibt die Liste der Fortschrittsschritte zurück. */
  bloodStatusSteps(): readonly string[] {
    return this.bloodStatuses;
  }

  /** Liefert den aktuell hervorgehobenen Fortschrittsschritt. */
  bloodCurrentStatus(): string {
    return this.bloodStatuses[this.bloodStatusIndex()] ?? this.bloodStatuses[0];
  }

  /** Gibt an, ob ein Statusschritt bereits aktiv ist. */
  bloodStatusIsActive(index: number): boolean {
    return this.bloodStatusIndex() >= index;
  }

  /** Aktiviert kurz das verletzte Auge und lässt die Träne laufen. */
  triggerEyeReaction(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isIntranetProject()) {
      return;
    }

    this.achievementService.unlock('eye-poke');
    this.clearEyeTimer();
    this.eyeHurt.set(true);
    this.eyeTearVisible.set(true);
    this.eyeResetTimer = setTimeout(/** Aktiviert kurz das verletzte Auge und lässt die Träne laufen. */() => this.resetEyeReaction(), this.eyeResetDelayMs);
  }

  /** Startet den Bomben-Countdown und entfernt die Bombe nach der Explosion. */
  triggerBombReaction(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isIntranetProject() || this.bombState() !== 'idle') {
      return;
    }

    this.clearBombTimers();
    this.bombState.set('charging');
    this.bombChargeTimer = setTimeout(/** Startet den Bomben-Countdown und entfernt die Bombe nach der Explosion. */() => this.showBoomReaction(), this.bombChargeDelayMs);
  }

  /** Startet die Blutanalyse-Sequenz für Projekt 4. */
  triggerBloodAnalysis(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isBloodAnalysisProject() || this.bloodState() !== 'idle') {
      return;
    }

    this.clearBloodTimers();
    this.bloodState.set('running');
    this.bloodArmVisible.set(true);
    this.bloodStatusIndex.set(0);

    this.scheduleBloodStep(/** Startet die Blutanalyse-Sequenz für Projekt 4. */() => this.bloodLeechesVisible.set(true), 700);

    this.scheduleBloodStep(/** Startet die Blutanalyse-Sequenz für Projekt 4. */() => {
      this.bloodLeechesSatisfied.set(true);
      this.bloodAnalysisVisible.set(true);
      this.bloodStatusIndex.set(0);
    }, 1500);

    this.scheduleBloodStep(/** Startet die Blutanalyse-Sequenz für Projekt 4. */() => this.bloodStatusIndex.set(1), 2100);
    this.scheduleBloodStep(/** Startet die Blutanalyse-Sequenz für Projekt 4. */() => this.bloodStatusIndex.set(2), 2850);
    this.scheduleBloodStep(/** Startet die Blutanalyse-Sequenz für Projekt 4. */() => this.bloodStatusIndex.set(3), 3600);
    this.scheduleBloodStep(/** Startet die Blutanalyse-Sequenz für Projekt 4. */() => {
      this.bloodState.set('complete');
      this.achievementService.unlock('blood-complete');
    }, 4600);
  }

  /** Gibt an, ob aktuell das Intranet-Projekt gerendert wird. */
  private isIntranetProject(): boolean {
    return this.project.slug === 'intranet';
  }

  /** Plant einen einzelnen Schritt der Blutanalyse. */
  private scheduleBloodStep(action: () => void, delayMs: number): void {

    const timer = setTimeout(/** Plant einen einzelnen Schritt der Blutanalyse. */() => action(), delayMs); // Kennung eines ausstehenden Animations-Timers.

    this.bloodTimers.push(timer);
  }

  /** Plant die Offset-Messung nach dem nächsten Layout-Pass. */
  private updateBloodLeftOffsetLater(): void {
    requestAnimationFrame(/** Plant die Offset-Messung nach dem nächsten Layout-Pass. */() => this.updateBloodLeftOffset());
  }

  /** Misst die horizontale Position der Bühne relativ zum Viewport. */
  private updateBloodLeftOffset(): void {
    if (!this.visualShell || !this.isBloodAnalysisProject()) {
      return;
    }

    this.bloodLeftOffset.set(Math.max(0, Math.round(this.visualShell.nativeElement.getBoundingClientRect().left)));
  }

  /** Setzt Auge und Träne zurück. */
  private resetEyeReaction(): void {
    this.eyeHurt.set(false);
    this.eyeTearVisible.set(false);
    this.eyeResetTimer = null;
  }

  /** Wechselt von blinkender Bombe zur Boom-Grafik. */
  private showBoomReaction(): void {
    this.achievementService.unlock('bomb-defused');
    this.bombState.set('boom');
    this.bombChargeTimer = null;
    this.bombRemoveTimer = setTimeout(/** Wechselt von blinkender Bombe zur Boom-Grafik. */() => this.removeBombReaction(), this.boomRemoveDelayMs);
  }

  /** Entfernt die Bombe nach der Explosion aus der Preview. */
  private removeBombReaction(): void {
    this.bombState.set('gone');
    this.bombRemoveTimer = null;
  }

  /** Stoppt den Auge-Reset-Timer. */
  private clearEyeTimer(): void {
    if (!this.eyeResetTimer) {
      return;
    }

    clearTimeout(this.eyeResetTimer);
    this.eyeResetTimer = null;
  }

  /** Stoppt alle Bomben-Timer. */
  private clearBombTimers(): void {
    if (this.bombChargeTimer) {
      clearTimeout(this.bombChargeTimer);
      this.bombChargeTimer = null;
    }

    if (this.bombRemoveTimer) {
      clearTimeout(this.bombRemoveTimer);
      this.bombRemoveTimer = null;
    }
  }

  /** Stoppt alle Timer der Blutanalyse. */
  private clearBloodTimers(): void {
    while (this.bloodTimers.length > 0) {
      clearTimeout(this.bloodTimers.pop()!);
    }
  }
}
