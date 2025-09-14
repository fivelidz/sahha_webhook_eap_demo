#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n📊 SAHHA WEBHOOK EVENT ANALYSIS\n');
console.log('=' .repeat(50));

// Load webhook data
const dataFile = path.join(__dirname, 'data', 'sahha-webhook-data.json');
const statsFile = path.join(__dirname, 'data', 'webhook-event-stats.json');
const analysisFile = path.join(__dirname, 'data', 'webhook-event-analysis.json');
const activityFile = path.join(__dirname, 'data', 'webhook-activity.log');

// Analyze stored webhook data
if (fs.existsSync(dataFile)) {
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  const profiles = Object.values(data);
  
  console.log('\n📁 STORED DATA ANALYSIS');
  console.log('-'.repeat(50));
  console.log(`Total Profiles: ${profiles.length}`);
  
  // Count score types
  const scoreTypes = {};
  const biomarkerTypes = {};
  const archetypeTypes = {};
  
  profiles.forEach(profile => {
    // Count scores
    if (profile.scores) {
      Object.keys(profile.scores).forEach(type => {
        scoreTypes[type] = (scoreTypes[type] || 0) + 1;
      });
    }
    
    // Count biomarkers
    if (profile.biomarkers) {
      Object.values(profile.biomarkers).forEach(biomarker => {
        const key = `${biomarker.category}_${biomarker.type}`;
        biomarkerTypes[key] = (biomarkerTypes[key] || 0) + 1;
      });
    }
    
    // Count archetypes
    if (profile.archetypes) {
      Object.keys(profile.archetypes).forEach(type => {
        archetypeTypes[type] = (archetypeTypes[type] || 0) + 1;
      });
    }
  });
  
  console.log('\nScore Types Distribution:');
  Object.entries(scoreTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = ((count / profiles.length) * 100).toFixed(1);
      console.log(`  ${type}: ${count} profiles (${percentage}%)`);
    });
  
  console.log('\nProfiles with Multiple Scores:');
  const multiScoreProfiles = profiles.filter(p => 
    p.scores && Object.keys(p.scores).length > 1
  );
  console.log(`  ${multiScoreProfiles.length} profiles have 2+ score types`);
  
  if (multiScoreProfiles.length > 0) {
    console.log('\n  Examples:');
    multiScoreProfiles.slice(0, 3).forEach(p => {
      console.log(`    ${p.externalId}: ${Object.keys(p.scores).join(', ')}`);
    });
  }
  
  console.log('\nBiomarker Types (Top 10):');
  Object.entries(biomarkerTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} profiles`);
    });
  
  if (Object.keys(archetypeTypes).length > 0) {
    console.log('\nArchetype Types:');
    Object.entries(archetypeTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} profiles`);
      });
  }
}

