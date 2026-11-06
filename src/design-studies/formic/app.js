/**
 * @file Interaktive Ameisen-Simulation und Zeichenlogik der FORMIC-Designstudie.
 * @description Kapselt Bewegung, Kollisionsvermeidung, verzögerte Linienführung,
 * Canvas-Darstellung, Lokalisierung und den hochauflösenden PNG-Export.
 * @author Benjamin Bennewitz
 */

/** @typedef {{ x: number, y: number }} Point */
/** @typedef {{ x: number, y: number, distance: number }} PathPoint */
/** @typedef {{ x: number, y: number, toX: number, toY: number, color: string, size: number }} Mark */

/** Liefert ein Element über seine stabile ID. */
const byId = (id) => document.getElementById(id);

const paintCanvas = byId('paint');
const animalCanvas = byId('animals');
const context = animalCanvas.getContext('2d');
const inkContext = paintCanvas.getContext('2d');

const DIMENSIONS = Object.freeze({ A4: [210, 297], A3: [297, 420], A5: [148, 210] });
const ANT_CLEARANCE = 84;
const FIXED_STEP = 1 / 120;
const TRACE_DELAY = 42;

let canvasWidth = 840;
let canvasHeight = 1188;
let running = false;
let elapsed = 0;
let ants = [];
let marks = [];
let language = 'de';
let speed = 1;
let lineWidth = 1;
let smoothness = 35;
let lineColor = '#d3684b';
let accumulator = 0;
let clockWorker = null;
let fallbackTimer = null;
let clockPrevious = 0;

/** Begrenzt einen numerischen Wert auf das angegebene Intervall. */
function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

/** Transformiert lokale Körperkoordinaten einer Ameise in Leinwandkoordinaten. */
function world(ant, x, y) {
  return {
    x: ant.x + Math.cos(ant.angle) * x - Math.sin(ant.angle) * y,
    y: ant.y + Math.sin(ant.angle) * x + Math.cos(ant.angle) * y,
  };
}

/** Liefert die Längsposition eines Beinpaares relativ zum Thorax. */
function legReach(row) {
  return row === 2 ? -36 : (1 - row) * 13;
}

/** Liefert die Länge des umlaufenden inneren Randpfades. */
function perimeter() {
  return 2 * (canvasWidth + canvasHeight - 168);
}

/**
 * Wandelt eine Position auf dem umlaufenden Randpfad in Canvas-Koordinaten um.
 * Der fortlaufende Parameter verhindert Sprünge beim Wechsel um eine Ecke.
 */
function edgePoint(position, inset) {
  const width = canvasWidth - 84;
  const height = canvasHeight - 84;
  const total = 2 * (width + height);
  let offset = ((position % total) + total) % total;

  if (offset < width) return { x: 42 + offset, y: 42 + inset };
  offset -= width;
  if (offset < height) return { x: canvasWidth - 42 - inset, y: 42 + offset };
  offset -= height;
  if (offset < width) return { x: canvasWidth - 42 - offset, y: canvasHeight - 42 - inset };
  offset -= width;
  return { x: 42 + inset, y: canvasHeight - 42 - offset };
}

/** Bestimmt ein neues Bewegungsziel, bevorzugt gelegentlich in Randnähe. */
function chooseTarget(interior = false) {
  if (interior || Math.random() < 0.25) {
    return {
      x: canvasWidth * (0.2 + Math.random() * 0.6),
      y: canvasHeight * (0.2 + Math.random() * 0.6),
    };
  }

  return edgePoint(Math.random() * perimeter(), 0);
}

/** Ermittelt den nächstgelegenen Punktparameter auf dem umlaufenden Randpfad. */
function nearestEdgePosition(ant) {
  const distances = [ant.y, canvasWidth - ant.x, canvasHeight - ant.y, ant.x];
  const edge = distances.indexOf(Math.min(...distances));
  const width = canvasWidth - 84;
  const height = canvasHeight - 84;

  return [
    ant.x - 42,
    width + ant.y - 42,
    width + height + canvasWidth - 42 - ant.x,
    2 * width + height + canvasHeight - 42 - ant.y,
  ][edge];
}

