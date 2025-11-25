#!/usr/bin/env bash
# install.sh - Ubuntu 24.04 setup for Gr3mWorkOut
# -------------------------------------------------
# 1. Update system & install prerequisites
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl gnupg build-essential

# 2. Install Node.js (v20) via Nodesource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
# Create DB & user (you may adjust name/password)
sudo -u postgres psql <<EOF
CREATE DATABASE physio_db;
CREATE USER physio_user WITH ENCRYPTED PASSWORD 'physio_pass';
GRANT ALL PRIVILEGES ON DATABASE physio_db TO physio_user;
EOF

# 4. Clone repository (if not already present)
if [ ! -d "Gr3mWorkOut" ]; then
  git clone https://github.com/GeorgesGremion/Gr3mWorkOut.git
fi
cd Gr3mWorkOut

# 5. Copy example env and adjust values
cp .env.example .env
# Edit .env manually or use sed (example below)
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://physio_user:physio_pass@localhost:5432/physio_db|" .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env

# 6. Install npm dependencies & generate Prisma client
npm install
npx prisma generate
# Run initial migration (creates tables)
npx prisma migrate dev --name init

# 7. Create uploads directory for videos
mkdir -p uploads/videos

# 8. Start the development server (or use a process manager for prod)
# For production you would typically use `npm run build` + a reverse proxy (nginx) and a process manager like pm2.
# Here we just start the dev servers for quick verification:
npm run dev &

echo "Setup complete. Application is running at http://localhost:5173"
