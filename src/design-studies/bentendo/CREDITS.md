# BENTENDO™ – Quellen und Credits

B² / Benjamin Bennewitz: Konzept, Gestaltung und Entwicklung des Projekts mit Codex-Unterstützung. BENTENDO und DUNGEON WANTED sind fiktive Projektnamen dieser unabhängigen Handheld-Hommage. Keine Verbindung zu Nintendo; Nintendo und Game Boy sind Marken ihrer jeweiligen Rechteinhaber.

## Externe Bestandteile

| Bestandteil | Quelle / vorhandener Nachweis |
| --- | --- |
| Three.js | Lokale Laufzeit unter `vendor/three/`; MIT-Lizenz in `vendor/three/LICENSE` |
| Tiny5 | Lokale Pixelschrift; SIL Open Font License in `assets/fonts/OFL-Tiny5.txt` |
| Awakening-Grafiken | Sodacoma, <https://sodacoma.itch.io/awakening-complete-tileset>; vorhandene Welt-, Flora-, Innenraum- und Spritegrafiken |
| NPC-Grafiken | 5yvalia, <https://5yvalia.itch.io/rpg-type-retro-top-down-npc-sprites>; vorhandenes NPC-Sheet |
| Kleine Tiere | GamebowGames, <https://gamebowgames.itch.io/16x16-small-animals-for-use-with-gbstudio> |
| Hund, Rehe und Hirsch | Vom Nutzer geliefertes Minifolks-Forest-Animals-Paket; Wolfgrafik als Dorfhund, `MiniDeer1` und `MiniDeer2` mit Kontur für die Ostwiesen. Im gelieferten Projekt ist kein vollständiger Hersteller-/Lizenznachweis hinterlegt. |
| GBFX-Effekte | Yogi / Tronimal, <https://yogi-tronimal.itch.io/gbfx>; CC BY 4.0 laut `assets/sounds/gbfx/CREDITS.txt`. Gelieferte FX-Hammer-Bank in WAV umgewandelt, gemeinsamer Pegel angepasst. |
| Dungeonatlas GBDungeon | Nutzerdateien `GBDungeon.png` und `GB Dungeon.tsx`; vorhandener Herkunftsvermerk in `assets/tilesets/gb-dungeon/SOURCE.txt`. Dieser Vermerk enthält noch keinen Urheber- oder Lizenznachweis. |
| Handheld-3D-Modell | Gelieferte `gameboy.glb` und `assets/source/gameboy.blend`; Urheber und genaue Ausgangslizenz sind in den gelieferten Unterlagen noch zu ergänzen. |

## Projektspezifische Inhalte

„Wo das Wasser den Himmel hält“ (Tag und Nacht) ist eine eigene Chiptune-Komposition für die Ostwiesen. Beide Fassungen werden ohne fremde Samples mit `scripts/audio/tools/build_meadow_music.py` erzeugt.

Die Gegner im Quellgewölbe (Spinne, Käfer und Schlange) sind eigene Pixelzeichnungen. Die bereitgestellten Beispiele aus JugglingDinos Gameboy RPG Asset Pack dienten als Stilreferenz. Aus dem Paket wurden dafür keine Sprites übernommen.

Cartridge-Gestaltung, Charakterporträts und Titelgrafiken enthalten für das Projekt mit Bildgenerierung erstellte Inhalte. Eigene Musikgeneratoren und Web-Audio-Effekte sind unter `scripts/audio/` dokumentiert. Die detaillierte Herkunft der übrigen vorhandenen Musikdateien ist über die Entwicklungsunterlagen zu vervollständigen; es wird keine pauschale Fremd- oder Eigenurheberschaft behauptet.

Die Integrationsarbeit fügt keine neuen externen Musik-, Modell- oder Grafikpakete hinzu. Die Projektkarte verwendet eine eigene SVG-Zeichnung und einen vom vorhandenen Spielrenderer erzeugten Ausschnitt. Diese Liste beschreibt die im bereitgestellten Projekt belegte Herkunft; fehlende Nachweise werden ausdrücklich benannt und nicht durch angenommene Lizenzen ersetzt.

- Ostwiesen: ausgewählte Wasser-, Ufer-, Gras-, Schilf- und Wasserfelsgrafiken aus dem bereitgestellten Paket **Free 1.1** (Ordner `Water Tiles` und `Nature`).
