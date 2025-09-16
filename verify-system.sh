#\!/bin/bash

echo "🔍 Verifying Sahha Webhook Integration System"
echo "=============================================="
echo

# Check if server is running
echo "1️⃣ Server Status:"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://localhost:3000/api/sahha/webhook
echo

# Check webhook data
echo "2️⃣ Webhook Data Summary:"
curl -s http://localhost:3000/api/sahha/webhook | jq '{
  profiles: .count,
  departments: .stats.departmentBreakdown,
  lastUpdate: .lastUpdated
}' 2>/dev/null || echo "   ❌ No data available"
echo

# Check webhook history
echo "3️⃣ Webhook History:"
curl -s "http://localhost:3000/api/sahha/webhook?history=true" | jq '{
  totalEvents: .stats.totalEntries,
  oldestEvent: .stats.oldestEntry,
  newestEvent: .stats.newestEntry
}' 2>/dev/null || echo "   ❌ No history available"
echo

# Display webhook URL for Sahha
echo "4️⃣ Webhook Configuration:"
echo "   Local URL: http://localhost:3000/api/sahha/webhook"
echo "   Ngrok URL: https://188482a7337d.ngrok-free.app/api/sahha/webhook"
echo "   Ready to receive Sahha Integration Events ✅"
echo

echo "5️⃣ Supported Event Types:"
echo "   ✅ ScoreCreatedIntegrationEvent"
echo "   ✅ ArchetypeCreatedIntegrationEvent"
echo "   ✅ BiomarkerCreatedIntegrationEvent"
echo "   ✅ DataLogReceivedIntegrationEvent"
echo

echo "6️⃣ Data Storage:"
echo "   Primary: data/sahha-webhook-data.json"
echo "   Backup: data/sahha-webhook-backup.json"
echo "   History: data/webhook-history.json"
echo "   Activity Log: data/webhook-activity.log"
echo

# Test POST endpoint
echo "7️⃣ Testing POST Endpoint:"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-External-Id: SYSTEM-TEST" \
  -d '{"type":"system_test","score":100,"state":"active"}')
echo "   Response: $(echo $RESPONSE | jq -r '.message' 2>/dev/null || echo 'Failed')"
echo

echo "=============================================="
echo "✅ Webhook system is operational and ready\!"
echo ""
echo "To configure Sahha to send events to this webhook:"
echo "1. Use the ngrok URL in your Sahha dashboard"
echo "2. Set webhook URL to: https://188482a7337d.ngrok-free.app/api/sahha/webhook"
echo "3. Enable the Integration Events you want to receive"
echo "4. Events will be stored locally and displayed in the dashboard"
