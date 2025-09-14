# Sahha API Limitations & Issues Documentation

## Executive Summary

The Sahha API currently has significant limitations that prevent efficient bulk data retrieval for organizational dashboards. The primary issue is the **lack of bulk endpoints** and the **requirement for profile-specific tokens** to access individual health scores.

## Critical Limitations

### 1. ❌ No Bulk Data Endpoints

**Current Situation:**
- Individual API calls required for each profile's scores
- No batch or bulk endpoints available
- Results in N×M API calls (N profiles × M score types)

**What We Need:**
```javascript
// Desired bulk endpoint (doesn't exist)
POST /api/v1/account/profiles/scores
{
  "profileIds": ["id1", "id2", "id3"],
  "scoreTypes": ["wellbeing", "activity", "sleep", "mentalWellbeing", "readiness"]
}
```

**Current Reality:**
```javascript
// Must make individual calls for EACH profile and EACH score type
GET /api/v1/profile/score/{externalId}?types=wellbeing  // Call 1
GET /api/v1/profile/score/{externalId}?types=activity   // Call 2
GET /api/v1/profile/score/{externalId}?types=sleep      // Call 3
// ... repeat for each profile (57 profiles × 5 scores = 285 API calls!)
```

### 2. 🔐 Authentication Token Mismatch

**The Problem:**
- **Account tokens** can list profiles but **cannot fetch individual scores**
- **Profile tokens** are required for score data but are not easily obtainable
- Results in 500 Internal Server Errors

**Error Details:**
```json
{
  "status": 500,
  "statusText": "Internal Server Error",
  "data": {
    "title": "An internal exception has occurred.",
    "statusCode": 500,
    "location": "domain",
    "errors": [...]
  }
}
```

**Token Capabilities:**

| Token Type | Can Do | Cannot Do |
|------------|--------|-----------|
| Account Token | • List all profiles<br>• Get profile metadata<br>• Search profiles | • Fetch individual scores<br>• Get archetypes<br>• Access health data |
| Profile Token | • Fetch scores for specific profile<br>• Get archetypes<br>• Access all health data | • List other profiles<br>• Cross-profile queries |

### 3. 📊 Inconsistent Data Availability

**Observed Behavior:**
- Some profiles randomly return data with account token (3-7 out of 57)
- No clear pattern why some work and others don't
- Possible causes:
  - Sample profiles vs real profiles
  - Data freshness/caching issues
  - Partial permission model

**Success Rate:**
- Total profiles: 57
- Successful data fetches: 2-7 profiles (3-12%)
- Failed with 500 errors: 50-55 profiles (88-97%)

### 4. 🔄 No Real-time Updates

**Current Limitations:**
- No WebSocket support for live updates
- No Server-Sent Events (SSE)
- Must poll for updates
- No push notifications for score changes

### 5. 📈 Performance Impact

**Current Performance Issues:**
```
For 57 profiles with 5 score types each:
- Total API calls needed: 285 (plus 57 for archetypes = 342 total)
- Average time per call: 500ms
- Total time: ~171 seconds (nearly 3 minutes!)
- Actual observed time: 20-40 seconds (with parallel calls and failures)
```

## Partial Data Success Analysis

### Why Some Data Works

We ARE getting data for 2-7 profiles. Analysis shows:

1. **Working Profiles Have:**
   - Recent data syncs (within 24 hours)
   - Sample profile flag = true
   - Specific score types available (wellbeing, activity, sleep most common)

2. **Pattern Observed:**
   ```javascript
   // Successful profiles tend to have:
   Profile SampleProfile-f0760754: W=65, A=46, R=64  // ✅ Works
   Profile SampleProfile-4010ab59: W=73, S=71        // ✅ Works
   
   // Failed profiles show:
   Profile SampleProfile-1b0bbf41: All 500 errors    // ❌ Fails
   ```

3. **Possible Explanations:**
   - These profiles have public/demo data
   - Account token has partial permissions
   - Caching layer returns some data
   - Bug in permission checking

## Profile Token Generation Flow

### Option 1: OAuth Flow (Recommended)

```javascript
// Step 1: Generate profile authorization URL
const authUrl = `${SAHHA_AUTH_URL}/authorize?
  client_id=${CLIENT_ID}&
  profile_id=${PROFILE_ID}&
  scope=read:scores,read:archetypes&
  redirect_uri=${REDIRECT_URI}`;

// Step 2: User authorizes (or automated approval)
// Redirects back with code

// Step 3: Exchange code for profile token
const response = await fetch('/oauth/token', {
  method: 'POST',
  body: {
    grant_type: 'authorization_code',
    code: authCode,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  }
});

const { profile_token } = response.data;

// Step 4: Use profile token for API calls
const scores = await fetch(`/api/v1/profile/score/${externalId}`, {
  headers: { 'Authorization': `Bearer ${profile_token}` }
});
```

