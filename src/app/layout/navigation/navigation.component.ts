/* src/app/layout/navigation/navigation.component.ts */

/**
 * @file Hauptnavigation mit Theme- und Sprachschalter.
 * @description Bietet Anker-Navigation, Mobile-Menü, Dark-/Light-Mode, Language-Switcher und leichte Umschaltanimationen.
 */

import { Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { SystemToastService } from '../../core/services/system-toast.service';

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

  /** Toast-Service für kurze Systemmeldungen. */
  private readonly toastService = inject(SystemToastService);

  /** Sichtbarkeit des mobilen Menüs. */
  readonly menuOpen = signal<boolean>(false);

  /** Sichtbarkeit der Theme-Umschaltanimation im Button. */
  readonly themeIsSwitching = signal<boolean>(false);

  /** Sichtbarkeit eines kurzen Sprachwechselzustands im Button. */
  readonly languageIsSwitching = signal<boolean>(false);

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

  /** Wechselt das Theme und zeigt eine kurze Systemmeldung. */
  toggleTheme(): void {
    this.playButtonAnimation(this.themeIsSwitching);
    this.themeService.toggleTheme();
    this.toastService.show(this.themeService.isLight()
      ? { icon: 'light_mode', title: 'theme switched', message: 'Light Mode aktiv.', tone: 'system' }
      : { icon: 'dark_mode', title: 'theme switched', message: 'Dark Mode aktiv.', tone: 'system' });
  }

  /** Wechselt die Sprache und zeigt eine kurze Systemmeldung. */
  toggleLanguage(): void {
    const nextLanguage = this.languageService.language() === 'de' ? 'en' : 'de';

    this.playButtonAnimation(this.languageIsSwitching);
    this.languageService.setLanguage(nextLanguage);
    this.toastService.show(nextLanguage === 'de'
      ? { icon: 'translate', title: 'language switched', message: 'Deutsch ist aktiv.', tone: 'system' }
      : { icon: 'translate', title: 'language switched', message: 'English is active.', tone: 'system' });
  }

  /** Startet eine kurze Button-Animation erneut, auch wenn schnell mehrfach geklickt wird. */
  private playButtonAnimation(state: WritableSignal<boolean>): void {
    state.set(false);
    window.requestAnimationFrame(() => {
      state.set(true);
      window.setTimeout(() => state.set(false), 760);
    });
  }
}
