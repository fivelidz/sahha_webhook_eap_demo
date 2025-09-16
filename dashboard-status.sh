#!/bin/bash

# Dashboard Status Script
# This script checks the status of the Sahha Wellness Dashboard

echo "📊 Sahha Wellness Dashboard Status"
echo "================================================"

# Check if PID file exists
if [ -f "dashboard.pid" ]; then
    PID=$(cat dashboard.pid)
    echo "📍 Dashboard PID file found: $PID"
    
    # Check if process is running
    if ps -p $PID > /dev/null; then
        echo "✅ Dashboard is RUNNING (PID: $PID)"
        
        # Get process details
        echo ""
        echo "Process Details:"
        ps -f -p $PID | tail -1
    else
        echo "❌ Dashboard is NOT RUNNING (stale PID: $PID)"
        echo "   Run './start-dashboard.sh' to start the dashboard"
    fi
else
    echo "ℹ️  No dashboard.pid file found"
    
    # Check if Next.js is running anyway
    NEXT_PIDS=$(pgrep -f "next dev")
    if [ ! -z "$NEXT_PIDS" ]; then
        echo "⚠️  Found Next.js processes running without PID file:"
        echo "   PIDs: $NEXT_PIDS"
    else
        echo "❌ Dashboard is NOT RUNNING"
        echo "   Run './start-dashboard.sh' to start the dashboard"
    fi
fi

echo ""
echo "📍 Port 3000 Status:"
PORT_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_PID" ]; then
    echo "✅ Port 3000 is in use by PID: $PORT_PID"
    
    # Test if dashboard is responding
    echo ""
    echo "🌐 Testing dashboard response..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo "✅ Dashboard is responding at http://localhost:3000"
        
        # Check API endpoint
        if curl -s http://localhost:3000/api/sahha/webhook | jq '.count' > /dev/null 2>&1; then
            PROFILE_COUNT=$(curl -s http://localhost:3000/api/sahha/webhook | jq '.count')
            echo "✅ API is working - $PROFILE_COUNT profiles loaded"
        else
            echo "⚠️  API endpoint not responding properly"
        fi
    else
        echo "❌ Dashboard is not responding on port 3000"
    fi
else
    echo "❌ Port 3000 is FREE"
fi

# Check log file
echo ""
echo "📝 Log File Status:"
if [ -f "dashboard.log" ]; then
    LOG_SIZE=$(wc -c < dashboard.log)
    LOG_LINES=$(wc -l < dashboard.log)
    echo "✅ Log file exists: dashboard.log"
    echo "   Size: $LOG_SIZE bytes, Lines: $LOG_LINES"
    echo ""
    echo "   Last 5 log entries:"
    tail -5 dashboard.log | sed 's/^/   /'
else
    echo "❌ No log file found"
fi

echo ""
echo "================================================"
echo "Commands:"
echo "  Start:   ./start-dashboard.sh"
echo "  Stop:    ./stop-dashboard.sh"
echo "  Status:  ./dashboard-status.sh"
echo "  Logs:    tail -f dashboard.log"