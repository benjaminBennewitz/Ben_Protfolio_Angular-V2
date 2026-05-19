/* src/app/app.routes.ts */

/**
 * @file Routing-Konfiguration des Portfolios.
 * @description Definiert Startseite, Projekt-Detailseiten und Fallback-Route.
 */

import { Routes } from '@angular/router';
import { AchievementsPageComponent } from './pages/achievements-page/achievements-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ImprintPageComponent } from './pages/imprint-page/imprint-page.component';
import { ProjectDetailPageComponent } from './pages/project-detail-page/project-detail-page.component';
import { ThankYouPageComponent } from './pages/thank-you-page/thank-you-page.component';

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
    path: 'achievements',
    component: AchievementsPageComponent,
    title: 'Achievements | Benjamin Bennewitz Portfolio',
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog-page/blog-page.component').then((component) => component.BlogPageComponent),
    title: 'Blog | Benjamin Bennewitz Portfolio',
  },
  {
    path: 'danke',
    component: ThankYouPageComponent,
    title: 'Danke | Benjamin Bennewitz Portfolio',
  },
  {
    path: 'impressum',
    component: ImprintPageComponent,
    title: 'Impressum | Benjamin Bennewitz',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
