/* src/app/shared/repository-gate/repository-gate.component.ts */

/**
 * @file Spielerische Repository-Zugangsabfrage.
 * @description Verbirgt den Repository-Link hinter einem Button und stapelt die letzten fünf Fehlversuche als Systemdialoge.
 */

import { DOCUMENT } from '@angular/common';
import { Component, computed, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import type { RepositoryGateContent } from '../../core/models/pages.models';

export const MAX_VISIBLE_REPOSITORY_FAILURES = 5; // Maximale Zahl gleichzeitig sichtbarer Fehlversuch-Dialoge.

const ACCEPTED_REPOSITORY_ANSWERS = new Set(['fülli', 'fuelli', 'füles']); // Zulässige, bereits auf Kleinschreibung normalisierte Antworten.

const REPOSITORY_URL = 'https://github.com/benjaminBennewitz/Ben_Protfolio_Angular-V2'; // Direkter Zielpfad; wird bewusst erst nach erfolgreicher Antwort an den Browser übergeben.

/** Prüft eine Antwort tolerant gegenüber Leerzeichen, Großschreibung und Unicode-Darstellung. */
export function isRepositoryAnswerAccepted(answer: string): boolean {
  return ACCEPTED_REPOSITORY_ANSWERS.has(answer.normalize('NFC').trim().toLocaleLowerCase('de-DE'));
}

/** Ergänzt einen Fehlversuch und begrenzt die Liste auf die letzten fünf Einträge. */
export function appendRepositoryFailure(failures: readonly number[], failureId: number): readonly number[] {
  return [...failures, failureId].slice(-MAX_VISIBLE_REPOSITORY_FAILURES);
}

/** Footer-Button mit nativer modaler Dialogbox und rotierendem Fehlerstapel. */
@Component({
  selector: 'bp-repository-gate',
  standalone: true,
  templateUrl: './repository-gate.component.html',
  styleUrl: './repository-gate.component.scss',
})
export class RepositoryGateComponent {
  private readonly document = inject(DOCUMENT);                                                                         // Dokumentzugriff für tab-sicheres Öffnen des externen Ziels.

  @ViewChild('repositoryDialog', { static: true }) private readonly repositoryDialog!: ElementRef<HTMLDialogElement>;   // Native Dialogreferenz für Top-Layer, Fokus und Escape-Verhalten.

  @ViewChild('answerInput', { static: true }) private readonly answerInput!: ElementRef<HTMLInputElement>;              // Eingabefeld für Fokussteuerung und Prüfung ohne zusätzliche Formularabhängigkeit.

  @ViewChild('repositoryTrigger', { static: true }) private readonly repositoryTrigger!: ElementRef<HTMLButtonElement>; // Trigger für die Fokus-Rückgabe nach dem Schließen.
  readonly copy = input.required<RepositoryGateContent>();                                                              // Vom zentralen Content-Modell gelieferte Dialogtexte.
  readonly failures = signal<readonly number[]>([]);                                                                    // IDs der letzten maximal fünf falschen Antworten.
  readonly hasFailed = computed(                                                                                        // Markiert das Antwortfeld nach mindestens einem Fehlversuch.
    /** Markiert das Antwortfeld nach mindestens einem Fehlversuch. */
    () => this.failures().length > 0
  );

  private failureId = 0;                                                                                                // Fortlaufende ID für stabile Angular-Track-Keys.

  /** Öffnet die Sicherheitsfrage ohne ein Linkziel im Hover-Zustand preiszugeben. */
  openRepositoryGate(): void {

    const dialog = this.repositoryDialog.nativeElement; // Aktives Dialogelement für die Tastatur-Fokussteuerung.

    this.failures.set([]);
    this.answerInput.nativeElement.value = '';

    if (!dialog.open) {
      dialog.showModal();
    }

    queueMicrotask(/** Öffnet die Sicherheitsfrage ohne ein Linkziel im Hover-Zustand preiszugeben. */() => this.answerInput.nativeElement.focus());
  }

  /** Schließt den Dialog, leert Fehlversuche und gibt den Fokus an den Auslöser zurück. */
  closeRepositoryGate(event?: Event): void {
    event?.preventDefault();

    const dialog = this.repositoryDialog.nativeElement; // Aktives Dialogelement für die Tastatur-Fokussteuerung.

    if (dialog.open) {
      dialog.close();
    }

    this.failures.set([]);
    queueMicrotask(/** Schließt den Dialog, leert Fehlversuche und gibt den Fokus an den Auslöser zurück. */() => this.repositoryTrigger.nativeElement.focus());
  }

  /** Schließt nur bei einem Klick auf die native Dialogfläche außerhalb des Fensters. */
  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === this.repositoryDialog.nativeElement) {
      this.closeRepositoryGate();
    }
  }

  /** Prüft die Antwort, öffnet das Repository oder ergänzt den begrenzten Fehlerstapel. */
  verifyAnswer(event: SubmitEvent, input: HTMLInputElement): void {
    event.preventDefault();

    if (isRepositoryAnswerAccepted(input.value)) {
      this.document.defaultView?.open(REPOSITORY_URL, '_blank', 'noopener,noreferrer');
      this.closeRepositoryGate();
      return;
    }

    this.failureId += 1;
    this.failures.update(/** Prüft die Antwort, öffnet das Repository oder ergänzt den begrenzten Fehlerstapel. */(failures) => appendRepositoryFailure(failures, this.failureId));
    queueMicrotask(/** Prüft die Antwort, öffnet das Repository oder ergänzt den begrenzten Fehlerstapel. */() => input.select());
  }

  /** Entfernt eine einzelne Fehlermeldung über deren Close-Button. */
  dismissFailure(failureId: number): void {
    this.failures.update(/** Entfernt eine einzelne Fehlermeldung über deren Close-Button. */(failures) => failures.filter(/** Prüft, ob der Eintrag die Auswahlbedingung erfüllt. */(id) => id !== failureId));
  }

  /** Berechnet den diagonalen Abstand eines Fehlerfensters. */
  failureOffset(index: number): string {
    return `${index * 18}px`;
  }

  /** Berechnet eine leicht wechselnde Rotation für den Fehlerstapel. */
  failureRotation(index: number): string {
    return `${-4 + index * 1.8}deg`;
  }
}
