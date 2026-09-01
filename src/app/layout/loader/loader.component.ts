/* src/app/layout/loader/loader.component.ts */

/**
 * @file Start-Bootsequenz des Portfolios.
 * @description Spielt die B²-Boot-Experience einmal pro Browser-Tab und respektiert reduzierte Motion-Präferenzen.
 */

import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, output, signal } from '@angular/core';

/** Phasen der vollständigen Bootsequenz. */
type LoaderPhase = 'boot' | 'storm' | 'ready';

/** Unterstützte Sprache der kompakten Loader-Texte. */
type LoaderLanguage = 'de' | 'en';

/** Einzelnes DOS-Dialogfenster der Entschlüsselungsphase. */
interface LoaderDialog {
  readonly percent: number;
  readonly title: string;
  readonly message: string;
  readonly action: string;
  readonly left: string;
  readonly top: string;
  readonly rotate: string;
  readonly z: number;
}

/** Diagonaler Farbschnitt der Storm- und Ready-Bühne. */
interface LoaderSlice {
  readonly left: string;
  readonly width: string;
  readonly fill: string;
  readonly delay: string;
}

/** Übersetzte Inhalte der Bootsequenz. */
interface LoaderTranslation {
  readonly ariaLabel: string;
  readonly bootLabel: string;
  readonly skipLabel: string;
  readonly typeLine: string;
  readonly terminalTitle: string;
  readonly decryptedLabel: string;
  readonly readyTop: string;
  readonly readyAccent: string;
  readonly readyText: string;
  readonly buttonLabel: string;
  readonly openLabel: string;
  readonly launchImageAlt: string;
  readonly calmEyebrow: string;
  readonly calmTitle: string;
  readonly calmText: string;
  readonly dialogs: readonly LoaderDialog[];
}

/** Runtime-Fallback für Umgebungen ohne verfügbaren SessionStorage. */
let loaderStartedInCurrentRuntime = false;

