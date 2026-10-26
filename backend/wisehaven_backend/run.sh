#!/bin/bash
# Quick start script for WiseHaven backend

echo "🚀 Starting WiseHaven API..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/installed" ]; then
    echo "📚 Installing dependencies..."
    pip install -r requirements.txt
    touch venv/installed
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
fi

# Start server
echo "✅ Starting server on http://localhost:8000"
echo "📖 API docs: http://localhost:8000/docs"
echo ""
python main.py
