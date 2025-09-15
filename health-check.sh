#!/bin/bash

echo "🔍 Sahha Dashboard Health Check"
echo "================================"

# Check if server is running
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Server Process: Running (PID: $(pgrep -f 'next dev'))"
else
    echo "❌ Server Process: Not running"
    exit 1
fi

# Check port availability
if ss -tln | grep -q ":3000"; then
    echo "✅ Port 3000: Listening"
else
    echo "❌ Port 3000: Not listening"
    exit 1
fi

# Check dashboard endpoint
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard)
if [ "$DASHBOARD_STATUS" = "200" ]; then
    echo "✅ Dashboard: Accessible (HTTP $DASHBOARD_STATUS)"
else
    echo "❌ Dashboard: Not accessible (HTTP $DASHBOARD_STATUS)"
fi

# Check API endpoint
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/sahha/webhook")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API Endpoint: Accessible (HTTP $API_STATUS)"
else
    echo "❌ API Endpoint: Not accessible (HTTP $API_STATUS)"
fi

# Check demo mode
DEMO_MODE=$(curl -s "http://localhost:3000/api/sahha/webhook?mode=demo" | jq -r '.demoMode' 2>/dev/null)
if [ "$DEMO_MODE" = "true" ]; then
    echo "✅ Demo Mode: Working"
else
    echo "❌ Demo Mode: Not working"
fi

echo ""
echo "📌 Access Points:"
echo "   Dashboard: http://localhost:3000/dashboard"
echo "   Analytics: http://localhost:3000/analytics"
echo "   Profile Manager: http://localhost:3000/dashboard (first tab)"
echo ""
echo "📊 Features Available:"
echo "   ✓ Demo Mode Toggle (top of dashboard)"
echo "   ✓ CSV Export with all subscores"
echo "   ✓ Archetype Distribution View"
echo "   ✓ Department Matrix View"
echo "   ✓ Real-time webhook data"
echo ""
echo "💡 Tips:"
echo "   - Toggle Demo Mode to switch between real/demo data"
echo "   - Use View dropdown to access new archetype charts"
echo "   - Export CSV includes all sleep, activity, mental subscores"