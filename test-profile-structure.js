// Test Profile Structure from Sahha API
require('dotenv').config();
const axios = require('axios');

async function testProfileStructure() {
  console.log('🔍 Testing Profile Structure from Sahha API...');
  
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
    console.log('✅ Account token obtained');

    // Get profiles
    const profileResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
      {
        headers: {
          'Authorization': `Bearer ${accountToken}`,
          'Content-Type': 'application/json'
        },
        params: { pageSize: 3 } // Get 3 profiles to check
      }
    );

    const profiles = profileResponse.data.items || [];
    console.log(`\n📊 Found ${profiles.length} profiles`);
    
    if (profiles.length > 0) {
      console.log('\n🔍 PROFILE STRUCTURE ANALYSIS:');
      console.log('============================================');
      
      profiles.forEach((profile, index) => {
        console.log(`\nProfile ${index + 1}:`);
        console.log('Fields available:', Object.keys(profile));
        console.log('Full profile object:');
        console.log(JSON.stringify(profile, null, 2));
        console.log('---');
        
        // Check specifically for ID fields
        console.log('ID fields:');
        console.log('  profile.id:', profile.id || 'UNDEFINED');
        console.log('  profile.profileId:', profile.profileId || 'UNDEFINED');  
        console.log('  profile.externalId:', profile.externalId || 'UNDEFINED');
        console.log('  profile.userId:', profile.userId || 'UNDEFINED');
        console.log('============================================');
      });
      
      return { success: true, profiles: profiles };
    } else {
      console.log('❌ No profiles found');
      return { success: false };
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
    return { success: false, error: error.message };
  }
}

testProfileStructure()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    if (result.success) {
      console.log('✅ PROFILE STRUCTURE TEST COMPLETE');
    } else {
      console.log('❌ Profile structure test failed');
    }
    console.log('='.repeat(60));
  });