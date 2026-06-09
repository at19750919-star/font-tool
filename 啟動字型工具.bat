@echo off
cd /d "%~dp0"
echo ============================================
echo   Font Preview Tool / ????????
echo ============================================
echo.
if not exist "node_modules" (
  echo Installing dependencies, please wait a few minutes...
  call npm install
)
echo Starting server...
start "Font Tool Server - close this window to stop" cmd /k npm run dev
echo Waiting for server...
timeout /t 6 /nobreak >nul
echo Opening browser...
start "" http://localhost:5173/
echo.
echo Done. If the page is not ready yet, wait a few seconds and press F5.
echo You can close this window.
timeout /t 5 /nobreak >nul
