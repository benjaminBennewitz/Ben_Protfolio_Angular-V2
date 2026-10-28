# FOLD. — There Is Always Another Side

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/fold/)

A technical study in spatial web composition, camera movement, and connected folding behavior. Six HTML faces form one 3D object; the visual theme of changing perspectives gives the implementation a narrative.

> [!NOTE]
> This is a non-commercial, experimental study in graphic design and web development, created for personal learning. It is not a production product or a commercial service. Its specific design and technical objectives are described below. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Intent and learning focus

**Primary focus: implementing a connected spatial interaction in the browser.**

The central question is how six designed web panels can behave as faces of one object: the viewpoint changes, the panels remain spatially related, and the same object eventually unfolds into a connected net.

The main challenge is technical. Camera orientation, quaternion interpolation, hinge hierarchies, scroll progress, and deliberate mobile gestures must produce one continuous and understandable transition. The final unfolding is part of the same geometry and interaction model, rather than a separate replacement scene.

The editorial statements, color, and typography make those spatial relationships legible and give the movement a theme. They support the experiment; the starting point is the interaction and its 3D implementation, not the translation of an established graphic-design style.

## Concept and visual direction

**THERE IS ALWAYS ANOTHER SIDE.** Paper white and dark ink meet blue, coral, and yellow. Space Grotesk and DM Mono combine oversized statements with technical marginal notes. Changing the viewpoint becomes the narrative: the object remains connected while the camera moves around it.

The six perspectives carry the statements FOLD, LOOK CLOSER, TURN THE WORLD, CHANGE THE ANGLE, SAME PAGE. NEW WORLD, and THE WHOLE PICTURE.

## Interaction experiments

- Desktop document scrolling drives the camera between six cube faces.
- On mobile touch devices, a deliberate vertical swipe advances or returns by one station. A progress indicator accompanies the gesture.
- At the finale, the camera retreats, aligns the object, and opens connected panels along their hinges.
- The unfolded panels link back to their corresponding perspectives.
- Mobile unfolding has its own longer animation phase; a further gesture reaches the regular footer.

## Current technical approach

The active implementation uses **Three.js with CSS3DRenderer** and VanillaJS. Visible faces are HTML elements placed as CSS3D objects in one scene. The camera, quaternions, and nested hinge groups determine their spatial relationships. This is not a WebGL paper-physics simulation.

| Area | File / directory |
| --- | --- |
| Entry, import map, scene mount, and footer | [index.html](index.html) |
| Typography, panels, and responsive states | [style.css](style.css) |
| Startup and fallback | [scripts/experience.js](scripts/experience.js) |
| CSS3D stage and connected paper model | [scripts/stage.js](scripts/stage.js), [scripts/paper-model.js](scripts/paper-model.js) |
| View transitions and navigation | [scripts/view.js](scripts/view.js), [scripts/navigation.js](scripts/navigation.js) |
| Frame scheduling | [scripts/frame-loop.js](scripts/frame-loop.js) |
| Preview and other study assets | `assets/` |

The import map loads Three.js and CSS3DRenderer from a CDN. `scripts/legacy/script.js` and `scripts/legacy/paper-three.js` belong to earlier implementations and are not loaded by the current entry page.

The learning focus is spatial HTML composition, quaternion-based camera movement, linked folding geometry, and translating scroll progress into deliberate touch navigation.

## Performance and limitations

CSS3D matrix updates are skipped in resting chapter views, and processing pauses while the tab is hidden. Inactive faces use `inert` and matching ARIA states. Reduced-motion preferences skip scroll tweens and interpolation and disable the floating net motion; spatial navigation still exists.

The folding system uses flat panels and predefined hinges. Elastic paper bending, crumpling, and physical material simulation are outside its scope. Failed module initialization displays a fallback notice. The experiment does not claim complete keyboard, assistive-technology, or reduced-motion equivalence.

## Portfolio integration and sources

The study is served at `/design-studies/fold/` through Angular's asset configuration. Fonts are shared portfolio assets under `/assets/fonts/studies/`. The CDN modules require a network connection.

Original design and implementation are by Benjamin Bennewitz / B². Three.js and the fonts retain their own terms.

