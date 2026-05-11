/* src/app/app.routes.ts */

/**
 * @file Routing-Konfiguration des Portfolios.
 * @description Definiert Startseite, Projekt-Detailseiten und Fallback-Route.
 */

import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProjectDetailPageComponent } from './pages/project-detail-page/project-detail-page.component';

/** Routen der Portfolio-Anwendung. */
export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Benjamin Bennewitz | Portfolio',
  },
  {
    path: 'projects/:slug',
    component: ProjectDetailPageComponent,
    title: 'Projekt | Benjamin Bennewitz Portfolio',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
