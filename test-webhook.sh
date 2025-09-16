#\!/bin/bash

echo "🧪 Testing Sahha Webhook Integration"
echo "======================================"
echo

# Test 1: Score Created Event
echo "📊 Test 1: Sending ScoreCreatedIntegrationEvent..."
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-External-Id: TestProfile-001" \
  -d '{
    "eventType": "ScoreCreatedIntegrationEvent",
    "externalId": "TestProfile-001",
    "profileId": "TestProfile-001",
    "accountId": "sahha-test-account",
    "type": "wellbeing",
    "score": 75.5,
    "state": "good",
    "factors": {
      "sleep": 0.3,
      "activity": 0.4,
      "mental": 0.3
    },
    "scoreDateTime": "'$(date -Iseconds)'",
    "createdAtUtc": "'$(date -Iseconds)'"
  }' -s | jq '.'

echo
echo "📊 Test 2: Sending Activity Score..."
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-External-Id: TestProfile-001" \
  -d '{
    "type": "activity",
    "score": 82.3,
    "state": "active",
    "scoreDateTime": "'$(date -Iseconds)'"
  }' -s | jq '.'

echo
echo "🏛️ Test 3: Sending ArchetypeCreatedIntegrationEvent..."
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Event-Type: ArchetypeCreatedIntegrationEvent" \
  -H "X-External-Id: TestProfile-001" \
  -d '{
    "name": "activity_level",
    "value": "moderately_active",
    "dataType": "ordinal",
    "ordinality": 3,
    "periodicity": "daily"
  }' -s | jq '.'

echo
echo "🏛️ Test 4: Sending Sleep Pattern Archetype..."
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Event-Type: ArchetypeCreatedIntegrationEvent" \
  -H "X-External-Id: TestProfile-001" \
  -d '{
    "name": "sleep_pattern",
    "value": "good_sleeper",
    "dataType": "ordinal"
  }' -s | jq '.'

echo
echo "🧬 Test 5: Sending BiomarkerCreatedIntegrationEvent..."
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Event-Type: BiomarkerCreatedIntegrationEvent" \
  -H "X-External-Id: TestProfile-001" \
  -d '{
    "category": "heart",
    "type": "resting_heart_rate",
    "value": 65,
    "unit": "bpm",
    "periodicity": "daily",
    "aggregation": "average"
  }' -s | jq '.'

echo
echo "📝 Test 6: Creating Profile for Department Testing..."
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-External-Id: TestProfile-002" \
  -d '{
    "type": "wellbeing",
    "score": 68.2,
    "state": "moderate",
    "department": "tech"
  }' -s | jq '.'

echo
echo "📝 Test 7: Creating Another Profile..."
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-External-Id: TestProfile-003" \
  -d '{
    "type": "sleep",
    "score": 45.7,
    "state": "poor"
  }' -s | jq '.'

echo
echo "======================================"
echo "📋 Verifying stored data..."
echo
curl -s http://localhost:3000/api/sahha/webhook | jq '{
  count: .count,
  profiles: .profiles | length,
  firstProfile: .profiles[0] | {
    externalId: .externalId,
    scores: .scores | keys,
    archetypes: .archetypes | keys,
    biomarkers: .biomarkers | keys
  }
}'

echo
echo "📜 Checking webhook history..."
curl -s "http://localhost:3000/api/sahha/webhook?history=true" | jq '{
  totalEntries: .stats.totalEntries,
  recentEvents: .history[0:3] | map({
    timestamp: .timestamp,
    eventType: .eventType,
    externalId: .externalId
  })
}'

echo
echo "✅ Webhook testing complete\!"
