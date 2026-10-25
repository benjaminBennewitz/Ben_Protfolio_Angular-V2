import { movementPosition } from '../systems/player-movement.js';
import { PALETTE } from '../../core/config.js';

/** Zeichnet ein palettengebundenes Rechteck. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} color Farbindex. @param {number} x X. @param {number} y Y. @param {number} width Breite. @param {number} height Höhe. */
export function rect(ctx, color, x, y, width, height) {
  ctx.fillStyle = PALETTE[color]; ctx.fillRect(Math.round(x), Math.round(y), width, height);
}

/** Zeichnet eine einzelne Rasterzelle aus dem vorhandenen Tileset. @param {object} render Zeicheninformationen. @param {number} sx Quell-X. @param {number} sy Quell-Y. @param {number} x Ziel-X. @param {number} y Ziel-Y. */
export function tile(render, sx, sy, x, y) { render.ctx.drawImage(render.assets.tiles, sx, sy, 16, 16, x, y, 16, 16); }

/** Ermittelt die weich interpolierte Figurenposition. @param {object} game Spiel. */
export function playerPosition(game) { return movementPosition(game); }
