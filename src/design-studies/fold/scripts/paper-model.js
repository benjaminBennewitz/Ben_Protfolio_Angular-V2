/** @file paper-model.js — Teilbereich der verbundenen FOLD-Papierexperience. */

import { info } from './face-content.js';

/**
 * Erstellt sechs verbundene Papierflächen, ihre Scharniere und die geschlossenen Kameraposen.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createPaperModel({ THREE, CSS3DObject, root }) {

  const S = 4;                                                                                    // Räumliche Kantenlänge des Würfels.
  const PIX = 1000;                                                                               // Logische Kantenlänge einer HTML-Papierfläche in Pixeln.
  const scale = S / PIX;                                                                          // Verhältnis zwischen räumlicher Papierkante und HTML-Pixeln.

  /**
   * Erstellt eine physische HTML-Papierfläche mit fest zugehöriger Editorial-Gestaltung.
   * @param {object} data - Editorial-Inhalt und Farben der aktuellen Papierfläche.
   * @returns {object} Ergebnis der beschriebenen Operation.
   */
  function createFace(data) {

    const holder = new THREE.Group();              // Räumliche Trägergruppe einer Papierfläche.
    const el = document.createElement('section');  // HTML-Inhalt einer physischen CSS3D-Papierfläche.

    el.className = `paper paper--${data.name.toLowerCase()}`;
    el.style.setProperty('--bg', data.bg);
    el.style.setProperty('--fg', data.fg);
    el.style.setProperty('--accent', data.accent);
    el.setAttribute('aria-label', `${data.id + 1} / ${data.name}`);
    el.innerHTML = `<div class="inner"><span class="eyebrow">${String(data.id + 1).padStart(2, '0')} / ${data.name}</span><h${data.id === 0 ? '1' : '2'}>${data.title}</h${data.id === 0 ? '1' : '2'}><p class="copy">${data.copy}</p><button type="button" data-next="${data.id === 5 ? 6 : data.id + 1}">${data.id === 5 ? 'UNFOLD THE WHOLE PICTURE ↗' : 'NEXT SIDE ↗'}</button></div><span class="footnote">FOLD. / THERE IS ALWAYS ANOTHER SIDE.</span><span class="art-orbit" aria-hidden="true"></span><span class="art-stamp" aria-hidden="true">FOLD / 00${data.id + 1}<br>↗ REFRAME<br>THE ORDINARY</span><span class="art-rule" aria-hidden="true"></span><span class="editorial-meta" aria-hidden="true">STUDY NO. 007 <b>↗</b> THE ART OF ANOTHER SIDE</span>${data.id === 4 ? `<span class="marquee" aria-hidden="true"><span>SAME OBJECT / DIFFERENT ANGLE / NEW MEANING / REPEAT /&nbsp;</span><span>SAME OBJECT / DIFFERENT ANGLE / NEW MEANING / REPEAT /&nbsp;</span></span>` : ''}`;
    el.insertAdjacentHTML(
      'beforeend',
      `
    <span class="fold-geometry fold-geometry--ring" aria-hidden="true"></span>
    <span class="fold-geometry fold-geometry--cross" aria-hidden="true"></span>
    <span class="fold-geometry fold-geometry--index" aria-hidden="true">0${data.id + 1} / 06</span>
  `,
    );

    const obj = new CSS3DObject(el);               // CSS3D-Objekt der HTML-Papierfläche.

    obj.scale.setScalar(scale);
    holder.add(obj);
    return {
      holder,
      el,
      data,
    };
  }

  const faces = info.map(createFace);                                                             // Die sechs dauerhaft verbundenen HTML-Papierflächen.

  root.add(faces[0].holder);

  /**
   * Verbindet zwei benachbarte Papierflächen durch ein Scharnier an der gemeinsamen Kante.
   * @param {object} parent - Räumliche Trägergruppe des Elternfelds.
   * @param {object} child - Räumliche Trägergruppe des benachbarten Papierfelds.
   * @param {string} axis - Drehachse des gemeinsamen Scharniers.
   * @param {number} dir - Achsenrichtung des Scharniers beziehungsweise erkannte Wischrichtung.
   * @returns {object} Ergebnis der beschriebenen Operation.
   */
  function hinge(parent, child, axis, dir) {

    const pivot = new THREE.Group();  // Trägergruppe der jeweiligen Scharnierachse.

    pivot.position[axis === 'y' ? 'x' : 'y'] = (dir * S) / 2;
    child.position[axis === 'y' ? 'x' : 'y'] = (dir * S) / 2;
    pivot.add(child);
    parent.add(pivot);
    return pivot;
  }

  const joints = {
    left: hinge(faces[0].holder, faces[1].holder, 'y', -1),
    right: hinge(faces[0].holder, faces[2].holder, 'y', 1),
    outer: hinge(faces[2].holder, faces[3].holder, 'y', 1),
    top: hinge(faces[0].holder, faces[4].holder, 'x', 1),
    bottom: hinge(faces[0].holder, faces[5].holder, 'x', -1),
  };                                                                                              // Die fünf gemeinsamen Scharniere des verbundenen Würfelnetzes.

  /**
   * Setzt die fünf Scharnierwinkel des verbundenen Würfelnetzes.
   * @param {number} amount - Schließanteil des verbundenen Netzes zwischen null und eins.
   * @returns {void} Kein Rückgabewert.
   */
  function fold(amount) {

    const a = (amount * Math.PI) / 2;  // Erster Interpolationswert beziehungsweise berechneter Scharnierwinkel.

    joints.left.rotation.y = -a;
    joints.right.rotation.y = a;
    joints.outer.rotation.y = a;
    joints.top.rotation.x = -a;
    joints.bottom.rotation.x = a;
  }
  fold(1);
  root.updateMatrixWorld(true);

  const sequence = [4, 5, 1, 0, 2, 3];                                                            // Reihenfolge der sechs Kameraperspektiven.

  /**
   * Leitet die äußere Kamerapose aus der tatsächlichen geschlossenen Flächenmatrix ab.
   * @param {number} index - Kennung der gewünschten Station beziehungsweise Index der Papierfläche.
   * @returns {object} Ergebnis der beschriebenen Operation.
   */
  function poseForFace(index) {

    const holder = faces[index].holder;                               // Räumliche Trägergruppe einer Papierfläche.
    const center = holder.getWorldPosition(new THREE.Vector3());      // Geometrischer Mittelpunkt der aktuellen Papierfläche.
    const quat = holder.getWorldQuaternion(new THREE.Quaternion());   // Räumliche Ausrichtung der aktuellen Papierfläche.
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);  // Aus der Flächenrotation berechnete äußere Normale.
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);      // Aus der Flächenrotation berechnete lokale Aufwärtsrichtung.
    const pos = center.clone().addScaledVector(normal, 5);            // Äußere Kameraposition vor der aktuellen Papierfläche.
    const mat = new THREE.Matrix4().lookAt(pos, center, up);          // Blickmatrix zur Ableitung einer stabilen Kamerapose.

    return {
      center,
      quat: new THREE.Quaternion().setFromRotationMatrix(mat),
    };
  }

  const poses = sequence.map(poseForFace);                                                        // Aus den realen Flächenmatrizen berechnete geschlossene Kameraposen.
  const halfTurn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);  // Lokale halbe Kameradrehung vom oberen zum unteren Würfelfeld.
  const midpoint = poses[0].quat
    .clone()
    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));  // Lokale Vierteldrehung für den kontinuierlichen Wechsel von TOP nach BOTTOM.

  poses[1].quat.copy(poses[0].quat).multiply(halfTurn);
  return {
    S,
    faces,
    fold,
    poses,
    midpoint,
  };
}
