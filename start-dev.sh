#!/bin/bash

# Development startup script for Image Scraper + Games Frontend

echo "🚀 Starting Image Scraper Development Environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start backend in background
echo "🔧 Starting FastAPI backend..."
if [ -d "backend" ]; then
    cd backend
    if [ ! -d "venv" ]; then
        echo "📦 Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    echo "📦 Activating virtual environment and installing dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt 2>/dev/null || echo "⚠️  requirements.txt not found, please install FastAPI dependencies manually"
    
    echo "🚀 Starting FastAPI server on port 8000..."
    python main.py &
    BACKEND_PID=$!
    cd ..
else
    echo "⚠️  Backend directory not found. Please ensure your FastAPI backend is in the 'backend' directory."
    echo "🔧 Starting without backend..."
fi

# Start frontend
echo "🎮 Starting Vite development server..."
npm run dev &
FRONTEND_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo "🛑 Shutting down development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Setup trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:8000"
echo "🔍 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for processes
wait 