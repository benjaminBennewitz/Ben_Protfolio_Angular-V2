/* src/app/app.component.ts */

/**
 * @file Root-Komponente des Portfolios.
 * @description Stellt Layout-Komponenten wie Navigation, Loader und Custom Cursor bereit.
 */

import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { LanguageService } from './core/services/language.service';
import { TabTitleService } from './core/services/tab-title.service';
import { AccessibilityPanelComponent } from './layout/accessibility-panel/accessibility-panel.component';
import { AchievementToastComponent } from './layout/achievement-toast/achievement-toast.component';
import { CookieBannerComponent } from './layout/cookie-banner/cookie-banner.component';
import { CustomCursorComponent } from './layout/custom-cursor/custom-cursor.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LoaderComponent } from './layout/loader/loader.component';
import { NavigationComponent } from './layout/navigation/navigation.component';
import { PlatinumCompletionModalComponent } from './layout/platinum-discount-modal/platinum-discount-modal.component';
import { ScrollToTopComponent } from './layout/scroll-to-top/scroll-to-top.component';
import { SystemToastComponent } from './layout/system-toast/system-toast.component';

/** Root-Komponente mit globalen Experience-Elementen. */
@Component({
  selector: 'bp-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, LoaderComponent, CustomCursorComponent, ScrollToTopComponent, FooterComponent, AccessibilityPanelComponent, AchievementToastComponent, PlatinumCompletionModalComponent, CookieBannerComponent, SystemToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /** Router zur Auswertung route-spezifischer Layoutoptionen. */
  private readonly router = inject(Router);

  /** Destroy-Referenz für die automatische Bereinigung der Router-Subscription. */
  private readonly destroyRef = inject(DestroyRef);

  /** Steuert, ob die nicht kritische App-Shell nach dem Loader geladen werden darf. */
  readonly shellReady = signal(false);

  /** Steuert, ob der globale Footer für die aktive Route gerendert wird. */
  readonly showFooter = signal(true);

  /** Sprachservice für den inaktiven Tab-Titel. */
  private readonly languageService = inject(LanguageService);

  /** Tab-Titel-Service für Visibility-Hinweise. */
  private readonly tabTitleService = inject(TabTitleService);

  /** Synchronisiert den Hidden-Tab-Titel mit der aktiven Sprache. */
  constructor() {
    this.syncRouteLayout();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncRouteLayout());

    effect(() => {
      const content = this.languageService.content();

      this.tabTitleService.setHiddenTitle(content.meta.hiddenTitle);
    });
  }


  /** Gibt Navigation, Overlays und Footer frei, sobald der Loader in die Launch-Phase wechselt. */
  prepareShell(): void {
    this.shellReady.set(true);
  }

  /** Liest Layoutoptionen aus der tiefsten aktiven Route und blendet den Footer bei Bedarf aus. */
  private syncRouteLayout(): void {
    let route = this.router.routerState.snapshot.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    this.showFooter.set(route.data['hideFooter'] !== true);
  }
}
