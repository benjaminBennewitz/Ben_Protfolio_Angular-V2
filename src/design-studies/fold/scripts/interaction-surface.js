/** @file interaction-surface.js — Native Eingabe auf der ruhenden Perspektive 05. */

/**
 * Rendert die CSS3D-Szene und stellt Seite 05 in ihrer Ruhepose als native HTML-Fläche bereit.
 * Dieselbe Papierfläche kehrt vor dem nächsten Rendern in ihre ursprüngliche DOM-Hierarchie zurück.
 * @param {object} context - Renderer, Szenencontainer und das gemeinsame Papiermodell.
 * @returns {object} Renderfunktion mit unveränderter CSS3D-Schnittstelle.
 */
export function createInteractionSurface({ renderer, sceneNode, faces, poses }) {

  const face = faces.find(
    /**
     * Wählt die physische Papierfläche der Perspektive 05 aus.
     * @param {object} item - Papierfläche mit stabiler Inhaltskennung.
     * @returns {boolean} Die Papierfläche gehört zur Perspektive 05.
     */
    item => item.data.id === 4,
  );                                                 // Physische Papierfläche der Perspektive 05.
  const overlay = document.createElement('div');       // Native Interaktionsebene über der CSS3D-Ausgabe.
  let originalParent = null;                          // Ursprünglicher CSS3D-Container der Papierfläche.

  overlay.className = 'chapter-interaction-overlay';
  sceneNode.parentElement.append(overlay);

  /**
   * Stellt die ursprüngliche DOM-Hierarchie vor der nächsten CSS3D-Ausgabe wieder her.
   * @returns {void} Kein Rückgabewert.
   */
  function release() {
    if (!originalParent) return;
    originalParent.append(face.el);
    originalParent = null;
    overlay.classList.remove('active');
  }

  /**
   * Prüft, ob Seite 05 vollständig zur Kamera ausgerichtet und als Würfelfläche aktiv ist.
   * @param {object} camera - Perspektivkamera der gemeinsamen Papierbühne.
   * @returns {boolean} Die Papierfläche kann ohne Perspektivverzerrung übernommen werden.
   */
  function isResting(camera) {
    return face.el.classList.contains('is-current') && !face.el.classList.contains('net')
      && camera.quaternion.angleTo(poses[4].quat) < 0.000001;
  }

  /**
   * Übernimmt die echte Papierfläche mit ihrer projizierten Größe in die native Interaktionsebene.
   * @returns {void} Kein Rückgabewert.
   */
  function mount() {

    const bounds = face.el.getBoundingClientRect();  // Projizierte Größe der bereits gerenderten Quadratfläche.

    overlay.style.setProperty('--overlay-scale', String(bounds.width / face.el.offsetWidth));
    originalParent = face.el.parentElement;
    overlay.append(face.el);
    overlay.classList.add('active');
  }

  /**
   * Aktualisiert zuerst die 3D-Ausgabe und übernimmt danach ausschließlich die ruhende Seite 05.
   * @param {object} scene - Gemeinsame CSS3D-Szene.
   * @param {object} camera - Perspektivkamera der gemeinsamen Papierbühne.
   * @returns {void} Kein Rückgabewert.
   */
  function render(scene, camera) {
    release();
    renderer.render(scene, camera);
    if (isResting(camera)) mount();
  }

  return { render };
}
