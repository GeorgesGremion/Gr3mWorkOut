#!/usr/bin/env bash
# createadmin.sh - legt/aktualisiert einen Admin-User per Prisma
# Nutzung: ./createadmin.sh <email> <passwort> [ROLE]

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <email> <password> [ROLE]"
  exit 1
fi

EMAIL="$1"
PASSWORD="$2"
ROLE="${3:-ADMIN}"

# Übergibt Werte als env an das Inline-Node-Skript
CREATE_EMAIL="$EMAIL" CREATE_PW="$PASSWORD" CREATE_ROLE="$ROLE" node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();
const prisma = new PrismaClient();

async function run() {
  const email = process.env.CREATE_EMAIL;
  const password = process.env.CREATE_PW;
  const role = process.env.CREATE_ROLE || 'ADMIN';

  if (!email || !password) {
    throw new Error('Email und Passwort sind erforderlich');
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, role },
    create: { email, password: hash, role },
  });

  console.log(`User gespeichert: ${user.email} (Role: ${user.role})`);
}

run()
  .catch((err) => {
    console.error('Fehler:', err.message);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
NODE