The visible cube faces and folding composition are rendered from HTML and CSS3D transforms. Procedural presentation and animation are distinct from AI-generated imagery; the active experience does not use a generated video to simulate its folding sequence.


## Wartung und Prüfung vom 28.10.2026

Der aktive Einstieg ist `index.html` → `scripts/experience.js`. Das bisherige komprimierte Sammelskript wurde nach fachlichen Aufgaben getrennt. Es gibt keine zusätzlichen Laufzeit-Abhängigkeiten und keinen neuen Build-Schritt. Die vorhandene Import Map und die Three.js-Version 0.180.0 bleiben erhalten.

| Modul | Zuständigkeit |
| --- | --- |
| `scripts/experience.js` | Lädt Three.js innerhalb der bisherigen Fehlerbehandlung; verknüpft Bühne, Modell, Ansicht und Navigation und registriert Größenänderungen. |
| `scripts/stage.js` | Erstellt CSS3D-Renderer, Kamera, gemeinsame Wurzelgruppe und Bodenschatten. |
| `scripts/face-content.js` | Unveränderte Texte, Farben und Kennungen der sechs Papierflächen. |
| `scripts/paper-model.js` | Erstellt die sechs HTML-Flächen, fünf Scharniere und Kameraposen aus den tatsächlichen geschlossenen Flächenmatrizen. |
| `scripts/view.js` | Kapselt besuchte Perspektiven und das Achievement; trennt geschlossene Würfelansicht, äußere Kamerafahrt, Finale und Eingabe-/ARIA-Zustände. |
| `scripts/navigation.js` | Kapselt mobile Stationen und Gesten; trennt normale Kapitelwechsel, längere Netzentfaltung und den Übergang zum regulären Footer. |
| `scripts/interaction-surface.js` | Stellt die echte Papierfläche 05 in ihrer Ruhepose für native Maus- und Tastatureingabe bereit und gibt sie vor weiteren 3D-Bewegungen zurück. |
| `scripts/frame-loop.js` | Kapselt geglätteten Fortschritt und Frame-Zeitstempel; überspringt ruhende Ansichten und pausiert die Verarbeitung bei verborgenem Dokument. |
| `scripts/math.js` | Gemeinsame Begrenzung, lineare Interpolation und geglättete Übergangsfunktion. |
| `scripts/legacy/` | Die beiden früheren, nicht geladenen Implementierungen. Sie bleiben als Archiv erhalten und sind ebenfalls formatiert und dokumentiert. |

Der sichtbare Würfel und das offene Netz verwenden weiterhin dieselben sechs physischen HTML-Flächen. Die Trennung erzeugt weder eine zweite Finalszene noch zusätzliche Seitenkopien. CDN-Importe bleiben dynamisch innerhalb der Start-Fehlerbehandlung; ein Ladefehler zeigt weiterhin den bestehenden Fallback.

### Schreibstil

Alle 103 JavaScript-Funktionen einschließlich Callbacks besitzen JSDoc. Normale Variablen haben rechts ausgerichtete einzeilige Kommentare. Variablenblöcke innerhalb von Funktionen werden durch Leerzeilen vom übrigen Code getrennt. Mehrfachdeklarationen wurden aufgelöst; zwischen Funktionen steht eine Leerzeile.

Der Richtwert von etwa 20 Codezeilen dient der Trennung von Aufgaben. Einzelne Factory-Funktionen mit privaten Helfern, zusammengehörige Kamerageometrie, Gestenauswertung sowie archivierte Abläufe bleiben länger. Bestehende Interaktionsreihenfolge und Geometrie haben dabei Vorrang vor rein mechanischen Aufteilungen. Ein nicht verwendeter interpolierter Mittelpunkt in der geschlossenen Kamerafahrt wurde entfernt; er hatte keinen Einfluss auf die Ausgabe.

`style.css` enthält Entwicklerkopf, Autor und Signatur im Stil der Swiss-Studie sowie ein Inhaltsverzeichnis mit 20 korrespondierenden Abschnittsmarkierungen. Die Datei wurde lesbar formatiert. Die bisherigen Kaskadenverfeinerungen bleiben in ihrer ursprünglichen Reihenfolge, um Darstellung und Eingabeverhalten zu erhalten.

