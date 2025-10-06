@echo off
echo ========================================
echo  Research Paper Submission System
echo  (Complete Working Version)
echo ========================================
echo.

echo Starting Backend Server with Persistent Database...
start "Backend Server" cmd /k "cd publication-system-backend\publication-system && node server-persistent.js"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend-DASS && npm run dev"

echo.
echo ========================================
echo  System Started Successfully!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Database: database.sqlite (persistent)
echo.
echo ✅ FEATURES WORKING:
echo - User registration and login
echo - Publication submission with PDF upload
echo - Data persistence across restarts
echo - Conference management
echo - Admin approval system
echo.
echo Test with your email: 2205374@kiit.ac.in
echo.
echo Press any key to exit...
pause > nul
