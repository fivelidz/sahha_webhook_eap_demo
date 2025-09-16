#\!/bin/bash

echo "🔐 Testing Sahha Webhook Authentication & Access"
echo "================================================"
echo

NGROK_URL="https://188482a7337d.ngrok-free.app"
LOCAL_URL="http://localhost:3000"

# Test local access
echo "1️⃣ Testing Local Access:"
LOCAL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $LOCAL_URL/api/sahha/webhook)
if [ "$LOCAL_RESPONSE" = "200" ]; then
    echo "   ✅ Local webhook accessible (HTTP $LOCAL_RESPONSE)"
else
    echo "   ❌ Local webhook not accessible (HTTP $LOCAL_RESPONSE)"
fi
echo

# Test ngrok tunnel (if available)
echo "2️⃣ Testing Ngrok Tunnel:"
echo "   URL: $NGROK_URL/api/sahha/webhook"
NGROK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 $NGROK_URL/api/sahha/webhook 2>/dev/null)
if [ "$NGROK_RESPONSE" = "200" ]; then
    echo "   ✅ Ngrok tunnel active and webhook accessible"
elif [ "$NGROK_RESPONSE" = "000" ]; then
    echo "   ⚠️  Ngrok tunnel not active or URL expired"
    echo "   Please run: ngrok http 3000"
    echo "   Then update the URL in this script"
else
    echo "   ⚠️  Ngrok returned HTTP $NGROK_RESPONSE"
fi
echo

# Test POST with various headers
echo "3️⃣ Testing POST with Sahha Headers:"
POST_RESPONSE=$(curl -s -X POST $LOCAL_URL/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-External-Id: AUTH-TEST-001" \
  -H "X-Signature: test-signature-12345" \
  -d '{"type":"wellbeing","score":75.5,"state":"good"}' | jq -r '.success' 2>/dev/null)

if [ "$POST_RESPONSE" = "true" ]; then
    echo "   ✅ POST endpoint accepts Sahha headers"
else
    echo "   ❌ POST endpoint failed"
fi
echo

# Check data persistence
echo "4️⃣ Checking Data Persistence:"
DATA_COUNT=$(curl -s $LOCAL_URL/api/sahha/webhook | jq -r '.count' 2>/dev/null)
if [ -n "$DATA_COUNT" ] && [ "$DATA_COUNT" -gt "0" ]; then
    echo "   ✅ Data persisted: $DATA_COUNT profiles stored"
else
    echo "   ⚠️  No data found"
fi
echo

# Display webhook endpoints
echo "5️⃣ Available Endpoints:"
echo "   GET  /api/sahha/webhook         - Retrieve all profile data"
echo "   GET  /api/sahha/webhook?history=true - View webhook history"
echo "   POST /api/sahha/webhook         - Receive Sahha events"
echo "   DELETE /api/sahha/webhook?confirm=true - Clear all data (testing)"
echo

echo "================================================"
echo "✅ Webhook authentication test complete\!"
echo ""
echo "Next steps:"
echo "1. Ensure ngrok is running: ngrok http 3000"
echo "2. Configure Sahha dashboard with the ngrok URL"
echo "3. Enable desired Integration Events in Sahha"
echo "4. Monitor data in the Profile Manager dashboard"
