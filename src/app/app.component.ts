/* src/app/app.component.ts */

/**
 * @file Root-Komponente des Portfolios.
 * @description Stellt Loader, Routing und nachgeladene globale Experience-Elemente bereit.
 */

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ExperienceGateService } from './core/services/experience-gate.service';
import { AppRuntimeComponent } from './layout/app-runtime/app-runtime.component';
import { AccessibilityPanelComponent } from './layout/accessibility-panel/accessibility-panel.component';
import { AchievementToastComponent } from './layout/achievement-toast/achievement-toast.component';
import { CookieBannerComponent } from './layout/cookie-banner/cookie-banner.component';
import { CriticalStylesComponent } from './layout/critical-styles/critical-styles.component';
import { CustomCursorComponent } from './layout/custom-cursor/custom-cursor.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LoaderComponent } from './layout/loader/loader.component';
import { NavigationComponent } from './layout/navigation/navigation.component';
import { PlatinumCompletionModalComponent } from './layout/platinum-discount-modal/platinum-discount-modal.component';
import { ScrollToTopComponent } from './layout/scroll-to-top/scroll-to-top.component';
import { SystemToastComponent } from './layout/system-toast/system-toast.component';

/** Root-Komponente mit minimalem Startpfad und verzögerter App-Shell. */
@Component({
  selector: 'bp-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CriticalStylesComponent,
    LoaderComponent,
    AppRuntimeComponent,
    NavigationComponent,
    CustomCursorComponent,
    ScrollToTopComponent,
    FooterComponent,
    AccessibilityPanelComponent,
    AchievementToastComponent,
    PlatinumCompletionModalComponent,
    CookieBannerComponent,
    SystemToastComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /** Router zur Auswertung route-spezifischer Layoutoptionen. */
  private readonly router = inject(Router);

  /** Destroy-Referenz für die automatische Bereinigung der Router-Subscription. */
  private readonly destroyRef = inject(DestroyRef);

  /** Zentraler Freigabezustand für schwere Seiteninhalte. */
  private readonly experienceGate = inject(ExperienceGateService);

  /** Steuert, ob die nicht kritische App-Shell nach dem Loader geladen werden darf. */
  readonly shellReady = signal(false);

  /** Merkt, ob der Loader über den regulären Human-Button bestätigt wurde. */
  readonly loaderHumanConfirmed = signal(false);

  /** Steuert, ob der globale Footer für die aktive Route gerendert wird. */
  readonly showFooter = signal(true);

  /** Initialisiert ausschließlich die leichte route-spezifische Layoutsynchronisierung. */
  constructor() {
    this.syncRouteLayout();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncRouteLayout());
  }

  /** Gibt Seiteninhalt, Navigation, Overlays und Footer beim finalen Loader-Launch frei. */
  prepareShell(): void {
    this.experienceGate.release();
    this.shellReady.set(true);
  }

  /** Merkt die manuelle Loader-Bestätigung bis die Achievement-Runtime geladen ist. */
  markLoaderHumanConfirmed(): void {
    this.loaderHumanConfirmed.set(true);
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
