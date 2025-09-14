// Test Corrected Score API with Real Parameters  
require('dotenv').config();
const axios = require('axios');

async function testCorrectedScoreAPI() {
  console.log('🧪 Testing Corrected Score API Parameters...');
  
  try {
    // Step 1: Get account token
    const authResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/oauth/account/token`,
      {
        clientId: process.env.SAHHA_CLIENT_ID,
        clientSecret: process.env.SAHHA_CLIENT_SECRET,
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const accountToken = authResponse.data.accountToken;
    console.log('✅ Account token obtained');

    // Step 2: Get first profile
    const profileResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
      {
        headers: {
          'Authorization': `Bearer ${accountToken}`,
          'Content-Type': 'application/json'
        },
        params: { pageSize: 1 }
      }
    );

    const profiles = profileResponse.data.items || [];
    if (profiles.length === 0) {
      console.log('❌ No profiles found');
      return { success: false };
    }

    const testProfile = profiles[0];
    console.log('✅ Test profile:', testProfile.externalId);

    // Step 3: Test corrected score endpoint with account token
    const scoreTypes = ['wellbeing', 'activity', 'sleep', 'mental wellbeing', 'readiness'];
    const results = {};

    for (const scoreType of scoreTypes) {
      console.log(`\n🎯 Testing "${scoreType}" score...`);
      
      try {
        // Use the corrected endpoint format: /api/v1/profile/score/{externalId}
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/score/${testProfile.externalId}`,
          {
            headers: {
              'Authorization': `Bearer ${accountToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              types: [scoreType], // Use types array
              startDateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              endDateTime: new Date().toISOString()
            }
          }
        );

        const scores = response.data;
        if (scores && scores.length > 0) {
          const latestScore = scores[scores.length - 1];
          console.log(`  ✅ SUCCESS! Score: ${latestScore.score}, Date: ${latestScore.scoreDate}`);
          results[scoreType] = latestScore.score;
        } else {
          console.log(`  ⚠️ No score data found`);
          results[scoreType] = null;
        }
        
      } catch (error) {
        console.log(`  ❌ ${error.response?.status} ${error.response?.statusText}`);
        
        if (error.response?.data) {
          console.log(`     Error details:`, error.response.data.title || error.response.data.message);
        }
        
        results[scoreType] = 'ERROR';
      }
    }

    console.log('\n📊 FINAL SCORE RESULTS:');
    console.table(results);

    const successCount = Object.values(results).filter(v => v !== null && v !== 'ERROR').length;
    
    if (successCount > 0) {
      console.log(`\n✅ SUCCESS: ${successCount}/${scoreTypes.length} score types working!`);
      return { success: true, results: results, profile: testProfile.externalId };
    } else {
      console.log('\n❌ No score types returned valid data');
      return { success: false, results: results };
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testCorrectedScoreAPI()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    if (result.success) {
      console.log('🎉 CORRECTED SCORE API WORKING!');
      console.log('Ready to update Profile Management with real scores');
    } else {
      console.log('❌ Score API still not working correctly');
      console.log('Need to investigate further');
    }
    console.log('='.repeat(60));
  });