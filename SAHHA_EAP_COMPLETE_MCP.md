# 🤖 AI Agent Technical Reference: Sahha EAP Dashboard with Webhook Integration

## Executive Summary for AI Agents
This is a complete technical reference for building and maintaining a Sahha wellness dashboard with real-time webhook integration. The system receives behavioral health data, manages department assignments, and provides enterprise-grade wellness analytics.

**Critical Understanding**: Sahha uses NON-STANDARD webhook headers (X-Signature, X-External-Id, X-Event-Type) instead of typical webhook patterns. This is the #1 integration issue.

## 📋 Quick Navigation
1. [System Overview](#system-overview)
2. [File Structure Map](#file-structure-map)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Webhook Implementation](#webhook-implementation)
5. [Department Logic](#department-logic)
6. [Common Failures & Fixes](#common-failures--fixes)
7. [Testing Commands](#testing-commands)
8. [Production Checklist](#production-checklist)

---

## System Overview

### Core Purpose
Build a real-time wellness dashboard that receives Sahha behavioral data via webhooks, manages employee profiles with department assignments, and provides enterprise analytics.

### Critical Architecture Points
```
🚨 IMPORTANT: Sahha Webhook Flow
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Sahha API     │────▶│   Webhook    │────▶│  Dashboard  │
│                 │     │   Handler    │     │              │
└─────────────────┘     └──────────────┘     └─────────────┘
    ↓                        ↓                     ↓
X-Headers ONLY!         Mutex Lock            Department UI
NOT Standard!          File Storage          ProfileManagerWebhook
```

## File Structure Map

```bash
# CRITICAL FILES FOR AI AGENTS
/
├── app/
│   ├── api/sahha/webhook/
│   │   └── route.ts              # ⚠️ WEBHOOK HANDLER - X-Headers required!
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard using ProfileManagerWebhook
│   ├── dashboard-guide/
│   │   └── page.tsx              # Promotional content (rewritten)
│   └── mcp-guide/
│       └── page.tsx              # This AI agent guide
│
├── components/
│   ├── ProfileManagerWebhook.tsx # ✅ CORRECT UI (NOT ProfileManagement!)
│   ├── ProfileManagement.tsx     # ❌ DO NOT USE - Bad UI per user
│   └── ExecutiveDashboardOriginal.tsx
│
├── lib/
│   └── webhook-data-service.ts   # 🏢 Department assignment logic here!
│
├── contexts/
│   └── SahhaDataContext.tsx      # Global state with departments
│
└── data/                          # File storage (dev only)
    ├── sahha-webhook-data.json    # Webhook data
    ├── department-assignments.json # Department mappings
    └── webhook-activity.log       # Activity log
```

## Data Flow Architecture

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

## Department Logic

### The Critical Department Assignment
```typescript
// /lib/webhook-data-service.ts - generateDemoWebhookData()

// THIS IS WHERE DEPARTMENTS ARE ASSIGNED!
for (let i = 0; i < 57; i++) {
  let department: string;
  
  // DEPARTMENT DISTRIBUTION (MUST MATCH!)
  if (i < 20) {
    department = 'tech';        // Index 0-19
  } else if (i < 31) {
    department = 'sales';       // Index 20-30
  } else if (i < 42) {
    department = 'operations';  // Index 31-41  
  } else if (i < 51) {
    department = 'admin';       // Index 42-50
  } else {
    department = 'unassigned';  // Index 51+
  }
  
  profiles.push({
    profileId: `demo-${String(i).padStart(4, '0')}`,
    externalId: `TestProfile-${String(i + 1).padStart(3, '0')}`,
    department,  // <-- CRITICAL: Must be here!
    // ... other fields
  });
}
```

### Preserving Departments in Formatting
```typescript
// /lib/webhook-data-service.ts - formatWebhookProfile()

function formatWebhookProfile(webhookData: any): Profile {
  return {
    profileId: webhookData.profileId,
    externalId: webhookData.externalId,
    department: webhookData.department || null, // <-- PRESERVE THIS!
    // ... other fields
  };
}
```

## Common Failures & Fixes

### 🔴 FAILURE: "All departments show Unassigned"
**Root Cause**: Department not preserved in `formatWebhookProfile()`
```typescript
// ❌ WRONG
function formatWebhookProfile(webhookData: any): Profile {
  return {
    profileId: webhookData.profileId,
    // Missing department field!
  };
}

// ✅ CORRECT
function formatWebhookProfile(webhookData: any): Profile {
  return {
    profileId: webhookData.profileId,
    department: webhookData.department || null, // PRESERVE THIS!
  };
}
```

### 🔴 FAILURE: "Wrong UI component"
**Root Cause**: Using ProfileManagement instead of ProfileManagerWebhook
```typescript
// ❌ WRONG - Bad UI per user feedback
import ProfileManagement from '@/components/ProfileManagement';

// ✅ CORRECT - Good UI
import ProfileManagerWebhook from '@/components/ProfileManagerWebhook';
```

### 🔴 FAILURE: "createDemoProfiles is not defined"
**Root Cause**: Function called before definition in context
```typescript
// ❌ WRONG - Function used before definition
const initialState = {
  profiles: createDemoProfiles(), // Error!
};
const createDemoProfiles = () => {...};

// ✅ CORRECT - Define first
const createDemoProfiles = () => {...};
const initialState = {
  profiles: createDemoProfiles(),
};
```

### 🔴 FAILURE: "Missing webhook headers"
**Root Cause**: Using standard webhook format instead of Sahha format
```bash
# ❌ WRONG
curl -H "webhook-signature: xxx"

# ✅ CORRECT
curl -H "X-Signature: xxx" \
     -H "X-External-Id: xxx" \
     -H "X-Event-Type: ScoreCreatedIntegrationEvent"
```

## Testing Commands

### Quick Test Suite for AI Agents
```bash
# 1. Check server status
curl http://localhost:3000/api/sahha/webhook?mode=status

# 2. Get demo data (57 profiles with departments)
curl http://localhost:3000/api/sahha/webhook?mode=demo | jq '.profiles[0:3]'

# 3. Test webhook with bypass (development only)
curl -X POST http://localhost:3000/api/sahha/webhook \
  -H "X-Bypass-Signature: test" \
  -H "X-External-Id: test-001" \
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
  -H "Content-Type: application/json" \
  -d '{"type":"sleep","score":0.85,"state":"high"}'

# 4. Check department distribution
curl http://localhost:3000/api/sahha/webhook?mode=demo | \
  jq '.profiles | group_by(.department) | map({dept: .[0].department, count: length})'

# 5. Verify first tech profile
curl http://localhost:3000/api/sahha/webhook?mode=demo | \
  jq '.profiles[0] | {id: .profileId, dept: .department, scores: .scores | keys}'
```

### Debug Console Commands
```javascript
// Run in browser console at http://localhost:3000

// Check loaded profiles
console.table(window.__SAHHA_PROFILES__.slice(0,5))

// Check department assignments
const depts = window.__SAHHA_PROFILES__.reduce((acc, p) => {
  acc[p.department] = (acc[p.department] || 0) + 1;
  return acc;
}, {});
console.table(depts);

// Find unassigned profiles
const unassigned = window.__SAHHA_PROFILES__.filter(p => !p.department || p.department === 'unassigned');
console.log(`Unassigned: ${unassigned.length} profiles`, unassigned);
```

## Production Checklist

### Pre-Deployment Verification
```bash
# 1. Test department distribution
npm run dev
curl http://localhost:3000/api/sahha/webhook?mode=demo | \
  jq '.profiles | group_by(.department) | length'
# Expected: 5 departments (tech, sales, operations, admin, unassigned)

# 2. Verify webhook handler
grep "X-Signature" app/api/sahha/webhook/route.ts
# Must find X-Headers, not standard headers

# 3. Check UI component
grep "ProfileManagerWebhook" app/dashboard/page.tsx
# Must use ProfileManagerWebhook, NOT ProfileManagement

# 4. Verify department preservation  
grep "department:" lib/webhook-data-service.ts
# Must preserve department field in formatWebhookProfile
```

### Environment Variables
```bash
# .env.local (development)
SAHHA_WEBHOOK_SECRET=test-secret

# .env.production  
SAHHA_WEBHOOK_SECRET=production-secret-from-sahha
NEXT_PUBLIC_API_URL=https://your-domain.com
DATABASE_URL=postgresql://... # For production DB
```

### Security Hardening
```typescript
// Remove bypass in production!
// ❌ NEVER in production
if (request.headers.get('X-Bypass-Signature')) {
  // Skip verification - DEV ONLY!
}

// ✅ Production code
if (!verifySignature(signature, body, secret)) {
  return unauthorized();
}
```

---

## 🚀 AI Agent Quick Deploy

### One-Line Deploy Check
```bash
# Run this to verify everything is ready
grep -q "X-Signature" app/api/sahha/webhook/route.ts && \
grep -q "ProfileManagerWebhook" app/dashboard/page.tsx && \
grep -q "department:" lib/webhook-data-service.ts && \
echo "✅ READY TO DEPLOY" || echo "❌ FIX ISSUES FIRST"
```

### Critical Success Factors
1. **X-Headers** - Not standard webhook headers
2. **ProfileManagerWebhook** - Not ProfileManagement component  
3. **Department preservation** - Must keep department field
4. **Demo data departments** - Index-based assignment (0-19=tech, etc.)
5. **Mutex locking** - Prevent concurrent write corruption

---

## 📊 Data Schema Reference

### Profile Object Structure
```typescript
interface Profile {
  profileId: string;           // "demo-0001"
  externalId: string;          // "TestProfile-001"  
  department: string | null;   // "tech" | "sales" | etc.
  scores: {
    [key: string]: {
      value: number;           // 0-1 or 0-100
      state: string;           // "low" | "medium" | "high"
    }
  };
  demographics?: {
    age?: number;
    gender?: string;
  };
}
```

### Webhook Event Payload
```json
{
  "type": "sleep",              // Score type
  "score": 0.85,               // Value (0-1)
  "state": "high",             // State
  "scoreDateTime": "2025-09-16T00:00:00Z"
}
```

---

## 🔧 Maintenance Commands

### Reset Everything
```bash
# Nuclear option - fresh start
rm -rf .next node_modules data/*.json
npm install
npm run dev
```

### Monitor Live Data
```bash
# Watch webhook activity
tail -f data/webhook-activity.log

# Monitor profile count
watch -n 5 'curl -s localhost:3000/api/sahha/webhook | jq .count'

# Check department distribution live
watch -n 5 'curl -s localhost:3000/api/sahha/webhook?mode=demo | \
  jq ".profiles | group_by(.department) | map({d: .[0].department, n: length})"'
```

---

## 🎯 Success Metrics

Your implementation is correct when:
- ✅ Demo data shows 5 departments (not all "unassigned")
- ✅ ProfileManagerWebhook renders with checkboxes
- ✅ Webhook accepts X-Headers
- ✅ Department dropdowns show actual departments
- ✅ Test webhook creates new profiles

---

**AI Agent Note**: This document prioritizes actionable technical details over theory. Use the test commands to verify each component works before attempting fixes. The most common failure is forgetting Sahha's X-Header format.

**Last Updated**: September 16, 2025  
**For**: AI Agents building Sahha integrations