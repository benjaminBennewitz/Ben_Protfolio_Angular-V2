/** @file world.js — Baut die Welt in unveränderter Layer- und Zufallsreihenfolge auf. */

import { createWorldCore } from '../world/core.js';
import { buildTrunk } from '../world/trunk.js';
import { buildRoots } from '../world/roots.js';
import { buildTerrain } from '../world/terrain.js';
import { buildGround } from '../world/ground.js';
import { buildBranches } from '../world/branches.js';
import { buildCanopy } from '../world/canopy.js';
import { buildEpiphytes } from '../world/epiphytes.js';
import { buildAtmosphere } from '../world/atmosphere.js';
import { finalizeWorld } from '../world/layers.js';

/**
 * Baut die Welt in unveränderter Layer- und Zufallsreihenfolge auf.
 * @param {object} scene - Gemeinsame Three.js-Szene.
 * @param {object} renderer - WebGL-Renderer der Studie.
 * @param {object} config - Validierte Generatorparameter und Seeds.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createGrowthWorld(scene, renderer, config) {

  const context = {
    scene,
    renderer,
    config,
  };  // Explizite Abhängigkeiten und Ergebnisse der nacheinander aufgebauten Weltbereiche.

  Object.assign(context, createWorldCore(context));
  buildTrunk(context);
  buildRoots(context);
  Object.assign(context, buildTerrain(context));
  Object.assign(context, buildGround(context));
  Object.assign(context, buildBranches(context));
  Object.assign(context, buildCanopy(context));
  Object.assign(context, buildEpiphytes(context));
  Object.assign(context, buildAtmosphere(context));
  return finalizeWorld(context);
}
