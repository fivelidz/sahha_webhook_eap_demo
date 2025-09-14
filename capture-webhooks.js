#!/usr/bin/env node

// Webhook Capture and Analysis Tool
// Captures EXACTLY what Sahha sends and analyzes the data

const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data', 'sahha-webhook-data.json');
const captureFile = path.join(__dirname, 'data', 'webhook-raw-captures.json');
const activityLog = path.join(__dirname, 'data', 'webhook-activity.log');

console.log('\n🔍 SAHHA WEBHOOK DATA DEEP ANALYSIS\n');
console.log('=' .repeat(60));

// Load the webhook data
const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
const profiles = Object.values(data);

console.log(`\nTotal Profiles: ${profiles.length}\n`);

// Capture raw data structure for analysis
const captures = [];

// Analyze EACH profile to see what data we actually have
profiles.forEach((profile, idx) => {
  const capture = {
    index: idx,
    externalId: profile.externalId,
    profileId: profile.profileId,
    
    // What scores does this profile ACTUALLY have?
    scores: {},
    biomarkers: {},
    factors: {},
    dataLogs: {},
    archetypes: {},
    
    // Summary
    hasScores: false,
    hasBiomarkers: false,
    hasFactors: false,
    hasDataLogs: false,
    hasArchetypes: false
  };
  
  // Capture scores
  if (profile.scores) {
    Object.entries(profile.scores).forEach(([type, data]) => {
      if (data && data.value !== undefined && data.value !== null) {
        capture.scores[type] = {
          value: data.value,
          state: data.state,
          date: data.scoreDateTime || data.updatedAt
        };
        capture.hasScores = true;
      }
    });
  }
  
  // Capture biomarkers
  if (profile.biomarkers) {
    Object.entries(profile.biomarkers).forEach(([key, data]) => {
      capture.biomarkers[key] = {
        category: data.category,
        type: data.type,
        value: data.value,
        unit: data.unit
      };
      capture.hasBiomarkers = true;
    });
  }
  
  // Capture factors
  if (profile.factors) {
    Object.entries(profile.factors).forEach(([type, factors]) => {
      if (factors && factors.length > 0) {
        capture.factors[type] = factors.length;
        capture.hasFactors = true;
      }
    });
  }
  
  // Capture data logs
  if (profile.dataLogs) {
    Object.entries(profile.dataLogs).forEach(([type, logs]) => {
      capture.dataLogs[type] = Array.isArray(logs) ? logs.length : 1;
      capture.hasDataLogs = true;
    });
  }
  
  // Capture archetypes
  if (profile.archetypes) {
    Object.entries(profile.archetypes).forEach(([name, data]) => {
      if (data && data.value) {
        capture.archetypes[name] = data.value;
        capture.hasArchetypes = true;
      }
    });
  }
  
  captures.push(capture);
});

// Save captures for inspection
fs.writeFileSync(captureFile, JSON.stringify(captures, null, 2));

// Analyze patterns
const scoreTypeCounts = {};
const allScoreTypes = new Set();

captures.forEach(cap => {
  Object.keys(cap.scores).forEach(type => {
    scoreTypeCounts[type] = (scoreTypeCounts[type] || 0) + 1;
    allScoreTypes.add(type);
  });
});

console.log('📊 SCORE TYPES FOUND IN DATA:');
console.log('-'.repeat(60));
Object.entries(scoreTypeCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    const percentage = ((count / profiles.length) * 100).toFixed(1);
    console.log(`  ${type.padEnd(20)} ${count} profiles (${percentage}%)`);
  });

// Find profiles with non-sleep scores
const nonSleepProfiles = captures.filter(cap => {
  const scoreTypes = Object.keys(cap.scores);
  return scoreTypes.some(type => type !== 'sleep');
});

