# GROWTH. — A Living World

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/growth/)

A theme-led technical study exploring how a tree and its habitats can become an explorable 3D web experience. The subject determines the spatial journey; procedural modeling, camera work, and rendering are the main implementation challenge.

> [!NOTE]
> This is a non-commercial, experimental study in graphic design and web development, created for personal learning. It is not a production product or a commercial service. Its specific design and technical objectives are described below. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Intent and learning focus

**Primary focus: interpreting a specific theme through interactive 3D.**

The starting point is the tree as a connected living environment, from underground roots to the canopy and atmosphere. The question is how that subject can be experienced spatially in a browser rather than presented only through photographs, diagrams, or a sequence of flat sections.

The theme determines the structure: upward movement becomes an ascent, height becomes a navigation principle, and different habitats become stages of the journey. Vegetation, water, fog, light, and explanatory markers help relate the technical scene to the subject.

The main learning challenge is technical: building a convincing procedural world, composing a continuous camera route, and connecting 3D positions with readable HTML annotations. Typography, color, and the expedition-like HUD support that interpretation. The study does not begin by translating a named historical graphic-design style.

## Concept and visual direction

The opening sits at the bottom of the document. Scrolling upward moves through roots, forest floor, trunk, epiphytes, hidden habitats, canopy, and the view above it.

Dark forest colors, light accents, large Barlow Condensed typography, and a technical HUD combine natural imagery with an expedition interface. An altitude display follows the camera. Fog, atmospheric layers, and animated water give the scene depth.

## Interaction experiments

- Camera height and orientation follow document scrolling, with chapter text rendered as HTML above the scene.
- Chapter navigation links to height sections. “Begin Ascent” moves from the opening toward the forest floor.
- Discovery points explain fungi, epiphytes, bromeliads, and canopy functions through small connected popovers.
- Most markers follow 3D positions and visibility checks. The atmospheric marker on the left of the canopy is intentionally placed in screen space.
- The sound control is explicitly disabled; audio functionality is not implemented.

## Technical approach

Three.js and WebGL generate the scene, with VanillaJS coordinating document state and interaction. The tree, roots, vegetation, and environment are procedural; this version does not require an external tree mesh. Some textures are generated with Canvas.

| Area | File |
| --- | --- |
| Chapters, HUD, and popovers | [index.html](index.html) |
| Startup, scroll state, and frame coordination | [scripts/main.js](scripts/main.js) |
| Renderer, camera, and lights | [scripts/scene.js](scripts/scene.js) |
| Camera flight and discovery | [scripts/camera-flight.js](scripts/camera-flight.js), [scripts/discovery.js](scripts/discovery.js) |
| Water and atmospheric motion | [scripts/environment-motion.js](scripts/environment-motion.js) |
| Ordered world assembly | [scripts/world.js](scripts/world.js) |
| Geometry generators and layers | `world/` |
| Validated seeds and parameters | [scripts/config.js](scripts/config.js) |
| Deterministic random streams | [scripts/random.js](scripts/random.js) |
| Authoring controls and presets | [scripts/debug.js](scripts/debug.js) |
| Styling and local font references | [styles.css](styles.css) |
| Portfolio card screenshot | [assets/preview.webp](assets/preview.webp) |

Generator areas use separate random streams. Ground changes therefore do not automatically reseed the branches. Presets capture seeds and parameters; reproducibility depends on the same generator version. They are not frozen geometry or GLB snapshots.

The authoring interface includes layer toggles and JSON import/export. Applying a configuration reloads the scene; the URL can carry its parameters. Individual generators are not hot-swapped.

The learning focus is procedural geometry, deterministic authoring, scroll-driven camera composition, and coordinating DOM annotations with a 3D scene.

## Motion and limitations

Reduced-motion preferences skip camera interpolation and freeze water and atmospheric time. A WebGL-capable browser remains necessary. Syntax checks do not validate shaders or visual output, and the study has not been presented as a complete accessible alternative to a 3D experience.

