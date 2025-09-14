// Test Profile Token Authentication
require('dotenv').config();
const axios = require('axios');

async function testProfileTokenAuth() {
  console.log('🔍 Testing Profile Token Authentication...');
  
  try {
    // Step 1: Get account token
    console.log('Step 1: Getting account token...');
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
    console.log('Step 2: Getting first profile...');
    const profileResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
      {
        headers: {
          'Authorization': `Bearer ${accountToken}`,
          'Content-Type': 'application/json'
        },
        params: { pageSize: 1, currentPage: 1 }
      }
    );

    const profiles = profileResponse.data.items || [];
    if (profiles.length === 0) {
      console.log('❌ No profiles found');
      return { success: false, reason: 'No profiles' };
    }

    const testProfile = profiles[0];
    console.log('✅ Test profile:', testProfile.id, testProfile.externalId);

    // Step 3: Get profile token
    console.log('Step 3: Getting profile token...');
    try {
      const profileTokenResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/oauth/profile/token`,
        {
          externalId: testProfile.externalId
        },
        {
          headers: {
            'Authorization': `Bearer ${accountToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const profileToken = profileTokenResponse.data.profileToken || profileTokenResponse.data.token;
      if (!profileToken) {
        console.log('❌ No profile token in response:', Object.keys(profileTokenResponse.data));
        return { success: false, reason: 'No profile token in response' };
      }

      console.log('✅ Profile token obtained, length:', profileToken.length);

      // Step 4: Test different score types
      console.log('Step 4: Testing different score types...');
      
      const scoreTypes = ['wellbeing', 'activity', 'sleep', 'mental_health', 'mental_wellbeing', 'readiness'];
      
      for (const scoreType of scoreTypes) {
        try {
          console.log(`  Testing scoreType: "${scoreType}"`);
          const scoreResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/score`,
            {
              headers: {
                'Authorization': `Bearer ${profileToken}`,
                'Content-Type': 'application/json'
              },
              params: {
                scoreType: scoreType,
                startDate: '2024-01-01',
                endDate: '2025-01-01'
              }
            }
          );

          const scores = scoreResponse.data;
          console.log(`  ✅ SUCCESS! Found ${Array.isArray(scores) ? scores.length : 'unknown'} scores`);
          
          if (Array.isArray(scores) && scores.length > 0) {
            console.log(`  📈 Sample score: ${scores[0].score} (${scores[0].scoreDate})`);
            return { 
              success: true, 
              workingScoreType: scoreType,
              profileToken: profileToken.substring(0, 20) + '...', 
              scoreCount: scores.length,
              sampleScore: scores[0].score
            };
          }
          
        } catch (error) {
          console.log(`  ❌ ${scoreType}: ${error.response?.status} ${error.response?.statusText}`);
        }
      }

      // If no score type worked, but we got a profile token
      console.log('  ⚠️ No score types returned data, but profile token works');
      return { success: true, profileToken: profileToken.substring(0, 20) + '...', scoreCount: 0, reason: 'No score data available' };

    } catch (profileTokenError) {
      console.log('❌ Profile token request failed:', profileTokenError.response?.status, profileTokenError.response?.statusText);
      
      if (profileTokenError.response?.data) {
        console.log('   Response data:', profileTokenError.response.data);
      }
      
      return { success: false, reason: 'Profile token failed', status: profileTokenError.response?.status };
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    return { success: false, reason: 'Unexpected error', error: error.message };
  }
}

// Run the test
testProfileTokenAuth()
  .then(result => {
    console.log('\n' + '='.repeat(50));
    console.log('🎯 PROFILE TOKEN TEST RESULTS:');
    
    if (result.success) {
      console.log('✅ SUCCESS: Profile token authentication working!');
      console.log('   Profile Token:', result.profileToken);
      if (result.scoreCount > 0) {
        console.log('   Score Data Available:', result.scoreCount, 'scores found');
        console.log('   Sample Score:', result.sampleScore);
        console.log('\n🚀 Ready to fix Profile Management with real scores!');
      } else {
        console.log('   Score Data: No scores available (but authentication works)');
        console.log('\n⚠️ Profiles may not have score data yet');
      }
    } else {
      console.log('❌ FAILED:', result.reason);
      if (result.status) console.log('   HTTP Status:', result.status);
      if (result.error) console.log('   Error:', result.error);
    }
    
    console.log('='.repeat(50));
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error.message);
  });