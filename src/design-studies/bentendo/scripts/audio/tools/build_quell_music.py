"""Erzeugt einen ruhigen, nahtlos zyklischen Chiptune für das Quellgewölbe."""

from pathlib import Path
import sys
import wave
import numpy as np

RATE = 32000
BEAT = 60 / 84
BARS = 16
CHORDS = [(38, 41, 45), (38, 41, 45), (34, 38, 41), (36, 39, 43),
          (38, 41, 45), (41, 45, 48), (39, 43, 46), (36, 39, 43)]
MELODY = [(0, 62, 1.5), (2, 65, 0.75), (3, 63, 0.6),
          (8, 62, 1), (9.5, 60, 0.75), (11, 57, 0.7),
          (16, 62, 1.5), (18, 63, 0.8), (20, 65, 1),
          (24, 67, 1), (26, 65, 0.8), (27, 63, 0.7), (30, 62, 1.4)]


def voice(midi, seconds, kind):
    """Synthesiert leise, begrenzte Puls- oder Dreieckstöne ohne Pitchrutschen."""
    time = np.arange(int(seconds * RATE)) / RATE
    phase = 2 * np.pi * 440 * 2 ** ((midi - 69) / 12) * time
    tone = np.zeros(len(time))
    for harmonic in range(1, 12):
        if kind == 'triangle':
            if harmonic % 2:
                tone += (-1) ** ((harmonic - 1) // 2) * np.sin(phase * harmonic) / harmonic ** 2
        else:
            tone += np.sin(np.pi * harmonic * 0.25) * np.sin(phase * harmonic) / harmonic
    attack = np.minimum(1, time / 0.015)
    release = np.minimum(1, (seconds - time) / 0.08)
    return tone * attack * release * np.exp(-time / (seconds * 0.8))


def place(output, midi, beat, length, kind, level, pan=0):
    """Mischt einen Ton samt leisem zyklischem Echo in den vollständigen Loop."""
    tone = voice(midi, length * BEAT, kind) * level
    indices = (int(beat * BEAT * RATE) + np.arange(len(tone))) % len(output)
    for channel, gain in enumerate([1 - pan * 0.3, 1 + pan * 0.3]):
        np.add.at(output[:, channel], indices, tone * gain)
        echo = (indices + int(BEAT * RATE * 0.75)) % len(output)
        np.add.at(output[:, channel], echo, tone * 0.13 * (2 - gain))


def compose():
    """Komponiert sechzehn Takte mit zurückhaltendem Bass, Tropfenarpeggien und zwei Melodiephrasen."""
    output = np.zeros((round(BARS * 4 * BEAT * RATE), 2))
    for bar in range(BARS):
        chord = CHORDS[bar % len(CHORDS)]
        place(output, chord[0], bar * 4, 3.5, 'triangle', 0.24)
        for step, index in enumerate([0, 2, 1, 2]):
            place(output, chord[index] + 12, bar * 4 + step + 0.5, 0.42,
                  'pulse', 0.065, -0.6 if step % 2 else 0.6)
    for offset in [0, 32]:
        for beat, midi, length in MELODY:
            place(output, midi, beat + offset, length, 'pulse', 0.09)
    return output * (0.72 / np.max(np.abs(output)))


def write_wav(path, samples):
    """Schreibt die deterministische Stereo-Hördatei als PCM ohne zusätzliche Metadaten."""
    with wave.open(str(path), 'wb') as stream:
        stream.setnchannels(2)
        stream.setsampwidth(2)
        stream.setframerate(RATE)
        stream.writeframes((samples * 32767).astype('<i2').tobytes())


if __name__ == '__main__':
    write_wav(Path(sys.argv[1]), compose())
