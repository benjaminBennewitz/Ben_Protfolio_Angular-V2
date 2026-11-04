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

/** Hebt die Geometrie aus dem Meer und simuliert eine leichte räumliche Neigung.
 * Die drei Ausgangspositionen bleiben bis zum Öffnen der Ankerpunkte fixiert. */
function levitateTriangle(points, time, opening, reducedMotion) {
  const lift = ease(opening * 1.45);
  if (lift <= 0) return points;

  const center = {
    x: points.reduce((sum, point) => sum + point.x, 0) / 3,
    y: points.reduce((sum, point) => sum + point.y, 0) / 3,
  };
  const rotation = reducedMotion ? -.055 * lift : lift * (
    -.075 + .058 * Math.sin(time * .57) + .026 * Math.sin(time * 1.26)
  );
  const shear = reducedMotion ? 0 : lift * .13 * Math.sin(time * .38 + 1);
  const pitch = 1 - lift * (reducedMotion ? .08 : .12 + .07 * Math.sin(time * .43));
  const hover = lift * (23 + (reducedMotion ? 0 : 6 * Math.sin(time * 1.11)));
  const pulse = reducedMotion ? 1 : 1 + lift * (
    .025 * Math.sin(time * 3.4) + .013 * Math.sin(time * 9.8)
  );
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);

  return points.map(point => {
    const x = (point.x - center.x) * pulse;
    const y = (point.y - center.y) * pulse;
    const rx = x * cosine - y * sine;
    const ry = x * sine + y * cosine;
    return { x: center.x + rx + shear * ry, y: center.y + ry * pitch - hover };
  });
}

/** Weicher, von der schwebenden Öffnung getrennter Schlagschatten auf dem Meer.
 * Die Distanz zwischen Objekt und Schatten macht die räumliche Höhe lesbar. */
function drawHoverShadow(ctx, anchored, opening) {
  if (opening < .025) return;
  const center = {
    x: anchored.reduce((sum, p) => sum + p.x, 0) / 3,
    y: anchored.reduce((sum, p) => sum + p.y, 0) / 3,
  };
  const bounds = {
    minX: Math.min(...anchored.map(point => point.x)),
    maxX: Math.max(...anchored.map(point => point.x)),
  };
  const radius = Math.max(12, (bounds.maxX - bounds.minX) * .44);
  const shadowY = center.y + 38;
  const intensity = ease(opening);
  ctx.save();
  // Leichtes Streulicht um die dunkle Fläche macht den Schatten im Meer sichtbar.
  const reflection = ctx.createRadialGradient(center.x, shadowY, radius * .08,
    center.x, shadowY, radius * 1.2);
  reflection.addColorStop(0, `rgba(13,3,4,${.48 * intensity})`);
  reflection.addColorStop(.55, `rgba(6,2,5,${.34 * intensity})`);
  reflection.addColorStop(.85, `rgba(172,52,19,${.075 * intensity})`);
  reflection.addColorStop(1, 'rgba(172,52,19,0)');
  ctx.fillStyle = reflection;
  ctx.beginPath();
  ctx.ellipse(center.x, shadowY, radius * 1.28, radius * .36, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, 26 + 17 * intensity);
  ctx.globalAlpha = .58 * intensity;
  ctx.shadowColor = '#030206';
  ctx.shadowBlur = 30;
  ctx.fillStyle = 'rgba(3,2,5,.78)';
  traceFracture(ctx, expandTriangle(anchored, 1.06), 0, .1);
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
    ctx.strokeStyle = `rgba(255,${175 + branch % 4 * 14},${102 + branch % 3 * 22},${.72 * pulse})`;
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
    ctx.strokeStyle = `rgba(255,214,162,${.75 * strength})`;
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
  const extent = Math.max(.04, opening * (1 + .028 * Math.sin(time * 3.6) + .012 * Math.sin(time * 13)));

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
  drawHoverShadow(ctx, anchoredTriangle, opening);
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
      ctx.strokeStyle = `rgba(248,105,37,${(.28 + .6 * portion) * jitter})`;
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

  drawAperture(ctx, hoveringTriangle, t, opening);
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
