#!/usr/bin/env bash
# install.sh - Ubuntu 24.04 Setup for Gr3mWorkOut / physio-app
# Bereitet Node 20, PostgreSQL, das Repo, .env und Prisma vor. Idempotent ausgelegt.

set -euo pipefail

APP_DIR="/opt/physio-app"
REPO_URL="https://github.com/GeorgesGremion/Gr3mWorkOut.git"
DB_NAME="physio_db"
DB_USER="physio_user"
DB_PASS="physio_pass"

if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> Pakete aktualisieren"
$SUDO apt-get update -y
$SUDO apt-get install -y git curl ca-certificates gnupg build-essential

echo "==> Node.js 20 installieren"
if [ -z "$SUDO" ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
else
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
fi
$SUDO apt-get install -y nodejs

echo "==> PostgreSQL installieren/pruefen"
$SUDO apt-get install -y postgresql postgresql-contrib
# Auch als root immer sudo -u postgres nutzen, damit der Benutzer stimmt
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

# Repository nutzen (falls Skript bereits im Repo ausgefuehrt wird, kein erneutes Clonen)
if [ -f "package.json" ] && grep -q "\"name\": \"physio-app\"" package.json; then
  echo "==> Lokales Repo erkannt, benutze $(pwd)"
  APP_DIR="$(pwd)"
else
  echo "==> Repository beziehen"
  $SUDO mkdir -p "${APP_DIR}"
  $SUDO chown -R "${USER}:${USER}" "${APP_DIR}"
  if [ ! -d "${APP_DIR}/.git" ]; then
    git clone "${REPO_URL}" "${APP_DIR}"
  else
    cd "${APP_DIR}"
    git pull --rebase
  fi
  cd "${APP_DIR}"
fi

echo "==> .env erstellen/aktualisieren"
cp -n .env.example .env
JWT_SECRET=$(openssl rand -hex 32)
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}|" .env
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
sed -i "s|^PORT=.*|PORT=4000|" .env

echo "==> Dependencies installieren"
npm install

echo "==> Prisma Client & Migrationen"
npx prisma generate
npx prisma migrate deploy || npx prisma migrate dev --name init

echo "==> Upload-Verzeichnis anlegen"
mkdir -p uploads/videos

echo "==> Frontend bauen (fuer Prod-Assets)"
npm run build

cat <<EOF
----------------------------------------
Setup abgeschlossen.
- Code liegt in ${APP_DIR}
- .env gesetzt (DB + JWT_SECRET)
- Prisma-Schema angewendet
- Upload-Pfad uploads/videos vorhanden

Entwicklung starten (fuehrt Frontend + API gemeinsam aus):
  cd ${APP_DIR}
  npm run dev -- --host

Fuer echten Produktivbetrieb bitte einen Prozess-Manager (pm2/systemd) und einen Reverse-Proxy (nginx) nutzen.
----------------------------------------
EOF