// Analyze event statistics
if (fs.existsSync(statsFile)) {
  console.log('\n📈 EVENT STATISTICS');
  console.log('-'.repeat(50));
  
  const stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
  
  console.log(`Total Events Processed: ${stats.totalEvents || 0}`);
  console.log(`Last Updated: ${stats.lastUpdated || 'Never'}`);
  
  if (stats.eventTypes && Object.keys(stats.eventTypes).length > 0) {
    console.log('\nEvent Types:');
    Object.entries(stats.eventTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} events`);
      });
  }
  
  if (stats.scoreTypes && Object.keys(stats.scoreTypes).length > 0) {
    console.log('\nScore Types Received:');
    Object.entries(stats.scoreTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} events`);
      });
  }
  
  if (stats.biomarkerCategories && Object.keys(stats.biomarkerCategories).length > 0) {
    console.log('\nBiomarker Categories:');
    Object.entries(stats.biomarkerCategories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} events`);
      });
  }
}

// Analyze recent events
if (fs.existsSync(analysisFile)) {
  console.log('\n🔍 RECENT EVENT ANALYSIS');
  console.log('-'.repeat(50));
  
  const events = JSON.parse(fs.readFileSync(analysisFile, 'utf-8'));
  
  console.log(`Total Events Captured: ${events.length}`);
  
  if (events.length > 0) {
    // Analyze event types
    const eventTypes = {};
    const headerPatterns = {};
    
    events.forEach(event => {
      // Count event types
      const type = event.eventType || event.headers['X-Event-Type'] || 'unknown';
      eventTypes[type] = (eventTypes[type] || 0) + 1;
      
      // Analyze header patterns
      const pattern = Object.keys(event.headers).sort().join(',');
      headerPatterns[pattern] = (headerPatterns[pattern] || 0) + 1;
    });
    
    console.log('\nEvent Type Distribution:');
    Object.entries(eventTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const percentage = ((count / events.length) * 100).toFixed(1);
        console.log(`  ${type}: ${count} (${percentage}%)`);
      });
    
    console.log('\nHeader Patterns:');
    Object.entries(headerPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([pattern, count]) => {
        console.log(`  Pattern: ${pattern}`);
        console.log(`    Count: ${count}`);
      });
    
    // Sample recent events
    console.log('\nLast 3 Events:');
    events.slice(-3).forEach((event, i) => {
      console.log(`\n  Event ${i + 1}:`);
      console.log(`    Time: ${event.timestamp}`);
      console.log(`    Type: ${event.eventType || 'N/A'}`);
      console.log(`    External ID: ${event.externalId || 'N/A'}`);
      if (event.payloadStructure) {
        console.log(`    Payload Keys: ${event.payloadStructure.keys.join(', ')}`);
      }
    });
  }
}

// Analyze activity log
if (fs.existsSync(activityFile)) {
  console.log('\n📝 ACTIVITY LOG SUMMARY');
  console.log('-'.repeat(50));
  
  const log = fs.readFileSync(activityFile, 'utf-8');
  const lines = log.split('\n').filter(l => l.trim());
  
  const successCount = lines.filter(l => l.includes('"success":true')).length;
  const errorCount = lines.filter(l => l.includes('"success":false')).length;
  
  console.log(`Total Log Entries: ${lines.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  
  if (errorCount > 0) {
    console.log('\nRecent Errors:');
    lines.filter(l => l.includes('"success":false'))
      .slice(-3)
      .forEach(line => {
        try {
          const entry = JSON.parse(line);
          console.log(`  ${entry.timestamp}: ${entry.error || 'Unknown error'}`);
        } catch (e) {
          // Skip invalid JSON
        }
      });
  }
}

console.log('\n' + '='.repeat(50));
console.log('\n💡 RECOMMENDATIONS:\n');

// Provide recommendations based on analysis
const data = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf-8')) : {};
const profiles = Object.values(data);

if (profiles.length === 0) {
  console.log('❌ No profile data found. Check webhook connectivity.');
} else {
  const scoreTypes = {};
  profiles.forEach(profile => {
    if (profile.scores) {
      Object.keys(profile.scores).forEach(type => {
        scoreTypes[type] = (scoreTypes[type] || 0) + 1;
      });
    }
  });
  
  const sleepOnly = scoreTypes.sleep && Object.keys(scoreTypes).length === 1;
  const hasMixedScores = Object.keys(scoreTypes).length > 1;
  
  if (sleepOnly) {
    console.log('⚠️ Only sleep scores detected. This is normal for Sahha sample profiles.');
    console.log('   To get more score types, ensure real users are generating diverse data.');
  } else if (hasMixedScores) {
    const coverage = Object.values(scoreTypes).reduce((a, b) => a + b, 0) / (profiles.length * 5);
    console.log(`✅ Multiple score types detected. Coverage: ${(coverage * 100).toFixed(1)}%`);
    
    if (coverage < 0.5) {
      console.log('   Consider generating more comprehensive data for all profiles.');
    }
  }
  
  // Check for test profiles
  const testProfiles = profiles.filter(p => p.externalId && p.externalId.includes('Test'));
  if (testProfiles.length > 0) {
    console.log(`\n🧪 ${testProfiles.length} test profiles found with comprehensive data.`);
  }
}

console.log('\n✨ Analysis complete!\n');