# Sahha Profile Scores Structure Reference

## ⚠️ CRITICAL: Score Field Names

**DO NOT confuse these field names - they cause "NO DATA AVAILABLE" errors:**

### ✅ Correct Score Field Names (from Sahha API):
- `scores.activity` - Main activity score
- `scores.sleep` - Main sleep score  
- `scores.mentalWellbeing` - Main mental wellbeing score (**NOT** `mentalHealth`)
- `scores.readiness` - Main readiness score
- `scores.wellbeing` - Main overall wellbeing score

### ❌ Common Mistakes:
- Using `scores.mentalHealth` instead of `scores.mentalWellbeing`
- Assuming field names without checking actual API response

## 📊 Profile Score Structure Example

From actual profile data in system:

```javascript
{
  profileId: "user123",
  scores: {
    activity: 65,           // Main activity score
    sleep: 72,             // Main sleep score
    mentalWellbeing: 35,   // Main mental wellbeing score ⚠️ NOTE: NOT mentalHealth
    readiness: 47,         // Main readiness score  
    wellbeing: 68          // Main overall wellbeing score
  },
  // Sub-scores are nested under each main score...
}
```

## 🔄 Data Flow Architecture

**Profile Management → Executive Overview Charts**

1. **Profile Manager**: Loads profiles from Sahha API (`/api/sahha/profiles?includeScores=true`)
2. **Stores in Context**: `useSahhaProfiles()` provides `profiles` and `assignments`
3. **Executive Overview**: Uses `profilesWithArchetypesAndScores` (merged data from Profile Management)
4. **Charts**: Access via `profile.scores.mentalWellbeing` (NOT `mentalHealth`)

## 🚨 Common Chart Issues

### Issue: "NO DATA AVAILABLE" 
**Root Cause**: Wrong field name usage

```javascript
// ❌ WRONG - causes NO DATA
const score = profile.scores?.mentalHealth;

// ✅ CORRECT - works
const score = profile.scores?.mentalWellbeing;
```

### Issue: Charts showing zero values
**Root Cause**: Not handling null/undefined scores properly

```javascript
// ✅ CORRECT - with null checking
const effectiveScore = score !== null && score !== undefined ? score : 50;
```

## 📝 Sub-Score Details

Each main score contains detailed sub-scores:

### Activity Sub-scores:
- steps, active hours, active calories, intense activity duration, extended inactivity, floors climbed

### Sleep Sub-scores: 
- sleep duration, sleep regularity, sleep debt, circadian alignment, sleep continuity, physical recovery, mental recovery

### Mental Wellbeing Sub-scores:
- circadian alignment, steps, active hours, extended inactivity, activity regularity, sleep regularity

### Readiness Sub-scores:
- sleep duration, sleep debt, physical recovery, mental recovery, walking strain capacity, exercise strain capacity, resting heart rate, heart rate variability

### Wellbeing Sub-scores:
- Combined metrics from sleep, activity, and mental wellbeing components

## 🛠️ Debugging Tips

1. **Always log actual profile structure first**:
```javascript
console.log('🔍 Profile structure:', profiles[0]);
console.log('🔍 Available scores:', profiles[0]?.scores);
```

2. **Check field names match exactly**:
```javascript
// Check what fields actually exist
Object.keys(profile.scores || {})
```

3. **Use Health Score Analysis as reference** - it works correctly, copy its patterns

---

**Remember: Mental wellbeing is `mentalWellbeing` NOT `mentalHealth` in Sahha API!**