/** Erstellt eine Ameise einschließlich Laufpfad und sechs animierter Beine. */
function createAnt(x = canvasWidth * 0.5, y = canvasHeight * 0.5) {
  const ant = {
    x,
    y,
    angle: Math.random() * Math.PI * 2,
    phase: Math.random(),
    turn: 0,
    noise: Math.random() * 100,
    legs: [],
    mode: 'roam',
    modeTime: 0,
    target: chooseTarget(),
    edgePosition: 0,
    edgeDirection: Math.random() < 0.5 ? -1 : 1,
    path: [{ x, y, distance: 0 }],
    distance: 0,
    pen: null,
    penSeed: Math.random() * 100000,
  };

  for (let index = 0; index < 6; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const row = Math.floor(index / 2);
    const foot = world(ant, legReach(row), side * 24);
    ant.legs.push({ side, row, foot, from: foot, to: foot, stance: true });
  }

  return ant;
}

/** Sucht eine freie Einsetzposition, damit sich Ameisen nicht überlagern. */
function freePosition(x, y, others) {
  const isFree = (point) => others.every((other) => (
    Math.hypot(other.x - point.x, other.y - point.y) >= ANT_CLEARANCE + 2
  ));
  const preferred = {
    x: clamp(x, 50, canvasWidth - 50),
    y: clamp(y, 50, canvasHeight - 50),
  };

  if (isFree(preferred)) return preferred;

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const point = {
      x: 50 + Math.random() * (canvasWidth - 100),
      y: 50 + Math.random() * (canvasHeight - 100),
    };
    if (isFree(point)) return point;
  }

  for (let yPosition = 50; yPosition <= canvasHeight - 50; yPosition += ANT_CLEARANCE + 3) {
    for (let xPosition = 50; xPosition <= canvasWidth - 50; xPosition += ANT_CLEARANCE + 3) {
      const point = { x: xPosition, y: yPosition };
      if (isFree(point)) return point;
    }
  }

  return null;
}

/** Erstellt eine Ameise nur dann, wenn eine kollisionsfreie Position gefunden wird. */
function placeAnt(x, y, others = ants) {
  const point = freePosition(x, y, others);
  return point ? createAnt(point.x, point.y) : null;
}

/**
 * Berechnet eine Nahbereichslenkung gegenüber anderen Ameisen.
 * Eine gemeinsame Rechtsausweichregel reduziert frontales Hin-und-her-Pendeln.
 */
function avoidance(ant) {
  const forwardX = Math.cos(ant.angle);
  const forwardY = Math.sin(ant.angle);
  let x = 0;
  let y = 0;
  let pace = 1;

  for (const other of ants) {
    if (other === ant) continue;

    const deltaX = other.x - ant.x;
    const deltaY = other.y - ant.y;
    const distance = Math.hypot(deltaX, deltaY);
    if (distance > ANT_CLEARANCE + 85 || distance < 0.001) continue;

    const ahead = (deltaX * forwardX + deltaY * forwardY) / distance;
    if (ahead < -0.2) continue;

    const proximity = clamp((ANT_CLEARANCE + 85 - distance) / 85, 0, 1);
    const weight = proximity * proximity;
    const across = Math.abs(-deltaX * forwardY + deltaY * forwardX);

    x -= (deltaX / distance) * weight * 3;
    y -= (deltaY / distance) * weight * 3;

    if (across < ANT_CLEARANCE) {
      x -= forwardY * weight * 2;
      y += forwardX * weight * 2;
    }

    if (ahead > 0.3) {
      pace = Math.min(pace, clamp((distance - ANT_CLEARANCE) / 55, 0.06, 1));
    }
  }

  return { x, y, pace };
}

