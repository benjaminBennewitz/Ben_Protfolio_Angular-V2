/* src/app/core/models/content.models.ts */

/** @file Zusammengesetzte, sprachabhängige Portfolio-Inhalte. */

import type { AboutContent, BuiltWithoutContent, CapabilityShowcaseContent, ClientsContent, CtaContent, ExperienceContent, FaqItem, HeroContent, ProcessContent, SkillsContent } from './home.models';
import type { ContactContent, FooterContent, ImprintContent, NavigationContent, NotFoundPageContent, SeoContent, ThankYouContent } from './pages.models';
import type { PortfolioProject, ProjectsContent } from './projects.models';

/** Vollständiger übersetzter Inhalt einer Sprache. */
export interface PortfolioContent {
  readonly meta: SeoContent;                        // SEO-Texte der aktuellen Sprache.
  readonly nav: NavigationContent;                  // Navigations- und Bedienlabels.
  readonly hero: HeroContent;                       // Inhalte des Hero-Bereichs.
  readonly about: AboutContent;                     // Inhalte des Über-mich-Bereichs.
  readonly experience: ExperienceContent;           // Inhalte des Erfahrungsbereichs.
  readonly skills: SkillsContent;                   // Inhalte des Skillbereichs.
  readonly capabilities: CapabilityShowcaseContent; // Kompaktes Kompetenzprofil als Brücke zwischen Stack und Case Studies.
  readonly projectsIntro: ProjectsContent;          // Einleitung und Labels der Projektübersicht.
  readonly projects: readonly PortfolioProject[];   // Projektdaten der aktuellen Sprache.
  readonly process: ProcessContent;                 // Inhalte des Arbeitsprozesses.
  readonly cta: CtaContent;                         // Inhalte der interaktiven Kontaktaufforderung.
  readonly faqTitle: string;                        // Überschrift des FAQ-Bereichs.
  readonly faqSubtitle: string;                     // Einleitung des FAQ-Bereichs.
  readonly faqs: readonly FaqItem[];                // Fragen und Antworten.
  readonly clients: ClientsContent;                 // Kunden und Referenzen.
  readonly builtWithout: BuiltWithoutContent;       // Schmale Qualitäts-Section mit bewussten technischen Entscheidungen.
  readonly contact: ContactContent;                 // Texte und Rückmeldungen des Kontaktformulars.
  readonly thankYou: ThankYouContent;               // Inhalte der Dankeseite.
  readonly notFoundPage: NotFoundPageContent;       // Inhalte der eigenständigen 404-Seite.
  readonly imprint: ImprintContent;                 // Inhalte der Impressumsseite.
  readonly footer: FooterContent;                   // Footer-Texte und Linkgruppen.
  readonly notFoundTitle: string;                   // Titel bei nicht gefundenem Projekt.
  readonly notFoundText: string;                    // Hinweistext bei nicht gefundenem Projekt.
}

/** Portfolio-Inhalte ohne die umfangreichen, lazy geladenen Case-Study-Daten. */
export type PortfolioBaseContent = Omit<PortfolioContent, 'projects'>;
