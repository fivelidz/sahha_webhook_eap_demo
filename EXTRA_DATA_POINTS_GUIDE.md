# 🎯 Extra Data Points Available from Sahha Webhooks

## Current Data Points Being Captured

### 1. 📊 Score Types (5 types)
- **sleep** - Sleep quality and recovery
- **activity** - Physical activity levels  
- **mental_wellbeing** - Mental health indicators
- **readiness** - Daily readiness for activity
- **wellbeing** - Overall wellbeing composite

Each score includes:
- `value`: 0-1 score (e.g., 0.85)
- `state`: high/medium/low/minimal
- `scoreDateTime`: When calculated
- `dataSources`: Array of data sources used
- `version`: Score algorithm version

### 2. 🧬 Biomarker Categories & Types (19 types)

#### Activity Biomarkers:
- `steps` - Daily step count
- `active_duration` - Minutes of activity
- `active_energy_burned` - Calories burned
- `active_hours` - Hours being active
- `activity_low_intensity_duration` - Light activity time
- `activity_sedentary_duration` - Sedentary time

#### Sleep Biomarkers:
- `sleep_duration` - Total sleep time
- `sleep_debt` - Accumulated sleep deficit
- `sleep_regularity` - Sleep schedule consistency
- `sleep_in_bed_duration` - Time in bed
- `sleep_start_time` - When sleep began
- `sleep_end_time` - When sleep ended
- `sleep_interruptions` - Number of wake-ups
- `sleep_latency` - Time to fall asleep
- `sleep_deep_duration` - Deep sleep time
- `sleep_light_duration` - Light sleep time

#### Vitals Biomarkers:
- `heart_rate` - Heart rate measurements
- `heart_rate_variability` - HRV data
- `heart_rate_variability_rmssd` - HRV RMSSD metric

### 3. 📈 Score Factors (18 types)
Each score includes factors with:
- `name`: Factor identifier
- `value`: Actual value
- `goal`: Target value
- `score`: 0-1 contribution to overall score
- `state`: high/medium/low/minimal
- `unit`: Measurement unit

Factor types include:
- Physical: steps, active_hours, active_calories, floors_climbed
- Sleep: sleep_duration, sleep_debt, sleep_regularity, sleep_continuity
- Recovery: physical_recovery, mental_recovery, circadian_alignment
- Capacity: exercise_strain_capacity, walking_strain_capacity
- Vitals: heart_rate_variability, resting_heart_rate
- Behavior: extended_inactivity, activity_regularity, intense_activity_duration

### 4. 📝 DataLog Types (6 types captured)
Raw sensor data streams:
- `activity_steps` - Step count logs
- `device_device_lock` - Phone usage patterns
- `heart_heart_rate` - Heart rate readings
- `sleep_sleep_stage_deep` - Deep sleep periods
- `sleep_sleep_stage_in_bed` - In-bed detection
- `sleep_sleep_stage_light` - Light sleep periods

Each DataLog includes:
- `value`: Measurement value
- `unit`: Unit of measurement
- `source`: Data source device/app
- `recordingMethod`: How data was captured
- `deviceType`: Device model (e.g., iPhone14,7)
- `startDateTime` & `endDateTime`: Time range

### 5. 🎭 Archetypes (Ready, Not Yet Received)
**Status: ❌ No ArchetypeCreatedIntegrationEvent detected yet**

When they arrive, archetypes will include:
- Behavioral pattern classifications
- Confidence scores
- Personality/lifestyle categorizations
- Health behavior profiles

The webhook handler is ready with:
```javascript
if (eventType === 'ArchetypeCreatedIntegrationEvent') {
  profile.archetypes[body.archetype] = {
    confidence: body.confidence,
    assignedAt: body.createdAtUtc,
    factors: body.factors,
    description: body.description
  };
}
```

### 6. 👤 Profile Metadata
- `externalId`: Your system's user ID
- `profileId`: Sahha's internal profile ID
- `accountId`: Sahha account ID
- `createdAtUtc`: Timestamps for all events
- `version`: Data version numbers

### 7. 🔄 Real-time Updates
- **Event frequency**: ~1 event every 3 seconds
- **Data volume**: ~3,283 events per profile over weekend
- **Update patterns**: Biomarkers → Scores → DataLogs

## How to Use These Data Points

### 1. Trend Analysis
Track changes over time:
```javascript
// Compare weekly sleep debt
const thisWeek = profile.biomarkers.sleep_sleep_debt.value;
const lastWeek = previousProfile.biomarkers.sleep_sleep_debt.value;
const improvement = lastWeek - thisWeek;
```

### 2. Risk Identification
Flag concerning patterns:
```javascript
// Check for high sleep debt + low activity
if (profile.biomarkers.sleep_sleep_debt.value > 10 && 
    profile.scores.activity.value < 0.3) {
  flagProfile('burnout_risk');
}
```

### 3. Personalized Recommendations
Use factors to guide interventions:
```javascript
// Find lowest scoring factors
const factors = profile.factors.wellbeing;
const lowestFactor = factors.sort((a, b) => a.score - b.score)[0];
// Recommend improvements for lowestFactor.name
```

### 4. Population Analytics
Aggregate across profiles:
```javascript
// Average mental wellbeing by department
const deptAverage = profiles
  .filter(p => p.department === 'Engineering')
  .reduce((sum, p) => sum + p.scores.mental_wellbeing.value, 0) / count;
```

### 5. Predictive Insights
Use DataLogs for patterns:
```javascript
// Detect irregular sleep patterns from device_lock logs
const phoneLocks = profile.dataLogs.device_device_lock;
const nightUsage = phoneLocks.filter(log => 
  log.startDateTime.getHours() >= 22 || 
  log.startDateTime.getHours() <= 6
);
```

## Missing But Expected Soon

1. **Archetypes** - Behavioral classifications
2. **Energy scores** - Fatigue/energy levels
3. **Stress biomarkers** - Cortisol proxies
4. **Social interaction metrics** - From device usage
5. **Environmental factors** - Location/weather impact

## Dashboard Integration Status

✅ All current data points are displayed
✅ Archetype UI ready (waiting for data)
✅ DataLog indicators showing
✅ Factor analysis in tooltips
✅ State colors (high=green, medium=yellow, low=red)

## API Response Format

The dashboard API at `/api/sahha/webhook` returns:
```json
{
  "profiles": [...],
  "count": 66,
  "lastUpdated": "2025-09-14T23:12:31.348Z",
  "stats": {
    "totalProfiles": 66,
    "withScores": 66,
    "averageWellbeing": 0.78,
    "scoreCoverage": {
      "sleep": 66,
      "activity": 45,
      "mental_wellbeing": 38,
      "readiness": 42,
      "wellbeing": 28
    }
  }
}
```