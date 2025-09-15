# Dashboard Elements Documentation

## Overview
This document provides comprehensive documentation of all dashboard elements in the Sahha Wellness Template. All data comes from the webhook integration with Sahha API.

## Data Flow

```
Sahha API Webhook (/api/sahha/webhook)
        ↓
  WebhookData Hook (useWebhookData)
        ↓
  Dashboard Components
        ↓
  Visualizations & Exports
```

## Executive Dashboard Views

### 1. Overall Health View
**Purpose**: Provides organization-wide health metrics overview
**Components**:
- **Key Metrics Cards**: Display wellbeing, sleep, activity, mental health, and readiness scores
- **Organization Health Radar Chart**: Visual comparison of all metrics against targets
- **Population Health Distribution**: Pie chart showing distribution of health states (Excellent/Good/Fair/Poor)

**Data Source**: 
- Webhook profiles with scores from `ScoreCreatedIntegrationEvent`
- Real-time calculation of averages and distributions

### 2. Score Breakdown View
**Purpose**: Detailed breakdown of scores across the organization
**Components**:
- **Stacked Bar Chart**: Shows score distributions by type (Wellbeing, Sleep, Activity, Mental, Readiness)
- **Individual Score Distributions**: Pie charts for each score type showing percentage breakdowns
- **Score Statistics**: Count and percentage for each score category

**Data Processing**:
```javascript
scores = profiles.filter(p => p.scores?.[scoreType]?.value)
distribution = categorize(scores, [excellent: >0.8, good: >0.6, fair: >0.4, poor: <=0.4])
```

### 3. Department Comparison View
**Purpose**: Compare health metrics across departments
**Components**:
- **Multi-Bar Chart**: Side-by-side comparison of all metrics by department
- **Department Performance Table**: Detailed metrics with data completeness indicators
- **Visual Health Indicators**: Color-coded chips and progress bars

**Features**:
- Employee count per department
- Overall score with color coding (green >70%, yellow >50%, red <50%)
- Data completeness percentage visualization

### 4. Trends View
**Purpose**: Track health metrics over time
**Components**:
- **Organization Health Trends**: 30-day line chart for all metrics
- **Department Wellbeing Trends**: Multi-line chart comparing departments

**Data Calculation**:
- Uses actual webhook data with simulated daily variance
- Calculates department-specific trends based on assigned profiles

### 5. Sub-score Analysis View
**Purpose**: Deep dive into component scores
**Components**:
- **Sleep Components**: Duration, Efficiency, Regularity, Debt, REM, Deep Sleep
- **Activity Components**: Steps, Active Hours, Exercise Sessions, Calories, Sedentary Time
- **Mental Components**: Stress Level, Focus Time, Recovery, Mood, Mindfulness
- **Readiness Components**: Physical Recovery, Mental Clarity, Energy, Sleep Quality, HRV Balance
- **Department Sub-score Comparison**: Composite chart with dual-axis

**Sub-score Structure**:
```javascript
subScore = {
  component: string,    // e.g., "Sleep Duration"
  score: number,        // 0-100 score
  value: string        // e.g., "7.2 hours"
}
```

### 6. Archetype Distribution View (NEW)
**Purpose**: Visualize behavioral archetypes across departments
**Components**:
- **Activity Level Distribution**: Stacked bar chart (Sedentary → Highly Active)
- **Exercise Frequency Distribution**: Stacked bar chart (Rare → Frequent Exerciser)
- **Sleep Pattern Distribution**: Stacked bar chart (Poor → Excellent Sleeper)
- **Mental Wellness Distribution**: Stacked bar chart (Poor → Optimal)
- **Department-Specific Details**: Filtered view when department selected

**Archetype Categories**:
```javascript
archetypes = {
  activity: ['sedentary', 'lightly_active', 'moderately_active', 'highly_active'],
  exercise: ['rare_exerciser', 'occasional_exerciser', 'regular_exerciser', 'frequent_exerciser'],
  sleep: ['poor_sleeper', 'fair_sleeper', 'good_sleeper', 'excellent_sleeper'],
  mental: ['poor_mental_wellness', 'fair_mental_wellness', 'good_mental_wellness', 'optimal_mental_wellness']
}
```

### 7. Department Matrix View (NEW)
**Purpose**: Heatmap visualization of department performance
**Components**:
- **Department-by-Score Matrix**: Color-coded heatmap table
- **Archetype Concentration Analysis**: Shows high-performing area concentration
- **Interactive Department Deep Dive**: Radar chart for selected department

