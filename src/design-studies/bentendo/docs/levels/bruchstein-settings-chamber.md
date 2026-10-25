# Tonmenü, Gerätebedienung und alte Staukammer

Folgepatch auf `BENTENDO_Tasten_Ausgeschaltet_Patch.zip`. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Enthält ausschließlich neue oder geänderte Dateien. Keine Löschungen und keine zusätzlichen Assetdownloads nötig.

## Bedienung

- B öffnet den Rucksack. Unter den sechs Gegenstandsfächern liegen Karte, Notizen und Ton. Richtungen wählen, A bestätigt, B führt zurück. Die Notizen benötigen keine J-Taste mehr.
- START öffnet das Pausenmenü mit Weiter, Notizen, Karte, Ton einstellen und Speichern. SELECT öffnet weiterhin die Speicherbestätigung.
- Im Tonmenü wählen oben/unten den BGM- oder SFX-Kanal; links/rechts ändern den Anteil um zehn Prozent. A erhöht den gewählten Regler, B führt zurück. Alle Funktionen sind mit Steuerkreuz, A und B erreichbar.
- BGM und SFX sind zusätzlich in der nativen Bedienhilfe als getrennte beschriftete Regler erreichbar. Beide Werte werden unabhängig vom Spielstand lokal gespeichert. Alte Toneinstellungen erhalten für die beiden neuen Kanäle jeweils 100 Prozent.
- Das physische Lautstärkerad bleibt der gemeinsame Master. Stummschaltung und die kurze Musikabsenkung bei Erfolgsfanfaren gelten weiterhin. SFX umfasst auch den Einschaltklang.

## Modell und Mobile

Die zusätzliche Tastaturhilfe hat schmale START-/SELECT-Knöpfe und eine feste Breite von 137 Pixeln. Auf Desktop erhält der Geräteviewport einen eigenen linken Abstand, sodass das Bedienfeld nicht in den GB hineinragt. Native Power-, Regler- und LCD-Hotspots berücksichtigen diesen Abstand ebenfalls.

Auf schmalen Geräten beziehungsweise bei primärer Touchbedienung passt die Frontkamera das gesamte Gehäuse mit Rand in die verfügbare Fläche ein. Die untere HTML-Navigation erhält einen eigenen freien Bereich. Die zusätzliche Tastaturhilfe bleibt für Screenreader erreichbar und wird bei Tastaturfokus sichtbar; beim gewöhnlichen Touchspielen liegt sie nicht über dem Gerät.

Das tatsächliche Modellsteuerkreuz unterstützt gehaltenes Laufen und Richtungswechsel mit aufliegendem Finger. Eine zweite Berührung auf A oder B erhält das separat gehaltene Steuerkreuz. Aktionen erfolgen jetzt beim Drücken; das Loslassen löst keine zweite Aktion aus. Pointer-Capture, einzelne Abbrüche und Fokusverlust lösen gehaltene Eingaben. Knöpfe lassen sich weiterhin auch ausgeschaltet mechanisch betätigen. Die unsichtbaren Trefferflächen werden auf kompakten Geräten leicht erweitert. Kamerawischen beginnt weiterhin auf freien Modellflächen, nicht auf gehaltenen Tasten.

## Bedeutung der Kammer

Die Nordhöhle führt in eine teilweise abgelassene Süßwasser-Staukammer des Mühlkanals. Sie ist kein vollständig gefluteter Raum: Das tiefe verbliebene Wasser bleibt unbetretbar, der umlaufende trockene Wartungsweg ist begehbar. Pegelplatte und Handwinde erläutern die frühere Nutzung.

Das breite Fluttor sitzt in der nördlichen Staumauer. Seine Führung und Kette verbinden es mit einer mechanischen Handwinde am rechten Wartungsweg. Der Zugang vom Archiv ist in der linken Wand erkennbar; der südliche Ausgang besitzt Stufen. Die Winde bleibt beim aktuellen Storystand verriegelt: Der Auftrag ist weiterhin die Untersuchung der Kreidespuren, kein neues Öffnungsrätsel.

Schlammstreifen, Algenreste und kleine Flussmuscheln kennzeichnen den früheren Wasserbereich. Seesterne wären für diese Süßwasserkammer unpassend. Wasseranimation und Felsfront stammen aus dem vorhandenen Awakening-Atlas; ausschließlich das Kammerwasser erhält einen dunkleren Kontrast. Die übrigen kleinen Kammerdetails werden palettengebunden im Renderer gezeichnet.

Als Musik ist weiterhin die vorhandene `rune-archive.mp3` zugeordnet. Der Raum besitzt somit BGM, bisher keine eigene neue Komposition. Der BGM-Regler wirkt sofort auf diese Musik. Die Kammer ist außerdem direkt im Debugmenü erreichbar.

## Vorhandene Spielstände

Bei alten Ständen in der umgebauten Kammer können bisher begehbare Felder jetzt im Wasser oder in einer Wand liegen. Ausschließlich solche alten Kammerpositionen werden beim Laden an den sicheren Eingang versetzt. Funde, Inventar, Münzen und Questflags bleiben erhalten. Neue Stände speichern die Raumrevision mit; das übrige Speicherformat bleibt Version 1.

## Prüfung

120 automatisierte Tests erfolgreich; JavaScript-/CSS- und Python-Prüfungen erfolgreich. Der vollständige Mara-Ablauf bleibt durchspielbar. Neue Prüfungen decken getrennte Kanäle und Speicherung, A/B-Menünavigation, alte Kammerstände, sichere Wege und unbetretbares Wasser, gehaltene Modellsteuerung mit zwei Fingern sowie die vollständige mobile Gehäuseprojektion ab.

Die Produktionsassets und tatsächlichen Raum-/Menürenderer wurden zusätzlich mit Canvas gerendert und visuell geprüft. Ein echter WebGL-/Smartphone-Durchlauf konnte hier nicht ausgeführt werden, da der Browser den lokalen Spielserver nicht erreicht. Die Touch- und Projektionsprüfung erfolgte automatisiert.
