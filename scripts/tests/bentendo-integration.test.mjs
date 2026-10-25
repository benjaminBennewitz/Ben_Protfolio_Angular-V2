/** Prüft Portfolio-Anbindung und vollständige Zuordnung zum Commitplan ohne Git-Mutationen. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const STUDY='src/design-studies/bentendo/';

/** Sammelt Projektdateien ohne Abhängigkeiten und Python-Caches. @param {string} folder Verzeichnis. */
function files(folder) {
  const result=[];
  for (const entry of fs.readdirSync(folder,{withFileTypes:true})) {
    if (['node_modules','__pycache__'].includes(entry.name)) continue;
    const name=path.join(folder,entry.name);
    if (entry.isDirectory()) result.push(...files(name));
    else if (entry.isFile() && !name.endsWith('.pyc')) result.push(path.relative(ROOT,name).split(path.sep).join('/'));
  }
  return result;
}

/** Prüft Karte und bestehendes Asset-Publishing einschließlich Entwicklungsdatei-Ausschlüssen. */
function integration() {
  const component=fs.readFileSync(path.join(ROOT,'src/app/pages/portfolio-page/portfolio-page.component.ts'),'utf8');
  assert.equal((component.match(/id: 'bentendo'/gu) || []).length,1);
  assert.ok(component.includes("href: '/design-studies/bentendo/'"));
  const config=JSON.parse(fs.readFileSync(path.join(ROOT,'angular.json'),'utf8'));
  const asset=config.projects['ben-portfolio-experience'].architect.build.options.assets.find(entry=>entry.input==='src/design-studies');
  for (const exclude of ['bentendo/tests/**','bentendo/assets/source/**','bentendo/scripts/audio/tools/**']) assert.ok(asset.ignore.includes(exclude));
  const html=fs.readFileSync(path.join(ROOT,STUDY,'index.html'),'utf8');
  assert.ok(html.includes('href="/portfolio#design-studies"')); assert.ok(html.includes('href="./CREDITS.md"'));
}

/** Prüft alle Importdateien und die eindeutige vollständige Zuordnung. */
function commitPlan() {
  const plan=JSON.parse(fs.readFileSync(path.join(ROOT,'scripts/bentendo-commit-plan.json'),'utf8'));
  const names=plan.groups.flatMap(group=>group.files.map(entry=>entry.path));
  assert.equal(plan.groups.length,11); assert.equal(new Set(names).size,names.length);
  for (const name of files(path.join(ROOT,STUDY))) assert.ok(names.includes(name),name);
  const result=spawnSync(process.execPath,['scripts/commit-bentendo-history.mjs','--check'],{cwd:ROOT,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
}

test('BENTENDO: Projektkarte und bestehender Angular-Asset-Build',integration);
test('BENTENDO: vollständiger, eindeutiger und verifizierter Commitplan',commitPlan);
