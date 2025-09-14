# Sahha EAP Dashboard - Complete Model Context Protocol (MCP)

## 🎯 Purpose
This document serves as the complete reference for implementing, deploying, and maintaining the Sahha Employee Assistance Program (EAP) Dashboard with webhook integration. It combines all learnings, best practices, and implementation details for others to successfully replicate this solution.

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Webhook Integration](#webhook-integration)
4. [Dashboard Features](#dashboard-features)
5. [Setup Guide](#setup-guide)
6. [Testing & Validation](#testing--validation)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Production Deployment](#production-deployment)

---

## System Overview

### What This System Does
- **Receives** real-time behavioral health data from Sahha via webhooks
- **Stores** profile data with proper concurrency handling
- **Displays** comprehensive dashboard with scores, factors, and archetypes
- **Manages** employee profiles with department assignments
- **Supports** bulk operations for enterprise management

### Key Components
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Sahha API     │────▶│   Webhook    │────▶│  Dashboard  │
│  (Data Source)  │     │   Handler    │     │    (UI)     │
└─────────────────┘     └──────────────┘     └─────────────┘
         │                      │                     │
         ▼                      ▼                     ▼
   Sends Events          Stores Data          Displays Data
   with Headers          with Mutex           with React
```

## Architecture

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Material-UI
- **Backend**: Next.js API Routes
- **Storage**: File-based with mutex locking (upgradeable to database)
- **Tunnel**: Ngrok for local development
- **Deployment**: Vercel/Any Node.js host

### Data Flow
1. Sahha sends webhook with headers (X-Signature, X-External-Id, X-Event-Type)
2. Webhook handler verifies signature
3. Data processed based on event type
4. Stored with file locking to prevent race conditions
5. Dashboard fetches and displays data

## Webhook Integration

### ⚠️ Critical Understanding
Sahha uses **specific headers** for webhook delivery. This is different from typical webhook implementations.

### Required Headers
```typescript
interface SahhaWebhookHeaders {
  'X-Signature': string;      // HMAC-SHA256 signature
  'X-External-Id': string;     // Profile external ID
  'X-Event-Type': string;      // Event type
}
```

### Event Types
1. **ScoreCreatedIntegrationEvent** - New score calculated
2. **BiomarkerCreatedIntegrationEvent** - Biomarker created
3. **DataLogReceivedIntegrationEvent** - Raw data received

### Correct Implementation

```typescript
// ✅ CORRECT - Using Sahha's header format
export async function POST(request: NextRequest) {
  // Get headers
  const signature = request.headers.get('X-Signature');
  const externalId = request.headers.get('X-External-Id');
  const eventType = request.headers.get('X-Event-Type');
  
  // Validate headers
  if (!signature) return error('X-Signature header is missing');
  if (!externalId) return error('X-External-Id header is missing');
  if (!eventType) return error('X-Event-Type header is missing');
  
  // Verify signature
  const rawBody = await request.text();
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const computedHash = hmac.update(rawBody).digest('hex');
  
  if (signature.toLowerCase() !== computedHash.toLowerCase()) {
    return error('Invalid signature');
  }
  
  // Process based on event type
  const payload = JSON.parse(rawBody);
  switch (eventType) {
    case 'ScoreCreatedIntegrationEvent':
      await handleScore(externalId, payload);
      break;
    // ... other cases
  }
}
```

### Data Storage Structure

```json
{
  "externalId": {
    "profileId": "sahha-id",
    "externalId": "external-id",
    "scores": {
      "sleep": { "value": 0.87, "state": "high" },
      "activity": { "value": 0.65, "state": "medium" },
      "mental_wellbeing": { "value": 0.75, "state": "high" },
      "readiness": { "value": 0.70, "state": "medium" },
      "wellbeing": { "value": 0.72, "state": "medium" }
    },
    "factors": {
      "sleep": [...],
      "activity": [...]
    },
    "biomarkers": {...}
  }
}
```

## Dashboard Features

### Profile Management
- ✅ **Checkbox Selection** - Select multiple profiles
- ✅ **Bulk Assignment** - Assign departments in bulk
- ✅ **Search & Filter** - Find profiles quickly
- ✅ **Editable IDs** - Customize profile identifiers
- ✅ **Department Assignment** - Organize by teams

### Data Display
- ✅ **Five Score Types** - Sleep, Activity, Mental Wellbeing, Readiness, Wellbeing
- ✅ **Expandable Factors** - View detailed sub-scores
- ✅ **Behavioral Archetypes** - Display user patterns
- ✅ **Real-time Updates** - Live webhook data
- ✅ **Data Mode Toggle** - Switch between webhook/demo

### Important Notes
1. **Sahha Only Sends Sleep Data Initially** - For sample profiles, only sleep scores are available. This is NOT a bug.
2. **Mental Wellbeing Format** - Sahha uses `mental_wellbeing` (underscore), dashboard expects `mentalWellbeing` (camelCase). This is handled automatically.

## Setup Guide

### Prerequisites
```bash
# Required
- Node.js 18+
- npm or yarn
- Sahha account with webhook access
```

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/fivelidz/eap_update_webhook.git
cd eap_update_webhook
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Variables**
```bash
# Create .env.local
SAHHA_WEBHOOK_SECRET=your-webhook-secret-from-sahha
```

4. **Start Development Server**
```bash
npm run dev
```

### Webhook Setup

#### Using Ngrok (Recommended for Development)

1. **Install Ngrok**
```bash
npm install -g ngrok
```

2. **Configure Auth Token**
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

3. **Start Tunnel**
```bash
ngrok http 3000
```

4. **Configure in Sahha Dashboard**
- URL: `https://your-tunnel.ngrok.io/api/sahha/webhook`
- Events: All event types
- Secret: Copy to `.env.local`

## Testing & Validation

### Automated Test Suite
```bash
# Run comprehensive tests
chmod +x test-webhook.sh
./test-webhook.sh
```

### Manual Testing
```bash
# Test with proper headers
curl -X POST https://your-tunnel.ngrok.io/api/sahha/webhook \
  -H "X-Signature: test" \
  -H "X-External-Id: test-001" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "X-Bypass-Signature: test" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sleep",
    "score": 0.85,
    "state": "high",
    "scoreDateTime": "2025-09-14T00:00:00Z"
  }'
```

### Verification Checklist
- [ ] Webhook receives data (check logs)
- [ ] Data stored in `/data/sahha-webhook-data.json`
- [ ] Dashboard displays scores
- [ ] Checkbox selection works
- [ ] Bulk assignment functions
- [ ] Factors expand correctly

## Common Issues & Solutions

### Issue: "Only Sleep Data Showing"
**Cause**: Sahha only sends sleep data for sample profiles  
**Solution**: This is expected. Other scores appear when Sahha sends them.  
**Verification**: Check the actual webhook payload from Sahha

### Issue: "503 Service Unavailable"
**Cause**: Tunnel is down  
**Solution**: 
```bash
# Restart ngrok
ngrok http 3000
# Update webhook URL in Sahha dashboard
```

### Issue: "Invalid Signature"
**Cause**: Secret mismatch  
**Solution**: 
1. Copy secret from Sahha dashboard
2. Update `SAHHA_WEBHOOK_SECRET` in `.env.local`
3. Restart server

### Issue: "Missing Headers"
**Cause**: Testing with wrong format  
**Solution**: Use the correct Sahha header format (X-Signature, X-External-Id, X-Event-Type)

### Issue: "Data Not Persisting"
**Cause**: File locking issues  
**Solution**: Ensure `/data` directory has write permissions
```bash
mkdir -p data
chmod 755 data
```

## Production Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Connect GitHub repo
- Set environment variables
- Deploy

3. **Configure Webhook URL**
- Update Sahha dashboard with production URL
- Example: `https://your-app.vercel.app/api/sahha/webhook`

### Security Considerations

1. **Always Verify Signatures**
```typescript
// Never skip signature verification in production
if (!verifySignature(signature, payload, secret)) {
  return unauthorized();
}
```

2. **Use HTTPS Only**
- Webhooks should only accept HTTPS connections
- Reject HTTP in production

3. **Rate Limiting**
- Implement rate limiting for webhook endpoint
- Prevent abuse and DDoS

4. **Database Migration**
- For production, migrate from file storage to database
- PostgreSQL or MongoDB recommended

### Monitoring

1. **Webhook Activity Log**
- Check `/data/webhook-activity.log`
- Monitor for failures

2. **Health Checks**
```typescript
// Add health endpoint
export async function GET() {
  const profiles = await loadWebhookData();
  return {
    status: 'healthy',
    profileCount: Object.keys(profiles).length,
    lastUpdate: getLastUpdate()
  };
}
```

## Performance Optimization

### Caching Strategy
```typescript
// Implement caching for dashboard
const CACHE_DURATION = 60000; // 1 minute
let cache = { data: null, timestamp: 0 };

function getCachedData() {
  if (Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }
  return null;
}
```

### Database Schema (Future)
```sql
-- Recommended schema for production
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE,
  profile_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scores (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  type VARCHAR(50),
  value DECIMAL(3,2),
  state VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scores_profile ON scores(profile_id);
CREATE INDEX idx_scores_type ON scores(type);
```

## API Reference

### Webhook Endpoint
**POST** `/api/sahha/webhook`

Headers:
- `X-Signature`: HMAC-SHA256 signature
- `X-External-Id`: Profile external ID
- `X-Event-Type`: Event type

Response:
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "profilesProcessed": 1
}
```

### Data Retrieval
**GET** `/api/sahha/webhook`

Response:
```json
{
  "success": true,
  "count": 54,
  "profiles": [...],
  "lastUpdated": "2025-09-14T16:00:00Z"
}
```

## Support & Resources

### Documentation
- [Sahha Webhook Docs](https://docs.sahha.ai/webhooks)
- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Components](https://mui.com/components)

### Troubleshooting
1. Check server logs: `npm run dev`
2. Verify webhook logs: `/data/webhook-activity.log`
3. Test with test script: `./test-webhook.sh`

### Contact
- **Sahha Support**: support@sahha.ai
- **Dashboard Issues**: Create issue on [GitHub](https://github.com/fivelidz/eap_update_webhook)

---

## Version History

### v1.0.0 (September 14, 2025)
- Initial release with full webhook integration
- Checkbox selection and bulk operations
- Complete score type support
- Comprehensive testing suite

### Known Limitations
1. Sahha sample profiles only include sleep data
2. File-based storage (database recommended for production)
3. No real-time updates (polling required)

---

**Last Updated**: September 14, 2025  
**Maintainer**: Alexei Brown  
**License**: MIT

---

## Quick Reference Card

### Essential Commands
```bash
# Development
npm run dev                    # Start dev server
ngrok http 3000               # Start tunnel
./test-webhook.sh             # Run tests

# Deployment
git push origin main          # Deploy to GitHub
vercel                        # Deploy to Vercel

# Debugging
tail -f data/webhook-activity.log     # Watch webhook logs
jq . data/sahha-webhook-data.json     # View stored data
```

### Webhook Test Command
```bash
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "X-Bypass-Signature: test" \
  -H "X-External-Id: test-001" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "Content-Type: application/json" \
  -d '{"type":"sleep","score":0.85,"state":"high"}'
```

---

**Remember**: The key to successful integration is understanding Sahha's specific webhook format with required headers. This is different from typical webhook implementations!