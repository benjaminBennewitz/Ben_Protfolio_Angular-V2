/* src/app/layout/loader/loader.component.ts */

/**
 * @file Start-Loader des Portfolios.
 * @description Zeigt eine stoppende MS-DOS-Bootsequenz mit manueller Freigabe oder eine ruhige Alternative für Neuro-/Calm-Mode.
 */

import { DOCUMENT } from '@angular/common';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';
import { AccessibilityPreferenceService } from '../../core/services/accessibility-preference.service';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';

/** Einzelnes DOS-Dialogfenster innerhalb der Bootsequenz. */
interface LoaderDialog {
  /** Prozentwert der simulierten Ladephase. */
  readonly percent: number;

  /** Fenstertitel im Retro-Systemstil. */
  readonly title: string;

  /** Absurde Statusmeldung für die aktuelle Ladephase. */
  readonly message: string;

  /** Beschriftung des simulierten Dialog-Buttons. */
  readonly action: string;

  /** CSS-Delay für das zeitversetzte Öffnen. */
  readonly delay: string;

  /** Horizontale Position des Dialogs. */
  readonly left: string;

  /** Vertikale Position des Dialogs. */
  readonly top: string;

  /** Leichte Rotation für den überlagerten Poster-Look. */
  readonly rotate: string;

  /** Stapelreihenfolge des Dialogs. */
  readonly z: number;
}

/** Übersetzte Inhalte des Loaders. */
interface LoaderTranslation {
  /** Zugängliche Beschriftung der Loader-Section. */
  readonly ariaLabel: string;

  /** Befehl im unteren Terminalbereich. */
  readonly terminalTitle: string;

  /** Statusmeldung nach 100 Prozent. */
  readonly readyText: string;

  /** Kurzer Statuszusatz hinter der Prozentzahl. */
  readonly loadedLabel: string;

  /** Zugänglicher Statuszusatz für die Dialogfenster. */
  readonly loadedAriaLabel: string;

  /** Alternativtext des Start-Assets im finalen Button. */
  readonly launchImageAlt: string;

  /** Beschriftung des finalen Freigabe-Buttons. */
  readonly buttonLabel: string;

  /** Zugängliche Beschriftung des finalen Freigabe-Buttons. */
  readonly openLabel: string;

  /** Eyebrow des ruhigen Loaders. */
  readonly calmEyebrow: string;

  /** Titel des ruhigen Loaders. */
  readonly calmTitle: string;

  /** Zusatztext des ruhigen Loaders. */
  readonly calmText: string;

  /** Einzelne Boot-Dialogfenster. */
  readonly dialogs: readonly LoaderDialog[];

  /** Laufende Konsolenmeldungen. */
  readonly logLines: readonly string[];
}

