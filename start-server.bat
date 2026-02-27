@echo off
echo ================================================
echo   Starting Sankar Electrical Backend Server
echo ================================================
echo.
cd server
echo Starting server on http://127.0.0.1:5001...
echo Press Ctrl+C to stop
echo.
call npm start
