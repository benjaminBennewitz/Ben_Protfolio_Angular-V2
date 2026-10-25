# Freigestellte Kiefern, Bewohnersprüche und exklusive Meldungen

## Baumränder

Der spitze Awakening-Baum hatte einen deckenden hellen Atlasuntergrund. Der native Ausschnitt (272, 256, 32, 32) wird jetzt einmalig beim Laden freigestellt. Entfernt werden ausschließlich Pixel der äußeren Hintergrundfarbe, die mit dem Rand verbunden sind. Die eingeschlossenen hellen Glanzpixel in Krone und Stamm bleiben erhalten. Im echten Ausschnitt werden 248 Außenpixel transparent. Alle Kiefern verwenden dieselbe vorbereitete Grafik; Originalatlas, normale Bäume, Kollisionen und Zeichenreihenfolge bleiben erhalten.

## Bewohner und Wirt

Bewohner in Sichtweite sagen gelegentlich kurze Alltagszeilen oder Hinweise auf echte Fundstellen. Nach dem Betreten vergehen mindestens zehn Sekunden aktiver Erkundungszeit; weitere Versuche folgen nach zwölf bis 22 Sekunden, mit jeweils fünf Sekunden Lesezeit. Es spricht immer nur eine Person. Die Figur bleibt steuerbar, der Spruch erfordert keine Bestätigung und erzeugt keinen zusätzlichen Klang. Es gibt keine zusätzlichen Intervall-Timer; die vorhandene Spielaktualisierung übernimmt die Planung. Reduzierte Bewegung behält statische Figuren und erhält weiterhin die gelegentlichen Textmeldungen.

Wirt, Wirtin, Anglerin, Weberin, Handwerker, Leserin, Müller, Frau Moos und Hausmeister besitzen eigene Alltagszeilen. Hinweise betreffen den Gästetisch-Zettel, die Vase in der Schenke, den Reisebericht im Marktlager, die Reisekiste im südöstlichen Gras, die Beschlagkiste und die Archivvase. Bereits entdeckte Fundstellen werden nicht mehr als unentdeckt empfohlen. Hausmeister-Sprüche im Dorf starten erst nach dem Öffnen der Gilde; sein Aufgabenablauf bleibt vorrangig.

Bei gewöhnlicher Ansprache bleibt zuerst die vorhandene Einführung erhalten; danach wechseln die Antworten ohne unmittelbare Wiederholung. Broschenquest, Rückgabe und Krimskrams-Tausch werden weiterhin zuerst geprüft. Offene Questdialoge von Frau Moos und der spezielle Hausmeisterdialog behalten ihre bisherigen Aussagen. Gelegentliche Äußerungen sind davon unabhängig möglich. Menüs, Dialoge und Ortsmeldungen pausieren die Planung. Neustart leert die Gesprächshistorie.

## Nur eine Anzeige

Die beobachtete Überlagerung entstand, weil Aktionshinweis und Ortsmeldung beide am unteren Bildschirmrand gezeichnet wurden. Der Renderer wählt jetzt zentral genau eine Anzeige. Dialog, Inventar/Journal/Karte, Ortsmeldung, Bewohnerspruch und Aktionshinweis werden nicht gleichzeitig gezeichnet. Ein Raumwechsel verwirft alte Dialogseiten und Bewohnersprüche und ersetzt die Ortsmeldung. Ein neuer Dialog verwirft ältere Orts-/Bewohnermeldungen; nach seinem Schließen tauchen sie nicht wieder auf.

## Prüfung und Installation

56 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Neue Prüfungen decken Wirtssprüche in der Nähe, Bewegung während eines Spruchs, Pausen, Distanz, Wiederholungen, zustandsabhängige Hinweise, exklusive Anzeigen sowie erhaltene Glanzpixel bei transparentem Baumrand ab. Bestehende Quests, Funde, erreichbare Möbel und Audioverhalten bleiben geprüft. Canvas-Sichtprüfung von Baumrändern, Wirtshinweis und Ortsmeldung bestanden. Ein vollständiger Browser-/WebGL-Test war hier nicht verfügbar.

Dieser Folgepatch setzt `BENTENDO_Audio_Balance_Tueren_Truhenjubel_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Ausschließlich neue oder geänderte Dateien, keine Löschungen oder zusätzlichen Asset-Downloads.
