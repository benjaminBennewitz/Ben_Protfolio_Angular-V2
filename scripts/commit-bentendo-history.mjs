/** Erstellt einen transparenten, fachlich gegliederten Erstimport ohne Datums- oder Autorenmanipulation. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const PLAN='scripts/bentendo-commit-plan.json';
const INTEGRATION=new Set(['angular.json','src/app/pages/portfolio-page/portfolio-page.component.ts',PLAN,
  'scripts/commit-bentendo-history.mjs','scripts/tests/bentendo-integration.test.mjs','docs/bentendo-integration.md']);

/** Führt Git ohne Shell, Autorwechsel, Force-Optionen oder Push aus. @param {string[]} args Git-Argumente. @param {number[]} accepted Erlaubte Rückgabewerte. */
function git(args,accepted=[0]) {
  const result=spawnSync('git',args,{cwd:ROOT,encoding:'utf8',maxBuffer:16*1024*1024});
  if (result.error) throw result.error;
  if (!accepted.includes(result.status)) throw new Error(result.stderr.trim() || result.stdout.trim() || `Git fehlgeschlagen: ${args[0]}`);
  return result;
}

/** Verhindert fremde Pfade und akzeptiert nur die geprüfte Importfolge. @param {object} plan Commitplan. */
function validatePlan(plan) {
  if (plan.version!==1 || !Array.isArray(plan.groups) || plan.groups.length!==11) throw new Error('Commitplan ungueltig.');
  const seen=new Set();
  for (const group of plan.groups) {
    if (!/^(feat|chore|test|docs)\([a-z.-]+\): [^\r\n]+$/u.test(group.message) || !group.files?.length) throw new Error('Commitgruppe ungueltig.');
    for (const entry of group.files) {
      const name=entry.path;
      if (typeof name!=='string' || name.split('/').includes('..') || /[\0\r\n\\]/u.test(name)) throw new Error('Dateipfad ungueltig.');
      if (!name.startsWith('src/design-studies/bentendo/') && !INTEGRATION.has(name)) throw new Error(`Fremder Pfad: ${name}`);
      if (seen.has(name)) throw new Error(`Doppelte Datei: ${name}`);
      seen.add(name); verifyFile(entry);
    }
  }
}

/** Prüft den Patchstand vor dem ersten Commit und toleriert nur harmlose CRLF/LF-Unterschiede. @param {object} entry Geplante Datei. */
function verifyFile(entry) {
  const file=path.join(ROOT,entry.path);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`Datei fehlt: ${entry.path}`);
  const relative=path.relative(fs.realpathSync(ROOT),fs.realpathSync(file));
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Datei liegt ausserhalb: ${entry.path}`);
  if (!entry.sha256 && entry.path!==PLAN) throw new Error(`Dateipruefsumme fehlt: ${entry.path}`);
  if (!entry.sha256) return;
  const source=fs.readFileSync(file),content=entry.text?source.toString('utf8').replace(/\r\n/gu,'\n'):source;
  const actual=createHash('sha256').update(content).digest('hex');
  if (actual!==entry.sha256) throw new Error(`Datei wurde seit dem Integrationspatch geaendert: ${entry.path}`);
}

/** Zeigt Reihenfolge und Umfang vor jeder schreibenden Aktion. @param {object} plan Geprüfter Plan. @param {boolean} detailed Dateiliste anzeigen. */
function showPlan(plan,detailed) {
  console.log('BENTENDO: fachlich gegliederter Erstimport des aktuellen Stands.');
  console.log('Keine Rueckdatierung; Zwischencommits sind noch kein vollstaendiges Spiel.\n');
  for (const [index,group] of plan.groups.entries()) {
    console.log(`${String(index+1).padStart(2,'0')} ${group.message} (${group.files.length} Dateien)`);
    if (detailed) for (const entry of group.files) console.log(`   ${entry.path}`);
  }
}

/** Erhält bereits vorgemerkte Änderungen und nutzt die vorhandene Git-Identität. */
function verifyRepository() {
  git(['rev-parse','--show-toplevel']);
  git(['symbolic-ref','--quiet','--short','HEAD']);
  git(['var','GIT_AUTHOR_IDENT']);
  if (git(['diff','--cached','--quiet'],[0,1]).status!==0) throw new Error('Der Git-Index enthaelt bereits Aenderungen. Diese zuerst separat pruefen und committen oder bewusst aus dem Index nehmen.');
}

/** Erfasst nur explizite Plandateien und überspringt bereits unverändert erfasste Gruppen. @param {object} plan Geprüfter Plan. */
function commitGroups(plan) {
  verifyRepository();
  for (const group of plan.groups) {
    git(['add','--',...group.files.map(entry=>entry.path)]);
    if (git(['diff','--cached','--quiet'],[0,1]).status===0) { console.log(`Bereits erfasst: ${group.message}`); continue; }
    const staged=git(['diff','--cached','--name-only','-z','--relative']).stdout.split('\0').filter(Boolean);
    const expected=new Set(group.files.map(entry=>entry.path));
    if (staged.some(name=>!expected.has(name))) throw new Error('Unerwartete Dateien im Index. Es wurde nichts committet.');
    process.stdout.write(git(['commit','-m',group.message]).stdout);
  }
  console.log('\nImport abgeschlossen. git log und git status pruefen. Kein Push ausgefuehrt.');
}

/** Prüft zuerst vollständig und erstellt Commits ausschließlich mit dem ausdrücklichen CLI-Schalter. */
function main() {
  const args=new Set(process.argv.slice(2));
  for (const arg of args) if (!['--apply','--files','--check'].includes(arg)) throw new Error(`Unbekannter Schalter: ${arg}`);
  const plan=JSON.parse(fs.readFileSync(path.join(ROOT,PLAN),'utf8'));
  validatePlan(plan); showPlan(plan,args.has('--files'));
  if (args.has('--apply')) commitGroups(plan);
  else console.log('\nNur geprueft. Zum Committen: node scripts/commit-bentendo-history.mjs --apply');
}

try { main(); } catch (error) { console.error(`\nBENTENDO: ${error.message}`); process.exitCode=1; }
