# Gr3mWorkOut

Eine schlanke Trainings-App für Physio-Workouts (React + Vite, Express, Prisma/PostgreSQL). Enthält Rollen, Übungsbibliothek (YouTube/Uploads) und einen einfachen Workout-Planer.

## Features
- Dark/Light Theme mit Glas-Optik
- Rollen: Admin/Therapist/Patient (JWT-basiert)
- Übungsbibliothek mit YouTube-Link und eigenem Video-Upload
- Workout-Planer (2er Split, Warm-up/Main, Sets mit Gewicht/Band)
- PostgreSQL via Prisma ORM

## Entwicklung (lokal)
```bash
cp .env.example .env           # env anpassen (DATABASE_URL, JWT_SECRET, PORT)
npm install
npx prisma generate
npx prisma migrate dev --name init
mkdir -p uploads/videos
npm run dev                    # startet Vite + Express
```
Frontend: http://localhost:5173 (proxy auf API-Port 4000).

## API/Auth
- Alle geschützten Routen erwarten `Authorization: Bearer <token>`.
- Registrierung erstellt standardmäßig einen PATIENT. ADMIN/THERAPIST bitte manuell in der DB anlegen oder per Migration.
- Datei-Upload nur für ADMIN/THERAPIST erlaubt, Video-Typen, Limit 500 MB.

## Deployment Ubuntu 24.04
Der Installer richtet Node 20, PostgreSQL, das Repo und Prisma ein.
```bash
chmod +x install.sh
./install.sh
```
Standardpfad: `/opt/physio-app`. Start im Entwicklungsmodus:
```bash
cd /opt/physio-app
npm run dev -- --host
```
Für Produktion: Build + Prozessmanager (pm2/systemd) und Reverse-Proxy (nginx) nutzen.

## Projektstruktur
```
prisma/          # Prisma Schema & Migrationen
server/          # Express API
src/             # React-Frontend
uploads/videos/  # Upload-Ziel (gitignored)
```

## Lizenz
MIT
