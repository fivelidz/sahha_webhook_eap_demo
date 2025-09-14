#!/bin/bash

echo "🧪 Testing if Sahha sends multiple score types separately"
echo "========================================================="

BASE_URL="http://localhost:3000/api/sahha/webhook"
TEST_ID="SampleProfile-TEST-$(date +%s)"

echo -e "\nSending multiple score events for same profile: $TEST_ID\n"

# Send sleep score
echo "1. Sending sleep score..."
curl -X POST $BASE_URL \
  -H "X-Signature: test" \
  -H "X-External-Id: $TEST_ID" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-Bypass-Signature: test" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sleep",
    "score": 0.85,
    "state": "high",
    "scoreDateTime": "2025-09-14T00:00:00Z",
    "factors": [
      {"name": "sleep_duration", "value": 480, "unit": "minutes", "score": 0.9, "state": "high"}
    ]
  }' -s | jq -c

# Send activity score for SAME profile
echo "2. Sending activity score..."
curl -X POST $BASE_URL \
  -H "X-Signature: test" \
  -H "X-External-Id: $TEST_ID" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-Bypass-Signature: test" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "activity",
    "score": 0.72,
    "state": "medium",
    "scoreDateTime": "2025-09-14T00:00:00Z",
    "factors": [
      {"name": "steps", "value": 8500, "unit": "steps", "score": 0.85, "state": "high"}
    ]
  }' -s | jq -c

# Send mental wellbeing score
echo "3. Sending mental wellbeing score..."
curl -X POST $BASE_URL \
  -H "X-Signature: test" \
  -H "X-External-Id: $TEST_ID" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-Bypass-Signature: test" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mental_wellbeing",
    "score": 0.78,
    "state": "high",
    "scoreDateTime": "2025-09-14T00:00:00Z"
  }' -s | jq -c

# Send readiness score
echo "4. Sending readiness score..."
curl -X POST $BASE_URL \
  -H "X-Signature: test" \
  -H "X-External-Id: $TEST_ID" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-Bypass-Signature: test" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "readiness",
    "score": 0.69,
    "state": "medium",
    "scoreDateTime": "2025-09-14T00:00:00Z"
  }' -s | jq -c

# Send wellbeing score
echo "5. Sending wellbeing score..."
curl -X POST $BASE_URL \
  -H "X-Signature: test" \
  -H "X-External-Id: $TEST_ID" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-Bypass-Signature: test" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "wellbeing",
    "score": 0.75,
    "state": "medium",
    "scoreDateTime": "2025-09-14T00:00:00Z"
  }' -s | jq -c

echo -e "\n✅ Checking stored data for $TEST_ID:"
curl -s "$BASE_URL?externalId=$TEST_ID" | jq '.data | {externalId, scores: (.scores | keys), scoreValues: .scores}'

echo -e "\n📊 This simulates how Sahha sends data:"
echo "   - Each score type comes as a separate webhook event"
echo "   - All events have the same X-External-Id header"
echo "   - Our webhook handler should aggregate them into one profile"