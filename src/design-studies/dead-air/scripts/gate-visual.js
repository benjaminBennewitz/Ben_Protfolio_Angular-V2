/**
 * @file Prozeduraler Dimensionsriss für das DEAD//AIR-Finale.
 * @description Zeichnet die Dreiecksöffnung über einem eingefrorenen Küstenframe.
 *              Verwendet ein lokales Hintergrundbild und prozedurale Wolkenschichten,
 *              ohne eigenständige Animationstimer oder zusätzliche Bibliotheken.
 * @author Benjamin Bennewitz
 */

/** Begrenzung für die Pixeldichte der transparenten Effektebene. */
import { prepareDimension, drawDimension } from './dimension-world.js';

const MAX_DPR = 1.5;

/** Erst nach vollständiger Öffnung lichten sich die Wolken über zehn Sekunden. */
const PORTAL_REVEAL_START_SECONDS = 13.8;
const PORTAL_REVEAL_DURATION_SECONDS = 10;
/** Ende der zeitgesteuerten Enthüllung für den begrenzten Reduced-Motion-Renderlauf. */
export const PORTAL_REVEAL_END_MS = (PORTAL_REVEAL_START_SECONDS + PORTAL_REVEAL_DURATION_SECONDS) * 1000;
let distantPortalBackdrop = null;

/** Interpoliert eine Phase in einem stabilen Wertebereich. */
const clamp01 = value => Math.max(0, Math.min(1, value));
const ease = value => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

/** Unregelmäßiger dreieckiger Riss, dessen Rand vom Wasser verzerrt wird.
 * Anders als die perfekten Peillinien darf die Öffnung selbst nie geometrisch sauber aussehen. */
