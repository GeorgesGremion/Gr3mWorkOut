#!/usr/bin/env bash
# uninstall.sh - Aufräumen für einen frischen Re-Install
# Entfernt App-Verzeichnis, Uploads und PostgreSQL-Datenbank/User.
# ACHTUNG: Alle Daten/Uploads gehen verloren.

set -euo pipefail

APP_DIR="/opt/physio-app"
DB_NAME="physio_db"
DB_USER="physio_user"

RUN_AS_POSTGRES() {
  if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
    sudo -u postgres "$@"
  else
    sudo -u postgres "$@"
  fi
}

# Falls im Repo ausgeführt, dieses Verzeichnis verwenden
if [ -f "package.json" ] && grep -q "\"name\": \"physio-app\"" package.json; then
  APP_DIR="$(pwd)"
fi

echo "==> Hinweis: Dieses Skript löscht Datenbank, User und ${APP_DIR}"
sleep 1

echo "==> PostgreSQL: DB/User entfernen (falls vorhanden)"
RUN_AS_POSTGRES psql -c "DROP DATABASE IF EXISTS ${DB_NAME};" || true
RUN_AS_POSTGRES psql -c "DROP ROLE IF EXISTS ${DB_USER};" || true

if [ -d "${APP_DIR}" ] && [ "${APP_DIR}" != "/" ]; then
  echo "==> Entferne ${APP_DIR}"
  $SUDO rm -rf "${APP_DIR}"
else
  echo "==> Überspringe Verzeichnis-Löschung (nicht gefunden oder unsicherer Pfad)"
fi

echo "==> Fertig. Du kannst jetzt neu installieren (install.sh)."