/** Animierter Intro-Loader mit manueller Freigabe nach Abschluss der Bootsequenz. */
@Component({
  selector: 'bp-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent implements OnInit, OnDestroy {
  /** Dokumentreferenz für den globalen Loader-Zustand. */
  private readonly document = inject(DOCUMENT);

  /** Sprachservice für automatische Browser- und Systemsprachen. */
  private readonly languageService = inject(LanguageService);

  /** Accessibility-Service für den Calm-/Neuro-Loader. */
  private readonly accessibility = inject(AccessibilityPreferenceService);

  /** Achievement-Service für die versteckte Trophäe nach Loader-Freigabe. */
  private readonly achievementService = inject(AchievementService);

  /** CSS-Klasse, die Hero-Reveals bis zum Loader-Ende sperrt. */
  private readonly loaderActiveClass = 'bp-loader-active';

  /** Sichtbarkeit des Loaders. */
  readonly visible = signal<boolean>(true);

  /** Aktiviert die Ausblendanimation nach der manuellen Freigabe. */
  readonly leaving = signal<boolean>(false);

  /** Markiert, dass die simulierte Bootsequenz bei 100 Prozent pausiert. */
  readonly completed = signal<boolean>(false);

  /** Markiert den kurzen Asset-Start nach Klick auf den Freigabe-Button. */
  readonly launching = signal<boolean>(false);

  /** Fortschritt des vereinfachten Calm-Loaders. */
  readonly calmProgress = signal<number>(0);

  /** Übersetzte Loader-Inhalte der aktuellen Sprache. */
  readonly loaderContent = computed<LoaderTranslation>(() => LOADER_TRANSLATIONS[this.languageService.language()]);

  /** Simulierte Dialogfenster der Bootsequenz. */
  readonly dialogs = computed<readonly LoaderDialog[]>(() => this.loaderContent().dialogs);

  /** Laufende Konsolenmeldungen für den unteren Statusbereich. */
  readonly logLines = computed<readonly string[]>(() => this.loaderContent().logLines);

  /** Schaltet bei reduzierter Bewegung oder Simple-Mode auf einen ruhigeren Loader um. */
  readonly useCalmLoader = computed<boolean>(() => this.accessibility.usesSimpleMode() || this.accessibility.motionMode() !== 'full');

  /** Segmentanzahl der simulierten Ladeleiste. */
  readonly progressCells = Array.from({ length: 26 }, (_, index) => index);

  /** Mindestzeit bis zur manuellen Freigabe bei 100 Prozent. */
  private readonly sequenceDurationMs = 7300;

  /** Kürzere Sequenz des ruhigen Accessibility-Loaders. */
  private readonly calmSequenceDurationMs = 3200;

  /** Dauer der Ausblendanimation. */
  private readonly exitDurationMs = 560;

  /** Wartezeit nach dem Asset-Einflug bis zum Öffnen der Startseite. */
  private readonly launchDelayMs = 2000;

  /** Timer für den Abschluss der Bootsequenz. */
  private completionTimer?: number;

  /** Timer für den verzögerten Start nach dem Asset-Einflug. */
  private launchTimer?: number;

  /** Timer für das Entfernen des Loaders aus dem DOM. */
  private removeTimer?: number;

  /** Intervall des ruhigen Fortschrittszählers. */
  private calmProgressTimer?: number;

  /** Setzt den globalen Loader-Zustand, bevor die Startseite ihre Reveal-Animationen starten kann. */
  constructor() {
    this.document.documentElement.classList.add(this.loaderActiveClass);
  }

  /** Startet die passende Loader-Variante. */
  ngOnInit(): void {
    if (this.useCalmLoader()) {
      this.startCalmLoader();
      return;
    }

    this.completionTimer = window.setTimeout(() => this.completed.set(true), this.sequenceDurationMs);
  }

  /** Startet den Asset-Einflug und blendet den Loader danach verzögert aus. */
  dismiss(): void {
    if (!this.completed() || this.launching() || this.leaving()) {
      return;
    }

    this.achievementService.unlock('loader-human');
    this.launching.set(true);
    this.launchTimer = window.setTimeout(() => {
      this.leaving.set(true);
      this.removeTimer = window.setTimeout(() => this.finishExit(), this.exitDurationMs);
    }, this.launchDelayMs);
  }


  /** Entfernt den Loader und gibt die Hero-Animationen frei. */
  private finishExit(): void {
    this.document.documentElement.classList.remove(this.loaderActiveClass);
    this.visible.set(false);
  }

  /** Startet einen ruhigen Loader mit Zahlen-Progress und automatischem Exit. */
  private startCalmLoader(): void {
    window.clearTimeout(this.completionTimer);
    window.clearInterval(this.calmProgressTimer);

    const startedAt = performance.now();
    const stepMs = 48;

    const updateProgress = (): void => {
      const elapsed = performance.now() - startedAt;
      const progress = Math.min(100, Math.round(elapsed / this.calmSequenceDurationMs * 100));

      this.calmProgress.set(progress);

      if (progress < 100) {
        return;
      }

      window.clearInterval(this.calmProgressTimer);
      this.calmProgressTimer = undefined;
      this.completed.set(true);
      this.leaving.set(true);
      this.removeTimer = window.setTimeout(() => this.finishExit(), 220);
    };

    updateProgress();
    this.calmProgressTimer = window.setInterval(updateProgress, stepMs);
  }

  /** Räumt offene Timer beim Zerstören der Komponente auf. */
  ngOnDestroy(): void {
    window.clearTimeout(this.completionTimer);
    window.clearTimeout(this.launchTimer);
    window.clearTimeout(this.removeTimer);
    window.clearInterval(this.calmProgressTimer);
    this.document.documentElement.classList.remove(this.loaderActiveClass);
  }
}

/** Übersetzungen der Start-Bootsequenz. */
const LOADER_TRANSLATIONS: Record<'de' | 'en', LoaderTranslation> = {
  de: {
    ariaLabel: 'Portfolio wird geladen',
    terminalTitle: 'C:\\B2\\portfolio> run experience.exe',
    readyText: '100 % erreicht. System wartet auf ein menschliches Wunder.',
    loadedLabel: 'geladen',
    loadedAriaLabel: 'Prozent geladen',
    launchImageAlt: 'Halftone-Portrait von B²',
    buttonLabel: 'was coooooles',
    openLabel: 'Portfolio öffnen',
    calmEyebrow: 'barrierearmer Modus',
    calmTitle: 'ruhiger start',
    calmText: 'Animationen werden reduziert. Das Portfolio wird gerade in einer ruhigeren Variante vorbereitet.',
    dialogs: [
      { percent: 1, title: 'BOOT_B2.EXE', message: 'Gleich soweit. Interface sucht noch den Einschaltknopf.', action: 'OK?', delay: '120ms', left: '7vw', top: '15vh', rotate: '-1.6deg', z: 1 },
      { percent: 2, title: 'WOW_SYS.DLL', message: 'Rasterpunkte werden einzeln freundlich begrüßt.', action: '#LOL', delay: '620ms', left: '20vw', top: '24vh', rotate: '1.2deg', z: 2 },
      { percent: 10, title: 'HALFTONE.INI', message: 'Schwarzweiß-Grafiken werden dramatisch überzeichnet.', action: 'YES', delay: '1160ms', left: '48vw', top: '13vh', rotate: '-0.8deg', z: 3 },
      { percent: 21, title: 'CURSOR.BAT', message: 'Mauszeiger bekommt Haltung und ein bisschen Attitüde.', action: 'MOVE', delay: '1740ms', left: '13vw', top: '48vh', rotate: '1.8deg', z: 4 },
      { percent: 35, title: 'CORETEMP.EXE', message: 'Kerntemperatur liegt im idealen Bereich. Kaffee auch.', action: 'NICE', delay: '2380ms', left: '38vw', top: '38vh', rotate: '-1.2deg', z: 5 },
      { percent: 52, title: 'CHAOS.SYS', message: 'Kontrolliertes Chaos wird umsortiert.', action: 'F*CK', delay: '3040ms', left: '59vw', top: '49vh', rotate: '1.4deg', z: 6 },
      { percent: 68, title: 'DOS_UI.POP', message: 'Dialogfenster streiten kurz um den Vordergrund.', action: 'WIN', delay: '3740ms', left: '26vw', top: '62vh', rotate: '-1.9deg', z: 7 },
      { percent: 84, title: 'ACCESS.OK', message: 'Terminalzugang riecht nach Popcorn', action: 'OK', delay: '4480ms', left: '55vw', top: '68vh', rotate: '0.9deg', z: 8 },
      { percent: 100, title: 'FINAL_MSG.WTF', message: '', action: 'Sag was Cooles. Sonst bleibt das Interface beleidigt stehen.', delay: '5480ms', left: '34vw', top: '26vh', rotate: '0.2deg', z: 9 },
    ],
    logLines: [
      '[sys] ms-dos collage layer mounted',
      '[ux] reveal masks armed',
      '[art] absurdity budget approved',
      '[ok] B² interface waiting for human input',
    ],
  },
  en: {
    ariaLabel: 'Portfolio is loading',
    terminalTitle: 'C:\\B2\\portfolio> run experience.exe',
    readyText: '100 % reached. System is waiting for a human miracle.',
    loadedLabel: 'loaded',
    loadedAriaLabel: 'percent loaded',
    launchImageAlt: 'Halftone portrait of B²',
    buttonLabel: 'something coooool',
    openLabel: 'Open portfolio',
    calmEyebrow: 'barrierearmer Modus',
    calmTitle: 'calm startup',
    calmText: 'Animations are reduced. The portfolio is being prepared in a quieter mode.',
    dialogs: [
      { percent: 1, title: 'BOOT_B2.EXE', message: 'Almost there. Interface is still looking for the power button.', action: 'OK?', delay: '120ms', left: '7vw', top: '15vh', rotate: '-1.6deg', z: 1 },
      { percent: 2, title: 'WOW_SYS.DLL', message: 'Halftone dots are being greeted one by one.', action: '#LOL', delay: '620ms', left: '20vw', top: '24vh', rotate: '1.2deg', z: 2 },
      { percent: 10, title: 'HALFTONE.INI', message: 'Black-and-white graphics are being dramatically overdrawn.', action: 'YES', delay: '1160ms', left: '48vw', top: '13vh', rotate: '-0.8deg', z: 3 },
      { percent: 21, title: 'CURSOR.BAT', message: 'Cursor gets posture and a bit of attitude.', action: 'MOVE', delay: '1740ms', left: '13vw', top: '48vh', rotate: '1.8deg', z: 4 },
      { percent: 35, title: 'CORETEMP.EXE', message: 'Core temperature looks ideal. Coffee too.', action: 'NICE', delay: '2380ms', left: '38vw', top: '38vh', rotate: '-1.2deg', z: 5 },
      { percent: 52, title: 'CHAOS.SYS', message: 'Controlled chaos is being sorted again.', action: 'F*CK', delay: '3040ms', left: '59vw', top: '49vh', rotate: '1.4deg', z: 6 },
      { percent: 68, title: 'DOS_UI.POP', message: 'Dialog windows briefly argue about z-index.', action: 'WIN', delay: '3740ms', left: '26vw', top: '62vh', rotate: '-1.9deg', z: 7 },
      { percent: 84, title: 'ACCESS.OK', message: 'Terminal access smells like popcorn.', action: 'OK', delay: '4480ms', left: '55vw', top: '68vh', rotate: '0.9deg', z: 8 },
      { percent: 100, title: 'FINAL_MSG.WTF', message: '', action: 'Say something cool or the interface stays offended.', delay: '5480ms', left: '34vw', top: '26vh', rotate: '0.2deg', z: 9 },
    ],
    logLines: [
      '[sys] ms-dos collage layer mounted',
      '[ux] reveal masks armed',
      '[art] absurdity budget approved',
      '[ok] B² interface waiting for human input',
    ],
  },
};
