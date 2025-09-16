#!/bin/bash

# Stop Dashboard Script
# This script stops the Sahha Wellness Dashboard

echo "🛑 Stopping Sahha Wellness Dashboard..."
echo "================================================"

# Check if PID file exists
if [ -f "dashboard.pid" ]; then
    PID=$(cat dashboard.pid)
    echo "📍 Found dashboard PID: $PID"
    
    # Check if process is running
    if ps -p $PID > /dev/null; then
        echo "⚠️  Stopping dashboard process..."
        kill $PID
        sleep 2
        
        # Force kill if still running
        if ps -p $PID > /dev/null; then
            echo "⚠️  Force stopping dashboard process..."
            kill -9 $PID
        fi
        
        echo "✅ Dashboard stopped successfully"
    else
        echo "ℹ️  Dashboard process not running (PID: $PID)"
    fi
    
    # Remove PID file
    rm dashboard.pid
else
    echo "⚠️  No dashboard.pid file found"
    
    # Try to find and kill any Next.js processes
    echo "🔍 Looking for Next.js processes..."
    NEXT_PIDS=$(pgrep -f "next dev")
    
    if [ ! -z "$NEXT_PIDS" ]; then
        echo "📍 Found Next.js processes: $NEXT_PIDS"
        echo "⚠️  Stopping all Next.js processes..."
        pkill -f "next dev"
        pkill -f "next-server"
        echo "✅ All Next.js processes stopped"
    else
        echo "ℹ️  No Next.js processes found running"
    fi
fi

# Check port 3000
echo ""
echo "📍 Checking port 3000..."
PORT_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_PID" ]; then
    echo "⚠️  Port 3000 still in use by PID: $PORT_PID"
    echo "   Run 'kill $PORT_PID' to free the port"
else
    echo "✅ Port 3000 is free"
fi

echo ""
echo "================================================"
echo "Dashboard stopped."