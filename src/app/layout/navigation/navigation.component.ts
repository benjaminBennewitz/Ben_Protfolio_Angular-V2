/* src/app/layout/navigation/navigation.component.ts */

/**
 * @file Hauptnavigation mit Theme- und Sprachschalter.
 * @description Bietet Anker-Navigation, Mobile-Menü, Dark-/Light-Mode und Language-Switcher.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';

/** Globale Navigation der Portfolio-Seite. */
@Component({
  selector: 'bp-navigation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  /** Sprachservice für Labels und Sprachwechsel. */
  readonly languageService = inject(LanguageService);

  /** Theme-Service für Dark-/Light-Mode. */
  readonly themeService = inject(ThemeService);

  /** Sichtbarkeit des mobilen Menüs. */
  readonly menuOpen = signal<boolean>(false);

  /** Übersetzter Navigationsinhalt. */
  readonly content = computed(() => this.languageService.content().nav);

  /** Öffnet oder schließt das mobile Menü. */
  toggleMenu(): void {
    this.menuOpen.update((isOpen) => !isOpen);
  }

  /** Schließt das mobile Menü nach einer Navigation. */
  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
