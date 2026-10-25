"""Komponiert zwei eigene Nachtstücke aus den vorhandenen prozeduralen Stimmen."""

from pathlib import Path
import sys
import numpy as np
from build_forest_music import RATE, STEP, place, write_wav

CHORDS = {
    'forest': [(40, 55, 59, 66), (45, 57, 60, 64),
               (48, 55, 59, 64), (47, 54, 59, 66),
               (40, 55, 59, 64), (43, 55, 59, 62),
               (45, 57, 60, 64), (47, 54, 59, 63)],
    'town': [(43, 55, 59, 62), (50, 57, 62, 66),
             (40, 55, 59, 64), (48, 55, 60, 64),
             (45, 57, 60, 64), (50, 57, 60, 66),
             (43, 55, 59, 62), (50, 57, 62, 66)],
}
MELODIES = {
    'forest': [(71, 74), (72, 76), (71, 67), (69, 66),
               (67, 71), (74, 71), (72, 69), (66, 63)],
    'town': [(71, 74), (69, 66), (67, 71), (72, 76),
             (72, 69), (66, 69), (67, 71), (69, 66)],
}


def add(output, note, at, length, gain, pan=0, kind='triangle'):
    """Nutzt dieselbe zyklische Synthese wie der Tageswald, mit Sekundenpositionen."""
    place(output, note, at / STEP, length / STEP, kind, gain, pan)


def forest_bar(output, bar):
    """Trägt das dunkle Waldmotiv mit ruhigen Akkorden und weit auseinanderliegenden Antworten."""
    bass, *chord = CHORDS['forest'][bar % 8]
    at = bar * 2
    add(output, bass, at, 1.7, 0.12)
    for index, note in enumerate(chord):
        add(output, note, at + index * 0.06, 1.85, 0.028, index - 1)
    first, reply = MELODIES['forest'][bar % 8]
    add(output, first, at + 0.15, 1.05, 0.095, -0.2)
    if bar % 4 != 3:
        add(output, reply, at + 1.4, 0.48, 0.065, 0.4)
    if bar >= 16:
        add(output, chord[1] + 12, at + 1, 0.65, 0.024, 0.7)


def town_bar(output, bar):
    """Wiegt Bruchstein in einen warmen Dreiertakt mit eigener wiederkehrender Melodie."""
    bass, *chord = CHORDS['town'][bar % 8]
    at = bar * 2
    add(output, bass, at, 1.3, 0.13)
    for beat in [2 / 3, 4 / 3]:
        for index, note in enumerate(chord):
            add(output, note, at + beat, 0.55, 0.035, index - 1)
    first, reply = MELODIES['town'][bar % 8]
    add(output, first, at + 0.08, 1.1, 0.09, -0.2)
    add(output, reply, at + 4 / 3, 0.58, 0.075, 0.25)
    if bar >= 16 and bar % 2 == 0:
        add(output, chord[0] + 12, at + 0.7, 0.45, 0.023, 0.6)


def compose(region):
    """Schreibt 64 Sekunden ohne Schlagzeug und mit ruhigerem Pegel als die Tagesmusik."""
    output = np.zeros((64 * RATE, 2))
    render = forest_bar if region == 'forest' else town_bar
    for bar in range(32):
        render(output, bar)
    rms = np.sqrt(np.mean(output ** 2))
    scale = min(0.65 / np.max(np.abs(output)), 0.09 / rms)
    return output * scale


if __name__ == '__main__':
    destination = Path(sys.argv[1])
    destination.mkdir(parents=True, exist_ok=True)
    for name in ['forest', 'town']:
        write_wav(destination / f'{name}-night.wav', compose(name))
