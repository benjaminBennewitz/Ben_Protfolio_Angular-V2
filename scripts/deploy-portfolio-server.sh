#!/usr/bin/env bash
# scripts/deploy-portfolio-server.sh
set -euo pipefail

# Deployed ein lokal gebautes Angular-Archiv in den KeyHelp-Webspace von b2folio.de.
# Dieses Script wird einmalig nach /usr/local/bin/deploy-portfolio-frontend installiert
# und anschließend per sudo durch das lokale Windows-Deploy-Script ausgeführt.

ARCHIVE="${1:-/tmp/portfolio-frontend.tar.gz}"
WEB_DIR="/home/users/b2folio/www/b2folio.de"
WEB_USER="b2folio"
WEB_GROUP="b2folio"
TMP_DIR="$(mktemp -d /tmp/portfolio-frontend.XXXXXX)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [[ "$(id -u)" -ne 0 ]]; then
  echo "[B2FOLIO][FEHLER] Dieses Script muss mit sudo/root ausgefuehrt werden." >&2
  exit 1
fi

if [[ ! -f "$ARCHIVE" ]]; then
  echo "[B2FOLIO][FEHLER] Build-Archiv nicht gefunden: $ARCHIVE" >&2
  exit 1
fi

if [[ ! -d "$WEB_DIR" ]]; then
  echo "[B2FOLIO][FEHLER] Webroot nicht gefunden: $WEB_DIR" >&2
  exit 1
fi

command -v tar >/dev/null 2>&1 || {
  echo "[B2FOLIO][FEHLER] tar fehlt." >&2
  exit 1
}

command -v rsync >/dev/null 2>&1 || {
  echo "[B2FOLIO][FEHLER] rsync fehlt. Installation: sudo apt install -y rsync" >&2
  exit 1
}

echo "[B2FOLIO] Build-Archiv entpacken..."
tar -xzf "$ARCHIVE" -C "$TMP_DIR"

for required_file in index.html .htaccess robots.txt sitemap.xml; do
  if [[ ! -f "$TMP_DIR/$required_file" ]]; then
    echo "[B2FOLIO][FEHLER] Pflichtdatei fehlt im Build-Archiv: $required_file" >&2
    exit 1
  fi
done

if [[ ! -d "$TMP_DIR/assets" ]]; then
  echo "[B2FOLIO][FEHLER] assets-Verzeichnis fehlt im Build-Archiv." >&2
  exit 1
fi

echo "[B2FOLIO] Build nach $WEB_DIR spiegeln..."
rsync -a --delete \
  --exclude='.well-known/' \
  --exclude='angular-projects/' \
  "$TMP_DIR/" "$WEB_DIR/"

echo "[B2FOLIO] Besitzer und Rechte korrigieren..."
chown -R "$WEB_USER:$WEB_GROUP" "$WEB_DIR"
find "$WEB_DIR" -type d -exec chmod 755 {} \;
find "$WEB_DIR" -type f -exec chmod 644 {} \;

rm -f "$ARCHIVE"

echo "[B2FOLIO] Deployment erfolgreich."
