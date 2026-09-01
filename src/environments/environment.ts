/* src/environments/environment.ts */

/**
 * @file Entwicklungsumgebung des Portfolios.
 * @description Bündelt laufzeitrelevante URLs für den lokalen Angular-Dev-Server.
 */

/** Konfiguration für lokale Entwicklung und Tests. */
export const environment = {
  production: false,
  siteUrl: 'http://localhost:4200',
  csrfEndpoint: '/api/csrf/',
  contactEndpoint: '/api/contact/',
} as const;
