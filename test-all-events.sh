#!/bin/bash

echo "🧪 Testing All Sahha Event Types"
echo "================================"

BASE_URL="http://localhost:3000/api/sahha/webhook"

# Test ScoreCreatedIntegrationEvent
echo -e "\n1. Testing ScoreCreatedIntegrationEvent..."
curl -X POST $BASE_URL \
  -H "X-Signature: test" \
  -H "X-External-Id: test-score-001" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-Bypass-Signature: test" \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "test-profile-score",
    "externalId": "test-score-001",
    "type": "activity",
    "score": 0.85,
    "state": "high",
    "scoreDateTime": "2025-09-14T00:00:00Z",
    "factors": [
      {
        "name": "steps",
        "value": 12000,
        "goal": 10000,
        "score": 1.2,
        "state": "excellent",
        "unit": "steps"
      }
    ]
  }' -s | jq '.success'

# Test BiomarkerCreatedIntegrationEvent
echo -e "\n2. Testing BiomarkerCreatedIntegrationEvent..."
curl -X POST $BASE_URL \
  -H "X-Signature: test" \
  -H "X-External-Id: test-biomarker-001" \
  -H "X-Event-Type: BiomarkerCreatedIntegrationEvent" \
  -H "X-Bypass-Signature: test" \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "test-profile-biomarker",
    "externalId": "test-biomarker-001",
    "category": "vitals",
    "type": "heart_rate_variability",
    "value": "45.5",
    "unit": "ms",
    "valueType": "double",
    "periodicity": "daily",
    "aggregation": "average",
    "startDateTime": "2025-09-14T00:00:00Z",
    "endDateTime": "2025-09-14T23:59:59Z"
  }' -s | jq '.success'

# Test DataLogReceivedIntegrationEvent
echo -e "\n3. Testing DataLogReceivedIntegrationEvent..."
curl -X POST $BASE_URL \
  -H "X-Signature: test" \
  -H "X-External-Id: test-datalog-001" \
  -H "X-Event-Type: DataLogReceivedIntegrationEvent" \
  -H "X-Bypass-Signature: test" \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "test-profile-datalog",
    "externalId": "test-datalog-001",
    "logType": "activity",
    "dataType": "steps",
    "receivedAtUtc": "2025-09-14T16:00:00Z",
    "dataLogs": [
      {
        "id": "log-001",
        "value": 1500,
        "unit": "steps",
        "source": "apple_health",
        "recordingMethod": "automatic",
        "deviceType": "phone",
        "startDateTime": "2025-09-14T10:00:00Z",
        "endDateTime": "2025-09-14T11:00:00Z"
      },
      {
        "id": "log-002",
        "value": 2000,
        "unit": "steps",
        "source": "apple_health",
        "recordingMethod": "automatic",
        "deviceType": "phone",
        "startDateTime": "2025-09-14T11:00:00Z",
        "endDateTime": "2025-09-14T12:00:00Z"
      }
    ]
  }' -s | jq '.success'

# Test Multiple Scores in one profile
echo -e "\n4. Testing Multiple Score Types..."
for score_type in "sleep" "activity" "mental_wellbeing" "readiness" "wellbeing"; do
  echo "   - Sending $score_type score..."
  curl -X POST $BASE_URL \
    -H "X-Signature: test" \
    -H "X-External-Id: test-multi-001" \
    -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
    -H "X-Bypass-Signature: test" \
    -H "Content-Type: application/json" \
    -d "{
      \"profileId\": \"test-profile-multi\",
      \"externalId\": \"test-multi-001\",
      \"type\": \"$score_type\",
      \"score\": $(echo "scale=2; 0.5 + $RANDOM / 65536" | bc),
      \"state\": \"medium\",
      \"scoreDateTime\": \"2025-09-14T00:00:00Z\"
    }" -s | jq -c '{success}'
done

# Check stored data
echo -e "\n5. Verifying Stored Data..."
echo "   Checking test profiles in storage:"
curl -s $BASE_URL | jq '.profiles[] | select(.externalId | startswith("test-")) | {externalId, hasScores: (.scores | keys | length), hasBiomarkers: (if .biomarkers then (.biomarkers | keys | length) else 0 end), hasDataLogs: (if .dataLogs then (.dataLogs | keys | length) else 0 end)}'

echo -e "\n✅ Test Complete!"
echo "Check data/webhook-event-analysis.json for detailed event capture"