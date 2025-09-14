# Sahha API Integration Guide & Pain Points

## Critical Data Structure Alignment

### 1. Correct Score Terminology
- ✅ **CORRECT**: `mentalWellbeing` or `mental_wellbeing` (API uses underscore)
- ❌ **WRONG**: `mentalHealth`

### 2. Score Values
- All scores are returned on a **0-1 scale** (e.g., 0.73)
- For display, multiply by 100 to show as percentage
- Example: `0.73` → Display as `73`

### 3. Complete Sahha Data Structure

```typescript
// Correct Profile Structure
interface SahhaProfile {
  // Core Identifiers
  profileId: string;        // Sahha's internal ID
  externalId: string;       // Your custom ID
  accountId: string;        // Organization account ID
  
  // Demographics (not provided by API - must be managed separately)
  age?: number;             // Not from Sahha
  gender?: string;          // Not from Sahha
  
  // Device Info
  deviceType?: string;      // 'iOS', 'Android', or null
  sdkVersion?: string;
  
  // Scores (0-1 scale)
  scores: {
    wellbeing?: number;
    activity?: number;
    sleep?: number;
    mentalWellbeing?: number;  // NOT mentalHealth!
    readiness?: number;
  };
  
  // Archetypes (array of strings)
  archetypes?: string[];
  
  // Timestamps
  dataLastReceivedAtUtc: string;
  createdAtUtc: string;
  
  // Flags
  isSampleProfile: boolean;
}
```

## API Pain Points & Solutions

### Pain Point 1: Multiple API Calls Required
**Problem**: Each score type requires a separate API call.

**Solution**: Batch parallel calls per profile:
```javascript
// OPTIMAL APPROACH: One set of parallel calls per profile
const fetchProfileScores = async (accountToken, externalId) => {
  const scoreTypes = ['wellbeing', 'activity', 'sleep', 'mental_wellbeing', 'readiness'];
  
  const scores = await Promise.all(
    scoreTypes.map(type => 
      fetch(`/api/v1/profile/score/${externalId}?types=${type}`, {
        headers: { 'Authorization': `Bearer ${accountToken}` }
      })
    )
  );
  
  return scores;
};
```

### Pain Point 2: No Bulk Score Endpoint
**Problem**: Cannot fetch scores for multiple profiles in one call.

**Solution**: Limit concurrent profile fetches:
```javascript
// Process profiles in batches to avoid rate limits
const BATCH_SIZE = 10;
const profiles = await fetchProfiles();

for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
  const batch = profiles.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(fetchProfileScores));
}
```

### Pain Point 3: Demographics Not Included
**Problem**: Age and gender are not provided by Sahha API.

**Solution**: Maintain separate demographics mapping:
```javascript
const demographics = {
  'profile-id-1': { age: 32, gender: 'Male' },
  'profile-id-2': { age: 28, gender: 'Female' }
};
```

### Pain Point 4: Archetypes Require Separate Call
**Problem**: Archetypes are not included with profile data.

**Current Archetype Types**:
- `activity_level`
- `exercise_frequency`
- `mental_wellness`
- `overall_wellness`
- `sleep_duration`
- `sleep_efficiency`
- `sleep_quality`
- `sleep_regularity`
- `bed_schedule`
- `wake_schedule`
- `primary_exercise`
- `primary_exercise_type`
- `secondary_exercise`
- `sleep_pattern`

### Pain Point 5: Score Factors Structure
**Problem**: Factors come nested within score responses.

**Solution**: Flatten factors for easier display:
```javascript
const mapFactorsToSubScores = (factors) => {
  const subScores = {
    activity: [],
    sleep: [],
    mentalWellbeing: [],
    readiness: [],
    wellbeing: []
  };
  
  factors.forEach(factor => {
    const score = {
      name: factor.name.replace(/_/g, ' '),
      value: factor.value,
      unit: factor.unit || '',
      goal: factor.goal,
      score: Math.round(factor.score * 100),
      state: factor.state // 'high', 'medium', 'low', 'minimal'
    };
    
    // Categorize by type
    if (['steps', 'active_calories', 'active_hours'].includes(factor.name)) {
      subScores.activity.push(score);
    } else if (['sleep_duration', 'sleep_regularity'].includes(factor.name)) {
      subScores.sleep.push(score);
    }
  });
  
  return subScores;
};
```

## MCP (Model Context Protocol) Implementation

The MCP server should handle the complexity:

