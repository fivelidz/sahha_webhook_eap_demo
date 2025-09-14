// Test Simple Score API Call
require('dotenv').config();
const axios = require('axios');

async function testSimpleScoreAPI() {
  console.log('🔍 Testing Simple Score API Call...');
  
  try {
    // Get account token
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
    
    // Get test profile
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

    const testProfile = profileResponse.data.items[0];
    console.log('Test Profile:', testProfile.externalId);

    // Test different endpoint formats and parameter combinations
    const testCases = [
      {
        name: 'Simple GET without params',
        url: `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/score/${testProfile.externalId}`,
        params: {}
      },
      {
        name: 'With basic date range',
        url: `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/score/${testProfile.externalId}`,
        params: {
          startDateTime: '2024-01-01T00:00:00Z',
          endDateTime: '2025-01-01T00:00:00Z'
        }
      },
      {
        name: 'With single type string',
        url: `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/score/${testProfile.externalId}`,
        params: {
          types: 'wellbeing'
        }
      },
      {
        name: 'Original profile/score endpoint',
        url: `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/score`,
        params: {
          externalId: testProfile.externalId
        }
      },
      {
        name: 'Original with profile token',
        url: `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/score`,
        params: {},
        useProfileToken: true
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 ${testCase.name}...`);
      
      try {
        let headers = {
          'Authorization': `Bearer ${accountToken}`,
          'Content-Type': 'application/json'
        };

        // If test case requires profile token, get it
        if (testCase.useProfileToken) {
          try {
            const tokenResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/oauth/profile/token`,
              { externalId: testProfile.externalId },
              { headers }
            );
            const profileToken = tokenResponse.data.profileToken || tokenResponse.data.token;
            headers['Authorization'] = `Bearer ${profileToken}`;
          } catch (tokenError) {
            console.log('  ❌ Profile token failed, skipping');
            continue;
          }
        }

        const response = await axios.get(testCase.url, {
          headers: headers,
          params: testCase.params
        });

        console.log('  ✅ SUCCESS!');
        console.log('     Response type:', typeof response.data);
        console.log('     Response length:', Array.isArray(response.data) ? response.data.length : 'not array');
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log('     Sample score:', response.data[0].score);
          console.log('     Sample date:', response.data[0].scoreDate);
        }
        
        // Found working method!
        return {
          success: true,
          method: testCase.name,
          url: testCase.url,
          params: testCase.params,
          sampleData: response.data
        };
        
      } catch (error) {
        console.log(`  ❌ ${error.response?.status} ${error.response?.statusText}`);
        if (error.response?.data?.title) {
          console.log(`     ${error.response.data.title}`);
        }
      }
    }

    return { success: false, message: 'No working score endpoint found' };

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

testSimpleScoreAPI().then(result => {
  console.log('\n' + '='.repeat(50));
  if (result.success) {
    console.log('🎉 FOUND WORKING SCORE API!');
    console.log('Method:', result.method);
    console.log('URL:', result.url);
    console.log('Params:', result.params);
  } else {
    console.log('❌ No working score method found');
  }
  console.log('='.repeat(50));
});