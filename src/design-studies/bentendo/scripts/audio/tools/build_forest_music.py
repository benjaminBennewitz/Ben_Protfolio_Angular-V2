"""Komponiert den eigenen Waldloop 'Unter den Kronen' ohne externe Samples."""

from pathlib import Path
import sys
import wave
import numpy as np

RATE = 32000
STEP = 1 / 3
BARS = 32
CHORDS = [(40, 55, 59, 62), (45, 57, 61, 64),
          (43, 55, 59, 62), (47, 57, 62, 66),
          (40, 55, 59, 64), (42, 57, 61, 64),
          (45, 55, 59, 64), (47, 57, 62, 66)]
PHRASES = [[(0, 76, 2), (3, 74, 1), (4, 71, 2)],
           [(1, 73, 2), (4, 76, 1)],
           [(0, 74, 1), (2, 71, 2), (5, 69, 0.8)],
           [(1, 71, 3), (5, 74, 0.8)],
           [(0, 76, 2), (3, 79, 1), (4, 78, 1.5)],
           [(1, 76, 2), (4, 73, 1.5)],
           [(0, 74, 2), (3, 71, 1), (4, 69, 1)],
           [(0, 66, 2), (3, 69, 1), (4, 71, 1.8)]]


def voice(midi, seconds, kind):
    """Formt begrenzte Puls- und Dreiecksstimmen mit weichen Hüllkurven."""
    time = np.arange(round(seconds * RATE)) / RATE
    frequency = 440 * 2 ** ((midi - 69) / 12)
    phase = 2 * np.pi * frequency * time
    tone = np.zeros(len(time))
    for partial in range(1, min(16, int(RATE / 2 / frequency))):
        if kind == 'triangle' and partial % 2:
            tone += (-1) ** ((partial - 1) // 2) * np.sin(phase * partial) / partial ** 2
        elif kind == 'pulse':
            tone += np.sin(np.pi * partial * 0.25) * np.sin(phase * partial) / partial
    attack = np.minimum(1, time / 0.012)
    release = np.minimum(1, (seconds - time) / 0.09)
    return tone * attack * release * np.exp(-time / max(0.1, seconds * 0.8))


def place(output, midi, step, duration, kind, gain, pan=0):
    """Mischt Ton und zurückhaltende Antworten zyklisch in den vollständigen Loop."""
    tone = voice(midi, duration * STEP, kind) * gain
    indices = (round(step * STEP * RATE) + np.arange(len(tone))) % len(output)
    for channel, level in enumerate([1 - pan * 0.25, 1 + pan * 0.25]):
        np.add.at(output[:, channel], indices, tone * level)
        echo = (indices + round(1.5 * STEP * RATE)) % len(output)
        np.add.at(output[:, channel], echo, tone * 0.15 * (2 - level))


def melody(output, bar):
    """Lässt die Melodie atmen und variiert den zweiten großen Bogen mit leisen Antworten."""
    phrase = PHRASES[bar % 8]
    for offset, note, length in phrase:
        place(output, note, bar * 6 + offset, length, 'pulse', 0.085, -0.2)
    if bar >= 16 and bar % 2:
        place(output, 71 if bar % 4 == 1 else 74, bar * 6 + 5, 0.5,
              'triangle', 0.045, 0.7)


def harmony(output, bar):
    """Trägt die bekannte Melodie mit sanften Dreiklängen und einer späten Gegenstimme."""
    for index, note in enumerate(CHORDS[bar % 8][1:]):
        place(output, note, bar * 6, 5.5, 'triangle', 0.028,
              -0.6 if index % 2 else 0.6)
    if bar >= 24:
        note = CHORDS[bar % 8][2] + 12
        place(output, note, bar * 6 + 3, 1.5, 'triangle', 0.04, 0.5)


def compose():
    """Komponiert 32 Takte im 6/8-Fluss mit Dreiecksbass und hüpfenden Waldarpeggien."""
    output = np.zeros((round(BARS * 6 * STEP * RATE), 2))
    for bar in range(BARS):
        bass, third, fifth, color = CHORDS[bar % len(CHORDS)]
        place(output, bass, bar * 6, 2.4, 'triangle', 0.16)
        place(output, bass + 7, bar * 6 + 3, 2, 'triangle', 0.085)
        for step, note in enumerate([third, fifth, color, fifth, third, color]):
            place(output, note, bar * 6 + step, 0.65, 'triangle', 0.075,
                  -0.65 if step % 2 else 0.65)
        harmony(output, bar)
        melody(output, bar)
    return output * (0.70 / np.max(np.abs(output)))


def write_wav(path, samples):
    """Schreibt einen reproduzierbaren 64-Sekunden-Loop als Stereo-PCM."""
    with wave.open(str(path), 'wb') as stream:
        stream.setnchannels(2)
        stream.setsampwidth(2)
        stream.setframerate(RATE)
        stream.writeframes((samples * 32767).astype('<i2').tobytes())


if __name__ == '__main__':
    write_wav(Path(sys.argv[1]), compose())
