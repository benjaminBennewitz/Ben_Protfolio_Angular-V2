/** @file Semantische Auswahlbuttons und SVG-Silhouetten des Probenarchivs. */
import { SPECIMENS } from './organisms.js';
import { silhouettes } from './content.js';

/** Baut die Probenliste einmalig aus den zentralen Artendaten auf. */
export function buildArchive(list) {
  for (const item of SPECIMENS) list.append(createRow(item));
  document.querySelector('#archive-count').textContent = `01—${String(SPECIMENS.length).padStart(2, '0')}`;
}

/** Erstellt einen Listeneintrag mit nativem Auswahlbutton. */
function createRow(item) {
  const row = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.specimen = item.id;
  button.append(createText('specimen-number', item.number), createIcon(item.id), createText('specimen-label', ''));
  row.append(button);
  return row;
}

/** Erstellt ein Textfragment mit einer ausschließlich lokalen CSS-Klasse. */
function createText(className, text) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}

/** Erstellt die dekorative Silhouette ohne externe Ressourcen oder HTML-Injektion. */
function createIcon(id) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  svg.setAttribute('viewBox', '0 0 40 44');
  svg.setAttribute('aria-hidden', 'true');
  path.setAttribute('d', silhouettes[id]);
  svg.append(path);
  return svg;
}
