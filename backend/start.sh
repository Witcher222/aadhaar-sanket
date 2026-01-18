#!/bin/bash
# Aadhaar Sanket Backend Startup Script for Linux/Mac

echo "============================================"
echo "  Aadhaar Sanket Backend Server"
echo "============================================"
echo

cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    echo "Virtual environment created."
    echo
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found!"
    echo "Copy .env.example to .env and add your GEMINI_API_KEY"
    echo
fi

echo "Starting Aadhaar Sanket API server..."
echo
echo "Server will be available at: http://localhost:8000"
echo "API Documentation at: http://localhost:8000/docs"
echo

uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
