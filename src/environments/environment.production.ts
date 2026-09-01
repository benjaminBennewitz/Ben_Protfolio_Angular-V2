/* src/environments/environment.production.ts */

/**
 * @file Produktionsumgebung des Portfolios.
 * @description Enthält ausschließlich öffentliche, nicht geheime Frontend-Konfiguration für b2folio.de.
 */

/** Konfiguration für den produktiven Build auf b2folio.de. */
export const environment = {
  production: true,
  siteUrl: 'https://b2folio.de',
  csrfEndpoint: '/api/csrf/',
  contactEndpoint: '/api/contact/',
} as const;
