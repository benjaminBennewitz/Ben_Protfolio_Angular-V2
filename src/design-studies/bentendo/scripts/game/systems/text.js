/** Bricht Text wortweise um. @param {string} text Inhalt. @param {number} limit Maximale Zeichenzahl. */
export function wrapText(text, limit = 32) {
  const lines = []; let line = '';
  for (const word of text.split(/\s+/u)) {
    if (line && `${line} ${word}`.length > limit) { lines.push(line); line = word; }
    else line += `${line ? ' ' : ''}${word}`;
  }
  if (line) lines.push(line);
  return lines;
}

/** Liefert einen einheitlichen Objekt-Aktionsnamen. @param {object} object Gegenstand. */
export function objectHint(object) {
  if (!object) return '';
  const verbs = { inspect:'untersuchen', talk:'ansprechen', chest:'öffnen', note:'lesen', search:'durchsuchen', push:'schieben', reset:'betätigen', take:'nehmen', switch:'schalten', valve:'drehen', travel:'betreten' };
  const villageVerbs = { 'village-branch':'untersuchen', 'village-sluice':'betätigen', 'village-keeper':'ansprechen', 'village-door':'öffnen' };
  return `${object.name} ${object.hint || verbs[object.action] || villageVerbs[object.action] || 'benutzen'} (A)`;
}
