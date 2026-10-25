/** Erkennt gelesene Dokumente ohne zukünftige Fundstellen abzufragen. @param {object} game Spiel. @param {string} id Dokumentkennung. */
export function knowsNote(game,id) {
  for (const note of game.notes) if (note.id===id) return true;
  return false;
}

/** Baut einen stabilen Erkenntnisstand aus sichtbaren Texten statt aus versteckten Lösungswerten. @param {object} quest Bekannte Questfakten. */
export function questRecord(quest) {
  const result={people:[],places:[],clues:[],markers:[],ready:false,...quest};
  result.ready=Boolean(result.ready); result.status=result.done?'done':'open';
  const text=JSON.stringify([result.status,result.ready,result.people,result.places,result.clues]);
  let revision=1;
  for (const letter of text) revision=(revision*31+letter.codePointAt(0))%2147483647;
  return {...result,revision};
}

/** Beschreibt eine bekannte Anlaufstelle oder einen ungefähren Suchbereich. @param {string} room Raum. @param {string} target Person oder grobes Gebiet. @param {string} symbol Kartenzeichen. */
export function questMarker(room,target,symbol='?') { return {room,target,symbol}; }
