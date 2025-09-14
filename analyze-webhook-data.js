#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🔍 COMPREHENSIVE WEBHOOK DATA ANALYSIS\n');
console.log('=' .repeat(70));

// Read webhook data
const webhookDataPath = path.join(__dirname, 'data', 'sahha-webhook-data.json');
const eventAnalysisPath = path.join(__dirname, 'data', 'webhook-event-analysis.json');

// Analyze main webhook data
if (fs.existsSync(webhookDataPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(webhookDataPath, 'utf-8'));
    
    // Track all unique data points
    const dataPoints = {
      scores: new Set(),
      biomarkers: new Set(),
      factors: new Set(),
      dataLogs: new Set(),
      archetypes: new Set(),
      profileIds: new Set(),
      externalIds: new Set(),
      uniqueFields: new Set()
    };
    
    let profileCount = 0;
    let archetypeProfiles = 0;
    let dataLogProfiles = 0;
    
    // Analyze each profile
    Object.values(data).forEach(profile => {
      if (!profile || typeof profile !== 'object') return;
      
      profileCount++;
      
      // Track external IDs
      if (profile.externalId) {
        dataPoints.externalIds.add(profile.externalId);
      }
      
      // Analyze scores
      if (profile.scores) {
        Object.keys(profile.scores).forEach(scoreType => {
          dataPoints.scores.add(scoreType);
          // Check score properties
          const score = profile.scores[scoreType];
          if (score) {
            Object.keys(score).forEach(key => {
              dataPoints.uniqueFields.add(`score.${key}`);
            });
          }
        });
      }
      
      // Analyze biomarkers
      if (profile.biomarkers) {
        Object.values(profile.biomarkers).forEach(biomarker => {
          if (biomarker.type) {
            dataPoints.biomarkers.add(`${biomarker.category || 'unknown'}.${biomarker.type}`);
          }
          // Check biomarker properties
          Object.keys(biomarker).forEach(key => {
            dataPoints.uniqueFields.add(`biomarker.${key}`);
          });
        });
      }
      
      // Analyze factors
      if (profile.factors) {
        Object.values(profile.factors).forEach(factorList => {
          if (Array.isArray(factorList)) {
            factorList.forEach(factor => {
              if (factor.name) {
                dataPoints.factors.add(factor.name);
              }
            });
          }
        });
      }
      
      // Check for archetypes
      if (profile.archetypes && Object.keys(profile.archetypes).length > 0) {
        archetypeProfiles++;
        Object.keys(profile.archetypes).forEach(archetype => {
          dataPoints.archetypes.add(archetype);
        });
      }
      
      // Check for data logs
      if (profile.dataLogs && Object.keys(profile.dataLogs).length > 0) {
        dataLogProfiles++;
        Object.keys(profile.dataLogs).forEach(log => {
          dataPoints.dataLogs.add(log);
        });
      }
    });
    
    // Display results
    console.log('\n📊 PROFILE STATISTICS:');
    console.log(`Total Profiles: ${profileCount}`);
    console.log(`Profiles with Archetypes: ${archetypeProfiles}`);
    console.log(`Profiles with DataLogs: ${dataLogProfiles}`);
    
    console.log('\n🎯 SCORE TYPES (' + dataPoints.scores.size + '):');
    Array.from(dataPoints.scores).sort().forEach(score => {
      console.log(`  • ${score}`);
    });
    
    console.log('\n🧬 BIOMARKER TYPES (' + dataPoints.biomarkers.size + '):');
    Array.from(dataPoints.biomarkers).sort().forEach(biomarker => {
      console.log(`  • ${biomarker}`);
    });
    
    console.log('\n📈 FACTOR TYPES (' + dataPoints.factors.size + '):');
    Array.from(dataPoints.factors).sort().forEach(factor => {
      console.log(`  • ${factor}`);
    });
    
    if (dataPoints.archetypes.size > 0) {
      console.log('\n🎭 ARCHETYPES (' + dataPoints.archetypes.size + '):');
      Array.from(dataPoints.archetypes).sort().forEach(archetype => {
        console.log(`  • ${archetype}`);
      });
    } else {
      console.log('\n🎭 ARCHETYPES: ❌ NONE FOUND');
    }
    
    if (dataPoints.dataLogs.size > 0) {
      console.log('\n📝 DATA LOG TYPES (' + dataPoints.dataLogs.size + '):');
      Array.from(dataPoints.dataLogs).sort().forEach(log => {
        console.log(`  • ${log}`);
      });
    } else {
      console.log('\n📝 DATA LOG TYPES: Limited data');
    }
    
    console.log('\n🔑 UNIQUE DATA FIELDS AVAILABLE:');
    Array.from(dataPoints.uniqueFields).sort().forEach(field => {
      console.log(`  • ${field}`);
    });
    
    // Check for real user profiles
    const realUserProfiles = Array.from(dataPoints.externalIds).filter(id => 
      !id.startsWith('SampleProfile-') && 
      !id.startsWith('TestProfile-')
    );
    
    if (realUserProfiles.length > 0) {
      console.log('\n👤 REAL USER PROFILES DETECTED: ' + realUserProfiles.length);
      console.log('Examples:', realUserProfiles.slice(0, 3).join(', '));
    }
    
  } catch (error) {
    console.error('Error analyzing webhook data:', error.message);
  }
}

