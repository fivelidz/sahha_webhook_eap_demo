# 📊 Sahha Webhook Data Volume Analysis

## Weekend Data Collection (Sep 8-14, 2025)

### Total Events: 187,130

### Event Breakdown:
- **BiomarkerCreatedIntegrationEvent**: 108,860 (58.2%)
- **ScoreCreatedIntegrationEvent**: 61,480 (32.8%)
- **DataLogReceivedIntegrationEvent**: 12,300 (6.6%)
- **ArchetypeCreatedIntegrationEvent**: 4,480 (2.4%)

## Data Volume Estimation

### Per Event Size (typical):
- **Biomarker Event**: ~500-800 bytes
  - Profile IDs, timestamps, category, type, value, unit, aggregation
- **Score Event**: ~1-2 KB
  - Score value, factors array, state, data sources
- **Data Log Event**: ~2-5 KB
  - Multiple log entries with timestamps, values, sources
- **Archetype Event**: ~300-500 bytes
  - Archetype name, value, periodicity

### Total Data Volume Estimate:

```
Biomarkers: 108,860 × 650 bytes = 70.8 MB
Scores:     61,480 × 1,500 bytes = 92.2 MB
Data Logs:  12,300 × 3,500 bytes = 43.1 MB
Archetypes: 4,480 × 400 bytes = 1.8 MB

TOTAL: ~208 MB of raw webhook data
```

## Per Profile Analysis

With 57 profiles over the weekend:
- **3,283 events per profile** on average
- **~3.6 MB per profile** of behavioral data

### Event Frequency:
- **~1,116 events per hour** (187K ÷ 168 hours)
- **~19 events per minute**
- **1 event every 3 seconds**

## What This Means

### Rich Data Coverage:
1. **Biomarkers (108K events)**: 
   - Continuous vital signs monitoring
   - Sleep patterns, heart rate, activity levels
   - Updated multiple times per day per profile

2. **Scores (61K events)**:
   - Each profile gets 5 score types
   - Updated daily or more frequently
   - ~1,078 score updates per profile over the week

3. **Data Logs (12K events)**:
   - Raw sensor data
   - Activity tracking, sleep stages
   - Detailed behavioral patterns

4. **Archetypes (4K events)**:
   - Behavioral patterns identified
   - User categorization
   - ~79 archetype assignments per profile

## Failed Deliveries: 186.65K

The 186K failed deliveries (401 errors) represent nearly the same volume that failed due to:
- Missing webhook secret configuration
- Signature verification failures

**This means we lost ~200MB of behavioral health data!**

## Storage Requirements

For production:
- **Daily**: ~30 MB
- **Weekly**: ~210 MB  
- **Monthly**: ~900 MB
- **Yearly**: ~11 GB

Per 100 users:
- **Daily**: ~50 MB
- **Monthly**: ~1.5 GB
- **Yearly**: ~18 GB

## Recommendations

1. **Fix Authentication**: Set up `SAHHA_WEBHOOK_SECRET` immediately
2. **Database Storage**: File-based storage won't scale - need PostgreSQL/MongoDB
3. **Data Compression**: Implement compression for historical data
4. **Batch Processing**: Process events in batches to reduce overhead
5. **Event Deduplication**: Some events might be retries

---

**Summary**: Over the weekend, Sahha sent approximately **200MB of behavioral health data** across 187K events for 57 profiles, representing incredibly rich, real-time health monitoring data.