## Portfolio integration and sources

The study is served at `/design-studies/growth/`. Angular publishes the standalone files. Three.js is loaded from a CDN; Barlow Condensed, DM Sans, and DM Mono are shared local portfolio fonts under `/assets/fonts/studies/`. There is no Google Fonts request.

Original generators, design, and content are covered by the portfolio license. Three.js and the fonts retain their own terms.

The tree and environment are generated procedurally with Three.js and Canvas. This is code-generated scene content, not AI-generated forest photography. The portfolio preview is a screenshot of the rendered scene.


## Wartungsstruktur nach dem Refactoring vom 28.10.2026

Der Einstieg bleibt `index.html` → `scripts/main.js`. Die Seitensteuerung liegt unter `scripts/`, die Generatoren unter `world/` und die CSS-Datei direkt im Growth-Hauptverzeichnis. Assets, Presetdatei und die bestehende Three.js-Version bleiben unverändert. Es werden keine neuen Laufzeit-Abhängigkeiten oder Build-Schritte benötigt.

### Zuständigkeiten und privater Zustand

| Datei | Aufgabe |
| --- | --- |
| `scripts/main.js` | Verbindet Welt, Kamera, Discovery und Debug-Panel; koordiniert Scroll-Updates, Höhenanzeige und Frames. |
| `scripts/scene.js` | Erstellt Renderer, Szene, Perspektivkamera und Beleuchtung. |
| `scripts/camera-flight.js` | Kapselt geglätteten Fortschritt und Aufstiegsstatus; berechnet Umlaufbahn, Blickhöhe und Beleuchtungsübergänge. |
| `scripts/discovery.js` | Kapselt die ausgewählte Entdeckung, Markerprojektion, Raycast-Verdeckung, Popover und redaktionelle Beschreibungstexte. |
| `scripts/environment-motion.js` | Aktualisiert Wasserwellen, schwimmende Blätter, Nebel und die Ausblendung unterirdischer Objekte. |
| `scripts/config.js` | Validiert bekannte Seeds und Parameter und liest sie fehlertolerant aus der URL. |
| `scripts/random.js` | Liefert reproduzierbare 32-Bit-Zufallsströme. |
| `scripts/debug.js` | Erstellt Layer-Schalter und JSON-Editor; trennt Anwenden, Exportieren und Kopieren in einzelne Aktionen. |
| `scripts/world.js` | Führt den Aufbau in der ursprünglichen Reihenfolge aus und stellt die unveränderte öffentliche Welt-Schnittstelle bereit. |
| `world/core.js` | Gemeinsame Materialien, Rindentextur, Stammprofil, Asthelfer und aktive Layer-/Zufallsverwaltung. |
| `world/trunk.js` | Stammsegmente und unregelmäßige Stammwülste. |
| `world/roots.js` | Brettwurzeln, verbindende Wurzelhülle, Oberflächenwurzeln und unterirdische Wurzelmasse. |
| `world/terrain.js` | Gelände, Teich, schwimmende Blätter, Ufer und ausblendbare Erddecke. |
| `world/ground.js` | Farn, Unterholz, Pilze, Laubstreu, Steine und Details des unterirdischen Wurzelraums. |
| `world/branches.js` | Haupt- und Seitenäste, Blattanker und zusammengesetzte Einzelblattgeometrien. |
| `world/canopy.js` | Instanzierte Blattmassen, Kronenlückenschluss, Rindenmoos und Lianen. |
| `world/epiphytes.js` | Aufsitzerpflanzen, Pilzkolonien und stabile Discovery-Exemplare. |
| `world/atmosphere.js` | Wolkentextur, Nebelshader, Wolkenkarten und Partikel. |
| `world/geometry.js` | Gemeinsamer Aufbau indizierter Oberflächen aus Positionen, UVs und Dreiecksindizes. |
| `world/layers.js` | Stellt `scene.add` wieder her und verwaltet manuell ausgeblendete Layer. |

