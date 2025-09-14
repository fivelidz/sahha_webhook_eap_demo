#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🔍 WEBHOOK DATA TYPE ANALYSIS\n');
console.log('=' .repeat(60));

// Read the main webhook data
const webhookDataPath = path.join(__dirname, 'data', 'sahha-webhook-data.json');
const eventAnalysisPath = path.join(__dirname, 'data', 'webhook-event-analysis.json');

if (fs.existsSync(webhookDataPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(webhookDataPath, 'utf-8'));
    
    // Analyze score types
    const scoreTypes = new Set();
    const biomarkerCategories = new Set();
    const biomarkerTypes = new Set();
    let totalProfiles = 0;
    let profilesWithScores = {};
    
    if (data.profiles && Array.isArray(data.profiles)) {
      totalProfiles = data.profiles.length;
      
      data.profiles.forEach(profile => {
        // Check scores
        if (profile.scores) {
          Object.keys(profile.scores).forEach(scoreType => {
            scoreTypes.add(scoreType);
            if (!profilesWithScores[scoreType]) {
              profilesWithScores[scoreType] = 0;
            }
            profilesWithScores[scoreType]++;
          });
        }
        
        // Check biomarkers
        if (profile.biomarkers) {
          Object.values(profile.biomarkers).forEach(biomarker => {
            if (biomarker.category) biomarkerCategories.add(biomarker.category);
            if (biomarker.type) biomarkerTypes.add(biomarker.type);
          });
        }
      });
    }
    
    console.log('\n📊 STORED DATA ANALYSIS:');
    console.log(`Total Profiles: ${totalProfiles}`);
    console.log(`\nScore Types Found: ${scoreTypes.size > 0 ? Array.from(scoreTypes).join(', ') : 'NONE'}`);
    
    if (scoreTypes.size > 0) {
      console.log('\nProfiles per Score Type:');
      Object.entries(profilesWithScores).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} profiles (${(count/totalProfiles*100).toFixed(1)}%)`);
      });
    }
    
    console.log(`\nBiomarker Categories: ${biomarkerCategories.size > 0 ? Array.from(biomarkerCategories).join(', ') : 'NONE'}`);
    console.log(`Biomarker Types: ${biomarkerTypes.size}`);
    if (biomarkerTypes.size > 0 && biomarkerTypes.size <= 10) {
      console.log('  Types:', Array.from(biomarkerTypes).join(', '));
    }
    
  } catch (error) {
    console.error('Error reading webhook data:', error.message);
  }
}

// Initialize variables for conclusion
let scoreEventTypes = {};

// Analyze event types from the event analysis file
if (fs.existsSync(eventAnalysisPath)) {
  try {
    const events = JSON.parse(fs.readFileSync(eventAnalysisPath, 'utf-8'));
    
    const eventTypes = {};
    const biomarkerCategories = {};
    
    events.forEach(event => {
      // Count event types
      if (event.eventType) {
        eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
      }
      
      // Parse raw payload for score types
      if (event.eventType === 'ScoreCreatedIntegrationEvent' && event.rawPayloadSample) {
        try {
          // Extract just the type field
          const typeMatch = event.rawPayloadSample.match(/"type":"([^"]+)"/);
          if (typeMatch) {
            const type = typeMatch[1];
            scoreEventTypes[type] = (scoreEventTypes[type] || 0) + 1;
          }
        } catch (e) {}
      }
      
      // Parse biomarker categories
      if (event.eventType === 'BiomarkerCreatedIntegrationEvent' && event.rawPayloadSample) {
        try {
          const categoryMatch = event.rawPayloadSample.match(/"category":"([^"]+)"/);
          if (categoryMatch) {
            const category = categoryMatch[1];
            biomarkerCategories[category] = (biomarkerCategories[category] || 0) + 1;
          }
        } catch (e) {}
      }
    });
    
    console.log('\n\n📡 WEBHOOK EVENT ANALYSIS:');
    console.log('Event Types Received:');
    Object.entries(eventTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} events`);
    });
    
    console.log('\nScore Event Types:');
    if (Object.keys(scoreEventTypes).length > 0) {
      Object.entries(scoreEventTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} events`);
      });
    } else {
      console.log('  NONE FOUND');
    }
    
    console.log('\nBiomarker Categories:');
    if (Object.keys(biomarkerCategories).length > 0) {
      Object.entries(biomarkerCategories).forEach(([category, count]) => {
        console.log(`  - ${category}: ${count} events`);
      });
    } else {
      console.log('  NONE FOUND');
    }
    
  } catch (error) {
    console.error('Error reading event analysis:', error.message);
  }
}

// Check for DataLog and Archetype events
console.log('\n\n🔎 SEARCHING FOR OTHER EVENT TYPES:');

const dataDir = path.join(__dirname, 'data');
let hasDataLogs = false;
let hasArchetypes = false;

// Search all JSON files for these event types
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    if (content.includes('DataLogReceivedIntegrationEvent')) {
      hasDataLogs = true;
    }
    if (content.includes('ArchetypeCreatedIntegrationEvent')) {
      hasArchetypes = true;
    }
  } catch (e) {}
});

console.log(`DataLogReceivedIntegrationEvent: ${hasDataLogs ? '✅ FOUND' : '❌ NOT FOUND'}`);
console.log(`ArchetypeCreatedIntegrationEvent: ${hasArchetypes ? '✅ FOUND' : '❌ NOT FOUND'}`);

console.log('\n\n💡 CONCLUSION:');
console.log('=' .repeat(60));

// Check score event types from the analysis
const uniqueScoreTypes = Object.keys(scoreEventTypes);
if (uniqueScoreTypes.length === 1 && uniqueScoreTypes[0] === 'sleep') {
  console.log('⚠️  ONLY SLEEP SCORES ARE BEING RECEIVED FROM SAHHA');
  console.log('\nThis confirms:');
  console.log('✓ Sahha IS sending webhook events successfully');
  console.log('✓ Authentication and processing are working');
  console.log('✗ But ONLY sleep-related data is being sent');
  console.log('\nExpected but missing:');
  console.log('  - activity scores');
  console.log('  - mental_wellbeing scores');
  console.log('  - readiness scores');
  console.log('  - energy scores');
  console.log('\nPossible reasons:');
  console.log('1. Sample profiles only generate sleep data initially');
  console.log('2. Other scores require device sensors or app usage data');
  console.log('3. Mental/Activity scores need 24-48 hours of data');
} else if (uniqueScoreTypes.length > 1) {
  console.log('✅ MULTIPLE SCORE TYPES DETECTED:', uniqueScoreTypes.join(', '));
} else {
  console.log('❌ NO SCORE EVENTS DETECTED');
}

console.log('\n' + '=' .repeat(60));