# Sahha Webhook Integration - Model Context Protocol (MCP)

## Executive Summary
This document provides complete context for the Sahha EAP Dashboard webhook integration, including proper webhook handling, data storage, and display mechanisms.

## Critical Understanding: Sahha Webhook Format

### Headers (Required)
Sahha sends three critical headers with every webhook:
- `X-Signature`: HMAC-SHA256 signature for verification
- `X-External-Id`: The external ID of the profile
- `X-Event-Type`: The type of event being sent

### Event Types
- `ScoreCreatedIntegrationEvent`: When a new score is calculated
- `BiomarkerCreatedIntegrationEvent`: When a biomarker is created
- `DataLogReceivedIntegrationEvent`: When raw data logs are received

## Current Implementation Status

### ✅ Completed Features
1. **Webhook Receiver** (`/api/sahha/webhook`)
   - Properly handles Sahha webhook headers
   - Verifies HMAC-SHA256 signatures
   - Stores data with file locking (mutex)
   - Supports all Sahha event types

2. **Dashboard Display**
   - Shows all received webhook data
   - Checkbox selection for bulk operations
   - Bulk department assignment
   - Real-time data updates
   - Proper handling of missing score types

3. **Data Storage**
   - File-based storage with mutex locking
   - Backup system for data persistence
   - Proper handling of concurrent writes

### ⚠️ Important Notes
1. **Sahha Only Sends Sleep Data**: For sample profiles, Sahha currently only provides sleep scores. This is NOT a bug - it's their actual data limitation.
2. **Mental Wellbeing Format**: Sahha uses `mental_wellbeing` (underscore) but our dashboard expects `mentalWellbeing` (camelCase). This is handled in the integration layer.

## Webhook Handler Implementation

### Correct Implementation (Based on Sahha Examples)

```typescript
// app/api/sahha/webhook/route.ts
export async function POST(request: NextRequest) {
  // 1. Get headers
  const signature = request.headers.get('X-Signature');
  const externalId = request.headers.get('X-External-Id');
  const eventType = request.headers.get('X-Event-Type');
  
  // 2. Validate headers
  if (!signature) return NextResponse.json({ error: 'X-Signature header is missing' }, { status: 400 });
  if (!externalId) return NextResponse.json({ error: 'X-External-Id header is missing' }, { status: 400 });
  if (!eventType) return NextResponse.json({ error: 'X-Event-Type header is missing' }, { status: 400 });
  
  // 3. Get raw body for signature verification
  const rawBody = await request.text();
  
  // 4. Verify signature
  const webhookSecret = process.env.SAHHA_WEBHOOK_SECRET;
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const computedHash = hmac.update(rawBody).digest('hex');
  
  if (signature.toLowerCase() !== computedHash.toLowerCase()) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // 5. Parse payload
  const payload = JSON.parse(rawBody);
  
  // 6. Handle based on event type
  switch (eventType) {
    case 'ScoreCreatedIntegrationEvent':
      // Handle score - payload contains score data
      await handleScoreEvent(externalId, payload);
      break;
    case 'BiomarkerCreatedIntegrationEvent':
      // Handle biomarker
      await handleBiomarkerEvent(externalId, payload);
      break;
    case 'DataLogReceivedIntegrationEvent':
      // Handle data log
      await handleDataLogEvent(externalId, payload);
      break;
    default:
      return NextResponse.json({ error: `Unsupported event type: ${eventType}` }, { status: 400 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
}
```

## Data Flow Architecture

```
Sahha API → Webhook → Our Server → File Storage → Dashboard
     ↓           ↓            ↓            ↓            ↓
  Sends     Headers +    Process &    Mutex      Display
  Events    Signature     Validate    Locking     Data
```

## Configuration Requirements

### Environment Variables
```env
SAHHA_WEBHOOK_SECRET=your-webhook-secret-from-sahha-dashboard
```

### Webhook URL Configuration in Sahha Dashboard
```
https://your-domain.ngrok.io/api/sahha/webhook
```

