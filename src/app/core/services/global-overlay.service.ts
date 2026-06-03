/* src/app/core/services/global-overlay.service.ts */

/**
 * @file Zentrale Auslöser für globale Overlay-Fenster.
 * @description Entkoppelt Navigation, Footer und globale Panels ohne zusätzliche sichtbare Floating-Controls.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Verwaltet reine Öffnen-Events für globale UI-Overlays. */
@Injectable({ providedIn: 'root' })
export class GlobalOverlayService {
  /** Interner Event-Stream für das Accessibility-Panel. */
  private readonly accessibilityPanelRequests = new Subject<void>();

  /** Interner Event-Stream für das Cookie-/Privacy-Panel. */
  private readonly privacyPanelRequests = new Subject<void>();

  /** Öffnen-Events für das Accessibility-Panel. */
  readonly accessibilityPanelRequested$ = this.accessibilityPanelRequests.asObservable();

  /** Öffnen-Events für das Cookie-/Privacy-Panel. */
  readonly privacyPanelRequested$ = this.privacyPanelRequests.asObservable();

  /** Fordert das Öffnen des Accessibility-Panels an. */
  requestAccessibilityPanel(): void {
    this.accessibilityPanelRequests.next();
  }

  /** Fordert das Öffnen des Cookie-/Privacy-Panels an. */
  requestPrivacyPanel(): void {
    this.privacyPanelRequests.next();
  }
}
