# Tagesablauf, Tiere und Nachtruhe

Stand: 25. Oktober 2026. Ergänzung zu `abendwald-und-spielzeit.md`.

## Uhrzeit und Tagesphasen

Die zentrale Spielzeit bleibt maßgeblich. Die Türuntersuchung führt mindestens zu 19:00 Uhr, der Tagesabschnitt Nacht beginnt um 20:00 Uhr. Die Ortskarte zeigt jetzt Tagesabschnitt und genaue Spielzeit, beispielsweise `Nacht · 21:00`. Der laufende Browserspielstand kann nur vor Ort abgelesen werden; Projektdateien enthalten nicht die individuelle Uhr des Spielers.

| Zeitraum | Bewohner | Tiere und Häuser |
| --- | --- | --- |
| 06:00–17:00 | Normale Tagesorte; der Hausmeister arbeitet nach der Gildenöffnung in der Gilde | Häuser wieder zugänglich; Tagtiere ab 07:00 Uhr aktiv |
| 17:00–19:00 | Gemeinsamer Abend im Wirtshaus | Tiere noch draußen |
| 19:00–20:00 | Abendgäste im Wirtshaus | Wilde Tagtiere verborgen; Katzen und Hund schlafen; Nachtmusik aktiv |
| 20:00–06:00 | Nur Hausmeister und Leserin bleiben als späte Gäste beim Wirt | Wohn- und Arbeitshäuser geschlossen; Wirtshaus bleibt offen |

Die Ortswechsel werden aus dem aktuellen Tagesabschnitt projiziert, ohne neue Kopien im Spielstand anzulegen. Die vorhandene Spielfigur, Inventare, Funde und Quests bleiben unverändert. Der sichtbare Straßenweg der Bewohner zum Wirtshaus ist in dieser ersten Umsetzung nicht animiert. Während eines bereits laufenden Gesprächs bleibt die Person bis zum Schließen des Dialogs erhalten, auch wenn sich ihr Zeitplan inzwischen ändert.

## Personen und Aufenthaltsorte

Die bekannten Bewohner sind dieselben Personen mit denselben Kennungen, Grafiken und Questaktionen: Wirtin, Anglerin, Weberin, Handwerker, Leserin, Hausmeister, Müller, Frau Moos, Weberlehrling, Gesellin, Lagerwartin, Mara und Eda. Tamo stößt nach seiner ersten Waldbegegnung dazu. Tagsüber stehen sie wieder an ihren bisherigen Orten; der zuvor doppelte Hausmeister steht nach der Gildenöffnung innerhalb der Gilde.

Der Wirt bleibt für Ausschank und Getränke verfügbar. Seine Bedienwege sowie ein Barhocker und ein Tischplatz für den Spieler bleiben trotz sitzender Abendgäste frei. Möbel, Türen, Treppe und Spielerposition werden bei der Wahl der Gästepositionen berücksichtigt. Die Standorte bleiben während eines Raumbesuchs stabil. Normale Geh-/Idleanimationen bleiben an den Tagesorten erhalten; die Gesprächsplätze im Wirtshaus sind ruhende Stand- und Sitzpositionen. Sitzplätze, Gespräche und die erweiterte Bettruhe sind in `wirtshaus-gesellschaft-und-bettruhe.md` beschrieben.

Die erste Begegnung mit Tamo am Waldweg bleibt auch nachts verfügbar, bis er angesprochen wurde. Danach gilt sein normaler Tagesplan. Der Hausmeister beendet eine bereits begonnene Führung zur Gilde unabhängig von der Uhrzeit; diese kurze laufende Questsequenz wird nicht unsichtbar abgebrochen.

Bekannte personenbezogene Questmarker berücksichtigen die Abendorte. Auf der Dorfkarte führen sie dann zum Wirtshaus; im Gastraum markieren sie die tatsächliche bekannte Person. Bei schlafenden Personen gibt es keinen irreführenden Anwesenheitsmarker. Es werden keine zusätzlichen unbekannten Personen oder Lösungen markiert. Aufgaben und Belohnungen verfallen nachts nicht; bei Bedarf kann im eigenen Bett bis zum Morgen geschlafen werden.

## Tiere

Alle derzeit draußen eingesetzten Wildtiere, darunter Eichhörnchen, Igel, Mäuse, Frösche und Schlangen, sind zwischen 19:00 und 07:00 Uhr nicht sichtbar und blockieren auch keine Laufwege. Das gilt für Bruchstein und sämtliche Waldabschnitte. Ein später als `wildlife` hinzugefügtes Kaninchen nutzt dieselbe Regel. Sitzende Vögel ziehen sich weiterhin mit der Dämmerung zurück. Es werden keine neuen nachtaktiven Tiere eingeführt.

