/** Liefert ein erforderliches DOM-Element. @param {string} id Elementkennung. */
export function element(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Bedienelement fehlt: ${id}`);
  return node;
}

/** Begrenzt einen Zahlenwert. @param {number} value Wert. @param {number} min Untergrenze. @param {number} max Obergrenze. */
export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/** Lädt eine lokale Grafik. @param {string} url Grafikadresse. */
export async function loadImage(url) {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

/** Erstellt eine Zeichenfläche. @param {number} width Breite. @param {number} height Höhe. */
export function canvas(width, height) {
  const surface = document.createElement('canvas');
  surface.width = width;
  surface.height = height;
  return surface;
}
