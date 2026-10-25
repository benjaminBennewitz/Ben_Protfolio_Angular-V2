# Zwei Abenteurerpresets

Die neuen Porträts wurden mit dem integrierten Bildgenerator erzeugt. Das gemeinsame Original liegt unverändert unter `assets/characters/adventurer-portraits.png`. Beim Laden wird es auf 128 × 64 Pixel reduziert und in die vorhandene LCD-Palette umgesetzt. Jede Hälfte besitzt damit ein natives Raster von 64 × 64 Pixeln. Die Farbreduktion erfolgt nach der Verkleinerung; die Anzeige selbst verwendet keine Glättung. Linke Hälfte: weiblich; rechte Hälfte: männlich. Die Auswahl zeigt je 64 × 64 Pixel, die Dialogansicht einen kleineren Ausschnitt desselben gewählten Porträts.

Die Spielanimationen stammen aus dem bereits integrierten Awakening-Atlas `assets/tiles/Old Tilesets/Sprites (GameboyBW).png`. Das männliche Preset verwendet unverändert y=32, x=0..95 mit zwei Vorder-, zwei Rücken- und zwei Seitenframes.

Die weibliche Figur verwendet jetzt die entspannte Grundfigur bei y=224: Vorderansicht x=64, Rückenansicht x=80 und die beiden seitlichen Schrittbilder x=96/112. Der bisherige Ausschnitt bei y=96 wirkte wie eine Haltung mit angehobenen Händen und wird dafür nicht mehr verwendet. Lange Haarsträhnen werden in der vorhandenen Canvas-Aufbereitung hinter den Körper und die gesenkten Arme gelegt; von hinten reicht das Haar über den Rücken. Die gemeinsame dunkle Kontur bleibt erhalten. Der Originalatlas wird nicht verändert, es ist kein weiteres Bildpaket nötig.

Die vier Originalbilder werden in das bestehende Sechs-Frame-Format einsortiert. Front und Rücken nutzen während der Bewegung ein ruhiges Ein-Pixel-Wippen, die Seiten die beiden vorhandenen Schrittbilder. Reduzierte Bewegung unterdrückt das zusätzliche Wippen. Alle Änderungen bleiben innerhalb des 16×16-Pixel-Rasters; Kollision und Pflanzenüberlagerung bleiben unverändert.

## Überarbeitung nach der Referenz

Die zweite Version orientiert sich am groben Pixelraster, den klaren Außenkonturen und der reduzierten Schattierung der gelieferten 64×64-Gameboy-Porträtreferenz. Figuren und Bildaufbau wurden für die beiden bestehenden Presets neu erzeugt; die abgebildeten Referenzfiguren wurden nicht ausgeschnitten oder übernommen. Die beiden kleinen Spielfiguren bleiben unverändert.

## Verwendeter Bildprompt

Referenzbild: `Screenshot 2026-10-18 001303.png`, ausschließlich als Stilreferenz. Erzeugt mit dem integrierten Bildgenerator.

```text
Create a NEW original game asset, using the attached screenshot ONLY as a style reference for the small Gameboy 64x64 portraits. Do not copy the pictured characters or screenshot layout/text. Asset: one 2:1 landscape atlas of TWO square 64x64 logical pixel portraits adjacent with no gap: adult woman adventurer on left, adult man adventurer on right. True classic 1990s handheld RPG portrait pixel art, chunky precise square pixel clusters, limited FOUR tones only. Intentionally much coarser and simpler than modern high resolution pixel-style paintings. The whole image MUST be drawn on a strict 128 by 64 logical pixel grid and uniformly nearest-neighbor enlarged. Each square panel contains a complete head and upper chest in three-quarter view, looking slightly inward, head occupying approx 34 by 40 logical pixels, shoulders contained with 4 pixel clear margins. Woman has dark hair pulled into short low ponytail with loose side locks, simple light tunic, dark travel vest/scarf, no hat. Man has short dark tousled hair, simple light tunic, dark travel vest/scarf, no hat. Both youthful adults, expressive friendly faces, similar-sized heads, fantasy villagers/adventurers, equal attention to both portraits. Strong continuous near-black contour around all facial and clothing shapes, skin uses flat light tone with minimal midtone shadows, dark hair with two or three larger highlight clusters. Palette strictly #e0e0e0 #919191 #555555 #1e1e1e. Flat solid #e0e0e0 background in both panels. No smooth shading, no photorealism, no antialiasing, no fine dithering/noise, no high frequency textures, no text, no frames, no UI, no labels, no additional people, no modern accessories, no hats. Readable and faithful to native 64x64 Gameboy portrait craftsmanship in the supplied reference.
```