function traceFracture(ctx, vertices, time, strength) {
  ctx.beginPath();
  vertices.forEach((start, edge) => {
    const end = vertices[(edge + 1) % 3];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    for (let segment = 0; segment <= 22; segment += 1) {
      if (edge !== 0 && segment === 0) continue;
      const at = segment / 22;
      const edgeNoise = Math.sin(at * 47 + time * .56 + edge * 2.1) * 4.5
        + Math.sin(at * 103 - time * .21 + edge * 7.3) * 2.9;
      const taper = Math.sin(Math.PI * at) * strength;
      const x = start.x + dx * at + nx * edgeNoise * taper;
      const y = start.y + dy * at + ny * edgeNoise * taper;
      if (edge === 0 && segment === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
}

/** Öffnet die Peilgeometrie während des Finales räumlich nach außen. */
function expandTriangle(vertices, factor) {
  const cx = vertices.reduce((sum, point) => sum + point.x, 0) / 3;
  const cy = vertices.reduce((sum, point) => sum + point.y, 0) / 3;
  return vertices.map(({ x, y }) => ({ x: cx + (x - cx) * factor, y: cy + (y - cy) * factor }));
}

/** Hebt die Geometrie aus dem Meer und simuliert eine leichte räumliche Neigung.
 * Die drei Ausgangspositionen bleiben bis zum Öffnen der Ankerpunkte fixiert. */
function levitateTriangle(points, time, opening, reducedMotion) {
  const lift = ease(opening * 1.45);
  if (lift <= 0) return points;

  const center = {
    x: points.reduce((sum, point) => sum + point.x, 0) / 3,
    y: points.reduce((sum, point) => sum + point.y, 0) / 3,
  };

  // Die Geometrie schwebt langsam. Kurze elektrische Impulse verändern nur das Licht,
  // nicht mehr die Position des ganzen Tores.
  const rotation = lift * (reducedMotion ? -.022 : -.022 + .028 * Math.sin(time * .24));
  const shear = reducedMotion ? 0 : lift * .021 * Math.sin(time * .17 + .6);
  const pitch = 1 - lift * (reducedMotion ? .1 : .1 + .022 * Math.sin(time * .19));
  const hover = lift * (20 + (reducedMotion ? 0 : 4.4 * Math.sin(time * .32)));
  const drift = reducedMotion ? 0 : lift * 3.8 * Math.sin(time * .21 + .4);
  const pulse = 1 + (reducedMotion ? 0 : lift * .003 * Math.sin(time * .38));
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);

  return points.map(point => {
    const x = (point.x - center.x) * pulse;
    const y = (point.y - center.y) * pulse;
    const rx = x * cosine - y * sine;
    const ry = x * sine + y * cosine;
    return { x: center.x + rx + shear * ry + drift, y: center.y + ry * pitch - hover };
  });
}

/** Weicher, von der schwebenden Öffnung getrennter Schlagschatten auf dem Meer.
 * Die Distanz zwischen Objekt und Schatten macht die räumliche Höhe lesbar. */
function drawHoverShadow(ctx, anchored, hovering, opening) {
  if (opening < .025) return;

  const progress = ease(opening);
  const surface = {
    x: anchored.reduce((sum, point) => sum + point.x, 0) / 3,
    y: anchored.reduce((sum, point) => sum + point.y, 0) / 3,
  };
  const airborne = {
    x: hovering.reduce((sum, point) => sum + point.x, 0) / 3,
    y: hovering.reduce((sum, point) => sum + point.y, 0) / 3,
  };

  // Perspektivische Projektion auf die Wasseroberfläche: Rotation, seitlicher Drift
  // und langsames Schweben stammen unmittelbar aus der aktuellen Torgeometrie.
  const lift = ease(opening * 1.45);
  const shadowCenter = {
    x: airborne.x,
    y: surface.y + 24 + (airborne.y - surface.y + lift * 20) * .42,
  };
  const footprint = hovering.map(point => ({
    x: shadowCenter.x + (point.x - airborne.x) * .98,
    y: shadowCenter.y + (point.y - airborne.y) * .48,
  }));
  const span = Math.max(12, Math.max(...footprint.map(point => point.x))
    - Math.min(...footprint.map(point => point.x)));

  ctx.save();
  // Breiter, sehr weicher Lichtentzug statt einer harten schwarzen Dreiecksfläche.
  const wash = ctx.createRadialGradient(shadowCenter.x, shadowCenter.y, span * .05,
    shadowCenter.x, shadowCenter.y, span * .67);
  wash.addColorStop(0, `rgba(3,2,5,${.31 * progress})`);
  wash.addColorStop(.42, `rgba(3,2,5,${.19 * progress})`);
  wash.addColorStop(1, 'rgba(3,2,5,0)');
  ctx.translate(shadowCenter.x, shadowCenter.y);
  ctx.scale(1, .52);
  ctx.translate(-shadowCenter.x, -shadowCenter.y);
  ctx.fillStyle = wash;
  ctx.beginPath();
  ctx.arc(shadowCenter.x, shadowCenter.y, span * .67, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Auch der dreieckige Kern folgt der geneigten Portalform, bleibt aber diffus.
  ctx.save();
  ctx.filter = `blur(${Math.max(10, span * .035)}px)`;
  ctx.globalAlpha = .27 * progress;
  ctx.fillStyle = '#050308';
  traceFracture(ctx, footprint, 0, .06);
  ctx.fill();
  ctx.restore();
}

/** Unregelmäßige elektrische Entladungen springen nur über kurze Teile der Kanten.
 * Keine Zufallswerte pro Frame, damit die Lichtblitze nicht als Pixelrauschen wirken. */
function drawElectricArcs(ctx, points, time, intensity, reducedMotion) {
  if (intensity <= .01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  for (let branch = 0; branch < 11; branch += 1) {
    const side = branch % 3;
    const start = points[side];
    const end = points[(side + 1) % 3];
    const trigger = reducedMotion ? .66 : Math.sin(time * (7.1 + branch * .6) + branch * 4.3);
    if (trigger < .24) continue;
    const startAt = .07 + ((branch * .227) % .7);
    const length = .085 + ((branch * .071) % .17);
    const pulse = intensity * clamp01((trigger - .24) / .76);
    ctx.shadowBlur = 8 + 17 * pulse;
    ctx.shadowColor = '#ff8e4c';
    ctx.strokeStyle = `rgba(255,${175 + branch % 4 * 14},${102 + branch % 3 * 22},${.42 * pulse})`;
    ctx.lineWidth = .55 + 1.1 * pulse;
    ctx.beginPath();
    for (let step = 0; step <= 8; step += 1) {
      const at = startAt + length * step / 8;
      const offset = reducedMotion ? 0 : Math.sin(step * 3.4 + branch * 6.8 + time * 11) * (2.5 + 6 * intensity);
      const x = start.x + (end.x - start.x) * at + (end.y - start.y) * offset / Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
      const y = start.y + (end.y - start.y) * at - (end.x - start.x) * offset / Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
      if (!step) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Kurze seitliche Entladungen geben dem Portal ein eigenständiges elektrisches Flimmern. */
function drawCoronalSparks(ctx, points, time, strength, reducedMotion) {
  if (strength < .02 || reducedMotion) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  const center = {
    x: points.reduce((sum, p) => sum + p.x, 0) / 3,
    y: points.reduce((sum, p) => sum + p.y, 0) / 3,
  };
  for (let i = 0; i < 15; i += 1) {
    const edge = i % 3;
    const a = points[edge];
    const b = points[(edge + 1) % 3];
    const phase = Math.sin(time * (5.7 + (i % 4) * .72) + i * 2.37);
    if (phase < .52) continue;
    const at = .08 + ((i * .183) % .82);
    const x = a.x + (b.x - a.x) * at;
    const y = a.y + (b.y - a.y) * at;
    const dx = x - center.x;
    const dy = y - center.y;
    const distance = Math.hypot(dx, dy) || 1;
    const size = (5 + i % 4 * 2.7) * clamp01((phase - .52) / .48) * strength;
    ctx.shadowColor = '#ffb47a';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = `rgba(255,214,162,${.42 * strength})`;
    ctx.lineWidth = .9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx / distance * size, y + dy / distance * size);
    ctx.stroke();
  }
  ctx.restore();
}

/** Zeichnet drei anfangs einzeln sichtbare Relaispunkte. */
function drawRelays(ctx, points, time, strength) {
  points.forEach(({ x, y }, index) => {
    const pulse = .66 + .23 * Math.sin(time * (2.4 + index * .37) - index * 1.7)
      + .11 * Math.sin(time * (8.1 + index * .81) + index);
    const radius = 1.8 + 2.5 * strength * Math.max(.16, pulse);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 24 + 10 * strength);
    glow.addColorStop(0, `rgba(255,225,165,${.42 * strength})`);
    glow.addColorStop(.12, `rgba(251,140,60,${.55 * strength})`);
    glow.addColorStop(1, 'rgba(203,49,12,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 38, y - 38, 76, 76);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,226,165,${strength})`;
    ctx.fill();
  });
}

/** Einmalig erzeugte, geräuscharme Wolkentexturen für den Riss.
 * Die Texturen werden nicht pro Frame neu berechnet; im Frame selbst bewegen sich
 * nur wenige Canvas-Layer. Dadurch bleiben die zusätzlichen Nebelbänke günstig. */
let portalCloudTextures;

/** Deterministische Rauschfunktion ohne globale Zufallszustände. */
function cloudHash(x, y, seed) {
  let value = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

/** Sanft interpoliertes 2D-Rauschen für zusammenhängende Wolkenformationen. */
function cloudNoise(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const u = x - ix;
  const v = y - iy;
  const sx = u * u * (3 - 2 * u);
  const sy = v * v * (3 - 2 * v);
  const a = cloudHash(ix, iy, seed);
  const b = cloudHash(ix + 1, iy, seed);
  const c = cloudHash(ix, iy + 1, seed);
  const d = cloudHash(ix + 1, iy + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + ((a - b - c + d) * sx * sy);
}

/** Erstellt einen alpha-transparenten Nebellayer mit organischen Verwirbelungen.
 * @param {number} seed - Unterschiedliche, aber reproduzierbare Wolkenmuster.
 * @param {'smoke'|'ember'} kind - Dunkle Masse oder schwache warme Hinterleuchtung.
 * @returns {HTMLCanvasElement}
 */
function createPortalCloudTexture(seed, kind) {
  const texture = document.createElement('canvas');
  texture.width = 320;
  texture.height = 224;
  const context = texture.getContext('2d');
  if (!context) return texture;

  const image = context.createImageData(texture.width, texture.height);
  const pixels = image.data;
  for (let y = 0; y < texture.height; y += 1) {
    for (let x = 0; x < texture.width; x += 1) {
      const warpX = (cloudNoise(x / 83, y / 77, seed + 6) - .5) * 46;
      const warpY = (cloudNoise(x / 89, y / 69, seed + 11) - .5) * 40;
      const nx = x + warpX;
      const ny = y + warpY;
      const broad = cloudNoise(nx / 86, ny / 74, seed);
      const detail = cloudNoise(nx / 37, ny / 33, seed + 2);
      const fine = cloudNoise(nx / 15, ny / 16, seed + 4);
      const density = clamp01(.46 + (broad * .53 + detail * .34 + fine * .13 - .5) * 2.55);
      const softness = density * density * (3 - 2 * density);
      const edgeFade = Math.min(1, x / 26, (texture.width - 1 - x) / 26,
        y / 20, (texture.height - 1 - y) / 20);
      const alpha = Math.round(255 * (.12 + .88 * softness) * Math.max(0, edgeFade)
        * (kind === 'smoke' ? .84 : 1));
      const at = (y * texture.width + x) * 4;
      if (kind === 'smoke') {
        const shade = Math.round(10 + 20 * (1 - density) + 12 * detail);
        pixels[at] = shade;
        pixels[at + 1] = Math.round(shade * .35);
        pixels[at + 2] = Math.round(shade * .43);
      } else {
        pixels[at] = Math.round(94 + 160 * density);
        pixels[at + 1] = Math.round(33 + 82 * density);
        pixels[at + 2] = Math.round(17 + 48 * density);
      }
      pixels[at + 3] = alpha;
    }
  }
  context.putImageData(image, 0, 0);
  return texture;
}

/** Zusammenhängender, stark kontrastierender Gewitterhimmel.
 * Eine prozedural gerasterte, vollflächige Wolkenkarte verhindert, dass die
 * transparente Wolkenlagen im sehr dunklen Portal wieder verschwinden. */
function createPortalStormBackdrop(seed) {
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 264;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const image = context.createImageData(canvas.width, canvas.height);
  const data = image.data;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const warpX = (cloudNoise(x / 117, y / 88, seed + 3) - .5) * 53;
      const warpY = (cloudNoise(x / 94, y / 112, seed + 5) - .5) * 44;
      const u = x + warpX;
      const v = y + warpY;
      const mass = cloudNoise(u / 76, v / 57, seed) * .47
        + cloudNoise(u / 31, v / 28, seed + 8) * .31
        + cloudNoise(u / 13, v / 14, seed + 12) * .16
        + cloudNoise(u / 5, v / 7, seed + 18) * .06;
      const folds = Math.sin(v * .052 + mass * 9.5 + u * .011) * .145;
      // Das Fremdlicht zeichnet nur einzelne Wolkenfalten nach. Der Hintergrund
      // bleibt größtenteils schwarz statt flächig in Orange aufzuhellen.
      const bright = clamp01((.625 - mass + folds) * 5.0);
      const flare = Math.pow(bright, 2.15);
      const shadow = clamp01((mass - .51) * 3.4);
      const at = (y * canvas.width + x) * 4;
      data[at] = Math.round(6 + flare * 134 - shadow * 3);
      data[at + 1] = Math.round(3 + flare * 45 - shadow);
      data[at + 2] = Math.round(6 + flare * 19);
      data[at + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

/** Erzeugt eine dunkle, nahezu deckende Wolkenmaske mit unregelmäßigen Sichtfenstern.
 * Zwei unabhängige Masken ziehen später gegeneinander und verbergen den größten
 * Teil der Hintergrundillustration, ohne sie selbst zu skalieren. */
function createPortalVeilTexture(seed) {
  const texture = document.createElement('canvas');
  texture.width = 384;
  texture.height = 216;
  const context = texture.getContext('2d');
  if (!context) return texture;

  const image = context.createImageData(texture.width, texture.height);
  const pixels = image.data;
  for (let y = 0; y < texture.height; y += 1) {
    for (let x = 0; x < texture.width; x += 1) {
      const warpX = (cloudNoise(x / 85, y / 65, seed + 4) - .5) * 59;
      const warpY = (cloudNoise(x / 102, y / 81, seed + 9) - .5) * 38;
      const u = x + warpX;
      const v = y + warpY;
      const mass = cloudNoise(u / 77, v / 59, seed) * .55
        + cloudNoise(u / 32, v / 28, seed + 13) * .33
        + cloudNoise(u / 13, v / 14, seed + 21) * .12;
      const folds = .065 * Math.sin(v * .034 + u * .013 + mass * 10);
      const density = ease((mass + folds - .35) * 5.3);
      const edgeFade = clamp01(Math.min(x / 29, (texture.width - 1 - x) / 29,
        y / 23, (texture.height - 1 - y) / 23));
      const at = (y * texture.width + x) * 4;
      pixels[at] = Math.round(5 + 18 * (1 - density));
      pixels[at + 1] = Math.round(3 + 7 * (1 - density));
      pixels[at + 2] = Math.round(7 + 7 * (1 - density));
      pixels[at + 3] = Math.round(255 * density * edgeFade);
    }
  }
  context.putImageData(image, 0, 0);
  return texture;
}

/** Große, aus dem Riss heraus beleuchtete Sturmfront.
 * Wolkenlicht und dunkle Wolkenkörper sind voneinander getrennt. Dadurch können
 * die Figuren schwarz bleiben und werden nur bei Lichtdurchbrüchen lesbar. */
function drawPortalClouds(ctx, center, radius, time, opening, reducedMotion) {
  const intensity = ease((opening - .13) / .62);
  portalCloudTextures ??= {
    smoke: createPortalCloudTexture(31, 'smoke'),
    ember: createPortalCloudTexture(73, 'ember'),
    emberDetail: createPortalCloudTexture(119, 'ember'),
    stormBack: createPortalStormBackdrop(23),
    stormFront: createPortalStormBackdrop(61),
    veilNear: createPortalVeilTexture(17),
    veilFar: createPortalVeilTexture(83),
  };
  if (intensity <= 0) return;
  const t = reducedMotion ? 0 : time;
  const horizontalDrift = Math.sin(t * .105) * radius * .065;
  const depthDrift = Math.sin(t * .14 + 1.4) * radius * .035;

  ctx.save();
  // Vollflächiger Turbulenz-Hintergrund: harte, dunkle Wolkenmasse wechselt mit
  // glühenden Schneisen. Die asymmetrische Bewegung ist deutlich langsamer als die Blitze.
  ctx.globalAlpha = .29 * intensity;
  ctx.drawImage(portalCloudTextures.stormBack,
    center.x - radius * 1.03 + horizontalDrift * .52,
    center.y - radius * .68 + depthDrift * .6,
    radius * 2.06, radius * 1.42);
  ctx.globalAlpha = .16 * intensity;
  ctx.drawImage(portalCloudTextures.stormFront,
    center.x - radius * .98 - horizontalDrift * .28,
    center.y - radius * .54 - depthDrift * .34,
    radius * 1.96, radius * 1.29);
  ctx.globalAlpha = 1;
  // Der warme Kern wird großflächig von Sturmwolken verdeckt, statt bloß einen
  // kleinen, dunklen Mittelpunkt zu beleuchten.
  const core = ctx.createRadialGradient(
    center.x + radius * .03, center.y + radius * .025, radius * .015,
    center.x + radius * .03, center.y + radius * .025, radius * .95);
  core.addColorStop(0, `rgba(188,63,31,${.09 * intensity})`);
  core.addColorStop(.3, `rgba(119,39,23,${.07 * intensity})`);
  core.addColorStop(.64, `rgba(65,16,17,${.045 * intensity})`);
  core.addColorStop(1, 'rgba(18,3,9,0)');
  ctx.fillStyle = core;
  ctx.fillRect(center.x - radius * 1.15, center.y - radius * .85,
    radius * 2.3, radius * 1.7);

  // Wenige asynchrone Glutadern statt flächig orangefarbener Wolkenbänke.
  // Die vorab gerasterten, organischen Texturen bewegen sich ohne teure Bildfilter.
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = .115 * intensity;
  ctx.drawImage(portalCloudTextures.ember,
    center.x - radius * 1.02 + horizontalDrift,
    center.y - radius * .74 + depthDrift,
    radius * 2.04, radius * 1.19);
  ctx.globalAlpha = .075 * intensity;
  ctx.drawImage(portalCloudTextures.emberDetail,
    center.x - radius * .91 - horizontalDrift * .72,
    center.y - radius * .38 - depthDrift,
    radius * 1.92, radius * .96);
  ctx.restore();
}

/** Dunkle, ungleichmäßig geschichtete Gewitterzellen gegen das orange Gegenlicht.
 * Große, transparente Zwischenräume lassen genügend Licht für schwarze Figuren. */
function drawPortalStormCells(ctx, center, radius, time, opening, reducedMotion) {
  const intensity = ease((opening - .21) / .56);
  if (intensity <= 0) return;

  const cells = [
    [-.71, -.35, .43, .23, .4], [-.32, -.34, .32, .20, 2.7],
    [.14, -.36, .40, .23, 1.2], [.60, -.27, .35, .25, 3.3],
    [-.72, -.02, .31, .22, 4.3], [-.23, -.015, .25, .18, 3.7],
    [.46, .045, .35, .21, 5.7], [-.53, .29, .39, .22, 1.9],
    [.02, .32, .31, .20, 3.9], [.51, .30, .34, .23, 5.2],
  ];
  ctx.save();
  for (const [index, cell] of cells.entries()) {
    const [cx, cy, wide, tall, seed] = cell;
    const drift = reducedMotion ? 0 : Math.sin(time * (.09 + index * .007) + seed) * radius * .028;
    const rise = reducedMotion ? 0 : Math.sin(time * .12 + seed * 2.1) * radius * .014;
    const x = center.x + radius * cx + drift;
    const y = center.y + radius * cy + rise;
    const gradient = ctx.createRadialGradient(0, 0, .06, 0, 0, 1);
    gradient.addColorStop(0, `rgba(4,2,6,${.48 * intensity})`);
    gradient.addColorStop(.52, `rgba(17,5,10,${.46 * intensity})`);
    gradient.addColorStop(.79, `rgba(56,13,12,${.27 * intensity})`);
    gradient.addColorStop(1, 'rgba(45,10,9,0)');
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(seed * 2.5) * .2);
    ctx.scale(radius * wide, radius * tall);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/** Lässt nach dem ersten Sichtfenster neue Wolkenfronten unregelmäßig aufziehen.
 * Überlagerte langsame Wellen vermeiden einen gleichmäßig wiederkehrenden Puls. */
function getPortalCloudConcealment(time, reveal, reducedMotion) {
  if (reducedMotion) return 1 - reveal * .8;
  const afterReveal = Math.max(0, time - PORTAL_REVEAL_END_MS / 1000 - 1.5);
  const weather = clamp01(.5 + .30 * Math.sin(afterReveal * .21 + .5)
    + .20 * Math.sin(afterReveal * .37 + 1.4));
  const returningClouds = ease(afterReveal / 7) * (.16 + .60 * weather);
  return 1 - reveal + reveal * (.12 + returningClouds);
}

/** Eine geschlossene Sturmdecke verbirgt das Motiv während der gesamten Öffnung.
 * Nach einer kurzen Lichtung verdichten sich die gegenläufigen Wolken erneut. */
function drawPortalForegroundFog(ctx, center, radius, time, opening, reducedMotion, reveal) {
  if (opening <= 0 || !portalCloudTextures) return;
  const conceal = getPortalCloudConcealment(time, reveal, reducedMotion);
  const t = reducedMotion ? 0 : time;
  const nearDrift = Math.sin(t * .38 + .5) * radius * .29;
  const farDrift = -Math.sin(t * .31 + 1.7) * radius * .36;
  const nearRise = Math.sin(t * .17) * radius * .045;
  const farRise = Math.sin(t * .14 + 2.2) * radius * .065;

  ctx.save();
  // Flächige Tiefe schließt die Lücken der Wolkenmasken, solange das Tor wächst.
  ctx.fillStyle = `rgba(6, 3, 8, ${.97 * conceal})`;
  ctx.fillRect(center.x - radius * 1.8, center.y - radius * 1.2,
    radius * 3.6, radius * 2.4);
  ctx.globalAlpha = .78 * conceal;
  ctx.drawImage(portalCloudTextures.stormFront,
    center.x - radius * 1.5 + farDrift * .25,
    center.y - radius * .9 + farRise,
    radius * 3, radius * 1.8);
  ctx.globalAlpha = .22 + .74 * conceal;
  ctx.drawImage(portalCloudTextures.veilFar,
    center.x - radius * 1.43 + farDrift,
    center.y - radius * .79 + farRise,
    radius * 2.86, radius * 1.66);
  ctx.globalAlpha = .25 + .73 * conceal;
  ctx.drawImage(portalCloudTextures.veilNear,
    center.x - radius * 1.37 + nearDrift,
    center.y - radius * .73 + nearRise,
    radius * 2.74, radius * 1.58);

  // Tiefer Bodennebel hält die untere Öffnung diffus, ohne die Wolkenmasken aufzuhellen.
  ctx.globalAlpha = .14 + .48 * conceal;
  ctx.drawImage(portalCloudTextures.smoke,
    center.x - radius * .95 - nearDrift * .18,
    center.y + radius * .1,
    radius * 1.9, radius * .63);
  ctx.restore();
}

/** Interne elektrische Verästelungen leuchten hinter dem dunklen Rauch und den Wesen auf.
 * Seltene, asynchrone Zuckungen statt permanenter Blitze. */
function drawPortalLightning(ctx, center, radius, time, opening, reducedMotion) {
  if (reducedMotion || opening < .32) return;
  const intensity = ease((opening - .32) / .42);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let bolt = 0; bolt < 4; bolt += 1) {
    const flicker = Math.sin(time * (1.13 + bolt * .21) + bolt * 3.87)
      + .24 * Math.sin(time * (7.1 + bolt * .9) + bolt * 1.6);
    if (flicker < .86) continue;
    const flash = intensity * clamp01((flicker - .86) / .38);
    const startX = center.x + radius * (-.38 + bolt * .24);
    const startY = center.y - radius * (.26 + (bolt % 2) * .17);
    const endX = center.x + radius * (-.12 + bolt * .15);
    const endY = center.y + radius * (.15 + (bolt % 3) * .09);
    const seed = Math.floor(time * 7) + bolt * 19;
    ctx.beginPath();
    for (let step = 0; step <= 12; step += 1) {
      const progress = step / 12;
      const jitter = (cloudHash(step, seed, bolt + 137) - .5) * radius * .055
        * Math.sin(Math.PI * progress);
      const x = startX + (endX - startX) * progress + jitter;
      const y = startY + (endY - startY) * progress;
      if (step === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.shadowColor = '#e15e30';
    ctx.shadowBlur = 19;
    ctx.lineWidth = 4.7;
    ctx.strokeStyle = `rgba(242,83,38,${flash * .37})`;
    ctx.stroke();
    ctx.shadowBlur = 9;
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = `rgba(255,179,113,${flash * .8})`;
    ctx.stroke();
  }
  ctx.restore();
}

/** Wiederverwendete Zeichenfläche für dieselben beweglichen Ebenen wie im Abschluss. */
function getDistantPortalBackdrop(time, reducedMotion) {
  prepareDimension();
  if (!distantPortalBackdrop) {
    distantPortalBackdrop = document.createElement('canvas');
    distantPortalBackdrop.width = 1280;
    distantPortalBackdrop.height = 720;
  }
  const ctx = distantPortalBackdrop.getContext('2d');
  if (ctx) drawDimension(ctx, 1280, 720, reducedMotion ? 0 : time);
  return distantPortalBackdrop;
}

/** Platziert die Illustration in einem weltfesten Ausschnitt hinter dem Tor.
 * Die wachsende Dreiecksmaske enthüllt mehr vom Bild, ohne dessen Größe oder
 * räumliche Entfernung zu verändern. Auch die Schwebebewegung zoomt das Bild nicht. */
function drawPortalBackdrop(ctx, frame, time, opening, reducedMotion) {

  const destWidth = frame.width;
  const destHeight = frame.height;
  const destX = frame.x - destWidth / 2;
  const destY = frame.y - destHeight / 2;

  // Cover ohne Stretching; der obere Bildteil mit den Nabelschnüren bleibt erhalten.
  const backdrop = getDistantPortalBackdrop(time, reducedMotion);
  const sourceWidth = backdrop.naturalWidth || backdrop.width;
  const sourceHeight = backdrop.naturalHeight || backdrop.height;
  const sourceAspect = destWidth / destHeight;
  let cropX = 0;
  let cropY = 0;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  if (sourceWidth / sourceHeight < sourceAspect) {
    cropHeight = sourceWidth / sourceAspect;
    cropY = (sourceHeight - cropHeight) * .37;
  } else {
    cropWidth = sourceHeight * sourceAspect;
    cropX = (sourceWidth - cropWidth) / 2;
  }

  ctx.save();
  // Kleines unabhängiges Schaukeln im festen Bildraum, ohne Öffnungszoom.
  const sway = reducedMotion ? 0 : Math.sin(time * .19 + .8) * .012;
  const driftX = reducedMotion ? 0 : Math.sin(time * .16) * destWidth * .008;
  const driftY = reducedMotion ? 0 : Math.sin(time * .22 + 1.2) * destHeight * .012;
  ctx.translate(frame.x + driftX, frame.y + driftY);
  ctx.rotate(sway);
  ctx.translate(-frame.x, -frame.y);
  ctx.globalAlpha = ease(opening * 2.2);
  ctx.drawImage(backdrop, cropX, cropY, cropWidth, cropHeight,
    destX, destY, destWidth, destHeight);
  ctx.fillStyle = 'rgba(5, 2, 5, .06)';
  ctx.fillRect(destX, destY, destWidth, destHeight);
  ctx.restore();
}

/** Zeichnet den Öffnungskörper nur innerhalb der verbundenen Peilpunkte. */
function drawAperture(ctx, points, backdropFrame, time, opening, reducedMotion, reveal) {
  if (opening <= 0) return;

  const center = {
    x: points.reduce((sum, point) => sum + point.x, 0) / 3,
    y: points.reduce((sum, point) => sum + point.y, 0) / 3,
  };
  const radius = Math.hypot(points[0].x - center.x, points[0].y - center.y) * 1.7;
  const extent = Math.max(.04, opening * (1 + .004 * Math.sin(time * .42)));

  const expanded = expandTriangle(points, extent);
  ctx.save();
  traceFracture(ctx, expanded, time, opening);
  ctx.clip();

  // Schwarze Grundtiefe verhindert ein auffälliges Leerbild, solange die Illustration lädt.
  ctx.fillStyle = `rgba(6, 3, 7, ${Math.min(1, opening * 2.2)})`;
  ctx.fillRect(center.x - radius, center.y - radius, radius * 2, radius * 2);

  // Das erste Motiv liefert korrekt proportionierte Silhouetten und Nabelschnüre.
  // Der Bestand an prozeduralen Wolken wandert davor, nicht mehr hinter separaten Figuren.
  drawPortalBackdrop(ctx, backdropFrame, time, opening, reducedMotion);
  drawPortalClouds(ctx, center, radius, time, opening, reducedMotion);
  drawPortalStormCells(ctx, center, radius, time, opening, reducedMotion);

  // Gebrochene, wandernde Schichtungen in der Öffnung – kein fertiges Stockvideo.
  ctx.globalCompositeOperation = 'screen';
  for (let line = 0; line < 28; line += 1) {
    const y = center.y - radius * .9 + line * radius * 1.8 / 28;
    const drift = Math.sin(time * (.26 + line * .006) + line * 1.76) * (11 + 14 * opening);
    const grad = ctx.createLinearGradient(center.x - radius, y, center.x + radius, y);
    grad.addColorStop(0, 'rgba(241,72,24,0)');
    grad.addColorStop(.3, `rgba(236,74,34,${.006 + .02 * opening})`);
    grad.addColorStop(.7, `rgba(254,141,69,${.02 + .045 * opening})`);
    grad.addColorStop(1, 'rgba(241,72,24,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = .7 + (line % 4) * .3;
    ctx.beginPath();
    ctx.moveTo(center.x - radius + drift, y);
    ctx.bezierCurveTo(center.x - radius / 3, y + 5 * Math.sin(time + line), center.x + radius / 3, y - 5 * Math.sin(time + line), center.x + radius + drift, y);
    ctx.stroke();
  }
  drawPortalLightning(ctx, center, radius, time, opening, reducedMotion);

  // Der schwere Vordergrundnebel verschluckt große Teile des Hintergrundmotivs;
  // Köpfe und Körper werden nicht mehr als separate Canvas-Primitive aufgesetzt.
  ctx.globalCompositeOperation = 'source-over';
  drawPortalForegroundFog(ctx, center, radius, time, opening, reducedMotion, reveal);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  traceFracture(ctx, expanded, time, opening);
  ctx.shadowColor = '#f04f15';
  const edgeScale = Math.max(.32, Math.min(1.15, radius / 620));
  ctx.filter = `blur(${1.8 * edgeScale}px)`;
  ctx.shadowBlur = (15 + 9 * opening) * edgeScale;
  ctx.strokeStyle = `rgba(209,51,14,${.28 * opening})`;
  ctx.lineWidth = (7 + opening * 4) * edgeScale;
  ctx.stroke();
  ctx.shadowBlur = 9 * edgeScale;
  ctx.strokeStyle = `rgba(252,112,36,${.38 * opening})`;
  ctx.lineWidth = (2.4 + opening * 1.2) * edgeScale;
  ctx.stroke();
  ctx.filter = `blur(${.65 * edgeScale}px)`;
  ctx.shadowBlur = 4 * edgeScale;
  ctx.strokeStyle = `rgba(255,207,127,${.29 * opening})`;
  ctx.lineWidth = .85 * edgeScale;
  ctx.stroke();
  ctx.restore();
}

/**
 * Aktualisiert den transparenten Zeichenlayer anhand einer externen Story-Uhr.
 * @param {HTMLCanvasElement} canvas - In CAM 02 verankerte transparente Ebene.
 * @param {number} elapsedMs - Aktive Zeit seit dem jeweiligen Finalstart.
 * @param {'breach'|'isolate'} mode - Gewählte Finalsequenz.
 * @param {boolean} reducedMotion - Reduzierte Bewegung respektieren.
 */
export function drawGate(canvas, elapsedMs, mode, reducedMotion = false) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width < 2 || height < 2) return;

  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const time = elapsedMs / 1000;
  const points = [
    { x: width * .23, y: height * .41 },
    { x: width * .69, y: height * .36 },
    { x: width * .47, y: height * .61 },
  ];
  const approach = ease((time - 1.2) / 2.8);

  if (mode === 'isolate') {
    const fade = 1 - ease((time - .9) / 4.7);
    if (fade > 0) drawRelays(ctx, points, reducedMotion ? 0 : time, fade * .6);
    return;
  }

  if (time < 1.2) return;

  const baseLink = ease((time - 2.2) / 3.6);
  const link = reducedMotion ? baseLink : clamp01(baseLink +
    Math.sin(time * 8.3) * .025 * Math.sin(Math.PI * baseLink));
  const baseOpening = ease((time - 6.0) / 6.8);
  const opening = reducedMotion ? baseOpening : clamp01(baseOpening +
    (.033 * Math.sin(time * 4.7) + .013 * Math.sin(time * 13.1)) * Math.sin(Math.PI * baseOpening));
  const t = reducedMotion ? 0 : time;
  const anchoredTriangle = expandTriangle(points, 1 + .52 * opening);
  const hoveringTriangle = levitateTriangle(anchoredTriangle, t, opening, reducedMotion);
  const electricPulse = reducedMotion ? 1 : .82 + .14 * Math.sin(t * 5.3) + .04 * Math.sin(t * 17.8);

  // Der Schatten liegt unter dem Objekt, nicht im rot leuchtenden Riss.
  drawHoverShadow(ctx, anchoredTriangle, hoveringTriangle, opening);
  drawRelays(ctx, link > 0 ? hoveringTriangle : points, t, (.25 + approach * .75) * electricPulse);

  if (link > 0) {
    // Peillinien bauen sich nacheinander auf, schlagen aber nicht im selben Takt aus.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowBlur = 17 + 8 * Math.max(0, Math.sin(t * 5.1));
    ctx.shadowColor = '#f96a25';
    for (let side = 0; side < 3; side += 1) {
      const from = hoveringTriangle[side];
      const to = hoveringTriangle[(side + 1) % 3];
      const portion = clamp01(link * 3 - side);
      if (portion <= 0) continue;
      const jitter = reducedMotion ? 1 : .84 + .11 * Math.sin(t * (4.7 + side) + side * 3.1)
        + .05 * Math.sin(t * 15.5 - side);
      ctx.strokeStyle = `rgba(248,105,37,${(.14 + .3 * portion) * jitter * (1 - .7 * opening)})`;
      ctx.lineWidth = (1.4 + opening * 1.2) * jitter;
      ctx.beginPath();
      const dx = (to.x - from.x) * portion;
      const dy = (to.y - from.y) * portion;
      const length = Math.hypot(dx, dy) || 1;
      for (let piece = 0; piece <= 12; piece += 1) {
        const at = piece / 12;
        const displacement = reducedMotion ? 0 : Math.sin(piece * 4.8 + t * 9 + side * 1.7)
          * Math.sin(Math.PI * at) * (1.7 + opening * 2.6);
        const x = from.x + dx * at - dy / length * displacement;
        const y = from.y + dy * at + dx / length * displacement;
        if (!piece) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    drawElectricArcs(ctx, hoveringTriangle, t, link * (.4 + .6 * opening), reducedMotion);
  }

  // Feste Weltkoordinaten: Nur die sichtbare Portalmaske wächst, nicht das Bild dahinter.
  const fullSizeTriangle = expandTriangle(points, 1.52);
  const backdropFrame = {
    x: points.reduce((sum, point) => sum + point.x, 0) / 3,
    y: points.reduce((sum, point) => sum + point.y, 0) / 3 - 20,
    width: (Math.max(...fullSizeTriangle.map(point => point.x))
      - Math.min(...fullSizeTriangle.map(point => point.x))) * 1.06,
    height: (Math.max(...fullSizeTriangle.map(point => point.y))
      - Math.min(...fullSizeTriangle.map(point => point.y))) * 1.26,
  };
  // Die Enthüllung folgt auch bei reduzierter Bewegung der aktiven Story-Uhr.
  const reveal = ease((time - PORTAL_REVEAL_START_SECONDS) / PORTAL_REVEAL_DURATION_SECONDS);
  drawAperture(ctx, hoveringTriangle, backdropFrame, t, opening, reducedMotion, reveal);
  drawCoronalSparks(ctx, hoveringTriangle, t, opening, reducedMotion);

  // Reflexe auf der unbewegten Brandung lassen den Riss räumlich im Meer sitzen.
  if (opening > .01) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 12; i += 1) {
      const y = height * (.62 + i * .027);
      const span = width * (.17 + Math.sin(i * 1.23 + t * .17) * .055) * opening;
      const x = width * .46 + Math.sin(i * 2.7 + t * .7) * width * .025;
      const g = ctx.createLinearGradient(x - span / 2, y, x + span / 2, y);
      g.addColorStop(0, 'rgba(246,77,18,0)');
      g.addColorStop(.5, `rgba(255,109,31,${(.05 + .075 * (i % 3)) * opening})`);
      g.addColorStop(1, 'rgba(246,77,18,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1 + (i % 3) * 1.1;
      ctx.beginPath();
      ctx.moveTo(x - span / 2, y);
      ctx.lineTo(x + span / 2, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}
