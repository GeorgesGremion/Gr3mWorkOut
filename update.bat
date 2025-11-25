@echo off
rem update.bat - updates the project on Windows

cd /d "%~dp0"

echo Pulling latest changes from git...
git pull

echo Installing/updating npm dependencies...
npm install

echo Regenerating Prisma client (if schema changed)...
npx prisma generate

echo Update complete. You can restart the dev server with "npm run dev".
pause
