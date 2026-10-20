# FOLD. – Three.js Paper Engine (erste Umstellung)

Die bestehende Vanilla-JavaScript-Microsite bleibt erhalten. In Kapitel 02.A rendert `paper-three.js` drei Papierflächen mit gemeinsamen 3D-Scharnierachsen über Three.js. Während des Refold-Aktes werden echte 3D-Flächen an horizontalen, vertikalen und diagonalen Achsen bewegt. Die vorherige DOM-Geometrie bleibt als Fallback erhalten.

## Technik und Einschränkungen

- Three.js wird als ES-Modul von jsDelivr geladen. Für einen Offline-/Produktionsbetrieb sollte die freigegebene Version lokal unter `assets/` installiert werden.
- Die neue Engine ist zunächst auf Kapitel 02.A begrenzt. Der funktionierende Hero und die anderen Kapitel bleiben unverändert.
- Die drei Halbierungen zeigen die geometrische Abfolge, sind aber noch keine physikalische Simulation eines durchgehend verformbaren Papiermeshes. Die letzte diagonale Faltung muss visuell abgenommen werden.
- Papiergrafiken werden aktuell als Canvas-Texturen erzeugt. Für exakte Übernahme aller HTML-Layouts brauchen wir später separate, gestaltete Texturassets.
- WebGL-/Import-Fehler lassen das ursprüngliche DOM-Fallback sichtbar.
- Reduced Motion verwendet weiterhin die HTML-Variante.

## Nächste Schritte

1. Das gefaltete Papierpaket in einem echten Browser auf Vorder-/Rückseiten und Tiefenreihenfolge prüfen.
2. Three.js lokal vendoren und einen Offline-Test durchführen.
3. Die Hero-Faltung erst nach erfolgreicher 02.A-Abnahme auf die gemeinsame Engine umstellen.
4. Anschließend das Würfelnetz geometrisch verbinden.