**Heatmap Color Scale**:
- Green (#4caf50): ≥80%
- Light Green (#8bc34a): ≥70%
- Yellow (#ffeb3b): ≥60%
- Orange (#ff9800): ≥50%
- Deep Orange (#ff5722): ≥40%
- Red (#f44336): <40%

## Profile Manager Features

### CSV Export (Enhanced)
**Exports All Data Including**:
- Basic Information: profileId, externalId, department
- Main Scores: All 5 scores with states
- Sleep Subscores: 8 detailed metrics with scores
- Activity Subscores: 7 detailed metrics with scores
- Mental Wellbeing Subscores: 5 detailed metrics
- Readiness Subscores: 5 detailed metrics
- Archetypes: All archetype classifications
- Metadata: Data completeness, last sync

**CSV Structure**:
```csv
profileId,externalId,department,wellbeing,wellbeingState,sleepDuration,sleepDurationScore,...
```

### Webhook Integration
**Data Sources**:
- `ScoreCreatedIntegrationEvent`: Health scores
- `ArchetypeCreatedIntegrationEvent`: Behavioral archetypes
- `BiomarkerCreatedIntegrationEvent`: Biomarker data
- `DataLogReceivedIntegrationEvent`: Raw data logs

## Data Processing Pipeline

### 1. Webhook Data Reception
```typescript
POST /api/sahha/webhook
→ Validate signature
→ Parse event type
→ Store in webhook storage
→ Update profile cache
```

### 2. Profile Enrichment
```typescript
profile = {
  ...webhookData,
  department: assignDepartment(profileId),
  name: generateName(profileId),
  archetypes: extractArchetypes(events),
  subScores: calculateSubScores(factors)
}
```

### 3. Aggregation & Analytics
```typescript
organizationMetrics = {
  averages: calculateAverages(profiles),
  distributions: calculateDistributions(profiles),
  trends: calculateTrends(historicalData),
  archetypes: aggregateArchetypes(profiles)
}
```

## Filtering & Interactivity

### Department Filtering
- Applies to all views when department selected
- Filters profiles by assigned department
- Updates all visualizations in real-time

### Time Range Filtering
- Options: 7 days, 30 days, 90 days
- Affects trend calculations
- Stored in component state

### Search & Sort
- Profile search by ID or external ID
- Sort by any column (scores, states, department)
- Pagination with configurable rows per page

## Performance Optimizations

### Data Caching
- 30-second refresh interval for webhook data
- Memoized calculations using `useMemo`
- Prevents unnecessary re-renders

### Lazy Loading
- Components load data on mount
- Pagination for large datasets
- Virtual scrolling for tables (planned)

## Error Handling

### Data Validation
- Null checks for all score accesses
- Default values for missing data
- Type guards for webhook payloads

### User Feedback
- Loading indicators during data fetch
- Error alerts for failed operations
- Success notifications for exports

## Future Enhancements

### Planned Features
1. **Predictive Analytics**: ML-based trend predictions
2. **Custom Alerts**: Threshold-based notifications
3. **Report Generation**: Automated PDF reports
4. **API Rate Limiting**: Intelligent request throttling
5. **Advanced Filtering**: Multi-criteria filtering
6. **Data Export Options**: Excel, JSON formats
7. **Role-Based Access**: Department-level permissions
8. **Historical Comparisons**: Year-over-year analysis

### Integration Points
- HRIS Systems (Workday, BambooHR)
- Communication Platforms (Slack, Teams)
- Analytics Platforms (Tableau, Power BI)
- Health Platforms (Apple Health, Google Fit)

## Technical Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Charts**: Recharts
- **State Management**: React Hooks
- **Data Fetching**: Custom hooks with fetch API

### Backend
- **API Routes**: Next.js API routes
- **Data Storage**: In-memory with file backup
- **Authentication**: Environment variables
- **Webhook Processing**: Signature validation

### Deployment
- **Platform**: Vercel/Netlify ready
- **Environment Variables**:
  - `SAHHA_CLIENT_ID`
  - `SAHHA_CLIENT_SECRET`
  - `WEBHOOK_SECRET`
  - `NEXT_PUBLIC_DEMO_MODE`

## Usage Guidelines

### Best Practices
1. Always use webhook data, never generate fake data in production
2. Maintain minimum aggregation size (5 profiles) for privacy
3. Update documentation when adding new features
4. Test with real webhook events before deployment
5. Monitor webhook delivery and processing

### Security Considerations
- Validate all webhook signatures
- Sanitize CSV exports
- Use HTTPS for all API calls
- Rotate credentials regularly
- Log security events

## Support & Maintenance

### Monitoring
- Webhook delivery status
- Data completeness metrics
- Error rates and types
- Performance metrics

### Debugging
- Debug mode in Profile Manager
- Console logging for development
- Webhook activity logs
- Error tracking integration

---

*Last Updated: [Current Date]*
*Version: 1.0.0*