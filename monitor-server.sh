#!/bin/bash

# Monitor and restart the Sahha dashboard if it goes down

DASHBOARD_DIR="/home/fivelidz/sahha_work/sahha-marketing-intelligence/projects/sahha-wellness-template/react-version/profile-manager"
LOG_FILE="$DASHBOARD_DIR/monitor.log"
PID_FILE="$DASHBOARD_DIR/server.pid"
PORT=3000

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

check_server() {
    # Check if server responds
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/dashboard | grep -q "200"; then
        return 0
    else
        return 1
    fi
}

restart_server() {
    log_message "Server not responding, restarting..."
    cd "$DASHBOARD_DIR"
    
    # Kill any existing processes
    pkill -f "next dev" 2>/dev/null
    pkill -f "next start" 2>/dev/null
    
    # Wait for port to be released
    sleep 3
    
    # Start the server
    nohup npm run dev > server.log 2>&1 &
    NEW_PID=$!
    echo $NEW_PID > "$PID_FILE"
    
    log_message "Server restarted with PID: $NEW_PID"
    
    # Wait for server to start
    sleep 5
    
    if check_server; then
        log_message "Server successfully restarted and responding"
        return 0
    else
        log_message "Failed to restart server"
        return 1
    fi
}

# Main monitoring loop
while true; do
    if ! check_server; then
        log_message "Server check failed"
        restart_server
    fi
    
    # Check every 30 seconds
    sleep 30
done