@echo off
echo Starting Aadhaar Sanket Dashboard...

:: Check for Python Virtual Environment
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

:: Activate virtual environment
call .venv\Scripts\activate

:: Check if requirements are installed (basic check)
pip install -q -r requirements.txt

echo Starting Backend...
start "Aadhaar Backend" cmd /k "call .venv\Scripts\activate && cd backend && python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend...
start "Aadhaar Frontend" cmd /k "npm run dev"

echo.
echo Application started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo.
pause