/** Bewegt eine Ameise, sofern der Schritt den Mindestabstand zu anderen Tieren nicht verletzt. */
function moveAnt(ant, pace, deltaTime) {
  const x = clamp(ant.x + Math.cos(ant.angle) * pace * deltaTime, 38, canvasWidth - 38);
  const y = clamp(ant.y + Math.sin(ant.angle) * pace * deltaTime, 38, canvasHeight - 38);

  for (const other of ants) {
    if (other === ant) continue;

    const nextDistance = Math.hypot(x - other.x, y - other.y);
    const currentDistance = Math.hypot(ant.x - other.x, ant.y - other.y);
    if (nextDistance < ANT_CLEARANCE && nextDistance < currentDistance) return 0;
  }

  const moved = Math.hypot(x - ant.x, y - ant.y);
  ant.x = x;
  ant.y = y;
  return moved;
}

/** Zeichnet ein gespeichertes Liniensegment auf den übergebenen 2D-Kontext. */
function drawMark(targetContext, mark) {
  targetContext.save();
  targetContext.strokeStyle = mark.color;
  targetContext.lineWidth = mark.size;
  targetContext.lineCap = 'round';
  targetContext.lineJoin = 'round';
  targetContext.beginPath();
  targetContext.moveTo(mark.x, mark.y);
  targetContext.lineTo(mark.toX, mark.toY);
  targetContext.stroke();
  targetContext.restore();
}

/** Erzeugt deterministisches eindimensionales Rauschen entlang des Laufweges. */
function penNoise(position, seed) {
  const hash = (index) => {
    const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;
    return (value - Math.floor(value)) * 2 - 1;
  };
  const index = Math.floor(position);
  const fraction = position - index;
  return hash(index) + (hash(index + 1) - hash(index)) * fraction;
}

/** Versetzt die virtuelle Stiftspitze abhängig von der gewählten Linienglätte. */
function penPoint(point, first, next, distance, seed) {
  const deltaX = next.x - first.x;
  const deltaY = next.y - first.y;
  const length = Math.hypot(deltaX, deltaY) || 1;
  const amount = (1 - smoothness / 100) * 5;
  const cross = amount * (
    penNoise(distance * 0.6, seed) * 0.8
    + penNoise(distance * 0.13, seed + 1) * 0.2
  );
  const along = amount * 0.2 * penNoise(distance * 0.45, seed + 2);

  return {
    x: clamp(point.x - deltaY / length * cross + deltaX / length * along, 0, canvasWidth),
    y: clamp(point.y + deltaX / length * cross + deltaY / length * along, 0, canvasHeight),
  };
}

/** Führt die virtuelle Stiftspitze mit konstantem Abstand entlang des Ameisenpfades. */
function trace(ant) {
  const previous = ant.path[ant.path.length - 1];
  const distance = Math.hypot(ant.x - previous.x, ant.y - previous.y);
  if (distance < 0.7) return;

  ant.distance += distance;
  ant.path.push({ x: ant.x, y: ant.y, distance: ant.distance });

  const targetDistance = ant.distance - TRACE_DELAY;
  if (targetDistance < 0) return;

  while (ant.path.length > 2 && ant.path[1].distance <= targetDistance) {
    ant.path.shift();
  }

  const first = ant.path[0];
  const next = ant.path[1];
  if (!next) return;

  const progress = clamp(
    (targetDistance - first.distance) / (next.distance - first.distance),
    0,
    1,
  );
  const basePoint = {
    x: first.x + (next.x - first.x) * progress,
    y: first.y + (next.y - first.y) * progress,
  };
  const point = penPoint(basePoint, first, next, targetDistance, ant.penSeed);

  if (ant.pen) {
    const mark = {
      x: ant.pen.x,
      y: ant.pen.y,
      toX: point.x,
      toY: point.y,
      color: lineColor,
      size: 2.5 * lineWidth,
    };
    marks.push(mark);
    drawMark(inkContext, mark);
  }

  ant.pen = point;
}

