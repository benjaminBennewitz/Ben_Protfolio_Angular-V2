/** Prüft einen Punkt innerhalb einer rechteckigen Fläche. @param {object} bounds Grenzen. @param {object} point Punkt. @param {number} padding Erweiterung. */
export function insideRect(bounds,point,padding=0) {
  return point.x >= bounds.left-padding && point.x <= bounds.right+padding && point.y >= bounds.top-padding && point.y <= bounds.bottom+padding;
}

/** Prüft einen Punkt innerhalb eines projizierten Vielecks. @param {object[]} polygon Eckpunkte. @param {object} point Punkt. */
export function insidePolygon(polygon,point) {
  let inside = false;
  for (let i=0,j=polygon.length-1; i<polygon.length; j=i++) {
    const a=polygon[i], b=polygon[j];
    if ((a.y>point.y)!==(b.y>point.y) && point.x < (b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x) inside=!inside;
  }
  return inside;
}
