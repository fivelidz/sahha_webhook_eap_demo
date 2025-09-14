#!/bin/bash

# Sahha Webhook Integration Test Script
# This script tests the complete webhook data flow

echo "================================================"
echo "     SAHHA WEBHOOK INTEGRATION TEST SUITE      "
echo "================================================"
echo

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test webhook endpoint
test_webhook() {
    local test_name="$1"
    local external_id="$2"
    local event_type="$3"
    local payload="$4"
    
    echo -n "Testing: $test_name... "
    
    response=$(curl -s -X POST http://localhost:3000/api/sahha/webhook \
        -H "Content-Type: application/json" \
        -H "X-Signature: test-signature" \
        -H "X-External-Id: $external_id" \
        -H "X-Event-Type: $event_type" \
        -H "X-Bypass-Signature: test" \
        -d "$payload")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Response: $response"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to verify data was stored
verify_stored_data() {
    local external_id="$1"
    local expected_scores="$2"
    
    echo -n "Verifying stored data for $external_id... "
    
    stored_data=$(curl -s http://localhost:3000/api/sahha/webhook | \
        jq --arg id "$external_id" '.profiles[] | select(.externalId == $id) | .scores | keys | sort | join(",")')
    
    # Remove quotes from jq output
    stored_data="${stored_data//\"/}"
    
    if [ "$stored_data" == "$expected_scores" ]; then
        echo -e "${GREEN}✓ VERIFIED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ MISMATCH${NC}"
        echo "  Expected: $expected_scores"
        echo "  Got: $stored_data"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "1. TESTING SCORE EVENTS"
echo "------------------------"

# Test Sleep Score
test_webhook "Sleep Score Event" \
    "TestProfile-003" \
    "ScoreCreatedIntegrationEvent" \
    '{
        "type": "sleep",
        "score": 0.92,
        "state": "high",
        "scoreDateTime": "2025-09-14T00:00:00Z",
        "factors": [
            {
                "name": "sleep_duration",
                "value": 480,
                "goal": 480,
                "score": 1.0,
                "state": "high",
                "unit": "minutes"
            }
        ]
    }'

# Test Activity Score
test_webhook "Activity Score Event" \
    "TestProfile-003" \
    "ScoreCreatedIntegrationEvent" \
    '{
        "type": "activity",
        "score": 0.65,
        "state": "medium",
        "scoreDateTime": "2025-09-14T00:00:00Z"
    }'

# Test Mental Wellbeing Score
test_webhook "Mental Wellbeing Score Event" \
    "TestProfile-003" \
    "ScoreCreatedIntegrationEvent" \
    '{
        "type": "mental_wellbeing",
        "score": 0.78,
        "state": "high",
        "scoreDateTime": "2025-09-14T00:00:00Z"
    }'

# Test Readiness Score
test_webhook "Readiness Score Event" \
    "TestProfile-003" \
    "ScoreCreatedIntegrationEvent" \
    '{
        "type": "readiness",
        "score": 0.71,
        "state": "medium",
        "scoreDateTime": "2025-09-14T00:00:00Z"
    }'

# Test Wellbeing Score
test_webhook "Wellbeing Score Event" \
    "TestProfile-003" \
    "ScoreCreatedIntegrationEvent" \
    '{
        "type": "wellbeing",
        "score": 0.74,
        "state": "medium",
        "scoreDateTime": "2025-09-14T00:00:00Z"
    }'

echo
echo "2. TESTING BIOMARKER EVENTS"
echo "----------------------------"

# Test Biomarker Event
test_webhook "Sleep Duration Biomarker" \
    "TestProfile-004" \
    "BiomarkerCreatedIntegrationEvent" \
    '{
        "category": "sleep",
        "type": "sleep_duration",
        "value": "420",
        "unit": "minute",
        "valueType": "double",
        "periodicity": "daily",
        "aggregation": "average",
        "startDateTime": "2025-09-14T00:00:00Z",
        "endDateTime": "2025-09-14T23:59:59Z"
    }'

test_webhook "Heart Rate Biomarker" \
    "TestProfile-004" \
    "BiomarkerCreatedIntegrationEvent" \
    '{
        "category": "vitals",
        "type": "heart_rate",
        "value": "72",
        "unit": "bpm",
        "valueType": "integer",
        "periodicity": "intraday",
        "aggregation": "average"
    }'

echo
echo "3. VERIFYING DATA STORAGE"
echo "--------------------------"

# Give the system a moment to process
sleep 1

verify_stored_data "TestProfile-003" "activity,mental_wellbeing,readiness,sleep,wellbeing"

echo
echo "4. TESTING ERROR CASES"
echo "-----------------------"

# Test missing headers
echo -n "Testing: Missing X-External-Id header... "
response=$(curl -s -X POST http://localhost:3000/api/sahha/webhook \
    -H "Content-Type: application/json" \
    -H "X-Signature: test" \
    -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
    -d '{"type": "sleep", "score": 0.5}' 2>&1)

if echo "$response" | grep -q "X-External-Id header is missing"; then
    echo -e "${GREEN}✓ Correctly rejected${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Should have rejected${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Testing: Missing X-Event-Type header... "
response=$(curl -s -X POST http://localhost:3000/api/sahha/webhook \
    -H "Content-Type: application/json" \
    -H "X-Signature: test" \
    -H "X-External-Id: test" \
    -d '{"type": "sleep", "score": 0.5}' 2>&1)

if echo "$response" | grep -q "X-Event-Type header is missing"; then
    echo -e "${GREEN}✓ Correctly rejected${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Should have rejected${NC}"
    ((TESTS_FAILED++))
fi

echo
echo "5. TESTING BATCH PROCESSING"
echo "----------------------------"

# Test multiple rapid webhooks
for i in {1..5}; do
    test_webhook "Rapid webhook $i" \
        "TestProfile-Batch-$i" \
        "ScoreCreatedIntegrationEvent" \
        "{
            \"type\": \"sleep\",
            \"score\": 0.$((60 + i * 5)),
            \"state\": \"medium\",
            \"scoreDateTime\": \"2025-09-14T0$i:00:00Z\"
        }" &
done

# Wait for all background jobs to complete
wait

echo
echo "================================================"
echo "              TEST RESULTS SUMMARY              "
echo "================================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo "The webhook integration is working correctly."
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo "Please review the failures above."
fi

echo
echo "6. FINAL DATA CHECK"
echo "-------------------"
echo "Total profiles in system:"
curl -s http://localhost:3000/api/sahha/webhook | jq '.count'

echo
echo "Score type distribution:"
curl -s http://localhost:3000/api/sahha/webhook | jq '.profiles | map(.scores | keys) | flatten | group_by(.) | map({type: .[0], count: length})'