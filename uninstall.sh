#!/usr/bin/env bash
# uninstall.sh - Aufraeumen fuer einen frischen Re-Install
# Stoppt laufende Dev-Prozesse, entfernt App-Verzeichnis und PostgreSQL-Datenbank/User.
# ACHTUNG: Alle Daten/Uploads gehen verloren.

set -euo pipefail

APP_DIR="/opt/physio-app"
DB_NAME="physio_db"
DB_USER="physio_user"

if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

RUN_AS_POSTGRES() {
  sudo -u postgres "$@"
}

# Falls im Repo ausgefuehrt, dieses Verzeichnis verwenden
if [ -f "package.json" ] && grep -q "\"name\": \"physio-app\"" package.json; then
  APP_DIR="$(pwd)"
fi

echo "==> Laufende Dev-Prozesse beenden (npm run dev / nodemon / vite)"
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node server/index.js" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo "==> Hinweis: Dieses Skript loescht Datenbank, User und ${APP_DIR}"
sleep 1

echo "==> PostgreSQL: DB/User entfernen (falls vorhanden)"
RUN_AS_POSTGRES psql -c "DROP DATABASE IF EXISTS ${DB_NAME};" || true
RUN_AS_POSTGRES psql -c "DROP ROLE IF EXISTS ${DB_USER};" || true

if [ -d "${APP_DIR}" ] && [ "${APP_DIR}" != "/" ]; then
  echo "==> Entferne ${APP_DIR}"
  $SUDO rm -rf "${APP_DIR}"
else
  echo "==> Ueberspringe Verzeichnis-Loeschung (nicht gefunden oder unsicherer Pfad)"
fi

echo "==> Fertig. Du kannst jetzt neu installieren (install.sh)."
