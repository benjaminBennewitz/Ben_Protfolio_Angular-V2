# SCOOP! – Commit und Deployment

Die Study liegt unter `src/design-studies/scoop/`. Die Portfolio-Karte führt zu `/design-studies/scoop/`. Rücklinks und Rechtliches verwenden die aktuelle Domain. Die Social-Links sind weiterhin Demo-Links zu den Plattform-Startseiten.

## 1. Patch übernehmen und committen

Im lokalen Portfolio-Repository die Dateien aus dem Patch unter Beibehaltung der Verzeichnisstruktur ersetzen. Danach:

```cmd
git add angular.json README.md scripts/deploy-portfolio-local.cmd scripts/deploy-portfolio-server.sh scripts/scoop-deployment.md src/app/pages/portfolio-page/portfolio-page.component.ts src/design-studies/scoop
git commit -m "feat(portfolio): integrate SCOOP design study"
git push
```

Die Original-Master im Quellordner werden nicht gelöscht. Angular schließt SCOOP!-Illustrator-Dateien, Entwurfs-PNGs, TTF-Originalfonts und Quelldokumentation gezielt vom Web-Build aus. WOFF-Webfonts und OFL-Lizenzen bleiben enthalten.

## 2. Installiertes Server-Script aktualisieren

Beide Deployment-Scripts validieren jetzt vier Pflicht-Studies und die SCOOP!-Laufzeitdateien. Das versionierte Server-Script muss deshalb einmalig auch auf dem Server installiert werden. Aus dem Projektordner in Windows CMD:

```cmd
set "SCOOP_SSH_KEY=%USERPROFILE%\.ssh\id_ed25519"
if defined DCR_SSH_KEY set "SCOOP_SSH_KEY=%DCR_SSH_KEY%"
if defined B2FOLIO_SSH_KEY set "SCOOP_SSH_KEY=%B2FOLIO_SSH_KEY%"
scp -i "%SCOOP_SSH_KEY%" scripts\deploy-portfolio-server.sh ben@159.195.54.12:/tmp/deploy-portfolio-server.sh
ssh -t -i "%SCOOP_SSH_KEY%" ben@159.195.54.12 "sed -i 's/\r$//' /tmp/deploy-portfolio-server.sh && sudo install -m 755 /tmp/deploy-portfolio-server.sh /usr/local/bin/deploy-portfolio-frontend && rm /tmp/deploy-portfolio-server.sh"
```

Die Befehle nacheinander ausführen und nur nach erfolgreichem Abschluss fortfahren. Die Konvertierung der CRLF-Zeilenenden erfolgt vor der Installation. Die vorhandenen SSH-/sudo-Eingaben bleiben wie beim bisherigen Deployment.

## 3. Deployen

```cmd
scripts\deploy-portfolio-local.cmd
```

Das Script verlangt einen sauberen Git-Working-Tree, aktualisiert das Repository, installiert die Lockfile-Abhängigkeiten, baut das Portfolio, prüft die Studies und überträgt das fertige Browser-Archiv zum Server.

## 4. Nach dem Deployment prüfen

- `https://b2folio.de/portfolio#design-studies`: SCOOP! als vierte Karte, Vorschaubild und Link.
- `https://b2folio.de/design-studies/scoop/`: Loader, Hero, Produktkarten, Mix-Box und Abstimmung.
- Footer: Portfolio-Rücklink sowie `/impressum` und `/datenschutz`.
- Neu laden und prüfen, dass alle Assets ohne 404 geladen werden.

## Prüfstand dieses Patches

Production-Build erfolgreich; alle 37 bestehenden Angular-Tests erfolgreich. Build-Kopie der SCOOP!-Dateien, relative Assets und Ausschluss der Masterdateien geprüft. Die Vorschau ist eine aus Original-SVGs zusammengesetzte Darstellung, kein Browser-Screenshot. Browserprüfung, Git-Commit/Push im echten Repository und Server-Deployment sind lokal auszuführen: die bereitgestellte ZIP enthält keine Git-Metadaten, und der SSH-Key steht in dieser Arbeitsumgebung nicht zur Verfügung.
