import { refreshMaraJournal } from './mara-quest.js';
import { refreshVillageQuestNotes } from './village-tasks.js';
import { DISCOVERY_NOTES } from '../data/discoveries.js';

/** Aktualisiert ältere Hilfstexte am bekannten Fortschritt, ohne Belohnungen oder neue Fakten zu vergeben. @param {object} game Spiel. */
export function refreshQuestJournal(game) {
  refreshMaraJournal(game); refreshVillageQuestNotes(game);
  for (const note of game.notes) if (note.id==='moos-trail') note.text=DISCOVERY_NOTES.trail.text;
}
