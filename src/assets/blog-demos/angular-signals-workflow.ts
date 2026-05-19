/*###############################
###
###     blog-demo.ts
###     Portfolio Blog Demo
###     BASED ON: Angular Signals, TypeScript
###     AUTHOR: Benjamin Bennewitz
###
###
###       ██████╗  ▀█
###       ██╔══██╗ █▄
###       ██████╦╝
###       ██╔══██╗
###       ██████╦╝
###       ╚═════╝
###
###
#################################*/

import { computed, effect, signal } from '@angular/core';

/**
 * @file Kleine Angular-Signals-Demo.
 * @description Zeigt lokalen UI-State, eine berechnete Ableitung und einen sparsamen Side-Effect.
 */

/** Kleiner lokaler UI-State mit Angular Signals. */
export class SignalCounterExample {
  /** Aktueller Zählerstand. */
  readonly count = signal<number>(0);

  /** Abgeleiteter Wert ohne manuelles Subscription-Handling. */
  readonly doubled = computed<number>(() => this.count() * 2);

  /** Beispiel für einen Seiteneffekt außerhalb des Templates. */
  readonly logEffect = effect(() => {
    console.log('Counter changed:', this.count());
  });

  /** Erhöht den Zähler um eins. */
  increment(): void {
    this.count.update((value) => value + 1);
  }
}
