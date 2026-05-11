/* src/app/layout/footer/footer.component.ts */

/**
 * @file SEO-freundlicher Footer.
 * @description Rendert Kontakt, interne Links und Projektlinks aus übersetzten Inhalten.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

/** Footer mit semantischen Linkgruppen. */
@Component({
  selector: 'bp-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  /** Sprachservice für Footer-Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** Aktueller Footer-Inhalt. */
  readonly footer = computed(() => this.languageService.content().footer);

  /** Sichtbarkeit des kleinen Footer-Dialogfensters. */
  readonly isFooterDialogVisible = signal<boolean>(true);

  /** Aktuelles Jahr für Copyright-Ausgabe. */
  readonly year = new Date().getFullYear();

  /** Entfernt das Footer-Dialogfenster aus dem Footer. */
  closeFooterDialog(): void {
    this.isFooterDialogVisible.set(false);
  }

  /** Prüft, ob ein Link als interne Angular-Route gerendert werden soll. */
  isRouteLink(href: string): boolean {
    return href.startsWith('/');
  }

  /** Prüft, ob ein Link ein Seitenanker ist. */
  isAnchorLink(href: string): boolean {
    return href.startsWith('#');
  }
}
