# GROWTH 2.0 — Procedural Authoring Edition

Eigenständiges Projekt, unabhängig von GROWTH v2.0 (Prototyp).

## Start

```bash
python -m http.server 8080
```

Dann http://localhost:8080/ öffnen. Three.js wird aus dem CDN geladen.

Debug-Oberfläche: http://localhost:8080/?debug=1

## Architektur

- `src/main.js`: Rendering, Scroll/Kamera, Kapitel und Interaktionen
- `src/world.js`: bisherige Geometriegeneratoren, benannte Layer
- `src/config.js`: validierte Seeds und steuerbare Parameter
- `src/random.js`: deterministische Zufallsströme
- `src/debug.js`: Layer-Toggles, JSON-Preset-Export/-Import per Eingabefeld

Die Generatoren teilen **keinen** Zufallszustand zwischen den Layern. Beim Hinzufügen neuer
Steine verändert sich z. B. die Zufallsfolge der Astgenerierung nicht.

## Presets

Die Debug-Ansicht zeigt die aktuelle Konfiguration als JSON. Ändern und `Apply / Reload`
wählen. `Export JSON` sichert den Zustand (Parameter und Seeds), `Copy JSON` kopiert ihn.
Ein JSON-Preset kann in das Textfeld eingefügt und mit `Apply / Reload` geladen werden.
Die URL enthält die angewendete Konfiguration und kann geteilt werden.

**Abgrenzung:** Ein Preset friert Parameter und Seeds ein, nicht die komplette Geometrie.
Reproduzierbarkeit gilt bei gleicher Generatorversion. Ein GLB-/Geometrie-Snapshot
und echtes Hot-Reload einzelner Generatoren sind bewusst nicht implementiert.

Die WebGL-Szene muss im Browser geprüft werden. `node --check` validiert Syntax,
nicht GPU-Shader oder Bildwirkung.


## Stand dieses Patches

- stärker verschmolzene, organischere Buttresses statt raketenhafter Flügel
- zusätzliche oberirdische Wurzeln und feuchtere Bodenszenerie
- flacher Sumpf/Tümpel an einer Seite des Baums
- zusätzliche Lianen
- mehr Astmasse auf der rechten/hinteren Kronenseite


## Stand dieses Patches 2.2

- Buttresses deutlich stärker miteinander verbunden
- zusätzliche Basis-Web-Struktur gegen sternförmige Lücken
- kleinerer Taper des Stamms bis etwa Mitte Kapitel 03
- Lianen vollständig entfernt
- bisherige Sumpf-/Tümpel-Erweiterung bleibt erhalten

## v2.5
- Stammdurchmesser um 20 % reduziert (bei erhaltener Brettwurzel-Ausladung)
- Tümpel mit unregelmäßigem, feuchtem Ufer, Erdübergang und Ufersteinen

## 2.6 Detailrunde
- 3D-verankerte pulsierende Infopunkte, keine Kapitel-Infobuttons mehr
- zusätzliche Stammvegetation, Fächerpilze und Moos
- Bromelien in Kapitel 03 verdichtet
- Lianen hängen monoton abwärts, ohne aufwärtsführende Schleifen
- Start: python -m http.server 8080


## v2.7
Fixierte Exemplare mit sichtbarkeitsgeprüften 3D-Hotspots, angeschlossene kleine Infoblasen ohne Modal-Overlay, dichterer Bewuchs am Stammfuß, weniger Bewuchs über Kapitel 03 und weicher Kamera-Rückzug zwischen 00 und 01.


## Stand dieses Patches 2.8

- rote Bromelie mit roten Blüten für Kapitel 03
- zusätzliche Bromelien mit roten Blüten im mittleren Höhenbereich
- zusätzlicher Entdeckungspunkt für Kapitel 04
- zusätzlicher Entdeckungspunkt für Kapitel 07 / Luftreinigung
- technischer gestaltete Info-Box mit Datenraster
- punktabhängige Öffnungsrichtung der Boxen
- Hauptastansatz etwas tiefer gesetzt


## Hotfix 3.0.1
- Schwebenden Blattcluster in Kapitel 06 entfernt.
- Luftreinigungs-Infopunkt als absichtlich bildschirmfester Marker links im Kronenbereich (34 % Breite, 39 % Höhe) für Kapitel 06/07 platziert.
- Öffnungsrichtung links, weg vom rechtsstehenden Kapiteltext.


Patch 3.0.2: hellere Discovery-Dialoge, Wasseranimation mit sanften Wellen und schwimmenden Blättern, Kronenpunkt nur in Kapitel 06 sichtbar.


Patch 3.0.3: Google Fonts entfernt; lokal verfügbare Systemschriftarten verwendet. Dichter segmentierte Wassergeometrie mit stärkeren, überlagerten Ufer- und Stammkreiswellen sowie deutlicher treibenden Blättern.
