#!/bin/bash

# Kill any existing Next.js processes
echo "🔄 Stopping any existing servers..."
pkill -f "next dev" 2>/dev/null
pkill -f "next start" 2>/dev/null
sleep 2

# Set the working directory
cd /home/fivelidz/sahha_work/sahha-marketing-intelligence/projects/sahha-wellness-template/react-version/profile-manager

# Check if we should run in dev or production mode
if [ "$1" = "dev" ]; then
    echo "🚀 Starting development server on port 3000..."
    nohup npm run dev > server.log 2>&1 &
    SERVER_PID=$!
    echo "Development server started with PID: $SERVER_PID"
else
    echo "🏗️ Building production build..."
    npm run build
    
    echo "🚀 Starting production server on port 3000..."
    nohup npm start > server.log 2>&1 &
    SERVER_PID=$!
    echo "Production server started with PID: $SERVER_PID"
fi

# Save PID to file for later reference
echo $SERVER_PID > server.pid

# Wait a moment for server to start
sleep 3

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server is running successfully!"
    echo "📍 Access the dashboard at: http://localhost:3000/dashboard"
    echo "📍 View logs with: tail -f server.log"
    echo "📍 Stop server with: kill $(cat server.pid)"
else
    echo "❌ Server failed to start. Check server.log for errors."
    tail -20 server.log
fi