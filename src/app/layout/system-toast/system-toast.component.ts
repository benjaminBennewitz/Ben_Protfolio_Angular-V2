/* src/app/layout/system-toast/system-toast.component.ts */

/**
 * @file Globale System-Toast-Komponente.
 * @description Rendert kurze technische Statusmeldungen der Portfolio-Experience.
 */

import { Component, inject } from '@angular/core';
import { SystemToastService } from '../../core/services/system-toast.service';

/** Zeigt globale Systemmeldungen als kompaktes Terminal-Toast. */
@Component({
  selector: 'bp-system-toast',
  standalone: true,
  templateUrl: './system-toast.component.html',
  styleUrl: './system-toast.component.scss',
})
export class SystemToastComponent {
  /** Toast-Service mit aktivem Hinweis und Dismiss-Funktion. */
  readonly toastService = inject(SystemToastService);
}
