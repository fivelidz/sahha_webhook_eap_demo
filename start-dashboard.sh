#!/bin/bash

# Start Dashboard Script
# This script starts the Sahha Wellness Dashboard on port 3000

echo "🚀 Starting Sahha Wellness Dashboard..."
echo "================================================"

# Kill any existing processes on port 3000
echo "📍 Checking port 3000..."
PID=$(lsof -ti:3000)
if [ ! -z "$PID" ]; then
    echo "⚠️  Port 3000 is in use by PID $PID. Killing process..."
    kill -9 $PID 2>/dev/null
    sleep 2
fi

# Kill any existing Next.js processes
echo "🔍 Cleaning up any existing Next.js processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
sleep 1

# Navigate to the project directory
cd /home/fivelidz/sahha_work/sahha-marketing-intelligence/projects/sahha-wellness-template/react-version/profile-manager

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server in the background with nohup
echo "🌟 Starting Next.js development server on port 3000..."
echo "================================================"
echo ""

# Use nohup to keep the process running even after terminal closes
nohup npm run dev > dashboard.log 2>&1 &
SERVER_PID=$!

echo "✅ Dashboard server started with PID: $SERVER_PID"
echo "📝 Logs are being written to: dashboard.log"
echo ""

# Wait a moment for the server to start
sleep 3

# Check if the server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "🎉 Dashboard is running successfully!"
    echo "🌐 Access the dashboard at: http://localhost:3000"
    echo ""
    echo "To stop the server, run: kill $SERVER_PID"
    echo "To view logs, run: tail -f dashboard.log"
    
    # Save the PID for later reference
    echo $SERVER_PID > dashboard.pid
    echo "PID saved to dashboard.pid"
else
    echo "❌ Failed to start the dashboard server"
    echo "Check dashboard.log for errors"
    exit 1
fi

echo ""
echo "================================================"
echo "Dashboard is running in the background."
echo "You can safely close this terminal."