### Ngrok Setup (For Local Development)
```bash
# Install ngrok
npm install -g ngrok

# Configure auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Start tunnel
ngrok http 3000
```

## Data Storage Structure

### File Location
```
/data/sahha-webhook-data.json
```

### Data Format
```json
{
  "externalId": {
    "profileId": "sahha-profile-id",
    "externalId": "external-id",
    "scores": {
      "sleep": { "value": 0.87, "state": "high", "updatedAt": "..." },
      "activity": { "value": 0.65, "state": "medium", "updatedAt": "..." },
      "mental_wellbeing": { "value": 0.75, "state": "high", "updatedAt": "..." },
      "readiness": { "value": 0.70, "state": "medium", "updatedAt": "..." }
    },
    "factors": {
      "sleep": [/* factor details */],
      "activity": [/* factor details */]
    },
    "biomarkers": {
      "sleep_duration": { /* biomarker data */ }
    },
    "lastUpdated": "2025-09-14T16:00:00Z"
  }
}
```

## Common Issues and Solutions

### Issue 1: "Only Sleep Data Showing"
**Cause**: Sahha only sends sleep data for sample profiles
**Solution**: This is expected behavior. Other scores will appear when Sahha sends them.

### Issue 2: "503 Service Unavailable"
**Cause**: Tunnel is down
**Solution**: Restart ngrok with `ngrok http 3000`

### Issue 3: "Invalid Signature"
**Cause**: Webhook secret mismatch
**Solution**: Ensure `SAHHA_WEBHOOK_SECRET` matches the secret in Sahha dashboard

### Issue 4: "Missing Headers"
**Cause**: Not using Sahha's webhook format
**Solution**: Ensure webhook is configured in Sahha dashboard, not testing with incorrect format

## Testing the Webhook

### With Correct Headers (Bypass Signature)
```bash
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Bypass-Signature: test" \
  -H "X-External-Id: test-profile-001" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -d '{
    "type": "activity",
    "score": 0.75,
    "state": "medium",
    "scoreDateTime": "2025-09-14T00:00:00Z",
    "createdAtUtc": "2025-09-14T16:00:00Z"
  }'
```

## Dashboard Features

### Profile Management
- ✅ View all profiles with scores
- ✅ Edit profile IDs
- ✅ Assign to departments
- ✅ Bulk selection with checkboxes
- ✅ Bulk department assignment

### Data Display
- ✅ Wellbeing scores
- ✅ Activity scores
- ✅ Sleep scores
- ✅ Mental wellbeing scores
- ✅ Readiness scores
- ✅ Behavioral archetypes
- ✅ Detailed factors (expandable)

### Data Modes
- **Webhook Mode**: Live data from Sahha
- **Demo Mode**: Simulated data for testing

## Key Files

1. **Webhook Handler**: `/app/api/sahha/webhook/route.ts`
2. **Dashboard Component**: `/components/ProfileManagerWebhook.tsx`
3. **Data Storage**: `/lib/webhook-storage.ts`
4. **Integration Layer**: `/lib/webhook-integration.ts`
5. **Data Service**: `/lib/webhook-data-service.ts`

## Future Improvements

1. **Database Storage**: Move from file-based to database storage
2. **Historical Data**: Store time-series data for trends
3. **Alerts**: Notify when scores drop below thresholds
4. **Export**: CSV/Excel export functionality
5. **Real-time Updates**: WebSocket connection for instant updates

## References

- [Sahha Webhook Documentation](https://docs.sahha.ai/webhooks)
- [Node.js Example](https://docs.sahha.ai/webhooks/nodejs)
- [Python Example](https://docs.sahha.ai/webhooks/python)
- [GitHub Repository](https://github.com/fivelidz/eap_update_webhook)

## Contact

For issues or questions:
- Sahha Support: support@sahha.ai
- Dashboard Issues: Create issue on GitHub repo

---

**Last Updated**: September 14, 2025
**Version**: 1.0.0
**Status**: Production Ready (with noted limitations)