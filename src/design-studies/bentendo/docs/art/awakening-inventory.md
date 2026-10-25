# Awakening: geprüfte und verwendete Ausschnitte

Die folgenden Ressourcen liegen bereits im Projekt. Für diesen Ausbau wurden keine neuen Assetpakete benötigt. Originaldateien bleiben unverändert; Ausschnitte, Transparenz und LCD-Palette werden beim Laden oder Rendern verarbeitet.

| Ressource | Vorhandene Originaldatei unter assets/tiles | Ausschnitt in Pixeln |
| --- | --- | --- |
| Runde Bäume | Old Tilesets/Overworld (GameboyBW).png | x192, y0, 32×32 |
| Spitze Bäume | NEW Overworld (Classic)(v2).png | x272, y256, 32×32 |
| Lose Blumen, vier Frames | NEW Overworld (Classic)(v2).png | x112/128/144/160, y32, je 16×16 |
| Einzelne Grashalme | NEW Overworld (Classic)(v2).png | x128/144, y48/64, je 16×16 |
| Geschlossene Wiesenränder | NEW Overworld (Classic)(v2).png | x112/128/144, y80/96/112, je 16×16 |
| Nördliche Felswand | NEW Overworld (Classic)(v2).png | x400, y64/80, je 16×16 |
| Wasserfallseiten und Ufer | NEW Overworld (Classic)(v2).png | x384/416, y32, je 16×16; schmale Uferstücke x392/416 |
| Stilisierter Höhleneingang | NEW Overworld (Classic)(v2).png | x352, y16, 16×16 |
| Große Tonvase | NEW Dungeons (v2).png | x64, y0, 16×16 |
| Kleine Tonvase | NEW Dungeons (v2).png | x0, y416, 16×16 |
| Frosch, Ruhe-/Sprungbild (Darstellung 12×12) | Old Tilesets/Sprites (GameboyBW).png | Ruhe x128, Bewegung x144; y0/16, je 16×16 |
| Schlange, zwei Frames (Darstellung 10×10) | Old Tilesets/Sprites (GameboyBW).png | x528, y0/16, je 16×16 |
| Vogel, Sitzbild und Flügel | Old Tilesets/Sprites (GameboyBW).png | x592 y0; x608 y0/16, je 16×16 |

Die neuen Blumen- und Grashalmbilder besitzen im Atlas einen festen Grasuntergrund in RGB(144,152,104). Nur dieser genaue Quellfarbwert wird vor der Palettenumsetzung transparent gesetzt. Dadurch bleiben Randabschlüsse und Untergrund konsistent; Blüten und Halme behalten ihre Originalpixel. Die Vasen verwenden das bereits geladene Dungeon-Sheet.

Die Tiere stehen weit rechts im vollständigen Spriteatlas und waren im zuvor betrachteten kleinen Ausschnitt nicht enthalten. Künftige Assetentscheidungen sollen anhand des vollständigen Atlasses erfolgen.

Quelle und Nutzungsbedingungen: [Awakening: Complete Tileset — Sodacoma](https://sodacoma.itch.io/awakening-complete-tileset); weitere Credits stehen in ../asset-credits.md.

Wasserfall: vier horizontale Animationsframes bei x496/512/528/544, Körper y64/80, Gischt y96. Ruhiger Fluss: x560/576/592/608, y64. Alle aus NEW Overworld (Classic)(v2).png. Die nördlichen Reihen y0/1 sind Felswand; nur Höhlenschwelle und Wasserfall unterbrechen die untere Wandreihe.
