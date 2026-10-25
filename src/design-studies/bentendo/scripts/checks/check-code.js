import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'acorn';
const root = fileURLToPath(new URL('../../',import.meta.url));
const issues = [];
let count = 0;

/** Sammelt ausschließlich projekteeigene Quelldateien. @param {string} directory Verzeichnis. */
function collect(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    const target = path.join(directory,entry.name);
    if (entry.isDirectory()) files.push(...collect(target));
    else files.push(target);
  }
  return files;
}

/** Prüft Syntax, Dateilänge und sämtliche Funktionen. @param {string} file Quelldatei. */
function checkJavaScript(file) {
  const source = fs.readFileSync(file,'utf8'), comments = [];
  const tree = parse(source,{ecmaVersion:'latest',sourceType:'module',locations:true,onComment:comments});
  checkLength(file,source);
  walk(tree,null,{file,source,comments});
}

/** Prüft die verbindliche Dateigrenze. @param {string} file Datei. @param {string} source Quelltext. */
function checkLength(file,source) {
  if (source.trimEnd().split('\n').length > 450) issues.push(`${path.relative(root,file)}: mehr als 450 LOC`);
}

/** Durchläuft auch verschachtelte Callback-Funktionen. @param {object} node Syntaxknoten. @param {object} parent Übergeordneter Knoten. @param {object} context Prüfkontext. */
function walk(node,parent,context) {
  if (['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression'].includes(node.type)) checkFunction(node,parent,context);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) if (child?.type) walk(child,node,context);
    } else if (value?.type) walk(value,node,context);
  }
}

/** Ermittelt den unmittelbar vorangestellten JSDoc-Block. @param {object} node Funktionsknoten. @param {object} context Prüfkontext. */
function documentation(node,context) {
  let previous = null;
  for (const comment of context.comments) if (comment.end <= node.start) previous = comment;
  if (!previous || !previous.value.startsWith('*')) return '';
  if (context.source.slice(previous.end,node.start).trim()) return '';
  return previous.value;
}

/** Prüft kurze Funktionen und dokumentierte Parameter. @param {object} node Funktion. @param {object} parent Elternknoten. @param {object} context Prüfkontext. */
function checkFunction(node,parent,context) {
  count++;
  const anchor = ['MethodDefinition','Property','ExportNamedDeclaration'].includes(parent?.type) ? parent : node;
  const name = node.id?.name || parent?.key?.name || 'Callback';
  const prefix = `${path.relative(root,context.file)}:${node.loc.start.line} ${name}`;
  const doc = documentation(anchor,context);
  if (node.loc.end.line-node.loc.start.line+1 > 20) issues.push(`${prefix}: mehr als 20 LOC`);
  if (!doc) issues.push(`${prefix}: deutscher JSDoc fehlt`);
  for (const parameter of node.params) {
    const key = parameter.type === 'AssignmentPattern' ? parameter.left.name : parameter.name;
    if (!key || !new RegExp('@param\\s+\\{[^}]+\\}\\s+'+key+'\\b').test(doc)) issues.push(`${prefix}: @param ${key || 'Destrukturierung'} fehlt`);
  }
}

/** Prüft CSS-Kopf, Inhaltsverzeichnis und Abschnittsüberschriften. @param {string} file Stylesheet. */
function checkStyle(file) {
  const source = fs.readFileSync(file,'utf8');
  checkLength(file,source);
  for (const required of ['/*###############################','###     AUTHOR: Benjamin Bennewitz','INHALTSVERZEICHNIS','01   ']) {
    if (!source.includes(required)) issues.push(`${file}: CSS-Kopf oder Inhaltsverzeichnis fehlt`);
  }
  const titles = [...source.matchAll(/^\s+(\d{2}\s+[^\n]+)$/gm)];
  const seen = new Map();
  for (const title of titles) seen.set(title[1],(seen.get(title[1]) || 0)+1);
  for (const [title,total] of seen) if (total !== 2) issues.push(`${file}: Abschnitt ${title} stimmt nicht mit dem Inhaltsverzeichnis überein`);
}

/** Führt alle Quelltextregeln ohne Anwendungscode aus. */
function main() {
  for (const directory of ['scripts','tests']) {
    for (const file of collect(path.join(root,directory))) if (file.endsWith('.js')) checkJavaScript(file);
  }
  for (const file of collect(path.join(root,'styles'))) if (file.endsWith('.css')) checkStyle(file);
  if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
  else console.log(`OK: ${count} Funktionen mit JSDoc/Parametern, maximal 20 LOC; Dateien maximal 450 LOC; CSS-Struktur geprüft.`);
}

main();
