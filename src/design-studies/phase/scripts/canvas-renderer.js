/** @file Gemeinsame Projektion und gebündelte Canvas-Punktdarstellung. */
export class CanvasRenderer {
  /** Legt die acht wiederverwendbaren Helligkeitsgruppen an. */
  constructor() {
    this.buckets = Array.from({ length: 8 }, createBucket);
    this.addPoint = this.addPoint.bind(this);
  }

  /** Übernimmt die aktuelle Canvas-Größe und leert die Punktgruppen. */
  prepare(p, specimen) {
    this.width = p.width;
    this.height = p.height;
    this.scale = Math.min(p.height * 0.85, p.width * (specimen.fitWidth ?? 1.4));
    for (const bucket of this.buckets) bucket.length = 0;
    p.clear();
  }

  /** Projiziert einen Raumpunkt und ordnet ihn seiner Helligkeitsgruppe zu. */
  addPoint(x, y, z, tip = false, pulse = false) {
    const perspective = 1 / (1 + z * 0.85);
    const bucket = tip ? (pulse ? 7 : 6) : Math.max(0, Math.min(5, Math.floor((z + 0.18) * 15)));
    this.buckets[bucket].push(this.width * 0.5 + x * this.scale * perspective, this.height * 0.51 + y * this.scale * perspective);
  }

  /** Zeichnet die vorbereiteten Gruppen mit den aktuellen Theme-Farben. */
  paint(context, light) {
    for (let index = 0; index < this.buckets.length; index++) {
      context.fillStyle = bucketColor(index, light);
      drawBucket(context, this.buckets[index], bucketRadius(index));
    }
  }
}

/** Erstellt einen unabhängigen Punktpuffer. */
function createBucket() {
  return [];
}

/** Liefert den Punktdurchmesser einer Helligkeitsgruppe als Radius. */
function bucketRadius(index) {
  return index === 7 ? 1.05 : index === 6 ? 0.8 : 0.58;
}

/** Bestimmt eine Vordergrund- oder Akzentfarbe im aktiven Theme. */
function bucketColor(index, light) {
  const rgb = light ? '31,40,35' : '232,235,226';
  if (index < 6) return `rgba(${rgb},${0.14 + index * 0.105})`;
  if (index === 7) return light ? '#c42631' : '#ff4149';
  return `rgba(${rgb},0.8)`;
}

/** Zeichnet alle Punkte eines Puffers in genau einem Canvas-Pfad. */
function drawBucket(context, points, radius) {
  context.beginPath();
  for (let index = 0; index < points.length; index += 2) {
    context.moveTo(points[index] + radius, points[index + 1]);
    context.arc(points[index], points[index + 1], radius, 0, Math.PI * 2);
  }
  context.fill();
}
