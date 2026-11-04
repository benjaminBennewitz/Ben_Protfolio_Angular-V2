"""Erzeugt die Tag- und Nachtloops „Wo das Wasser den Himmel hält“ ohne Samples."""

import argparse
from pathlib import Path
import subprocess

import numpy as np

from build_forest_music import RATE, voice, write_wav

# Grundtöne und offene Akkorde in G-Dur mit einem kurzen Ausflug nach e-Moll.
HARMONY = {
    'G': (43, 55, 62, 67, 71), 'D': (38, 54, 57, 62, 69),
    'Em': (40, 55, 59, 64, 66), 'C': (36, 55, 60, 64, 67),
    'Am': (45, 57, 60, 64, 67), 'Bm': (47, 54, 59, 62, 66),
    'Dsus': (38, 55, 57, 62, 67), 'G/B': (47, 55, 59, 62, 67),
}
SECTIONS = [
    'G D Em C G/B Am Dsus D', 'G D Em C G/B Am D G',
    'C G/B Am Em C Am Dsus D', 'Em Bm C G Am Em C D',
    'G D Em C G/B Am D G', 'C D Bm Em C Am Dsus D',
    'G D Em C G/B Am Dsus D',
]
# Das E–D–H aus dem Waldthema kehrt leise in der zweiten Zeile wieder.
THEME = [
    [(0, 74, 2), (2, 71, 1), (3, 69, 2.5)],
    [(0, 69, 2), (3, 74, 2.5)],
    [(0, 76, 2), (3, 74, 1), (4, 71, 1.8)],
    [(0, 72, 2.5), (3, 67, 2.5)],
    [(0, 71, 2), (2, 74, 1), (3, 79, 2.8)],
    [(0, 76, 3), (4, 72, 1.6)],
    [(0, 74, 2.6), (3, 76, 1), (4, 78, 1.8)],
    [(0, 79, 3.4), (4, 74, 1.5)],
]
COUNTER = [71, 69, 67, 64, 67, 72, 69, 71]


def add(output, midi, time, duration, gain, pan=0, kind='triangle'):
    """Setzt einen Ton mit kurzem Stereo-Echo in den zyklischen Puffer."""
    tone = voice(midi, duration, kind) * gain
    indices = (round(time * RATE) + np.arange(len(tone))) % len(output)
    echo = (indices + round(0.25 * RATE)) % len(output)
    stereo = tone[:, None] * np.array([1 - 0.32 * pan, 1 + 0.32 * pan])
    output[indices] += stereo
    output[echo] += 0.12 * stereo[:, ::-1]


def day_bar(output, bar):
    """Entwickelt Intro, Hauptthema, stillen Mittelteil und zweistimmigen Höhepunkt."""
    section, phrase = divmod(bar, 8)
    step, at = 5 / 14, bar * 15 / 7
    chord = SECTIONS[section].split()[phrase]
    bass, *upper = HARMONY[chord]
    add(output, bass, at, 2.7 * step, 0.16)
    if section != 3:
        add(output, bass + 12, at + 3 * step, 2.5 * step, 0.075)
    pattern = [0, 1, 2, 3, 2, 1]
    for i in ([0, 2, 3, 5] if section == 3 else range(6)):
        add(output, upper[pattern[i]], at + i * step, 0.85 * step,
            0.072 if section != 3 else 0.05, (-1) ** i * 0.62)
    day_melody(output, section, phrase, chord, upper, at, step)


def day_melody(output, section, phrase, chord, upper, at, step):
    """Spielt das Hauptmotiv und fügt zur Reprise die Gegenstimme hinzu."""
    if section == 0 and phrase < 4:
        return
    if section == 6 and phrase >= 6:
        add(output, 74 if phrase == 6 else 69, at, 3.2 * step, 0.10, -0.1, 'pulse')
        return
    notes = THEME[phrase] if section != 3 else [(1, upper[1] + 12, 2.8)]
    for offset, note, length in notes:
        if chord in ('D', 'Dsus') and note == 79 and offset == 0:
            note = 78 if chord == 'D' else 74
        add(output, note, at + offset * step, length * step,
            0.10 if section == 3 else 0.16, -0.22, 'pulse')
    if section in (4, 5):
        add(output, COUNTER[phrase], at + 0.75 * step, 2 * step, 0.077, 0.65)
        add(output, upper[1] + 12, at + 3.5 * step, 1.8 * step, 0.055, 0.65)


def night_bar(output, bar):
    """Erhält das Thema in langsamerem Takt mit weniger Anschlägen und langen Pausen."""
    section, phrase = divmod(bar, 8)
    chord = SECTIONS[[0, 1, 3, 4, 5, 6][section]].split()[phrase]
    bass, *upper = HARMONY[chord]
    at = bar * 2.5
    add(output, bass, at, 1.65, 0.13)
    for i, offset in enumerate((0, 0.82, 1.65)):
        if section == 2 and i == 1:
            continue
        add(output, upper[(i + phrase % 2) % len(upper)], at + offset, 0.67,
            0.046, (-1) ** i * 0.6)
    night_melody(output, section, phrase, chord, upper, at)


def night_melody(output, section, phrase, chord, upper, at):
    """Lässt das wiedererkennbare Motiv mit einzelnen Antworten ausklingen."""
    if (section == 0 and phrase < 4) or (section == 5 and phrase == 7):
        return
    _, note, _ = THEME[phrase][0]
    if section == 2:
        note = upper[1] + 12
    elif chord in ('D', 'Dsus') and note == 79:
        note = 74
    add(output, note, at + 0.12, 1.24, 0.11, -0.15)
    if section in (3, 4) and phrase % 2 == 0:
        add(output, COUNTER[phrase], at + 1.59, 0.61, 0.048, 0.7)


def export(output, name, render, bars, rms):
    """Mischt einen 120-Sekunden-Loop und kodiert ihn wie die Spielmusik als MP3."""
    samples = np.zeros((120 * RATE, 2))
    for bar in range(bars):
        render(samples, bar)
    samples *= min(0.69 / np.max(np.abs(samples)), rms / np.sqrt(np.mean(samples ** 2)))
    wav = output / f'{name}.wav'
    write_wav(wav, samples)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-c:a',
                    'libmp3lame', '-b:a', '128k', str(output / f'{name}.mp3')], check=True)
    wav.unlink()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    export(args.output, 'east-meadow-day', day_bar, 56, 0.105)
    export(args.output, 'east-meadow-night', night_bar, 48, 0.071)
