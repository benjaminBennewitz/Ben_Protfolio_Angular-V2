/* src/app/layout/footer/footer.component.ts */

/**
 * @file SEO-freundlicher Footer.
 * @description Rendert Kontakt, interne Links und Projektlinks aus übersetzten Inhalten.
 */

import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';
import { GlobalOverlayService } from '../../core/services/global-overlay.service';
import { RepositoryGateComponent } from '../../shared/repository-gate/repository-gate.component';

/** Footer mit semantischen Linkgruppen. */
@Component({
  selector: 'bp-footer',
  standalone: true,
  imports: [RouterLink, RepositoryGateComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  /** Sprachservice für Footer-Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** Achievement-Service für die versteckte Fülli-Trophäe. */
  private readonly achievementService = inject(AchievementService);

  /** Overlay-Service für Footer-Auslöser. */
  private readonly overlayService = inject(GlobalOverlayService);

  /** Aktueller Footer-Inhalt. */
  readonly footer = computed(() => this.languageService.content().footer);

  /** Beschriftung des Privacy-Control-Eintrags. */
  readonly privacyControlLabel = computed(() => this.languageService.language() === 'de' ? 'Cookie-Einstellungen' : 'Cookie settings');


  /** Rechtliche Footer-Labels für dezente Meta-Navigation. */
  readonly legalLabels = computed(() => this.languageService.language() === 'de'
    ? { ariaLabel: 'Rechtliche Hinweise', imprint: 'Impressum', privacy: 'Datenschutz' }
    : { ariaLabel: 'Legal information', imprint: 'Legal notice', privacy: 'Privacy' });

  /** Aktuelles Jahr für Copyright-Ausgabe. */
  readonly year = new Date().getFullYear();
  /** Schaltet die versteckte Fülli-Trophäe frei. */
  unlockPetAchievement(): void {
    this.achievementService.unlock('loyal-companion');
  }

  /** Öffnet das Cookie-/Privacy-Panel über den Footer. */
  openPrivacyControls(): void {
    this.overlayService.requestPrivacyPanel();
  }

  /** Prüft, ob ein Link als interne Angular-Route gerendert werden soll. */
  isRouteLink(href: string): boolean {
    return href.startsWith('/');
  }

  /** Prüft, ob ein Link ein Seitenanker ist. */
  isAnchorLink(href: string): boolean {
    return href.startsWith('#');
  }

  /** Prüft, ob ein Link in einem neuen Browser-Tab geöffnet werden soll. */
  isExternalLink(href: string): boolean {
    return href.startsWith('http://') || href.startsWith('https://');
  }

  /** Liefert den kompakten Social-Typ für die Icon-Ausgabe. */
  socialIconName(label: string): 'linkedin' | 'xing' | 'github' {
    const normalizedLabel = label.toLowerCase();

    if (normalizedLabel.includes('linkedin')) {
      return 'linkedin';
    }

    if (normalizedLabel.includes('xing')) {
      return 'xing';
    }

    return 'github';
  }
}
