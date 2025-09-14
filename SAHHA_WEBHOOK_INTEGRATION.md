# Sahha Webhook Integration Documentation

**Author:** Alexei Brown  
**Date:** 12 September 2025  
**Status:** Production Ready

## Overview

This document provides comprehensive documentation for integrating with Sahha's webhook system to receive real-time health data updates for profiles in the EAP Dashboard.

## Webhook Setup

### 1. Configure Webhook URL

```bash
# For local development with localtunnel
./start-webhook-tunnel.sh

# For production
https://your-domain.com/api/sahha/webhook
```

### 2. Register Webhook in Sahha Dashboard

1. Navigate to: https://app.sahha.ai/dashboard/webhooks
2. Add your webhook URL
3. Store the webhook secret securely
4. Select events to subscribe to

### 3. Environment Configuration

```env
# .env.development or .env.production
SAHHA_WEBHOOK_SECRET=HUsOxacDAGpM3nFFxNauZDbTEno/D5IOdwID9xvXvPc=
```

## Webhook Payload Formats

Sahha sends different webhook payload formats depending on the event type. Our webhook handler automatically detects and processes all formats.

### 1. Score Payload

Sent when a health score is calculated for a profile.

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "profileId": "123e4567-e89b-12d3-a456-426614174001",
  "accountId": "123e4567-e89b-12d3-a456-426614174002",
  "externalId": "ext-789",
  "type": "activity",
  "state": "medium",
  "score": 73.5,
  "factors": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174003",
      "name": "steps",
      "value": 10000,
      "goal": 12000,
      "score": 0.8,
      "state": "medium",
      "unit": "count"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174004",
      "name": "active_calories",
      "value": 74,
      "goal": 500,
      "score": 0.19,
      "state": "low",
      "unit": "kcal"
    }
  ],
  "dataSources": ["activity"],
  "scoreDateTime": "2023-06-26T12:34:50+00:00",
  "createdAtUtc": "2023-06-26T12:34:56+00:00",
  "version": 1
}
```

**Score Types:**
- `wellbeing` - Overall wellness score
- `activity` - Physical activity score
- `sleep` - Sleep quality score
- `mental_wellbeing` - Mental wellbeing score (not mental health)
- `readiness` - Daily readiness score

**States:**
- `minimal` - Very low (0-20)
- `low` - Low (20-40)
- `medium` - Medium (40-60)
- `high` - High (60-80)
- `excellent` - Excellent (80-100)

### 2. Archetype Payload

Sent when a behavioral archetype is calculated for a profile.

```json
{
  "id": "91ced284-5355-57f0-b162-1ac920a42371",
  "profileId": "6be989eb-813c-4380-be85-a6a7d787da70",
  "accountId": "a17fd912-46a2-48aa-be3e-1146ee2cd258",
  "externalId": "edd9afa-7012-4c30-8121-53fc3a9be461",
  "name": "sleep_duration",
  "value": "short_sleeper",
  "dataType": "ordinal",
  "ordinality": 1,
  "periodicity": "monthly",
  "startDateTime": "2025-01-01T00:00:00+13:00",
  "endDateTime": "2025-01-31T00:00:00+13:00",
  "createdAtUtc": "2025-02-01T13:08:53.322886Z",
  "version": 1
}
```

**Common Archetypes:**
- **Sleep:** `short_sleeper`, `normal_sleeper`, `long_sleeper`
- **Activity:** `sedentary`, `moderately_active`, `highly_active`
- **Wellness:** `balanced_wellness`, `improving_wellness`, `declining_wellness`
- **Circadian:** `early_bird`, `night_owl`, `irregular_schedule`

### 3. Biomarker Payload

Sent when individual biomarker data is processed.

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "profileId": "123e4567-e89b-12d3-a456-426614174001",
  "accountId": "123e4567-e89b-12d3-a456-426614174002",
  "externalId": "ext-789",
  "category": "activity",
  "type": "steps",
  "periodicity": "daily",
  "aggregation": "total",
  "value": "10000",
  "unit": "count",
  "valueType": "integer",
  "startDateTime": "2023-06-25T00:00:00+00:00",
  "endDateTime": "2023-06-25T23:59:59+00:00",
  "createdAtUtc": "2023-06-26T12:34:56+00:00",
  "version": 1
}
```

**Categories & Types:**
- **activity:** `steps`, `active_calories`, `active_hours`, `distance`
- **sleep:** `sleep_duration`, `sleep_efficiency`, `sleep_debt`, `rem_duration`
- **heart:** `heart_rate`, `hrv`, `resting_heart_rate`
- **body:** `weight`, `body_temperature`, `respiratory_rate`

### 4. Data Log Integration Payload

Sent when raw device data is received and processed.

```json
{
  "logType": "activity",
  "dataType": "steps",
  "profileId": "123e4567-e89b-12d3-a456-426614174001",
  "accountId": "123e4567-e89b-12d3-a456-426614174002",
  "externalId": "ext-789",
  "receivedAtUtc": "2023-06-26T12:34:56+00:00",
  "dataLogs": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174003",
      "parentId": null,
      "value": 10000,
      "unit": "count",
      "source": "iPhone X",
      "recordingMethod": "RECORDING_METHOD_AUTOMATICALLY_RECORDED",
      "deviceType": "iPhone13,2",
      "startDateTime": "2023-06-25T00:00:00+00:00",
      "endDateTime": "2023-06-25T23:59:59+00:00",
      "additionalProperties": {}
    }
  ]
}
```

