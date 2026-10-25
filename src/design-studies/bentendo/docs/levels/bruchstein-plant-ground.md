# Geschlossene Wiesen, Pflanzenüberlagerung und Brunnenfreistellung

Die versetzten, überlappenden Wiesenrechtecke bei der Schenke, im nordwestlichen Hain und im Südosten sind zu vollständigen rechteckigen Pflanzflächen zusammengeführt. Dadurch entstehen an den Zusammenstößen keine ausgesparten Felder und offenen Innenecken mehr. Alle verbundenen hohen Wiesen werden zusätzlich auf eine vollständig gefüllte rechteckige Fläche geprüft. Die vorhandenen geschlossenen Randgrafiken bleiben erhalten.

Beim Durchlaufen von Büschen und hohem Gras wird eine zweite Pflanzenebene über die unteren sechs Pixel der Spielfigur gezeichnet. Kopf und Oberkörper bleiben sichtbar. Die Pflanzenebene verwendet die vorhandenen originalen Awakening-Blätter beziehungsweise Grashalme. Sie ist an den Gelände-Kacheln verankert und auf die tatsächliche Pflanzenfläche begrenzt; sie bewegt sich nicht mit der Figur. Interpolierte Schritte über Feldgrenzen werden berücksichtigt. Außerhalb der Vegetation und in Innenräumen gibt es keine zusätzliche Maskierung. Die Kollision bleibt unverändert.

Freier Boden erhält eine sehr sparsame, ortsfeste Körnung und einzelne kleine Steinchen in den vorhandenen LCD-Farben. Die Platzierung ist deterministisch und wird mit dem bisherigen statischen Boden gecacht. Es entstehen weder laufende Zufallsberechnungen noch zusätzliche Animationsframes oder Kollisionsobjekte.

Der Brunnen steht in einer 4×4 Felder großen ungepflasterten Fläche. Rund um seine 2×2 Felder große Grundfläche bleibt genau eine volle Reihe frei und begehbar. Die Körnung ist dort dezent; der gepflasterte Dorfplatz schließt außen an. Die neue Geländekennung e bezeichnet diese freie Erde und wird auch auf der Ortskarte berücksichtigt. Brunnenposition, Dialog, Kollision und Dorfaufgaben bleiben erhalten.

39 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Die zusätzlichen Prüfungen sichern sämtliche geschlossenen Wiesenkomponenten sowie die durchgehend freie ungepflasterte Brunnenreihe. Die drei betroffenen Wiesenbereiche, die Buschüberlagerung, Bodenstruktur und Brunnenansicht wurden per Canvas gerendert und visuell geprüft. Ein vollständiger Browser-/WebGL-Test war hier nicht verfügbar.

Dieser Folgepatch setzt `BENTENDO_Konsistenz_Felswand_Wasserfall_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Enthalten sind ausschließlich neue oder geänderte Dateien, keine Löschungen und keine zusätzlichen Asset-Downloads.

## Ergänzung: Tiere

Dieselbe Pflanzenüberlagerung gilt jetzt auch für Katzen, Hund und sämtliche am Boden laufenden Kleintiere. Der gemeinsame Renderer verwendet deren interpolierte Zeichenposition statt der bereits reservierten Zielzelle. Dadurch passt die Überlagerung auch während eines Schrittes und beim Betreten oder Verlassen einer Pflanzenfläche. Die Vögel in den Baumkronen bleiben auf ihrer eigenen Ebene. Für die Überlagerung gibt es keine zusätzlichen Timer oder Kollisionsänderungen.

Der kleine Folgepatch BENTENDO_Tiere_Pflanzenueberlagerung_Patch.zip setzt den Gras-/Buschmaskierungs-/Brunnen-Patch voraus. Er enthält nur die hierfür geänderten Dateien.
