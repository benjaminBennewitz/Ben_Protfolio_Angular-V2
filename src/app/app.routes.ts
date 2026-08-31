/* src/app/app.routes.ts */

/**
 * @file Routing-Konfiguration des Portfolios.
 * @description Definiert Startseite, Projekt-Detailseiten und Fallback-Route mit lazy geladenen Seitenkomponenten.
 */

import { Routes } from '@angular/router';

/** Routen der Portfolio-Anwendung. */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component').then((component) => component.HomePageComponent),
    title: 'Benjamin Bennewitz | Portfolio',
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./pages/portfolio-page/portfolio-page.component').then((component) => component.PortfolioPageComponent),
    title: 'Case Studies | Design. Code. Repeat.',
  },
  {
    path: 'projects/:slug',
    loadComponent: () => import('./pages/project-detail-page/project-detail-page.component').then((component) => component.ProjectDetailPageComponent),
    title: 'Projekt | Benjamin Bennewitz Portfolio',
  },
  {
    path: 'achievements',
    loadComponent: () => import('./pages/achievements-page/achievements-page.component').then((component) => component.AchievementsPageComponent),
    title: 'Achievements | Benjamin Bennewitz Portfolio',
  },
  {
    path: 'snippets',
    loadComponent: () => import('./pages/snippets-page/snippets-page.component').then((component) => component.SnippetsPageComponent),
    title: 'Snippets | Benjamin Bennewitz Portfolio',
  },
  {
    path: 'danke',
    loadComponent: () => import('./pages/thank-you-page/thank-you-page.component').then((component) => component.ThankYouPageComponent),
    title: 'Danke | Benjamin Bennewitz Portfolio',
  },
  {
    path: 'impressum',
    loadComponent: () => import('./pages/imprint-page/imprint-page.component').then((component) => component.ImprintPageComponent),
    title: 'Impressum | Benjamin Bennewitz',
  },
  {
    path: 'datenschutz',
    loadComponent: () => import('./pages/privacy-page/privacy-page.component').then((component) => component.PrivacyPageComponent),
    title: 'Datenschutz | Benjamin Bennewitz',
    data: { hideFooter: true },
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page/not-found-page.component').then((component) => component.NotFoundPageComponent),
    title: '404 | Benjamin Bennewitz Portfolio',
  },
];