## Webhook Security

### Signature Verification

All webhooks include a signature header for verification:

```typescript
// Webhook includes X-Sahha-Signature header
const signature = request.headers.get('X-Sahha-Signature');

// Verify using HMAC-SHA256
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(rawBody)
  .digest('base64');

// Constant-time comparison
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSignature)
);
```

## Data Storage Format

Webhook data is stored in a normalized format for efficient access:

```typescript
interface StoredProfile {
  profileId: string;
  externalId: string;
  accountId: string;
  
  // Scores (0-100 scale)
  scores: {
    wellbeing?: { value: number; state: string; updatedAt: string };
    activity?: { value: number; state: string; updatedAt: string };
    sleep?: { value: number; state: string; updatedAt: string };
    mental_wellbeing?: { value: number; state: string; updatedAt: string };
    readiness?: { value: number; state: string; updatedAt: string };
  };
  
  // Factors for each score
  factors: {
    [scoreType: string]: Array<{
      name: string;
      value: number;
      goal?: number;
      score: number;
      state: string;
      unit: string;
    }>;
  };
  
  // Behavioral archetypes
  archetypes: {
    [archetypeName: string]: {
      value: string;
      periodicity: string;
      updatedAt: string;
    };
  };
  
  // Individual biomarkers
  biomarkers: {
    [biomarkerKey: string]: {
      category: string;
      type: string;
      value: string | number;
      unit: string;
      updatedAt: string;
    };
  };
  
  // Raw data logs
  dataLogs: {
    [logKey: string]: Array<{
      receivedAt: string;
      logs: any[];
    }>;
  };
  
  lastUpdated: string;
}
```

## API Endpoints

### POST /api/sahha/webhook
Receives webhook payloads from Sahha.

**Headers:**
- `X-Sahha-Signature`: Webhook signature for verification
- `Content-Type`: application/json

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "event": "score",
  "profilesProcessed": 1
}
```

### GET /api/sahha/webhook
Retrieves stored webhook data.

**Query Parameters:**
- `externalId` (optional): Get data for specific profile

**Response:**
```json
{
  "success": true,
  "count": 57,
  "profiles": [...],
  "lastUpdated": "2025-09-12T00:00:00Z"
}
```

### DELETE /api/sahha/webhook?confirm=true
Clears all webhook data (for testing).

## Testing Webhook Integration

### 1. Local Testing

```bash
# Start dev server
npm run dev

# Start tunnel
./start-webhook-tunnel.sh

# Access test interface
http://localhost:3001/webhook-test
```

### 2. Send Test Webhook

```bash
curl -X POST https://your-webhook-url/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Sahha-Signature: your-signature" \
  -d '{
    "externalId": "test-001",
    "type": "wellbeing",
    "score": 75,
    "state": "high",
    "createdAtUtc": "2025-09-12T00:00:00Z"
  }'
```

### 3. Verify Data Reception

1. Check webhook test page for received data
2. View logs at `/data/webhook-activity.log`
3. Inspect stored data at `/data/sahha-webhook-data.json`

## Integration with Profile Manager

The Profile Manager automatically uses webhook data when available:

```typescript
// Profile Manager checks for webhook data first
const webhookData = await fetch('/api/sahha/webhook?externalId=' + externalId);
if (webhookData.success && webhookData.data) {
  // Use webhook data (complete and formatted)
  return formatWebhookData(webhookData.data);
} else {
  // Fall back to API calls
  return fetchFromSahhaAPI(externalId);
}
```

## Troubleshooting

### Common Issues

1. **Invalid Signature Error**
   - Verify webhook secret matches Sahha dashboard
   - Ensure raw body is used for signature verification
   - Check header name (X-Sahha-Signature vs X-Webhook-Signature)

2. **No Data Received**
   - Verify webhook URL is publicly accessible
   - Check Sahha dashboard for webhook status
   - Review webhook activity logs for errors

3. **Incomplete Data**
   - Some profiles may not have all score types
   - Archetypes are calculated periodically (monthly/weekly)
   - Biomarkers depend on device data availability

### Debug Mode

Enable debug logging in webhook handler:

```typescript
// Set in environment
WEBHOOK_DEBUG=true

// Logs will show:
// - Received payload type
// - Processing steps
// - Data storage operations
// - Any errors encountered
```

## MCP Integration

For AI agents using the Model Context Protocol:

```typescript
// MCP tool definition
{
  "name": "sahha_webhook_data",
  "description": "Access real-time health data from Sahha webhooks",
  "parameters": {
    "action": "get|list|clear",
    "externalId": "optional profile ID"
  }
}

// Example usage
const data = await mcp.call('sahha_webhook_data', {
  action: 'get',
  externalId: 'EMP-001'
});
```

## Best Practices

1. **Always verify webhook signatures** in production
2. **Store webhook data locally** for fast access
3. **Implement retry logic** for failed webhook processing
4. **Monitor webhook activity** through logs
5. **Use webhook data as primary source**, API as fallback
6. **Format scores consistently** (3 significant figures)
7. **Convert time displays** (e.g., 2.5 hours → 2h 30m)
8. **Handle missing data gracefully** with appropriate defaults

## Support

For issues or questions:
- Check webhook activity logs
- Review Sahha API documentation
- Contact: alexei@sahha.ai

---

*This documentation is part of the Sahha EAP Dashboard project.*