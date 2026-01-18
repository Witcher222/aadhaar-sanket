@echo off
REM Aadhaar Sanket Backend Startup Script for Windows

echo ============================================
echo   Aadhaar Sanket Backend Server
echo ============================================
echo.

cd /d "%~dp0"

REM Check if virtual environment exists
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    echo Virtual environment created.
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate

REM Check if dependencies are installed
python -c "import fastapi" 2>NUL
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo.
)

REM Check for .env file
if not exist ".env" (
    echo Warning: .env file not found!
    echo Copy .env.example to .env and add your GEMINI_API_KEY
    echo.
)

echo Starting Aadhaar Sanket API server...
echo.
echo Server will be available at: http://localhost:8000
echo API Documentation at: http://localhost:8000/docs
echo.

uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

pause