`world.js` reicht Abhängigkeiten und Ergebnisse in einem lokalen Aufbau-Kontext weiter. Jeder Generator deklariert durch seine Parameter, welche Werte er verwendet, und gibt nur die später benötigten Ergebnisse zurück. Der Kontext ist kein globaler Zustand und wird nicht als zusätzliche öffentliche API angeboten.

### Reihenfolge und Reproduzierbarkeit

Der Ablauf bleibt: gemeinsame Grundlagen → Stamm → Wurzeln → Gelände → Bodenleben und unterirdische Details → Äste → Blattkrone, Moos und Lianen → Aufsitzer → Atmosphäre → Layer-Steuerung. Insbesondere werden spätere Geometriehelfer weiterhin erst unter dem jeweils aktiven Zufallsstrom aufgerufen.

`core.js` hält den tatsächlich aktiven Stream privat in `activeRandom`. Der stabile `random()`-Helfer leitet jeden Aufruf an diesen Stream weiter. Diese Indirektion ist erforderlich: Würde jeder Generator beim Entpacken des Kontexts einen veralteten Stream festhalten, könnten dieselben Seeds nach dem Aufteilen der Dateien andere Geometrien erzeugen.

Die ursprüngliche Registrierung über `scene.add` bleibt während des synchronen Aufbaus aktiv. Nach Abschluss stellt `layers.js` die Originalmethode wieder her. Discovery-Kennungen, Layer-Namen, URL-Parameter und Achievement-Ereignisse bleiben erhalten. Die bisherigen Motion-Regeln bleiben ebenfalls erhalten; insbesondere verwenden schwimmende Blätter weiterhin ihre ursprüngliche Animationszeit.

### Verbindlicher Schreibstil

- Jede JavaScript-Funktion einschließlich Callbacks besitzt JSDoc mit Parametern und Rückgabewert.
- Normale Variablen erhalten einzeilige Kommentare rechts neben der Deklaration. Die Kommentarstarts sind innerhalb des jeweiligen Deklarationsbereichs ausgerichtet. Bei mehrzeiligen Deklarationen folgt der Kommentar hinter dem Abschluss der Deklaration.
- Variablenblöcke innerhalb von Funktionen werden durch eine Leerzeile davor und danach vom übrigen Code getrennt. Zusammengehörige Deklarationen bleiben als Block stehen.
- Zwischen Funktionen steht eine Leerzeile. Mehrfachdeklarationen wurden in einzelne Deklarationen aufgelöst.
- Der Richtwert für Funktionen beträgt etwa 20 Codezeilen. Dokumentation, Leerzeilen und ausführliche Datenliterale sind keine zusätzlichen Verantwortlichkeiten.
- Bewusste Ausnahmen bleiben zustandsgekapselte Factory-/Aufbaufunktionen und zusammenhängende mathematische Geometrieoperationen. Dazu gehören insbesondere die Brettwurzel-Abtastung, zusammengesetzte Astfamilien, Blattinstanzen und Wolkenrauschen. Hier haben unveränderte Zufallsreihenfolge, lesbare Formeln und funktionierende Geometrie Vorrang vor einer rein mechanischen Aufteilung.

Beispiel:

```js
function updateScroll() {

  const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); // Nutzbarer Scrollbereich.

  // Bestehende Scroll-Logik.
}
```

### Prüfung dieses Stands

- Syntax, lokale Modulimporte und JSDoc-Abdeckung aller 146 Funktionen geprüft; alle normalen Variablendeklarationen außerhalb von Schleifenköpfen besitzen ihre Kommentare.
- Konfigurationsvalidierung mit sieben Eingaben sowie drei URL-Fällen gegen den Ausgangsstand verglichen.
- Fünf Zufalls-Seeds mit jeweils 1.024 Folgewerten gegen den Ausgangsstand verglichen: identisch.
- Die vollständige Welt für das Standard-Preset und ein verändertes Seed-/Parameter-Set verglichen: Objekttransformationen, Positions-/Normalen-/UV-Puffer, Indizes, Materialwerte, Shadertexte, Canvas-Texturen, Layer-Zuordnung und Discovery-Anker sind identisch. Das Standard-Preset umfasst 9.479 Szeneobjekte und 6.911 unterschiedliche Geometrien; der zweite Fall 8.042 Objekte und 5.645 Geometrien.
- Kamera, Blickrichtung, Hintergrund, Nebel, Wasserpuffer, schwimmende Blätter und Marker an sechs Scrollpositionen mit und ohne Reduced Motion gegen den Ausgangsstand verglichen: identisch. Debug-Layer-Schalter und die Wiederherstellung ausgeblendeter Layer geprüft.

