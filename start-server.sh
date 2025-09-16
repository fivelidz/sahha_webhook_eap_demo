#\!/bin/bash

echo "🚀 Starting Sahha Webhook Server"
echo "================================="
echo

# Check if server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Server already running on port 3000"
    echo "   Run 'lsof -i :3000' to see the process"
else
    echo "Starting Next.js server..."
    npm run dev &
    echo "✅ Server starting on http://localhost:3000"
fi

echo
echo "⚠️  NGROK LIMIT REACHED"
echo "================================="
echo "Your ngrok account has reached its HTTP request limit for the month."
echo
echo "OPTIONS:"
echo "1. Wait for the limit to reset (next month)"
echo "2. Upgrade your ngrok plan at https://dashboard.ngrok.com"
echo "3. Use an alternative tunnel service:"
echo "   - localtunnel: npx localtunnel --port 3000"
echo "   - cloudflared: cloudflared tunnel --url http://localhost:3000"
echo "   - serveo: ssh -R 80:localhost:3000 serveo.net"
echo
echo "4. For testing, you can use the local webhook directly:"
echo "   http://localhost:3000/api/sahha/webhook"
echo
echo "================================="
echo "📋 Webhook Details:"
echo "   Secret: JjG7PCP2c8Y7yAuk+Yhz+mzMDkzcRUffwx/e+zBRdGE="
echo "   Endpoint: /api/sahha/webhook"
echo "   Supported Events:"
echo "   - ScoreCreatedIntegrationEvent"
echo "   - ArchetypeCreatedIntegrationEvent"
echo "   - BiomarkerCreatedIntegrationEvent"
echo "   - DataLogReceivedIntegrationEvent"
