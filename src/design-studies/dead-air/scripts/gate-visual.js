/**
 * @file Prozeduraler Dimensionsriss für das DEAD//AIR-Finale.
 * @description Zeichnet die Dreiecksöffnung über einem eingefrorenen Küstenframe.
 *              Keine Assets, DOM-Manipulation oder eigenständigen Animationstimer.
 * @author Benjamin Bennewitz
 */

/** Begrenzung für die Pixeldichte der transparenten Effektebene. */
const MAX_DPR = 1.5;

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

/** Zeichnet drei anfangs einzeln sichtbare Relaispunkte. */
function drawRelays(ctx, points, time, strength) {
  points.forEach(({ x, y }, index) => {
    const pulse = 0.68 + 0.32 * Math.sin(time * 2.1 - index * 1.7);
    const radius = 1.8 + 2.5 * strength * pulse;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 24 + 10 * strength);
    glow.addColorStop(0, `rgba(255,225,165,${.75 * strength})`);
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

/** Zeichnet den Öffnungskörper nur innerhalb der verbundenen Peilpunkte. */
function drawAperture(ctx, points, time, opening) {
  if (opening <= 0) return;

  const center = {
    x: points.reduce((sum, point) => sum + point.x, 0) / 3,
    y: points.reduce((sum, point) => sum + point.y, 0) / 3,
  };
  const radius = Math.hypot(points[0].x - center.x, points[0].y - center.y) * 1.7;
  const extent = Math.max(.04, opening);

  const expanded = expandTriangle(points, extent);
  ctx.save();
  traceFracture(ctx, expanded, time, opening);
  ctx.clip();

  // Dunkler Hohlraum statt eines gleichmäßig leuchtenden grafischen Dreiecks.
  const abyss = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
  abyss.addColorStop(0, `rgba(0,1,4,${.97 * opening})`);
  abyss.addColorStop(.4, `rgba(12,2,7,${.96 * opening})`);
  abyss.addColorStop(.7, `rgba(68,10,8,${.84 * opening})`);
  abyss.addColorStop(1, `rgba(239,84,22,${.85 * opening})`);
  ctx.fillStyle = abyss;
  ctx.fillRect(center.x - radius, center.y - radius, radius * 2, radius * 2);

  // Gebrochene, wandernde Schichtungen in der Öffnung – kein fertiges Stockvideo.
  ctx.globalCompositeOperation = 'screen';
  for (let line = 0; line < 28; line += 1) {
    const y = center.y - radius * .9 + line * radius * 1.8 / 28;
    const drift = Math.sin(time * (.26 + line * .006) + line * 1.76) * (11 + 14 * opening);
    const grad = ctx.createLinearGradient(center.x - radius, y, center.x + radius, y);
    grad.addColorStop(0, 'rgba(241,72,24,0)');
    grad.addColorStop(.3, `rgba(236,74,34,${.015 + .05 * opening})`);
    grad.addColorStop(.7, `rgba(254,141,69,${.05 + .10 * opening})`);
    grad.addColorStop(1, 'rgba(241,72,24,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = .7 + (line % 4) * .3;
    ctx.beginPath();
    ctx.moveTo(center.x - radius + drift, y);
    ctx.bezierCurveTo(center.x - radius / 3, y + 5 * Math.sin(time + line), center.x + radius / 3, y - 5 * Math.sin(time + line), center.x + radius + drift, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  traceFracture(ctx, expanded, time, opening);
  ctx.shadowColor = '#f04f15';
  ctx.shadowBlur = 31 + 22 * opening;
  ctx.strokeStyle = `rgba(209,51,14,${.8 * opening})`;
  ctx.lineWidth = 11 + opening * 7;
  ctx.stroke();
  ctx.shadowBlur = 16;
  ctx.strokeStyle = `rgba(252,112,36,${.77 * opening})`;
  ctx.lineWidth = 4.2 + opening * 1.8;
  ctx.stroke();
  ctx.shadowBlur = 5;
  ctx.strokeStyle = `rgba(255,207,127,${.69 * opening})`;
  ctx.lineWidth = 1.25;
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

  const link = ease((time - 2.2) / 3.6);
  const opening = ease((time - 6.0) / 6.8);
  const t = reducedMotion ? 0 : time;

  drawRelays(ctx, points, t, .25 + approach * .75);

  if (link > 0) {
    // Die drei Relais werden nacheinander zu einer einzigen Geometrie verbunden.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowBlur = 17;
    ctx.shadowColor = '#f96a25';
    for (let side = 0; side < 3; side += 1) {
      const from = points[side];
      const to = points[(side + 1) % 3];
      const portion = clamp01(link * 3 - side);
      if (portion <= 0) continue;
      ctx.strokeStyle = `rgba(248,105,37,${.28 + .6 * portion})`;
      ctx.lineWidth = 1.4 + opening * 1.2;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(from.x + (to.x - from.x) * portion, from.y + (to.y - from.y) * portion);
      ctx.stroke();
    }
    ctx.restore();
  }

  const aperturePoints = expandTriangle(points, 1 + .52 * opening);
  drawAperture(ctx, aperturePoints, t, opening);

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
