# Gr3mWorkOut

A modern, premium‑looking web application for physiotherapy training plans.

## Features
- Dark / Light theme with glass‑morphism UI
- Admin / Therapist user roles with full patient management
- Exercise library (YouTube links, custom video uploads)
- Workout planner (2‑day split, warm‑up, sets, reps, weight, band level)
- Local authentication (email / password) – ready for future OAuth
- PostgreSQL database accessed via Prisma ORM
- Video files stored on the server filesystem (uploads/videos)

## Quick start (development)
```bash
# clone (if you haven't already)
git clone https://github.com/GeorgesGremion/Gr3mWorkOut.git
cd Gr3mWorkOut

# copy example env and edit values
cp .env.example .env
# adjust DATABASE_URL, JWT_SECRET, PORT as needed

npm install
npx prisma generate
npx prisma migrate dev --name init   # creates tables
mkdir -p uploads/videos               # folder for uploaded videos
npm run dev                           # starts Vite frontend + Express backend
```

The app will be reachable at `http://localhost:5173`.

## Production deployment on Ubuntu 24.04
A helper script `install.sh` is provided. It performs the following steps:
1. System update & installs required packages (git, curl, Node 20, PostgreSQL).
2. Creates a PostgreSQL database/user (`physio_db` / `physio_user`).
3. Clones the repository (if not present) and checks out the latest code.
4. Generates a `.env` file from the example and injects secure values.
5. Installs npm dependencies, generates the Prisma client, runs the initial migration.
6. Creates the `uploads/videos` directory.
7. Starts the development server (for a real production setup you would use `npm run build` and a process manager like **pm2** together with an Nginx reverse‑proxy).

### Run the installer
```bash
chmod +x install.sh
./install.sh
```
After the script finishes you can access the app at `http://<your‑server‑ip>:5173`.

## Project structure
```
├─ prisma/                # Prisma schema & migrations
├─ src/                  # React frontend
│   ├─ App.jsx
│   ├─ main.jsx
│   └─ index.css
├─ server/               # Express backend
├─ uploads/videos/        # Uploaded exercise videos (git‑ignored)
├─ .env.example          # Example environment file
├─ install.sh            # Ubuntu 24.04 installer script
├─ package.json
└─ README.md
```

## License
MIT – feel free to adapt and extend!
