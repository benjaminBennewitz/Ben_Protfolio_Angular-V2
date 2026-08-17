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
    path: 'leistungen',
    loadComponent: () => import('./pages/services-page/services-page.component').then((component) => component.ServicesPageComponent),
    title: 'Leistungen & Preise | Design. Code. Repeat.',
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
    path: 'blog',
    loadComponent: () => import('./pages/blog-page/blog-page.component').then((component) => component.BlogPageComponent),
    title: 'Blog | Benjamin Bennewitz Portfolio',
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
    path: '**',
    loadComponent: () => import('./pages/not-found-page/not-found-page.component').then((component) => component.NotFoundPageComponent),
    title: '404 | Benjamin Bennewitz Portfolio',
  },
];