// Analyze event types
if (fs.existsSync(eventAnalysisPath)) {
  try {
    const events = JSON.parse(fs.readFileSync(eventAnalysisPath, 'utf-8'));
    
    const eventTypeCounts = {};
    const biomarkerCategories = new Set();
    const biomarkerTypes = new Set();
    const scoreTypes = new Set();
    
    events.forEach(event => {
      // Count event types
      if (event.eventType) {
        eventTypeCounts[event.eventType] = (eventTypeCounts[event.eventType] || 0) + 1;
      }
      
      // Parse raw payloads for details
      if (event.rawPayloadSample) {
        try {
          // Extract biomarker info
          if (event.eventType === 'BiomarkerCreatedIntegrationEvent') {
            const categoryMatch = event.rawPayloadSample.match(/"category":"([^"]+)"/);
            const typeMatch = event.rawPayloadSample.match(/"type":"([^"]+)"/);
            if (categoryMatch) biomarkerCategories.add(categoryMatch[1]);
            if (typeMatch) biomarkerTypes.add(typeMatch[1]);
          }
          
          // Extract score types
          if (event.eventType === 'ScoreCreatedIntegrationEvent') {
            const typeMatch = event.rawPayloadSample.match(/"type":"([^"]+)"/);
            if (typeMatch) scoreTypes.add(typeMatch[1]);
          }
        } catch (e) {}
      }
    });
    
    console.log('\n\n📡 WEBHOOK EVENT SUMMARY:');
    Object.entries(eventTypeCounts).forEach(([type, count]) => {
      const emoji = type.includes('Score') ? '🎯' : 
                    type.includes('Biomarker') ? '🧬' :
                    type.includes('DataLog') ? '📝' :
                    type.includes('Archetype') ? '🎭' : '📊';
      console.log(`${emoji} ${type}: ${count} events`);
    });
    
    console.log('\n📊 BIOMARKER CATEGORIES:');
    Array.from(biomarkerCategories).forEach(cat => {
      console.log(`  • ${cat}`);
    });
    
    console.log('\n🎯 SCORE TYPES IN EVENTS:');
    Array.from(scoreTypes).forEach(type => {
      console.log(`  • ${type}`);
    });
    
  } catch (error) {
    console.error('Error analyzing events:', error.message);
  }
}

console.log('\n\n💡 RECOMMENDATIONS:');
console.log('=' .repeat(70));
console.log('\n1. ARCHETYPES:');
console.log('   ❌ No ArchetypeCreatedIntegrationEvent detected yet');
console.log('   → Archetypes require behavioral pattern analysis over time');
console.log('   → May need specific user behaviors or longer data collection');
console.log('\n2. AVAILABLE DATA ENRICHMENT OPTIONS:');
console.log('   ✅ Score states (high/medium/low/minimal)');
console.log('   ✅ Score factors with goals and actual values');
console.log('   ✅ Biomarker trends (periodicity: daily/weekly)');
console.log('   ✅ DataLog events for raw sensor data');
console.log('   ✅ Timestamps for trend analysis');
console.log('\n3. MISSING BUT EXPECTED:');
console.log('   • Archetype classifications');
console.log('   • Energy scores (may be coming soon)');
console.log('   • Detailed activity breakdowns');

console.log('\n' + '=' .repeat(70));