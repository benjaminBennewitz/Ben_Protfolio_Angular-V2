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

  // Die Geometrie schwebt langsam. Kurze elektrische Impulse verändern nur das Licht,
  // nicht mehr die Position des ganzen Tores.
  const rotation = lift * (reducedMotion ? -.022 : -.022 + .013 * Math.sin(time * .24));
  const shear = reducedMotion ? 0 : lift * .012 * Math.sin(time * .17 + .6);
  const pitch = 1 - lift * (reducedMotion ? .1 : .1 + .009 * Math.sin(time * .19));
  const hover = lift * (20 + (reducedMotion ? 0 : 2.6 * Math.sin(time * .32)));
  const drift = reducedMotion ? 0 : lift * 2.1 * Math.sin(time * .21 + .4);
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
  wash.addColorStop(0, `rgba(3,2,5,${.18 * progress})`);
  wash.addColorStop(.42, `rgba(3,2,5,${.1 * progress})`);
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
  ctx.filter = 'blur(25px)';
  ctx.globalAlpha = .11 * progress;
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

/** Andeutungen hinter dem dimensionalen Riss statt klar erkennbarer Kreaturen.
 * Drei Silhouetten erscheinen asynchron; nur kurze Lichtreflexe verraten ihre Augen.
 * Die Aufrufe erfolgen ausschließlich innerhalb des Aperture-Clippings. */
function drawWatchingShapes(ctx, center, radius, time, opening, reducedMotion) {
  const emergence = ease((opening - .54) / .42);
  if (emergence <= 0) return;

  const figures = [
    { x: -.17, y: .12, scale: .82, offset: .1, rhythm: .34 },
    { x: .02, y: .13, scale: 1.12, offset: 2.8, rhythm: .26 },
    { x: .22, y: .09, scale: .75, offset: 5.2, rhythm: .21 },
  ];

  figures.forEach((figure, index) => {
    const pulse = reducedMotion ? .46 : (
      .42 + .26 * Math.sin(time * figure.rhythm + figure.offset)
      + .21 * Math.sin(time * .73 + index * 3.19));
    const visibility = emergence * clamp01(pulse);
    if (visibility <= .07) return;
    const drift = reducedMotion ? 0 : Math.sin(time * (.17 + index * .033) + figure.offset) * 2.1;
    const x = center.x + radius * figure.x + drift;
    const y = center.y + radius * figure.y - emergence * radius * .035;
    const unit = radius * .125 * figure.scale;

    ctx.save();
    // Die Innenlinien des Risses werden additiv gezeichnet; Schattenwesen
    // benötigen dagegen normales Compositing, sonst bleiben sie unsichtbar.
    ctx.globalCompositeOperation = 'source-over';
    ctx.translate(x, y);
    ctx.scale(unit, unit);

    // Konturloser Körper, der im dunklen Hohlraum auszulaufen scheint.
    ctx.filter = 'blur(6px)';
    ctx.globalAlpha = visibility * .66;
    const body = ctx.createRadialGradient(0, .35, .08, 0, .6, 1.4);
    body.addColorStop(0, 'rgba(1,1,5,.94)');
    body.addColorStop(.65, 'rgba(3,1,5,.64)');
    body.addColorStop(1, 'rgba(2,1,4,0)');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, .65, .9, 1.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'blur(2.5px)';
    ctx.shadowColor = 'rgba(160,50,35,.26)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(0, -.42, .43, .59, -.045, 0, Math.PI * 2);
    ctx.fillStyle = '#010105';
    ctx.fill();
    // Ein kaum erkennbarer, warmer Saum löst den Kopf aus dem schwarzen Riss.
    ctx.globalAlpha = visibility * .2;
    ctx.strokeStyle = '#9c4736';
    ctx.lineWidth = .045;
    ctx.stroke();
    ctx.restore();

    // Lichtreflexe sind selten und nie gemeinsam im selben Takt sichtbar.
    const flash = reducedMotion ? .15 : Math.max(0,
      Math.sin(time * (.94 + index * .14) + index * 2.8) - .28);
    const eyesAlpha = visibility * Math.pow(flash, 1.3) * 1.16;
    if (eyesAlpha < .025) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = eyesAlpha;
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ffab65';
    ctx.fillStyle = '#ffc18b';
    for (const offset of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(x + offset * unit * .17, y - unit * .44,
        Math.max(1.35, unit * .046), Math.max(.9, unit * .03), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/** Zeichnet den Öffnungskörper nur innerhalb der verbundenen Peilpunkte. */
function drawAperture(ctx, points, time, opening, reducedMotion) {
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
  drawWatchingShapes(ctx, center, radius, time, opening, reducedMotion);
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

  drawAperture(ctx, hoveringTriangle, t, opening, reducedMotion);
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