/** Aktualisiert die sechs Beine anhand der aktuellen Laufphase. */
function updateLegs(ant) {
  for (let index = 0; index < 6; index += 1) {
    const leg = ant.legs[index];
    const groupOffset = ((leg.row + (leg.side === 1 ? 1 : 0)) % 2) * 0.5;
    const phase = (ant.phase + groupOffset) % 1;
    const stance = phase < 0.58;
    const reach = legReach(leg.row);
    const target = world(ant, reach + 12, leg.side * (leg.row === 1 ? 28 : 23));

    if (!stance && leg.stance) {
      leg.from = { ...leg.foot };
      leg.to = target;
    }

    if (!stance) {
      const progress = (phase - 0.58) / 0.42;
      const eased = progress * progress * (3 - 2 * progress);
      leg.foot = {
        x: leg.from.x + (target.x - leg.from.x) * eased,
        y: leg.from.y + (target.y - leg.from.y) * eased,
      };
    }

    if (stance && !leg.stance) leg.foot = { ...target };
    leg.stance = stance;
  }
}

/** Aktualisiert Suchverhalten, Ausweichbewegung, Laufphase und Linienpfad einer Ameise. */
function updateAnt(ant, deltaTime) {
  ant.noise += deltaTime;
  ant.modeTime -= deltaTime;
  const edgeDistance = Math.min(ant.x, canvasWidth - ant.x, ant.y, canvasHeight - ant.y);

  if (ant.mode === 'roam' && ant.modeTime <= 0 && edgeDistance < 88) {
    ant.mode = 'edge';
    ant.modeTime = 16 + Math.random() * 24;
    ant.edgePosition = nearestEdgePosition(ant);
  }

  if (ant.mode === 'edge' && ant.modeTime <= 0) {
    ant.mode = 'roam';
    ant.modeTime = 9 + Math.random() * 10;
    ant.target = chooseTarget(true);
  }

  let pace = 43 * speed;
  if (ant.mode === 'edge') {
    const search = (Math.sin(ant.noise * 1.4) + 1) / 2;
    const paused = Math.sin(ant.noise * 2.1) > 0.86;
    pace *= paused ? 0.09 : 0.35 + 0.5 * search;
    ant.edgePosition += ant.edgeDirection * pace * deltaTime;
    ant.target = edgePoint(ant.edgePosition + ant.edgeDirection * 24, 5 + search * 36);
  } else if (Math.hypot(ant.target.x - ant.x, ant.target.y - ant.y) < 45) {
    ant.target = chooseTarget();
  }

  const avoid = avoidance(ant);
  const targetAngle = Math.atan2(ant.target.y - ant.y, ant.target.x - ant.x);
  const desired = Math.atan2(Math.sin(targetAngle) + avoid.y, Math.cos(targetAngle) + avoid.x);
  const angleDelta = Math.atan2(Math.sin(desired - ant.angle), Math.cos(desired - ant.angle));
  const wander = Math.sin(ant.noise * 2.3) * 0.35 + Math.sin(ant.noise * 0.83) * 0.23;

  ant.turn += (
    clamp(angleDelta * 2.5 + wander, -2.8, 2.8) - ant.turn
  ) * Math.min(1, deltaTime * 5);
  ant.angle += ant.turn * deltaTime;
  pace *= avoid.pace / (1 + Math.abs(ant.turn) * 0.5);

  const moved = moveAnt(ant, pace, deltaTime);
  ant.phase += moved / 24;
  trace(ant);
  updateLegs(ant);
}

