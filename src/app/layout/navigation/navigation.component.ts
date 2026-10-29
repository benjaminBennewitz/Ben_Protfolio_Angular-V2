/* src/app/layout/navigation/navigation.component.ts */

/**
 * @file Hauptnavigation mit Theme- und Sprachschalter.
 * @description Bietet Anker-Navigation, Mobile-Menü, Dark-/Light-Mode, Language-Switcher und leichte Umschaltanimationen.
 */

import { Component, DestroyRef, ElementRef, HostListener, ViewChild, WritableSignal, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { SystemToastService } from '../../core/services/system-toast.service';
import { GlobalOverlayService } from '../../core/services/global-overlay.service';

/** Globale Navigation der Portfolio-Seite. */
@Component({
  selector: 'bp-navigation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  @ViewChild('mobileLinks') private readonly mobileLinks?: ElementRef<HTMLElement>;     // Fokusrückführung und Cleanup bei Navigation über Tastatur.

  @ViewChild('menuToggle') private readonly menuToggle?: ElementRef<HTMLButtonElement>; // Menübutton für die Fokusrückführung nach Escape.
  private readonly destroyRef = inject(DestroyRef);                                     // Entfernt den Scroll-Lock, wenn die Navigation zerstört wird.

  /** Registriert das Cleanup für den globalen Scroll-Lock des mobilen Menüs. */
  constructor() {
    this.destroyRef.onDestroy(/** Entfernt beim Zerstören den globalen Scroll-Lock des mobilen Menüs. */() => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('bp-mobile-menu-open');
      }
    });
  }

  readonly languageService = inject(LanguageService);             // Sprachservice für Labels und Sprachwechsel.
  readonly themeService = inject(ThemeService);                   // Theme-Service für Dark-/Light-Mode.
  private readonly toastService = inject(SystemToastService);     // Toast-Service für kurze Systemmeldungen.
  private readonly overlayService = inject(GlobalOverlayService); // Overlay-Service für globale Panels aus der Navigation.
  readonly menuOpen = signal<boolean>(false);                     // Sichtbarkeit des mobilen Menüs.
  readonly themeIsSwitching = signal<boolean>(false);             // Sichtbarkeit der Theme-Umschaltanimation im Button.
  readonly languageIsSwitching = signal<boolean>(false);          // Sichtbarkeit eines kurzen Sprachwechselzustands im Button.
  readonly content = computed(                                    // Übersetzter Navigationsinhalt.
    /** Übersetzter Navigationsinhalt. */
    () => this.languageService.content().nav
  );

  readonly accessLabel = computed(                                // Beschriftung des mobilen Access-Buttons.
    /** Beschriftung des mobilen Access-Buttons. */
    () => this.languageService.language() === 'de' ? 'Access-Modus öffnen' : 'Open access mode'
  );

  /** Öffnet oder schließt das mobile Menü. */
  toggleMenu(): void {

    const shouldOpen = !this.menuOpen(); // Gewünschter Öffnungszustand des mobilen Menüs.

    this.setMenuOpen(shouldOpen);

    if (shouldOpen && typeof window !== 'undefined') {
      window.requestAnimationFrame(/** Fokussiert nach dem Rendern das erste verfügbare Bedienelement. */() => this.mobileLinks?.nativeElement.querySelector('a')?.focus());
    }
  }

  /** Schließt das mobile Menü nach einer Navigation. */
  closeMenu(): void {
    this.setMenuOpen(false);
  }

  /** Verhindert Scrollen der Seite, solange das Fullscreen-Menü geöffnet ist. */
  private setMenuOpen(isOpen: boolean): void {
    this.menuOpen.set(isOpen);

    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('bp-mobile-menu-open', isOpen);
    }
  }

  /** Schließt das Menü mit Escape und hält Tastaturfokus im geöffneten Overlay. */
  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.menuOpen()) {
      return;
    }

    if (event.key === 'Escape') {
      this.closeMenu();
      this.menuToggle?.nativeElement.focus();
      return;
    }

    if (event.key !== 'Tab' || typeof document === 'undefined') {
      return;
    }

    const header = this.menuToggle?.nativeElement.closest('header');                                            // Header mit den Bedienelementen des mobilen Menüs.
    const elements = Array.from(header?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []) // Sichtbare, fokussierbare Links und Buttons des Headers.
      .filter(/** Behält sichtbare Bedienelemente für die Tastatur-Fokusreihenfolge. */(element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement);                               // Position des aktiven Elements in der Fokusreihenfolge.

    if (!elements.length) {
      return;
    }

    if ((event.shiftKey && currentIndex <= 0) || (!event.shiftKey && currentIndex === elements.length - 1)) {
      event.preventDefault();
      elements[event.shiftKey ? elements.length - 1 : 0].focus();
    }
  }

  /** Stellt beim Wechsel zum Desktop die ursprüngliche Navigation wieder her. */
  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.menuOpen() && window.innerWidth > 980) {
      this.closeMenu();
    }
  }

  /** Öffnet das globale Access-Panel aus der mobilen Navigation. */
  openAccessPanel(): void {
    this.overlayService.requestAccessibilityPanel();
    this.closeMenu();
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

    const nextLanguage = this.languageService.language() === 'de' ? 'en' : 'de'; // Zielsprache des nächsten Sprachwechsels.

    this.playButtonAnimation(this.languageIsSwitching);
    this.languageService.setLanguage(nextLanguage);
    this.toastService.show(nextLanguage === 'de'
      ? { icon: 'translate', title: 'language switched', message: 'Deutsch ist aktiv.', tone: 'system' }
      : { icon: 'translate', title: 'language switched', message: 'English is active.', tone: 'system' });
  }

  /** Startet eine kurze Button-Animation erneut, auch wenn schnell mehrfach geklickt wird. */
  private playButtonAnimation(state: WritableSignal<boolean>): void {
    state.set(false);
    window.requestAnimationFrame(/** Startet die Button-Animation im nächsten Frame und plant ihr Ende. */() => {
      state.set(true);
      window.setTimeout(/** Beendet den kurzen Umschaltzustand des Buttons. */() => state.set(false), 760);
    });
  }
}