```javascript
// MCP Server Implementation Pattern
class SahhaMCPServer {
  async getProfileWithAllData(externalId) {
    // 1. Get profile basic info
    const profile = await this.getProfile(externalId);
    
    // 2. Fetch all scores in parallel
    const [wellbeing, activity, sleep, mentalWellbeing, readiness] = 
      await Promise.all([
        this.getScore(externalId, 'wellbeing'),
        this.getScore(externalId, 'activity'),
        this.getScore(externalId, 'sleep'),
        this.getScore(externalId, 'mental_wellbeing'),
        this.getScore(externalId, 'readiness')
      ]);
    
    // 3. Get archetypes
    const archetypes = await this.getArchetypes(externalId);
    
    // 4. Combine all data
    return {
      ...profile,
      scores: { wellbeing, activity, sleep, mentalWellbeing, readiness },
      archetypes
    };
  }
}
```

## Original Profile Manager Approach

The original ProfileManagerComplete component handled this by:

1. **Using Context Provider**: Centralized data fetching in `SahhaDataContext`
2. **Demo Data Fallback**: Always had demo data ready
3. **Separate API Service**: `sahhaAPI.ts` handled all API complexity
4. **Privacy Protection**: Minimum aggregation size for data protection

```javascript
// Original approach from ProfileManagerComplete
const { profiles, fetchProfiles, loadDemoData } = useSahhaProfiles();

useEffect(() => {
  if (dataMode === 'api') {
    fetchApiProfiles();  // Complex API logic hidden
  } else {
    loadDemoData();      // Instant demo data
  }
}, [dataMode]);
```

## Recommended Implementation Pattern

```javascript
// 1. Create a robust API service
class SahhaAPIService {
  constructor(credentials) {
    this.credentials = credentials;
    this.cache = new Map();
  }
  
  async getCompleteProfile(externalId) {
    // Check cache first
    if (this.cache.has(externalId)) {
      return this.cache.get(externalId);
    }
    
    try {
      // Get auth token
      const token = await this.authenticate();
      
      // Parallel fetch all data
      const data = await this.fetchAllProfileData(token, externalId);
      
      // Cache for 5 minutes
      this.cache.set(externalId, data);
      setTimeout(() => this.cache.delete(externalId), 5 * 60 * 1000);
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch profile ${externalId}:`, error);
      return this.generateDemoProfile(externalId);
    }
  }
}

// 2. Use in Profile Manager
const ProfileManager = () => {
  const [profiles, setProfiles] = useState([]);
  const [dataMode, setDataMode] = useState('api');
  const api = useMemo(() => new SahhaAPIService(credentials), []);
  
  useEffect(() => {
    const loadProfiles = async () => {
      if (dataMode === 'api') {
        const profileList = await api.getProfileList();
        // Fetch first 10 with full data, rest without scores
        const detailed = await Promise.all(
          profileList.slice(0, 10).map(p => api.getCompleteProfile(p.externalId))
        );
        const basic = profileList.slice(10);
        setProfiles([...detailed, ...basic]);
      } else {
        setProfiles(generateDemoProfiles());
      }
    };
    
    loadProfiles();
  }, [dataMode]);
};
```

## Key Takeaways

1. **Always use correct terminology**: `mentalWellbeing` not `mentalHealth`
2. **Handle scale conversion**: API returns 0-1, display as 0-100
3. **Batch API calls wisely**: One parallel set per profile, not all at once
4. **Cache aggressively**: Reduce API calls with smart caching
5. **Provide demo fallback**: Always have demo data ready
6. **Separate concerns**: API complexity should be in a service layer
7. **Default to unassigned**: Don't auto-assign departments
8. **Use real archetypes**: Match Sahha's actual archetype names

## Error Handling

```javascript
// Robust error handling pattern
const fetchWithFallback = async (fetchFn, fallbackFn) => {
  try {
    const result = await fetchFn();
    if (!result || result.error) {
      throw new Error(result?.error || 'No data returned');
    }
    return result;
  } catch (error) {
    console.warn('API call failed, using fallback:', error);
    return fallbackFn();
  }
};
```

## Testing Endpoints

```bash
# Test authentication
curl -X POST https://sandbox-api.sahha.ai/api/v1/oauth/account/token \
  -H "Content-Type: application/json" \
  -d '{"clientId":"YOUR_ID","clientSecret":"YOUR_SECRET"}'

# Test profile fetch
curl -H "Authorization: Bearer TOKEN" \
  https://sandbox-api.sahha.ai/api/v1/account/profile/search

# Test score fetch (note: singular 'type' not 'types' for single score)
curl -H "Authorization: Bearer TOKEN" \
  "https://sandbox-api.sahha.ai/api/v1/profile/score/EXTERNAL_ID?types=wellbeing"

# Test multiple scores (comma-separated)
curl -H "Authorization: Bearer TOKEN" \
  "https://sandbox-api.sahha.ai/api/v1/profile/score/EXTERNAL_ID?types=wellbeing,activity,sleep"
```