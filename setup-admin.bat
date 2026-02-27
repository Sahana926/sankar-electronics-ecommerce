@echo off
echo ================================================
echo   Sankar Electrical - Admin Setup Script
echo ================================================
echo.

echo Step 1: Creating Admin User...
cd server
call node seed-admin.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create admin user
    pause
    exit /b 1
)
echo.

echo ================================================
echo   Admin User Created Successfully!
echo ================================================
echo   Email: adminsankar@gmail.com
echo   Password: Admin@123
echo   Admin Panel: http://127.0.0.1:5173/admin/login
echo ================================================
echo.

echo Step 2: Install dependencies if needed...
if not exist "node_modules" (
    echo Installing server dependencies...
    call npm install
)

cd ..
if not exist "node_modules" (
    echo Installing client dependencies...
    call npm install
)

echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo To start the application:
echo   1. Open terminal 1: cd server ^&^& npm start
echo   2. Open terminal 2: npm run dev
echo.
echo Then navigate to:
echo   - User Login: http://127.0.0.1:5173/login
echo   - Admin Login: http://127.0.0.1:5173/admin/login
echo.
pause
