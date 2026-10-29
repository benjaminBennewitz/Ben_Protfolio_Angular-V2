/* src/app/core/models/board.models.ts */

/** @file Modelle für Board-, Workflow- und Maskottchen-Showcases. */

import type { ProjectMetric } from './shared.models';

/** Einzelne schwebende To-do-Karte im Hero eines Projektmanagement-Projekts. */
export interface ProjectBoardHeroTask {
  readonly title: string;           // Sichtbarer Aufgabenname.
  readonly excerpt: string;         // Auf maximal etwa 100 Zeichen gekürzte Aufgabenbeschreibung.
  readonly ownerInitials: string;   // Initialen der verantwortlichen Person.
  readonly dueDate: string;         // Lokalisiertes Fälligkeitsdatum.
  readonly dueDateIso: string;      // Maschinenlesbares Fälligkeitsdatum für das Time-Element.
  readonly attachmentCount: number; // Anzahl der angehängten Dateien.
  readonly commentCount: number;    // Anzahl der Kommentare.
  readonly hasRule: boolean;        // Gibt an, ob eine Automatisierungsregel aktiv ist.
}

/** Lokalisierte Beschriftungen für Metadaten der Hero-Aufgabenkarten. */
export interface ProjectBoardHeroTaskLabels {
  readonly todo: string;        // Statuslabel der Karte.
  readonly owner: string;       // Beschriftung der verantwortlichen Person.
  readonly dueDate: string;     // Beschriftung des Fälligkeitsdatums.
  readonly attachments: string; // Beschriftung der Anhänge.
  readonly comments: string;    // Beschriftung der Kommentare.
  readonly rule: string;        // Beschriftung der Automatisierungsregel.
}

/** Kleine Karte für Workflow-, UX- oder Gamification-Schwerpunkte. */
export interface ProjectBoardWorkflowCard {
  readonly icon: string;              // Material-Symbol der Schwerpunktkarte.
  readonly title: string;             // Titel des Schwerpunkts.
  readonly text: string;              // Kurzer erklärender Text.
  readonly points: readonly string[]; // Scannbare Detailpunkte.
}

/** Kompakter UX-Grundsatz der Maskottchen-Section. */
export interface ProjectBoardMascotPrinciple {
  readonly title: string; // Kurzer Titel des UX-Grundsatzes.
  readonly text: string;  // Erklärender Text zum Grundsatz.
}

/** Story-Beat oder Lore-Karte zum Maskottchen. */
export interface ProjectBoardMascotStoryBeat {
  readonly label: string; // Kurzes Label für die Timeline oder Karte.
  readonly title: string; // Überschrift des Story-Beats.
  readonly text: string;  // Erklärender Text.
}

/** Profil des Maskottchens einer Projektmanagement-App. */
export interface ProjectBoardMascotProfile {
  readonly eyebrow: string;                                     // Kleine Beschriftung über dem Profil.
  readonly title: string;                                       // Überschrift der Profil-Section.
  readonly name: string;                                        // Name des Maskottchens.
  readonly role: string;                                        // Rolle des Maskottchens im Produkt.
  readonly text: string;                                        // Story- und UX-Text zum Maskottchen.
  readonly asset?: string;                                      // Optionaler Bildpfad für ein echtes Maskottchen-Asset.
  readonly assetAlt: string;                                    // Alternativtext für das Maskottchen-Asset.
  readonly assetHint: string;                                   // Geplanter Dateipfad, wenn das Asset später ergänzt wird.
  readonly previewImage?: string;                               // Optionales Story-/Szenenbild als atmosphärischer Kontext.
  readonly previewAlt?: string;                                 // Alternativtext für das Story-/Szenenbild.
  readonly previewCaption?: string;                             // Kurze Bildlegende für das Story-/Szenenbild.
  readonly principles?: readonly ProjectBoardMascotPrinciple[]; // Kompakte UX-Grundsätze zur Rolle des Maskottchens.
  readonly storyBeats?: readonly ProjectBoardMascotStoryBeat[]; // Verdichtete Story-Beats aus der internen Lore.
  readonly facts: readonly ProjectMetric[];                     // Kompakte Fakten zur Maskottchen-Funktion.
}

/** Projektspezifischer Showcase für Kanban-, Board- und Gamification-Projekte. */
export interface ProjectBoardShowcase {
  readonly eyebrow: string;                                    // Kleine technische Beschriftung im Hero-Showcase.
  readonly title: string;                                      // Titel des Board-Frames.
  readonly status: string;                                     // Kurzer Status- oder Produkt-Hinweis im Board-Frame.
  readonly lead: string;                                       // Erklärender Text zum Board-Showcase.
  readonly ctaLabel: string;                                   // Beschriftung des primären Hero-Links.
  readonly chips: readonly string[];                           // Kleine technische oder fachliche Tags im Showcase.
  readonly boardLabel: string;                                 // Zugängliche Beschriftung des Board-Containers.
  readonly heroTaskLabels: ProjectBoardHeroTaskLabels;         // Lokalisierte Beschriftungen der Aufgabenmetadaten.
  readonly heroTasks: readonly ProjectBoardHeroTask[];         // Fünf schwebende Beispielaufgaben im Hero.
  readonly workflowEyebrow: string;                            // Eyebrow für die Workflow-Section.
  readonly workflowTitle: string;                              // Überschrift für die Workflow-Section.
  readonly workflowCards: readonly ProjectBoardWorkflowCard[]; // Workflow-, UX- und Gamification-Karten.
  readonly mascot: ProjectBoardMascotProfile;                  // Maskottchen-Profil des Projektmanagement-Systems.
  readonly galleryEyebrow: string;                             // Eyebrow für die Galerie.
  readonly galleryTitle: string;                               // Überschrift für die Galerie.
}
