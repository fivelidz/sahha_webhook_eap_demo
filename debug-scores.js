// Debug Score Fetching Issues
require('dotenv').config();
const axios = require('axios');

async function debugScoreFetching() {
  console.log('🔍 Debugging Sahha Score Fetching...');
  
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

    // Step 2: Get profiles
    console.log('Step 2: Getting first profile...');
    const profileResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
      {
        headers: {
          'Authorization': `Bearer ${accountToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          pageSize: 1,
          currentPage: 1
        }
      }
    );

    const profiles = profileResponse.data.items || [];
    if (profiles.length === 0) {
      console.log('❌ No profiles found');
      return;
    }

    const testProfile = profiles[0];
    console.log('✅ Test profile:', testProfile.id, testProfile.externalId);

    // Step 3: Test different score type names and auth methods
    const scoreTypes = [
      'wellbeing',
      'activity', 
      'sleep',
      'mental_wellbeing',
      'mental-wellbeing',
      'mentalWellbeing',
      'readiness'
    ];

    const authMethods = [
      { name: 'Bearer Account Token', headers: { 'Authorization': `Bearer ${accountToken}` }},
      { name: 'Account Token', headers: { 'Authorization': `account ${accountToken}` }},
      { name: 'Profile Token Header', headers: { 'Sahha-Profile-Token': testProfile.id }},
      { name: 'Bearer + Profile Token', headers: { 
        'Authorization': `Bearer ${accountToken}`,
        'Sahha-Profile-Token': testProfile.id 
      }}
    ];

    console.log('\n🧪 Testing score endpoint combinations...');
    
    for (const scoreType of scoreTypes) {
      console.log(`\n📊 Testing scoreType: "${scoreType}"`);
      
      for (const auth of authMethods) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/score`,
            {
              headers: {
                ...auth.headers,
                'Content-Type': 'application/json'
              },
              params: {
                profileId: testProfile.id,
                scoreType: scoreType,
                startDate: '2024-08-01',
                endDate: '2025-01-01'
              }
            }
          );

          console.log(`  ✅ ${auth.name}: SUCCESS! Found ${Array.isArray(response.data) ? response.data.length : 'unknown'} scores`);
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log(`  📈 Sample score: ${response.data[0].score} (${response.data[0].scoreDate})`);
            
            // Found working combination, return early
            return {
              success: true,
              scoreType: scoreType,
              authMethod: auth.name,
              sampleScore: response.data[0].score
            };
          }
          
        } catch (error) {
          const status = error.response?.status;
          const statusText = error.response?.statusText;
          console.log(`  ❌ ${auth.name}: ${status} ${statusText}`);
          
          if (status === 400) console.log(`      → Bad Request (check parameters)`);
          if (status === 401) console.log(`      → Unauthorized (wrong auth)`);
          if (status === 403) console.log(`      → Forbidden (no access)`);
          if (status === 404) console.log(`      → Not Found (wrong endpoint/profile)`);
        }
      }
    }

    console.log('\n❌ No working score combination found');
    return { success: false };

  } catch (error) {
    console.error('💥 Debug failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the debug
debugScoreFetching()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DEBUGGING RESULTS:');
    
    if (result.success) {
      console.log(`✅ FOUND WORKING COMBINATION!`);
      console.log(`   Score Type: "${result.scoreType}"`);
      console.log(`   Auth Method: ${result.authMethod}`);
      console.log(`   Sample Score: ${result.sampleScore}`);
      console.log('\n🚀 Ready to fix Profile Management API!');
    } else {
      console.log('❌ No working score fetching method found');
      console.log('🔍 Possible issues:');
      console.log('   1. Score data not available for test profiles');
      console.log('   2. Different endpoint needed');
      console.log('   3. Profile tokens required but not accessible');
      console.log('   4. Different parameter format needed');
    }
    
    console.log('='.repeat(60));
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error.message);
  });