/** Animierte B²-Bootsequenz mit ruhiger Accessibility-Alternative. */
@Component({
  selector: 'bp-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent implements OnInit, OnDestroy {
  /** Browser-Dokument für SessionStorage und globale Loader-Klassen. */
  private readonly document = inject(DOCUMENT);

  /** CSS-Klasse, die Hero-Reveals bis zum Ende der Sequenz sperrt. */
  private readonly loaderActiveClass = 'bp-loader-active';

  /** Session-Key gegen erneutes Abspielen bei interner Navigation. */
  private readonly sessionStorageKey = 'bp.boot-sequence.played.v2';

  /** Fordert das Nachladen der nicht kritischen App-Shell an. */
  readonly shellRequested = output<void>();

  /** Meldet die manuelle Bestätigung über den regulären Loader-Button. */
  readonly humanConfirmed = output<void>();

  /** Sichtbarkeit des Loaders. */
  readonly visible = signal(false);

  /** Aktuelle visuelle Phase. */
  readonly phase = signal<LoaderPhase>('boot');

  /** Aktuell ausgeschriebener Typewriter-Text. */
  readonly typed = signal('');

  /** Anzahl bereits geöffneter Storm-Dialoge. */
  readonly openDialogCount = signal(0);

  /** Aktiviert den finalen Kopf-Einflug. */
  readonly launching = signal(false);

  /** Aktiviert die abschließende Loader-Ausblendung. */
  readonly leaving = signal(false);

  /** Fortschritt des ruhigen Loaders. */
  readonly calmProgress = signal(0);

  /** Einmalig gelesene Sprache ohne Abhängigkeit vom umfangreichen Portfolio-Content. */
  private readonly loaderLanguage = this.readInitialLanguage();

  /** Sprachabhängiger Loader-Inhalt. */
  readonly loaderContent = computed<LoaderTranslation>(() => LOADER_TRANSLATIONS[this.loaderLanguage]);

  /** Schaltet bei gespeicherten oder systemseitigen Motion-Präferenzen auf die ruhige Variante. */
  readonly useCalmLoader = signal(this.readCalmPreference());

  /** Sichtbare Dialoge der aktuellen Storm-Phase. */
  readonly openDialogs = computed(() => this.loaderContent().dialogs.slice(0, this.openDialogCount()));

  /** Simulierter Fortschritt der aktuellen Sequenz. */
  readonly percent = computed(() => {
    if (this.useCalmLoader()) {
      return this.calmProgress();
    }

    if (this.phase() === 'boot') {
      const lineLength = Math.max(1, this.loaderContent().typeLine.length);
      return Math.min(8, Math.round((this.typed().length / lineLength) * 8));
    }

    if (this.phase() === 'storm') {
      const dialogIndex = Math.max(0, this.openDialogCount() - 1);
      return this.loaderContent().dialogs[dialogIndex]?.percent ?? 4;
    }

    return 100;
  });

  /** Segmentzustand der unteren Fortschrittsleiste. */
  readonly progressCells = computed(() => {
    const filled = Math.round((this.percent() / 100) * 26);
    return Array.from({ length: 26 }, (_, index) => index < filled);
  });

  /** Diagonale Schnitte der Storm-Phase. */
  readonly stormSlices: readonly LoaderSlice[] = [
    { left: '4%', width: '10%', fill: '#b8ff2e', delay: '0ms' },
    { left: '30%', width: '4%', fill: '#ff2e88', delay: '80ms' },
    { left: '72%', width: '13%', fill: '#9d2eff', delay: '150ms' },
    { left: '92%', width: '5%', fill: '#b8ff2e', delay: '220ms' },
  ];

  /** Erkennt die kompakte mobile Loader-Variante für eine schnellere First-Visit-Experience. */
  private readonly compactSequence = this.document.defaultView?.matchMedia('(max-width: 760px)').matches ?? false;

  /** Dauer bis zum Wechsel von Typewriter zur Dialogphase. */
  private readonly bootDurationMs = this.compactSequence ? 420 : 1900;

  /** Abstand zwischen zwei Dialogfenstern. */
  private readonly dialogIntervalMs = this.compactSequence ? 105 : 620;

  /** Pause nach dem letzten Dialog vor der Freigabe. */
  private readonly readyDelayMs = this.compactSequence ? 70 : 900;

  /** Mindestdauer der ruhigen Alternative. */
  private readonly calmSequenceDurationMs = 3200;

  /** Dauer des finalen Kopf-Einflugs. */
  private readonly launchDurationMs = 1450;

  /** Dauer der Loader-Ausblendung. */
  private readonly exitDurationMs = 560;

  /** Typewriter-Intervall. */
  private typeTimer?: number;

  /** Timer für den Wechsel zur Storm-Phase. */
  private bootTimer?: number;

  /** Intervall für die DOS-Dialoge. */
  private stormTimer?: number;

  /** Timer für den Wechsel zur Ready-Phase. */
  private readyTimer?: number;

  /** Timer des Kopf-Einflugs. */
  private launchTimer?: number;

  /** Timer zum Entfernen des Loaders. */
  private removeTimer?: number;

  /** Fortschrittsintervall der ruhigen Variante. */
  private calmProgressTimer?: number;

  /** Startet die passende Loader-Variante genau einmal pro Browser-Tab. */
  ngOnInit(): void {
    if (this.hasBootSequencePlayed()) {
      this.document.documentElement.classList.remove(this.loaderActiveClass);
      this.shellRequested.emit();
      return;
    }

    this.markBootSequenceAsPlayed();
    this.visible.set(true);
    this.document.documentElement.classList.add(this.loaderActiveClass);

    if (this.useCalmLoader()) {
      this.startCalmLoader();
      return;
    }

    this.startFullBoot();
  }

  /** Startet Typewriter und Phasenkette der vollständigen Experience. */
  private startFullBoot(): void {
    this.clearSequenceTimers();
    this.phase.set('boot');
    this.typed.set('');
    this.openDialogCount.set(0);

    const line = this.loaderContent().typeLine;
    const typeStepMs = this.compactSequence
      ? Math.max(16, Math.floor((this.bootDurationMs - 80) / Math.max(1, line.length)))
      : 55;
    let index = 0;

    this.typeTimer = window.setInterval(() => {
      index += 1;
      this.typed.set(line.slice(0, index));

      if (index >= line.length) {
        window.clearInterval(this.typeTimer);
        this.typeTimer = undefined;
      }
    }, typeStepMs);

    this.bootTimer = window.setTimeout(() => this.startStorm(), this.bootDurationMs);
  }

  /** Öffnet die DOS-Fenster nacheinander und wechselt danach in den Ready-Zustand. */
  private startStorm(): void {
    this.phase.set('storm');
    this.openDialogCount.set(0);

    this.stormTimer = window.setInterval(() => {
      const nextCount = Math.min(this.loaderContent().dialogs.length, this.openDialogCount() + 1);
      this.openDialogCount.set(nextCount);

      if (nextCount < this.loaderContent().dialogs.length) {
        return;
      }

      window.clearInterval(this.stormTimer);
      this.stormTimer = undefined;
      this.readyTimer = window.setTimeout(() => this.phase.set('ready'), this.readyDelayMs);
    }, this.dialogIntervalMs);
  }

  /** Überspringt die restliche Sequenz und startet direkt den finalen Kopf-Einflug. */
  skip(): void {
    if (this.useCalmLoader() || this.launching() || this.leaving()) {
      return;
    }

    this.beginLaunch();
  }

  /** Startet den Kopf-Einflug und gibt danach die eigentliche Website frei. */
  dismiss(): void {
    if (this.phase() !== 'ready' || this.launching() || this.leaving()) {
      return;
    }

    this.humanConfirmed.emit();
    this.beginLaunch();
  }

  /** Führt den gemeinsamen finalen Launchpfad aus. */
  private beginLaunch(): void {
    this.clearSequenceTimers();
    this.phase.set('ready');
    this.openDialogCount.set(this.loaderContent().dialogs.length);
    this.launching.set(true);
    this.shellRequested.emit();

    this.launchTimer = window.setTimeout(() => {
      this.leaving.set(true);
      this.removeTimer = window.setTimeout(() => this.finishExit(), this.exitDurationMs);
    }, this.launchDurationMs);
  }

  /** Startet die ruhige 3,2-Sekunden-Alternative mit automatischer Freigabe. */
  private startCalmLoader(): void {
    const startedAt = performance.now();
    const stepMs = 48;

    const updateProgress = (): void => {
      const elapsed = performance.now() - startedAt;
      const progress = Math.min(100, Math.round((elapsed / this.calmSequenceDurationMs) * 100));
      this.calmProgress.set(progress);

      if (progress < 100) {
        return;
      }

      window.clearInterval(this.calmProgressTimer);
      this.calmProgressTimer = undefined;
      this.shellRequested.emit();
      this.leaving.set(true);
      this.removeTimer = window.setTimeout(() => this.finishExit(), 220);
    };

    updateProgress();
    this.calmProgressTimer = window.setInterval(updateProgress, stepMs);
  }


  /** Liest die Loader-Sprache direkt aus der bestehenden Persistenz, ohne den Content-Service zu initialisieren. */
  private readInitialLanguage(): LoaderLanguage {
    try {
      const savedLanguage = this.document.defaultView?.localStorage.getItem('bp-language');

      if (savedLanguage === 'de' || savedLanguage === 'en') {
        return savedLanguage;
      }
    } catch {
      return this.document.documentElement.lang === 'en' ? 'en' : 'de';
    }

    return this.document.documentElement.lang === 'en' ? 'en' : 'de';
  }

  /** Liest nur die für den Loader relevanten Accessibility-Werte aus der bestehenden Persistenz. */
  private readCalmPreference(): boolean {
    const prefersReducedMotion = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;

    try {
      const storedValue = this.document.defaultView?.localStorage.getItem('bp-accessibility-preferences-v1');

      if (!storedValue) {
        return prefersReducedMotion;
      }

      const preferences = JSON.parse(storedValue) as { motion?: unknown; comfort?: unknown };
      const motion = preferences.motion === 'full' || preferences.motion === 'reduced' || preferences.motion === 'off'
        ? preferences.motion
        : prefersReducedMotion ? 'reduced' : 'full';
      const comfort = preferences.comfort === 'simple' || preferences.comfort === 'expressive'
        ? preferences.comfort
        : 'expressive';

      return comfort === 'simple' || motion !== 'full';
    } catch {
      return prefersReducedMotion;
    }
  }

  /** Prüft Session- und Runtime-Zustand gegen mehrfaches Abspielen. */
  private hasBootSequencePlayed(): boolean {
    if (loaderStartedInCurrentRuntime) {
      return true;
    }

    try {
      return this.document.defaultView?.sessionStorage.getItem(this.sessionStorageKey) === '1';
    } catch {
      return false;
    }
  }

  /** Markiert die Bootsequenz sofort beim Start als abgespielt. */
  private markBootSequenceAsPlayed(): void {
    loaderStartedInCurrentRuntime = true;

    try {
      this.document.defaultView?.sessionStorage.setItem(this.sessionStorageKey, '1');
    } catch {
      loaderStartedInCurrentRuntime = true;
    }
  }

  /** Entfernt den Loader und gibt Hero-Reveals wieder frei. */
  private finishExit(): void {
    this.document.documentElement.classList.remove(this.loaderActiveClass);
    this.visible.set(false);
  }

  /** Stoppt ausschließlich Timer der Full-Motion-Sequenz. */
  private clearSequenceTimers(): void {
    window.clearInterval(this.typeTimer);
    window.clearTimeout(this.bootTimer);
    window.clearInterval(this.stormTimer);
    window.clearTimeout(this.readyTimer);
    this.typeTimer = undefined;
    this.bootTimer = undefined;
    this.stormTimer = undefined;
    this.readyTimer = undefined;
  }

  /** Räumt alle Timer und globalen Zustände beim Zerstören auf. */
  ngOnDestroy(): void {
    this.clearSequenceTimers();
    window.clearTimeout(this.launchTimer);
    window.clearTimeout(this.removeTimer);
    window.clearInterval(this.calmProgressTimer);
    this.document.documentElement.classList.remove(this.loaderActiveClass);
  }
}

/** Übersetzungen der B²-Bootsequenz. */
const LOADER_TRANSLATIONS: Record<'de' | 'en', LoaderTranslation> = {
  de: {
    ariaLabel: 'Portfolio wird initialisiert',
    bootLabel: 'boot_sequence',
    skipLabel: 'esc // skip',
    typeLine: 'initialisiere B² interface …',
    terminalTitle: 'C:\\B2\\portfolio> run experience.exe',
    decryptedLabel: 'ENTSCHLÜSSELT',
    readyTop: 'ZUGANG',
    readyAccent: 'FREI',
    readyText: '100% entschlüsselt. Das Interface wartet auf einen menschlichen Impuls.',
    buttonLabel: 'Portfolio betreten',
    openLabel: 'Portfolio betreten',
    launchImageAlt: 'Halftone-Portrait von B²',
    calmEyebrow: 'barrierearmer Modus',
    calmTitle: 'ruhiger start',
    calmText: 'Animationen werden reduziert. Das Portfolio wird in einer ruhigeren Variante vorbereitet.',
    dialogs: [
      { percent: 4, title: 'BOOT_B2.EXE', message: 'Interface sucht noch den Einschaltknopf.', action: 'OK?', left: '6%', top: '17vh', rotate: '-1.6deg', z: 1 },
      { percent: 17, title: 'HALFTONE.INI', message: 'Rasterpunkte werden einzeln begrüßt.', action: '#LOL', left: '22%', top: '31vh', rotate: '1.3deg', z: 2 },
      { percent: 33, title: 'CURSOR.BAT', message: 'Mauszeiger bekommt Haltung.', action: 'MOVE', left: '9%', top: '52vh', rotate: '2deg', z: 3 },
      { percent: 51, title: 'CHAOS.SYS', message: 'Kontrolliertes Chaos wird umsortiert.', action: 'F*CK', left: '44%', top: '22vh', rotate: '-1.1deg', z: 4 },
      { percent: 69, title: 'DOS_UI.POP', message: 'Dialogfenster streiten um den Vordergrund.', action: 'WIN', left: '38%', top: '48vh', rotate: '1.7deg', z: 5 },
      { percent: 88, title: 'ACCESS.OK', message: 'Terminalzugang riecht nach Popcorn.', action: 'OK', left: '60%', top: '35vh', rotate: '-0.8deg', z: 6 },
    ],
  },
  en: {
    ariaLabel: 'Portfolio is being initialized',
    bootLabel: 'boot_sequence',
    skipLabel: 'esc // skip',
    typeLine: 'initializing B² interface …',
    terminalTitle: 'C:\\B2\\portfolio> run experience.exe',
    decryptedLabel: 'DECRYPTED',
    readyTop: 'ACCESS',
    readyAccent: 'GRANTED',
    readyText: '100% decrypted. The interface is waiting for human input.',
    buttonLabel: 'Enter portfolio',
    openLabel: 'Enter portfolio',
    launchImageAlt: 'Halftone portrait of B²',
    calmEyebrow: 'accessible mode',
    calmTitle: 'calm startup',
    calmText: 'Animations are reduced. The portfolio is being prepared in a calmer mode.',
    dialogs: [
      { percent: 4, title: 'BOOT_B2.EXE', message: 'Interface is still looking for the power button.', action: 'OK?', left: '6%', top: '17vh', rotate: '-1.6deg', z: 1 },
      { percent: 17, title: 'HALFTONE.INI', message: 'Halftone dots are being greeted individually.', action: '#LOL', left: '22%', top: '31vh', rotate: '1.3deg', z: 2 },
      { percent: 33, title: 'CURSOR.BAT', message: 'Cursor gets some attitude.', action: 'MOVE', left: '9%', top: '52vh', rotate: '2deg', z: 3 },
      { percent: 51, title: 'CHAOS.SYS', message: 'Controlled chaos is being sorted.', action: 'F*CK', left: '44%', top: '22vh', rotate: '-1.1deg', z: 4 },
      { percent: 69, title: 'DOS_UI.POP', message: 'Dialog windows argue about the foreground.', action: 'WIN', left: '38%', top: '48vh', rotate: '1.7deg', z: 5 },
      { percent: 88, title: 'ACCESS.OK', message: 'Terminal access smells like popcorn.', action: 'OK', left: '60%', top: '35vh', rotate: '-0.8deg', z: 6 },
    ],
  },
};