console.log('\n📍 PROFILES WITH NON-SLEEP SCORES:');
console.log('-'.repeat(60));
if (nonSleepProfiles.length > 0) {
  nonSleepProfiles.forEach(cap => {
    console.log(`\n  ${cap.externalId}:`);
    Object.entries(cap.scores).forEach(([type, data]) => {
      console.log(`    - ${type}: ${data.value} (${data.state})`);
    });
  });
} else {
  console.log('  None found - all profiles only have sleep scores');
}

// Check for sample profiles with multiple scores
const sampleProfiles = captures.filter(cap => 
  cap.externalId && cap.externalId.startsWith('SampleProfile')
);

const sampleWithMultipleScores = sampleProfiles.filter(cap => 
  Object.keys(cap.scores).length > 1
);

console.log('\n🔬 SAMPLE PROFILES ANALYSIS:');
console.log('-'.repeat(60));
console.log(`  Total Sample Profiles: ${sampleProfiles.length}`);
console.log(`  With Multiple Scores: ${sampleWithMultipleScores.length}`);

if (sampleWithMultipleScores.length > 0) {
  console.log('\n  Sample profiles with multiple scores:');
  sampleWithMultipleScores.forEach(cap => {
    console.log(`    ${cap.externalId}: ${Object.keys(cap.scores).join(', ')}`);
  });
}

// Check recent webhook activity
console.log('\n📝 RECENT WEBHOOK ACTIVITY:');
console.log('-'.repeat(60));
if (fs.existsSync(activityLog)) {
  const logContent = fs.readFileSync(activityLog, 'utf-8');
  const lines = logContent.split('\n').filter(l => l.trim());
  const last10 = lines.slice(-10);
  
  console.log(`  Last 10 webhook events:`);
  last10.forEach(line => {
    try {
      const entry = JSON.parse(line.split(' | ')[1]);
      const time = new Date(entry.timestamp).toLocaleTimeString();
      console.log(`    ${time}: ${entry.event || 'data'} - ${entry.profilesUpdated || 0} profiles`);
    } catch (e) {
      // Skip malformed lines
    }
  });
}

// Look for hidden data
console.log('\n🔎 CHECKING FOR HIDDEN/NESTED DATA:');
console.log('-'.repeat(60));

// Check if any profile has nested score data we might be missing
let hiddenScores = false;
profiles.forEach(profile => {
  // Check for scores in unexpected places
  Object.entries(profile).forEach(([key, value]) => {
    if (key !== 'scores' && key !== 'factors' && key !== 'biomarkers') {
      if (value && typeof value === 'object') {
        // Look for score-like data
        if (value.value !== undefined && typeof value.value === 'number') {
          console.log(`  Found potential score in ${key}: ${JSON.stringify(value)}`);
          hiddenScores = true;
        }
      }
    }
  });
});

if (!hiddenScores) {
  console.log('  No hidden score data found');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 SUMMARY:');
console.log('='.repeat(60));

const dataCompleteness = {
  withScores: captures.filter(c => c.hasScores).length,
  withBiomarkers: captures.filter(c => c.hasBiomarkers).length,
  withFactors: captures.filter(c => c.hasFactors).length,
  withDataLogs: captures.filter(c => c.hasDataLogs).length,
  withArchetypes: captures.filter(c => c.hasArchetypes).length
};

Object.entries(dataCompleteness).forEach(([key, count]) => {
  const percentage = ((count / profiles.length) * 100).toFixed(1);
  console.log(`  ${key.padEnd(20)} ${count} profiles (${percentage}%)`);
});

console.log('\n💡 KEY FINDINGS:');
if (allScoreTypes.size === 1 && allScoreTypes.has('sleep')) {
  console.log('  ⚠️ Only sleep scores found in the data');
  console.log('  This suggests Sahha is only sending sleep data for sample profiles');
} else {
  console.log(`  ✅ Found ${allScoreTypes.size} different score types: ${Array.from(allScoreTypes).join(', ')}`);
}

console.log('\n✨ Analysis saved to:', captureFile);
console.log('\n');