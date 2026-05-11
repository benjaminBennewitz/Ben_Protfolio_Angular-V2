/* src/app/app.component.ts */

/**
 * @file Root-Komponente des Portfolios.
 * @description Stellt Layout-Komponenten wie Navigation, Loader und Custom Cursor bereit.
 */

import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language.service';
import { TabTitleService } from './core/services/tab-title.service';
import { AccessibilityPanelComponent } from './layout/accessibility-panel/accessibility-panel.component';
import { AchievementToastComponent } from './layout/achievement-toast/achievement-toast.component';
import { CustomCursorComponent } from './layout/custom-cursor/custom-cursor.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LoaderComponent } from './layout/loader/loader.component';
import { NavigationComponent } from './layout/navigation/navigation.component';
import { ScrollToTopComponent } from './layout/scroll-to-top/scroll-to-top.component';

/** Root-Komponente mit globalen Experience-Elementen. */
@Component({
  selector: 'bp-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, LoaderComponent, CustomCursorComponent, ScrollToTopComponent, FooterComponent, AccessibilityPanelComponent, AchievementToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /** Sprachservice für den inaktiven Tab-Titel. */
  private readonly languageService = inject(LanguageService);

  /** Tab-Titel-Service für Visibility-Hinweise. */
  private readonly tabTitleService = inject(TabTitleService);

  /** Synchronisiert den Hidden-Tab-Titel mit der aktiven Sprache. */
  constructor() {
    effect(() => this.tabTitleService.setHiddenTitle(this.languageService.content().meta.hiddenTitle));
  }
}
