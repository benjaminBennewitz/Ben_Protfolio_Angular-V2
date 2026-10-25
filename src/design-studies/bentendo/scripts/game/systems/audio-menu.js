/** Öffnet die Tonregler innerhalb der eingefrorenen Spielwelt. @param {object} game Spiel. @param {boolean} returnPause Rückweg ins Pausenmenü. */
export function openAudioMenu(game,returnPause=false) {
  game.held=null; game.systemMenu={kind:'audio',choice:0,returnPause,returnBag:!returnPause,levels:{bgm:1,sfx:1,menuBeeps:true}};
  game.sounds.push('ui-confirm');
}

/** Spiegelt die vorhandene Audiosteuerung in den reinen Menüzustand. @param {object} game Spiel. @param {object} audio Audiosteuerung. */
export function syncAudioMenu(game,audio) {
  if (game.systemMenu?.kind==='audio') game.systemMenu.levels={bgm:audio?.bgm ?? 1,sfx:audio?.sfx ?? 1,menuBeeps:audio?.menuBeeps!==false};
}

/** Wählt einen Kanal oder ändert dessen Anteil in Zehn-Prozent-Schritten. @param {object} game Spiel. @param {string} direction Richtung. @param {object} audio Audiosteuerung. */
export function navigateAudioMenu(game,direction,audio) {
  const menu=game.systemMenu;
  if (['up','down'].includes(direction)) {
    menu.choice=Math.max(0,Math.min(3,menu.choice+(direction==='up'?-1:1))); game.sounds.push('ui-move'); return;
  }
  if (menu.choice===2) return changeMenuBeeps(game,direction,audio);
  if (menu.choice===3 || !audio?.setChannel) return;
  const channel=menu.choice===0?'bgm':'sfx',before=audio[channel] ?? 1;
  const next=Math.max(0,Math.min(1,Math.round((before+(direction==='left'?-.1:.1))*10)/10));
  if (next===before) return;
  audio.setChannel(channel,next); syncAudioMenu(game,audio); game.sounds.push('ui-move');
}

/** Beschreibt die Auswahl für die gemeinsame zugängliche Statusausgabe. @param {object} menu Aktives Menü. */
export function audioMenuDescription(menu) {
  const labels=['Musik BGM','Effekte SFX',`Menü-Beeps ${menu.levels?.menuBeeps===false?'aus':'an'}`,'Zurück'],channel=menu.choice===0?'bgm':'sfx';
  return `Ton einstellen: ${labels[menu.choice]}${menu.choice<2?' '+Math.round(menu.levels[channel]*100)+' Prozent':''}. Oben/unten wählen, links/rechts ändern, B zurück.`;
}

/** Ändert Menü-Beeps über Richtungen oder Bestätigung. @param {object} game Spiel. @param {string} direction Eingabe. @param {object} audio Audiosteuerung. */
function changeMenuBeeps(game,direction,audio) {
  if (!audio?.setMenuBeeps) return;
  audio.setMenuBeeps(direction==='toggle'?audio.menuBeeps===false:direction!=='left');
  syncAudioMenu(game,audio); game.sounds.push('ui-confirm');
}