/** Zeichnet eine Ameise mit gegliederten Beinen, Körpersegmenten und Fühlern. */
function drawAnt(ant) {
  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';

  for (const leg of ant.legs) {
    const hip = world(ant, (1 - leg.row) * 8, leg.side * 4);
    const knee = world(ant, (1 - leg.row) * 16 - 5, leg.side * 17);
    context.strokeStyle = '#292a22';
    context.lineWidth = 1.35;
    context.beginPath();
    context.moveTo(hip.x, hip.y);
    context.lineTo(knee.x, knee.y);
    context.lineTo(leg.foot.x, leg.foot.y);
    context.stroke();
    context.fillStyle = leg.stance ? '#2b2d24' : '#77796a';
    context.beginPath();
    context.arc(leg.foot.x, leg.foot.y, 1.1, 0, Math.PI * 2);
    context.fill();
  }

  context.translate(ant.x, ant.y);
  context.rotate(ant.angle);

  const sway = Math.sin(ant.phase * Math.PI * 2) * 0.035;
  context.save();
  context.translate(-13, 0);
  context.rotate(sway);

  const abdomenGradient = context.createRadialGradient(-3, -3, 1, 0, 0, 14);
  abdomenGradient.addColorStop(0, '#545343');
  abdomenGradient.addColorStop(0.65, '#272920');
  abdomenGradient.addColorStop(1, '#191c16');
  context.fillStyle = abdomenGradient;
  context.beginPath();
  context.ellipse(0, 0, 14, 8.5, 0, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = '#7b796344';
  context.lineWidth = 0.6;
  for (const x of [-17, -12, -7]) {
    context.beginPath();
    context.ellipse(x + 13, 0, 2, 7, 0, -1, 1);
    context.stroke();
  }
  context.restore();

  context.fillStyle = '#303126';
  context.beginPath();
  context.ellipse(3, 0, 10, 4.7, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(17, 0, 8, 6.5, 0, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = '#303126';
  context.lineWidth = 1;
  for (const side of [-1, 1]) {
    const feel = Math.sin(ant.noise * 6 + side) * 3;
    context.beginPath();
    context.moveTo(21, side * 4);
    context.lineTo(30, side * (9 + feel * 0.4));
    context.lineTo(39 + feel, side * 12);
    context.stroke();

    context.beginPath();
    context.moveTo(23, side * 2);
    context.lineTo(26, side * 3);
    context.lineTo(27, side);
    context.stroke();
  }

  context.restore();
}

/** Rendert nur die aktuell sichtbaren Ameisen; die Linien liegen auf einem separaten Canvas. */
function render() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  ants.forEach(drawAnt);
}

/** Aktualisiert die sichtbare Laufzeit der aktuellen Zeichnung. */
function updateClock() {
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(Math.floor(elapsed % 60)).padStart(2, '0');
  byId('clock').textContent = `${minutes}:${seconds}`;
}

/** Simuliert feste Zeitschritte unabhängig von der sichtbaren Bildausgabe. */
function advance(seconds) {
  if (!running) return;

  accumulator += seconds;
  while (accumulator >= FIXED_STEP) {
    ants.forEach((ant) => updateAnt(ant, FIXED_STEP));
    elapsed += FIXED_STEP;
    accumulator -= FIXED_STEP;
  }
  updateClock();
}

/** Rendert kontinuierlich; der eigentliche Simulationsfortschritt wird separat getaktet. */
function frame() {
  render();
  requestAnimationFrame(frame);
}

/** Stoppt Worker- und Fallback-Takt und verwirft Restzeit des Fixed-Step-Akkumulators. */
function stopClock() {
  if (clockWorker) clockWorker.postMessage({ type: 'stop' });
  if (fallbackTimer !== null) {
    clearInterval(fallbackTimer);
    fallbackTimer = null;
  }
  accumulator = 0;
}

/** Startet den Worker-Takt oder fällt bei fehlendem Worker auf einen lokalen Timer zurück. */
function startClock() {
  stopClock();
  if (!running) return;

  if (clockWorker) {
    clockWorker.postMessage({ type: 'start' });
    return;
  }

  clockPrevious = performance.now();
  fallbackTimer = setInterval(() => {
    const now = performance.now();
    advance(Math.min((now - clockPrevious) / 1000, 1));
    clockPrevious = now;
  }, 1000 / 30);
}

/** Initialisiert den lokalen Worker; Fehler wechseln automatisch auf den Fallback-Timer. */
function setupClock() {
  try {
    clockWorker = new Worker(new URL('./clock-worker.js', import.meta.url));
    clockWorker.onmessage = (event) => {
      if (event.data.type === 'tick') advance(event.data.seconds);
    };
    clockWorker.onerror = () => {
      clockWorker.terminate();
      clockWorker = null;
      startClock();
    };
  } catch {
    clockWorker = null;
  }
}

/** Aktualisiert alle zweisprachigen Texte und Zustandsbeschriftungen. */
function applyLabels() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-de]').forEach((element) => {
    element.innerHTML = element.dataset[language];
  });

  byId('language').textContent = language === 'de' ? 'EN ↗' : 'DE ↗';
  byId('play').innerHTML = `${running
      ? (language === 'de' ? 'Experiment pausieren' : 'Pause experiment')
      : (language === 'de' ? 'Experiment starten' : 'Start experiment')
    } <span>${running ? 'Ⅱ' : '→'}</span>`;
  byId('status').textContent = running
    ? (language === 'de' ? 'IN BEWEGUNG' : 'IN MOTION')
    : (language === 'de' ? 'BEREIT / PAUSE' : 'READY / PAUSED');
  byId('indicator').classList.toggle('running', running);
  byId('orientation').options[0].textContent = language === 'de' ? 'Hochformat' : 'Portrait';
  byId('orientation').options[1].textContent = language === 'de' ? 'Querformat' : 'Landscape';
  byId('lineColor').setAttribute('aria-label', language === 'de' ? 'Linienfarbe' : 'Line colour');
}