Die Vergleichstests verwendeten die unveränderte Three.js-Version 0.180.0 und kontrollierte Frame-Zeitstempel. Für die Laufzeitzustandsvergleiche war die fortlaufende Rasterausgabe pausiert; daraus wird keine pixelgenaue Gleichheit aller animierten Frames oder ein vollständiger GPU-/Cross-Browser-Test abgeleitet. Ein vollständiger Angular-Build ist nicht Teil dieser Prüfung.

### Übernahme des Änderungs-ZIPs

Das ZIP enthält ausschließlich die tatsächlich geänderten oder neuen Dateien unter `src/design-studies/growth/`. Es kann im Wurzelverzeichnis des bestehenden Portfolios entpackt werden. Nach Übernahme der neuen Ordnerstruktur kann der bisherige Ordner `src/design-studies/growth/src/` gelöscht werden; alle seine Laufzeitdateien sind in den neuen Pfaden enthalten.

## Inhaltliche Anpassung nach dem Refactoring

Der separate Moos-Discovery-Punkt „Ein lebender Teppich“ und sein einzelnes Marker-Moospolster wurden entfernt, da für diesen Punkt weder ein eigener Textabschnitt noch ein erkennbarer Moosteppich vorhanden war. Die fünf verbleibenden Entdeckungen beginnen mit Pilzen und Aufsitzerpflanzen. Dekoratives Rindenmoos bleibt unverändert. Das Discovery-Achievement richtet sich weiterhin dynamisch nach allen tatsächlich vorhandenen Punkten und benötigt deshalb jetzt fünf Entdeckungen. Die oben dokumentierten Gleichheitsvergleiche beziehen sich auf den vorherigen reinen Refactoring-Stand; diese gezielte inhaltliche Entfernung ist eine anschließende Änderung.

## Ordnerstruktur ohne zusätzliches src-Verzeichnis

`index.html` bindet `styles.css` und `scripts/main.js` ein. `scripts/world.js` importiert die Generatoren aus dem benachbarten Verzeichnis `world/`; `world/core.js` bezieht den Zufallshelfer aus `../scripts/random.js`. Die lokalen Font-URLs beginnen weiterhin mit `/assets/` und benötigen durch den Umzug keine Anpassung.

Die CSS-Datei enthält den Entwicklerkopf mit Autor und Signatur im Stil der Swiss-Studie, ein Inhaltsverzeichnis und 22 korrespondierende Abschnittsmarkierungen. Die Regeln sind lesbar formatiert. Deklarationen und Kaskadenreihenfolge bleiben erhalten; spätere Layout-Verfeinerungen stehen deshalb weiterhin nach den Grundregeln.

### Verschobene Dateien und Übernahme

| Bisher relativ zu Growth | Jetzt relativ zu Growth |
| --- | --- |
| `src/*.js` | `scripts/*.js` |
| `src/world/*.js` | `world/*.js` |
| `src/styles.css` | `styles.css` |

Nach dem Entpacken dieses Änderungs-ZIPs den alten Ordner `src/design-studies/growth/src/` entfernen. Die HTML-Einbindungen verweisen bereits auf die neuen Pfade. Das ZIP selbst kann alte Dateien beim Entpacken nicht löschen. Alle verschobenen Laufzeitdateien sind enthalten; unveränderte Assets werden nicht erneut mitgeliefert.
