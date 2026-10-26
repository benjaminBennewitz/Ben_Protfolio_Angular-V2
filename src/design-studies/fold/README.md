# FOLD. — There Is Always Another Side

[← Studienübersicht](../../../README.md#standalone-design-studies) · [Studie öffnen](https://b2folio.de/design-studies/fold/)

Experimentelle 3D-Experience über Perspektivwechsel. Sechs gestaltete Seiten bilden ein gemeinsames Würfelobjekt, das sich durch Scrollen beziehungsweise Wischen erkunden und am Ende zu einem zusammenhängenden Netz entfalten lässt.

## Konzept und Gestaltung

**THERE IS ALWAYS ANOTHER SIDE.** Papierweiß und dunkle Druckfarbe treffen auf Blau, Koralle und Gelb. Space Grotesk und DM Mono verbinden großformatige Aussagen mit technischen Randnotizen. Die Gestaltung nutzt Seitenwechsel als Erzählprinzip: Das Objekt bleibt zusammenhängend, während Kamera und Blickwinkel wechseln.

Die sechs Perspektiven tragen die Aussagen FOLD, LOOK CLOSER, TURN THE WORLD, CHANGE THE ANGLE, SAME PAGE. NEW WORLD und THE WHOLE PICTURE.

## Interaktionen

- Auf Desktop steuert der normale Body-Scroll die Kamerafahrt zwischen den sechs Würfelseiten.
- Auf mobilen Touchgeräten führt ein bewusster vertikaler Swipe jeweils zur nächsten oder vorherigen Station. Eine Fortschrittsanzeige begleitet die Geste.
- Beim Finale fährt die Kamera zurück, richtet das Objekt aus und öffnet die verbundenen Flächen entlang ihrer Scharniere zum Würfelnetz.
- Die entfalteten Flächen führen zu ihrer jeweiligen Perspektive zurück.
- Der mobile Unfold besitzt eine eigene längere Animationsphase; eine weitere Geste führt zum regulär erreichbaren Footer.

## Aktuelle technische Umsetzung

Die aktive Version verwendet **Three.js mit CSS3DRenderer**. Die sichtbaren Flächen sind HTML-Elemente, die als CSS3D-Objekte in einer gemeinsamen Szene angeordnet werden. Kamera, Quaternionen und verschachtelte Scharniergruppen bestimmen ihre räumlichen Beziehungen. Es handelt sich nicht um eine WebGL-gerenderte Papierphysik.

| Bereich | Datei / Verzeichnis |
| --- | --- |
| Einstieg, Importmap, Szene und Footer | [index.html](index.html) |
| Typografie, Papierflächen und responsive Zustände | [style.css](style.css) |
| Aktive Szene, Kamerafahrt, Faltung und Touchsteuerung | [experience.js](experience.js) |
| Vorschau und weitere Studienassets | `assets/` |

Die Importmap lädt Three.js und den CSS3DRenderer aus einem CDN. `script.js` und `paper-three.js` sind Dateien früherer Umsetzungsstände und werden vom aktuellen Einstieg nicht geladen. Sie beschreiben nicht die aktive Laufzeitarchitektur.

## Performance und Bedienbarkeit

CSS3D-Matrixupdates entfallen bei ruhenden Kapitelansichten; bei verstecktem Tab pausiert die Verarbeitung. Nicht aktive Flächen erhalten `inert` und passende ARIA-Zustände. Bei `prefers-reduced-motion` werden Scrolltweens und Glättung übersprungen und die schwebende Netzbewegung deaktiviert; die räumliche Navigation bleibt bestehen.

Die Faltung verwendet ebene Flächen und festgelegte Scharniere. Elastische Papierkrümmung, Knüllphysik und eine physikalische Simulation sind nicht Bestandteil der Studie. Bei fehlgeschlagener Modulinitialisierung erscheint ein Fallback-Hinweis.

## Lokal entwickeln und integrieren

Im Portfolio-Stamm `npm start` ausführen und `/design-studies/fold/` öffnen. Für eine vollständige lokale Darstellung ist dieser Weg vorzuziehen: Die Schriftdateien werden unter `/assets/fonts/studies/` aus dem Portfolio geladen. Alternativ den gesamten `src`-Ordner über HTTP ausliefern und von dort `/design-studies/fold/` aufrufen.

Für die CDN-Module ist eine Netzwerkverbindung erforderlich. Eine eigene npm-Installation für die Studie ist nicht nötig. Angular übernimmt die statische Auslieferung über seine Asset-Konfiguration.

## Inhalte und Rechte

Gestaltung und projektspezifische Umsetzung: Benjamin Bennewitz / B². Es gilt die [Portfolio-Lizenz](../../../LICENSE); Three.js und die verwendeten Schriften unterliegen ihren jeweiligen eigenen Bedingungen.