Die Katze am Wirtshaus ruht auf dem Dach bei (4,9), die östliche Katze auf dem Dach des Wohnhauses bei (29,19). Ihre Zeichentiefe liegt ausdrücklich über dem jeweiligen Dach. Der Hund schläft bei (27,23) neben dem Hauseingang, ohne die Tür oder deren Ankunftsfeld zu versperren. Die Haustiere haben eine unbewegte Ruhepose und ein kleines kontrastreiches `zzz` über dem Kopf. Die Schlafmarkierung hebt sich bei reduzierter Bewegung nicht auf und ab.

Ein laufendes Apportierspiel endet bei einsetzender Nachtruhe verlustfrei. Der Ast bleibt im Inventar, seine Reservierung wird aufgehoben. Auch über den Rucksack lässt sich der schlafende Hund nicht erneut zum Spielen auffordern. Am Morgen werden die normalen Routen wieder aktiv; unsichtbare oder schlafende Tiere reservieren keine alten Bewegungsfelder.

## Türen und Musik

Ab 20:00 Uhr respektiert die Figur beim Betreten vom Dorf aus die Nachtruhe: Wohnhaus, Webstube, Werkstatt, Marktlager, Mühle und Gilde bleiben geschlossen. Eine kurze Meldung erläutert dies. Ab 06:00 Uhr sind die Eingänge wieder benutzbar. Das Wirtshaus mit Gästezimmern bleibt zugänglich. Bereits betretene Häuser können jederzeit verlassen werden; vorhandene Innentreppen werden nicht gesperrt. Die technische Ostpass-Werkstation und die Dungeons sind keine privaten Wohnhäuser und behalten ihre vorhandenen Zugangsregeln.

Die Bruchstein-Nachtmusik spielt nun ab 19:00 Uhr auch in sämtlichen Dorfhäusern, im Wirtshaus und dessen Gästezimmern sowie in der Gilde. Bei Aufenthalt im Haus wechselt der Track mit derselben Uhr wie draußen. Musikdateien, BGM-/SFX-Regler, Stummschaltung und der bestehende Audiomanager bleiben erhalten. Dungeons und Ostpass-Werkstation behalten ihre eigenen Titel. Der Wald verwendet weiterhin seine eigene Nachtmusik.

## Assets, Speicherung und Prüfung

Keine neuen Fremdassets. Bewohner und Haustiere verwenden die bisherigen Grafiken mit den bestehenden Credits. Die Katzenruhepose und das kleine Schlafzeichen sind projektspezifische Canvas-Zeichnungen; die Hundepose nutzt einen ruhenden Frame des vorhandenen Hundesprites. Keine weiteren Musikdateien oder Musikcredits.

Der Tagesplan ergibt sich aus der bereits gespeicherten `worldMinutes`. Gästeplätze und vorübergehende Bewegungszustände werden zur Laufzeit abgeleitet. Bestehende Spielstände benötigen weder Neustart noch Questreset. Die Speicherrichtlinie bleibt unverändert: Raumwechsel oder ausdrückliches Speichern, kein periodisches Autosave.

220 automatisierte Tests bestanden. Neun neue Prüfungen decken eindeutige Abendgäste, Erreichbarkeit aller Gespräche, Möbelüberlagerungen, freie Treppe, Thekenbedienung, Nachtruhe der Tiere, geschützte Haustierplätze, Astreservierung, nächtliche Türen und deren Zeitgrenzen, sichere Ausgänge, wandernde bekannte Questmarker, Uhranzeige, Laden sowie Nachtmusik in allen Dorfhäusern ab. Bestehende Wald- und Storytests verwenden die neuen Abendorte. JavaScript- und Python-Prüfung bestanden. Abendlicher und nächtlicher Gastraum, schlafende Haustiere, Karte mit genauer Uhrzeit, geschlossener Hauseingang und Rückkehr am Morgen wurden mit dem produktiven Canvas-Renderer visuell geprüft. Kein vollständiger manueller WebGL-/Mobile- oder abschließender Hörtest.


## Sitzende Gesellschaft und Bettruhe

Die nächste Erweiterung lässt Gäste an vorhandenen Tischen und Barhockern sitzen und kurze Frage-Antwort-Wechsel führen. Das eigene Bett bietet Morgen, Abend und Nacht als Aufwachzeit. Details und Prüfungen stehen in `wirtshaus-gesellschaft-und-bettruhe.md`.
