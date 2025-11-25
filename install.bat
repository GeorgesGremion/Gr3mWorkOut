@echo off
rem install.bat - sets up the project on Windows

rem ensure we are in the project root
cd /d "%~dp0"

echo Installing npm dependencies...
npm install

echo Generating Prisma client...
npx prisma generate

rem Run initial migration (will ask for DB connection)
echo Running Prisma migration (dev)...
npx prisma migrate dev --name init

rem Create upload folders
if not exist "uploads" mkdir uploads
if not exist "uploads\videos" mkdir "uploads\videos"

echo Setup complete. You can now run "npm run dev" to start the app.
pause
