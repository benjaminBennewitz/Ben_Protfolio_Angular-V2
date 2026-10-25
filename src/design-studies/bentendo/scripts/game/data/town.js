export const HOUSES = [
  { id: 'inn', name: 'Zum schiefen Kessel', x: 4, y: 4, floors: 2, text: 'Schenke, warme Küche und Gästezimmer im Obergeschoss.' },
  { id: 'guild', name: 'Gildenhalle', x: 20, y: 4, floors: 2, text: 'Aufträge und Anmeldung. Im Obergeschoss liegt das Schreibzimmer.' },
  { id: 'workshop', name: 'Runenwerkstatt', x: 4, y: 16, floors: 1, text: 'Reparaturen, Portalspulen und Runenwerkzeuge.' },
  { id: 'market', name: 'Marktlager', x: 20, y: 16, floors: 1, text: 'Reisebedarf und Vorräte für den nächsten Markttag.' },
  { id: 'archive', name: 'Runenarchiv', x: 12, y: 22, text: 'Chroniken und rollbare Bücherregale.' },
  { id: 'hall', name: 'Pumpenhaus', x: 3, y: 22, text: 'Wartungshalle und Zugang zum unterirdischen Dampfkanal.' },
];
export const TREES = [[2,2],[10,3],[27,2],[29,5],[2,17],[10,20],[28,19],[29,22],[18,2],[27,26],[2,28]];

/** Erstellt ein beschriftetes Kartenobjekt. @param {string} id Kennung. @param {string} name Titel. @param {number} x Spalte. @param {number} y Zeile. @param {string} kind Objekttyp. @param {string} action Aktion. @param {object} extra Zusatzdaten. */
export function prop(id, name, x, y, kind, action = 'inspect', extra = {}) {
  return { id, name, x, y, kind, action, ...extra };
}

/** Erstellt die Außenseite der Stadt. */
export function createTown() {
  const objects = [];
  for (const h of HOUSES) {
    objects.push(prop(h.id, h.name, h.x + 2, h.y + 4, 'door', 'travel', { to: h.floors ? `${h.id}-0` : h.id }));
    objects.push(prop(`${h.id}-sign`, 'Hausschild', h.x + 5, h.y + 4, 'sign', 'inspect', { text: `${h.name}: ${h.text}` }));
  }
  objects.push(prop('cat', 'Katze', 11, 6, 'animal', 'inspect', { text: 'Die Katze streckt sich. Für heute hat sie genug gearbeitet.' }));
  objects.push(prop('duck', 'Ente', 25, 13, 'animal', 'inspect', { text: 'Die Ente schüttelt ihr Gefieder.' }));
  objects.push(prop('hen', 'Huhn', 9, 19, 'animal', 'inspect', { text: 'Zwischen dem Gras findet das Huhn ein Korn.' }));
  objects.push(prop('guard', 'Torwache', 14, 12, 'npc', 'talk', { text: 'Moin! Zum Probetag? Die Gildenhalle steht oben rechts. Im Pumpenhaus braucht der Hausmeister Hilfe.' }));
  objects.push(prop('north', 'Waldweg', 15, 0, 'trail', 'travel', { to: 'forest-north' }));
  objects.push(prop('east', 'Waldweg', 31, 12, 'trail', 'travel', { to: 'forest-east' }));
  objects.push(prop('board', 'Schwarzes Brett', 13, 7, 'sign', 'note', { persistent: true, note: { id: 'town-board', title: 'Am schwarzen Brett', text: 'Die Gilde sucht Menschen mit Ideen und Geduld. Niemand muss hier alles können. Aber niemand soll mit einem Problem allein bleiben.' } }));
  return { id: 'city', title: 'Bruchstein', width: 32, height: 30, spawn: [2,12], music: 'town-square', objects, houses: HOUSES, trees: TREES };
}
