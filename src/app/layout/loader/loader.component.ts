/* src/app/layout/loader/loader.component.ts */

/**
 * @file Start-Loader des Portfolios.
 * @description Zeigt eine stoppende MS-DOS-Bootsequenz mit manueller Freigabe nach 100 Prozent.
 */

import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';

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

  /** Simulierte Dialogfenster der Bootsequenz. */
  readonly dialogs: readonly LoaderDialog[] = [
    {
      percent: 1,
      title: 'BOOT_B2.EXE',
      message: 'Gleich soweit. Interface sucht noch den Einschaltknopf.',
      action: 'OK?',
      delay: '120ms',
      left: '7vw',
      top: '15vh',
      rotate: '-1.6deg',
      z: 1,
    },
    {
      percent: 2,
      title: 'WOW_SYS.DLL',
      message: 'Rasterpunkte werden einzeln freundlich begrüßt.',
      action: '#LOL',
      delay: '620ms',
      left: '20vw',
      top: '24vh',
      rotate: '1.2deg',
      z: 2,
    },
    {
      percent: 10,
      title: 'HALFTONE.INI',
      message: 'Schwarzweiß-Grafiken werden dramatisch überzeichnet.',
      action: 'YES',
      delay: '1160ms',
      left: '48vw',
      top: '13vh',
      rotate: '-0.8deg',
      z: 3,
    },
    {
      percent: 21,
      title: 'CURSOR.BAT',
      message: 'Mauszeiger bekommt Haltung und ein bisschen Attitüde.',
      action: 'MOVE',
      delay: '1740ms',
      left: '13vw',
      top: '48vh',
      rotate: '1.8deg',
      z: 4,
    },
    {
      percent: 35,
      title: 'CORETEMP.EXE',
      message: 'Kerntemperatur liegt im idealen Bereich. Kaffee auch.',
      action: 'NICE',
      delay: '2380ms',
      left: '38vw',
      top: '38vh',
      rotate: '-1.2deg',
      z: 5,
    },
    {
      percent: 52,
      title: 'CHAOS.SYS',
      message: 'Kontrolliertes Chaos wird umsortiert.',
      action: 'F*CK',
      delay: '3040ms',
      left: '59vw',
      top: '49vh',
      rotate: '1.4deg',
      z: 6,
    },
    {
      percent: 68,
      title: 'DOS_UI.POP',
      message: 'Dialogfenster streiten kurz um den Vordergrund.',
      action: 'WIN',
      delay: '3740ms',
      left: '26vw',
      top: '62vh',
      rotate: '-1.9deg',
      z: 7,
    },
    {
      percent: 84,
      title: 'ACCESS.OK',
      message: 'Terminalzugang riecht nach Popcorn',
      action: 'OK',
      delay: '4480ms',
      left: '55vw',
      top: '68vh',
      rotate: '0.9deg',
      z: 8,
    },
    {
      percent: 100,
      title: 'FINAL_MSG.WTF',
      message: '',
      action: 'Sag was Cooles. Sonst bleibt das Interface beleidigt stehen.',
      delay: '5480ms',
      left: '34vw',
      top: '26vh',
      rotate: '0.2deg',
      z: 9,
    },
  ];

  /** Laufende Konsolenmeldungen für den unteren Statusbereich. */
  readonly logLines = [
    '[sys] ms-dos collage layer mounted',
    '[ux] reveal masks armed',
    '[art] absurdity budget approved',
    '[ok] B² interface waiting for human input',
  ];

  /** Segmentanzahl der simulierten Ladeleiste. */
  readonly progressCells = Array.from({ length: 26 }, (_, index) => index);

  /** Mindestzeit bis zur manuellen Freigabe bei 100 Prozent. */
  private readonly sequenceDurationMs = 7300;

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

  /** Setzt den globalen Loader-Zustand, bevor die Startseite ihre Reveal-Animationen starten kann. */
  constructor() {
    this.document.documentElement.classList.add(this.loaderActiveClass);
  }

  /** Startet die Bootsequenz und pausiert bei 100 Prozent. */
  ngOnInit(): void {
    this.completionTimer = window.setTimeout(() => this.completed.set(true), this.sequenceDurationMs);
  }

  /** Startet den Asset-Einflug und blendet den Loader danach verzögert aus. */
  dismiss(): void {
    if (!this.completed() || this.launching() || this.leaving()) {
      return;
    }

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

  /** Räumt offene Timer beim Zerstören der Komponente auf. */
  ngOnDestroy(): void {
    window.clearTimeout(this.completionTimer);
    window.clearTimeout(this.launchTimer);
    window.clearTimeout(this.removeTimer);
    this.document.documentElement.classList.remove(this.loaderActiveClass);
  }
}