/** Setzt Größe, Papierformat, Simulation und Zeichenpfad für die aktuelle Auswahl neu auf. */
function setupCanvas() {
  let [paperWidth, paperHeight] = DIMENSIONS[byId('format').value];
  if (byId('orientation').value === 'landscape') {
    [paperWidth, paperHeight] = [paperHeight, paperWidth];
  }

  canvasWidth = 840;
  canvasHeight = Math.round(canvasWidth * paperHeight / paperWidth);
  paintCanvas.width = canvasWidth;
  animalCanvas.width = canvasWidth;
  paintCanvas.height = canvasHeight;
  animalCanvas.height = canvasHeight;

  byId('paper').style.aspectRatio = `${paperWidth}/${paperHeight}`;
  byId('paper').style.maxWidth = paperWidth > paperHeight ? '620px' : '430px';
  byId('paperLabel').textContent = `${byId('format').value} · ${paperWidth} × ${paperHeight} MM`;

  marks = [];
  elapsed = 0;
  ants = [];
  const count = Number(byId('count').value);
  for (let index = 0; index < count; index += 1) {
    const ant = placeAnt(
      canvasWidth * (0.3 + Math.random() * 0.4),
      canvasHeight * (0.3 + Math.random() * 0.4),
    );
    if (ant) ants.push(ant);
  }

  byId('hint').hidden = false;
  updateClock();
  render();
}

/** Leert ausschließlich das Bild und startet die vorhandenen Ameisenpfade neu. */
function clearArtwork() {
  inkContext.clearRect(0, 0, canvasWidth, canvasHeight);
  marks = [];
  elapsed = 0;
  updateClock();
  ants.forEach((ant) => {
    ant.path = [{ x: ant.x, y: ant.y, distance: 0 }];
    ant.distance = 0;
    ant.pen = null;
  });
}

/** Passt die Ameisenanzahl an und respektiert dabei den erforderlichen Sicherheitsabstand. */
function updateAntCount(event) {
  const requestedCount = Number(event.target.value);
  byId('countOut').value = requestedCount;

  while (ants.length < requestedCount) {
    const ant = placeAnt(
      canvasWidth * (0.2 + Math.random() * 0.6),
      canvasHeight * (0.2 + Math.random() * 0.6),
    );
    if (!ant) break;
    ants.push(ant);
  }

  ants.length = Math.min(ants.length, requestedCount);
  byId('count').value = ants.length;
  byId('countOut').value = ants.length;
}

