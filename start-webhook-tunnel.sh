#!/bin/bash

# Webhook Tunnel Manager for Sahha EAP Dashboard
# This script maintains a persistent tunnel for webhook testing

TUNNEL_TYPE=${1:-localtunnel}  # Default to localtunnel, can use 'ngrok' if configured
PORT=3000
LOG_FILE="tunnel.log"
PID_FILE="tunnel.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to stop existing tunnel
stop_tunnel() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${YELLOW}Stopping existing tunnel (PID: $PID)...${NC}"
            kill $PID 2>/dev/null
            sleep 2
        fi
        rm -f "$PID_FILE"
    fi
    
    # Also kill any stray processes
    pkill -f "localtunnel.*$PORT" 2>/dev/null
    pkill -f "ngrok.*$PORT" 2>/dev/null
}

# Function to start localtunnel
start_localtunnel() {
    echo -e "${GREEN}Starting LocalTunnel on port $PORT...${NC}"
    
    # Start localtunnel in background and capture output
    npx localtunnel --port $PORT > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    # Wait for URL
    echo -n "Waiting for tunnel URL"
    for i in {1..10}; do
        if grep -q "your url is:" "$LOG_FILE" 2>/dev/null; then
            URL=$(grep "your url is:" "$LOG_FILE" | tail -1 | awk '{print $4}')
            echo -e "\n${GREEN}✓ Tunnel established!${NC}"
            echo -e "${GREEN}Webhook URL: ${URL}/api/sahha/webhook${NC}"
            echo ""
            echo "For testing, you can bypass signature verification with:"
            echo "Header: X-Bypass-Signature: test"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    
    echo -e "\n${RED}Failed to get tunnel URL${NC}"
    return 1
}

# Function to start ngrok
start_ngrok() {
    echo -e "${GREEN}Starting ngrok on port $PORT...${NC}"
    
    # Check if ngrok is configured
    if ! ngrok config check 2>/dev/null; then
        echo -e "${YELLOW}ngrok is not configured. Please run:${NC}"
        echo "1. Create a free account at https://dashboard.ngrok.com/signup"
        echo "2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken"
        echo "3. Run: ngrok config add-authtoken YOUR_TOKEN"
        echo ""
        echo "Falling back to localtunnel..."
        start_localtunnel
        return $?
    fi
    
    # Start ngrok in background
    ngrok http $PORT --log=stdout > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    # Wait for tunnel to be established
    echo -n "Waiting for ngrok tunnel"
    for i in {1..10}; do
        # Check ngrok API
        if curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -q "public_url"; then
            URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
            echo -e "\n${GREEN}✓ Tunnel established!${NC}"
            echo -e "${GREEN}Webhook URL: ${URL}/api/sahha/webhook${NC}"
            echo ""
            echo "ngrok Web Interface: http://localhost:4040"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    
    echo -e "\n${RED}Failed to establish ngrok tunnel${NC}"
    cat "$LOG_FILE"
    return 1
}

# Function to monitor tunnel health
monitor_tunnel() {
    echo -e "${GREEN}Monitoring tunnel health...${NC}"
    echo "Press Ctrl+C to stop"
    
    while true; do
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ! ps -p $PID > /dev/null 2>&1; then
                echo -e "${RED}Tunnel died! Restarting...${NC}"
                if [ "$TUNNEL_TYPE" = "ngrok" ]; then
                    start_ngrok
                else
                    start_localtunnel
                fi
            fi
        fi
        sleep 5
    done
}

# Main execution
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Sahha Webhook Tunnel Manager${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

# Stop any existing tunnel
stop_tunnel

# Start the appropriate tunnel
if [ "$TUNNEL_TYPE" = "ngrok" ]; then
    if start_ngrok; then
        monitor_tunnel
    else
        echo -e "${RED}Failed to start tunnel${NC}"
        exit 1
    fi
else
    if start_localtunnel; then
        monitor_tunnel
    else
        echo -e "${RED}Failed to start tunnel${NC}"
        exit 1
    fi
fi