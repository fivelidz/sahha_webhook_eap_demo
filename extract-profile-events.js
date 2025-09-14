#!/usr/bin/env node

// Extract ALL webhook events for a single sample profile
// This will show us EVERYTHING Sahha sends

const fs = require('fs');
const path = require('path');

// Pick a sample profile to analyze
const TARGET_PROFILE = 'SampleProfile-5888e0ee-b4a6-41f9-86cc-fa4fa3609a2e';

console.log(`\n🔍 EXTRACTING ALL DATA FOR: ${TARGET_PROFILE}\n`);
console.log('=' .repeat(70));

// Create analysis directory
const analysisDir = path.join(__dirname, 'data', 'profile-analysis', TARGET_PROFILE);
if (!fs.existsSync(analysisDir)) {
  fs.mkdirSync(analysisDir, { recursive: true });
}

// 1. Extract from main webhook data
const webhookData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'sahha-webhook-data.json'), 'utf-8'));
const profileData = webhookData[TARGET_PROFILE];

if (profileData) {
  console.log('\n📁 STORED PROFILE DATA:');
  console.log('-'.repeat(70));
  
  // Save complete profile data
  fs.writeFileSync(
    path.join(analysisDir, '1-stored-profile.json'),
    JSON.stringify(profileData, null, 2)
  );
  
  // Analyze what's stored
  console.log('Profile ID:', profileData.profileId);
  console.log('External ID:', profileData.externalId);
  console.log('\nData Types Present:');
  
  if (profileData.scores) {
    const scoreTypes = Object.keys(profileData.scores);
    console.log(`  • Scores: ${scoreTypes.length} types`);
    scoreTypes.forEach(type => {
      const score = profileData.scores[type];
      console.log(`    - ${type}: ${score.value} (${score.state})`);
    });
  }
  
  if (profileData.biomarkers) {
    const biomarkerTypes = Object.keys(profileData.biomarkers);
    console.log(`  • Biomarkers: ${biomarkerTypes.length} types`);
    
    // Group by category
    const categories = {};
    Object.entries(profileData.biomarkers).forEach(([key, bio]) => {
      if (!categories[bio.category]) categories[bio.category] = [];
      categories[bio.category].push(bio.type);
    });
    
    Object.entries(categories).forEach(([cat, types]) => {
      console.log(`    - ${cat}: ${types.join(', ')}`);
    });
  }
  
  if (profileData.factors) {
    const factorTypes = Object.keys(profileData.factors);
    console.log(`  • Factors: ${factorTypes.length} score types with factors`);
    Object.entries(profileData.factors).forEach(([type, factors]) => {
      console.log(`    - ${type}: ${factors.length} factors`);
    });
  }
  
  if (profileData.dataLogs) {
    const logTypes = Object.keys(profileData.dataLogs);
    console.log(`  • Data Logs: ${logTypes.length} types`);
    logTypes.forEach(type => {
      console.log(`    - ${type}`);
    });
  }
  
  if (profileData.archetypes) {
    const archetypeTypes = Object.keys(profileData.archetypes);
    console.log(`  • Archetypes: ${archetypeTypes.length} types`);
  }
}

// 2. Look for this profile in webhook activity log
console.log('\n📝 WEBHOOK EVENTS FOR THIS PROFILE:');
console.log('-'.repeat(70));

if (fs.existsSync(path.join(__dirname, 'data', 'webhook-activity.log'))) {
  const logContent = fs.readFileSync(path.join(__dirname, 'data', 'webhook-activity.log'), 'utf-8');
  const lines = logContent.split('\n').filter(l => l.includes(TARGET_PROFILE));
  
  console.log(`Found ${lines.length} log entries mentioning this profile`);
  
  if (lines.length > 0) {
    fs.writeFileSync(
      path.join(analysisDir, '2-activity-logs.txt'),
      lines.join('\n')
    );
  }
}

// 3. Check webhook event analysis for this profile
console.log('\n🎯 CAPTURED WEBHOOK EVENTS:');
console.log('-'.repeat(70));

if (fs.existsSync(path.join(__dirname, 'data', 'webhook-event-analysis.json'))) {
  const events = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'webhook-event-analysis.json'), 'utf-8'));
  
  const profileEvents = events.filter(e => 
    e.externalId === TARGET_PROFILE || 
    (e.rawPayloadSample && e.rawPayloadSample.includes(TARGET_PROFILE))
  );
  
  console.log(`Found ${profileEvents.length} webhook events for this profile`);
  
  if (profileEvents.length > 0) {
    fs.writeFileSync(
      path.join(analysisDir, '3-webhook-events.json'),
      JSON.stringify(profileEvents, null, 2)
    );
    
    // Analyze event types
    const eventTypes = {};
    profileEvents.forEach(event => {
      const type = event.eventType || event.headers['X-Event-Type'] || 'unknown';
      eventTypes[type] = (eventTypes[type] || 0) + 1;
    });
    
    console.log('\nEvent Type Breakdown:');
    Object.entries(eventTypes).forEach(([type, count]) => {
      console.log(`  • ${type}: ${count} events`);
    });
  }
}

// 4. Look for patterns in the data
console.log('\n💡 DATA PATTERN ANALYSIS:');
console.log('-'.repeat(70));

if (profileData) {
  // Check if we're missing data that should be there
  const expectedScores = ['sleep', 'activity', 'mental_wellbeing', 'readiness', 'wellbeing'];
  const missingScores = expectedScores.filter(type => 
    !profileData.scores || !profileData.scores[type]
  );
  
  if (missingScores.length > 0) {
    console.log('Missing Score Types:', missingScores.join(', '));
    console.log('\n⚠️ HYPOTHESIS: These scores might be:');
    console.log('  1. Sent as separate webhook events not yet processed');
    console.log('  2. Sent with different field names or structure');
    console.log('  3. Genuinely not available for this profile');
  } else {
    console.log('✅ All 5 score types present!');
  }
  
  // Create a summary
  const summary = {
    externalId: TARGET_PROFILE,
    dataCompleteness: {
      scores: profileData.scores ? Object.keys(profileData.scores).length : 0,
      biomarkers: profileData.biomarkers ? Object.keys(profileData.biomarkers).length : 0,
      factors: profileData.factors ? Object.keys(profileData.factors).length : 0,
      dataLogs: profileData.dataLogs ? Object.keys(profileData.dataLogs).length : 0,
      archetypes: profileData.archetypes ? Object.keys(profileData.archetypes).length : 0
    },
    lastUpdated: profileData.lastUpdated
  };
  
  fs.writeFileSync(
    path.join(analysisDir, '4-summary.json'),
    JSON.stringify(summary, null, 2)
  );
}

console.log('\n' + '='.repeat(70));
console.log(`\n✅ Analysis complete! Check: ${analysisDir}\n`);
console.log('Files created:');
console.log('  1. stored-profile.json - Current stored data');
console.log('  2. activity-logs.txt - Webhook activity logs');
console.log('  3. webhook-events.json - Captured webhook events');
console.log('  4. summary.json - Data completeness summary\n');