### Verifikation und Grenzen

- Lokale Modulpfade, JavaScript-Syntax, JSDoc-Abdeckung und normale Variablenkommentare geprüft.
- Die aktive Szene gegen den Ausgangsstand an 15 Fortschrittspositionen auf Desktop und Mobilansicht verglichen: Kamerapositionen und Quaternionen, Flächentransformationen, HTML-/ARIA-Zustände, HUD und Schatten sind identisch.
- Neun mobile Stationswechsel mit Reduced Motion geprüft, einschließlich Netzentfaltung, Footer und Rückkehr zu früheren Perspektiven: identisch zum Ausgangsstand.
- Achievement nach Besuch aller sechs Perspektiven und anschließender Entfaltung geprüft.
- Zu kurze und horizontale Wischgesten ohne Stationswechsel, vertikale Gesten mit genau einem Vor-/Rücksprung sowie der Fallback bei blockierten CDN-Importen geprüft.
- Browser-CSSOM aller 232 CSS-Regeln mit dem Ausgangsstand verglichen: identisch.
- Die ausführbare Syntax der beiden archivierten Implementierungen nach Normalisierung von Formatierung und Mehrfachdeklarationen verglichen: unverändert.

Die Vergleiche verwenden kontrollierte Aktualisierungen der CSS3D-Ausgabe. Sie belegen keine vollständige Gleichheit aller zeitabhängigen Zwischenframes, keinen umfassenden Accessibility-Audit und keinen Cross-Browser-Test. Ein vollständiger Angular-Build wurde nicht ausgeführt. Die zum Testen verwendeten Werkzeuge werden nicht als neue Projektabhängigkeiten mitgeliefert.

### Änderungs-ZIP übernehmen

Das ZIP enthält ausschließlich die geänderten, neuen oder verschobenen Dateien unter `src/design-studies/fold/`. Im Projektwurzelverzeichnis entpacken. Anschließend diese bisherigen Dateien im Fold-Hauptverzeichnis löschen:

- `src/design-studies/fold/experience.js` → Einstieg jetzt `scripts/experience.js`
- `src/design-studies/fold/script.js` → Archiv jetzt `scripts/legacy/script.js`
- `src/design-studies/fold/paper-three.js` → Archiv jetzt `scripts/legacy/paper-three.js`

`index.html` verweist bereits auf den neuen Einstieg. `style.css` bleibt direkt im Fold-Hauptverzeichnis. Assets werden nicht erneut mitgeliefert.

## Korrektur der Eingabe auf Perspektive 05

In der vollständig ausgerichteten 90°-CSS3D-Pose konnte der Browser den sichtbaren Button von Seite 05 nicht als Klickziel treffen. Die ursprüngliche Eingabefreigabe war korrekt, trotzdem traf `elementFromPoint` nur die Renderer-Hülle. Die vorherigen Zustandsvergleiche des Refactorings erfassten diesen tatsächlichen Maus-Hit-Test nicht.

`interaction-surface.js` verschiebt deshalb dieselbe physische Papierfläche nach dem Rendern vorübergehend in die bereits vorhandene native Interaktionsebene. Voraussetzung sind die aktive Seite 05, ihre exakte Ruhepose und ein geschlossenes Würfelkapitel. Die projizierte Größe bleibt erhalten. Vor dem nächsten 3D-Render wird das Element wieder an seinen ursprünglichen DOM-Container zurückgegeben. Es werden keine Papierflächen oder Buttons geklont; das Netz besteht weiterhin aus denselben sechs Flächen. Größenänderungen invalidieren den Frame-Zustand, damit Projektion und Interaktionsebene neu berechnet werden.

Im Browser wurden bei 1440, 1024 und 390 Pixeln Breite echte Pointer-Hover und Klicks auf den ruhenden Button, der Übergang zur nächsten Seite und die Rückgabe aller sechs Flächen an das geöffnete Netz geprüft. Für diese Korrektur sind keine Dateien zu löschen.
