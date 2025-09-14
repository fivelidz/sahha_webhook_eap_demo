#!/usr/bin/env node

/**
 * Test script for Sahha API integration
 * Tests the full flow from credential storage to API call
 */

// Use native fetch (available in Node 18+)

// Real Sahha credentials from .env file
const testCredentials = {
  appId: 'NqrB0AYlviHruQVbF0Cp5Jch2utzQNwe',
  appSecret: 'VsU94PUlVPj7LM9dFAZ4sHPRAYFqgtfmG0WuANKLErtQlbFk8LZNLHIJA1AEnbtC', 
  clientId: 'tFcIJ0UjCnV9tL7eyUKeW6s8nhIAkjkW',
  clientSecret: 'uGJFFzeLuifFEHC2y3dgs6J3O2vui3eiptuxlH5D810DmS8NshymlIJUu14nZ3y8'
};

async function testAPIEndpoint() {
  console.log('🧪 Testing Sahha API integration...\n');
  
  try {
    // Test 1: Call API endpoint with credentials in headers
    console.log('📡 Test 1: Calling /api/sahha/profiles with test credentials...');
    
    const response = await fetch('http://localhost:3000/api/sahha/profiles', {
      method: 'GET',
      headers: {
        'X-App-Id': testCredentials.appId,
        'X-App-Secret': testCredentials.clientSecret,  // Use clientSecret for API auth
        'X-Client-Id': testCredentials.clientId
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success: ${data.success}`);
      console.log(`   📊 Profiles returned: ${data.profiles?.length || 0}`);
      console.log(`   🕐 Timestamp: ${data.timestamp}`);
      
      if (data.error) {
        console.log(`   ⚠️ Error message: ${data.error}`);
      }
      
      // Check response structure
      if (data.profiles && Array.isArray(data.profiles)) {
        console.log('   ✅ Response has correct structure (profiles array)');
        if (data.profiles.length > 0) {
          const firstProfile = data.profiles[0];
          console.log('   📝 Sample profile structure:', {
            hasProfileId: !!firstProfile.profileId || !!firstProfile.id,
            hasExternalId: !!firstProfile.externalId,
            hasScores: !!firstProfile.scores,
            scoreKeys: firstProfile.scores ? Object.keys(firstProfile.scores) : []
          });
        }
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
    // Test 2: Call without credentials (should fail)
    console.log('\n📡 Test 2: Calling without credentials (should fail)...');
    
    const failResponse = await fetch('http://localhost:3000/api/sahha/profiles', {
      method: 'GET'
    });
    
    console.log(`   Status: ${failResponse.status} ${failResponse.statusText}`);
    
    if (failResponse.status === 401) {
      console.log('   ✅ Correctly rejected request without credentials');
    } else {
      console.log('   ⚠️ Unexpected response for missing credentials');
    }
    
    // Test 3: Check if ProfileManagement format is compatible
    console.log('\n📡 Test 3: Checking ProfileManagement compatibility...');
    
    if (response.ok) {
      const data = await response.json();
      
      // Check the format expected by ProfileManagement
      const expectedFields = ['profiles', 'success'];
      const hasExpectedFields = expectedFields.every(field => field in data);
      
      if (hasExpectedFields) {
        console.log('   ✅ Response format compatible with ProfileManagement');
      } else {
        console.log('   ⚠️ Missing expected fields:', expectedFields.filter(f => !(f in data)));
      }
      
      // Check profile transformation
      if (data.profiles && data.profiles.length > 0) {
        const profile = data.profiles[0];
        console.log('   📝 Profile has scores in correct format:', {
          wellbeing: profile.scores?.wellbeing !== undefined,
          activity: profile.scores?.activity !== undefined,
          sleep: profile.scores?.sleep !== undefined,
          mentalHealth: profile.scores?.mentalHealth !== undefined,
          readiness: profile.scores?.readiness !== undefined
        });
      }
    }
    
    console.log('\n✅ API integration tests complete!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('   Make sure the development server is running (npm run dev)');
  }
}

// Run the test
testAPIEndpoint();