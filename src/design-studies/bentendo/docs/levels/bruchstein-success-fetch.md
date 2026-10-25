# Ziel-Fanfaren, Ast im Rucksack und Apportieren

## Erfolgsgeräusche

Abgeschlossene Ziele erhalten kurze, mehrstimmige Retro-Fanfaren aus rhythmischen Einzelnoten und tiefer Dreieck-Begleitung. Das Wasserrad besitzt eine eigene längere aufsteigende Melodie; Gildenöffnung, Broschenrückgabe und größere Rätselerfolge eine kompakte Questfanfare. Kleine technische Teilerfolge und das Zurückbringen des Asts verwenden einen kurzen Dreiton-Erfolg. Sie laufen über den bisherigen Effekt-Master, Lautstärkeregler und Mute. Die vorhandene Musik bleibt erhalten.

Auslöser sind das erstmalige Starten des Wasserrads, erstmalige Öffnen der Gilde, erfolgreiche Broschenrückgabe, Stromversorgung der Wartungshalle, korrektes Lager-Schaltpult, Einsetzen der Runenkupplung und vollständige Druckentlastung. Erneutes Untersuchen bereits abgeschlossener Ziele spielt keine neue Ziel-Fanfare. Jeder tatsächliche Apportier-Erfolg bekommt den kleinen Klang. Tür-/Truhen- und Tierklänge bleiben erhalten; der Wurf erhält ein kurzes Pusten/Rauschen.

## Ast als Gegenstand

Der aus dem Wasserrad gezogene Ast wird einmalig als `Ast` im Rucksack abgelegt. Ist der Rucksack voll, bleibt er vollständig am Rad und kann nach Freimachen eines Platzes erneut herausgezogen werden. Questfortschritt und Gegenstand werden dabei nicht getrennt verbucht. Der Ast wird aktuell fürs Apportieren genutzt; Kampf-/Waffen- und Kombinationsmechaniken sind noch nicht implementiert und können später auf denselben Gegenstand aufbauen.

## Mit dem Hund spielen

Mit Ast im Rucksack vor den Hund stellen und A drücken. Der Aktionshinweis lautet „Hund Ast werfen“. Eine freie, kurze Wurfbahn auf Land wird geprüft; der sichtbare Ast fliegt in einem kleinen Bogen. Der Hund läuft über kollisionsfreie Felder hin, nimmt ihn nach einer kurzen Pause auf, trägt ihn sichtbar im Maul zurück und kommt neben dem aktuellen Spieler zum Stehen. Anschließend kehrt er zu seinem normalen Rundweg zurück. Wer weiterläuft, wird über den vorhandenen begehbaren Dorfgrundriss einschließlich Brücken weiter als Rückgabeziel verfolgt.

Während des Spiels wird der Ast als eigener Besitz weiter im Rucksack reserviert und dort als „Ast / beim Hund“ angezeigt. Es entsteht kein freier Inventarplatz und bei der Rückgabe wird kein zweiter Ast hinzugefügt. Ein Verbrauch des ausgeliehenen Asts ist gesperrt. Damit sind volle Rucksäcke und beliebig oft wiederholtes Apportieren verlustfrei. Nach der tatsächlichen Rückgabe zeigt der Rucksack wieder den normalen Ast. Fehlender Wurfplatz oder eine noch laufende Hundebewegung startet keinen ungültigen Wurf.

Hundewege respektieren Wasser, Gebäude, Möbel, Personen, andere Tiere und reservierte Schritt-Ausgangsfelder. Der Hund kann nicht durch den Spieler laufen. Er plant zum aktuellen Ziel neu und wartet bei vorübergehenden Hindernissen. Dialoge und Menüs pausieren das Spiel. Reduzierte Bewegung entfernt die Flugkurve und lässt die Schritte ohne Interpolation erfolgen. Beim Verlassen des Dorfs wird die Sequenz verlustfrei beendet und der normale Hundeplatz wiederhergestellt; es gibt dafür keinen künstlichen Erfolg. Ein Neustart setzt Gegenstände und Apportierzähler zurück wie den übrigen Durchlauf.

## Prüfung und Installation

77 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Zusätzliche Prüfungen sichern mehrstimmige Notenplanung am bestehenden Master, einmaligen Wasserraderfolg, atomare Astmitnahme, vollständiges/wiederholtes Apportieren, tatsächliche Kollisionsfelder, weitergelaufenen Spieler und längere Wege über die Dorfbrücken, Schrittreservierung, vollen Rucksack, Menüpause, Hauswechsel, reduzierte Bewegung und blockierte Würfe. Canvas-Sichtprüfung von Flug, getragenem Ast, Rückgabe und Rucksackstatus durchgeführt. Ein vollständiger Browser-/WebGL- und Hörtest war hier nicht verfügbar.

Dieser Folgepatch setzt `BENTENDO_Bewohner_Wege_Reaktionen_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Ausschließlich neue oder geänderte Dateien; keine Löschungen oder zusätzlichen Assets.
