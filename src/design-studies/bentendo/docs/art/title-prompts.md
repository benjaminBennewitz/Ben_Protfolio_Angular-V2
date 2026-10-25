# Dungeon Wanted — Assetquellen

Beide Original-PNGs wurden mit dem integrierten Imagegen-Werkzeug erstellt.
Referenz war der von Ben gewählte Dungeon-Tor-Entwurf vom 15.10.2026.
Die Originaldateien bleiben unverändert; `title-screen.js` rastert sie einmalig
auf Zielgröße und reduziert sie auf die vier gemeinsamen LCD-Farben.
Das Logo wird unabhängig vom Hintergrund gezeichnet. Fackelflammen, Menü,
Gildenaushang und Rasterblende stammen aus dem Code.

## dungeon-background.png — finaler Prompt

Edit this approved Game Boy title-screen concept to produce ONLY THE BACKGROUND ASSET, without any title lettering, without START text, without selection arrow, without B2 mark. Preserve its atmosphere and architecture: frontal symmetrical closed wooden double door in an arched medieval dungeon guild entrance, masonry, banners, cobblestone stairs, small notice scroll right of door. Replace all title lettering in upper 42 percent with quiet very dark stone masonry, low contrast, because a separate title logo will be composited there. Keep door visible in middle/lower half. Remove the flames only but keep the two empty torch sconces; the flame animation will be drawn separately in code. Sconces approximately 28% and 72% across, 65% down image. Bottom 12% simple cobblestones, quiet enough for a separate menu. Aspect ratio 10:9. Strict four-color olive pixel art, colors #c4cf91 #8e9f58 #4c623b #203323. Simplify for an actual 160x144 pixel display, large 1-pixel clusters, clean bold edges, modest detail, no antialiasing, no gradients, no smooth lighting, no UI, no letters anywhere, no characters, no watermark. This is a production background layer, not a new promotional mockup.

## dungeon-logo.png — finaler Prompt

Extract and faithfully recreate ONLY the original title logo from this approved concept as a clean isolated game asset on a genuinely transparent background. Exact text DUNGEON on top row and WANTED on bottom row. Preserve the angular monumental carved stone block-letter design, clipped corners and original letter silhouettes, thick dark outline and stepped lower-right extrusion, clear chiseled highlights. No scene, no wall, no door, no torches, no START, no other text, no border or backdrop, no checkerboard baked into image. Use ONLY four flat olive shades #c4cf91 #8e9f58 #4c623b #203323 plus transparent. Strong readable low-resolution pixel-art clusters, two rows tightly composed, restrained stone cracks not busy texture. This will be drawn at only 144x56 logical pixels, so prioritize bold legibility and large simple forms. Entire logo must fit with a small transparent margin and no cropping. Wide aspect ratio about 2.5:1. Do not add new decorations.

## Laufzeitgrößen

- Hintergrund: 160 × 144 Pixel.
- Logo: 156 × 61 Pixel, transparent.
- Gesamtes Display: 160 × 144 Pixel mit Nearest-Filter.

Der finale Code nutzt das Logo etwas größer als im Prompt vorgesehen, damit
die Lesbarkeit in der tatsächlichen Zielauflösung erhalten bleibt.
Diese Quelldokumentation muss nicht in den Production-Build kopiert werden.
