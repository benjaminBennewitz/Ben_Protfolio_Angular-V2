import { element } from './dom.js';

/** Spiegelt Tonzustand mit Symbolen, Beschriftung und Prozentwert. @param {object} audio Audiosteuerung. */
export function updateSoundUI(audio) {
  const silent=audio.muted || audio.volume===0;
  for (const icon of document.querySelectorAll('[data-sound-icon] use')) icon.setAttribute('href',silent?'#icon-sound-off':'#icon-sound-on');
  element('sound-toggle').setAttribute('aria-pressed',String(audio.muted));
  element('sound-toggle-label').textContent=audio.muted?'Ton einschalten':'Ton ausschalten';
  for (const channel of ['bgm','sfx']) {
    element(`${channel}-input`).value=Math.round((audio[channel] ?? 1)*100);
    element(`${channel}-value`).textContent=`${Math.round((audio[channel] ?? 1)*100)} %`;
  }
  element('volume-value').textContent=`${Math.round(audio.volume*100)} %`;
}
