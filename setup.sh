#!/usr/bin/env bash
set -e
echo "============================================"
echo "  K-Pop Studio Pro - Setup"
echo "============================================"
echo ""

command -v node >/dev/null 2>&1 || { echo "[ERROR] Node.js not found. Install from https://nodejs.org"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "[ERROR] Python not found. Install from https://python.org"; exit 1; }

echo "[1/4] Installing frontend dependencies..."
cd frontend && npm install

echo "[2/4] Building frontend..."
npm run build
cd ..

echo "[3/4] Installing backend dependencies..."
cd backend && pip install -r requirements.txt
cd ..

echo "[4/4] Starting server..."
echo ""
echo "============================================"
echo "  Visit: http://localhost:8000"
echo "  Press Ctrl+C to stop"
echo "============================================"
echo ""
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