/** Versetzt die erste Ameise per Klick, ohne andere Ameisen zu überlaufen. */
function relocatePrimaryAnt(event) {
  const bounds = animalCanvas.getBoundingClientRect();
  const ant = placeAnt(
    (event.clientX - bounds.left) / bounds.width * canvasWidth,
    (event.clientY - bounds.top) / bounds.height * canvasHeight,
    ants.slice(1),
  );
  if (ant) ants[0] = ant;
}

/** Spielt gespeicherte Liniensegmente in der gewählten Exportauflösung ohne Ameisen erneut ab. */
function exportArtwork() {
  let [paperWidth, paperHeight] = DIMENSIONS[byId('format').value];
  if (byId('orientation').value === 'landscape') {
    [paperWidth, paperHeight] = [paperHeight, paperWidth];
  }

  const dpi = Number(byId('dpi').value);
  const output = document.createElement('canvas');
  output.width = Math.round(paperWidth / 25.4 * dpi);
  output.height = Math.round(paperHeight / 25.4 * dpi);
  const outputContext = output.getContext('2d');

  outputContext.fillStyle = '#faf8f0';
  outputContext.fillRect(0, 0, output.width, output.height);
  outputContext.scale(output.width / canvasWidth, output.height / canvasHeight);
  marks.forEach((mark) => drawMark(outputContext, mark));

  output.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const download = document.createElement('a');
    download.href = url;
    download.download = `FORMIC-${byId('format').value}-${dpi}dpi.png`;
    download.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, 'image/png');
}

/** Schaltet Simulation und Takt gemeinsam zwischen Lauf und Pause um. */
function toggleRunning() {
  running = !running;
  startClock();
  if (running) byId('hint').hidden = true;
  applyLabels();
}

/** Wechselt die komplette sichtbare Oberfläche zwischen Deutsch und Englisch. */
function toggleLanguage() {
  language = language === 'de' ? 'en' : 'de';
  applyLabels();
}

/** Übernimmt die ausgewählte Linienfarbe für alle neu entstehenden Segmente. */
function updateLineColor(event) {
  lineColor = event.target.value;
}

/** Übernimmt die Linienglätte und aktualisiert die sichtbare Prozentangabe. */
function updateSmoothness(event) {
  smoothness = Number(event.target.value);
  byId('smoothnessOut').value = `${smoothness} %`;
}

/** Übernimmt das Simulationstempo und aktualisiert die sichtbare Ausgabe. */
function updateSpeed(event) {
  speed = Number(event.target.value);
  byId('speedOut').value = `${speed.toFixed(1)}×`;
}

/** Übernimmt die Linienbreite und aktualisiert die sichtbare Ausgabe. */
function updateLineWidth(event) {
  lineWidth = Number(event.target.value);
  byId('widthOut').value = lineWidth.toFixed(1);
}

/** Bindet alle Controls der Studie an benannte, dokumentierte Handler. */
function bindControls() {
  byId('lineColor').addEventListener('input', updateLineColor);
  byId('smoothness').addEventListener('input', updateSmoothness);
  byId('play').addEventListener('click', toggleRunning);
  byId('language').addEventListener('click', toggleLanguage);
  byId('clear').addEventListener('click', clearArtwork);
  byId('format').addEventListener('change', setupCanvas);
  byId('orientation').addEventListener('change', setupCanvas);
  byId('count').addEventListener('input', updateAntCount);
  byId('speed').addEventListener('input', updateSpeed);
  byId('width').addEventListener('input', updateLineWidth);
  animalCanvas.addEventListener('click', relocatePrimaryAnt);
  byId('export').addEventListener('click', exportArtwork);
}

setupClock();
setupCanvas();
bindControls();
applyLabels();
requestAnimationFrame(frame);
