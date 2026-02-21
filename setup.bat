@echo off
echo ============================================
echo   K-Pop Studio Pro - Windows Setup
echo ============================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

:: Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Install from https://python.org
    pause
    exit /b 1
)

echo [1/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)

echo [2/4] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)
cd ..

echo [3/4] Installing backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] pip install failed
    pause
    exit /b 1
)
cd ..

echo [4/4] Starting server...
echo.
echo ============================================
echo   Visit: http://localhost:8000
echo   Press Ctrl+C to stop
echo ============================================
echo.
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
