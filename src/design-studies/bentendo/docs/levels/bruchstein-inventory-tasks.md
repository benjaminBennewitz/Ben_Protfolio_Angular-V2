# Rucksackaktionen, Hundebegleitung und zusätzliche Dorfaufgaben

## Rucksack

Das Steuerkreuz wählt sechs Gegenstandsfächer und darunter die Karte. A öffnet am Gegenstand die Auswahl „Benutzen / Ansehen“, Pfeile wechseln die Aktion, A bestätigt. B schließt zuerst den Beschreibungstext, dann das Aktionsmenü und schließlich den Rucksack. Die Karte bleibt über den Rucksack erreichbar und ist beim ersten Öffnen vorausgewählt. Die native Tastatur-/Touch-/Gerätebedienung verwendet denselben Auswahlzustand; die bestehende zugängliche Statusausgabe beschreibt Gegenstand und Aktion.

„Ansehen“ zeigt eine kurze Gegenstandsbeschreibung. „Benutzen“ verwendet die bestehenden Weltaktionen: Ast beim nahen Hund werfen; Brosche bei Frau Moos, Messingknopf beim Handwerker, Glasperle bei der Anglerin und Garnspule beim Weberlehrling abgeben; Ersatzrune und Runenkupplung am jeweils passenden Verteiler/Regler einsetzen; Pausenbecher zum Hausmeister zurückgeben. Unpassende Einsatzorte erklären den Verwendungszweck, ohne etwas zu verbrauchen. Die Übergabeempfänger müssen direkt benachbart sein; der Hund darf bis zu zwei Felder entfernt sein. Kämpfen und freie Gegenstandskombinationen bleiben noch offen.

## Hausmeister und Abschlussklang

Nach der Türöffnung lautet der Hinweis jetzt: „Ist offen! Schau dich in der Gilde um. Oben liegen noch alte Reiseunterlagen.“ Auch der Einführungstext in der Gilde verlangt keine nicht vorhandene Aushang-Übergabe mehr.

Die Broschenrückgabe hatte bereits ein Erfolgsereignis. Sie verwendet nun die Questfanfare direkt als Dialogklang, ohne gleichzeitigen Gesprächspiepser. Der AudioManager senkt bei Quest- und Wasserradfanfaren die aktuelle BGM für 1,4 Sekunden zusätzlich auf 30 % ihres normalen Pegels ab. Danach gelten wieder der aktuelle Lautstärkeregler und Mute-Zustand, auch wenn sie während der Fanfare geändert wurden. Neue Fanfaren verlängern die Absenkung; Abschalten beendet sie sauber. Der Erfolg ertönt weiterhin ausschließlich bei der tatsächlichen einmaligen Rückgabe.

## Hundebegleitung

Nach dem Zurückbringen begleitet der Hund den Spieler für etwa 45 Sekunden aktiver Spielzeit auf begehbaren Dorfwegen. Er hält bis zu zwei Felder Abstand und verwendet dieselbe Kollisionsprüfung wie beim Apportieren. Währenddessen kann erneut geworfen werden; die Begleitzeit beginnt nach der nächsten Rückgabe neu. Während der Begleitung gilt der Ast als vollständig zurückgegeben. Er wird niemals doppelt hinzugefügt.

Menüs und Dialoge pausieren die Begleitzeit. Beim Betreten eines Hauses bleibt der Hund draußen stehen; seine Zeit läuft innen nicht ab. Beim Herauskommen setzt er die Begleitung fort. Nach Ablauf kehrt er zu seinem ursprünglichen Rundweg zurück. Ein laufender Wurf wird beim Hauswechsel weiterhin verlustfrei beendet.

## Neue Aufgaben

1. **Die vermisste Garnspule:** In der Webstube den Weberlehrling ansprechen, in der Werkstatt den linken Werkzeugschrank durchsuchen und die Garnspule zurückbringen. Vier Gildenmünzen, Questfanfare und erledigter Journaleintrag. Finden vor dem Auftrag ist möglich; bei vollem Rucksack bleibt die Spule im Schrank.
2. **Vorratskontrolle:** Die Lagerwartin im Marktlager ansprechen. Danach die beiden vorderen Lieferfässer rechts und den Vorratsschrank links prüfen. Konkrete Prüfpunkte sind im Aktionshinweis markiert; das Journal zeigt offene Punkte und Fortschritt. Wiederholtes Prüfen zählt nicht mehrfach. Zum Abschluss bei der Lagerwartin Bericht erstatten: fünf Gildenmünzen und Questfanfare.

Die neun belegten Fundstellen und vier ursprünglichen Fundnotizen bleiben erhalten; die Garnspule ist der zusätzliche neunte Fund. Die Aufgaben legen ihre eigenen Statusnotizen direkt im vorhandenen Journal an. Bereits vorhanden sind Wasserrad/Gildenzugang, Frau Moos’ Broschensuche, die Rückgabe von Messingknopf und Glasperle, versteckte Münzen/Notizen und Apportieren. Nord-/Ostausgänge bleiben noch gesperrt; dieser Patch fügt keine neue Außenregion hinzu.

## Prüfung und Installation

85 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Neue Prüfungen sichern Rucksacknavigation, Beschreibung, Karte und Pausen, Broschenübergabe mit genau einem Erfolg, beide vollständigen Aufgaben samt einmaliger Bezahlung/frühem Fund/vollem Rucksack, zeitweise Hundebegleitung, Warten außerhalb von Häusern, erneutes Werfen, Rückkehr nach Ablauf und die Musikabsenkung unter aktuellem Regler/Mute. Canvas-Sichtprüfung von Auswahl, Aktionsmenü und Gegenstandsbeschreibung durchgeführt. Ein vollständiger Browser-/WebGL- und Hörtest war hier nicht verfügbar.

Dieser Folgepatch setzt `BENTENDO_Erfolgsfanfaren_Ast_Apportieren_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Ausschließlich neue oder geänderte Dateien; keine Löschungen oder zusätzlichen Assets.
