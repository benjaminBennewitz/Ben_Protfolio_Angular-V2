/** Prüft Portfolio-Anbindung und Ausschluss der Entwicklungsdateien vom Web-Build. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=fileURLToPath(new URL('../../../../',import.meta.url));
const STUDY='src/design-studies/bentendo/';

/** Erkennt den Asset-Eintrag der Studien. @param {object} entry Angular-Asset-Konfiguration. */
function isStudyAsset(entry) {
  return entry.input==='src/design-studies';
}

/** Prüft Karte und bestehendes Asset-Publishing einschließlich Entwicklungsdatei-Ausschlüssen. */
function integration() {
  const component=fs.readFileSync(path.join(ROOT,'src/app/pages/portfolio-page/portfolio-page.component.ts'),'utf8');
  assert.equal((component.match(/id: 'bentendo'/gu) || []).length,1);
  assert.ok(component.includes("href: '/design-studies/bentendo/'"));
  const config=JSON.parse(fs.readFileSync(path.join(ROOT,'angular.json'),'utf8'));
  const asset=config.projects['ben-portfolio-experience'].architect.build.options.assets.find(isStudyAsset);
  for (const exclude of ['bentendo/tests/**','bentendo/assets/source/**','bentendo/scripts/audio/tools/**']) assert.ok(asset.ignore.includes(exclude));
  const html=fs.readFileSync(path.join(ROOT,STUDY,'index.html'),'utf8');
  assert.ok(html.includes('href="/portfolio#design-studies"')); assert.ok(html.includes('href="./credits.html"'));
  assert.ok(fs.existsSync(path.join(ROOT,STUDY,'credits.html')));
}

test('BENTENDO: Projektkarte und bestehender Angular-Asset-Build',integration);
