/** @file world/layers.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

/**
 * Stellt scene.add wieder her und stellt Weltzustand und Layer-Steuerung bereit.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function finalizeWorld({
  scene,
  rawAdd,
  layers,
  mistMat,
  mistGroups,
  earthCeilingMaterial,
  ceilingStrata,
  foregroundRoot,
  infoPoints,
  swampWaterState,
  floatingWaterLeaves,
}) {
  scene.add = rawAdd;

  const layerVisibility = new Map(
    Object.keys(layers).map(

      /**
       * Ordnet dem aktuellen Eintrag seinen zugehörigen Zustand zu.
       * @param {string} name - Kennung des aktuellen Welt-Layers.
       * @returns {unknown} Ergebnis der beschriebenen Operation.
       */
      name => [name, true],
    ),
  );  // Manuell gewählte Sichtbarkeit je Layer.

  /**
   * Speichert und setzt die gewünschte Sichtbarkeit aller Objekte eines Layers.
   * @param {string} name - Kennung des aktuellen Welt-Layers.
   * @param {boolean} visible - Der Marker liegt sichtbar im freigegebenen Höhenbereich.
   * @returns {void} Kein Rückgabewert.
   */
  function setLayerVisible(name, visible) {
    layerVisibility.set(name, visible);
    for (const object of layers[name] ?? []) object.visible = visible;
  }

  /**
   * Erhält manuell ausgeblendete Layer trotz animierter Objektsichtbarkeit verborgen.
   * @returns {void} Kein Rückgabewert.
   */
  function restoreLayerVisibility() {
    for (const [name, visible] of layerVisibility) {
      if (!visible) for (const object of layers[name] ?? []) object.visible = false;
    }
  }
  return {
    mistMat,
    mistGroups,
    earthCeilingMaterial,
    ceilingStrata,
    foregroundRoot,
    infoPoints,
    layers,
    setLayerVisible,
    restoreLayerVisibility,
    swampWaterState,
    floatingWaterLeaves,
  };
}
