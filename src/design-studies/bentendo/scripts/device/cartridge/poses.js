export const CARTRIDGE_POSES = {
  partial: [0, 0.0335, -0.0152],
  seated: [0, 0.0192, -0.0152],
  removed: [0, 0.004, -0.12],
};

/** Ermittelt den bündigen Sitz unabhängig von der tatsächlichen Modellhöhe. @param {number} shellTop Gehäuseoberkante. @param {number} modelTop Moduloberkante am Ursprung. */
export function flushHeight(shellTop,modelTop) { return shellTop-modelTop-0.0001; }

/** Interpoliert die angepasste Schachtposition ohne Änderung des eingerasteten Zustands. @param {object} poses Angepasste Modulpositionen. @param {number} progress Vorschub zwischen null und eins. */
export function insertionPosition(poses,progress) {
  const position=[];
  for (let i=0;i<3;i++) position.push(poses.partial[i]+(poses.seated[i]-poses.partial[i])*progress);
  return position;
}
