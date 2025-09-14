#\!/bin/bash

# Test DataLog event with device info
echo "Sending DataLog event with device information..."

curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "X-Signature: test" \
  -H "X-External-Id: TestProfile-DeviceInfo" \
  -H "X-Event-Type: DataLogReceivedIntegrationEvent" \
  -H "Content-Type: application/json" \
  -d '{
    "logType": "device",
    "dataType": "device_lock",
    "profileId": "test-device-profile",
    "accountId": "test-account",
    "externalId": "TestProfile-DeviceInfo",
    "receivedAtUtc": "2025-09-14T23:15:02.459Z",
    "dataLogs": [{
      "id": "test-log-1",
      "parentId": "",
      "value": 1,
      "unit": "boolean",
      "source": "iPhone",
      "recordingMethod": "AUTOMATICALLY_RECORDED",
      "deviceType": "iPhone14,7",
      "startDateTime": "2025-09-15T09:00:02.52+10:00",
      "endDateTime": "2025-09-15T09:00:02.52+10:00"
    }]
  }'

echo ""
echo "Waiting for processing..."
sleep 2

# Check if device info was captured
echo ""
echo "Checking profile data..."
curl -s http://localhost:3000/api/sahha/webhook | jq '.profiles[] | select(.externalId == "TestProfile-DeviceInfo") | {externalId, device}'

chmod +x test-datalog-with-device.sh
EOF < /dev/null