### Option 2: Service Account Flow

```javascript
// Step 1: Authenticate as service account
const serviceToken = await getServiceAccountToken();

// Step 2: Generate profile tokens in batch
const profileTokens = await fetch('/api/v1/account/profile-tokens', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${serviceToken}` },
  body: {
    profileIds: ['id1', 'id2', 'id3'],
    scope: 'read:all',
    expiresIn: 3600 // 1 hour
  }
});

// Step 3: Store tokens securely
await storeProfileTokens(profileTokens);

// Step 4: Use tokens for individual calls
for (const token of profileTokens) {
  const scores = await fetchWithProfileToken(token);
}
```

### Option 3: Delegation Token (Ideal)

```javascript
// What Sahha should provide:
const delegationToken = await fetch('/api/v1/account/delegation-token', {
  headers: { 'Authorization': `Bearer ${accountToken}` },
  body: {
    scope: 'read:all_profiles',
    duration: 3600
  }
});

// Use delegation token for all profile queries
const scores = await fetch(`/api/v1/profiles/bulk-scores`, {
  headers: { 'Authorization': `Bearer ${delegationToken}` }
});
```

## Recommended Solutions

### Short-term (Implementable Now)

1. **Webhook Integration**
   - Set up webhook receiver (✅ Created at `/api/sahha/webhook`)
   - Configure Sahha to push updates
   - Store data locally for fast access

2. **Caching Layer**
   - Cache the few successful responses
   - Implement smart retry for failed calls
   - Use stale-while-revalidate pattern

3. **Progressive Loading**
   - Load basic profile info first
   - Fetch scores asynchronously
   - Show partial data as it arrives

### Medium-term (Requires Sahha Changes)

1. **Bulk Endpoints**
   ```http
   POST /api/v1/account/profiles/scores/bulk
   POST /api/v1/account/profiles/archetypes/bulk
   ```

2. **GraphQL API**
   ```graphql
   query GetOrganizationData {
     profiles {
       id
       externalId
       scores {
         wellbeing
         activity
         sleep
       }
       archetypes
     }
   }
   ```

3. **WebSocket Support**
   ```javascript
   const ws = new WebSocket('wss://api.sahha.ai/ws');
   ws.send({ subscribe: 'organization:scores:*' });
   ```

### Long-term (Ideal Architecture)

1. **Organization-level API**
   - Single endpoint for all org data
   - Aggregated metrics
   - Privacy-preserved insights

2. **Event Streaming**
   - Real-time score updates
   - Change data capture
   - Event sourcing pattern

3. **Federated Access**
   - Organization admin tokens
   - Role-based access control
   - Delegated authentication

## Impact on User Experience

### Current UX Issues:
- ⏱️ Long loading times (20-40 seconds)
- ❌ Most profiles show "N/A" for scores
- 🔄 No real-time updates
- 📊 Only 3% data coverage

### With Proposed Solutions:
- ⚡ Instant loading from cache/webhook data
- ✅ 100% data coverage
- 🔄 Real-time updates via webhooks
- 📊 Complete organizational insights

## Testing Webhook Integration

### 1. Configure Webhook in Sahha Dashboard:
```
Webhook URL: https://your-domain.com/api/sahha/webhook
Events: score.updated, profile.created, archetype.calculated
Method: POST
Headers: X-Sahha-Signature: [your-secret]
```

### 2. Test Webhook Locally:
```bash
# Send test webhook
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "batch.scores",
    "timestamp": "2025-09-12T10:00:00Z",
    "data": {
      "profiles": [{
        "externalId": "test-001",
        "scores": {
          "wellbeing": 0.75,
          "activity": 0.65
        }
      }]
    }
  }'

# Check stored data
curl http://localhost:3000/api/sahha/webhook

# Clear test data
curl -X DELETE "http://localhost:3000/api/sahha/webhook?confirm=true"
```

## Conclusion

The Sahha API needs significant improvements to support organizational dashboards efficiently. The lack of bulk endpoints and the token mismatch issue make it nearly impossible to build performant dashboards without webhooks or significant architectural changes on Sahha's side.

**Immediate Action Items:**
1. ✅ Implement webhook receiver
2. ⏳ Configure Sahha to send webhooks
3. 📧 Share this document with Sahha team
4. 🔧 Implement caching for successful calls
5. 📊 Use demo mode for complete UX testing

---

*Document created: September 12, 2025*
*Last updated: September 12, 2025*
*Author: Alexei Brown*