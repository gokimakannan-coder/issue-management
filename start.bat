@echo off
echo ========================================================
echo   Starting IssueFlow Enterprise Issue Management System
echo ========================================================
echo.
echo Starting Backend API Server (Port 5000)...
start "IssueFlow Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Dev Server (Port 5173)...
start "IssueFlow Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application launched!
echo Open your browser at: http://localhost:5173
echo.
echo Login Credentials:
echo   - Admin:    admin@issueflow.com   / password123
echo   - Manager:  manager@issueflow.com / password123
echo   - Employee: john@issueflow.com    / password123
echo ========================================================
pause
