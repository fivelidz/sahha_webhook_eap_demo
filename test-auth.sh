#!/bin/bash

echo "🔐 Testing Webhook Authentication"
echo "================================="

SECRET="CN6pV9ZGITXwj+/xAnrAQqZP4CQ+zp3tliNs8NO8EVc="
URL="http://localhost:3000/api/sahha/webhook"
PAYLOAD='{"type":"sleep","score":0.85,"state":"high","scoreDateTime":"2025-09-15T00:00:00Z"}'

# Generate signature using the secret (hex format)
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)

echo "Secret: ${SECRET:0:10}..."
echo "Signature (hex): ${SIGNATURE:0:20}..."
echo ""

# Test with proper signature
echo "Testing with correct signature..."
curl -X POST $URL \
  -H "X-Signature: $SIGNATURE" \
  -H "X-External-Id: auth-test-001" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -s | jq

echo ""
echo "Testing with base64 signature..."
SIGNATURE_B64=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -binary | base64)
curl -X POST $URL \
  -H "X-Signature: $SIGNATURE_B64" \
  -H "X-External-Id: auth-test-002" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -s | jq