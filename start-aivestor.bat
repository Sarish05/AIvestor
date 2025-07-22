@echo off
echo 🚀 AIvestor - Starting Complete Application...

echo.
echo 🏗️ Starting backend and frontend services...
call npm run dev

echo.
echo ✅ All services running:
echo 🔹 Frontend: http://localhost:3000
echo 🔹 Backend API: http://localhost:5001
echo.
echo Press any key to stop all services...
pause
